import { Prisma, PrismaClient } from "@prisma/client";

type Tx = Prisma.TransactionClient;
type JsonObject = Record<string, unknown>;
export class DatabaseError extends Error {
  status: number;
  constructor(message: string, status = 400) { super(message); this.status = status; }
}
export function object(value: unknown): JsonObject {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new DatabaseError("A JSON object is required");
  return value as JsonObject;
}
export function text(value: unknown, name: string, max = 200, required = true): string {
  if (value === undefined || value === null || value === "") {
    if (required) throw new DatabaseError(name + " is required");
    return "";
  }
  if (typeof value !== "string") throw new DatabaseError(name + " must be text");
  const result = value.trim();
  if ((required && !result) || result.length > max) throw new DatabaseError(name + " has an invalid length");
  return result;
}
export function email(value: unknown): string | null {
  const result = text(value, "Email", 254, false).toLowerCase();
  if (result && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result)) throw new DatabaseError("Invalid email address");
  return result || null;
}
export function money(value: unknown, name = "Amount"): number {
  if (typeof value !== "number" && typeof value !== "string") throw new DatabaseError(name + " must be a number");
  const str = String(value).trim();
  if (!/^\d+(\.\d{1,2})?$/.test(str)) throw new DatabaseError(name + " must be non-negative with at most two decimal places");
  const [whole, fraction = ""] = str.split(".");
  const minor = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  if (!Number.isSafeInteger(minor) || minor > 2_000_000_000) throw new DatabaseError(name + " exceeds the supported limit");
  return minor;
}
function checkedTotal(value: number): number {
  if (!Number.isSafeInteger(value) || value < 0 || value > 2_000_000_000) throw new DatabaseError("Document total exceeds the supported limit");
  return value;
}
export function date(value: unknown): Date | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}(T.*)?$/.test(value)) throw new DatabaseError("Invalid date");
  const result = new Date(value);
  if (!Number.isFinite(result.getTime()) || result.toISOString().slice(0, 10) !== value.slice(0, 10)) throw new DatabaseError("Invalid date");
  return result;
}
function choice(value: unknown, allowed: readonly string[], fallback?: string): string {
  const result = value === undefined ? fallback : value;
  if (typeof result !== "string" || !allowed.includes(result)) throw new DatabaseError("Invalid status or recurrence");
  return result;
}
function flag(value: unknown, fallback = false): boolean {
  if (value === undefined) return fallback;
  if (typeof value !== "boolean") throw new DatabaseError("Expected a boolean");
  return value;
}
export function apiRecord(value: unknown): unknown {
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(apiRecord);
  if (value && typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value)) {
      if (key === "snapshot") { result.billingSnapshot = JSON.parse(String(item)); continue; }
      result[key.endsWith("Minor") ? key.slice(0, -5) : key] = key.endsWith("Minor") ? Number(item) / 100 : apiRecord(item);
    }
    return result;
  }
  return value;
}
export async function transaction<T>(db: PrismaClient, work: (tx: Tx) => Promise<T>): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try { return await db.$transaction(work, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, maxWait: 10000, timeout: 30000 }); }
    catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && ["P2034", "P2002"].includes(error.code) && attempt < 4) {
        await new Promise(resolve => setTimeout(resolve, 25 * (attempt + 1)));
        continue;
      }
      throw error;
    }
  }
}
export function billingPeriod(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Nairobi", year: "numeric", month: "2-digit" }).formatToParts(now);
  return parts.find(p => p.type === "year")!.value + "-" + parts.find(p => p.type === "month")!.value;
}
export function billingDue(period: string, day: number): Date {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(period) || !Number.isInteger(day) || day < 1 || day > 31) throw new DatabaseError("Invalid billing period or day");
  const [year, month] = period.split("-").map(Number);
  const last = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return new Date(Date.UTC(year, month - 1, Math.min(day, last), 9)); // noon EAT
}
async function audit(tx: Tx, actorId: string, action: string, entityId: string, details: unknown = {}) {
  await tx.auditLog.create({ data: { actorId, action, entityId, details: JSON.stringify(details) } });
  if (action !== "erp.saved") await tx.erpState.upsert({ where: { id: "main" }, create: { id: "main", revision: 1, payload: JSON.stringify({ version: "3.0.0", subscribers: [], invoices: [], jobCards: [], ledger: [], rules: [], vault: {} }) }, update: { revision: { increment: 1 } } });
}
async function nextNumber(tx: Tx, prefix: string, period = billingPeriod()) {
  const key = prefix + "-" + period.slice(0, 4);
  // The counter update locks the row; legacy numbers are skipped rather than reused.
  for (;;) {
    let initial = 1;
    if (!await tx.documentSequence.findUnique({ where: { key } })) {
      const [quotes, invoices] = await Promise.all([tx.quote.findMany({ where: { invoiceNo: { startsWith: key + "-" } }, select: { invoiceNo: true } }), tx.invoice.findMany({ where: { invoiceNo: { startsWith: key + "-" } }, select: { invoiceNo: true } })]);
      for (const record of [...quotes, ...invoices]) {
        const suffix = record.invoiceNo.slice(key.length + 1);
        if (/^\d+$/.test(suffix)) initial = Math.max(initial, Number(suffix) + 1);
      }
    }
    if (initial > 2_000_000_000) throw new DatabaseError("Document sequence is exhausted", 409);
    const seq = await tx.documentSequence.upsert({ where: { key }, create: { key, value: initial }, update: { value: { increment: 1 } } });
    const number = key + "-" + String(seq.value).padStart(5, "0");
    const [quote, invoice] = await Promise.all([tx.quote.findUnique({ where: { invoiceNo: number } }), tx.invoice.findUnique({ where: { invoiceNo: number } })]);
    if (!quote && !invoice) return number;
  }
}
function leadFields(input: unknown) {
  const data = object(input);
  return {
    name: text(data.name, "Name", 120), email: email(data.email),
    phone: text(data.phone, "Phone", 40, false) || null,
    company: text(data.company, "Company", 200, false) || null,
    location: text(data.location, "Location", 500, false) || null,
    source: text(data.source, "Source", 50, false) || "web",
    notes: text(data.notes, "Notes", 5000, false) || null,
  };
}
async function saveLead(tx: Tx, input: unknown, status = "new") {
  const fields = leadFields(input);
  if (!fields.email) return tx.lead.create({ data: { ...fields, status } });
  // A repeated enquiry must not downgrade an existing subscriber or erase contact data.
  const existing = await tx.lead.findUnique({ where: { email: fields.email } });
  return tx.lead.upsert({
    where: { email: fields.email },
    create: { ...fields, status },
    update: { name: fields.name, phone: fields.phone ?? existing?.phone, company: fields.company ?? existing?.company, location: fields.location ?? existing?.location, notes: fields.notes ?? existing?.notes },
  });
}
function parseItems(value: unknown) {
  if (!Array.isArray(value) || value.length < 1 || value.length > 200) throw new DatabaseError("Provide between 1 and 200 line items");
  return value.map(entry => {
    const item = object(entry);
    const quantity = item.quantity;
    if (typeof quantity !== "number" || !Number.isInteger(quantity) || quantity < 1 || quantity > 100000) throw new DatabaseError("Quantity must be a positive integer");
    const unitPriceMinor = money(item.unitPrice, "Unit price");
    return { name: text(item.name ?? item.service, "Item name", 500), quantity, unitPriceMinor, totalMinor: checkedTotal(quantity * unitPriceMinor), catalogItemId: text(item.catalogItemId, "Catalog ID", 200, false) || null };
  });
}
async function invoiceFromQuote(tx: Tx, quoteId: string, dueAt: Date | undefined, automatic: boolean) {
  const existing = await tx.invoice.findUnique({ where: { quoteId } });
  if (existing) {
    if (existing.archivedAt) throw new DatabaseError("This quote already has an archived invoice", 409);
    return existing;
  }
  const quote = await tx.quote.findUnique({ where: { id: quoteId }, include: { lineItems: true } });
  if (!quote || quote.archivedAt) throw new DatabaseError("Quote not found", 404);
  return tx.invoice.create({ data: {
    quoteId, subscriptionId: quote.subscriptionId, billingPeriod: quote.billingPeriod, invoiceNo: await nextNumber(tx, "INV"), dueAt: dueAt ?? quote.dueDate,
    subtotalMinor: quote.subtotalMinor, taxMinor: quote.taxMinor, labourFeeMinor: quote.labourFeeMinor, totalMinor: quote.totalMinor,
    generatedAutomatically: automatic,
    snapshot: JSON.stringify({ billedTo: quote.billedTo, email: quote.email, phone: quote.phone, company: quote.company, location: quote.location, currency: "KES", lineItems: apiRecord(quote.lineItems) }),
  } });
}
const quoteInclude = { lead: true, lineItems: true, invoice: true } as const;
const invoiceInclude = { quote: { select: { id: true, status: true, totalMinor: true, issueDate: true } }, payments: { where: { voidedAt: null } } } as const;

