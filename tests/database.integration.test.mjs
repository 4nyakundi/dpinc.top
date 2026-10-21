import { test, before, beforeEach, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";
import { databaseService } from "../lib/database.ts";
const require = createRequire(import.meta.url);
const mysql = Boolean(process.env.TEST_DATABASE_URL);
const namespace = "db_test_" + crypto.randomUUID().replaceAll("-", "");
let db, service;
before(async () => {
  if (mysql) {
    const url = new URL(process.env.TEST_DATABASE_URL);
    if (url.protocol !== "mysql:") throw new Error("TEST_DATABASE_URL must be MySQL/MariaDB");
    const { PrismaClient } = require("@prisma/client");
    db = new PrismaClient({ datasources: { db: { url: url.toString() } } });
    await db.$executeRawUnsafe("CREATE DATABASE \x60" + namespace + "\x60 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    await db.$disconnect();
    url.pathname = "/" + namespace;
    db = new PrismaClient({ datasources: { db: { url: url.toString() } } });
    const result = spawnSync(process.execPath, ["node_modules/prisma/build/index.js", "migrate", "deploy"], { env: { ...process.env, DATABASE_URL: url.toString(), DIRECT_DATABASE_URL: url.toString() }, encoding: "utf8" });
    if (result.status !== 0) throw new Error("Test schema migration failed: " + result.stdout + result.stderr);
  } else {
    const { PrismaClient } = require("../.database-backups/test-client");
    const filename = path.resolve(".database-backups", namespace + ".db").replaceAll("\\", "/");
    db = new PrismaClient({ datasources: { db: { url: "file:" + filename } } });
    const sql = fs.readFileSync(".database-backups/test-schema.sql", "utf8");
    for (const statement of sql.split(";").filter(part => part.trim())) await db.$executeRawUnsafe(statement);
  }
  service = databaseService(db);
});
beforeEach(async () => {
  await db.$transaction([
    db.ledgerEntry.deleteMany(), db.jobCard.deleteMany(), db.payment.deleteMany(), db.invoice.deleteMany(),
    db.quoteLineItem.deleteMany(), db.quote.deleteMany(), db.subscription.deleteMany(), db.contactSubmission.deleteMany(),
    db.lead.deleteMany(), db.catalogItem.deleteMany(), db.erpState.deleteMany(), db.auditLog.deleteMany(), db.documentSequence.deleteMany(),
  ]);
});
after(async () => {
  if (mysql && db) await db.$executeRawUnsafe("DROP DATABASE \x60" + namespace + "\x60");
  await db?.$disconnect();
});
const quote = (extra = {}) => ({ lead: { name: "Test Customer", email: "CLIENT@EXAMPLE.COM", location: "Original address" }, lineItems: [{ service: "Installation", quantity: 3, unitPrice: 0.10 }], ...extra });
const subscriber = (extra = {}) => ({ name: "Subscriber", email: "subscriber@example.com", packageName: "Monthly Fiber", packagePrice: "2500.50", billingDay: 31, ...extra });

test("quote contract, decimal totals, address and customer deduplication", async () => {
  const first = await service.createQuote(quote({ tax: "0.20" }), "tester");
  assert.equal(first.quote.totalMinor, 50);
  assert.equal(first.quote.lineItems[0].name, "Installation");
  assert.equal(first.quote.location, "Original address");
  await service.createQuote(quote(), "tester");
  assert.equal(await db.lead.count(), 1);
  assert.equal(await db.quote.count(), 2);
  assert.equal(new Set((await db.quote.findMany()).map(q => q.invoiceNo)).size, 2);
  await service.createLead({ name: "Without email" }, "tester");
  await service.createLead({ name: "Also without email", email: "" }, "tester");
  assert.equal(await db.lead.count({ where: { email: null } }), 2);
});
test("failed quote operations roll back their newly-created customer", async () => {
  await assert.rejects(service.createQuote(quote({ lineItems: [{ name: "Missing catalog", catalogItemId: "missing", quantity: 1, unitPrice: 50 }] }), "tester"));
  assert.equal(await db.lead.count(), 0);
  assert.equal(await db.quote.count(), 0);
  await assert.rejects(service.createQuote(quote({ lineItems: [{ name: "Invalid", quantity: -1, unitPrice: 50 }] }), "tester"));
  assert.equal(await db.lead.count(), 0);
});
test("invoice conversion is idempotent and freezes issued customer details", async () => {
  const { quote: saved } = await service.createQuote(quote(), "tester");
  const invoice = await service.createInvoice({ quoteId: saved.id }, "tester");
  const again = await service.createInvoice({ quoteId: saved.id }, "tester");
  assert.equal(invoice.id, again.id);
  await db.lead.update({ where: { id: saved.leadId }, data: { name: "Changed name", location: "Changed address" } });
  assert.equal(JSON.parse(invoice.snapshot).billedTo, "Test Customer");
  assert.equal(JSON.parse(invoice.snapshot).location, "Original address");
  await assert.rejects(service.archiveQuote(saved.id, "tester"), /linked/);
});
test("subscriptions generate one bill per period with matching due dates", async () => {
  await service.createSubscriber(subscriber(), "tester");
  await service.createSubscriber(subscriber({ email: "second@example.com" }), "tester");
  await assert.rejects(service.createSubscriber(subscriber(), "tester"), /already/);
  const now = new Date("2027-02-02T10:00:00Z");
  assert.equal((await service.generateMonthly("tester", now)).generatedCount, 2);
  assert.equal((await service.generateMonthly("tester", now)).generatedCount, 0);
  const invoices = await db.invoice.findMany();
  assert.equal(new Set(invoices.map(item => item.invoiceNo)).size, 2);
  assert.ok(invoices.every(item => item.dueAt.toISOString().slice(0,10) === "2027-02-28"));
  assert.equal(await db.quote.count({ where: { billingPeriod: "2027-02" } }), 2);
});
test("concurrent MySQL/MariaDB billing retries cannot create duplicate periods", { skip: !mysql }, async () => {
  await service.createSubscriber(subscriber(), "tester");
  const now = new Date("2027-03-01T10:00:00Z");
  const results = await Promise.all([service.generateMonthly("one", now), service.generateMonthly("two", now)]);
  assert.equal(results.reduce((sum, r) => sum + r.generatedCount, 0), 1);
  assert.equal(await db.invoice.count(), 1);
});
test("payments are idempotent, cannot overpay, and retain reversal history", async () => {
  const { quote: saved } = await service.createQuote(quote({ lineItems: [{ name: "Service", quantity: 1, unitPrice: 100 }] }), "tester");
  const invoice = await service.createInvoice({ quoteId: saved.id }, "tester");
  const payment = await service.addPayment(invoice.id, { amount: 40, reference: "RECEIPT-1", method: "bank" }, "tester");
  assert.equal((await service.addPayment(invoice.id, { amount: 40, reference: "RECEIPT-1", method: "bank" }, "tester")).id, payment.id);
  assert.equal((await db.invoice.findUnique({ where: { id: invoice.id } })).status, "partial");
  await assert.rejects(service.addPayment(invoice.id, { amount: 61, reference: "OVERPAY", method: "bank" }, "tester"), /exceeds/);
  await assert.rejects(service.archiveInvoice(invoice.id, "tester"), /Void/);
  await service.reversePayment(invoice.id, payment.id, { reason: "Incorrect bank allocation" }, "tester");
  assert.ok((await db.payment.findUnique({ where: { id: payment.id } })).voidedAt);
  assert.equal(await db.ledgerEntry.count({ where: { archivedAt: null } }), 0);
  await service.invoiceStatus(invoice.id, { status: "void" }, "tester");
  await service.archiveInvoice(invoice.id, "tester");
  assert.equal((await service.invoices()).length, 0);
  assert.equal(await db.invoice.count(), 1);
  assert.ok(await db.auditLog.count({ where: { action: "payment.reversed" } }));
});
test("manual paid/unpaid actions write and reverse real payment records", async () => {
  const { quote: saved } = await service.createQuote(quote(), "tester");
  const invoice = await service.createInvoice({ quoteId: saved.id }, "tester");
  await service.invoiceStatus(invoice.id, { status: "paid" }, "tester");
  await service.invoiceStatus(invoice.id, { status: "paid" }, "tester");
  assert.equal(await db.payment.count(), 1);
  await service.invoiceStatus(invoice.id, { status: "unpaid" }, "tester");
  assert.equal(await db.payment.count({ where: { voidedAt: { not: null } } }), 1);
});
const erpData = () => ({
  version: "3.0.0", subscribers: [{ id: "sub-1", name: "ERP Client", email: "erp@example.com", package: "Fiber", monthlyRate: 120, billingDay: 5, status: "active" }],
  invoices: [{ id: "inv-1", invoiceNo: "PROF-2027-00001", subId: "sub-1", clientName: "ERP Client", amount: 120, period: "January 2027", status: "paid" }],
  jobCards: [{ id: "job-1", title: "Installation", clientName: "ERP Client", status: "completed", totalCost: 120 }],
  ledger: [{ id: "ledger-1", type: "income", amount: 120, description: "Imported settlement", reference: "LEGACY-1", date: "2027-01-05" }],
  rules: [], vault: { treasuryBalance: 120 },
});
test("ERP imports share relational records and stale revisions cannot overwrite changes", async () => {
  const stored = await service.erpWrite({ revision: 0, data: erpData() }, "tester");
  assert.equal(stored.revision, 1);
  assert.equal(await db.subscription.count(), 1);
  assert.equal(await db.invoice.count(), 1);
  assert.equal(await db.payment.count(), 1);
  assert.equal(await db.jobCard.count(), 1);
  assert.equal(await db.ledgerEntry.count(), 1);
  assert.equal((await service.subscribers())[0].name, "ERP Client");
  const read = await service.erpRead(), exported = JSON.parse(read.payload);
  assert.equal(exported.invoices[0].totalPaid, 120);
  assert.equal(exported.jobCards[0].title, "Installation");
  assert.equal((await service.generateMonthly("tester", new Date("2027-01-01T10:00:00Z"))).generatedCount, 0);
  await assert.rejects(service.erpWrite({ revision: 0, data: erpData() }, "stale"), /changed/);
  await service.createSubscriber(subscriber(), "tester");
  await assert.rejects(service.erpWrite({ revision: read.revision, data: exported }, "stale"), /changed/);
  assert.equal(await db.subscription.count({ where: { status: "active" } }), 2);
});
test("ERP financial overwrite fails atomically", async () => {
  await service.erpWrite({ revision: 0, data: erpData() }, "tester");
  const data = erpData();
  data.subscribers[0].monthlyRate = 999;
  data.invoices[0].amount = 999;
  await assert.rejects(service.erpWrite({ revision: 1, data }, "tester"), /cannot be overwritten/);
  assert.equal((await db.subscription.findUnique({ where: { id: "sub-1" } })).priceMinor, 12000);
  assert.equal((await db.erpState.findUnique({ where: { id: "main" } })).revision, 1);
});
test("contact submissions enter the CRM without downgrading subscribers", async () => {
  const result = await service.createSubscriber(subscriber(), "tester");
  await service.contact({ name: "Existing customer", email: "SUBSCRIBER@example.com", message: "Please check our connection." });
  assert.equal(await db.lead.count(), 1);
  assert.equal((await db.lead.findUnique({ where: { id: result.lead.id } })).status, "subscriber");
  assert.equal(await db.contactSubmission.count(), 1);
  await assert.rejects(db.lead.delete({ where: { id: result.lead.id } }));
});
test("MySQL/MariaDB constraints reject invalid direct financial writes", { skip: !mysql }, async () => {
  await assert.rejects(db.catalogItem.create({ data: { name: "Negative", priceMinor: -1 } }));
  await assert.rejects(db.subscription.create({ data: { lead: { create: { name: "Invalid day" } }, packageName: "Plan", priceMinor: 100, billingDay: 32, metadata: "{}" } }));
});
