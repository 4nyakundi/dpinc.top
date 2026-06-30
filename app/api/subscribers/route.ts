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

export async function GET(req: NextRequest) {
  const auth = verifyAuth(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const subscribers = await prisma.lead.findMany({
      where: { status: "subscriber" },
      include: {
        quotes: {
          where: { recurring: true },
          include: { lineItems: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ subscribers });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = verifyAuth(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const {
    name,
    email,
    phone,
    company,
    packageName, // e.g. "Internet Plan 10Mbps"
    packagePrice, // e.g. 3000
    notes,
  } = await req.json();

  if (!name) {
    return NextResponse.json({ error: "Client name is required" }, { status: 400 });
  }

  try {
    // 1. Create or update the Lead with status "subscriber"
    const lead = await prisma.lead.create({
      data: {
        name,
        email: email || null,
        phone: phone || null,
        company: company || null,
        source: "admin_panel",
        status: "subscriber",
        notes: notes || null,
      },
    });

    // 2. Create the active monthly subscription template (represented as a recurring Quote)
    if (packageName && packagePrice) {
      await prisma.quote.create({
        data: {
          leadId: lead.id,
          invoiceNo: `SUB-${new Date().getFullYear()}-${Math.floor(Math.random() * 90000 + 10000)}`,
          status: "accepted", // Accepted subscription template
          subtotal: Number(packagePrice),
          tax: 0,
          labourFee: 0,
          total: Number(packagePrice),
          recurring: true,
          recurrence: "monthly",
          notes: `Monthly recurring package: ${packageName}`,
          lineItems: {
            create: [
              {
                name: packageName,
                quantity: 1,
                unitPrice: Number(packagePrice),
                total: Number(packagePrice),
              },
            ],
          },
        },
      });
    }

    return NextResponse.json({ success: true, lead });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
