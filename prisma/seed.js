const { PrismaClient } = require("@prisma/client");
const fs = require("node:fs");
const prisma = new PrismaClient();
async function main() {
  const data = JSON.parse(fs.readFileSync("data/site-data.json", "utf8"));
  const proposal = data.commercialProposal;
  const items = [
    ...(data.catalog || []),
    ...proposal.essentialsPackages,
    ...proposal.itemizedServices.map((item, index) => ({ ...item, id: "itm-" + String(index + 1).padStart(2, "0"), name: item.item })),
    ...proposal.annualMaintenanceContracts.map(item => ({ ...item, price: item.annualCost })),
  ];
  // Seed missing catalog entries only; never reset business prices, credentials or customers.
  for (const item of items) {
    if (!Number.isFinite(item.price) || item.price < 0) throw new Error("Invalid catalog price");
    await prisma.catalogItem.upsert({ where: { name: item.name }, update: {}, create: {
      ...(item.id ? { id: item.id } : {}), name: item.name, description: item.description || null, priceMinor: Math.round(item.price * 100),
    } });
  }
}
main().catch(() => { console.error("Catalog seed failed. Check database configuration and catalog data."); process.exitCode = 1; }).finally(() => prisma.$disconnect());
