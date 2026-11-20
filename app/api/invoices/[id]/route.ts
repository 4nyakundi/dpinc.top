import { NextRequest } from "next/server";
import { admin, body, database, respond } from "@/lib/api";
type Context = { params: Promise<{ id: string }> };
export async function PATCH(req: NextRequest, context: Context) { return respond(async () => { const actor = await admin(req); return { invoice: await database.invoiceStatus((await context.params).id, await body(req), actor) }; }); }
export async function DELETE(req: NextRequest, context: Context) { return respond(async () => { const actor = await admin(req); await database.archiveInvoice((await context.params).id, actor); return { success: true }; }); }
