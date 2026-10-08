import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prismadb";

// GET /api/services - Retrieve all services offered with optional category filter
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    const where: any = {};
    if (category && category !== "all") {
      where.category = category;
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { code: { contains: search } },
      ];
    }

    const services = await prisma.service.findMany({
      where,
      orderBy: [{ category: "asc" }, { price: "asc" }],
    });

    return NextResponse.json({ success: true, count: services.length, services });
  } catch (error: any) {
    console.error("GET /api/services error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch services", details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/services - Create a new service in the SQL database
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, category, description, unit, price, active, code } = body;

    if (!name || price === undefined || price === null) {
      return NextResponse.json(
        { success: false, error: "Service name and price are required." },
        { status: 400 }
      );
    }

    const serviceCode = code || `SRV-${Date.now().toString().slice(-6)}`;
    const numPrice = parseFloat(price) || 0;

    const newService = await prisma.service.create({
      data: {
        code: serviceCode,
        name: String(name).trim(),
        category: category ? String(category).trim() : "General",
        description: description ? String(description).trim() : null,
        unit: unit ? String(unit).trim() : "Per Project",
        price: numPrice,
        active: active !== undefined ? Boolean(active) : true,
      },
    });

    // Also mirror to CatalogItem for quote generator compatibility
    try {
      await prisma.catalogItem.upsert({
        where: { name: newService.name },
        update: {
          description: newService.description,
          price: newService.price,
          active: newService.active,
        },
        create: {
          name: newService.name,
          description: newService.description,
          price: newService.price,
          active: newService.active,
        },
      });
    } catch (e) {
      console.warn("CatalogItem mirror notice:", e);
    }

    // Mirror to XAMPP MySQL dpinc.top_db
    try {
      await fetch("http://localhost/dpinc.top/api/services.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newService),
        signal: AbortSignal.timeout(1200)
      });
    } catch (e) {
      // Background sync quiet
    }

    return NextResponse.json({ success: true, service: newService }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/services error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create service", details: error.message },
      { status: 500 }
    );
  }
}
