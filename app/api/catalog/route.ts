import { NextRequest } from "next/server";
import { admin, body, database, respond } from "@/lib/api";
export async function GET() { return respond(async () => ({ items: await database.catalog() })); }
export async function POST(req: NextRequest) { return respond(async () => { const actor = await admin(req); return { item: await database.saveCatalog(await body(req), actor) }; }); }
