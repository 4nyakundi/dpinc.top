import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prismadb";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "your-secret-key";

function verifyAuth(req: NextRequest) {
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

function buildInvoiceNumber() {
  return `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 90000 + 10000)}`;
}

export async function GET(req: NextRequest) {
  const auth = verifyAuth(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const invoices = await prisma.invoice.findMany({
    orderBy: { issuedAt: "desc" },
    include: {
      quote: {
        select: { id: true, status: true, total: true, issueDate: true },
      },
    },
  });

  return NextResponse.json({ invoices });
}

export async function POST(req: NextRequest) {
  const auth = verifyAuth(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { quoteId, dueDate } = await req.json();
  if (!quoteId) {
    return NextResponse.json({ error: "Quote ID is required" }, { status: 400 });
  }

  const quote = await prisma.quote.findUnique({
    where: { id: quoteId },
  });

  if (!quote) {
    return NextResponse.json({ error: "Quote not found" }, { status: 404 });
  }

  const invoice = await prisma.invoice.create({
    data: {
      quoteId: quote.id,
      invoiceNo: buildInvoiceNumber(),
      dueAt: dueDate ? new Date(dueDate) : undefined,
      subtotal: quote.subtotal,
      tax: quote.tax,
      labourFee: quote.labourFee,
      total: quote.total,
      generatedAutomatically: false,
    },
  });

  return NextResponse.json({ invoice });
}
