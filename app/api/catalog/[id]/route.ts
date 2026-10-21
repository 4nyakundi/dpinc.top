import { NextRequest } from "next/server";
import { admin, database, respond } from "@/lib/api";
export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) { return respond(async () => { const actor = await admin(req); await database.archiveCatalog((await context.params).id, actor); return { success: true }; }); }
