const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function main() {
  console.log("Starting SQL Database Seeding for DATA PORT Limited...");

  // 1. Admin account
  const adminPassword = await bcrypt.hash("PortReinz12", 10);
  await prisma.admin.upsert({
    where: { username: "admin@dpinc.top" },
    update: { password: adminPassword },
    create: {
      username: "admin@dpinc.top",
      password: adminPassword,
      role: "admin",
    },
  });
  console.log("✔ Admin account seeded: admin@dpinc.top");

  // 2. All Services Offered
  const servicesData = [
    // Essentials Packages
    {
      code: "PKG-SECURE-OFFICE",
      name: "Secure Office Starter Package",
      category: "Essentials Packages",
      description: "Complete perimeter physical security and managed network baseline: 18-Camera CCTV remote view, Secure WiFi (Staff/Guest SSIDs), and Firewall perimeter defense.",
      unit: "One-Off Investment",
      price: 35000,
      active: true,
    },
    {
      code: "PKG-DIGITAL-LAUNCHPAD",
      name: "Digital Launchpad Package",
      category: "Essentials Packages",
      description: "Rapid customer acquisition bundle: 5-page dynamic responsive website, 1 year cloud hosting with SSL security, and 1 promotional motion graphic video (30s).",
      unit: "One-Off Investment",
      price: 30000,
      active: true,
    },

    // Network & Hardware Infrastructure
    {
      code: "NET-FIREWALL-01",
      name: "Small Business Firewall & Security Configuration",
      category: "Network & Infrastructure",
      description: "Enterprise security filtering rules, port protection, intrusion mitigation, and traffic policing.",
      unit: "Per Setup",
      price: 10000,
      active: true,
    },
    {
      code: "NET-WIFI-AP",
      name: "Long-Range High-Density WiFi Access Point Setup",
      category: "Network & Infrastructure",
      description: "Commercial high-density dual-band ceiling/wall AP deployment with installation, VLAN tagging & guest isolation.",
      unit: "Per Unit",
      price: 35000,
      active: true,
    },
    {
      code: "FBR-SPLICING-01",
      name: "Optical Fiber Drop Cable Splicing & NOC Termination",
      category: "Network & Infrastructure",
      description: "Fusion splicing, optical loss dBm testing, patch tray termination, and drop link activation.",
      unit: "Per Setup",
      price: 35000,
      active: true,
    },
    {
      code: "FBR-ONT-ROUTER",
      name: "Huawei / ZTE Dual-Band Gigabit ONT Optical WiFi Router",
      category: "Network & Infrastructure",
      description: "High-power GPON/EPON ONT terminal with dual-band 2.4/5GHz Wi-Fi 6 capabilities and Gigabit Ethernet ports.",
      unit: "Per Unit",
      price: 4500,
      active: true,
    },
    {
      code: "NET-STATIC-IP",
      name: "Dedicated Static Public IPv4 Address Allocation",
      category: "Network & Infrastructure",
      description: "Wholesale routed static IPv4 allocation for servers, CCTV NVR remote viewing, and VPN gateways.",
      unit: "Per Month",
      price: 1500,
      active: true,
    },
    {
      code: "NET-LAN-CABLING",
      name: "Structured LAN Cabling & 24-Port Patch Panel Dressing",
      category: "Network & Infrastructure",
      description: "Cat6 UTP cabling across industrial conduits, wall plate punch-downs, rack mount cabinet cable dressing & fluked testing.",
      unit: "Per Installation",
      price: 42500,
      active: true,
    },
    {
      code: "SEC-CCTV-18CAM",
      name: "18-Camera IP CCTV Surveillance & 4K NVR Setup",
      category: "Security & Surveillance",
      description: "4MP Hikvision/Dahua night-vision dome & bullet cameras, 32-channel 4K NVR with 8TB surveillance HDD, 24-Port PoE Switch, and mobile app sync.",
      unit: "Turnkey Setup",
      price: 165000,
      active: true,
    },
    {
      code: "SEC-CCTV-STD",
      name: "HD IP CCTV Surveillance Camera Installation & NVR Setup (Standard)",
      category: "Security & Surveillance",
      description: "Commercial IP camera installation, conduit routing, cloud P2P access configuration, and recording scheduling.",
      unit: "Per Setup",
      price: 15000,
      active: true,
    },

    // Creative, Media & Web Development
    {
      code: "DEV-WEB-5PAGE",
      name: "Dynamic Modern Website (5 Custom Responsive Pages)",
      category: "Development & Creative",
      description: "Tailored UI/UX design, mobile responsiveness, contact forms, interactive portfolio, and SEO performance optimization.",
      unit: "One-Off Project",
      price: 30000,
      active: true,
    },
    {
      code: "DEV-WEB-CUSTOM",
      name: "Web Creation & Design - Full Stacks Creation (JSON/CSS/React)",
      category: "Development & Creative",
      description: "Complete full-stack website creation, modern frameworks, interactive UI elements, and custom CSS styling.",
      unit: "Lifetime",
      price: 10000,
      active: true,
    },
    {
      code: "DEV-APP-CUSTOM",
      name: "Custom Web App / Business ERP Billing Automation System",
      category: "Development & Creative",
      description: "Bespoke internal management portal, billing engine, automated receipts, client CRM & database synchronization.",
      unit: "Starting Price",
      price: 40000,
      active: true,
    },
    {
      code: "DEV-MOTION-AD",
      name: "Motion Graphics Ad Video (30s High-Retention Reel)",
      category: "Development & Creative",
      description: "High-impact social media motion graphics reel, corporate audio mixing, 4K rendering, and format optimization for Instagram/TikTok/LinkedIn.",
      unit: "Per Video",
      price: 20000,
      active: true,
    },
    {
      code: "DEV-DOMAIN-REG",
      name: "Domain Name Registration (Company .co.ke / .com)",
      category: "Development & Creative",
      description: "Official DNS registration, registry verification, WHOIS protection, and nameserver delegation.",
      unit: "1 Year",
      price: 2500,
      active: true,
    },
    {
      code: "DEV-HOSTING-SILVER",
      name: "Domain Cloud Hosting (TrueHost Silver High-Speed)",
      category: "Development & Creative",
      description: "SSD cloud storage, unlimited cPanel bandwidth, 99.9% uptime SLA, corporate mailboxes, and automated daily backups.",
      unit: "1 Year",
      price: 4300,
      active: true,
    },
    {
      code: "DEV-SSL-SECURITY",
      name: "Web Security & Debugging & SSL Security Certificate (Ask SSL)",
      category: "Development & Creative",
      description: "256-bit RSA encryption certificate, vulnerability audit, code sanitization, and HTTPS forcing.",
      unit: "1 Year",
      price: 1800,
      active: true,
    },
    {
      code: "SRV-WIN-AD",
      name: "Windows Server Setup + Active Directory Domain Controller",
      category: "Systems & Servers",
      description: "Windows Server deployment, Active Directory user hierarchy, Group Policies (GPO), and file sharing permissions.",
      unit: "Service Only",
      price: 45000,
      active: true,
    },

    // Annual Maintenance Contracts (AMC Retainers)
    {
      code: "AMC-STANDARD",
      name: "Annual Maintenance Contract (AMC) - Standard Plan",
      category: "Maintenance & AMC Retainers",
      description: "Support Mon–Fri (8:30–18:00), 4-hour SLA response, 1 monthly preventive on-site inspection, Network & PC support.",
      unit: "Per Year",
      price: 70000,
      active: true,
    },
    {
      code: "AMC-PREMIUM",
      name: "Annual Maintenance Contract (AMC) - Corporate Premium Plan",
      category: "Maintenance & AMC Retainers",
      description: "24/7 Remote NOC support, 1-hour priority SLA, unlimited remote helpdesk, 2 monthly on-site visits, Full Infrastructure & DevOps.",
      unit: "Per Year",
      price: 90000,
      active: true,
    },
    {
      code: "AMC-HOURLY",
      name: "On-Demand Technical Callout & Emergency Incident Support",
      category: "Maintenance & AMC Retainers",
      description: "Ad-hoc technical field assistance, diagnostics, fiber repairs, or emergency server recovery (Minimum 2 hours per callout).",
      unit: "Per Hour",
      price: 2500,
      active: true,
    },

    // ISP Internet Bandwidth Subscriptions
    {
      code: "ISP-FIBER-25M",
      name: "DataPort NET Public IP (25 mbps Dedicated)",
      category: "Internet Bandwidth",
      description: "25 Mbps symmetrical optical fiber link with dedicated public IPv4 address and unshaped peering.",
      unit: "Per Month",
      price: 3000,
      active: true,
    },
    {
      code: "ISP-FIBER-15M",
      name: "Home Fiber Fast 15 Mbps",
      category: "Internet Bandwidth",
      description: "15 Mbps unlimited residential fiber internet with low-latency streaming and gaming optimization.",
      unit: "Per Month",
      price: 3500,
      active: true,
    },
    {
      code: "ISP-FIBER-20M",
      name: "Essential 20 Mbps Office Fiber",
      category: "Internet Bandwidth",
      description: "20 Mbps low-jitter business connectivity engineered for cloud ERP, video conferencing, and POS terminals.",
      unit: "Per Month",
      price: 5500,
      active: true,
    },
    {
      code: "ISP-FIBER-30M",
      name: "Dedicated 30 Mbps Business Pro",
      category: "Internet Bandwidth",
      description: "30 Mbps high-throughput commercial fiber connection with priority gateway routing and 99.5% uptime SLA.",
      unit: "Per Month",
      price: 8500,
      active: true,
    },
    {
      code: "ISP-FIBER-40M",
      name: "Creative High-Upload 40 Mbps",
      category: "Internet Bandwidth",
      description: "40 Mbps high-upload fiber pipe designed for multimedia production, creative studios, and bulk asset uploads.",
      unit: "Per Month",
      price: 9500,
      active: true,
    },
    {
      code: "ISP-FIBER-50M",
      name: "Dedicated 50 Mbps Enterprise Fiber",
      category: "Internet Bandwidth",
      description: "50 Mbps dedicated symmetrical enterprise optical trunk for hospitality, corporate centers, and high-density user facilities.",
      unit: "Per Month",
      price: 12500,
      active: true,
    },
  ];

  for (const s of servicesData) {
    const service = await prisma.service.upsert({
      where: { code: s.code },
      update: {
        name: s.name,
        category: s.category,
        description: s.description,
        unit: s.unit,
        price: s.price,
        active: s.active,
      },
      create: s,
    });

    // Also sync to CatalogItem for legacy compatibility
    await prisma.catalogItem.upsert({
      where: { name: s.name },
      update: {
        description: s.description,
        price: s.price,
        active: s.active,
      },
      create: {
        name: s.name,
        description: s.description,
        price: s.price,
        active: s.active,
      },
    });
  }
  console.log(`✔ Seeded ${servicesData.length} comprehensive services & catalog items`);

  // 3. Subscribers / Clients (Leads)
  const subscribersData = [
    {
      name: "Mombasa Ocean View Suites",
      company: "Ocean View Hospitality Ltd",
      phone: "+254 712 345 678",
      email: "management@oceanview.co.ke",
      package: "Dedicated 50 Mbps Enterprise Fiber",
      speed: "50 mbps",
      monthlyRate: 12500,
      billingDay: 1,
      location: "Nyali Beach Road, Mombasa",
      ipAddress: "197.232.44.12",
      status: "subscriber",
    },
    {
      name: "Crown Logistics Hub",
      company: "Crown Global Forwarders",
      phone: "+254 722 987 654",
      email: "operations@crownlogistics.com",
      package: "Dedicated 30 Mbps Business Pro",
      speed: "30 mbps",
      monthlyRate: 8500,
      billingDay: 1,
      location: "Mbaraki Port Area, Mombasa",
      ipAddress: "197.232.44.18",
      status: "subscriber",
    },
    {
      name: "Dr. Sarah Kimani Dental Clinic",
      company: "Kimani Healthcare Group",
      phone: "+254 733 112 233",
      email: "reception@kimanidental.co.ke",
      package: "Essential 20 Mbps Office Fiber",
      speed: "20 mbps",
      monthlyRate: 5500,
      billingDay: 5,
      location: "Digo Road, CBD, Mombasa",
      ipAddress: "197.232.44.25",
      status: "subscriber",
    },
    {
      name: "Apex Creative Studio",
      company: "Apex Media House",
      phone: "+254 701 445 566",
      email: "accounts@apexcreative.co.ke",
      package: "Creative High-Upload 40 Mbps",
      speed: "40 mbps",
      monthlyRate: 9500,
      billingDay: 10,
      location: "Bamburi Mtambo, Mombasa",
      ipAddress: "197.232.44.33",
      status: "subscriber",
    },
    {
      name: "Tudor Heights Apartment 4B",
      company: "Residential Subscriber",
      phone: "+254 790 964 002",
      email: "resident4b@tudorheights.ke",
      package: "Home Fiber Fast 15 Mbps",
      speed: "15 mbps",
      monthlyRate: 3500,
      billingDay: 15,
      location: "Tudor, Mombasa",
      ipAddress: "197.232.44.41",
      status: "subscriber",
    },
    {
      name: "Coast Marine Spares",
      company: "Coast Marine Engineering",
      phone: "+254 720 778 899",
      email: "info@coastmarine.co.ke",
      package: "Dedicated 30 Mbps Business Pro",
      speed: "30 mbps",
      monthlyRate: 8500,
      billingDay: 20,
      location: "Shimanzi Industrial Area, Mombasa",
      ipAddress: "197.232.44.52",
      status: "subscriber",
    },
    {
      name: "Shani Chai",
      company: "Shani Chai Operations",
      phone: "0795 917 066",
      email: "shanichai@dpinc.co.ke",
      package: "DataPort NET Public IP (25 mbps)",
      speed: "25 mbps",
      monthlyRate: 3000,
      billingDay: 9,
      location: "VOK Bombolulu",
      ipAddress: "197.232.44.60",
      status: "subscriber",
    },
    {
      name: "Tracy Wangari",
      company: "General Client",
      phone: "0722 000 111",
      email: "tracy.wangari@domain.com",
      location: "Mombasa",
      status: "new",
    },
  ];

  for (const c of subscribersData) {
    await prisma.lead.upsert({
      where: { email: c.email },
      update: c,
      create: c,
    });
  }
  console.log(`✔ Seeded ${subscribersData.length} subscribers & clients`);

  // 4. Invoices & Itemized Records
  const invoicesData = [
    {
      invoiceNo: "#007/26",
      docType: "Invoice",
      clientType: "subscriber",
      clientName: "Shani Chai",
      phone: "0795 917 066",
      email: "shanichai@dpinc.co.ke",
      location: "VOK Bombolulu",
      status: "paid",
      issueDate: new Date("2026-02-09"),
      dueDate: new Date("2026-02-14"),
      billingPeriod: "February 2026",
      subtotal: 3000,
      total: 3000,
      totalPaid: 3000,
      balanceDue: 0,
      hasPaymentPlan: false,
      notes: "Thank you for prompt payment via M-Pesa.",
      validityNote: "Thank you!",
      paidAt: new Date("2026-02-09T10:00:00Z"),
      items: [
        { title: "DataPort NET Public IP", qty: "25 mbps", rate: 3000, total: 3000 }
      ]
    },
    {
      invoiceNo: "10.23/26",
      docType: "Proforma Invoice",
      clientType: "general",
      clientName: "Tracy Wangari",
      phone: "0722 000 111",
      email: "tracy.wangari@domain.com",
      location: "Mombasa",
      status: "partial",
      issueDate: new Date("2025-01-16"),
      dueDate: new Date("2025-01-30"),
      billingPeriod: "January 2025",
      subtotal: 18600,
      total: 18600,
      totalPaid: 5000,
      balanceDue: 13600,
      hasPaymentPlan: true,
      depositAmount: 5000,
      depositLabel: "1 ST Installment",
      notes: "Deposit received. Final balance due upon web delivery.",
      validityNote: "Please Note: Valid for 14 days from date.",
      items: [
        { title: "Domain Name Registaration. (Company).", qty: "1 Year", rate: 2500, total: 2500 },
        { title: "Domain Hosting (TrueHost Silver).", qty: "1 Year", rate: 4300, total: 4300 },
        { title: "Web Security & Debugging & SSL Security (Ask SSL)", qty: "1 Year", rate: 1800, total: 1800 },
        { title: "Web Creation & Design - Full Stacks Creation (JSON/CSS)", qty: "Lifetime", rate: 10000, total: 10000 },
      ]
    },
    {
      invoiceNo: "PROF-2026-0089",
      docType: "Proforma Invoice",
      clientType: "subscriber",
      clientName: "Mombasa Ocean View Suites",
      phone: "+254 712 345 678",
      email: "management@oceanview.co.ke",
      location: "Nyali Beach Road, Mombasa",
      status: "paid",
      issueDate: new Date("2026-09-01"),
      dueDate: new Date("2026-09-05"),
      billingPeriod: "September 2026",
      subtotal: 12500,
      total: 12500,
      totalPaid: 12500,
      balanceDue: 0,
      hasPaymentPlan: false,
      notes: "Dedicated 50 Mbps Enterprise Fiber subscription.",
      validityNote: "Valid for 14 days.",
      paidAt: new Date("2026-09-01T08:30:00Z"),
      items: [
        { title: "Dedicated 50 Mbps Enterprise Fiber", qty: "50 mbps", rate: 12500, total: 12500 }
      ]
    },
    {
      invoiceNo: "PROF-2026-0090",
      docType: "Proforma Invoice",
      clientType: "subscriber",
      clientName: "Crown Logistics Hub",
      phone: "+254 722 987 654",
      email: "operations@crownlogistics.com",
      location: "Mbaraki Port Area, Mombasa",
      status: "paid",
      issueDate: new Date("2026-09-01"),
      dueDate: new Date("2026-09-05"),
      billingPeriod: "September 2026",
      subtotal: 8500,
      total: 8500,
      totalPaid: 8500,
      balanceDue: 0,
      hasPaymentPlan: false,
      notes: "Dedicated 30 Mbps Business Pro subscription.",
      validityNote: "Valid for 14 days.",
      paidAt: new Date("2026-09-01T10:15:00Z"),
      items: [
        { title: "Dedicated 30 Mbps Business Pro", qty: "30 mbps", rate: 8500, total: 8500 }
      ]
    },
    {
      invoiceNo: "PROF-2026-0091",
      docType: "Proforma Invoice",
      clientType: "subscriber",
      clientName: "Dr. Sarah Kimani Dental Clinic",
      phone: "+254 733 112 233",
      email: "reception@kimanidental.co.ke",
      location: "Digo Road, CBD, Mombasa",
      status: "paid",
      issueDate: new Date("2026-09-05"),
      dueDate: new Date("2026-09-10"),
      billingPeriod: "September 2026",
      subtotal: 5500,
      total: 5500,
      totalPaid: 5500,
      balanceDue: 0,
      hasPaymentPlan: false,
      notes: "Essential 20 Mbps Office Fiber subscription.",
      validityNote: "Valid for 14 days.",
      paidAt: new Date("2026-09-05T14:20:00Z"),
      items: [
        { title: "Essential 20 Mbps Office Fiber", qty: "20 mbps", rate: 5500, total: 5500 }
      ]
    },
    {
      invoiceNo: "PROF-2026-0092",
      docType: "Proforma Invoice",
      clientType: "subscriber",
      clientName: "Apex Creative Studio",
      phone: "+254 701 445 566",
      email: "accounts@apexcreative.co.ke",
      location: "Bamburi Mtambo, Mombasa",
      status: "paid",
      issueDate: new Date("2026-09-10"),
      dueDate: new Date("2026-09-15"),
      billingPeriod: "September 2026",
      subtotal: 9500,
      total: 9500,
      totalPaid: 9500,
      balanceDue: 0,
      hasPaymentPlan: false,
      notes: "Creative High-Upload 40 Mbps subscription.",
      validityNote: "Valid for 14 days.",
      paidAt: new Date("2026-09-10T11:00:00Z"),
      items: [
        { title: "Creative High-Upload 40 Mbps", qty: "40 mbps", rate: 9500, total: 9500 }
      ]
    },
    {
      invoiceNo: "PROF-2026-0093",
      docType: "Proforma Invoice",
      clientType: "subscriber",
      clientName: "Tudor Heights Apartment 4B",
      phone: "+254 790 964 002",
      email: "resident4b@tudorheights.ke",
      location: "Tudor, Mombasa",
      status: "unpaid",
      issueDate: new Date("2026-09-15"),
      dueDate: new Date("2026-09-20"),
      billingPeriod: "September 2026",
      subtotal: 3500,
      total: 3500,
      totalPaid: 0,
      balanceDue: 3500,
      hasPaymentPlan: false,
      notes: "Home Fiber Fast 15 Mbps residential subscription.",
      validityNote: "Valid for 14 days.",
      items: [
        { title: "Home Fiber Fast 15 Mbps", qty: "15 mbps", rate: 3500, total: 3500 }
      ]
    },
    {
      invoiceNo: "PROF-2026-0094",
      docType: "Proforma Invoice",
      clientType: "subscriber",
      clientName: "Coast Marine Spares",
      phone: "+254 720 778 899",
      email: "info@coastmarine.co.ke",
      location: "Shimanzi Industrial Area, Mombasa",
      status: "unpaid",
      issueDate: new Date("2026-09-20"),
      dueDate: new Date("2026-09-25"),
      billingPeriod: "September 2026",
      subtotal: 8500,
      total: 8500,
      totalPaid: 0,
      balanceDue: 8500,
      hasPaymentPlan: false,
      notes: "Dedicated 30 Mbps Business Pro subscription.",
      validityNote: "Valid for 14 days.",
      items: [
        { title: "Dedicated 30 Mbps Business Pro", qty: "30 mbps", rate: 8500, total: 8500 }
      ]
    },
    {
      invoiceNo: "INV-2026-0089",
      docType: "Invoice",
      clientType: "general",
      clientName: "Mombasa Ocean View Suites",
      phone: "+254 712 345 678",
      email: "management@oceanview.co.ke",
      location: "Nyali Beach Road, Mombasa",
      status: "paid",
      issueDate: new Date("2026-09-15"),
      dueDate: new Date("2026-09-15"),
      billingPeriod: "September 2026",
      subtotal: 165000,
      total: 165000,
      totalPaid: 165000,
      balanceDue: 0,
      hasPaymentPlan: false,
      notes: "Settlement for 18-Camera IP CCTV & 4K NVR Installation Project.",
      validityNote: "Official Tax Invoice",
      paidAt: new Date("2026-09-15T15:00:00Z"),
      items: [
        { title: "4MP Hikvision Dome Cameras", qty: "18", rate: 3500, total: 63000 },
        { title: "32-Channel 4K NVR + 8TB SkyHawk HDD", qty: "1", rate: 42000, total: 42000 },
        { title: "Cat6 Outdoor UTP Cable Roll (305m)", qty: "2", rate: 8500, total: 17000 },
        { title: "24-Port Gigabit PoE Switch", qty: "1", rate: 18000, total: 18000 },
        { title: "Turnkey Technician Labor & Cloud Config", qty: "1 Setup", rate: 25000, total: 25000 },
      ]
    }
  ];

  for (const inv of invoicesData) {
    const { items, ...invMeta } = inv;
    
    // Find or create
    const existing = await prisma.invoice.findUnique({
      where: { invoiceNo: invMeta.invoiceNo }
    });

    let currentInvoice;
    if (existing) {
      currentInvoice = await prisma.invoice.update({
        where: { invoiceNo: invMeta.invoiceNo },
        data: invMeta
      });
      // Delete old items and recreate
      await prisma.invoiceItem.deleteMany({
        where: { invoiceId: currentInvoice.id }
      });
    } else {
      currentInvoice = await prisma.invoice.create({
        data: invMeta
      });
    }

    // Insert items
    for (const item of items) {
      await prisma.invoiceItem.create({
        data: {
          invoiceId: currentInvoice.id,
          title: item.title,
          qty: String(item.qty),
          rate: Number(item.rate),
          total: Number(item.total),
        }
      });
    }
  }
  console.log(`✔ Seeded ${invoicesData.length} invoices with itemized line items`);

  // 5. Job Cards (Field Operations)
  const jobCardsData = [
    {
      title: "18-Camera IP CCTV & NVR Setup",
      clientName: "Mombasa Ocean View Suites",
      technician: "Emmanuel Nyakundi (Lead Tech)",
      date: new Date("2026-09-15"),
      status: "completed",
      category: "CCTV Security",
      laborCost: 25000,
      totalCost: 165000,
      notes: "All cameras focused, cloud remote view app configured on manager iPhone & tablet.",
      invoiceGenerated: true,
      invoiceRef: "INV-2026-0089",
      materials: [
        { name: "4MP Hikvision Dome Cameras", qty: 18, unitCost: 3500 },
        { name: "32-Channel 4K NVR + 8TB SkyHawk HDD", qty: 1, unitCost: 42000 },
        { name: "Cat6 Outdoor UTP Cable Roll (305m)", qty: 2, unitCost: 8500 },
        { name: "24-Port Gigabit PoE Switch", qty: 1, unitCost: 18000 }
      ]
    },
    {
      title: "Drop Fiber Splicing & Dual-Band Router Install",
      clientName: "Apex Creative Studio",
      technician: "Ali Hassan (Field Tech)",
      date: new Date("2026-09-17"),
      status: "completed",
      category: "Fiber Deployment",
      laborCost: 3500,
      totalCost: 13800,
      notes: "Optical power reading -18.4 dBm (Optimum range). Latency to IXP 3ms.",
      invoiceGenerated: true,
      invoiceRef: "INV-2026-0091",
      materials: [
        { name: "2-Core Armored Drop Fiber (150m)", qty: 1, unitCost: 4500 },
        { name: "Huawei Dual-Band Gigabit ONT Router", qty: 1, unitCost: 4200 },
        { name: "Fiber Wall Terminal Box + Fast Connectors", qty: 2, unitCost: 800 }
      ]
    },
    {
      title: "Structured LAN Cabling & Rack Dressing",
      clientName: "Crown Logistics Hub",
      technician: "Ali Hassan & Kevin O.",
      date: new Date("2026-09-18"),
      status: "in_progress",
      category: "Structured Cabling",
      laborCost: 15000,
      totalCost: 42500,
      notes: "Cabling running across warehouse conduit. Termination scheduled for completion.",
      invoiceGenerated: false,
      invoiceRef: null,
      materials: [
        { name: "9U Data Cabinet Wall Mount", qty: 1, unitCost: 12500 },
        { name: "24-Port Cat6 Patch Panel", qty: 2, unitCost: 4500 },
        { name: "Cat6 Patch Cords 1m", qty: 24, unitCost: 250 }
      ]
    }
  ];

  for (const job of jobCardsData) {
    const { materials, ...meta } = job;
    const createdJob = await prisma.jobCard.create({ data: meta });
    for (const m of materials) {
      await prisma.jobCardMaterial.create({
        data: {
          jobCardId: createdJob.id,
          name: m.name,
          qty: m.qty,
          unitCost: m.unitCost,
        }
      });
    }
  }
  console.log(`✔ Seeded ${jobCardsData.length} field job cards & materials`);

  // 6. Ledger Entries
  const ledgerData = [
    {
      date: new Date("2026-09-01"),
      description: "Monthly Fiber Subscription - Mombasa Ocean View Suites",
      category: "ISP Subscription Income",
      type: "income",
      amount: 12500,
      paymentMethod: "M-Pesa Paybill",
      reference: "QKD8923KL9",
      entity: "DATA PORT Core"
    },
    {
      date: new Date("2026-09-01"),
      description: "Monthly Fiber Subscription - Crown Logistics Hub",
      category: "ISP Subscription Income",
      type: "income",
      amount: 8500,
      paymentMethod: "Bank Transfer",
      reference: "FT26245892",
      entity: "DATA PORT Core"
    },
    {
      date: new Date("2026-09-03"),
      description: "Upstream Wholesale IP Transit & STM Bandwidth (Liquid/IXP)",
      category: "Wholesale Bandwidth Transit",
      type: "expense",
      amount: 14000,
      paymentMethod: "Bank Wire",
      reference: "LQD-TR-992",
      entity: "NOC Operations"
    },
    {
      date: new Date("2026-09-15"),
      description: "Project Settlement: Ocean View Suites CCTV Installation",
      category: "Projects & Installations",
      type: "income",
      amount: 165000,
      paymentMethod: "Bank Transfer",
      reference: "FT26258901",
      entity: "DATA PORT Projects"
    },
    {
      date: new Date("2026-09-16"),
      description: "Technician Field Allowances & Transport Logistics",
      category: "Field Ops & Logistics",
      type: "expense",
      amount: 6500,
      paymentMethod: "M-Pesa Send Money",
      reference: "QKM3321VV7",
      entity: "Operations"
    }
  ];

  for (const tx of ledgerData) {
    await prisma.ledgerEntry.create({ data: tx });
  }
  console.log(`✔ Seeded ${ledgerData.length} financial ledger transactions`);

  console.log("\n🚀 SQL DATABASE SEEDING COMPLETED SUCCESSFULLY!");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
