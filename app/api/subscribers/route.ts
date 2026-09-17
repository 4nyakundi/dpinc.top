import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { z } from "zod";
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

const subscriberSchema = z.object({
  name: z.string().min(1, { message: "Client name is required" }),
  email: z.string().email({ message: "Invalid email address" }).optional().or(z.literal('')),
  phone: z.string().optional(),
  company: z.string().optional(),
  packageName: z.string().min(1),
  packagePrice: z.string().refine(val => !isNaN(parseFloat(val)), { message: "Package price must be a number" }),
  notes: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const auth = verifyAuth(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validation = subscriberSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { name, email, phone, company, packageName, packagePrice, notes } = validation.data;
    const price = Number(packagePrice);

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create or update the Lead with status "subscriber"
      const lead = await tx.lead.create({
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
      await tx.quote.create({
        data: {
          leadId: lead.id,
          invoiceNo: `SUB-${new Date().getFullYear()}-${Math.floor(Math.random() * 90000 + 10000)}`,
          status: "accepted", // Accepted subscription template
          subtotal: price,
          tax: 0,
          labourFee: 0,
          total: price,
          recurring: true,
          recurrence: "monthly",
          notes: `Monthly recurring package: ${packageName}`,
          lineItems: {
            create: [{ name: packageName, quantity: 1, unitPrice: price, total: price }],
          },
        },
      });

      return lead;
    });

    return NextResponse.json({ success: true, lead: result });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