export type Page = { limit?: number; cursor?: string };
function pageQuery(page: Page = {}) {
  const take = page.limit ?? 100;
  if (!Number.isInteger(take) || take < 1 || take > 200) throw new DatabaseError("Page size must be between 1 and 200");
  return { take, ...(page.cursor ? { cursor: { id: page.cursor }, skip: 1 } : {}) };
}
export function databaseService(db: PrismaClient) {
  return {
    async leads(page: Page = {}) { return db.lead.findMany({ ...pageQuery(page), orderBy: [{ createdAt: "desc" }, { id: "desc" }], include: { quotes: { where: { archivedAt: null }, select: { id: true, status: true, totalMinor: true, issueDate: true } } } }); },
    async createLead(input: unknown, actor: string) {
      const body = object(input);
      const status = choice(body.status, ["new", "contacted", "qualified", "quote_sent", "subscriber", "lost"], "new");
      return transaction(db, async tx => { const lead = await saveLead(tx, body, status); await audit(tx, actor, "lead.saved", lead.id); return lead; });
    },
    async saveCatalog(input: unknown, actor: string) {
      const body = object(input);
      return transaction(db, async tx => {
        const item = await catalogWrite(tx, body, "manual");
        await audit(tx, actor, "catalog.saved", item.id);
        return item;
      });
    },
    async archiveCatalog(id: string, actor: string) {
      return transaction(db, async tx => {
        await tx.catalogItem.update({ where: { id }, data: { active: false } });
        await audit(tx, actor, "catalog.archived", id);
      });
    },
    async tariffs() {
      const rows = await db.catalogItem.findMany({ where: { active: true }, orderBy: { name: "asc" } });
      const result: Record<string, unknown[]> = { essentials: [], hardware: [], software: [], amc: [] };
      for (const row of rows) {
        const group = row.category && result[row.category] ? row.category : "hardware";
        result[group].push({ id: row.id, name: row.name, price: row.priceMinor / 100, unit: row.unit || "", period: row.unit || "", description: row.description || "" });
      }
      return result;
    },
    async catalog() { return db.catalogItem.findMany({ where: { active: true }, orderBy: { name: "asc" } }); },
    async quotes(page: Page = {}) { return db.quote.findMany({ ...pageQuery(page), where: { archivedAt: null }, orderBy: [{ createdAt: "desc" }, { id: "desc" }], include: quoteInclude }); },
    async createQuote(input: unknown, actor: string) {
      const body = object(input), items = parseItems(body.lineItems);
      const taxMinor = money(body.tax ?? 0, "Tax"), labourFeeMinor = money(body.labourFee ?? 0, "Labour");
      const subtotalMinor = checkedTotal(items.reduce((sum, item) => sum + item.totalMinor, 0));
      const totalMinor = checkedTotal(subtotalMinor + taxMinor + labourFeeMinor);
      const recurring = flag(body.recurring);
      const recurrence = recurring ? choice(body.recurrence, ["monthly"]) : null;
      const invoiceOnSave = flag(body.invoiceOnSave), dueDate = date(body.dueDate);
      const notes = text(body.notes, "Notes", 5000, false) || null;
      return transaction(db, async tx => {
        let lead;
        if (body.leadId) {
          lead = await tx.lead.findUnique({ where: { id: text(body.leadId, "Lead ID") } });
          if (!lead) throw new DatabaseError("Lead not found", 404);
        } else lead = await saveLead(tx, body.lead, "quote_sent");
        for (const item of items) {
          if (item.catalogItemId && !await tx.catalogItem.findFirst({ where: { id: item.catalogItemId, active: true } })) throw new DatabaseError("Catalog item is inactive or missing");
        }
        const quote = await tx.quote.create({ data: {
          leadId: lead.id, invoiceNo: await nextNumber(tx, "QUO"), status: "sent", dueDate,
          subtotalMinor, taxMinor, labourFeeMinor, totalMinor, notes, recurring, recurrence,
          billedTo: lead.name, email: lead.email, phone: lead.phone, company: lead.company, location: lead.location,
          lineItems: { create: items },
        }, include: quoteInclude });
        const invoice = invoiceOnSave ? await invoiceFromQuote(tx, quote.id, dueDate, true) : undefined;
        await audit(tx, actor, "quote.created", quote.id);
        return { quote, ...(invoice ? { invoice } : {}) };
      });
    },
    async quoteStatus(id: string, input: unknown, actor: string) {
      const status = choice(object(input).status, ["draft", "sent", "accepted", "rejected", "proforma"]);
      return transaction(db, async tx => {
        const quote = await tx.quote.findUnique({ where: { id }, include: { invoice: true } });
        if (!quote || quote.archivedAt) throw new DatabaseError("Quote not found", 404);
        if (quote.invoice) throw new DatabaseError("An invoiced quote cannot be changed", 409);
        const updated = await tx.quote.update({ where: { id }, data: { status } });
        await audit(tx, actor, "quote.status", id, { from: quote.status, to: status });
        return updated;
      });
    },
    async archiveQuote(id: string, actor: string) {
      return transaction(db, async tx => {
        const quote = await tx.quote.findUnique({ where: { id }, include: { invoice: true } });
        if (!quote) throw new DatabaseError("Quote not found", 404);
        if (quote.invoice) throw new DatabaseError("Keep the quote linked to its issued invoice; void the invoice instead", 409);
        await tx.quote.update({ where: { id }, data: { archivedAt: new Date() } });
        await audit(tx, actor, "quote.archived", id);
      });
    },
    async invoices(page: Page = {}) {
      const invoices = await db.invoice.findMany({ ...pageQuery(page), where: { archivedAt: null }, orderBy: [{ createdAt: "desc" }, { id: "desc" }], include: invoiceInclude });
      return invoices.map(invoice => {
        const paidMinor = invoice.payments.reduce((sum, payment) => sum + payment.amountMinor, 0);
        return { ...invoice, paidMinor, balanceMinor: invoice.totalMinor - paidMinor };
      });
    },
    async createInvoice(input: unknown, actor: string) {
      const body = object(input), quoteId = text(body.quoteId, "Quote ID"), dueAt = date(body.dueDate);
      return transaction(db, async tx => { const invoice = await invoiceFromQuote(tx, quoteId, dueAt, false); await audit(tx, actor, "invoice.created", invoice.id); return invoice; });
    },
    async invoiceStatus(id: string, input: unknown, actor: string) {
      const status = choice(object(input).status, ["paid", "unpaid", "void"]);
      return transaction(db, async tx => {
        const invoice = await tx.invoice.findUnique({ where: { id }, include: { payments: { where: { voidedAt: null } } } });
        if (!invoice || invoice.archivedAt) throw new DatabaseError("Invoice not found", 404);
        if (invoice.status === "void" && status !== "void") throw new DatabaseError("A void invoice cannot be reopened", 409);
        const paid = invoice.payments.reduce((sum, p) => sum + p.amountMinor, 0);
        if (status === "paid" && paid < invoice.totalMinor) {
          const payment = await tx.payment.create({ data: { invoiceId: id, amountMinor: invoice.totalMinor - paid, reference: "manual-" + crypto.randomUUID(), method: "manual" } });
          await paymentLedger(tx, payment);
        } else if (status === "unpaid" && paid > 0) {
          // Never erase payment history when reversing a manual status change.
          if (invoice.payments.some(p => p.method !== "manual")) throw new DatabaseError("Recorded payments must be reversed individually", 409);
          await tx.ledgerEntry.updateMany({ where: { paymentId: { in: invoice.payments.map(p => p.id) } }, data: { archivedAt: new Date() } });
          await tx.payment.updateMany({ where: { invoiceId: id, voidedAt: null }, data: { voidedAt: new Date() } });
        } else if (status === "void" && paid > 0) throw new DatabaseError("Reverse recorded payments before voiding this invoice", 409);
        const updated = await tx.invoice.update({ where: { id }, data: { status } });
        await audit(tx, actor, "invoice.status", id, { from: invoice.status, to: status });
        return updated;
      });
    },
    async archiveInvoice(id: string, actor: string) {
      return transaction(db, async tx => {
        const invoice = await tx.invoice.findUnique({ where: { id } });
        if (!invoice) throw new DatabaseError("Invoice not found", 404);
        if (invoice.status !== "void") throw new DatabaseError("Void an invoice before archiving it", 409);
        await tx.invoice.update({ where: { id }, data: { archivedAt: new Date() } });
        await audit(tx, actor, "invoice.archived", id);
      });
    },
    async addPayment(id: string, input: unknown, actor: string) {
      const body = object(input), amountMinor = money(body.amount), reference = text(body.reference, "Payment reference", 200), method = text(body.method, "Payment method", 80);
      if (amountMinor === 0) throw new DatabaseError("Payment must be positive");
      const paidAt = date(body.paidAt);
      return transaction(db, async tx => {
        const previous = await tx.payment.findUnique({ where: { reference } });
        if (previous) {
          if (previous.invoiceId !== id || previous.amountMinor !== amountMinor || previous.voidedAt) throw new DatabaseError("Payment reference already used", 409);
          return previous;
        }
        const invoice = await tx.invoice.findUnique({ where: { id }, include: { payments: { where: { voidedAt: null } } } });
        if (!invoice || invoice.archivedAt) throw new DatabaseError("Invoice not found", 404);
        if (invoice.status === "void") throw new DatabaseError("Cannot pay a void invoice", 409);
        const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amountMinor, 0) + amountMinor;
        if (totalPaid > invoice.totalMinor) throw new DatabaseError("Payment exceeds invoice balance", 409);
        const payment = await tx.payment.create({ data: { invoiceId: id, amountMinor, reference, method, paidAt } });
        await tx.invoice.update({ where: { id }, data: { status: totalPaid === invoice.totalMinor ? "paid" : "partial" } });
        await paymentLedger(tx, payment);
        await audit(tx, actor, "payment.created", payment.id, { invoiceId: id });
        return payment;
      });
    },
    async reversePayment(invoiceId: string, paymentId: string, input: unknown, actor: string) {
      const reason = text(object(input).reason, "Reversal reason", 1000);
      if (reason.length < 5) throw new DatabaseError("Provide a reason for the payment reversal");
      return transaction(db, async tx => {
        const payment = await tx.payment.findUnique({ where: { id: paymentId } });
        if (!payment || payment.invoiceId !== invoiceId) throw new DatabaseError("Payment not found", 404);
        if (payment.voidedAt) return payment;
        const result = await tx.payment.update({ where: { id: paymentId }, data: { voidedAt: new Date() } });
        await tx.ledgerEntry.updateMany({ where: { paymentId }, data: { archivedAt: new Date() } });
        const invoice = await tx.invoice.findUniqueOrThrow({ where: { id: invoiceId }, include: { payments: { where: { voidedAt: null } } } });
        const paid = invoice.payments.reduce((sum, item) => sum + item.amountMinor, 0);
        await tx.invoice.update({ where: { id: invoiceId }, data: { status: paid >= invoice.totalMinor ? "paid" : paid ? "partial" : "unpaid" } });
        await audit(tx, actor, "payment.reversed", paymentId, { invoiceId, reason });
        return result;
      });
    },
    async subscribers(page: Page = {}) {
      const subscriptions = await db.subscription.findMany({ ...pageQuery(page), where: { status: "active" }, include: { lead: true }, orderBy: [{ createdAt: "desc" }, { id: "desc" }] });
      // Preserve the current dashboard response shape while subscriptions are first-class records.
      return subscriptions.map(sub => ({ ...sub.lead, id: sub.id, leadId: sub.leadId, subscriptionId: sub.id, billingDay: sub.billingDay, quotes: [{ id: sub.id, totalMinor: sub.priceMinor, recurring: true, lineItems: [{ name: sub.packageName, quantity: 1, unitPriceMinor: sub.priceMinor, totalMinor: sub.priceMinor }] }] }));
    },
    async createSubscriber(input: unknown, actor: string) {
      const body = object(input), fields = leadFields(body);
      const packageName = text(body.packageName, "Package name", 200), priceMinor = money(body.packagePrice, "Package price");
      const billingDay = body.billingDay ?? 1;
      if (!Number.isInteger(billingDay) || Number(billingDay) < 1 || Number(billingDay) > 31) throw new DatabaseError("Billing day must be between 1 and 31");
      return transaction(db, async tx => {
        const lead = await saveLead(tx, fields, "subscriber");
        const existing = await tx.subscription.findFirst({ where: { leadId: lead.id, status: "active", packageName } });
        if (existing) throw new DatabaseError("This customer already has an active subscription to this package", 409);
        await tx.lead.update({ where: { id: lead.id }, data: { status: "subscriber" } });
        const subscription = await tx.subscription.create({ data: { leadId: lead.id, packageName, priceMinor, billingDay: Number(billingDay), metadata: "{}" } });
        await audit(tx, actor, "subscription.created", subscription.id);
        return { lead, subscription };
      });
    },
    async generateMonthly(actor: string, now = new Date()) {
      const period = billingPeriod(now);
      // Sequential transactions avoid an unbounded connection storm; retries are per subscription.
      const subscriptions = await db.subscription.findMany({ where: { status: "active" }, orderBy: { id: "asc" } });
      let generatedCount = 0;
      for (const subscription of subscriptions) {
        const generated = await transaction(db, async tx => {
          const sub = await tx.subscription.findUnique({ where: { id: subscription.id }, include: { lead: true } });
          if (!sub || sub.status !== "active") return false;
          if (await tx.invoice.findUnique({ where: { subscriptionId_billingPeriod: { subscriptionId: sub.id, billingPeriod: period } } })) return false;
          if (await tx.quote.findUnique({ where: { subscriptionId_billingPeriod: { subscriptionId: sub.id, billingPeriod: period } } })) return false;
          const dueDate = billingDue(period, sub.billingDay);
          const quote = await tx.quote.create({ data: {
            leadId: sub.leadId, subscriptionId: sub.id, billingPeriod: period,
            invoiceNo: await nextNumber(tx, "PROF", period), status: "proforma", dueDate,
            billedTo: sub.lead.name, email: sub.lead.email, phone: sub.lead.phone, company: sub.lead.company, location: sub.lead.location,
            subtotalMinor: sub.priceMinor, totalMinor: sub.priceMinor,
            notes: "Monthly subscription billing: " + period,
            lineItems: { create: { name: sub.packageName, quantity: 1, unitPriceMinor: sub.priceMinor, totalMinor: sub.priceMinor } },
          } });
          const invoice = await invoiceFromQuote(tx, quote.id, dueDate, true);
          await audit(tx, actor, "subscription.billed", invoice.id, { subscriptionId: sub.id, period });
          return true;
        });
        if (generated) generatedCount++;
      }
      return { success: true, generatedCount, billingPeriod: period };
    },
    async contact(input: unknown) {
      const body = object(input), name = text(body.name, "Name", 120), address = email(body.email), message = text(body.message, "Message", 5000);
      if (name.length < 2 || !address || message.length < 10) throw new DatabaseError("Provide a name, valid email, and a message of at least 10 characters");
      return transaction(db, async tx => {
        const lead = await saveLead(tx, { ...body, name, email: address, source: "website" });
        const submission = await tx.contactSubmission.create({ data: { leadId: lead.id, name, email: address, message } });
        return { id: submission.id };
      });
    },
    async erpRead() { return transaction(db, readErp); },
    async erpWrite(input: unknown, actor: string) {
      const body = object(input), revision = body.revision, payload = object(body.data);
      if (!Number.isInteger(revision) || Number(revision) < 0) throw new DatabaseError("A valid database revision is required");
      for (const key of ["subscribers", "invoices", "jobCards", "ledger", "rules"]) {
        if (!Array.isArray(payload[key]) || (payload[key] as unknown[]).length > 20000) throw new DatabaseError("Invalid ERP collection: " + key);
        const ids = new Set<string>();
        for (const entry of payload[key] as unknown[]) { const id = text(object(entry).id, "Record ID", 200); if (ids.has(id)) throw new DatabaseError("Duplicate ERP record ID"); ids.add(id); }
      }
      // Validate money before storing operational backups; reject non-finite or negative values.
      for (const entry of payload.subscribers as unknown[]) { const row = object(entry); money(row.monthlyRate ?? row.price ?? 0); text(row.name, "Subscriber name"); }
      for (const entry of payload.ledger as unknown[]) money(object(entry).amount);
      for (const entry of payload.invoices as unknown[]) { const row = object(entry); money(row.grandTotal ?? row.amount ?? 0); }
      object(payload.vault);
      const serialized = JSON.stringify({ ...payload, lastUpdated: new Date().toISOString() });
      if (Buffer.byteLength(serialized) > 4_000_000) throw new DatabaseError("ERP backup exceeds 4 MB", 413);
      return transaction(db, async tx => {
        const existing = await tx.erpState.findUnique({ where: { id: "main" } });
        if (existing ? existing.revision !== revision : revision !== 0) throw new DatabaseError("Database changed on another device. Reload before saving; your local backup is retained.", 409);
        await syncErp(tx, payload);
        const result = existing
          ? await tx.erpState.updateMany({ where: { id: "main", revision: Number(revision) }, data: { payload: serialized, revision: { increment: 1 } } })
          : null;
        if (result && result.count !== 1) throw new DatabaseError("Database revision conflict", 409);
        if (!existing) await tx.erpState.create({ data: { id: "main", revision: 1, payload: serialized } });
        const saved = await tx.erpState.findUniqueOrThrow({ where: { id: "main" } });
        await audit(tx, actor, "erp.saved", "main", { revision: saved.revision });
        return saved;
      });
    },
  };
}

