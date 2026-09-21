/**
 * DATA PORT LIMITED - Unified Master Operations & Financial ERP Engine
 * Modules: NOC Billing Calendar, Client CRM, Field Job Cards, Financial General Ledger, P&L Analytics & Executive Vault
 * Stack: Vanilla JavaScript (ES6+), HTML5 Canvas, JSON Sync & LocalStorage Cache
 * Authentication: user: root | pass: admin4all2 | Vault PIN: 4422 | M-Pesa Paybill: 247247
 */

(function () {
  "use strict";

  const AUTH_USER = "root";
  const AUTH_PASS = "admin4all2";
  const VAULT_DEFAULT_PIN = "4422";

  const STORAGE_KEYS = {
    SESSION: "dp_erp_session",
    VAULT_UNLOCKED: "dp_vault_unlocked",
    ERP_DATA: "dp_erp_master_data_v2"
  };

  const PACKAGE_RATES = {
    "5 Mbps SOHO Fiber": 2500,
    "10 Mbps Standard Business": 3500,
    "15 Mbps Home Fiber Fast": 3500,
    "20 Mbps Pro Office Dedicated": 5500,
    "30 Mbps Dedicated Business Pro": 8500,
    "40 Mbps Creative High-Upload": 9500,
    "50 Mbps High-Capacity Enterprise": 12500,
    "Custom Plan": 5000
  };

  // Complete Embedded Default Seed Dataset (Zero-dependency fallback for file:// and offline use)
  const INITIAL_ERP_DATA = {
    version: "2.5.0",
    lastUpdated: new Date().toISOString(),
    subscribers: [
      {
        id: "sub-101",
        name: "Mombasa Ocean View Suites",
        company: "Ocean View Hospitality Ltd",
        phone: "+254 712 345 678",
        email: "management@oceanview.co.ke",
        package: "50 Mbps High-Capacity Enterprise",
        monthlyRate: 12500,
        billingDay: 1,
        location: "Nyali Beach Road, Mombasa",
        ipAddress: "197.232.44.12",
        pppoeUser: "oceanview_resort",
        pppoePass: "dp@ocean#2026",
        routerModel: "MikroTik RB4011 / Port 1",
        status: "active",
        joinedDate: "2024-01-15"
      },
      {
        id: "sub-102",
        name: "Crown Logistics Hub",
        company: "Crown Global Forwarders",
        phone: "+254 722 987 654",
        email: "operations@crownlogistics.com",
        package: "30 Mbps Dedicated Business Pro",
        monthlyRate: 8500,
        billingDay: 1,
        location: "Mbaraki Port Area, Mombasa",
        ipAddress: "197.232.44.18",
        pppoeUser: "crown_logistics_hq",
        pppoePass: "dp@crown#2026",
        routerModel: "Huawei Dual-Band ONT / Port 1",
        status: "active",
        joinedDate: "2024-03-10"
      },
      {
        id: "sub-103",
        name: "Dr. Sarah Kimani Dental Clinic",
        company: "Kimani Healthcare Group",
        phone: "+254 733 112 233",
        email: "reception@kimanidental.co.ke",
        package: "20 Mbps Pro Office Dedicated",
        monthlyRate: 5500,
        billingDay: 5,
        location: "Digo Road, CBD, Mombasa",
        ipAddress: "197.232.44.25",
        pppoeUser: "kimani_dental_cbd",
        pppoePass: "dp@kimani#2026",
        routerModel: "Huawei HG8245H5 ONT",
        status: "active",
        joinedDate: "2024-06-01"
      },
      {
        id: "sub-104",
        name: "Apex Creative Studio",
        company: "Apex Media House",
        phone: "+254 701 445 566",
        email: "accounts@apexcreative.co.ke",
        package: "40 Mbps Creative High-Upload",
        monthlyRate: 9500,
        billingDay: 10,
        location: "Bamburi Mtambo, Mombasa",
        ipAddress: "197.232.44.33",
        pppoeUser: "apex_creative_media",
        pppoePass: "dp@apex#2026",
        routerModel: "Huawei AX3 Dual Band Router",
        status: "active",
        joinedDate: "2024-08-12"
      },
      {
        id: "sub-105",
        name: "Tudor Heights Apartment 4B",
        company: "Residential Subscriber",
        phone: "+254 790 964 002",
        email: "resident4b@tudorheights.ke",
        package: "15 Mbps Home Fiber Fast",
        monthlyRate: 3500,
        billingDay: 15,
        location: "Tudor, Mombasa",
        ipAddress: "197.232.44.41",
        pppoeUser: "tudor_apt4b",
        pppoePass: "dp@tudor4b#2026",
        routerModel: "ZTE F670L Gigabit ONT",
        status: "active",
        joinedDate: "2025-01-05"
      },
      {
        id: "sub-106",
        name: "Coast Marine Spares",
        company: "Coast Marine Engineering",
        phone: "+254 720 778 899",
        email: "info@coastmarine.co.ke",
        package: "30 Mbps Dedicated Business Pro",
        monthlyRate: 8500,
        billingDay: 20,
        location: "Shimanzi Industrial Area, Mombasa",
        ipAddress: "197.232.44.52",
        pppoeUser: "coast_marine_ops",
        pppoePass: "dp@marine#2026",
        routerModel: "Huawei ONT Dual-Band",
        status: "active",
        joinedDate: "2025-02-18"
      }
    ],
    jobCards: [
      {
        id: "job-101",
        title: "18-Camera IP CCTV & NVR Setup",
        clientName: "Mombasa Ocean View Suites",
        technician: "Emmanuel Nyakundi (Lead Tech)",
        date: "2026-09-15",
        status: "completed",
        category: "CCTV Security",
        materials: [
          { name: "4MP Hikvision Dome Cameras", qty: 18, unitCost: 3500 },
          { name: "32-Channel 4K NVR + 8TB SkyHawk HDD", qty: 1, unitCost: 42000 },
          { name: "Cat6 Outdoor UTP Cable Roll (305m)", qty: 2, unitCost: 8500 },
          { name: "24-Port Gigabit PoE Switch", qty: 1, unitCost: 18000 }
        ],
        laborCost: 25000,
        totalCost: 165000,
        notes: "All cameras focused, cloud remote view app configured on manager iPhone & tablet.",
        invoiceGenerated: true,
        invoiceRef: "INV-2026-0089"
      },
      {
        id: "job-102",
        title: "Drop Fiber Splicing & Dual-Band Router Install",
        clientName: "Apex Creative Studio",
        technician: "Ali Hassan (Field Tech)",
        date: "2026-09-17",
        status: "completed",
        category: "Fiber Deployment",
        materials: [
          { name: "2-Core Armored Drop Fiber (150m)", qty: 1, unitCost: 4500 },
          { name: "Huawei Dual-Band Gigabit ONT Router", qty: 1, unitCost: 4200 },
          { name: "Fiber Wall Terminal Box + Fast Connectors", qty: 2, unitCost: 800 }
        ],
        laborCost: 3500,
        totalCost: 13800,
        notes: "Optical power reading -18.4 dBm (Optimum range). Latency to IXP 3ms.",
        invoiceGenerated: true,
        invoiceRef: "INV-2026-0091"
      },
      {
        id: "job-103",
        title: "Structured LAN Cabling & Rack Dressing",
        clientName: "Crown Logistics Hub",
        technician: "Ali Hassan & Kevin O.",
        date: "2026-09-18",
        status: "in_progress",
        category: "Structured Cabling",
        materials: [
          { name: "9U Data Cabinet Wall Mount", qty: 1, unitCost: 12500 },
          { name: "24-Port Cat6 Patch Panel", qty: 2, unitCost: 4500 },
          { name: "Cat6 Patch Cords 1m", qty: 24, unitCost: 250 }
        ],
        laborCost: 15000,
        totalCost: 42500,
        notes: "Cabling running across warehouse conduit. Termination scheduled for completion by tomorrow.",
        invoiceGenerated: false,
        invoiceRef: null
      }
    ],
    ledger: [
      {
        id: "tx-101",
        date: "2026-09-01",
        description: "Monthly Fiber Subscription - Mombasa Ocean View Suites",
        category: "ISP Subscription Income",
        type: "income",
        amount: 12500,
        paymentMethod: "M-Pesa Paybill",
        reference: "QKD8923KL9",
        entity: "DATA PORT Core"
      },
      {
        id: "tx-102",
        date: "2026-09-01",
        description: "Monthly Fiber Subscription - Crown Logistics Hub",
        category: "ISP Subscription Income",
        type: "income",
        amount: 8500,
        paymentMethod: "Bank Transfer",
        reference: "FT26245892",
        entity: "DATA PORT Core"
      },
      {
        id: "tx-103",
        date: "2026-09-03",
        description: "Upstream Wholesale IP Transit & STM Bandwidth (Liquid/IXP)",
        category: "Wholesale Bandwidth Transit",
        type: "expense",
        amount: 14000,
        paymentMethod: "Bank Transfer",
        reference: "LQD-TR-992",
        entity: "NOC Operations"
      },
      {
        id: "tx-104",
        date: "2026-09-05",
        description: "Monthly Fiber Subscription - Dr. Sarah Kimani Clinic",
        category: "ISP Subscription Income",
        type: "income",
        amount: 5500,
        paymentMethod: "M-Pesa Paybill",
        reference: "QKF2218NM1",
        entity: "DATA PORT Core"
      },
      {
        id: "tx-105",
        date: "2026-09-08",
        description: "Bulk Fiber Drop Cable & FTTH Optical Accessories Purchase",
        category: "Hardware & Inventory",
        type: "expense",
        amount: 18500,
        paymentMethod: "M-Pesa Paybill",
        reference: "QKH7782AA4",
        entity: "Field Infrastructure"
      },
      {
        id: "tx-106",
        date: "2026-09-10",
        description: "Monthly Fiber Subscription - Apex Creative Studio",
        category: "ISP Subscription Income",
        type: "income",
        amount: 9500,
        paymentMethod: "M-Pesa Paybill",
        reference: "QKJ9923PO8",
        entity: "DATA PORT Core"
      },
      {
        id: "tx-107",
        date: "2026-09-15",
        description: "Project Settlement: Ocean View Suites CCTV Installation",
        category: "Projects & Installations",
        type: "income",
        amount: 165000,
        paymentMethod: "Bank Transfer",
        reference: "FT26258901",
        entity: "DATA PORT Projects"
      },
      {
        id: "tx-108",
        date: "2026-09-16",
        description: "Technician Field Allowances & Transport Logistics",
        category: "Field Ops & Logistics",
        type: "expense",
        amount: 6500,
        paymentMethod: "Petty Cash / Float",
        reference: "QKM3321VV7",
        entity: "Operations"
      }
    ],
    invoices: [
      {
        id: "inv-001",
        invoiceNo: "PROF-2026-0089",
        subId: "sub-101",
        clientName: "Mombasa Ocean View Suites",
        phone: "+254 712 345 678",
        email: "management@oceanview.co.ke",
        package: "50 Mbps High-Capacity Enterprise",
        amount: 12500,
        period: "September 2026",
        dueDate: "1st September 2026",
        status: "paid",
        paidAt: "2026-09-01T08:30:00.000Z",
        jobCardId: null
      },
      {
        id: "inv-002",
        invoiceNo: "PROF-2026-0090",
        subId: "sub-102",
        clientName: "Crown Logistics Hub",
        phone: "+254 722 987 654",
        email: "operations@crownlogistics.com",
        package: "30 Mbps Dedicated Business Pro",
        amount: 8500,
        period: "September 2026",
        dueDate: "1st September 2026",
        status: "paid",
        paidAt: "2026-09-01T10:15:00.000Z",
        jobCardId: null
      },
      {
        id: "inv-003",
        invoiceNo: "PROF-2026-0091",
        subId: "sub-103",
        clientName: "Dr. Sarah Kimani Dental Clinic",
        phone: "+254 733 112 233",
        email: "reception@kimanidental.co.ke",
        package: "20 Mbps Pro Office Dedicated",
        amount: 5500,
        period: "September 2026",
        dueDate: "5th September 2026",
        status: "paid",
        paidAt: "2026-09-05T14:20:00.000Z",
        jobCardId: null
      },
      {
        id: "inv-004",
        invoiceNo: "PROF-2026-0092",
        subId: "sub-104",
        clientName: "Apex Creative Studio",
        phone: "+254 701 445 566",
        email: "accounts@apexcreative.co.ke",
        package: "40 Mbps Creative High-Upload",
        amount: 9500,
        period: "September 2026",
        dueDate: "10th September 2026",
        status: "paid",
        paidAt: "2026-09-10T11:00:00.000Z",
        jobCardId: null
      },
      {
        id: "inv-005",
        invoiceNo: "PROF-2026-0093",
        subId: "sub-105",
        clientName: "Tudor Heights Apartment 4B",
        phone: "+254 790 964 002",
        email: "resident4b@tudorheights.ke",
        package: "15 Mbps Home Fiber Fast",
        amount: 3500,
        period: "September 2026",
        dueDate: "15th September 2026",
        status: "unpaid",
        paidAt: null,
        jobCardId: null
      },
      {
        id: "inv-006",
        invoiceNo: "PROF-2026-0094",
        subId: "sub-106",
        clientName: "Coast Marine Spares",
        phone: "+254 720 778 899",
        email: "info@coastmarine.co.ke",
        package: "30 Mbps Dedicated Business Pro",
        amount: 8500,
        period: "September 2026",
        dueDate: "20th September 2026",
        status: "unpaid",
        paidAt: null,
        jobCardId: null
      }
    ],
    vault: {
      pin: VAULT_DEFAULT_PIN,
      treasuryBalance: 125000,
      taxReserveBalance: 35000,
      emergencyFund: 50000,
      personalDrawingsMonth: 40000,
      allocations: [
        { date: "2026-09-16", description: "Owner Dividend Distribution", amount: 40000, type: "drawing" },
        { date: "2026-09-15", description: "VAT & Withholding Tax Reserve (16%)", amount: 26400, type: "tax_reserve" }
      ]
    },
    rules: [
      { id: "rule-1", name: "Upstream Transit Budget Cap", threshold: 25000, period: "monthly", active: true },
      { id: "rule-2", name: "Minimum Gross Profit Margin (60%)", threshold: 60, unit: "%", active: true },
      { id: "rule-3", name: "Automated WhatsApp Reminder at Due Date - 2 Days", trigger: "due_minus_2", active: true },
      { id: "rule-4", name: "Auto-Split 16% VAT into Tax Vault on Payment Settlement", trigger: "auto_vat_reserve", active: true }
    ]
  };

  // Master State Instance
  let erpState = JSON.parse(JSON.stringify(INITIAL_ERP_DATA));

  let currentYear = 2026;
  let currentMonth = 8; // 8 = September (0-indexed)
  let selectedInvoice = null;
  let enteredPin = "";
  let activeTab = "calendarTab";
  let calendarFilter = "all";

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  /* --- DOM Ready Initialization --- */
  document.addEventListener("DOMContentLoaded", () => {
    initAuth();
  });

  /* =========================================================================
     1. AUTHENTICATION & SESSION CONTROL
     ========================================================================= */
  function initAuth() {
    const loginGate = document.getElementById("loginGate");
    const dashboardApp = document.getElementById("dashboardApp");
    const loginForm = document.getElementById("loginForm");
    const loginError = document.getElementById("loginError");
    const logoutBtn = document.getElementById("logoutBtn");

    const session = localStorage.getItem(STORAGE_KEYS.SESSION);
    if (session === "authenticated") {
      if (loginGate) loginGate.style.display = "none";
      if (dashboardApp) dashboardApp.style.display = "block";
      startMasterERP();
    } else {
      if (loginGate) loginGate.style.display = "flex";
      if (dashboardApp) dashboardApp.style.display = "none";
    }

    if (loginForm) {
      loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const user = document.getElementById("loginUsername").value.trim();
        const pass = document.getElementById("loginPassword").value.trim();

        if (user === AUTH_USER && pass === AUTH_PASS) {
          localStorage.setItem(STORAGE_KEYS.SESSION, "authenticated");
          if (loginError) loginError.style.display = "none";
          if (loginGate) loginGate.style.display = "none";
          if (dashboardApp) dashboardApp.style.display = "block";
          startMasterERP();
          showToast("Welcome to DATA PORT Master Operations & Financial Cockpit!");
        } else {
          if (loginError) {
            loginError.style.display = "block";
            loginError.textContent = "Invalid administrative credentials. Authorized NOC staff only.";
          }
        }
      });
    }

    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        localStorage.removeItem(STORAGE_KEYS.SESSION);
        sessionStorage.removeItem(STORAGE_KEYS.VAULT_UNLOCKED);
        window.location.reload();
      });
    }
  }

  /* =========================================================================
     2. MASTER ERP STARTUP & DATA SYNC
     ========================================================================= */
  async function startMasterERP() {
    startClock();
    await loadDatabase();
    setupTabNavigation();
    setupCalendarNavigation();
    setupBatchInvoicing();
    setupModalsAndEvents();
    setupVaultKeypad();
    setupDirectoryFilters();
    setupLedgerFilters();
    renderAll();
  }

  async function loadDatabase() {
    const cached = localStorage.getItem(STORAGE_KEYS.ERP_DATA);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed && Array.isArray(parsed.subscribers) && parsed.subscribers.length > 0) {
          erpState = parsed;
        } else {
          erpState = JSON.parse(JSON.stringify(INITIAL_ERP_DATA));
          saveDatabase();
        }
      } catch (err) {
        console.error("Error parsing cached ERP data, loading defaults:", err);
        erpState = JSON.parse(JSON.stringify(INITIAL_ERP_DATA));
        saveDatabase();
      }
    } else {
      erpState = JSON.parse(JSON.stringify(INITIAL_ERP_DATA));
      saveDatabase();
    }
  }

  function saveDatabase() {
    try {
      erpState.lastUpdated = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.ERP_DATA, JSON.stringify(erpState));
    } catch (e) {
      console.warn("LocalStorage save error:", e);
    }
  }

  function startClock() {
    const clockEl = document.getElementById("liveKenyaClock");
    if (!clockEl) return;
    const updateTime = () => {
      const now = new Date();
      const options = { timeZone: "Africa/Nairobi", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false };
      clockEl.textContent = `Nairobi: ${now.toLocaleTimeString("en-GB", options)} EAT`;
    };
    updateTime();
    setInterval(updateTime, 1000);
  }

  /* =========================================================================
     3. TAB NAVIGATION CONTROLLER
     ========================================================================= */
  function setupTabNavigation() {
    const tabBtns = document.querySelectorAll(".dash-tab");
    const tabPanes = document.querySelectorAll(".dash-tab-pane");
    const quickActionLabel = document.getElementById("quickActionLabel");

    tabBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const targetTabId = btn.getAttribute("data-tab");
        activeTab = targetTabId;

        tabBtns.forEach(b => b.classList.remove("active"));
        tabPanes.forEach(p => p.classList.remove("active"));

        btn.classList.add("active");
        const targetPane = document.getElementById(targetTabId);
        if (targetPane) targetPane.classList.add("active");

        // Dynamic Quick Action Button Label
        if (quickActionLabel) {
          if (targetTabId === "calendarTab" || targetTabId === "subscribersTab") {
            quickActionLabel.textContent = "Add Client";
          } else if (targetTabId === "jobCardsTab") {
            quickActionLabel.textContent = "Create Job Card";
          } else if (targetTabId === "ledgerTab") {
            quickActionLabel.textContent = "Record Income";
          } else if (targetTabId === "analyticsTab") {
            quickActionLabel.textContent = "Print Report";
          } else if (targetTabId === "vaultTab") {
            quickActionLabel.textContent = "Allocate Treasury";
          }
        }

        if (targetTabId === "analyticsTab") {
          renderAnalytics();
        } else if (targetTabId === "subscribersTab") {
          renderSubscribersTable();
        } else if (targetTabId === "jobCardsTab") {
          renderJobCards();
        } else if (targetTabId === "ledgerTab") {
          renderLedgerTable();
          renderAccountBalances();
        } else if (targetTabId === "calendarTab") {
          renderCalendar();
        } else if (targetTabId === "vaultTab") {
          renderVaultDetails();
        }
      });
    });

    const quickActionBtn = document.getElementById("quickActionBtn");
    if (quickActionBtn) {
      quickActionBtn.addEventListener("click", () => {
        if (activeTab === "calendarTab" || activeTab === "subscribersTab") {
          window.dpOpenAddSubscriber();
        } else if (activeTab === "jobCardsTab") {
          openJobCardModal();
        } else if (activeTab === "ledgerTab") {
          window.dpOpenAddIncome();
        } else if (activeTab === "analyticsTab") {
          window.print();
        } else if (activeTab === "vaultTab") {
          openVaultAllocationModal();
        }
      });
    }

    const openAddSubFromTabBtn = document.getElementById("openAddSubFromTabBtn");
    if (openAddSubFromTabBtn) {
      openAddSubFromTabBtn.addEventListener("click", () => window.dpOpenAddSubscriber());
    }

    const openAddIncomeBtn = document.getElementById("openAddIncomeBtn");
    if (openAddIncomeBtn) {
      openAddIncomeBtn.addEventListener("click", () => window.dpOpenAddIncome());
    }
  }

  /* =========================================================================
     4. UNIFIED METRICS & LIVE ACCOUNT BALANCES
     ========================================================================= */
  function updateOverviewMetrics() {
    const totalSubs = erpState.subscribers ? erpState.subscribers.length : 0;
    
    // MRR from active subscribers
    const mrr = (erpState.subscribers || []).reduce((acc, sub) => acc + (Number(sub.monthlyRate || sub.price) || 0), 0);

    // Current month invoices paid vs unpaid
    const period = `${monthNames[currentMonth]} ${currentYear}`;
    const monthInvoices = (erpState.invoices || []).filter(inv => inv.period && inv.period.includes(monthNames[currentMonth]));
    const paidInvoices = monthInvoices.filter(inv => inv.status === "paid");
    const collectedThisMonth = paidInvoices.reduce((acc, inv) => acc + (Number(inv.amount) || 0), 0);

    // Total income recorded in ledger
    const totalIncome = (erpState.ledger || [])
      .filter(tx => tx.type === "income")
      .reduce((acc, tx) => acc + (Number(tx.amount) || 0), 0);

    // Total expenses recorded in ledger
    const totalExpenses = (erpState.ledger || [])
      .filter(tx => tx.type === "expense")
      .reduce((acc, tx) => acc + (Number(tx.amount) || 0), 0);

    // Wholesale Bandwidth Transit Cost
    const transitCost = (erpState.ledger || [])
      .filter(tx => tx.category && tx.category.toLowerCase().includes("transit"))
      .reduce((acc, tx) => acc + (Number(tx.amount) || 0), 0);

    const netCash = totalIncome - totalExpenses;
    const profitMargin = totalIncome > 0 ? Math.round((netCash / totalIncome) * 100) : 0;

    // Update Overview Header
    const elSubs = document.getElementById("metricTotalSubs");
    const elPaidRatio = document.getElementById("metricPaidRatio");
    const elGross = document.getElementById("metricGrossRevenue");
    const elCollected = document.getElementById("metricCollected");
    const elExpenses = document.getElementById("metricTotalExpenses");
    const elTransit = document.getElementById("metricTransitCost");
    const elMargin = document.getElementById("metricProfitMargin");
    const elNet = document.getElementById("metricNetCash");

    if (elSubs) elSubs.textContent = totalSubs;
    if (elPaidRatio) elPaidRatio.textContent = `${paidInvoices.length}/${monthInvoices.length || totalSubs} Paid`;
    if (elGross) elGross.textContent = `KSh ${mrr.toLocaleString()}`;
    if (elCollected) elCollected.textContent = `Collected: KSh ${collectedThisMonth.toLocaleString()}`;
    if (elExpenses) elExpenses.textContent = `KSh ${totalExpenses.toLocaleString()}`;
    if (elTransit) elTransit.textContent = `Transit: KSh ${transitCost.toLocaleString()}`;
    if (elMargin) elMargin.textContent = `KSh ${netCash.toLocaleString()}`;
    if (elNet) elNet.textContent = `Margin: ${profitMargin}% Net`;

    // Update Tab Counts
    const tabSubs = document.getElementById("tabSubsCount");
    const tabJobs = document.getElementById("tabJobsCount");
    if (tabSubs) tabSubs.textContent = totalSubs;
    if (tabJobs) tabJobs.textContent = erpState.jobCards ? erpState.jobCards.length : 0;

    // Update Breakdown Progress Bars
    const transitPct = totalIncome > 0 ? Math.min(100, Math.round((transitCost / totalIncome) * 100)) : 25;
    const hardwareCost = (erpState.ledger || [])
      .filter(tx => tx.category && tx.category.toLowerCase().includes("hardware"))
      .reduce((acc, tx) => acc + (Number(tx.amount) || 0), 0);
    const hardwarePct = totalIncome > 0 ? Math.min(100, Math.round((hardwareCost / totalIncome) * 100)) : 15;

    const elTransitPct = document.getElementById("transitPercentLabel");
    const elTransitBar = document.getElementById("transitProgressBar");
    const elHardPct = document.getElementById("hardwarePercentLabel");
    const elHardBar = document.getElementById("hardwareProgressBar");
    const elProfPct = document.getElementById("profitPercentLabel");
    const elProfBar = document.getElementById("profitProgressBar");

    if (elTransitPct) elTransitPct.textContent = `${transitPct}%`;
    if (elTransitBar) elTransitBar.style.width = `${transitPct}%`;
    if (elHardPct) elHardPct.textContent = `${hardwarePct}%`;
    if (elHardBar) elHardBar.style.width = `${hardwarePct}%`;
    if (elProfPct) elProfPct.textContent = `${profitMargin}%`;
    if (elProfBar) elProfBar.style.width = `${Math.max(5, profitMargin)}%`;

    renderAccountBalances();
  }

  function renderAccountBalances() {
    // Calculate balances based on ledger transaction methods
    let mpesaBalance = 24500; // base float
    let bankBalance = 168000; // base corporate reserve
    let cashBalance = 12000;  // base petty float

    (erpState.ledger || []).forEach(tx => {
      const amt = Number(tx.amount) || 0;
      const method = (tx.paymentMethod || "").toLowerCase();
      const isInc = tx.type === "income";

      if (method.includes("mpesa") || method.includes("m-pesa") || method.includes("paybill") || method.includes("buy goods")) {
        mpesaBalance += isInc ? amt : -amt;
      } else if (method.includes("bank") || method.includes("transfer") || method.includes("wire")) {
        bankBalance += isInc ? amt : -amt;
      } else {
        cashBalance += isInc ? amt : -amt;
      }
    });

    const totalLiquid = mpesaBalance + bankBalance + cashBalance;

    const elMpesa = document.getElementById("accMpesaBalance");
    const elBank = document.getElementById("accBankBalance");
    const elCash = document.getElementById("accCashBalance");
    const elTotal = document.getElementById("accTotalLiquid");

    if (elMpesa) elMpesa.textContent = `KSh ${mpesaBalance.toLocaleString()}`;
    if (elBank) elBank.textContent = `KSh ${bankBalance.toLocaleString()}`;
    if (elCash) elCash.textContent = `KSh ${cashBalance.toLocaleString()}`;
    if (elTotal) elTotal.textContent = `KSh ${totalLiquid.toLocaleString()}`;
  }

  /* =========================================================================
     5. NOC CALENDAR ENGINE & DAY SCHEDULE
     ========================================================================= */
  function setupCalendarNavigation() {
    const prevBtn = document.getElementById("prevMonthBtn");
    const nextBtn = document.getElementById("nextMonthBtn");
    const todayBtn = document.getElementById("todayBtn");

    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        currentMonth--;
        if (currentMonth < 0) {
          currentMonth = 11;
          currentYear--;
        }
        renderCalendar();
        renderAnalytics();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        currentMonth++;
        if (currentMonth > 11) {
          currentMonth = 0;
          currentYear++;
        }
        renderCalendar();
        renderAnalytics();
      });
    }

    if (todayBtn) {
      todayBtn.addEventListener("click", () => {
        currentYear = 2026;
        currentMonth = 8; // September 2026 default cycle
        renderCalendar();
        renderAnalytics();
      });
    }

    // Calendar Filter Pills (All / Paid / Due / Overdue)
    document.querySelectorAll(".cal-filter-pill").forEach(pill => {
      pill.addEventListener("click", () => {
        document.querySelectorAll(".cal-filter-pill").forEach(p => p.classList.remove("active"));
        pill.classList.add("active");
        calendarFilter = pill.getAttribute("data-cal-filter") || "all";
        renderCalendar();
      });
    });
  }

  function renderCalendar() {
    const grid = document.getElementById("calendarGrid");
    const titleEl = document.getElementById("calendarMonthYearTitle");
    if (!grid || !titleEl) return;

    titleEl.textContent = `${monthNames[currentMonth]} ${currentYear}`;
    grid.innerHTML = "";

    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun
    const adjFirstDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1; // Mon = 0
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();

    const today = new Date();
    const isCurrentMonthNow = today.getFullYear() === currentYear && today.getMonth() === currentMonth;
    const todayDate = 18; // reference day

    // Inactive Days from Previous Month
    for (let i = adjFirstDay - 1; i >= 0; i--) {
      const cell = document.createElement("div");
      cell.className = "calendar-day-cell prev-month-day";
      cell.innerHTML = `<div class="day-header"><span class="day-number">${prevMonthDays - i}</span></div>`;
      grid.appendChild(cell);
    }

    // Active Days in Current Month
    for (let d = 1; d <= daysInMonth; d++) {
      const cell = document.createElement("div");
      cell.className = "calendar-day-cell";
      if (d === todayDate) {
        cell.classList.add("today-cell");
      }

      // Filter subscribers who have billing on this day
      const daySubs = (erpState.subscribers || []).filter(s => Number(s.billingDay) === d);

      let pillsHtml = "";
      daySubs.forEach(sub => {
        const invoice = (erpState.invoices || []).find(inv => 
          (inv.subId === sub.id || inv.clientName === sub.name) && 
          inv.period && inv.period.includes(monthNames[currentMonth])
        );

        const isPaid = invoice ? invoice.status === "paid" : false;
        const isOverdue = !isPaid && d < todayDate;
        const isDueToday = !isPaid && d === todayDate;

        // Apply Calendar Filter
        if (calendarFilter === "paid" && !isPaid) return;
        if (calendarFilter === "due" && (isPaid || isOverdue)) return;
        if (calendarFilter === "overdue" && (!isOverdue || isPaid)) return;

        let statusClass = "pill-upcoming";
        if (isPaid) statusClass = "pill-paid";
        else if (isDueToday) statusClass = "pill-due";
        else if (isOverdue) statusClass = "pill-overdue";

        pillsHtml += `
          <div class="subscriber-pill ${statusClass}" onclick="event.stopPropagation(); window.dpOpenDrawerForSub('${sub.id}')">
            <span class="pill-dot"></span>
            <span class="pill-name">${sub.name}</span>
            <span class="pill-price">KSh ${(sub.monthlyRate || sub.price || 0).toLocaleString()}</span>
          </div>
        `;
      });

      cell.innerHTML = `
        <div class="day-header" onclick="window.dpOpenDayDetailModal(${d})">
          <span class="day-number">${d}</span>
          ${d === todayDate ? '<span class="today-tag">TODAY</span>' : ''}
        </div>
        <div class="day-subscriber-pills">${pillsHtml}</div>
      `;

      cell.addEventListener("click", (e) => {
        if (!e.target.closest(".subscriber-pill")) {
          window.dpOpenDayDetailModal(d);
        }
      });

      grid.appendChild(cell);
    }

    if (window.lucide) window.lucide.createIcons();
  }

  /* =========================================================================
     6. BATCH INVOICING & PROFORMA ENGINE
     ========================================================================= */
  function setupBatchInvoicing() {
    const batchBtn = document.getElementById("batchGenerateBtn");
    const batchModal = document.getElementById("batchInvoiceModal");
    const executeBatchBtn = document.getElementById("executeBatchGenerateBtn");
    const batchPrintBtn = document.getElementById("batchPrintAllBtn");

    if (batchBtn) {
      batchBtn.addEventListener("click", () => {
        openBatchInvoiceModal();
      });
    }

    if (executeBatchBtn) {
      executeBatchBtn.addEventListener("click", () => {
        const period = `${monthNames[currentMonth]} ${currentYear}`;
        let createdCount = 0;

        (erpState.subscribers || []).forEach(sub => {
          let existingInv = (erpState.invoices || []).find(inv => 
            (inv.subId === sub.id || inv.clientName === sub.name) && inv.period === period
          );

          if (!existingInv) {
            erpState.invoices.push({
              id: "inv_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
              invoiceNo: `PROF-${currentYear}-${Math.floor(Math.random() * 8999 + 1000)}`,
              subId: sub.id,
              clientName: sub.name,
              phone: sub.phone,
              email: sub.email,
              package: sub.package,
              amount: sub.monthlyRate || sub.price || 3500,
              period: period,
              dueDate: `${sub.billingDay} ${monthNames[currentMonth]} ${currentYear}`,
              status: "unpaid"
            });
            createdCount++;
          }
        });

        saveDatabase();
        renderAll();
        if (batchModal) batchModal.style.display = "none";
        showToast(`Batch generated ${createdCount > 0 ? createdCount : 'all'} proformas for ${period}!`);
      });
    }

    if (batchPrintBtn) {
      batchPrintBtn.addEventListener("click", () => {
        window.print();
      });
    }
  }

  function openBatchInvoiceModal() {
    const batchModal = document.getElementById("batchInvoiceModal");
    const titleEl = document.getElementById("batchModalMonthTitle");
    const tbody = document.getElementById("batchSubscribersList");
    const totalEl = document.getElementById("batchTotalAmount");
    const badgeEl = document.getElementById("batchSubCountBadge");

    if (!batchModal) return;

    const period = `${monthNames[currentMonth]} ${currentYear}`;
    if (titleEl) titleEl.textContent = period;

    const subs = erpState.subscribers || [];
    let total = 0;
    let html = "";

    subs.forEach(sub => {
      const rate = Number(sub.monthlyRate || sub.price || 0);
      total += rate;

      const invoice = (erpState.invoices || []).find(inv => 
        (inv.subId === sub.id || inv.clientName === sub.name) && inv.period === period
      );

      const isPaid = invoice && invoice.status === "paid";
      const statusTag = isPaid 
        ? `<span class="badge" style="background:rgba(138,206,0,0.15); color:#8ACE00; border-color:#8ACE00;">Paid</span>`
        : `<span class="badge" style="background:rgba(255,255,255,0.08); color:var(--text-primary);">Ready to Issue</span>`;

      html += `
        <tr>
          <td><strong style="color:var(--text-primary);">${sub.name}</strong></td>
          <td><span class="text-muted" style="font-size:0.8rem;">${sub.package}</span></td>
          <td style="font-family:var(--font-mono); font-weight:700; color:#8ACE00;">KSh ${rate.toLocaleString()}</td>
          <td style="font-family:var(--font-mono); font-size:0.85rem;">Day ${sub.billingDay}</td>
          <td>${statusTag}</td>
        </tr>
      `;
    });

    if (tbody) tbody.innerHTML = html;
    if (totalEl) totalEl.textContent = `KSh ${total.toLocaleString()}`;
    if (badgeEl) badgeEl.textContent = `${subs.length} Active Subscribers`;

    batchModal.style.display = "flex";
    if (window.lucide) window.lucide.createIcons();
  }

  /* =========================================================================
     7. SUBSCRIBERS DIRECTORY & PROFILES
     ========================================================================= */
  function setupDirectoryFilters() {
    const searchInput = document.getElementById("subscriberSearchInput");
    const filterPlan = document.getElementById("subscriberFilterPlan");
    const exportCsvBtn = document.getElementById("exportSubsCsvBtn");

    if (searchInput) {
      searchInput.addEventListener("input", renderSubscribersTable);
      searchInput.addEventListener("keyup", renderSubscribersTable);
    }

    if (filterPlan) {
      filterPlan.addEventListener("change", renderSubscribersTable);
    }

    if (exportCsvBtn) {
      exportCsvBtn.addEventListener("click", () => {
        exportSubscribersToCSV();
      });
    }

    // Auto-update price when package changes in Add/Edit modal
    const subPkgSelect = document.getElementById("subPackage");
    const subPriceInput = document.getElementById("subPrice");
    if (subPkgSelect && subPriceInput) {
      subPkgSelect.addEventListener("change", () => {
        const selected = subPkgSelect.value;
        if (PACKAGE_RATES[selected]) {
          subPriceInput.value = PACKAGE_RATES[selected];
        }
      });
    }
  }

  function renderSubscribersTable() {
    const tbody = document.getElementById("subscribersTableBody");
    if (!tbody) return;
    tbody.innerHTML = "";

    const search = (document.getElementById("subscriberSearchInput")?.value || "").toLowerCase().trim();
    const filterPlan = document.getElementById("subscriberFilterPlan")?.value || "all";

    const filtered = (erpState.subscribers || []).filter(sub => {
      const matchSearch = (sub.name || "").toLowerCase().includes(search) ||
                          (sub.phone && sub.phone.includes(search)) ||
                          (sub.company && sub.company.toLowerCase().includes(search)) ||
                          (sub.location && sub.location.toLowerCase().includes(search)) ||
                          (sub.pppoeUser && sub.pppoeUser.toLowerCase().includes(search)) ||
                          (sub.ipAddress && sub.ipAddress.includes(search));
      const matchPlan = filterPlan === "all" || (sub.package && sub.package.includes(filterPlan));
      return matchSearch && matchPlan;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted" style="padding:2.5rem;">No subscribers found matching your search.</td></tr>`;
      return;
    }

    const currentPeriod = `${monthNames[currentMonth]} ${currentYear}`;

    filtered.forEach(sub => {
      const inv = (erpState.invoices || []).find(i => 
        (i.subId === sub.id || i.clientName === sub.name) && i.period && i.period.includes(monthNames[currentMonth])
      );
      const isPaid = inv && inv.status === "paid";
      const isOverdue = !isPaid && sub.billingDay < 18;

      let statusBadge = isPaid 
        ? `<span class="badge" style="background:rgba(138,206,0,0.15); color:#8ACE00; border-color:#8ACE00;"><i data-lucide="check" style="width:12px;"></i> Paid (${currentPeriod})</span>`
        : isOverdue 
          ? `<span class="badge" style="background:rgba(239,68,68,0.15); color:#ef4444; border-color:#ef4444;"><i data-lucide="alert-circle" style="width:12px;"></i> Overdue</span>`
          : `<span class="badge" style="background:rgba(255,255,255,0.08); color:var(--text-primary);"><i data-lucide="clock" style="width:12px;"></i> Due Day ${sub.billingDay}</span>`;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>
          <div style="font-weight:700; color:var(--text-primary); font-size:0.95rem;">${sub.name}</div>
          <div class="text-muted" style="font-size:0.75rem;">${sub.phone} • ${sub.location || 'Mombasa'}</div>
        </td>
        <td>
          <span class="badge" style="font-size:0.75rem;">${sub.package}</span>
        </td>
        <td style="font-family:var(--font-mono); font-weight:700; color:#8ACE00; font-size:0.95rem;">
          KSh ${(sub.monthlyRate || sub.price || 0).toLocaleString()}
        </td>
        <td style="font-family:var(--font-mono); font-size:0.875rem; color:var(--text-primary);">
          Day ${sub.billingDay} of Month
        </td>
        <td style="font-size:0.8rem; font-family:var(--font-mono);">
          <div style="color:var(--lime);"><i data-lucide="key" style="width:11px; display:inline;"></i> ${sub.pppoeUser || 'client_' + sub.id}</div>
          <div class="text-muted">${sub.ipAddress || 'Dynamic IP'}</div>
        </td>
        <td>
          ${statusBadge}
        </td>
        <td style="text-align:right;">
          <div style="display:flex; justify-content:flex-end; gap:0.4rem; flex-wrap:wrap;">
            <button class="btn btn-secondary btn-sm" title="Dispatch Proforma / WhatsApp" onclick="window.dpOpenDrawerForSub('${sub.id}')">
              <i data-lucide="receipt" style="width:13px; height:13px;"></i> Bill
            </button>
            <button class="btn btn-primary btn-sm" style="padding:0.35rem 0.65rem;" title="Clear & Receive Payment" onclick="window.dpOpenReceivePayment('${sub.id}')">
              <i data-lucide="wallet" style="width:13px; height:13px;"></i> Pay
            </button>
            <button class="btn btn-secondary btn-sm" title="Edit Profile" onclick="window.dpEditSubscriber('${sub.id}')">
              <i data-lucide="edit" style="width:13px; height:13px;"></i>
            </button>
            <button class="btn btn-secondary btn-sm" style="color:#ef4444;" title="Delete" onclick="window.dpDeleteSub('${sub.id}')">
              <i data-lucide="trash-2" style="width:13px; height:13px;"></i>
            </button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });

    if (window.lucide) window.lucide.createIcons();
  }

  function exportSubscribersToCSV() {
    const subs = erpState.subscribers || [];
    let csv = "ID,Name,Company,Phone,Email,Package,MonthlyFee,BillingDay,Location,IPAddress,PPPoEUser,RouterModel,Status\n";
    subs.forEach(s => {
      csv += `"${s.id}","${s.name}","${s.company || ''}","${s.phone}","${s.email || ''}","${s.package}",${s.monthlyRate || s.price || 0},${s.billingDay},"${s.location || ''}","${s.ipAddress || ''}","${s.pppoeUser || ''}","${s.routerModel || ''}","${s.status}"\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `DATA_PORT_SUBSCRIBERS_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Subscribers directory exported to CSV.");
  }

  /* =========================================================================
     8. FIELD OPS & JOB CARDS ENGINE
     ========================================================================= */
  function renderJobCards() {
    const grid = document.getElementById("jobCardsGrid");
    if (!grid) return;
    grid.innerHTML = "";

    const jobs = erpState.jobCards || [];
    if (jobs.length === 0) {
      grid.innerHTML = `<div class="text-muted text-center" style="grid-column:1/-1; padding:3rem;">No active job cards. Click 'Create Job Card' to dispatch field technicians.</div>`;
      return;
    }

    jobs.forEach(job => {
      const card = document.createElement("div");
      card.className = "job-card-item glass-panel";

      const statusBadgeClass = job.status === "completed" ? "job-status-completed" :
                               job.status === "in_progress" ? "job-status-progress" : "job-status-pending";

      const statusLabel = job.status === "completed" ? "Completed" :
                          job.status === "in_progress" ? "In Progress" : "Pending Dispatch";

      let materialsHtml = "";
      if (job.materials && job.materials.length > 0) {
        materialsHtml = `
          <div class="job-materials-summary">
            <div style="font-weight:700; color:var(--text-primary); margin-bottom:0.25rem;">Itemized Hardware:</div>
            <div class="job-materials-list">
              ${job.materials.map(m => `
                <div class="job-material-line">
                  <span>${m.qty}x ${m.name}</span>
                  <span style="font-family:var(--font-mono);">KSh ${(m.qty * m.unitCost).toLocaleString()}</span>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }

      card.innerHTML = `
        <div class="job-header-row">
          <span class="job-category-tag">${job.category || 'Field Deployment'}</span>
          <span class="job-status-badge ${statusBadgeClass}">${statusLabel}</span>
        </div>

        <h4 class="job-title">${job.title}</h4>
        <div class="job-meta-row">
          <span><i data-lucide="map-pin" style="width:14px; display:inline;"></i> ${job.clientName}</span>
          <span><i data-lucide="user" style="width:14px; display:inline;"></i> ${job.technician}</span>
        </div>

        ${materialsHtml}

        ${job.notes ? `<p class="text-muted" style="font-size:0.8rem; margin-bottom:1rem; font-style:italic;">"${job.notes}"</p>` : ''}

        <div class="job-cost-bar">
          <div>
            <div class="text-muted" style="font-size:0.75rem; text-transform:uppercase;">Total Billable</div>
            <div style="font-family:var(--font-mono); font-size:1.15rem; font-weight:800; color:#8ACE00;">
              KSh ${(job.totalCost || 0).toLocaleString()}
            </div>
          </div>
          <div style="display:flex; gap:0.5rem;">
            ${!job.invoiceGenerated ? `
              <button class="btn btn-primary btn-sm" onclick="window.dpConvertJobToInvoice('${job.id}')" title="Generate Client Invoice">
                <i data-lucide="file-plus"></i> Convert to Invoice
              </button>
            ` : `
              <span class="badge" style="background:rgba(138,206,0,0.12); color:#8ACE00; border-color:#8ACE00;">
                <i data-lucide="check" style="width:12px;"></i> Invoiced
              </span>
            `}
            <button class="btn btn-secondary btn-sm" onclick="window.dpToggleJobStatus('${job.id}')" title="Toggle Status">
              <i data-lucide="rotate-cw" style="width:14px;"></i>
            </button>
          </div>
        </div>
      `;

      grid.appendChild(card);
    });

    if (window.lucide) window.lucide.createIcons();
  }

  /* =========================================================================
     9. FINANCIAL GENERAL LEDGER & CSV EXPORT
     ========================================================================= */
  function setupLedgerFilters() {
    const searchInput = document.getElementById("ledgerSearchInput");
    const filterCat = document.getElementById("ledgerFilterCategory");
    const exportCsvBtn = document.getElementById("exportLedgerCsvBtn");

    if (searchInput) {
      searchInput.addEventListener("input", renderLedgerTable);
      searchInput.addEventListener("keyup", renderLedgerTable);
    }

    if (filterCat) {
      filterCat.addEventListener("change", renderLedgerTable);
    }

    if (exportCsvBtn) {
      exportCsvBtn.addEventListener("click", () => {
        exportLedgerToCSV();
      });
    }
  }

  function renderLedgerTable() {
    const tbody = document.getElementById("ledgerTableBody");
    if (!tbody) return;
    tbody.innerHTML = "";

    const search = (document.getElementById("ledgerSearchInput")?.value || "").toLowerCase().trim();
    const filterCat = document.getElementById("ledgerFilterCategory")?.value || "all";

    const ledgerEntries = erpState.ledger || [];
    const filtered = ledgerEntries.filter(tx => {
      const matchSearch = (tx.description || "").toLowerCase().includes(search) ||
                          (tx.reference || "").toLowerCase().includes(search) ||
                          (tx.entity || "").toLowerCase().includes(search);
      
      let matchCat = true;
      if (filterCat === "income") matchCat = tx.type === "income";
      else if (filterCat === "expense") matchCat = tx.type === "expense";
      else if (filterCat !== "all") matchCat = tx.category === filterCat;

      return matchSearch && matchCat;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted" style="padding:2.5rem;">No transactions found matching criteria.</td></tr>`;
      return;
    }

    filtered.forEach(tx => {
      const tr = document.createElement("tr");
      const isIncome = tx.type === "income";

      tr.innerHTML = `
        <td style="font-family:var(--font-mono); font-size:0.85rem; color:#EDEDED;">
          ${tx.date || '2026-09-18'}
        </td>
        <td>
          <div style="font-weight:600; color:var(--text-primary);">${tx.description}</div>
          <div class="text-muted" style="font-size:0.75rem;">Ref: ${tx.reference || 'N/A'} • ${tx.entity || 'DATA PORT Core'}</div>
        </td>
        <td>
          <span class="badge" style="font-size:0.75rem;">${tx.category}</span>
        </td>
        <td>
          <span style="font-size:0.85rem; color:#EDEDED;">${tx.paymentMethod}</span>
        </td>
        <td style="font-family:var(--font-mono); font-size:0.85rem; color:var(--text-muted);">
          ${tx.reference || 'N/A'}
        </td>
        <td class="${isIncome ? 'tx-amount-income' : 'tx-amount-expense'}">
          ${isIncome ? '+' : '-'} KSh ${Number(tx.amount).toLocaleString()}
        </td>
        <td style="text-align:right;">
          <button class="btn btn-secondary btn-sm" style="color:#ef4444;" onclick="window.dpDeleteTx('${tx.id}')">
            <i data-lucide="trash-2" style="width:13px;"></i>
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    if (window.lucide) window.lucide.createIcons();
  }

  function exportLedgerToCSV() {
    const txs = erpState.ledger || [];
    let csv = "ID,Date,Description,Category,Type,Amount,PaymentMethod,Reference,Entity\n";
    txs.forEach(t => {
      csv += `"${t.id}","${t.date}","${t.description}","${t.category}","${t.type}",${t.amount},"${t.paymentMethod}","${t.reference || ''}","${t.entity || 'DATA PORT Core'}"\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `DATA_PORT_LEDGER_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("General Ledger exported to CSV.");
  }

  /* =========================================================================
     10. CANVAS CASH FLOW & P&L ANALYTICS CHART
     ========================================================================= */
  function renderAnalytics() {
    const canvas = document.getElementById("cashFlowCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Retina DPI Scaling
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = (rect.width || 700) * dpr;
    canvas.height = (rect.height || 280) * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width || 700;
    const height = rect.height || 280;

    // Clear Canvas
    ctx.clearRect(0, 0, width, height);

    // 6-Month Projection Data
    const months = ["Apr", "May", "Jun", "Jul", "Aug", "Sep"];
    const incomeData = [120000, 145000, 160000, 185000, 210000, 245000];
    const expenseData = [45000, 52000, 60000, 68000, 75000, 82000];

    const padding = { top: 30, right: 30, bottom: 40, left: 60 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;
    const maxVal = 300000;

    // Draw Grid Lines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      // Y-Axis Labels
      ctx.fillStyle = "#A1A1AA";
      ctx.font = "10px 'JetBrains Mono', monospace";
      ctx.textAlign = "right";
      const labelVal = Math.round(maxVal - (maxVal / 4) * i);
      ctx.fillText(`${(labelVal / 1000)}k`, padding.left - 10, y + 4);
    }

    const colWidth = chartW / months.length;
    const barWidth = 22;

    months.forEach((m, idx) => {
      const xCenter = padding.left + colWidth * idx + colWidth / 2;

      // Expense Bar (White)
      const expHeight = (expenseData[idx] / maxVal) * chartH;
      const expY = padding.top + chartH - expHeight;
      ctx.fillStyle = "var(--text-primary)";
      ctx.fillRect(xCenter - barWidth - 2, expY, barWidth, expHeight);

      // Income Bar (#8ACE00 Green)
      const incHeight = (incomeData[idx] / maxVal) * chartH;
      const incY = padding.top + chartH - incHeight;
      ctx.fillStyle = "#8ACE00";
      ctx.fillRect(xCenter + 2, incY, barWidth, incHeight);

      // X-Axis Labels
      ctx.fillStyle = "#EDEDED";
      ctx.font = "11px 'Inter', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(m, xCenter, height - padding.bottom + 22);
    });

    // Chart Legend
    ctx.fillStyle = "#8ACE00";
    ctx.fillRect(width - 200, 10, 12, 12);
    ctx.fillStyle = "var(--text-primary)";
    ctx.font = "11px 'Inter', sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("Gross Revenue", width - 180, 20);

    ctx.fillStyle = "var(--text-primary)";
    ctx.fillRect(width - 90, 10, 12, 12);
    ctx.fillText("Expenses", width - 70, 20);
  }

  /* =========================================================================
     11. EXECUTIVE VAULT KEYPAD & ALLOCATIONS
     ========================================================================= */
  function setupVaultKeypad() {
    const keypadBtns = document.querySelectorAll(".pin-key-btn");
    const lockedState = document.getElementById("vaultLockedState");
    const unlockedState = document.getElementById("vaultUnlockedState");
    const errorEl = document.getElementById("vaultPinError");
    const lockBtn = document.getElementById("lockVaultBtn");
    const openAllocBtn = document.getElementById("openVaultDepositModalBtn");

    const updatePinDots = () => {
      for (let i = 1; i <= 4; i++) {
        const dot = document.getElementById(`pindot${i}`);
        if (dot) {
          if (i <= enteredPin.length) dot.classList.add("filled");
          else dot.classList.remove("filled");
        }
      }
    };

    const unlockVault = () => {
      if (lockedState) lockedState.style.display = "none";
      if (unlockedState) unlockedState.style.display = "block";
      sessionStorage.setItem(STORAGE_KEYS.VAULT_UNLOCKED, "true");
      renderVaultDetails();
    };

    if (sessionStorage.getItem(STORAGE_KEYS.VAULT_UNLOCKED) === "true") {
      unlockVault();
    }

    keypadBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const key = btn.getAttribute("data-key");
        if (key === "clear") {
          enteredPin = "";
          if (errorEl) errorEl.style.display = "none";
        } else if (key === "back") {
          enteredPin = enteredPin.slice(0, -1);
        } else if (enteredPin.length < 4) {
          enteredPin += key;
        }

        updatePinDots();

        if (enteredPin.length === 4) {
          const vaultPin = (erpState.vault && erpState.vault.pin) ? erpState.vault.pin : VAULT_DEFAULT_PIN;
          if (enteredPin === vaultPin) {
            enteredPin = "";
            updatePinDots();
            if (errorEl) errorEl.style.display = "none";
            unlockVault();
            showToast("Executive Vault unlocked.");
          } else {
            if (errorEl) errorEl.style.display = "block";
            setTimeout(() => {
              enteredPin = "";
              updatePinDots();
            }, 500);
          }
        }
      });
    });

    if (lockBtn) {
      lockBtn.addEventListener("click", () => {
        sessionStorage.removeItem(STORAGE_KEYS.VAULT_UNLOCKED);
        if (lockedState) lockedState.style.display = "block";
        if (unlockedState) unlockedState.style.display = "none";
        showToast("Executive Vault locked.");
      });
    }

    if (openAllocBtn) {
      openAllocBtn.addEventListener("click", openVaultAllocationModal);
    }
  }

  function openVaultAllocationModal() {
    const modal = document.getElementById("vaultAllocationModal");
    if (modal) modal.style.display = "flex";
  }

  function renderVaultDetails() {
    const v = erpState.vault || {};
    const drawingsEl = document.getElementById("vaultDrawings");
    const taxEl = document.getElementById("vaultTaxReserve");
    const emergEl = document.getElementById("vaultEmergency");

    if (drawingsEl) drawingsEl.textContent = `KSh ${(v.personalDrawingsMonth || 40000).toLocaleString()}`;
    if (taxEl) taxEl.textContent = `KSh ${(v.taxReserveBalance || 35000).toLocaleString()}`;
    if (emergEl) emergEl.textContent = `KSh ${(v.emergencyFund || 50000).toLocaleString()}`;

    const rulesGrid = document.getElementById("rulesGrid");
    if (rulesGrid && erpState.rules) {
      rulesGrid.innerHTML = erpState.rules.map(r => `
        <div class="rule-card" onclick="window.dpToggleRule('${r.id}')" style="cursor:pointer;" title="Click to Toggle Rule">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <strong style="color:var(--text-primary);">${r.name}</strong>
            <span class="badge" style="${r.active ? 'background:rgba(138,206,0,0.15); color:#8ACE00; border-color:#8ACE00;' : 'background:rgba(255,255,255,0.08); color:var(--text-muted);'}">
              ${r.active ? 'Active' : 'Disabled'}
            </span>
          </div>
          <p class="text-muted" style="font-size:0.8125rem;">
            ${r.threshold ? 'Cap / Threshold: KSh ' + r.threshold.toLocaleString() : (r.trigger || 'Auto trigger')}
          </p>
        </div>
      `).join('');
    }

    if (window.lucide) window.lucide.createIcons();
  }

  /* =========================================================================
     12. MODAL FORMS & EVENT LISTENERS
     ========================================================================= */
  function setupModalsAndEvents() {
    // Modal Close Buttons
    document.querySelectorAll("[data-close]").forEach(btn => {
      btn.addEventListener("click", () => {
        const modalId = btn.getAttribute("data-close");
        const modal = document.getElementById(modalId);
        if (modal) modal.style.display = "none";
      });
    });

    // Close on backdrop click
    document.querySelectorAll(".modal-overlay").forEach(overlay => {
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
          overlay.style.display = "none";
        }
      });
    });

    // 1. Add / Edit Subscriber Form
    const subForm = document.getElementById("subscriberForm");
    if (subForm) {
      subForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const editId = document.getElementById("subEditId").value;
        const name = document.getElementById("subName").value.trim();
        const company = document.getElementById("subCompany").value.trim();
        const phone = document.getElementById("subPhone").value.trim();
        const email = document.getElementById("subEmail").value.trim();
        const pkg = document.getElementById("subPackage").value;
        const price = Number(document.getElementById("subPrice").value) || 3500;
        const billingDay = Number(document.getElementById("subBillingDay").value) || 1;
        const location = document.getElementById("subLocation").value.trim();
        const pppoeUser = document.getElementById("subPppoeUser").value.trim();
        const pppoePass = document.getElementById("subPppoePass").value.trim();
        const ipAddress = document.getElementById("subIpAddress").value.trim();
        const routerModel = document.getElementById("subRouterModel").value.trim();

        if (editId) {
          // Update existing
          const sub = (erpState.subscribers || []).find(s => s.id === editId);
          if (sub) {
            sub.name = name;
            sub.company = company;
            sub.phone = phone;
            sub.email = email;
            sub.package = pkg;
            sub.monthlyRate = price;
            sub.price = price;
            sub.billingDay = billingDay;
            sub.location = location;
            sub.pppoeUser = pppoeUser;
            sub.pppoePass = pppoePass;
            sub.ipAddress = ipAddress;
            sub.routerModel = routerModel;
            showToast(`Subscriber "${name}" updated.`);
          }
        } else {
          // Create new
          const newSub = {
            id: "sub_" + Date.now(),
            name: name,
            company: company,
            phone: phone,
            email: email,
            package: pkg,
            price: price,
            monthlyRate: price,
            billingDay: billingDay,
            location: location,
            pppoeUser: pppoeUser || `user_${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
            pppoePass: pppoePass || "dp@2026",
            ipAddress: ipAddress || "197.232.44." + Math.floor(Math.random() * 200 + 10),
            routerModel: routerModel || "Huawei ONT Dual-Band",
            status: "active",
            joinedDate: new Date().toISOString().split("T")[0]
          };
          erpState.subscribers.push(newSub);
          showToast(`Subscriber "${name}" created successfully.`);
        }

        saveDatabase();
        document.getElementById("subscriberModal").style.display = "none";
        renderAll();
      });
    }

    // 2. Receive Payment Form
    const receivePaymentForm = document.getElementById("receivePaymentForm");
    if (receivePaymentForm) {
      receivePaymentForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const subId = document.getElementById("paySubId").value;
        const invId = document.getElementById("payInvoiceId").value;
        const clientName = document.getElementById("payClientName").value;
        const amount = Number(document.getElementById("payAmount").value) || 0;
        const channel = document.getElementById("payChannel").value;
        const refCode = document.getElementById("payRefCode").value.trim();
        const payDate = document.getElementById("payDate").value || new Date().toISOString().split("T")[0];

        // Mark invoice paid
        let invoice = (erpState.invoices || []).find(i => i.id === invId || (i.subId === subId && i.period && i.period.includes(monthNames[currentMonth])));
        if (invoice) {
          invoice.status = "paid";
          invoice.paidAt = new Date().toISOString();
        } else {
          invoice = {
            id: "inv_" + Date.now(),
            invoiceNo: `PROF-${currentYear}-${Math.floor(Math.random() * 8999 + 1000)}`,
            subId: subId,
            clientName: clientName,
            amount: amount,
            period: `${monthNames[currentMonth]} ${currentYear}`,
            status: "paid",
            paidAt: new Date().toISOString()
          };
          erpState.invoices.push(invoice);
        }

        // Add to general ledger
        erpState.ledger.unshift({
          id: "tx_" + Date.now(),
          date: payDate,
          description: `Subscription Settlement - ${clientName} (${invoice.invoiceNo})`,
          category: "ISP Subscription Income",
          type: "income",
          amount: amount,
          paymentMethod: channel,
          reference: refCode,
          entity: "DATA PORT Core"
        });

        // If auto VAT rule is active, allocate 16% to tax reserve
        const vatRule = (erpState.rules || []).find(r => r.id === "rule-4" && r.active);
        if (vatRule) {
          const vatAmt = Math.round(amount * 0.16);
          if (!erpState.vault) erpState.vault = {};
          erpState.vault.taxReserveBalance = (erpState.vault.taxReserveBalance || 0) + vatAmt;
          if (!erpState.vault.allocations) erpState.vault.allocations = [];
          erpState.vault.allocations.push({
            date: payDate,
            description: `Auto-VAT (16%) from ${clientName} (${invoice.invoiceNo})`,
            amount: vatAmt,
            type: "tax_reserve"
          });
        }

        saveDatabase();
        document.getElementById("receivePaymentModal").style.display = "none";
        renderAll();
        showToast(`Payment of KSh ${amount.toLocaleString()} cleared and posted to Ledger.`);
      });
    }

    // 3. Create Job Card Form
    const jobForm = document.getElementById("jobCardForm");
    if (jobForm) {
      jobForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const labor = Number(document.getElementById("jobLaborCost").value) || 0;
        const materials = Number(document.getElementById("jobMaterialCost").value) || 0;

        const newJob = {
          id: "job_" + Date.now(),
          title: document.getElementById("jobTitle").value.trim(),
          clientName: document.getElementById("jobClient").value.trim(),
          technician: document.getElementById("jobTech").value.trim(),
          category: document.getElementById("jobCategory").value,
          laborCost: labor,
          totalCost: labor + materials,
          notes: document.getElementById("jobNotes").value.trim(),
          status: "in_progress",
          invoiceGenerated: false
        };

        erpState.jobCards.push(newJob);
        saveDatabase();
        document.getElementById("jobCardModal").style.display = "none";
        renderAll();
        showToast(`Job Card "${newJob.title}" created.`);
      });
    }

    // 4. Ledger Transaction Form
    const ledgerForm = document.getElementById("ledgerForm");
    if (ledgerForm) {
      ledgerForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const type = document.getElementById("txType").value;
        const amount = Number(document.getElementById("txAmount").value) || 0;
        const desc = document.getElementById("txDescription").value.trim();

        const newTx = {
          id: "tx_" + Date.now(),
          date: new Date().toISOString().split("T")[0],
          description: desc,
          type: type,
          amount: amount,
          category: document.getElementById("txCategory").value,
          paymentMethod: document.getElementById("txPaymentMethod").value,
          reference: "TX-" + Math.floor(Math.random() * 89999 + 10000),
          entity: "DATA PORT Core"
        };
        erpState.ledger.unshift(newTx);
        saveDatabase();
        document.getElementById("ledgerModal").style.display = "none";
        renderAll();
        showToast(`Transaction posted to General Ledger.`);
      });
    }

    // 5. Vault Allocation Form
    const vaultAllocForm = document.getElementById("vaultAllocationForm");
    if (vaultAllocForm) {
      vaultAllocForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const desc = document.getElementById("vaultAllocDesc").value.trim();
        const type = document.getElementById("vaultAllocType").value;
        const amount = Number(document.getElementById("vaultAllocAmount").value) || 0;

        if (!erpState.vault) erpState.vault = {};
        if (type === "drawing") {
          erpState.vault.personalDrawingsMonth = (erpState.vault.personalDrawingsMonth || 0) + amount;
        } else if (type === "tax_reserve") {
          erpState.vault.taxReserveBalance = (erpState.vault.taxReserveBalance || 0) + amount;
        } else if (type === "emergency") {
          erpState.vault.emergencyFund = (erpState.vault.emergencyFund || 0) + amount;
        }

        if (!erpState.vault.allocations) erpState.vault.allocations = [];
        erpState.vault.allocations.push({
          date: new Date().toISOString().split("T")[0],
          description: desc,
          amount: amount,
          type: type
        });

        saveDatabase();
        document.getElementById("vaultAllocationModal").style.display = "none";
        renderVaultDetails();
        showToast(`Treasury allocated: KSh ${amount.toLocaleString()}`);
      });
    }

    // Modal Trigger Buttons
    const openAddJobModalBtn = document.getElementById("openAddJobModalBtn");
    if (openAddJobModalBtn) openAddJobModalBtn.addEventListener("click", openJobCardModal);

    const openAddTxModalBtn = document.getElementById("openAddTxModalBtn");
    if (openAddTxModalBtn) openAddTxModalBtn.addEventListener("click", () => window.dpOpenAddExpense());

    const printAnalyticsBtn = document.getElementById("printAnalyticsBtn");
    if (printAnalyticsBtn) {
      printAnalyticsBtn.addEventListener("click", () => {
        window.print();
      });
    }

    // Sync Modal
    const syncBtn = document.getElementById("openSyncModalBtn");
    if (syncBtn) {
      syncBtn.addEventListener("click", () => {
        const modal = document.getElementById("syncModal");
        if (modal) modal.style.display = "flex";
      });
    }

    // JSON Export / Import
    const exportBtn = document.getElementById("exportJsonBtn");
    if (exportBtn) {
      exportBtn.addEventListener("click", () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(erpState, null, 2));
        const dlAnchor = document.createElement("a");
        dlAnchor.setAttribute("href", dataStr);
        dlAnchor.setAttribute("download", `DATA_PORT_ERP_BACKUP_${new Date().toISOString().split("T")[0]}.json`);
        document.body.appendChild(dlAnchor);
        dlAnchor.click();
        dlAnchor.remove();
        showToast("Full ERP JSON database backup downloaded.");
      });
    }

    const triggerSyncApiBtn = document.getElementById("triggerSyncApiBtn");
    if (triggerSyncApiBtn) {
      triggerSyncApiBtn.addEventListener("click", async () => {
        saveDatabase();
        showToast("Database safely persisted to LocalStorage & Ready for Cloud Sync.");
      });
    }

    const importInput = document.getElementById("importJsonInput");
    if (importInput) {
      importInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const imported = JSON.parse(event.target.result);
            if (imported.subscribers) {
              erpState = imported;
              saveDatabase();
              document.getElementById("syncModal").style.display = "none";
              renderAll();
              showToast("ERP Database successfully restored from backup.");
            } else {
              alert("JSON format is missing required subscriber models.");
            }
          } catch (err) {
            alert("Invalid JSON backup file.");
          }
        };
        reader.readAsText(file);
      });
    }

    // Drawer button: open Receive Payment modal
    const openReceivePaymentFromDrawerBtn = document.getElementById("openReceivePaymentFromDrawerBtn");
    if (openReceivePaymentFromDrawerBtn) {
      openReceivePaymentFromDrawerBtn.addEventListener("click", () => {
        if (selectedInvoice) {
          document.getElementById("invoiceDrawerModal").style.display = "none";
          window.dpOpenReceivePayment(selectedInvoice.subId, selectedInvoice.id);
        }
      });
    }

    // Day Detail modal: Add Subscriber for that day
    const dayAddSubBtn = document.getElementById("dayAddSubBtn");
    if (dayAddSubBtn) {
      dayAddSubBtn.addEventListener("click", () => {
        const day = dayAddSubBtn.getAttribute("data-day") || 1;
        document.getElementById("dayDetailModal").style.display = "none";
        window.dpOpenAddSubscriber(Number(day));
      });
    }
  }

  /* =========================================================================
     13. GLOBAL WINDOW ACTIONS (For inline onclick handlers & buttons)
     ========================================================================= */
  window.dpOpenAddSubscriber = function (dayNumber) {
    const modal = document.getElementById("subscriberModal");
    const title = document.getElementById("subModalTitle");
    const form = document.getElementById("subscriberForm");
    if (form) form.reset();
    document.getElementById("subEditId").value = "";
    if (title) title.textContent = "Add New Internet Client";
    if (dayNumber) {
      document.getElementById("subBillingDay").value = dayNumber;
    } else {
      document.getElementById("subBillingDay").value = 1;
    }
    document.getElementById("subPackage").value = "10 Mbps Standard Business";
    document.getElementById("subPrice").value = 3500;
    if (modal) modal.style.display = "flex";
    if (window.lucide) window.lucide.createIcons();
  };

  window.dpEditSubscriber = function (subId) {
    const sub = (erpState.subscribers || []).find(s => s.id === subId);
    if (!sub) return;

    document.getElementById("subEditId").value = sub.id;
    document.getElementById("subModalTitle").textContent = `Edit Client: ${sub.name}`;
    document.getElementById("subName").value = sub.name || "";
    document.getElementById("subCompany").value = sub.company || "";
    document.getElementById("subPhone").value = sub.phone || "";
    document.getElementById("subEmail").value = sub.email || "";
    document.getElementById("subPackage").value = sub.package || "10 Mbps Standard Business";
    document.getElementById("subPrice").value = sub.monthlyRate || sub.price || 3500;
    document.getElementById("subBillingDay").value = sub.billingDay || 1;
    document.getElementById("subLocation").value = sub.location || "";
    document.getElementById("subPppoeUser").value = sub.pppoeUser || "";
    document.getElementById("subPppoePass").value = sub.pppoePass || "";
    document.getElementById("subIpAddress").value = sub.ipAddress || "";
    document.getElementById("subRouterModel").value = sub.routerModel || "";

    const modal = document.getElementById("subscriberModal");
    if (modal) modal.style.display = "flex";
    if (window.lucide) window.lucide.createIcons();
  };

  window.dpOpenReceivePayment = function (subId, invId) {
    const sub = (erpState.subscribers || []).find(s => s.id === subId);
    if (!sub) return;

    const inv = invId 
      ? (erpState.invoices || []).find(i => i.id === invId)
      : (erpState.invoices || []).find(i => (i.subId === sub.id || i.clientName === sub.name) && i.period && i.period.includes(monthNames[currentMonth]));

    document.getElementById("paySubId").value = sub.id;
    document.getElementById("payInvoiceId").value = inv ? inv.id : "";
    document.getElementById("payClientName").value = sub.name;
    document.getElementById("payAmount").value = inv ? inv.amount : (sub.monthlyRate || sub.price || 3500);
    document.getElementById("payRefCode").value = "QKJ" + Math.floor(Math.random() * 89999 + 10000);
    document.getElementById("payDate").value = new Date().toISOString().split("T")[0];

    const modal = document.getElementById("receivePaymentModal");
    if (modal) modal.style.display = "flex";
    if (window.lucide) window.lucide.createIcons();
  };

  window.dpOpenDayDetailModal = function (dayNumber) {
    const modal = document.getElementById("dayDetailModal");
    const badge = document.getElementById("dayModalBadge");
    const title = document.getElementById("dayModalTitle");
    const container = document.getElementById("daySubscribersContainer");
    const addBtn = document.getElementById("dayAddSubBtn");

    if (!modal || !container) return;

    if (badge) badge.textContent = `DAY ${dayNumber} SCHEDULE`;
    if (title) title.textContent = `Billing Due on Day ${dayNumber} (${monthNames[currentMonth]} ${currentYear})`;
    if (addBtn) addBtn.setAttribute("data-day", dayNumber);

    const daySubs = (erpState.subscribers || []).filter(s => Number(s.billingDay) === Number(dayNumber));

    if (daySubs.length === 0) {
      container.innerHTML = `
        <div class="text-center text-muted" style="padding:2rem 1rem;">
          <i data-lucide="calendar-x" style="width:36px; height:36px; margin-bottom:0.5rem; opacity:0.6;"></i>
          <p>No client renewal invoices scheduled for day ${dayNumber}.</p>
        </div>
      `;
    } else {
      let html = `<div style="display:flex; flex-direction:column; gap:0.75rem;">`;
      daySubs.forEach(sub => {
        const inv = (erpState.invoices || []).find(i => 
          (i.subId === sub.id || i.clientName === sub.name) && i.period && i.period.includes(monthNames[currentMonth])
        );
        const isPaid = inv && inv.status === "paid";
        const statusBadge = isPaid
          ? `<span class="badge" style="background:rgba(138,206,0,0.15); color:#8ACE00; border-color:#8ACE00;">PAID</span>`
          : `<span class="badge" style="background:rgba(239,68,68,0.15); color:#ef4444; border-color:#ef4444;">UNPAID</span>`;

        html += `
          <div class="glass-panel" style="padding:1rem 1.25rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.75rem;">
            <div>
              <strong style="font-size:1rem; color:var(--text-primary);">${sub.name}</strong>
              <div class="text-muted" style="font-size:0.78rem;">${sub.package} • Phone: ${sub.phone}</div>
              <div style="font-family:var(--font-mono); font-size:0.85rem; color:var(--lime); margin-top:0.2rem;">
                KSh ${(sub.monthlyRate || sub.price || 0).toLocaleString()} • ${statusBadge}
              </div>
            </div>
            <div style="display:flex; gap:0.5rem;">
              <button class="btn btn-secondary btn-sm" onclick="document.getElementById('dayDetailModal').style.display='none'; window.dpOpenDrawerForSub('${sub.id}');">
                <i data-lucide="receipt" style="width:13px;"></i> Bill
              </button>
              <button class="btn btn-primary btn-sm" onclick="document.getElementById('dayDetailModal').style.display='none'; window.dpOpenReceivePayment('${sub.id}');">
                <i data-lucide="wallet" style="width:13px;"></i> Pay
              </button>
            </div>
          </div>
        `;
      });
      html += `</div>`;
      container.innerHTML = html;
    }

    modal.style.display = "flex";
    if (window.lucide) window.lucide.createIcons();
  };

  window.dpOpenDrawerForSub = function (subId) {
    const sub = (erpState.subscribers || []).find(s => s.id === subId);
    if (!sub) return;

    // Check or create current month invoice
    let inv = (erpState.invoices || []).find(i => (i.subId === sub.id || i.clientName === sub.name) && i.period && i.period.includes(monthNames[currentMonth]));
    if (!inv) {
      inv = {
        id: "inv_" + Date.now(),
        invoiceNo: `PROF-${currentYear}-${Math.floor(Math.random() * 8999 + 1000)}`,
        subId: sub.id,
        clientName: sub.name,
        phone: sub.phone,
        email: sub.email,
        package: sub.package,
        amount: sub.monthlyRate || sub.price || 3500,
        period: `${monthNames[currentMonth]} ${currentYear}`,
        dueDate: `${sub.billingDay} ${monthNames[currentMonth]} ${currentYear}`,
        status: "unpaid"
      };
      erpState.invoices.push(inv);
      saveDatabase();
    }

    selectedInvoice = inv;

    // Fill Drawer Content
    document.getElementById("drawerClientTitle").textContent = sub.name;
    document.getElementById("drawerInvoiceNo").textContent = inv.invoiceNo;
    document.getElementById("drawerPeriod").textContent = inv.period;
    document.getElementById("drawerPackage").textContent = sub.package;
    document.getElementById("drawerAmount").textContent = `KSh ${Number(inv.amount).toLocaleString()}`;
    document.getElementById("drawerDueDate").textContent = inv.dueDate;

    const drawerPppoe = document.getElementById("drawerPppoeUser");
    const drawerIp = document.getElementById("drawerIpAddress");
    const drawerLoc = document.getElementById("drawerLocation");
    if (drawerPppoe) drawerPppoe.textContent = sub.pppoeUser || `client_${sub.id}`;
    if (drawerIp) drawerIp.textContent = sub.ipAddress || '197.232.44.10';
    if (drawerLoc) drawerLoc.textContent = sub.location || 'Mombasa';

    const statusBadge = document.getElementById("drawerStatusBadge");
    if (statusBadge) {
      if (inv.status === "paid") {
        statusBadge.innerHTML = `<span class="badge" style="background:rgba(138,206,0,0.15); color:#8ACE00; border-color:#8ACE00;">PAID IN FULL</span>`;
      } else {
        statusBadge.innerHTML = `<span class="badge" style="background:rgba(239,68,68,0.15); color:#ef4444; border-color:#ef4444;">UNPAID / PENDING</span>`;
      }
    }

    // WhatsApp Dispatch Button
    const waBtn = document.getElementById("sendWhatsAppBtn");
    if (waBtn) {
      waBtn.onclick = () => {
        const cleanPhone = (sub.phone || "").replace(/[^0-9]/g, "");
        const formattedPhone = cleanPhone.startsWith("0") ? "254" + cleanPhone.substring(1) : cleanPhone;
        const msg = `*DATA PORT LIMITED - INVOICE NOTICE*\n\n` +
          `Dear *${sub.name}*,\n` +
          `Your service proforma for *${inv.period}* is ready.\n\n` +
          `• *Package:* ${sub.package}\n` +
          `• *Amount Due:* KSh ${Number(inv.amount).toLocaleString()}\n` +
          `• *Due Date:* ${inv.dueDate}\n` +
          `• *Invoice Ref:* ${inv.invoiceNo}\n\n` +
          `*Official Payment Channel:*\n` +
          `M-PESA Paybill: *247247*\n` +
          `Account No: *${sub.phone}*\n\n` +
          `Thank you for choosing Data Port Limited. High-speed internet SLA is guaranteed.`;
        window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(msg)}`, "_blank");
        showToast(`WhatsApp billing dispatch initiated for ${sub.name}.`);
      };
    }

    // Email Dispatch Button
    const emailBtn = document.getElementById("sendEmailBtn");
    if (emailBtn) {
      emailBtn.onclick = () => {
        const subject = `DATA PORT LIMITED: Proforma Invoice ${inv.invoiceNo} - ${inv.period}`;
        const body = `Dear ${sub.name},\n\nPlease find attached your Internet Subscription proforma invoice for ${inv.period}.\n\nAmount Due: KSh ${Number(inv.amount).toLocaleString()}\nDue Date: ${inv.dueDate}\nPaybill: 247247 (Acc: ${sub.phone})\n\nThank you,\nDATA PORT LIMITED Billing Team`;
        window.location.href = `mailto:${sub.email || 'accounts@dpinc.top'}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      };
    }

    // Toggle Payment Status Button
    const togglePaidBtn = document.getElementById("togglePaidBtn");
    if (togglePaidBtn) {
      togglePaidBtn.onclick = () => {
        inv.status = inv.status === "paid" ? "unpaid" : "paid";
        
        if (inv.status === "paid") {
          erpState.ledger.unshift({
            id: "tx_" + Date.now(),
            date: new Date().toISOString().split("T")[0],
            description: `Payment Received - ${sub.name} (${inv.invoiceNo})`,
            type: "income",
            amount: Number(inv.amount),
            category: "ISP Subscription Income",
            paymentMethod: "M-Pesa Paybill",
            reference: inv.invoiceNo,
            entity: "DATA PORT Core"
          });
          showToast(`Invoice marked Paid and credited to General Ledger.`);
        } else {
          showToast(`Invoice marked Unpaid.`);
        }
        
        saveDatabase();
        renderAll();
        document.getElementById("invoiceDrawerModal").style.display = "none";
      };
    }

    // Print Invoice Button
    const printBtn = document.getElementById("printInvoiceBtn");
    if (printBtn) {
      printBtn.onclick = () => {
        document.getElementById("printInvoiceNo").textContent = inv.invoiceNo;
        document.getElementById("printClientName").textContent = sub.name;
        document.getElementById("printClientPhone").textContent = `Phone: ${sub.phone}`;
        document.getElementById("printItemTitle").textContent = `${sub.package} - ${inv.period}`;
        document.getElementById("printGrandTotal").textContent = `KSh ${Number(inv.amount).toLocaleString()}`;
        document.getElementById("printIssueDate").textContent = new Date().toLocaleDateString("en-GB");
        document.getElementById("printDueDate").textContent = inv.dueDate;
        document.getElementById("printAccNo").textContent = sub.phone;
        window.print();
      };
    }

    document.getElementById("invoiceDrawerModal").style.display = "flex";
    if (window.lucide) window.lucide.createIcons();
  };

  window.dpConvertJobToInvoice = function (jobId) {
    const job = (erpState.jobCards || []).find(j => j.id === jobId);
    if (!job) return;

    job.invoiceGenerated = true;
    const invNo = `INV-${currentYear}-${Math.floor(Math.random() * 8999 + 1000)}`;
    job.invoiceRef = invNo;

    // Add to invoices
    erpState.invoices.push({
      id: "inv_" + Date.now(),
      invoiceNo: invNo,
      clientName: job.clientName,
      package: job.title,
      amount: job.totalCost,
      period: `${monthNames[currentMonth]} ${currentYear}`,
      dueDate: `Immediate`,
      status: "unpaid",
      jobCardId: job.id
    });

    saveDatabase();
    renderAll();
    showToast(`Job Card converted into Proforma Invoice ${invNo}!`);
  };

  window.dpToggleJobStatus = function (jobId) {
    const job = (erpState.jobCards || []).find(j => j.id === jobId);
    if (!job) return;
    if (job.status === "in_progress") job.status = "completed";
    else if (job.status === "completed") job.status = "pending";
    else job.status = "in_progress";
    saveDatabase();
    renderAll();
    showToast(`Job Card status updated to ${job.status}.`);
  };

  window.dpToggleRule = function (ruleId) {
    const rule = (erpState.rules || []).find(r => r.id === ruleId);
    if (!rule) return;
    rule.active = !rule.active;
    saveDatabase();
    renderVaultDetails();
    showToast(`Rule "${rule.name}" is now ${rule.active ? 'Active' : 'Disabled'}.`);
  };

  window.dpDeleteSub = function (subId) {
    if (confirm("Are you sure you want to remove this subscriber?")) {
      erpState.subscribers = (erpState.subscribers || []).filter(s => s.id !== subId);
      saveDatabase();
      renderAll();
      showToast("Subscriber removed.");
    }
  };

  window.dpDeleteTx = function (txId) {
    if (confirm("Delete this ledger entry?")) {
      erpState.ledger = (erpState.ledger || []).filter(t => t.id !== txId);
      saveDatabase();
      renderAll();
      showToast("Ledger entry removed.");
    }
  };

  window.dpOpenAddIncome = function () {
    const modal = document.getElementById("ledgerModal");
    const title = document.getElementById("ledgerModalTitle");
    const form = document.getElementById("ledgerForm");
    if (form) form.reset();
    if (title) title.textContent = "Record Income / Client Inflow";
    document.getElementById("txType").value = "income";
    document.getElementById("txCategory").value = "ISP Subscription Income";
    document.getElementById("txPaymentMethod").value = "M-Pesa Paybill";
    if (modal) modal.style.display = "flex";
    if (window.lucide) window.lucide.createIcons();
  };

  window.dpOpenAddExpense = function () {
    const modal = document.getElementById("ledgerModal");
    const title = document.getElementById("ledgerModalTitle");
    const form = document.getElementById("ledgerForm");
    if (form) form.reset();
    if (title) title.textContent = "Record Operating Expense";
    document.getElementById("txType").value = "expense";
    document.getElementById("txCategory").value = "Wholesale Bandwidth Transit";
    document.getElementById("txPaymentMethod").value = "Bank Transfer";
    if (modal) modal.style.display = "flex";
    if (window.lucide) window.lucide.createIcons();
  };

  function openJobCardModal() {
    const modal = document.getElementById("jobCardModal");
    const form = document.getElementById("jobCardForm");
    if (form) form.reset();
    if (modal) modal.style.display = "flex";
    if (window.lucide) window.lucide.createIcons();
  }

  function openLedgerModal() {
    const modal = document.getElementById("ledgerModal");
    if (modal) modal.style.display = "flex";
    if (window.lucide) window.lucide.createIcons();
  }

  /* Toast Notification Helper */
  function showToast(msg) {
    const toast = document.getElementById("dashToast");
    const msgEl = document.getElementById("dashToastMsg");
    if (!toast || !msgEl) return;
    msgEl.textContent = msg;
    toast.style.display = "block";
    setTimeout(() => {
      toast.style.display = "none";
    }, 3500);
  }

  /* =========================================================================
     14. MASTER RENDER ALL
     ========================================================================= */
  function renderAll() {
    updateOverviewMetrics();
    renderCalendar();
    renderSubscribersTable();
    renderJobCards();
    renderLedgerTable();
    if (activeTab === "analyticsTab") renderAnalytics();
    if (activeTab === "vaultTab") renderVaultDetails();
  }

})();
