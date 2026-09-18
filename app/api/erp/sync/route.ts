import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "data", "erp-data.json");

export async function GET() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const fileData = fs.readFileSync(DATA_FILE, "utf-8");
      return NextResponse.json(JSON.parse(fileData));
    }
    return NextResponse.json({ error: "ERP Data file not found" }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to read ERP data", details: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    body.lastUpdated = new Date().toISOString();
    
    // Ensure data directory exists
    const dataDir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    fs.writeFileSync(DATA_FILE, JSON.stringify(body, null, 2), "utf-8");
    return NextResponse.json({ success: true, message: "ERP data synced successfully", lastUpdated: body.lastUpdated });
  } catch (error) {
    return NextResponse.json({ error: "Failed to persist ERP data", details: String(error) }, { status: 500 });
  }
}
