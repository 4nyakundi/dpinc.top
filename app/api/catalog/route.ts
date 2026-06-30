import { NextResponse } from "next/server";
import { prisma } from "@/lib/prismadb";

export async function GET() {
  try {
    const items = await prisma.catalogItem.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ items });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch catalog items" }, { status: 500 });
  }
}
