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

export async function POST(req: NextRequest) {
  const auth = verifyAuth(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    // Billing month identifier: e.g. "07-2026"
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

    let generatedCount = 0;

    for (const sub of subscribers) {
      const template = sub.quotes[0]; // Active subscription quote
      if (!template) continue;

      // Check if a proforma for this month already exists
      const existingQuote = await prisma.quote.findFirst({
        where: {
          leadId: sub.id,
          notes: {
            contains: billingMonthToken,
          },
        },
      });

      if (!existingQuote) {
        // Create new monthly proforma Quote
        const monthlyQuote = await prisma.quote.create({
          data: {
            leadId: sub.id,
            invoiceNo: `PROF-${year}-${Math.floor(Math.random() * 90000 + 10000)}`,
            status: "proforma",
            dueDate: new Date(year, now.getMonth() + 1, 5), // Due on 5th of next month (or same month)
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

        // Create associated Invoice in "unpaid" (Pending) status
        await prisma.invoice.create({
          data: {
            quoteId: monthlyQuote.id,
            invoiceNo: buildInvoiceNumber(),
            subtotal: monthlyQuote.subtotal,
            tax: monthlyQuote.tax,
            labourFee: monthlyQuote.labourFee,
            total: monthlyQuote.total,
            status: "unpaid",
            generatedAutomatically: true,
          },
        });

        generatedCount++;
      }
    }

    return NextResponse.json({ success: true, generatedCount });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
