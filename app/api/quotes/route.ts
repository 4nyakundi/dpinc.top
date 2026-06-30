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

  const quotes = await prisma.quote.findMany({
    orderBy: { issueDate: "desc" },
    include: {
      lead: true,
      lineItems: true,
      invoice: true,
    },
  });

  return NextResponse.json({ quotes });
}

export async function POST(req: NextRequest) {
  const auth = verifyAuth(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const {
    leadId,
    lead,
    lineItems,
    labourFee = 0,
    tax = 0,
    notes,
    recurring = false,
    recurrence,
    invoiceOnSave = false,
    dueDate,
  } = await req.json();

  if (!lineItems || !Array.isArray(lineItems) || lineItems.length === 0) {
    return NextResponse.json({ error: "At least one quote item is required" }, { status: 400 });
  }

  let leadRecord = null;
  if (leadId) {
    leadRecord = await prisma.lead.findUnique({ where: { id: leadId } });
  }

  if (!leadRecord && lead?.name) {
    leadRecord = await prisma.lead.create({
      data: {
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        company: lead.company,
        source: lead.source || "web",
        status: "quote_sent",
      },
    });
  }

  const subtotal = lineItems.reduce(
    (sum: number, item: any) => sum + item.quantity * item.unitPrice,
    0
  );
  const total = subtotal + labourFee + tax;

  const quote = await prisma.quote.create({
    data: {
      leadId: leadRecord?.id,
      invoiceNo: buildInvoiceNumber(),
      status: "sent",
      dueDate: dueDate ? new Date(dueDate) : undefined,
      subtotal,
      tax,
      labourFee,
      total,
      notes,
      recurring,
      recurrence,
      lineItems: {
        create: lineItems.map((item: any) => ({
          catalogItemId: item.catalogItemId || undefined,
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.quantity * item.unitPrice,
        })),
      },
    },
    include: {
      lineItems: true,
      lead: true,
    },
  });

  if (invoiceOnSave) {
    const invoice = await prisma.invoice.create({
      data: {
        quoteId: quote.id,
        invoiceNo: buildInvoiceNumber(),
        dueAt: dueDate ? new Date(dueDate) : undefined,
        subtotal: quote.subtotal,
        tax: quote.tax,
        labourFee: quote.labourFee,
        total: quote.total,
        generatedAutomatically: true,
      },
    });

    return NextResponse.json({ quote, invoice });
  }

  return NextResponse.json({ quote });
}
