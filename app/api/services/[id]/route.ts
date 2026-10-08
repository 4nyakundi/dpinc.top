import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prismadb";

// GET /api/services/[id] - Fetch single service details
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const service = await prisma.service.findUnique({
      where: { id },
    });

    if (!service) {
      return NextResponse.json({ success: false, error: "Service not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, service });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch service", details: error.message },
      { status: 500 }
    );
  }
}

// PATCH / PUT /api/services/[id] - Modify & edit existing service
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const existing = await prisma.service.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: "Service not found" }, { status: 404 });
    }

    const updateData: any = {};
    if (body.name !== undefined) updateData.name = String(body.name).trim();
    if (body.category !== undefined) updateData.category = String(body.category).trim();
    if (body.description !== undefined) updateData.description = body.description ? String(body.description).trim() : null;
    if (body.unit !== undefined) updateData.unit = String(body.unit).trim();
    if (body.price !== undefined) updateData.price = parseFloat(body.price) || 0;
    if (body.active !== undefined) updateData.active = Boolean(body.active);
    if (body.code !== undefined && body.code.trim()) updateData.code = String(body.code).trim();

    const updatedService = await prisma.service.update({
      where: { id },
      data: updateData,
    });

    // Sync to CatalogItem if name/price/description/active changed
    try {
      await prisma.catalogItem.upsert({
        where: { name: updatedService.name },
        update: {
          description: updatedService.description,
          price: updatedService.price,
          active: updatedService.active,
        },
        create: {
          name: updatedService.name,
          description: updatedService.description,
          price: updatedService.price,
          active: updatedService.active,
        },
      });
    } catch (e) {
      console.warn("CatalogItem mirror sync:", e);
    }

    // Mirror to XAMPP MySQL dpinc.top_db
    try {
      await fetch(`http://localhost/dpinc.top/api/services.php?id=${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedService),
        signal: AbortSignal.timeout(1200)
      });
    } catch (e) {
      // Background sync quiet
    }

    return NextResponse.json({ success: true, service: updatedService });
  } catch (error: any) {
    console.error("PATCH /api/services/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update service", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/services/[id] - Delete service from SQL database
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existing = await prisma.service.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: "Service not found" }, { status: 404 });
    }

    await prisma.service.delete({
      where: { id },
    });

    // Mirror delete to XAMPP MySQL dpinc.top_db
    try {
      await fetch(`http://localhost/dpinc.top/api/services.php?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        signal: AbortSignal.timeout(1200)
      });
    } catch (e) {
      // Background sync quiet
    }

    return NextResponse.json({
      success: true,
      message: `Service "${existing.name}" successfully deleted.`,
    });
  } catch (error: any) {
    console.error("DELETE /api/services/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete service", details: error.message },
      { status: 500 }
    );
  }
}
