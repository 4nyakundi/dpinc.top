import fs from "node:fs";
import { execFileSync } from "node:child_process";
import { PrismaClient } from "@prisma/client";
import { databaseService, money, transaction, text, email } from "../lib/database.ts";

const args = process.argv.slice(2);
const option = name => args.includes(name) ? args[args.indexOf(name) + 1] : undefined;
const source = option("--sqlite") ?? "prisma/prisma/dev.db";
const legacy = JSON.parse(execFileSync(process.env.PYTHON ?? "python", ["scripts/export-legacy.py", source], { encoding: "utf8", maxBuffer: 50_000_000 }));
const erpPath = option("--erp");
const erp = erpPath ? JSON.parse(fs.readFileSync(erpPath, "utf8")) : null;
const contactsPath = option("--contacts");
const contacts = contactsPath ? JSON.parse(fs.readFileSync(contactsPath, "utf8")) : [];
if (!Array.isArray(contacts)) throw new Error("Contact export must be an array of {id,name,email,message,createdAt}");
console.log(JSON.stringify({ quotes: legacy.Quote.length, items: legacy.LineItem.length, admins: legacy.Admin.length, erp: Boolean(erp), contacts: contacts.length }));
if (!args.includes("--apply")) {
  console.log("Read-only preflight completed. Use --apply with a MySQL/MariaDB DATABASE_URL to import.");
  process.exit(0);
}
if (!/^mysql:\/\//.test(process.env.DATABASE_URL ?? "")) throw new Error("Set DATABASE_URL to the MySQL/MariaDB target; the SQLite source remains read-only");
const db = new PrismaClient();
const service = databaseService(db);
const asDate = value => value == null ? undefined : new Date(typeof value === "number" ? value : /^\d+$/.test(value) ? Number(value) : value);
try {
  // The old quotes/items/admins are imported together, retaining original IDs and dates.
  await transaction(db, async tx => {
    for (const row of legacy.Quote) {
      const items = legacy.LineItem.filter(item => item.quoteId === row.id);
      const subtotalMinor = money(row.subtotal), labourFeeMinor = money(row.labourFee), taxMinor = money(row.tax), totalMinor = money(row.total);
      if (subtotalMinor + labourFeeMinor + taxMinor !== totalMinor || items.reduce((sum, item) => sum + money(item.total), 0) !== subtotalMinor) throw new Error("Legacy financial totals need reconciliation for quote " + row.id);
      if (items.some(item => money(item.unitPrice) * item.quantity !== money(item.total) || !Number.isInteger(item.quantity) || item.quantity < 1)) throw new Error("Legacy line items need reconciliation");
      const existing = await tx.quote.findUnique({ where: { id: row.id } });
      if (existing) {
        const currentItems = await tx.quoteLineItem.findMany({ where: { quoteId: row.id } });
        if (existing.invoiceNo !== row.invoiceNo || existing.totalMinor !== totalMinor || currentItems.length !== items.length) throw new Error("Existing quote conflicts with legacy data: " + row.id);
        continue;
      }
      const address = row.email?.trim().toLowerCase() || null;
      const lead = address ? await tx.lead.upsert({ where: { email: address }, update: {}, create: { name: row.billedTo, email: address, phone: row.phone, location: row.location, source: "legacy_sqlite" } })
        : await tx.lead.create({ data: { id: "legacy-lead-" + row.id, name: row.billedTo, phone: row.phone, location: row.location, source: "legacy_sqlite" } });
      await tx.quote.create({ data: {
        id: row.id, leadId: lead.id, invoiceNo: row.invoiceNo, billedTo: row.billedTo,
        phone: row.phone, email: address, location: row.location,
        subtotalMinor, labourFeeMinor, taxMinor, totalMinor, status: row.status,
        pdfUrl: row.pdfUrl, createdAt: asDate(row.createdAt), issueDate: asDate(row.createdAt), updatedAt: asDate(row.updatedAt),
        lineItems: { create: items.map(item => ({ id: item.id, name: item.service, quantity: item.quantity, unitPriceMinor: money(item.unitPrice), totalMinor: money(item.total) })) },
      } });
      await tx.auditLog.create({ data: { actorId: "legacy-import", action: "quote.imported", entityId: row.id, details: "{}" } });
    }
    for (const row of legacy.Admin) {
      if (!/^\$2[aby]\$/.test(row.password)) throw new Error("Legacy admin must have a bcrypt password hash");
      await tx.admin.upsert({ where: { username: row.username.toLowerCase() }, update: {}, create: { id: row.id, username: row.username.toLowerCase(), password: row.password } });
    }
  });
  if (erp) {
    const current = await service.erpRead();
    // Never overwrite an already imported operational snapshot on a repeated import.
    if (current) throw new Error("ERP target is already populated. Import into a clean staging database or merge the backup through the dashboard.");
    await service.erpWrite({ revision: 0, data: erp }, "legacy-import");
  }
  for (const contact of contacts) {
    const id = "firestore-" + String(contact.id);
    if (!contact.id) throw new Error("Each contact requires a stable Firestore document ID");
    if (await db.contactSubmission.findUnique({ where: { id } })) continue;
    const name = text(contact.name, "Name", 120), address = email(contact.email), message = text(contact.message, "Message", 5000);
    if (!address || name.length < 2 || message.length < 10) throw new Error("Invalid contact export");
    await transaction(db, async tx => {
      const lead = await tx.lead.upsert({ where: { email: address }, update: {}, create: { name, email: address, source: "website" } });
      await tx.contactSubmission.create({ data: { id, name, email: address, message, leadId: lead.id, source: "website", createdAt: asDate(contact.createdAt) } });
    });
  }
  console.log("Import complete. Source files were not changed. Compare record counts and monetary totals before cutover.");
} finally { await db.$disconnect(); }
