import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const username = process.env.ADMIN_USERNAME?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;
if (!username || !password || password.length < 12) throw new Error("Set ADMIN_USERNAME and an ADMIN_PASSWORD of at least 12 characters. Existing administrators are not changed.");
const db = new PrismaClient();
try {
  if (await db.admin.findUnique({ where: { username } })) throw new Error("Administrator already exists; this command never resets passwords.");
  await db.admin.create({ data: { username, password: await bcrypt.hash(password, 12), role: "superadmin" } });
  console.log("Administrator created.");
} finally { await db.$disconnect(); }
