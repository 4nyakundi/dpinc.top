import { NextRequest } from "next/server";
import { admin, body, database, respond } from "@/lib/api";
export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  return respond(async () => { const actor = await admin(req); return { payment: await database.addPayment((await context.params).id, await body(req), actor) }; });
}
