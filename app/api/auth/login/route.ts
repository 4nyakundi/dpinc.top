import bcryptjs from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

// Hardcoded credentials
const ADMIN_USERNAME = "root";
const ADMIN_PASSWORD = "c@#365";
const JWT_SECRET = process.env.NEXTAUTH_SECRET || "your-secret-key";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    // Simple validation
    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = jwt.sign(
      { username, role: "admin" },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    return NextResponse.json({ token, message: "Login successful" });
  } catch (error) {
    return NextResponse.json(
      { error: "Login failed" },
      { status: 500 }
    );
  }
}
