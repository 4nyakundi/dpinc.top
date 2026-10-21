import { NextRequest } from "next/server";
import { admin, body, database, respond } from "@/lib/api";
export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string; paymentId: string }> }) {
  return respond(async () => { const actor = await admin(req), { id, paymentId } = await context.params; return { payment: await database.reversePayment(id, paymentId, await body(req), actor) }; });
}
