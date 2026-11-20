import { database, respond } from "@/lib/api";
export async function GET() { return respond(async () => ({ tariffs: await database.tariffs() })); }
