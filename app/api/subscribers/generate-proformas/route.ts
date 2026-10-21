import { NextRequest } from "next/server";
import { admin, database, respond } from "@/lib/api";
export async function POST(req: NextRequest) { return respond(async () => database.generateMonthly(await admin(req))); }