function parsePeriod(value: unknown): string | null {
  if (typeof value !== "string" || !value) return null;
  if (/^\d{4}-(0[1-9]|1[0-2])$/.test(value)) return value;
  const match = /^(January|February|March|April|May|June|July|August|September|October|November|December) (\d{4})$/.exec(value);
  if (!match) throw new DatabaseError("Invoice period must include a month and year");
  return match[2] + "-" + String(["January","February","March","April","May","June","July","August","September","October","November","December"].indexOf(match[1]) + 1).padStart(2,"0");
}
async function readErp(tx: Tx) {
  const stored = await tx.erpState.findUnique({ where: { id: "main" } });
  const subscriptions = await tx.subscription.findMany({ where: { status: { not: "cancelled" } }, include: { lead: true } });
  const invoices = await tx.invoice.findMany({ where: { archivedAt: null }, include: { payments: { where: { voidedAt: null } } } });
  const jobs = await tx.jobCard.findMany({ where: { archivedAt: null } });
  const ledger = await tx.ledgerEntry.findMany({ where: { archivedAt: null }, orderBy: { occurredAt: "desc" } });
  if (!stored && !subscriptions.length && !invoices.length) return null;
  const payload = stored ? JSON.parse(stored.payload) : { version: "3.0.0", jobCards: [], ledger: [], rules: [], vault: {} };
  payload.subscribers = subscriptions.map(sub => ({
    ...JSON.parse(sub.metadata), id: sub.id, name: sub.lead.name, company: sub.lead.company, email: sub.lead.email,
    phone: sub.lead.phone, location: sub.lead.location, package: sub.packageName, monthlyRate: sub.priceMinor / 100,
    billingDay: sub.billingDay, status: sub.status,
  }));
  payload.invoices = invoices.map(inv => {
    const snapshot = JSON.parse(inv.snapshot), paidMinor = inv.payments.reduce((sum, p) => sum + p.amountMinor, 0);
    const old = (payload.invoices ?? []).find((row: JsonObject) => row.id === inv.id) ?? {};
    const period = inv.billingPeriod ? new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: "Africa/Nairobi" }).format(new Date(inv.billingPeriod + "-01T12:00:00Z")) : old.period;
    return { ...old, ...(snapshot.erp ?? {}), id: inv.id, invoiceNo: inv.invoiceNo, clientName: snapshot.billedTo,
      phone: snapshot.phone ?? "", email: snapshot.email ?? "", location: snapshot.location ?? "",
      subId: inv.subscriptionId, period, dueDate: inv.dueAt?.toISOString().slice(0,10) ?? old.dueDate,
      amount: inv.totalMinor / 100, grandTotal: inv.totalMinor / 100, subtotal: inv.subtotalMinor / 100,
      taxFee: inv.taxMinor / 100, labourFee: inv.labourFeeMinor / 100, totalPaid: paidMinor / 100,
      balanceDue: (inv.totalMinor - paidMinor) / 100, status: inv.status,
      lineItems: snapshot.erp?.lineItems ?? snapshot.lineItems?.map((item: JsonObject) => ({ title: item.name, qty: String(item.quantity), rate: item.unitPrice })),
    };
  });
  payload.jobCards = jobs.map(job => ({ ...JSON.parse(job.metadata), id: job.id, title: job.title, status: job.status, totalCost: job.totalMinor / 100 }));
  payload.ledger = ledger.map(entry => ({ ...JSON.parse(entry.metadata), id: entry.id, invoiceId: entry.invoiceId, type: entry.kind, amount: entry.amountMinor / 100, description: entry.description, reference: entry.reference, date: entry.occurredAt.toISOString().slice(0,10) }));
  return { revision: stored?.revision ?? 0, payload: JSON.stringify(payload) };
}
async function syncErp(tx: Tx, payload: JsonObject) {
  const subscriberIds: string[] = [];
  for (const entry of payload.subscribers as unknown[]) {
    const row = object(entry), id = text(row.id, "Subscriber ID");
    const billingDay = row.billingDay ?? 1;
    if (!Number.isInteger(billingDay) || Number(billingDay) < 1 || Number(billingDay) > 31) throw new DatabaseError("Invalid subscriber billing day");
    const status = choice(row.status, ["active", "suspended", "cancelled"], "active");
    const existing = await tx.subscription.findUnique({ where: { id } });
    let lead;
    if (existing) {
      lead = await tx.lead.update({ where: { id: existing.leadId }, data: { ...leadFields(row), status: "subscriber" } });
    } else lead = await saveLead(tx, row, "subscriber");
    await tx.subscription.upsert({ where: { id }, create: {
      id, leadId: lead.id, packageName: text(row.package, "Package"), priceMinor: money(row.monthlyRate ?? row.price ?? 0), billingDay: Number(billingDay), status, metadata: JSON.stringify(row),
    }, update: { packageName: text(row.package, "Package"), priceMinor: money(row.monthlyRate ?? row.price ?? 0), billingDay: Number(billingDay), status, metadata: JSON.stringify(row) } });
    subscriberIds.push(id);
  }
  await tx.subscription.updateMany({ where: { id: { notIn: subscriberIds }, status: { not: "cancelled" } }, data: { status: "cancelled" } });
  const invoiceIds: string[] = [];
  for (const entry of payload.invoices as unknown[]) {
    const row = object(entry), id = text(row.id, "Invoice ID");
    const totalMinor = money(row.grandTotal ?? row.amount ?? 0);
    const status = choice(row.status, ["unpaid", "paid", "partial", "void", "overdue"], "unpaid");
    const paidMinor = money(row.totalPaid ?? (status === "paid" ? totalMinor / 100 : row.depositAmount ?? 0));
    if (paidMinor > totalMinor || (status === "paid" && paidMinor !== totalMinor) || (status === "void" && paidMinor !== 0)) throw new DatabaseError("Invoice payment totals are inconsistent");
    const subscriptionId = text(row.subId, "Subscriber ID", 200, false) || null;
    if (subscriptionId && !await tx.subscription.findUnique({ where: { id: subscriptionId } })) throw new DatabaseError("Invoice references a missing subscriber");
    const billingPeriod = subscriptionId ? parsePeriod(row.period) : null;
    const existing = await tx.invoice.findUnique({ where: { id }, include: { payments: { where: { voidedAt: null } } } });
    if (existing && (existing.totalMinor !== totalMinor || existing.invoiceNo !== row.invoiceNo || existing.subscriptionId !== subscriptionId || existing.billingPeriod !== billingPeriod)) throw new DatabaseError("Issued invoice numbers, amounts, and billing periods cannot be overwritten", 409);
    if (existing?.status === "void" && status !== "void") throw new DatabaseError("A void invoice cannot be reopened", 409);
    const paidBefore = existing?.payments.reduce((sum, p) => sum + p.amountMinor, 0) ?? 0;
    if (paidMinor < paidBefore) throw new DatabaseError("Payment history cannot be erased by a backup restore", 409);
    const computedStatus = status === "void" ? "void" : paidMinor === totalMinor ? "paid" : paidMinor > 0 ? "partial" : "unpaid";
    const snapshot = { billedTo: text(row.clientName, "Client name"), email: row.email, phone: row.phone, location: row.location, currency: "KES", erp: row };
    await tx.invoice.upsert({ where: { id }, create: {
      id, invoiceNo: text(row.invoiceNo, "Invoice number"), subscriptionId, billingPeriod,
      subtotalMinor: totalMinor, totalMinor, status: computedStatus, snapshot: JSON.stringify(snapshot),
    }, update: { status: computedStatus } });
    if (paidMinor > paidBefore) {
      const related = (payload.ledger as JsonObject[]).find(entry => entry.invoiceId === id && !existing?.payments.some(p => p.reference === entry.reference));
      await tx.payment.create({ data: {
        invoiceId: id, amountMinor: paidMinor - paidBefore, reference: related?.reference ? text(related.reference, "Payment reference") : "erp-" + id + "-" + paidMinor,
        method: related?.paymentMethod ? text(related.paymentMethod, "Payment method") : "legacy-erp", paidAt: date(row.paidAt) ?? new Date(),
      } });
    }
    invoiceIds.push(id);
  }
  const jobIds: string[] = [];
  for (const entry of payload.jobCards as unknown[]) {
    const row = object(entry), id = text(row.id, "Job ID"), title = text(row.title, "Job title", 500);
    const leads = row.clientName ? await tx.lead.findMany({ where: { name: String(row.clientName) }, take: 2 }) : [];
    const invoice = row.invoiceRef ? await tx.invoice.findUnique({ where: { invoiceNo: String(row.invoiceRef) } }) : null;
    const data = { title, leadId: leads.length === 1 ? leads[0].id : null, invoiceId: invoice?.id ?? null,
      status: choice(row.status, ["pending", "in_progress", "completed", "cancelled"], "pending"), totalMinor: money(row.totalCost ?? 0), metadata: JSON.stringify(row), archivedAt: null };
    await tx.jobCard.upsert({ where: { id }, create: { id, ...data }, update: data });
    jobIds.push(id);
  }
  await tx.jobCard.updateMany({ where: { id: { notIn: jobIds }, archivedAt: null }, data: { archivedAt: new Date() } });
  const ledgerIds: string[] = [];
  for (const entry of payload.ledger as unknown[]) {
    const row = object(entry), id = text(row.id, "Ledger ID");
    const existing = await tx.ledgerEntry.findUnique({ where: { id } });
    const amountMinor = money(row.amount), kind = choice(row.type, ["income", "expense"]);
    const reference = text(row.reference, "Reference", 200, false) || null;
    const payment = reference ? await tx.payment.findUnique({ where: { reference } }) : null;
    if (payment?.voidedAt) throw new DatabaseError("A reversed payment cannot be restored through the ledger", 409);
    if (payment && (payment.amountMinor !== amountMinor || kind !== "income")) throw new DatabaseError("Ledger amount does not match its payment", 409);
    if (existing?.paymentId && existing.paymentId !== payment?.id) throw new DatabaseError("A payment-linked ledger entry cannot be overwritten", 409);
    const invoiceId = payment?.invoiceId ?? (text(row.invoiceId, "Invoice ID", 200, false) || null);
    const data = { invoiceId, paymentId: payment?.id, kind, amountMinor, description: text(row.description, "Description", 1000),
      reference, occurredAt: date(row.date) ?? new Date(), metadata: JSON.stringify(row), archivedAt: null };
    await tx.ledgerEntry.upsert({ where: { id }, create: { id, ...data }, update: data });
    ledgerIds.push(id);
  }
  if (await tx.ledgerEntry.count({ where: { id: { notIn: ledgerIds }, paymentId: { not: null }, archivedAt: null } })) throw new DatabaseError("Payment ledger records must be reversed, not deleted", 409);
  await tx.ledgerEntry.updateMany({ where: { id: { notIn: ledgerIds }, archivedAt: null }, data: { archivedAt: new Date() } });
  if (payload.tariffs !== undefined) {
    const tariffs = object(payload.tariffs), ids: string[] = [];
    for (const group of ["essentials", "hardware", "software", "amc"]) {
      if (!Array.isArray(tariffs[group]) || (tariffs[group] as unknown[]).length > 1000) throw new DatabaseError("Invalid tariff group");
      for (const row of tariffs[group] as unknown[]) {
        const item = await catalogWrite(tx, { ...object(row), category: group }, "tariff");
        ids.push(item.id);
      }
    }
    await tx.catalogItem.updateMany({ where: { managedBy: "tariff", id: { notIn: ids } }, data: { active: false } });
  }
  // Omitted financial documents are retained; deletion must use the audited void/archive API.
  const retained = await tx.invoice.count({ where: { archivedAt: null, id: { notIn: invoiceIds } } });
  if (retained) throw new DatabaseError("The backup omits issued invoices. Reload the latest database before saving.", 409);
}

