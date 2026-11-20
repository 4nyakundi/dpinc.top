import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";
import { body, respond, rateLimit } from "@/lib/api";
import { DatabaseError, object, text } from "@/lib/database";
import { prisma } from "@/lib/prismadb";
export async function POST(req: NextRequest) {
  let sessionToken = "";
  const response = await respond(async () => {
    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret || secret.length < 32) throw new DatabaseError("Server authentication is not configured", 503);
    if (req.headers.get("origin") && req.headers.get("origin") !== req.nextUrl.origin) throw new DatabaseError("Invalid request origin", 403);
    const data = object(await body(req, 5000));
    const username = text(data.username, "Username", 254).toLowerCase(), password = text(data.password, "Password", 200);
    await rateLimit("login", username, 10, 900);
    const record = await prisma.admin.findUnique({ where: { username } });
    // Equal-cost comparison for unknown users.
    const valid = await bcrypt.compare(password, record?.password ?? "$2a$12$YRjwshlJGwzUozKhWmfZ0OOADeNJ8nM8Cm4nvb8BvVl7vz7TG28tW");
    if (!record?.active || !valid || !["admin", "superadmin"].includes(record.role)) throw new DatabaseError("Invalid credentials", 401);
    sessionToken = jwt.sign({ sub: record.id }, secret, { algorithm: "HS256", expiresIn: "8h" });
    return { token: sessionToken, message: "Login successful" };
  });
  if (sessionToken) response.cookies.set("adminSession", sessionToken, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 8 * 60 * 60 });
  return response;
}
