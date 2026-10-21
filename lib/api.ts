import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { createHash } from "node:crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prismadb";
import { apiRecord, DatabaseError, databaseService, transaction, type Page } from "@/lib/database";

export const database = databaseService(prisma);
export async function admin(req: NextRequest): Promise<string> {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret || secret.length < 32) throw new DatabaseError("Server authentication is not configured", 503);
  const bearer = req.headers.get("authorization");
  const token = bearer?.startsWith("Bearer ") ? bearer.slice(7) : req.cookies.get("adminSession")?.value;
  if (!token) throw new DatabaseError("Unauthorized", 401);
  if (req.method !== "GET" && req.headers.get("origin") && req.headers.get("origin") !== req.nextUrl.origin) throw new DatabaseError("Invalid request origin", 403);
  let subject: string;
  try {
    const claims = jwt.verify(token, secret, { algorithms: ["HS256"] });
    if (typeof claims === "string" || typeof claims.sub !== "string") throw new Error();
    subject = claims.sub;
  } catch { throw new DatabaseError("Session expired. Please sign in again.", 401); }
  const record = await prisma.admin.findUnique({ where: { id: subject } });
  if (!record?.active || !["admin", "superadmin"].includes(record.role)) throw new DatabaseError("Unauthorized", 401);
  return record.id;
}
export async function body(req: NextRequest, limit = 1000000): Promise<unknown> {
  if (Number(req.headers.get("content-length")) > limit) throw new DatabaseError("Request is too large", 413);
  const reader = req.body?.getReader();
  if (!reader) throw new DatabaseError("JSON body is required");
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > limit) { await reader.cancel(); throw new DatabaseError("Request is too large", 413); }
    chunks.push(value);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString("utf8")); } catch { throw new DatabaseError("Invalid JSON"); }
}
export async function respond(work: () => Promise<unknown>) {
  try {
    return NextResponse.json(apiRecord(await work()), { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof DatabaseError) return NextResponse.json({ error: error.message }, { status: error.status });
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") return NextResponse.json({ error: "A record with that identifier already exists" }, { status: 409 });
      if (error.code === "P2025") return NextResponse.json({ error: "Record not found" }, { status: 404 });
      if (error.code === "P2003") return NextResponse.json({ error: "This record is referenced by another record" }, { status: 409 });
      if (["P2034", "P2024"].includes(error.code)) return NextResponse.json({ error: "Database busy. Please retry." }, { status: 503 });
    }
    console.error("Database operation failed:", error instanceof Error ? error.name : "unknown error");
    return NextResponse.json({ error: "Database is unavailable. Please try again." }, { status: 503 });
  }
}

export async function rateLimit(scope: string, identity: string, maximum: number, seconds: number) {
  const now = Date.now(), bucket = Math.floor(now / (seconds * 1000));
  const id = createHash("sha256").update(scope + ":" + identity + ":" + bucket).digest("hex");
  const count = await transaction(prisma, async tx => {
    await tx.requestLimit.deleteMany({ where: { expiresAt: { lt: new Date(now) } } });
    return tx.requestLimit.upsert({ where: { id }, create: { id, expiresAt: new Date((bucket + 1) * seconds * 1000) }, update: { count: { increment: 1 } } });
  });
  if (count.count > maximum) throw new DatabaseError("Too many requests. Please try again later.", 429);
}

export async function pageResponse<T extends { id: string }>(req: NextRequest, key: string, fetch: (page: Page) => Promise<T[]>) {
  const limit = Number(req.nextUrl.searchParams.get("limit") ?? 100);
  const cursor = req.nextUrl.searchParams.get("cursor") || undefined;
  const records = await fetch({ limit, cursor });
  return { [key]: records, nextCursor: records.length === limit ? records.at(-1)?.id : null };
}
