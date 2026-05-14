import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prismadb";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "your-secret-key";

export async function POST(req: NextRequest) {
  try {
    const { token, billedTo, phone, email, location, lineItems, labourFee } =
      await req.json();

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    if (!billedTo || !lineItems || lineItems.length === 0 || !labourFee) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const subtotal = lineItems.reduce(
      (sum: number, item: any) => sum + item.quantity * item.unitPrice,
      0
    );
    const total = subtotal + labourFee;

    const quote = await prisma.quote.create({
      data: {
        invoiceNo: `INV-${new Date().getFullYear()}-${Math.floor(
          Math.random() * 90000 + 10000
        )}`,
        billedTo,
        phone,
        email,
        location,
        labourFee,
        subtotal,
        total,
        status: "draft",
        lineItems: {
          create: lineItems.map((item: any) => ({
            service: item.service,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.quantity * item.unitPrice,
          })),
        },
      },
      include: {
        lineItems: true,
      },
    });

    return NextResponse.json({
      success: true,
      invoiceNo: quote.invoiceNo,
      quote,
      message: "Quote created successfully",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create quote" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const quotes = await prisma.quote.findMany({
      include: { lineItems: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ quotes });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch quotes" },
      { status: 500 }
    );
  }
}
