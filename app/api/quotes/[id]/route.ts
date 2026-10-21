import { NextRequest } from "next/server";
import { admin, body, database, respond } from "@/lib/api";
type Context = { params: Promise<{ id: string }> };
export async function PATCH(req: NextRequest, context: Context) { return respond(async () => { const actor = await admin(req); return { quote: await database.quoteStatus((await context.params).id, await body(req), actor) }; }); }
export async function DELETE(req: NextRequest, context: Context) { return respond(async () => { const actor = await admin(req); await database.archiveQuote((await context.params).id, actor); return { success: true }; }); }
