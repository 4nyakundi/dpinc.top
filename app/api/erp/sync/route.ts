import { NextRequest } from "next/server";
import { admin, body, database, respond } from "@/lib/api";
export async function GET(req: NextRequest) {
  return respond(async () => {
    await admin(req);
    const record = await database.erpRead();
    return { revision: record?.revision ?? 0, data: record ? JSON.parse(record.payload) : null };
  });
}
export async function POST(req: NextRequest) {
  return respond(async () => {
    const actor = await admin(req), record = await database.erpWrite(await body(req, 4500000), actor);
    return { success: true, revision: record.revision, lastUpdated: record.updatedAt };
  });
}
