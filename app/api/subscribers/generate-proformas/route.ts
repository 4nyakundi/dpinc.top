import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
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

async function getNextInvoiceNumber(prefix: string) {
  const year = new Date().getFullYear();
  const lastInvoice = await prisma.invoice.findFirst({ where: { invoiceNo: { startsWith: `${prefix}-${year}` } }, orderBy: { createdAt: 'desc' } });
  const lastNumber = lastInvoice ? parseInt(lastInvoice.invoiceNo.split('-').pop() || '0') : 0;
  const nextNumber = (lastNumber + 1).toString().padStart(5, '0');
  return `${prefix}-${year}-${nextNumber}`;
}

export async function POST(req: NextRequest) {
  const auth = verifyAuth(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = now.getFullYear();
    const billingMonthToken = `[Billing Month: ${month}-${year}]`;

    // Fetch all active subscribers and their recurring templates
    const subscribers = await prisma.lead.findMany({
      where: { status: "subscriber" },
      include: {
        quotes: {
          where: { recurring: true },
          include: { lineItems: true },
        },
      },
    });

    const creationPromises = [];

    for (const sub of subscribers) {
      const template = sub.quotes[0]; // Active subscription quote
      if (!template) continue;

      creationPromises.push(async () => {
        // Check if a proforma for this month already exists inside a transaction
        const existingQuote = await prisma.quote.findFirst({
          where: {
            leadId: sub.id,
            notes: {
              contains: billingMonthToken,
            },
          },
        });

        if (existingQuote) {
          return null;
        }

        return prisma.$transaction(async (tx) => {
          const proformaNumber = await getNextInvoiceNumber("PROF");
          const invoiceNumber = await getNextInvoiceNumber("INV");

          const monthlyQuote = await tx.quote.create({
            data: {
              leadId: sub.id,
              invoiceNo: proformaNumber,
              status: "proforma",
              dueDate: new Date(year, now.getMonth() + 1, 5),
              subtotal: template.subtotal,
              tax: template.tax,
              labourFee: template.labourFee,
              total: template.total,
              notes: `${billingMonthToken} Monthly internet billing for ${sub.name}.`,
              lineItems: {
                create: template.lineItems.map((item) => ({
                  name: item.name,
                  quantity: item.quantity,
                  unitPrice: item.unitPrice,
                  total: item.total,
                })),
              },
            },
          });

          await tx.invoice.create({
            data: {
              quoteId: monthlyQuote.id,
              invoiceNo: invoiceNumber,
              subtotal: monthlyQuote.subtotal,
              tax: monthlyQuote.tax,
              labourFee: monthlyQuote.labourFee,
              total: monthlyQuote.total,
              status: "unpaid",
              generatedAutomatically: true,
            },
          });

          return monthlyQuote.id;
        });
      });
    }

    const results = await Promise.all(creationPromises.map(p => p()));
    const generatedCount = results.filter(r => r !== null).length;

    return NextResponse.json({ success: true, generatedCount });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
