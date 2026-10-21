import { NextRequest } from "next/server";
import { admin, body, database, respond, pageResponse } from "@/lib/api";
export async function GET(req: NextRequest) { return respond(async () => { await admin(req); return pageResponse(req, "invoices", page => database.invoices(page)); }); }
export async function POST(req: NextRequest) { return respond(async () => { const actor = await admin(req); return { invoice: await database.createInvoice(await body(req), actor) }; }); }
