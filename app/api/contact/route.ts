import { NextRequest } from "next/server";
import { body, database, respond, rateLimit } from "@/lib/api";
import { DatabaseError, object, email } from "@/lib/database";
export async function POST(req: NextRequest) {
  return respond(async () => {
    if (req.headers.get("origin") && req.headers.get("origin") !== req.nextUrl.origin) throw new DatabaseError("Invalid request origin", 403);
    const data = object(await body(req, 15000));
    const address = email(data.email);
    if (!address) throw new DatabaseError("Email is required");
    await rateLimit("contact", address, 5, 900);
    return { success: true, ...await database.contact(data) };
  });
}
