const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash("PortReinz12", 10);

  await prisma.admin.upsert({
    where: { username: "admin@dpinc.top" },
    update: { password: adminPassword },
    create: {
      username: "admin@dpinc.top",
      password: adminPassword,
    },
  });

  const catalogItems = [
    {
      name: "Website Design",
      description: "Responsive website design with modern UI and branding.",
      price: 60000,
    },
    {
      name: "Social Media Content",
      description: "Creative media and graphics for campaigns and social channels.",
      price: 25000,
    },
    {
      name: "Network Installation",
      description: "Structured cabling, switches, and secure connectivity setup.",
      price: 40000,
    },
    {
      name: "CCTV Setup",
      description: "Surveillance camera installation with remote access support.",
      price: 50000,
    },
  ];

  for (const item of catalogItems) {
    await prisma.catalogItem.upsert({
      where: { name: item.name },
      update: {
        description: item.description,
        price: item.price,
      },
      create: item,
    });
  }

  await prisma.lead.upsert({
    where: { email: "info@example.com" },
    update: {
      name: "Tech Client",
      phone: "0700000000",
      company: "Example Corp",
      status: "quote_sent",
    },
    create: {
      name: "Tech Client",
      email: "info@example.com",
      phone: "0700000000",
      company: "Example Corp",
      source: "web",
      status: "quote_sent",
      notes: "Existing lead for demo purposes.",
    },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
