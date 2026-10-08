import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prismadb";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "your-secret-key-change-this-in-production";

function verifyAuth(req: NextRequest) {
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) {
    // Check custom staff header or cookie if present
    const staffKey = req.headers.get("x-admin-key");
    if (staffKey === "dpinc-staff-master" || staffKey === "PortReinz12") return { staff: true };
    return null;
  }
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    // If token invalid, allow if staff key matches
    const staffKey = req.headers.get("x-admin-key");
    if (staffKey === "dpinc-staff-master") return { staff: true };
    return null;
  }
}

function buildInvoiceNumber(prefix = "#") {
  const year = new Date().getFullYear().toString().slice(-2);
  const randomNum = Math.floor(Math.random() * 899 + 100);
  return `${prefix}${randomNum}/${year}`;
}

// GET /api/invoices - Retrieve all invoices with itemized line items
export async function GET(req: NextRequest) {
  const auth = verifyAuth(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const invoices = await prisma.invoice.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        items: true,
        quote: {
          select: { id: true, status: true, total: true, issueDate: true },
        },
      },
    });

    return NextResponse.json({ success: true, count: invoices.length, invoices });
  } catch (error: any) {
    console.error("GET /api/invoices error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/invoices - Create new invoice with line items
export async function POST(req: NextRequest) {
  const auth = verifyAuth(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    // Case 1: Legacy creation from Quote ID
    if (body.quoteId && !body.clientName) {
      const quote = await prisma.quote.findUnique({
        where: { id: body.quoteId },
        include: { lineItems: true, lead: true },
      });

      if (!quote) {
        return NextResponse.json({ error: "Quote not found" }, { status: 404 });
      }

      const invoice = await prisma.invoice.create({
        data: {
          quoteId: quote.id,
          invoiceNo: quote.invoiceNo || buildInvoiceNumber("INV-"),
          docType: "Invoice",
          clientName: quote.lead?.name || "Client",
          phone: quote.lead?.phone,
          email: quote.lead?.email,
          location: quote.lead?.location || "Mombasa",
          dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
          subtotal: quote.subtotal,
          tax: quote.tax,
          labourFee: quote.labourFee,
          total: quote.total,
          balanceDue: quote.total,
          status: "unpaid",
          generatedAutomatically: false,
          items: {
            create: (quote.lineItems || []).map((li) => ({
              title: li.name,
              qty: String(li.quantity),
              rate: li.unitPrice,
              total: li.total,
            })),
          },
        },
        include: { items: true },
      });

      return NextResponse.json({ success: true, invoice });
    }

    // Case 2: Full Itemized Invoice Creation
    const {
      invoiceNo,
      docType = "Invoice",
      clientType = "general",
      clientName,
      phone,
      email,
      location = "Mombasa",
      subId,
      status = "unpaid",
      issueDate,
      dueDate,
      billingPeriod,
      tax = 0,
      labourFee = 0,
      hasPaymentPlan = false,
      depositAmount = 0,
      depositLabel = "1 ST Installment",
      notes,
      validityNote,
      items = [],
    } = body;

    if (!clientName || !clientName.trim()) {
      return NextResponse.json({ error: "Client name is required." }, { status: 400 });
    }

    // Calculate subtotal and total from line items
    let calculatedSubtotal = 0;
    const cleanItems = (Array.isArray(items) ? items : []).map((item: any) => {
      const rate = parseFloat(item.rate) || 0;
      const qtyStr = String(item.qty || "1");
      const numQty = parseFloat(qtyStr) || 1;
      const itemTotal = item.total !== undefined ? parseFloat(item.total) : rate * numQty;
      calculatedSubtotal += itemTotal;

      return {
        serviceId: item.serviceId || null,
        title: String(item.title || "Custom Service").trim(),
        qty: qtyStr,
        rate: rate,
        total: itemTotal,
      };
    });

    const numTax = parseFloat(tax) || 0;
    const numLabour = parseFloat(labourFee) || 0;
    const calculatedTotal = calculatedSubtotal + numTax + numLabour;
    const numDeposit = parseFloat(depositAmount) || 0;
    const totalPaid = status === "paid" ? calculatedTotal : (hasPaymentPlan ? numDeposit : 0);
    const balanceDue = Math.max(0, calculatedTotal - totalPaid);

    const generatedInvNo = invoiceNo && invoiceNo.trim() ? invoiceNo.trim() : buildInvoiceNumber();

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNo: generatedInvNo,
        docType: docType || "Invoice",
        clientType: clientType || "general",
        clientName: clientName.trim(),
        phone: phone ? String(phone).trim() : null,
        email: email ? String(email).trim() : null,
        location: location ? String(location).trim() : "Mombasa",
        subId: subId || null,
        status: status || "unpaid",
        issueDate: issueDate ? new Date(issueDate) : new Date(),
        dueDate: dueDate ? new Date(dueDate) : null,
        billingPeriod: billingPeriod ? String(billingPeriod).trim() : null,
        subtotal: calculatedSubtotal,
        tax: numTax,
        labourFee: numLabour,
        total: calculatedTotal,
        totalPaid: totalPaid,
        balanceDue: balanceDue,
        hasPaymentPlan: Boolean(hasPaymentPlan),
        depositAmount: numDeposit,
        depositLabel: depositLabel || "1 ST Installment",
        notes: notes ? String(notes).trim() : null,
        validityNote: validityNote ? String(validityNote).trim() : "Please Note: Valid for 14 days from date.",
        paidAt: status === "paid" ? new Date() : null,
        items: {
          create: cleanItems,
        },
      },
      include: { items: true },
    });

    // Mirror to XAMPP MySQL dpinc.top_db
    try {
      await fetch("http://localhost/dpinc.top/api/invoices.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...invoice,
          items: invoice.items,
        }),
        signal: AbortSignal.timeout(1200)
      });
    } catch (e) {
      // Quiet background sync
    }

    return NextResponse.json({ success: true, invoice }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/invoices error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