async function paymentLedger(tx: Tx, payment: { id: string; invoiceId: string; amountMinor: number; reference: string; method: string; paidAt: Date }) {
  const invoice = await tx.invoice.findUniqueOrThrow({ where: { id: payment.invoiceId } });
  await tx.ledgerEntry.create({ data: { id: "payment-" + payment.id, paymentId: payment.id, invoiceId: payment.invoiceId,
    kind: "income", amountMinor: payment.amountMinor, reference: payment.reference, occurredAt: payment.paidAt,
    description: "Payment for " + invoice.invoiceNo, metadata: JSON.stringify({ paymentMethod: payment.method, category: "Invoice Payment", entity: "DATA PORT Core" }) } });
}

async function catalogWrite(tx: Tx, body: JsonObject, managedBy: string) {
  const id = text(body.id, "Catalog ID", 191, false) || undefined;
  const name = text(body.name, "Catalog name", 200), priceMinor = money(body.price);
  const category = choice(body.category, ["essentials", "hardware", "software", "amc"], "hardware");
  const data = { name, priceMinor, category, unit: text(body.unit ?? body.period, "Unit", 100, false) || null,
    description: text(body.description, "Description", 5000, false) || null, active: body.active === undefined ? true : flag(body.active), managedBy };
  if (id && await tx.catalogItem.findUnique({ where: { id } })) return tx.catalogItem.update({ where: { id }, data });
  return tx.catalogItem.upsert({ where: { name }, create: { ...(id ? { id } : {}), ...data }, update: data });
}
