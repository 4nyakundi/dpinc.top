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

  function escapeHtml(str) {
    if (str === null || str === undefined) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
  window.escapeHtml = escapeHtml;

  const STORAGE_KEYS = {
    SESSION: "dp_erp_session",
    VAULT_UNLOCKED: "dp_vault_unlocked",
    ERP_DATA: "dp_erp_master_data_v2",
    TARIFFS: "dataport_custom_tariffs"
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
      },
      {
        id: "sub-107",
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
        pppoeUser: "shani_chai_vok",
        pppoePass: "dp@shani#2026",
        routerModel: "Huawei ONT Dual-Band",
        status: "active",
        joinedDate: "2026-02-09"
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
      },
      {
        id: "inv-007",
        invoiceNo: "#007/26",
        docType: "Invoice",
        clientType: "subscriber",
        subId: "sub-107",
        clientName: "Shani Chai",
        phone: "0795 917 066",
        email: "shanichai@dpinc.co.ke",
        location: "VOK Bombolulu",
        items: [
          { title: "DataPort NET Public IP", qty: "25 mbps", rate: 3000 }
        ],
        subtotal: 3000,
        amount: 3000,
        grandTotal: 3000,
        totalPaid: 3000,
        balanceDue: 0,
        period: "February 2026",
        issueDate: "2026-02-09",
        dueDate: "2026-02-14",
        status: "paid",
        paidAt: "2026-02-09T10:00:00.000Z",
        hasPaymentPlan: false,
        validityNote: "Thank you!"
      },
      {
        id: "inv-008",
        invoiceNo: "10.23/26",
        docType: "Proforma Invoice",
        clientType: "general",
        subId: null,
        clientName: "Tracy Wangari",
        phone: "0722 000 111",
        email: "tracy.wangari@domain.com",
        location: "Mombasa",
        items: [
          { title: "Domain Name Registaration. (Company).", qty: "1 Year", rate: 2500 },
          { title: "Domain Hosting (TrueHost Silver).", qty: "1 Year", rate: 4300 },
          { title: "Web Security & Debugging & SSL Security (Ask SSL)", qty: "1 Year", rate: 1800 },
          { title: "Web Creation & Design - Full Stacks Creation (JSON/CSS)", qty: "Lifetime", rate: 10000 }
        ],
        subtotal: 18600,
        amount: 18600,
        grandTotal: 18600,
        totalPaid: 5000,
        balanceDue: 13600,
        hasPaymentPlan: true,
        depositAmount: 5000,
        depositLabel: "1 ST Installment",
        installments: [
          { label: "1 ST Installment", amount: 5000, date: "2025-01-16" }
        ],
        period: "January 2025",
        issueDate: "2025-01-16",
        dueDate: "2025-01-30",
        status: "partial",
        validityNote: "Please Note: Valid for 14 days from date."
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
    setupInvoiceBuilderEvents();
    setupModalsAndEvents();
    setupVaultKeypad();
    setupDirectoryFilters();
    setupLedgerFilters();
    initTariffManager();
    renderAll();
  }

  async function loadDatabase() {
    const cached = localStorage.getItem(STORAGE_KEYS.ERP_DATA);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed && Array.isArray(parsed.subscribers) && parsed.subscribers.length > 0) {
          erpState = parsed;
          if (!Array.isArray(erpState.invoices)) erpState.invoices = [];
          // Ensure seed subscribers & invoices from INITIAL_ERP_DATA are populated if missing
          INITIAL_ERP_DATA.subscribers.forEach(sub => {
            if (!erpState.subscribers.some(s => s.id === sub.id)) {
              erpState.subscribers.push(sub);
            }
          });
          INITIAL_ERP_DATA.invoices.forEach(inv => {
            if (!erpState.invoices.some(i => i.id === inv.id)) {
              erpState.invoices.push(inv);
            }
          });
          saveDatabase();
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
        if (targetPane) {
          targetPane.classList.add("active");
          if (typeof gsap !== "undefined") {
            gsap.fromTo(targetPane, 
              { opacity: 0, y: 16 }, 
              { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }
            );
          }
        }

        // Dynamic Quick Action Button Label
        if (quickActionLabel) {
          if (targetTabId === "invoicesTab") {
            quickActionLabel.textContent = "New Invoice";
          } else if (targetTabId === "calendarTab" || targetTabId === "subscribersTab") {
            quickActionLabel.textContent = "Add Client";
          } else if (targetTabId === "jobCardsTab") {
            quickActionLabel.textContent = "Create Job Card";
          } else if (targetTabId === "ledgerTab") {
            quickActionLabel.textContent = "Record Income";
          } else if (targetTabId === "analyticsTab") {
            quickActionLabel.textContent = "Print Report";
          } else if (targetTabId === "vaultTab") {
            quickActionLabel.textContent = "Allocate Treasury";
          } else if (targetTabId === "tariffsTab") {
            quickActionLabel.textContent = "Save Tariffs";
          }
        }

        if (targetTabId === "invoicesTab") {
          renderInvoicesHub();
        } else if (targetTabId === "analyticsTab") {
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
        } else if (targetTabId === "tariffsTab") {
          renderTariffManager();
        }
      });
    });

    const quickActionBtn = document.getElementById("quickActionBtn");
    if (quickActionBtn) {
      quickActionBtn.addEventListener("click", () => {
        if (activeTab === "invoicesTab") {
          window.dpOpenCreateInvoice();
        } else if (activeTab === "calendarTab" || activeTab === "subscribersTab") {
          window.dpOpenAddSubscriber();
        } else if (activeTab === "jobCardsTab") {
          openJobCardModal();
        } else if (activeTab === "ledgerTab") {
          window.dpOpenAddIncome();
        } else if (activeTab === "analyticsTab") {
          window.print();
        } else if (activeTab === "vaultTab") {
          openVaultAllocationModal();
        } else if (activeTab === "tariffsTab") {
          saveAllTariffs();
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
    const tabInvoices = document.getElementById("tabInvoicesCount");
    if (tabSubs) tabSubs.textContent = totalSubs;
    if (tabJobs) tabJobs.textContent = erpState.jobCards ? erpState.jobCards.length : 0;
    if (tabInvoices) tabInvoices.textContent = erpState.invoices ? erpState.invoices.length : 0;

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
     6B. MASTER INVOICING & ACCOUNTS RECEIVABLE ENGINE
     ========================================================================= */
  let activeInvoiceLineItems = [];
  let currentInvoiceFilter = "all";
  let currentInvoiceTypeFilter = "all";
  let currentInvoiceSearchTerm = "";

  function setupInvoiceBuilderEvents() {
    // Open create invoice button in top control bar
    const openBtn = document.getElementById("openCreateInvoiceBtn");
    if (openBtn) {
      openBtn.addEventListener("click", () => window.dpOpenCreateInvoice());
    }
    const hubCreateBtn = document.getElementById("invHubCreateBtn");
    if (hubCreateBtn) {
      hubCreateBtn.addEventListener("click", () => window.dpOpenCreateInvoice());
    }
    const hubBatchBtn = document.getElementById("invHubBatchBtn");
    if (hubBatchBtn) {
      hubBatchBtn.addEventListener("click", () => window.dpOpenBatchInvoices());
    }

    // Client Type Radio Switch: subscriber vs general
    const radSubscriber = document.getElementById("invTypeSubscriber");
    const radGeneral = document.getElementById("invTypeGeneral");
    const subSelectRow = document.getElementById("invSubscriberSelectRow");

    function updateClientTypeUI() {
      const isSub = radSubscriber && radSubscriber.checked;
      if (subSelectRow) {
        subSelectRow.style.display = isSub ? "block" : "none";
      }
    }

    if (radSubscriber) radSubscriber.addEventListener("change", updateClientTypeUI);
    if (radGeneral) {
      radGeneral.addEventListener("change", () => {
        updateClientTypeUI();
        document.getElementById("invSelectedSubId").value = "";
      });
    }

    // Subscriber Dropdown Selection
    const subSelect = document.getElementById("invSelectSubscriber");
    if (subSelect) {
      subSelect.addEventListener("change", (e) => {
        const val = e.target.value;
        if (!val) return;
        const sub = (erpState.subscribers || []).find(s => s.id === val);
        if (sub) {
          document.getElementById("invSelectedSubId").value = sub.id;
          document.getElementById("invClientName").value = sub.name || "";
          document.getElementById("invClientPhone").value = sub.phone || "";
          document.getElementById("invClientEmail").value = sub.email || "";
          document.getElementById("invClientLocation").value = sub.location || "Mombasa";

          // Pre-populate with subscriber internet bandwidth package matching PDF 1
          activeInvoiceLineItems = [{
            id: "item_" + Date.now(),
            title: `DataPort NET Public IP`,
            qty: sub.speed || (sub.package && sub.package.includes("Mbps") ? sub.package.match(/\d+\s*mbps/i)?.[0].toLowerCase() : "25 mbps") || "25 mbps",
            rate: Number(sub.monthlyRate || sub.price) || 3000
          }];
          renderInvoiceLineItemsTable();
        }
      });
    }

    // ISP Quick Add Presets
    const quickPlanBtn = document.getElementById("invQuickAddPlan");
    if (quickPlanBtn) {
      quickPlanBtn.addEventListener("click", () => {
        const subId = document.getElementById("invSelectedSubId").value;
        const sub = (erpState.subscribers || []).find(s => s.id === subId);
        const pkgRate = sub ? (Number(sub.monthlyRate || sub.price) || 3000) : 3000;
        const pkgQty = sub ? (sub.speed || "25 mbps") : "25 mbps";
        activeInvoiceLineItems.push({
          id: "item_" + Date.now(),
          title: "DataPort NET Public IP",
          qty: pkgQty,
          rate: pkgRate
        });
        renderInvoiceLineItemsTable();
      });
    }

    const quickSetupBtn = document.getElementById("invQuickAddSetup");
    if (quickSetupBtn) {
      quickSetupBtn.addEventListener("click", () => {
        activeInvoiceLineItems.push({
          id: "item_" + Date.now(),
          title: "Optical Fiber Drop Cable Splicing & NOC Installation Setup",
          qty: "1 Setup",
          rate: 3500
        });
        renderInvoiceLineItemsTable();
      });
    }

    const quickRouterBtn = document.getElementById("invQuickAddRouter");
    if (quickRouterBtn) {
      quickRouterBtn.addEventListener("click", () => {
        activeInvoiceLineItems.push({
          id: "item_" + Date.now(),
          title: "Huawei / ZTE Dual-Band Gigabit ONT Optical WiFi Router",
          qty: "1 Unit",
          rate: 4500
        });
        renderInvoiceLineItemsTable();
      });
    }

    const quickIpBtn = document.getElementById("invQuickAddIp");
    if (quickIpBtn) {
      quickIpBtn.addEventListener("click", () => {
        activeInvoiceLineItems.push({
          id: "item_" + Date.now(),
          title: "Dedicated Static Public IPv4 Address Allocation (1 Month)",
          qty: "1 IP",
          rate: 1500
        });
        renderInvoiceLineItemsTable();
      });
    }

    // General ICT Presets (matching PDF 2)
    const quickDomainBtn = document.getElementById("invQuickAddDomain");
    if (quickDomainBtn) {
      quickDomainBtn.addEventListener("click", () => {
        activeInvoiceLineItems.push({
          id: "item_" + Date.now(),
          title: "Domain Name Registaration. (Company).",
          qty: "1 Year",
          rate: 2500
        });
        renderInvoiceLineItemsTable();
      });
    }

    const quickHostingBtn = document.getElementById("invQuickAddHosting");
    if (quickHostingBtn) {
      quickHostingBtn.addEventListener("click", () => {
        activeInvoiceLineItems.push({
          id: "item_" + Date.now(),
          title: "Domain Hosting (TrueHost Silver).",
          qty: "1 Year",
          rate: 4300
        });
        renderInvoiceLineItemsTable();
      });
    }

    const quickSecurityBtn = document.getElementById("invQuickAddSecurity");
    if (quickSecurityBtn) {
      quickSecurityBtn.addEventListener("click", () => {
        activeInvoiceLineItems.push({
          id: "item_" + Date.now(),
          title: "Web Security & Debugging & SSL Security (Ask SSL)",
          qty: "1 Year",
          rate: 1800
        });
        renderInvoiceLineItemsTable();
      });
    }

    const quickDesignBtn = document.getElementById("invQuickAddDesign");
    if (quickDesignBtn) {
      quickDesignBtn.addEventListener("click", () => {
        activeInvoiceLineItems.push({
          id: "item_" + Date.now(),
          title: "Web Creation & Design - Full Stacks Creation (JSON/CSS)",
          qty: "Lifetime",
          rate: 10000
        });
        renderInvoiceLineItemsTable();
      });
    }

    const quickCctvBtn = document.getElementById("invQuickAddCctv");
    if (quickCctvBtn) {
      quickCctvBtn.addEventListener("click", () => {
        activeInvoiceLineItems.push({
          id: "item_" + Date.now(),
          title: "HD IP CCTV Surveillance Camera Installation & NVR Setup",
          qty: "1 Setup",
          rate: 15000
        });
        renderInvoiceLineItemsTable();
      });
    }

    const addNewRowBtn = document.getElementById("invAddNewRowBtn");
    if (addNewRowBtn) {
      addNewRowBtn.addEventListener("click", () => {
        activeInvoiceLineItems.push({
          id: "item_" + Date.now(),
          title: "Custom Technical Service / Deliverable",
          qty: "1",
          rate: 2500
        });
        renderInvoiceLineItemsTable();
      });
    }

    // Payment Plan Checkbox Toggle
    const enablePlanCheckbox = document.getElementById("invEnablePaymentPlan");
    const planFields = document.getElementById("invPaymentPlanFields");
    if (enablePlanCheckbox && planFields) {
      enablePlanCheckbox.addEventListener("change", (e) => {
        planFields.style.display = e.target.checked ? "block" : "none";
        calculateInvoiceTotals();
      });
    }

    // Deposit Amount input listener
    const depositInput = document.getElementById("invDepositAmount");
    if (depositInput) {
      depositInput.addEventListener("input", calculateInvoiceTotals);
    }

    // Live Preview Button on Create Form
    const livePreviewBtn = document.getElementById("invLivePreviewBtn");
    if (livePreviewBtn) {
      livePreviewBtn.addEventListener("click", () => {
        const invData = collectInvoiceFormData();
        if (!invData.clientName) {
          alert("Please enter client / organization name.");
          return;
        }
        window.__currentPreviewInvoice = invData;
        renderLiveInvoicePreviewCard(invData);
        document.getElementById("invoicePreviewModal").style.display = "flex";
      });
    }

    // Save Draft Button on Create Form
    const saveDraftBtn = document.getElementById("invSaveDraftBtn");
    if (saveDraftBtn) {
      saveDraftBtn.addEventListener("click", () => {
        const invData = collectInvoiceFormData();
        if (!invData.clientName) {
          alert("Please enter client / organization name.");
          return;
        }
        saveInvoiceToState(invData);
        document.getElementById("createInvoiceModal").style.display = "none";
        showToast(`Invoice ${invData.invoiceNo} saved successfully!`);
      });
    }

    // WhatsApp Dispatch Button on Create Form
    const invWhatsAppBtn = document.getElementById("invWhatsAppBtn");
    if (invWhatsAppBtn) {
      invWhatsAppBtn.addEventListener("click", () => {
        const invData = collectInvoiceFormData();
        if (!invData.clientName) {
          alert("Please enter client / organization name.");
          return;
        }
        dispatchInvoiceViaWhatsApp(invData);
      });
    }

    // Form Submit (Save & Print)
    const form = document.getElementById("createInvoiceForm");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const invData = collectInvoiceFormData();
        if (!invData.clientName) {
          alert("Please enter client / organization name.");
          return;
        }

        saveInvoiceToState(invData);
        populatePrintableInvoice(invData);
        document.getElementById("createInvoiceModal").style.display = "none";
        
        setTimeout(() => {
          window.print();
        }, 250);

        showToast(`Invoice ${invData.invoiceNo} saved & sent to printer!`);
      });
    }

    // Trigger Print from Preview Modal
    const previewPrintTriggerBtn = document.getElementById("previewPrintTriggerBtn");
    if (previewPrintTriggerBtn) {
      previewPrintTriggerBtn.addEventListener("click", () => {
        const invData = window.__currentPreviewInvoice || collectInvoiceFormData();
        populatePrintableInvoice(invData);
        setTimeout(() => {
          window.print();
        }, 200);
      });
    }

    // Trigger WhatsApp from Preview Modal
    const previewWhatsAppTriggerBtn = document.getElementById("previewWhatsAppTriggerBtn");
    if (previewWhatsAppTriggerBtn) {
      previewWhatsAppTriggerBtn.addEventListener("click", () => {
        const invData = window.__currentPreviewInvoice || collectInvoiceFormData();
        dispatchInvoiceViaWhatsApp(invData);
      });
    }

    // Invoices Hub Status Filter Pills
    const filterGroup = document.getElementById("invoicesStatusFilterGroup");
    if (filterGroup) {
      filterGroup.querySelectorAll(".cal-filter-pill").forEach(pill => {
        pill.addEventListener("click", () => {
          filterGroup.querySelectorAll(".cal-filter-pill").forEach(p => p.classList.remove("active"));
          pill.classList.add("active");
          currentInvoiceFilter = pill.getAttribute("data-inv-status") || "all";
          renderInvoicesHub();
        });
      });
    }

    // Invoices Hub Client Type Filter & Search
    const typeFilter = document.getElementById("invTypeFilter");
    if (typeFilter) {
      typeFilter.addEventListener("change", (e) => {
        currentInvoiceTypeFilter = e.target.value;
        renderInvoicesHub();
      });
    }

    const searchInput = document.getElementById("invSearchInput");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        currentInvoiceSearchTerm = e.target.value.toLowerCase().trim();
        renderInvoicesHub();
      });
    }
  }

  function renderInvoiceLineItemsTable() {
    const tbody = document.getElementById("invLineItemsBody");
    if (!tbody) return;

    if (activeInvoiceLineItems.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted" style="padding:1.5rem;">No line items added yet. Click a quick add button above or "+ Add Custom Item".</td></tr>`;
      calculateInvoiceTotals();
      return;
    }

    tbody.innerHTML = activeInvoiceLineItems.map((item, idx) => `
      <tr style="border-bottom:1px solid var(--border-color);">
        <td>
          <input type="text" class="form-input inv-item-title" data-idx="${idx}" value="${escapeHtml(item.title || '')}" placeholder="Description of service..." style="font-size:0.875rem; font-weight:600; padding:0.4rem 0.6rem;">
        </td>
        <td style="text-align:center;">
          <input type="text" class="form-input inv-item-qty" data-idx="${idx}" value="${escapeHtml(item.qty || '1')}" placeholder="e.g. 25 mbps / 1 Year" style="font-size:0.85rem; text-align:center; padding:0.4rem 0.4rem;">
        </td>
        <td style="text-align:right;">
          <input type="number" step="100" min="0" class="form-input inv-item-rate" data-idx="${idx}" value="${item.rate || 0}" style="font-size:0.875rem; font-family:var(--font-mono); font-weight:700; text-align:right; padding:0.4rem 0.6rem; color:var(--lime-dark);">
        </td>
        <td style="text-align:right; font-family:var(--font-mono); font-weight:800; font-size:0.9rem; color:var(--text-primary); vertical-align:middle;">
          KSh ${(Number(item.rate) || 0).toLocaleString()}
        </td>
        <td style="text-align:center; vertical-align:middle;">
          <button type="button" class="btn btn-secondary btn-sm" onclick="window.dpRemoveInvoiceLineItem(${idx})" style="padding:0.35rem; color:#ef4444; border-color:rgba(239,68,68,0.2);" title="Remove Row">
            <i data-lucide="trash-2" style="width:13px; height:13px;"></i>
          </button>
        </td>
      </tr>
    `).join("");

    tbody.querySelectorAll(".inv-item-title").forEach(input => {
      input.addEventListener("input", (e) => {
        const idx = e.target.getAttribute("data-idx");
        if (activeInvoiceLineItems[idx]) activeInvoiceLineItems[idx].title = e.target.value;
      });
    });

    tbody.querySelectorAll(".inv-item-qty").forEach(input => {
      input.addEventListener("input", (e) => {
        const idx = e.target.getAttribute("data-idx");
        if (activeInvoiceLineItems[idx]) activeInvoiceLineItems[idx].qty = e.target.value;
      });
    });

    tbody.querySelectorAll(".inv-item-rate").forEach(input => {
      input.addEventListener("input", (e) => {
        const idx = e.target.getAttribute("data-idx");
        if (activeInvoiceLineItems[idx]) {
          activeInvoiceLineItems[idx].rate = parseFloat(e.target.value) || 0;
          calculateInvoiceTotals();
          const tr = e.target.closest("tr");
          if (tr && tr.children[3]) {
            tr.children[3].textContent = `KSh ${activeInvoiceLineItems[idx].rate.toLocaleString()}`;
          }
        }
      });
    });

    if (window.lucide) window.lucide.createIcons();
    calculateInvoiceTotals();
  }

  window.dpRemoveInvoiceLineItem = function(idx) {
    activeInvoiceLineItems.splice(idx, 1);
    renderInvoiceLineItemsTable();
  };

  function calculateInvoiceTotals() {
    let subtotal = 0;
    activeInvoiceLineItems.forEach(item => {
      subtotal += (Number(item.rate) || 0);
    });

    const grandTotal = subtotal;
    const isPlanEnabled = document.getElementById("invEnablePaymentPlan")?.checked || false;
    let deposit = 0;
    if (isPlanEnabled) {
      deposit = parseFloat(document.getElementById("invDepositAmount")?.value) || 0;
    }
    const balanceDue = Math.max(0, grandTotal - deposit);

    const subEl = document.getElementById("invSubtotalDisplay");
    const grandEl = document.getElementById("invGrandTotalDisplay");
    if (subEl) subEl.textContent = `KSh ${subtotal.toLocaleString("en-KE")}`;
    if (grandEl) grandEl.textContent = `KSh ${grandTotal.toLocaleString("en-KE")}`;

    const planTotalEl = document.getElementById("invPlanTotalDisplay");
    const planPaidEl = document.getElementById("invPlanPaidDisplay");
    const planBalEl = document.getElementById("invPlanBalanceDisplay");
    if (planTotalEl) planTotalEl.textContent = `KSh ${grandTotal.toLocaleString("en-KE")}`;
    if (planPaidEl) planPaidEl.textContent = `KSh ${deposit.toLocaleString("en-KE")}`;
    if (planBalEl) planBalEl.textContent = `KSh ${balanceDue.toLocaleString("en-KE")}`;

    return { subtotal, grandTotal, deposit, balanceDue, isPlanEnabled };
  }

  function collectInvoiceFormData() {
    const totals = calculateInvoiceTotals();
    const editingId = document.getElementById("invEditingId")?.value || "";
    const subId = document.getElementById("invSelectedSubId")?.value || "";
    const clientType = document.getElementById("invTypeSubscriber")?.checked ? "subscriber" : "general";
    const clientName = document.getElementById("invClientName")?.value.trim() || "";
    const phone = document.getElementById("invClientPhone")?.value.trim() || "";
    const email = document.getElementById("invClientEmail")?.value.trim() || "";
    const location = document.getElementById("invClientLocation")?.value.trim() || "Mombasa";
    const docType = document.getElementById("invDocType")?.value || "Proforma Invoice";
    const invoiceNo = document.getElementById("invInvoiceNumber")?.value.trim() || `#${String(Math.floor(Math.random() * 899 + 1)).padStart(3, '0')}/${currentYear.toString().slice(-2)}`;
    const issueDate = document.getElementById("invIssueDate")?.value || new Date().toISOString().split("T")[0];
    const dueDate = document.getElementById("invDueDate")?.value || new Date().toISOString().split("T")[0];
    const billingPeriod = document.getElementById("invBillingPeriod")?.value.trim() || `${monthNames[currentMonth]} ${currentYear}`;
    const validityNote = document.getElementById("invValidityNote")?.value.trim() || "Please Note: Valid for 14 days from date.";

    let status = "unpaid";
    if (totals.isPlanEnabled) {
      if (totals.deposit >= totals.grandTotal && totals.grandTotal > 0) {
        status = "paid";
      } else if (totals.deposit > 0) {
        status = "partial";
      } else {
        status = "unpaid";
      }
    } else {
      status = totals.grandTotal === 0 ? "paid" : "unpaid";
    }

    const depositLabel = document.getElementById("invDepositLabel")?.value.trim() || "1 ST Installment";

    const installments = [];
    if (totals.isPlanEnabled && totals.deposit > 0) {
      installments.push({
        label: depositLabel,
        amount: totals.deposit,
        date: issueDate
      });
    }

    return {
      id: editingId || ("inv_" + Date.now()),
      invoiceNo,
      docType,
      clientType,
      subId,
      clientName,
      phone,
      email,
      location,
      period: billingPeriod,
      issueDate,
      dueDate,
      validityNote,
      items: JSON.parse(JSON.stringify(activeInvoiceLineItems)),
      subtotal: totals.subtotal,
      amount: totals.grandTotal,
      grandTotal: totals.grandTotal,
      hasPaymentPlan: totals.isPlanEnabled,
      depositAmount: totals.deposit,
      depositLabel,
      installments,
      totalPaid: totals.deposit,
      balanceDue: totals.balanceDue,
      status,
      paymentMethod: "Direct M-Pesa & Bank Transfer"
    };
  }

  function saveInvoiceToState(invData) {
    if (!erpState.invoices) erpState.invoices = [];
    const idx = erpState.invoices.findIndex(i => i.id === invData.id || i.invoiceNo === invData.invoiceNo);
    if (idx >= 0) {
      erpState.invoices[idx] = invData;
    } else {
      erpState.invoices.unshift(invData);
    }

    // Auto-record in ledger if paid or partial deposit received
    if (invData.totalPaid > 0) {
      const alreadyInLedger = (erpState.ledger || []).some(t => t.reference === invData.invoiceNo && Number(t.amount) === Number(invData.totalPaid));
      if (!alreadyInLedger) {
        erpState.ledger.unshift({
          id: "tx_" + Date.now(),
          date: invData.issueDate || new Date().toISOString().split("T")[0],
          description: `Settlement / Deposit - ${invData.clientName} (${invData.invoiceNo})`,
          type: "income",
          amount: Number(invData.totalPaid),
          category: invData.clientType === "subscriber" ? "ISP Subscription Income" : "ICT Projects & Services",
          paymentMethod: "Direct M-Pesa / Bank",
          reference: invData.invoiceNo,
          entity: "DATA PORT Core"
        });
      }
    }

    saveDatabase();
    
    // Background sync to SQL database backend
    fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-key": "dpinc-staff-master" },
      body: JSON.stringify(invData)
    }).catch(err => console.warn("SQL Invoice Sync:", err));

    renderAll();
  }

  function formatOrdinalDate(dateStr) {
    if (!dateStr) return "--/--/----";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = d.getDate();
    let suffix = "th";
    if (day === 1 || day === 21 || day === 31) suffix = "st";
    else if (day === 2 || day === 22) suffix = "nd";
    else if (day === 3 || day === 23) suffix = "rd";
    const month = d.toLocaleDateString("en-GB", { month: "long" });
    const year = d.getFullYear();
    return `${day}<sup>${suffix}</sup> ${month} ${year}`;
  }

  /* =========================================================================
     MASTER A4 INVOICE TEMPLATE ENGINE (Matching Attached PDFs Exactly)
     ========================================================================= */
  function generateInvoiceDocumentHTML(data) {
    const isProforma = (data.docType || "").toLowerCase().includes("proforma");
    const items = (data.items && data.items.length > 0) ? data.items : [
      { title: "DataPort NET Public IP", qty: "25 mbps", rate: data.grandTotal || data.amount || 3000 }
    ];

    const grandTotal = Number(data.grandTotal || data.amount) || 0;
    const totalPaid = Number(data.totalPaid || data.depositAmount) || 0;
    const balanceDue = Number(data.balanceDue !== undefined ? data.balanceDue : (grandTotal - totalPaid)) || 0;
    const hasPlan = data.hasPaymentPlan || totalPaid > 0 || (data.installments && data.installments.length > 0);

    // Format numbers
    const formatKsh = (num) => (Number(num) || 0).toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const formatIntKsh = (num) => (Number(num) || 0).toLocaleString("en-KE");

    // Line items HTML
    const itemsHtml = items.map(item => `
      <tr style="border-bottom:1px solid #E2E8F0;">
        <td style="padding:10px 8px; text-align:left; font-size:0.925rem; color:#0F172A; vertical-align:middle;">
          ${escapeHtml(item.title || '')}
        </td>
        <td style="padding:10px 8px; text-align:center; font-size:0.9rem; color:#334155; vertical-align:middle;">
          ${escapeHtml(item.qty || '1')}
        </td>
        <td style="padding:10px 8px; text-align:right; font-size:0.925rem; font-family:'Inter', sans-serif; color:#0F172A; vertical-align:middle;">
          ${isProforma ? formatKsh(item.rate) : formatIntKsh(item.rate)}
        </td>
        <td style="padding:10px 8px; text-align:right; font-size:0.925rem; font-family:'Inter', sans-serif; font-weight:700; color:#0F172A; vertical-align:middle;">
          ${isProforma ? formatKsh(item.rate) : formatIntKsh(item.rate)}
        </td>
      </tr>
    `).join("");

    // Payment structure rows (PDF 2 format)
    let paymentStructureHtml = "";
    if (hasPlan) {
      let instRows = "";
      if (data.installments && data.installments.length > 0) {
        instRows = data.installments.map(inst => `
          <tr>
            <td style="padding:6px 8px; color:#0F172A; font-weight:600;">${escapeHtml(inst.label || '1 ST Installment')}</td>
            <td style="padding:6px 8px; text-align:right; font-weight:600;">Ksh ${formatKsh(inst.amount)}</td>
          </tr>
        `).join("");
      } else {
        instRows = `
          <tr>
            <td style="padding:6px 8px; color:#0F172A; font-weight:600;">${escapeHtml(data.depositLabel || '1 ST Installment')}</td>
            <td style="padding:6px 8px; text-align:right; font-weight:600;">Ksh ${formatKsh(totalPaid)}</td>
          </tr>
        `;
      }

      paymentStructureHtml = `
        <div style="margin:24px 0 20px 0;">
          <div style="text-align:center; font-weight:800; font-size:0.95rem; letter-spacing:0.06em; text-transform:uppercase; margin-bottom:8px; border-bottom:1px solid #CBD5E1; padding-bottom:6px; color:#0F172A;">
            PAYMENT STRUCTURE  -
          </div>
          <table style="width:100%; border-collapse:collapse; font-size:0.925rem;">
            <tbody>
              ${instRows}
              <tr style="border-top:1px solid #000000;">
                <td style="padding:8px 8px; font-weight:800; text-transform:uppercase; color:#0F172A;">TOTAL</td>
                <td style="padding:8px 8px; text-align:right; font-weight:800; color:#0F172A;">Ksh ${formatKsh(totalPaid)}</td>
              </tr>
              <tr style="border-bottom:1.5px solid #000000;">
                <td style="padding:8px 8px; font-weight:800; text-transform:uppercase; color:#0F172A;">BALANCE</td>
                <td style="padding:8px 8px; text-align:right; font-weight:800; color:${balanceDue > 0 ? '#B91C1C' : '#15803D'};">Ksh ${formatKsh(balanceDue)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      `;
    }

    // Top Header: Proforma vs Standard Invoice
    const headerRightHtml = isProforma ? `
      <div style="text-align:right;">
        <h2 style="font-size:1.65rem; font-weight:900; color:#0F172A; margin:0 0 4px 0; letter-spacing:-0.01em;">
          Proforma Invoice
        </h2>
        <div style="font-size:0.95rem; color:#0F172A; font-weight:700;">Inv No. ${escapeHtml(data.invoiceNo || '')}</div>
        <div style="font-size:0.875rem; color:#475569; margin-top:2px;">${formatOrdinalDate(data.issueDate)}</div>
        <div style="font-size:0.95rem; font-weight:700; color:#0F172A; margin-top:12px;">Billed to: <span>${escapeHtml(data.clientName || '')}</span></div>
      </div>
    ` : `
      <div style="text-align:right;">
        <div style="font-size:1.15rem; font-weight:900; color:#0F172A;">Invoice No. <span>${escapeHtml(data.invoiceNo || '')}</span></div>
        <div style="font-size:0.9rem; color:#475569; margin-top:3px;">${formatOrdinalDate(data.issueDate)}</div>
      </div>
    `;

    // Billed To row (shown prominently for PDF 1 format)
    const billedToHtml = (!isProforma || data.phone || data.location) ? `
      <div style="margin:20px 0 16px 0;">
        <div style="font-size:0.8rem; font-weight:800; text-transform:uppercase; letter-spacing:0.06em; color:#0F172A; margin-bottom:4px;">
          BILLED TO:
        </div>
        <div style="font-size:1.15rem; font-weight:800; color:#0F172A;">
          ${escapeHtml(data.clientName || 'Valued Client')}
        </div>
        ${data.phone ? `<div style="font-size:0.875rem; color:#334155; margin-top:2px;">Mpesa: <strong>${escapeHtml(data.phone)}</strong></div>` : ''}
        ${data.location ? `<div style="font-size:0.875rem; color:#334155; margin-top:2px;">Location: <strong>${escapeHtml(data.location)}</strong></div>` : ''}
      </div>
    ` : '';

    return `
      <div class="a4-document-sheet" style="font-family:'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background:#FFFFFF; color:#0F172A; line-height:1.45;">
        
        <!-- Header Top: Brandmark & Inv Number -->
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1.5rem;">
          <div>
            <div style="display:flex; align-items:center; gap:0.6rem;">
              <img src="public/logo-icon.png" alt="DataPort" style="height:62px; width:auto; display:block;" onerror="this.style.display='none'">
              <div>
                <div style="font-size:1.6rem; font-weight:900; color:#0F172A; letter-spacing:-0.03em;">
                  DataPort<span style="color:#5C9400; font-size:1.2em;">.</span><span style="font-size:0.65em; font-weight:800;">INC</span>
                </div>
                <div style="font-size:0.8rem; font-weight:900; color:#0F172A; text-transform:uppercase; letter-spacing:0.04em;">
                  EXCEL ENTERPRISE LIMITED
                </div>
              </div>
            </div>
          </div>
          ${headerRightHtml}
        </div>

        ${billedToHtml}

        <!-- Line Items Table -->
        <table style="width:100%; border-collapse:collapse; margin-top:16px; margin-bottom:12px; font-size:0.925rem;">
          <thead>
            <tr style="border-top:1.5px solid #000000; border-bottom:1.5px solid #000000;">
              <th style="padding:10px 8px; text-align:left; font-weight:700; text-transform:uppercase; font-size:0.825rem; letter-spacing:0.04em; color:#0F172A;">
                ${isProforma ? 'DESCRIPTION' : 'Item'}
              </th>
              <th style="padding:10px 8px; text-align:center; font-weight:700; text-transform:uppercase; font-size:0.825rem; letter-spacing:0.04em; width:18%; color:#0F172A;">
                ${isProforma ? 'QUANTITY' : 'Quantity'}
              </th>
              <th style="padding:10px 8px; text-align:right; font-weight:700; text-transform:uppercase; font-size:0.825rem; letter-spacing:0.04em; width:18%; color:#0F172A;">
                ${isProforma ? 'AMOUNT' : 'Unit Price'}
              </th>
              <th style="padding:10px 8px; text-align:right; font-weight:700; text-transform:uppercase; font-size:0.825rem; letter-spacing:0.04em; width:20%; color:#0F172A;">
                ${isProforma ? 'TOTAL' : 'Total(Ksh)'}
              </th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            ${(!isProforma && items.length > 1) ? `
              <tr style="border-top:1px solid #CBD5E1;">
                <td colspan="3" style="padding:8px 8px; text-align:right; font-weight:600; color:#475569;">Subtotal</td>
                <td style="padding:8px 8px; text-align:right; font-weight:700; color:#0F172A;">${formatIntKsh(grandTotal)}</td>
              </tr>
            ` : ''}
            <tr style="border-top:1.5px solid #000000; border-bottom:1.5px solid #000000;">
              <td colspan="3" style="padding:10px 8px; font-weight:800; font-size:1.05rem; text-transform:uppercase; color:#0F172A;">
                TOTAL
              </td>
              <td style="padding:10px 8px; text-align:right; font-weight:800; font-size:1.05rem; color:#0F172A;">
                Ksh ${isProforma ? formatKsh(grandTotal) : formatIntKsh(grandTotal)}
              </td>
            </tr>
          </tfoot>
        </table>

        <!-- Payment Structure for Installments / Partial Deposits -->
        ${paymentStructureHtml}

        <!-- Notes / Validity Term -->
        <div style="font-size:0.875rem; color:#475569; margin:16px 0 24px 0; font-style:italic;">
          ${escapeHtml(data.validityNote || (isProforma ? 'Please Note: Valid for 14 days from date.' : 'Thank you!'))}
        </div>

        <!-- Settlement Instructions & Corporate Dev Op's Signature Block -->
        <div style="display:flex; justify-content:space-between; align-items:flex-end; gap:20px; margin-top:24px; padding-top:16px; border-top:1px solid #E2E8F0;">
          
          <!-- Left: Official Payment Channels -->
          <div style="flex:1; max-width:55%;">
            <div style="font-size:0.825rem; font-weight:900; text-transform:uppercase; letter-spacing:0.06em; color:#0F172A; margin-bottom:8px;">
              PAYMENT INFORMATION
            </div>
            <div style="margin-bottom:10px; font-size:0.85rem; color:#1E293B; line-height:1.45;">
              <strong style="color:#0F172A; display:block;">MPESA (Mobile)</strong>
              <div>Account Name: <strong>Emmanuel Nyakundi</strong></div>
              <div>Phone No.: <strong>0790 964 002</strong></div>
            </div>
            <div style="font-size:0.85rem; color:#1E293B; line-height:1.45;">
              <strong style="color:#0F172A; display:block;">Standard Chartered Bank (Bank)</strong>
              <div>Account Name: <strong>Emmanuel Nyakundi</strong></div>
              <div>Account No.: <strong>0100499055400</strong></div>
            </div>
          </div>

          <!-- Right: Company Info & Dev Op's Engineer Signature Block -->
          <div style="text-align:right; min-width:220px;">
            <div style="margin-bottom:6px;">
              <div style="font-size:1.15rem; font-weight:900; color:#0F172A; letter-spacing:-0.02em;">
                DataPort<span style="color:#5C9400; font-size:1.2em;">.</span><span style="font-size:0.65em; font-weight:800;">INC</span>
              </div>
              <div style="font-size:0.775rem; color:#475569;">Along Jomo Kenyatta Avenue.</div>
              <div style="font-size:0.775rem; color:#475569;">Tel: +254 790 964 002</div>
              <div style="font-size:0.775rem; color:#475569;">Email: tech@dpinc.co.ke</div>
            </div>

            <!-- Authentic Blue Ink Vector Signature -->
            <div style="margin-top:10px; display:inline-block; text-align:center;">
              <svg width="120" height="38" viewBox="0 0 120 38" fill="none" style="display:block; margin:0 auto -4px auto;">
                <path d="M12 26 C24 8, 30 5, 38 18 C45 30, 48 10, 56 22 C62 31, 75 14, 88 24 C95 28, 105 18, 112 20" stroke="#1d4ed8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M22 14 C35 30, 50 33, 78 26" stroke="#1d4ed8" stroke-width="1.6" stroke-linecap="round"/>
              </svg>
              <div style="border-top:1px solid #1E293B; width:150px; margin:0 auto 3px auto;"></div>
              <div style="font-size:0.875rem; font-weight:800; color:#0F172A;">Nyakundi, E.</div>
              <div style="font-size:0.75rem; color:#475569; font-weight:600;">Dev Op's Engineer</div>
            </div>
          </div>

        </div>

      </div>
    `;
  }

  function renderLiveInvoicePreviewCard(data) {
    const container = document.getElementById("previewCardViewport");
    if (!container) return;
    const titleEl = document.getElementById("previewModalTitle");
    if (titleEl) titleEl.textContent = `${data.docType || 'Invoice'} ${data.invoiceNo} — ${data.clientName}`;
    container.innerHTML = generateInvoiceDocumentHTML(data);
  }

  function populatePrintableInvoice(data) {
    const container = document.getElementById("printableInvoiceSheet");
    if (!container) return;
    container.innerHTML = generateInvoiceDocumentHTML(data);
  }

  /* =========================================================================
     INVOICES HUB RENDERING & MANAGEMENT
     ========================================================================= */
  function renderInvoicesHub() {
    const tbody = document.getElementById("invoicesMasterTableBody");
    const invoices = erpState.invoices || [];

    // Compute Metrics
    let totalBilled = 0;
    let totalPaid = 0;
    let partialDeposits = 0;
    let pendingReceivables = 0;

    let countAll = invoices.length;
    let countUnpaid = 0;
    let countPartial = 0;
    let countPaid = 0;

    invoices.forEach(inv => {
      const gTotal = Number(inv.grandTotal || inv.amount) || 0;
      const tPaid = Number(inv.totalPaid || (inv.status === "paid" ? gTotal : inv.depositAmount)) || 0;
      const bal = Number(inv.balanceDue !== undefined ? inv.balanceDue : Math.max(0, gTotal - tPaid)) || 0;

      totalBilled += gTotal;

      if (inv.status === "paid" || tPaid >= gTotal && gTotal > 0) {
        totalPaid += gTotal;
        countPaid++;
      } else if (inv.status === "partial" || tPaid > 0) {
        totalPaid += tPaid;
        partialDeposits += tPaid;
        pendingReceivables += bal;
        countPartial++;
      } else {
        pendingReceivables += gTotal;
        countUnpaid++;
      }
    });

    // Update stats cards
    const elBilled = document.getElementById("invStatTotalBilled");
    const elPaid = document.getElementById("invStatTotalPaid");
    const elPartial = document.getElementById("invStatPartialDeposits");
    const elPending = document.getElementById("invStatPendingBalance");

    if (elBilled) elBilled.textContent = `KSh ${totalBilled.toLocaleString()}`;
    if (elPaid) elPaid.textContent = `KSh ${totalPaid.toLocaleString()}`;
    if (elPartial) elPartial.textContent = `KSh ${partialDeposits.toLocaleString()}`;
    if (elPending) elPending.textContent = `KSh ${pendingReceivables.toLocaleString()}`;

    const elTotalCount = document.getElementById("invStatTotalCount");
    const elPaidCount = document.getElementById("invStatPaidCount");
    const elPartialCount = document.getElementById("invStatPartialCount");
    const elDueCount = document.getElementById("invStatDueCount");

    if (elTotalCount) elTotalCount.textContent = `${countAll} Invoices Recorded`;
    if (elPaidCount) elPaidCount.textContent = `${countPaid} Cleared Full`;
    if (elPartialCount) elPartialCount.textContent = `${countPartial} Active Plans`;
    if (elDueCount) elDueCount.textContent = `${countUnpaid} Due / Unpaid`;

    // Update filter pill badges
    const pillAll = document.getElementById("pillCountAll");
    const pillUnpaid = document.getElementById("pillCountUnpaid");
    const pillPartial = document.getElementById("pillCountPartial");
    const pillPaid = document.getElementById("pillCountPaid");

    if (pillAll) pillAll.textContent = countAll;
    if (pillUnpaid) pillUnpaid.textContent = countUnpaid;
    if (pillPartial) pillPartial.textContent = countPartial;
    if (pillPaid) pillPaid.textContent = countPaid;

    if (!tbody) return;

    // Filter Invoices
    let filtered = invoices.filter(inv => {
      // Status filter
      if (currentInvoiceFilter === "unpaid" && inv.status !== "unpaid") return false;
      if (currentInvoiceFilter === "partial" && inv.status !== "partial") return false;
      if (currentInvoiceFilter === "paid" && inv.status !== "paid") return false;

      // Type filter
      if (currentInvoiceTypeFilter === "subscriber" && inv.clientType === "general") return false;
      if (currentInvoiceTypeFilter === "general" && inv.clientType === "subscriber") return false;

      // Search term
      if (currentInvoiceSearchTerm) {
        const query = currentInvoiceSearchTerm;
        const matchesClient = (inv.clientName || "").toLowerCase().includes(query);
        const matchesNo = (inv.invoiceNo || "").toLowerCase().includes(query);
        const matchesPhone = (inv.phone || "").toLowerCase().includes(query);
        if (!matchesClient && !matchesNo && !matchesPhone) return false;
      }

      return true;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center text-muted" style="padding:2.5rem;">
            No invoices found matching current filter criteria. Click "+ Create New Invoice" to bill clients.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filtered.map(inv => {
      const gTotal = Number(inv.grandTotal || inv.amount) || 0;
      const tPaid = Number(inv.totalPaid || (inv.status === "paid" ? gTotal : inv.depositAmount)) || 0;
      const bal = Number(inv.balanceDue !== undefined ? inv.balanceDue : Math.max(0, gTotal - tPaid)) || 0;

      // Status pill
      let statusBadge = "";
      if (inv.status === "paid") {
        statusBadge = `<span style="display:inline-block; padding:3px 10px; border-radius:12px; font-weight:800; font-size:0.75rem; text-transform:uppercase; background:rgba(34,197,94,0.15); border:1px solid #22c55e; color:#15803d;">PAID IN FULL</span>`;
      } else if (inv.status === "partial") {
        statusBadge = `<span style="display:inline-block; padding:3px 10px; border-radius:12px; font-weight:800; font-size:0.75rem; text-transform:uppercase; background:rgba(234,179,8,0.15); border:1px solid #eab308; color:#a16207;">PARTIAL DEPOSIT</span>`;
      } else {
        statusBadge = `<span style="display:inline-block; padding:3px 10px; border-radius:12px; font-weight:800; font-size:0.75rem; text-transform:uppercase; background:rgba(239,68,68,0.15); border:1px solid #ef4444; color:#b91c1c;">UNPAID / DUE</span>`;
      }

      // Client type pill
      const typeBadge = inv.clientType === "general" 
        ? `<span class="badge" style="font-size:0.68rem; background:rgba(59,130,246,0.1); border-color:rgba(59,130,246,0.3); color:#3b82f6;">General ICT</span>`
        : `<span class="badge" style="font-size:0.68rem; background:rgba(92,148,0,0.1); border-color:rgba(92,148,0,0.3); color:var(--lime);">ISP Subscriber</span>`;

      // Scope summary
      const itemsCount = inv.items ? inv.items.length : 1;
      const firstItemTitle = inv.items && inv.items[0] ? inv.items[0].title : (inv.package || "Internet Subscription");
      const summaryText = itemsCount > 1 ? `${firstItemTitle} (+${itemsCount - 1} more)` : firstItemTitle;

      return `
        <tr style="border-bottom:1px solid var(--border-color);">
          <td>
            <div style="font-family:var(--font-mono); font-weight:800; font-size:0.9rem; color:var(--text-primary);">${escapeHtml(inv.invoiceNo || '')}</div>
            <div style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase;">${escapeHtml(inv.docType || 'Invoice')}</div>
          </td>
          <td>
            <div style="display:flex; align-items:center; gap:0.4rem; margin-bottom:2px;">
              <strong style="color:var(--text-primary); font-size:0.925rem;">${escapeHtml(inv.clientName || '')}</strong>
              ${typeBadge}
            </div>
            <div style="font-size:0.8rem; color:var(--text-muted);">${escapeHtml(inv.phone || '')} • ${escapeHtml(inv.location || 'Mombasa')}</div>
          </td>
          <td>
            <div style="font-size:0.85rem; color:var(--text-primary);">${escapeHtml(summaryText)}</div>
            <div style="font-size:0.75rem; color:var(--text-muted);">Due: ${inv.dueDate || '--'}</div>
          </td>
          <td style="text-align:right; font-family:var(--font-mono); font-weight:800; color:var(--text-primary);">
            KSh ${gTotal.toLocaleString()}
          </td>
          <td style="text-align:right; font-family:var(--font-mono); font-weight:700; color:#22c55e;">
            KSh ${tPaid.toLocaleString()}
          </td>
          <td style="text-align:right; font-family:var(--font-mono); font-weight:800; color:${bal > 0 ? '#ef4444' : '#22c55e'};">
            KSh ${bal.toLocaleString()}
          </td>
          <td style="text-align:center;">
            ${statusBadge}
          </td>
          <td style="text-align:right;">
            <div style="display:flex; justify-content:flex-end; gap:0.35rem; flex-wrap:wrap;">
              <button class="btn btn-secondary btn-sm" style="padding:0.35rem 0.6rem;" title="Live A4 Preview" onclick="window.dpOpenPreviewInvoice('${inv.id}')">
                <i data-lucide="eye" style="width:13px; height:13px;"></i>
              </button>
              <button class="btn btn-secondary btn-sm" style="padding:0.35rem 0.6rem;" title="Print / Save PDF" onclick="window.dpPrintInvoice('${inv.id}')">
                <i data-lucide="printer" style="width:13px; height:13px;"></i>
              </button>
              <button class="btn btn-secondary btn-sm" style="padding:0.35rem 0.6rem; color:#22c55e;" title="Record Payment / Deposit" onclick="window.dpRecordInvoicePayment('${inv.id}')">
                <i data-lucide="wallet" style="width:13px; height:13px;"></i>
              </button>
              <button class="btn btn-secondary btn-sm" style="padding:0.35rem 0.6rem; color:#25D366;" title="Send WhatsApp Bill" onclick="window.dpDispatchInvoiceWhatsApp('${inv.id}')">
                <i data-lucide="message-square" style="width:13px; height:13px;"></i>
              </button>
              <button class="btn btn-secondary btn-sm" style="padding:0.35rem 0.6rem;" title="Edit Invoice" onclick="window.dpOpenCreateInvoice(null, '${inv.id}')">
                <i data-lucide="edit-3" style="width:13px; height:13px;"></i>
              </button>
              <button class="btn btn-secondary btn-sm" style="padding:0.35rem 0.6rem; color:#ef4444;" title="Delete Invoice" onclick="window.dpDeleteInvoice('${inv.id}')">
                <i data-lucide="trash-2" style="width:13px; height:13px;"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join("");

    if (window.lucide) window.lucide.createIcons();
  }

  function dispatchInvoiceViaWhatsApp(data) {
    const cleanPhone = (data.phone || "").replace(/[^0-9]/g, "");
    const formattedPhone = cleanPhone.startsWith("0") ? "254" + cleanPhone.substring(1) : cleanPhone;
    
    let itemsText = "";
    if (data.items && data.items.length > 0) {
      data.items.forEach(i => {
        itemsText += `  • ${i.title} (${i.qty || '1'}): KSh ${Number(i.rate).toLocaleString()}\n`;
      });
    }

    const grandTotal = Number(data.grandTotal || data.amount) || 0;
    const totalPaid = Number(data.totalPaid || data.depositAmount) || 0;
    const balanceDue = Number(data.balanceDue !== undefined ? data.balanceDue : (grandTotal - totalPaid)) || 0;

    let balanceText = "";
    if (totalPaid > 0) {
      balanceText = `*DEPOSIT PAID:* KSh ${totalPaid.toLocaleString()}\n*BALANCE DUE:* *KSh ${balanceDue.toLocaleString()}*\n\n`;
    }

    const msg = `*DATA PORT LIMITED — OFFICIAL INVOICE NOTICE*\n\n` +
      `Dear *${data.clientName}*,\n\n` +
      `Your *${data.docType || 'Invoice'}* is ready.\n\n` +
      `*Invoice Ref:* ${data.invoiceNo}\n` +
      `*Due Date:* ${data.dueDate}\n\n` +
      `*Service Breakdown:*\n${itemsText}\n` +
      `*TOTAL AMOUNT:* *KSh ${grandTotal.toLocaleString()}*\n` +
      balanceText +
      `*Direct Payment Channels:*\n` +
      `👉 *MPESA (Mobile):* 0790 964 002 (Emmanuel Nyakundi)\n` +
      `👉 *Standard Chartered Bank:* Acc No: 0100499055400 (Emmanuel Nyakundi)\n\n` +
      `Thank you for choosing Data Port Limited!`;

    window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(msg)}`, "_blank");
    showToast(`WhatsApp billing notice ready for ${data.clientName}`);
  }

  /* =========================================================================
     GLOBAL WINDOW INVOICING ACTIONS
     ========================================================================= */
  window.dpOpenCreateInvoice = function(subId, invId) {
    if (typeof subId !== "string") subId = null;
    if (typeof invId !== "string") invId = null;

    const modal = document.getElementById("createInvoiceModal");
    if (!modal) return;

    // Refresh active subscriber dropdown
    const select = document.getElementById("invSelectSubscriber");
    if (select) {
      let optionsHtml = `<option value="">-- Choose Active Subscriber --</option>`;
      (erpState.subscribers || []).forEach(sub => {
        optionsHtml += `<option value="${sub.id}">${sub.name} (${sub.package} — KSh ${(sub.monthlyRate || sub.price || 0).toLocaleString()})</option>`;
      });
      select.innerHTML = optionsHtml;
    }

    activeInvoiceLineItems = [];

    const now = new Date();
    const issueDateStr = now.toISOString().split("T")[0];
    const dueDateObj = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    const dueDateStr = dueDateObj.toISOString().split("T")[0];

    const radSubscriber = document.getElementById("invTypeSubscriber");
    const radGeneral = document.getElementById("invTypeGeneral");
    const subSelectRow = document.getElementById("invSubscriberSelectRow");
    const enablePlanCheckbox = document.getElementById("invEnablePaymentPlan");
    const planFields = document.getElementById("invPaymentPlanFields");

    // Case 1: Editing Existing Invoice
    if (invId) {
      const inv = (erpState.invoices || []).find(i => i.id === invId);
      if (inv) {
        document.getElementById("invModalTitle").textContent = `Edit Invoice ${inv.invoiceNo}`;
        document.getElementById("invEditingId").value = inv.id;
        document.getElementById("invSelectedSubId").value = inv.subId || "";
        document.getElementById("invClientName").value = inv.clientName || "";
        document.getElementById("invClientPhone").value = inv.phone || "";
        document.getElementById("invClientEmail").value = inv.email || "";
        document.getElementById("invClientLocation").value = inv.location || "Mombasa";
        document.getElementById("invDocType").value = inv.docType || "Proforma Invoice";
        document.getElementById("invInvoiceNumber").value = inv.invoiceNo || "";
        document.getElementById("invIssueDate").value = inv.issueDate || issueDateStr;
        document.getElementById("invDueDate").value = inv.dueDate || dueDateStr;
        document.getElementById("invBillingPeriod").value = inv.period || `${monthNames[currentMonth]} ${currentYear}`;
        document.getElementById("invValidityNote").value = inv.validityNote || "Please Note: Valid for 14 days from date.";

        const isSub = inv.clientType === "subscriber" || !!inv.subId;
        if (radSubscriber) radSubscriber.checked = isSub;
        if (radGeneral) radGeneral.checked = !isSub;
        if (subSelectRow) subSelectRow.style.display = isSub ? "block" : "none";
        if (select && inv.subId) select.value = inv.subId;

        const hasPlan = inv.hasPaymentPlan || (inv.depositAmount > 0) || (inv.totalPaid > 0);
        if (enablePlanCheckbox) enablePlanCheckbox.checked = hasPlan;
        if (planFields) planFields.style.display = hasPlan ? "block" : "none";
        document.getElementById("invDepositAmount").value = inv.totalPaid || inv.depositAmount || 0;
        document.getElementById("invDepositLabel").value = inv.depositLabel || "1 ST Installment";

        activeInvoiceLineItems = (inv.items && inv.items.length > 0) ? JSON.parse(JSON.stringify(inv.items)) : [
          { title: inv.package || "Internet Subscription", qty: "1 Month", rate: inv.grandTotal || inv.amount || 3000 }
        ];

        renderInvoiceLineItemsTable();
        modal.style.display = "flex";
        if (window.lucide) window.lucide.createIcons();
        return;
      }
    }

    // Case 2: New Invoice
    document.getElementById("invModalTitle").textContent = "Create Client Invoice & Bill";
    document.getElementById("invEditingId").value = "";
    document.getElementById("invIssueDate").value = issueDateStr;
    document.getElementById("invDueDate").value = dueDateStr;
    document.getElementById("invBillingPeriod").value = `${monthNames[currentMonth]} ${currentYear}`;
    document.getElementById("invDocType").value = "Proforma Invoice";
    document.getElementById("invInvoiceNumber").value = `#${String(Math.floor(Math.random() * 899 + 1)).padStart(3, '0')}/${currentYear.toString().slice(-2)}`;
    document.getElementById("invValidityNote").value = "Please Note: Valid for 14 days from date.";
    document.getElementById("invDepositAmount").value = 0;
    document.getElementById("invDepositLabel").value = "1 ST Installment";
    if (enablePlanCheckbox) enablePlanCheckbox.checked = false;
    if (planFields) planFields.style.display = "none";

    if (subId) {
      if (radSubscriber) radSubscriber.checked = true;
      if (subSelectRow) subSelectRow.style.display = "block";
      if (select) select.value = subId;
      const sub = (erpState.subscribers || []).find(s => s.id === subId);
      if (sub) {
        document.getElementById("invSelectedSubId").value = sub.id;
        document.getElementById("invClientName").value = sub.name || "";
        document.getElementById("invClientPhone").value = sub.phone || "";
        document.getElementById("invClientEmail").value = sub.email || "";
        document.getElementById("invClientLocation").value = sub.location || "Mombasa";

        activeInvoiceLineItems.push({
          id: "item_" + Date.now(),
          title: "DataPort NET Public IP",
          qty: sub.speed || (sub.package && sub.package.includes("Mbps") ? sub.package.match(/\d+\s*mbps/i)?.[0].toLowerCase() : "25 mbps") || "25 mbps",
          rate: Number(sub.monthlyRate || sub.price) || 3000
        });
      }
    } else {
      if (radSubscriber) radSubscriber.checked = true;
      if (subSelectRow) subSelectRow.style.display = "block";
      if (select) select.value = "";
      document.getElementById("invSelectedSubId").value = "";
      document.getElementById("invClientName").value = "";
      document.getElementById("invClientPhone").value = "";
      document.getElementById("invClientEmail").value = "";
      document.getElementById("invClientLocation").value = "";

      activeInvoiceLineItems.push({
        id: "item_" + Date.now(),
        title: "DataPort NET Public IP",
        qty: "25 mbps",
        rate: 3000
      });
    }

    renderInvoiceLineItemsTable();
    modal.style.display = "flex";
    if (window.lucide) window.lucide.createIcons();
  };

  window.dpOpenPreviewInvoice = function(invId) {
    const inv = (erpState.invoices || []).find(i => i.id === invId);
    if (!inv) return;
    window.__currentPreviewInvoice = inv;
    renderLiveInvoicePreviewCard(inv);
    document.getElementById("invoicePreviewModal").style.display = "flex";
    if (window.lucide) window.lucide.createIcons();
  };

  window.dpPrintInvoice = function(invId) {
    const inv = (erpState.invoices || []).find(i => i.id === invId);
    if (!inv) return;
    populatePrintableInvoice(inv);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  window.dpRecordInvoicePayment = function(invId) {
    const inv = (erpState.invoices || []).find(i => i.id === invId);
    if (!inv) return;

    const modal = document.getElementById("receivePaymentModal");
    if (!modal) return;

    const gTotal = Number(inv.grandTotal || inv.amount) || 0;
    const tPaid = Number(inv.totalPaid || inv.depositAmount) || 0;
    const bal = Math.max(0, gTotal - tPaid);

    document.getElementById("payInvoiceId").value = inv.id;
    document.getElementById("paySubId").value = inv.subId || "";
    document.getElementById("payClientName").value = inv.clientName || "";
    document.getElementById("payAmount").value = bal > 0 ? bal : gTotal;
    document.getElementById("payDate").value = new Date().toISOString().split("T")[0];

    modal.style.display = "flex";
    if (window.lucide) window.lucide.createIcons();
  };

  window.dpDispatchInvoiceWhatsApp = function(invId) {
    const inv = (erpState.invoices || []).find(i => i.id === invId);
    if (!inv) return;
    dispatchInvoiceViaWhatsApp(inv);
  };

  window.dpDeleteInvoice = function(invId) {
    const inv = (erpState.invoices || []).find(i => i.id === invId);
    if (!inv) return;
    if (!confirm(`Are you sure you want to delete invoice ${inv.invoiceNo} for ${inv.clientName}?`)) return;

    erpState.invoices = (erpState.invoices || []).filter(i => i.id !== invId);
    saveDatabase();

    // Background delete from SQL database backend
    fetch(`/api/invoices/${invId}`, {
      method: "DELETE",
      headers: { "x-admin-key": "dpinc-staff-master" }
    }).catch(err => console.warn("SQL Delete Sync:", err));

    renderAll();
    showToast(`Invoice ${inv.invoiceNo} deleted from database.`);
  };

  window.dpOpenBatchInvoices = function() {
    const batchModal = document.getElementById("batchInvoiceModal");
    if (!batchModal) return;

    const subs = erpState.subscribers || [];
    const tbody = document.getElementById("batchSubsTableBody");
    const totalEl = document.getElementById("batchTotalAmount");
    const badgeEl = document.getElementById("batchActiveCount");
    const period = `${monthNames[currentMonth]} ${currentYear}`;

    let total = 0;
    let html = "";

    subs.forEach(sub => {
      const rate = Number(sub.monthlyRate || sub.price) || 0;
      total += rate;
      const existing = (erpState.invoices || []).find(i => (i.subId === sub.id || i.clientName === sub.name) && i.period === period);
      const statusPill = existing 
        ? `<span class="badge" style="background:#dcfce7; color:#15803d; border-color:#22c55e;">Ready (${existing.invoiceNo})</span>`
        : `<span class="badge" style="background:#fee2e2; color:#b91c1c; border-color:#ef4444;">Pending</span>`;

      html += `
        <tr style="border-bottom:1px solid var(--border-color);">
          <td style="padding:8px 10px;"><strong>${escapeHtml(sub.name)}</strong></td>
          <td style="padding:8px 10px;">${escapeHtml(sub.package)}</td>
          <td style="padding:8px 10px; font-family:var(--font-mono); text-align:right;">KSh ${rate.toLocaleString()}</td>
          <td style="padding:8px 10px; text-align:center;">${statusPill}</td>
        </tr>
      `;
    });

    if (tbody) tbody.innerHTML = html;
    if (totalEl) totalEl.textContent = `KSh ${total.toLocaleString()}`;
    if (badgeEl) badgeEl.textContent = `${subs.length} Active Subscribers`;

    batchModal.style.display = "flex";
    if (window.lucide) window.lucide.createIcons();
  };

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
            <button class="btn btn-secondary btn-sm" title="Generate / Print Official Invoice" onclick="window.dpOpenCreateInvoice('${sub.id}')">
              <i data-lucide="printer" style="width:13px; height:13px;"></i> Invoice
            </button>
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

        // Mark invoice paid or update partial deposit / installment
        let invoice = (erpState.invoices || []).find(i => i.id === invId || (i.subId === subId && i.period && i.period.includes(monthNames[currentMonth])));
        if (invoice) {
          const invGrandTotal = Number(invoice.grandTotal || invoice.amount) || amount;
          const prevPaid = Number(invoice.totalPaid || (invoice.status === "paid" ? invGrandTotal : invoice.depositAmount)) || 0;
          const newTotalPaid = prevPaid + amount;
          invoice.totalPaid = newTotalPaid;
          invoice.balanceDue = Math.max(0, invGrandTotal - newTotalPaid);
          
          if (!invoice.installments) invoice.installments = [];
          invoice.installments.push({
            label: `${invoice.installments.length + 1} ST Installment`,
            amount: amount,
            date: payDate,
            ref: refCode
          });

          if (invoice.balanceDue <= 0) {
            invoice.status = "paid";
            invoice.paidAt = new Date().toISOString();
          } else {
            invoice.status = "partial";
            invoice.hasPaymentPlan = true;
          }
        } else {
          invoice = {
            id: "inv_" + Date.now(),
            invoiceNo: `PROF-${currentYear}-${Math.floor(Math.random() * 8999 + 1000)}`,
            subId: subId,
            clientName: clientName,
            amount: amount,
            grandTotal: amount,
            totalPaid: amount,
            balanceDue: 0,
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

    // Open in Full Invoice Builder
    const fullBuilderBtn = document.getElementById("drawerOpenFullBuilderBtn");
    if (fullBuilderBtn) {
      fullBuilderBtn.onclick = () => {
        document.getElementById("invoiceDrawerModal").style.display = "none";
        window.dpOpenCreateInvoice(sub.id);
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
        populatePrintableInvoice({
          docType: "PROFORMA INVOICE",
          invoiceNo: inv.invoiceNo,
          issueDate: new Date().toISOString().split("T")[0],
          dueDate: inv.dueDate,
          clientName: sub.name,
          phone: sub.phone,
          email: sub.email || "billing@dpinc.top",
          location: sub.location || "Mombasa",
          accountRef: sub.pppoeUser || `client_${sub.id}`,
          period: inv.period,
          status: inv.status || "unpaid",
          items: [
            {
              title: `${sub.package} — Monthly Dedicated Internet Subscription`,
              qty: "1 Month",
              rate: Number(inv.amount) || sub.monthlyRate || sub.price || 3500
            }
          ],
          subtotal: Number(inv.amount) || sub.monthlyRate || sub.price || 3500,
          vatAmount: 0,
          vatMode: "zero",
          grandTotal: Number(inv.amount) || sub.monthlyRate || sub.price || 3500
        });
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
     13B. SERVICE PRICING & TARIFF MANAGER (BACKEND CHARGE EDITOR)
     ========================================================================= */
  const DEFAULT_COMMERCIAL_TARIFFS = {
    essentials: [
      {
        id: "pkg-secure-office",
        name: "Secure Office Starter",
        badge: "Best for Small Business",
        price: 35000,
        period: "One-Off Investment",
        description: "18-Camera CCTV Setup & Configuration, Secure Dual WiFi Config, Hardware Firewall Setup."
      },
      {
        id: "pkg-digital-launchpad",
        name: "Digital Launchpad",
        badge: "High Growth Package",
        price: 30000,
        period: "One-Off Investment",
        description: "Dynamic Responsive Website (5 Custom Pages), 1 Year Cloud Hosting & SSL, 30s Motion Graphic Ad."
      }
    ],
    hardware: [
      {
        id: "itm-01",
        name: "Small Business Firewall & Configuration",
        category: "Network",
        price: 10000,
        unit: "One-Off Service",
        description: "Port filtering, VPN configuration, staff bandwidth management, and intrusion prevention."
      },
      {
        id: "itm-02",
        name: "Long-Range WiFi Access Point (Installation Included)",
        category: "Network",
        price: 35000,
        unit: "Per Unit / Setup",
        description: "High-density enterprise wireless AP installation, structured cabling, and signal heatmap tuning."
      },
      {
        id: "itm-05",
        name: "Windows Server Setup + Domain Controller",
        category: "Server",
        price: 45000,
        unit: "Service Only",
        description: "Active Directory, user permission hierarchies, group policies, centralized file sharing, and automated backup."
      }
    ],
    software: [
      {
        id: "itm-03",
        name: "Motion Graphics Ad (Social Media Creative Direction)",
        category: "Creative",
        price: 20000,
        unit: "Per 30s Video",
        description: "Full storyboard, custom animation, voiceover sync, and format exports for Instagram, TikTok, and web displays."
      },
      {
        id: "itm-04",
        name: "Custom Web App / System (Billing Automation Software)",
        category: "Dev",
        price: 40000,
        unit: "Starting Price",
        description: "Bespoke database-backed software to automate invoicing, billing workflows, and client management."
      }
    ],
    amc: [
      {
        id: "amc-01",
        name: "Standard Plan Retainer (Mass Market)",
        category: "Retainer",
        price: 70000,
        unit: "/ year",
        description: "Mon-Fri (8:30 - 18:00), 4h SLA, 1 preventive visit/month, network & PC support."
      },
      {
        id: "amc-02",
        name: "Premium Corporate Plan (24/7 SLA)",
        category: "Retainer",
        price: 90000,
        unit: "/ year",
        description: "24/7 remote support, 1h SLA priority, unlimited remote + 2 site visits/month, DevOps."
      },
      {
        id: "adh-01",
        name: "On-Demand Engineering Support",
        category: "Hourly",
        price: 2500,
        unit: "/ hour (Min 2 hrs)",
        description: "Emergency on-site and remote ad-hoc troubleshooting and repair (Minimum 2 hours per dispatch)."
      }
    ]
  };

  function getSavedTariffs() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TARIFFS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object" && parsed.essentials) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn("Error reading saved tariffs, falling back to defaults", err);
    }
    return JSON.parse(JSON.stringify(DEFAULT_COMMERCIAL_TARIFFS));
  }

  function initTariffManager() {
    const saveBtn = document.getElementById("saveAllTariffsBtn");
    const resetBtn = document.getElementById("resetTariffsBtn");
    const addBtn = document.getElementById("addCustomTariffBtn");

    if (saveBtn) {
      saveBtn.addEventListener("click", () => saveAllTariffs());
    }
    if (resetBtn) {
      resetBtn.addEventListener("click", () => resetTariffsToDefault());
    }
    if (addBtn) {
      addBtn.addEventListener("click", () => addCustomTariff());
    }
  }

  function renderTariffManager() {
    const tariffs = getSavedTariffs();

    const essentialsContainer = document.getElementById("essentialsTariffsList");
    const hardwareContainer = document.getElementById("hardwareTariffsList");
    const softwareContainer = document.getElementById("softwareTariffsList");
    const amcContainer = document.getElementById("amcTariffsList");

    if (!essentialsContainer || !hardwareContainer || !softwareContainer || !amcContainer) return;

    // Render Essentials
    essentialsContainer.innerHTML = tariffs.essentials.map((pkg, idx) => `
      <div class="tariff-edit-row" data-tariff-group="essentials" data-id="${pkg.id}" style="display:flex; flex-direction:column; gap:0.5rem; padding:0.85rem 1rem; border:1px solid var(--border-color); border-radius:var(--radius-md); background:var(--bg-secondary); margin-bottom:0.75rem;">
        <div style="display:flex; align-items:center; justify-content:space-between; gap:0.75rem; flex-wrap:wrap; width:100%;">
          <div style="flex:1; min-width:200px;">
            <label style="font-size:0.72rem; color:var(--text-muted); font-weight:700; text-transform:uppercase; margin-bottom:2px; display:block;">Package Name</label>
            <input type="text" class="form-input tariff-name-input" value="${escapeHtml(pkg.name)}" style="font-weight:700; font-size:0.95rem; padding:0.4rem 0.6rem; width:100%;">
          </div>
          <div style="width:140px;">
            <label style="font-size:0.72rem; color:var(--text-muted); font-weight:700; text-transform:uppercase; margin-bottom:2px; display:block;">Billing Term</label>
            <input type="text" class="form-input tariff-unit-input" value="${escapeHtml(pkg.period || 'One-Off Investment')}" style="font-size:0.85rem; padding:0.4rem 0.6rem; width:100%;">
          </div>
          <div style="width:160px;">
            <label style="font-size:0.72rem; color:var(--text-muted); font-weight:700; text-transform:uppercase; margin-bottom:2px; display:block;">Package Price (KSh)</label>
            <div style="display:flex; align-items:center; gap:4px;">
              <span style="font-family:var(--font-mono); font-weight:700; font-size:0.85rem; color:var(--text-secondary);">KSh</span>
              <input type="number" step="500" min="0" class="form-input tariff-price-input" value="${pkg.price}" style="font-weight:800; font-family:var(--font-mono); color:var(--lime-dark); padding:0.4rem 0.6rem; width:100%;">
            </div>
          </div>
          <div style="display:flex; align-items:flex-end; padding-top:1.1rem;">
            <button class="btn btn-secondary btn-sm" onclick="window.dpRemoveCustomTariff('essentials', '${pkg.id}')" title="Permanently delete package" style="color:#ef4444; border-color:rgba(239,68,68,0.25); padding:0.4rem 0.6rem;">
              <i data-lucide="trash-2" style="width:14px; height:14px;"></i>
            </button>
          </div>
        </div>
        <div style="width:100%;">
          <label style="font-size:0.72rem; color:var(--text-muted); font-weight:600; margin-bottom:2px; display:block;">Deliverables & Scope Specification</label>
          <input type="text" class="form-input tariff-desc-input" value="${escapeHtml(pkg.description || '')}" placeholder="Scope description, hardware included, deliverables..." style="font-size:0.8rem; color:var(--text-secondary); padding:0.35rem 0.6rem; width:100%;">
        </div>
      </div>
    `).join("") + `
      <button type="button" class="btn btn-secondary btn-sm" onclick="window.dpAddCustomTariffToCategory('essentials')" style="width:100%; margin-top:0.35rem; font-size:0.8rem; padding:0.5rem;">
        <i data-lucide="plus" style="width:13px; height:13px;"></i> + Add New Essentials Package
      </button>
    `;

    // Render Hardware
    hardwareContainer.innerHTML = tariffs.hardware.map((item, idx) => `
      <div class="tariff-edit-row" data-tariff-group="hardware" data-id="${item.id}" data-idx="${idx}" style="display:flex; flex-direction:column; gap:0.5rem; padding:0.85rem 1rem; border:1px solid var(--border-color); border-radius:var(--radius-md); background:var(--bg-secondary); margin-bottom:0.75rem;">
        <div style="display:flex; align-items:center; justify-content:space-between; gap:0.75rem; flex-wrap:wrap; width:100%;">
          <div style="flex:1; min-width:200px;">
            <label style="font-size:0.72rem; color:var(--text-muted); font-weight:700; text-transform:uppercase; margin-bottom:2px; display:block;">Service / Item</label>
            <input type="text" class="form-input tariff-name-input" value="${escapeHtml(item.name)}" style="font-weight:700; font-size:0.95rem; padding:0.4rem 0.6rem; width:100%;">
          </div>
          <div style="width:140px;">
            <label style="font-size:0.72rem; color:var(--text-muted); font-weight:700; text-transform:uppercase; margin-bottom:2px; display:block;">Unit / Terms</label>
            <input type="text" class="form-input tariff-unit-input" value="${escapeHtml(item.unit || 'Per Setup')}" style="font-size:0.85rem; padding:0.4rem 0.6rem; width:100%;">
          </div>
          <div style="width:160px;">
            <label style="font-size:0.72rem; color:var(--text-muted); font-weight:700; text-transform:uppercase; margin-bottom:2px; display:block;">Charge (KSh)</label>
            <div style="display:flex; align-items:center; gap:4px;">
              <span style="font-family:var(--font-mono); font-weight:700; font-size:0.85rem; color:var(--text-secondary);">KSh</span>
              <input type="number" step="500" min="0" class="form-input tariff-price-input" value="${item.price}" style="font-weight:800; font-family:var(--font-mono); color:var(--lime-dark); padding:0.4rem 0.6rem; width:100%;">
            </div>
          </div>
          <div style="display:flex; align-items:flex-end; padding-top:1.1rem;">
            <button class="btn btn-secondary btn-sm" onclick="window.dpRemoveCustomTariff('hardware', '${item.id}')" title="Permanently delete service item" style="color:#ef4444; border-color:rgba(239,68,68,0.25); padding:0.4rem 0.6rem;">
              <i data-lucide="trash-2" style="width:14px; height:14px;"></i>
            </button>
          </div>
        </div>
        <div style="width:100%;">
          <label style="font-size:0.72rem; color:var(--text-muted); font-weight:600; margin-bottom:2px; display:block;">Technical Scope / Specifications</label>
          <input type="text" class="form-input tariff-desc-input" value="${escapeHtml(item.description || '')}" placeholder="Port filtering, configuration terms, cable length..." style="font-size:0.8rem; color:var(--text-secondary); padding:0.35rem 0.6rem; width:100%;">
        </div>
      </div>
    `).join("") + `
      <button type="button" class="btn btn-secondary btn-sm" onclick="window.dpAddCustomTariffToCategory('hardware')" style="width:100%; margin-top:0.35rem; font-size:0.8rem; padding:0.5rem;">
        <i data-lucide="plus" style="width:13px; height:13px;"></i> + Add Hardware / Network Service
      </button>
    `;

    // Render Software
    softwareContainer.innerHTML = tariffs.software.map((item, idx) => `
      <div class="tariff-edit-row" data-tariff-group="software" data-id="${item.id}" data-idx="${idx}" style="display:flex; flex-direction:column; gap:0.5rem; padding:0.85rem 1rem; border:1px solid var(--border-color); border-radius:var(--radius-md); background:var(--bg-secondary); margin-bottom:0.75rem;">
        <div style="display:flex; align-items:center; justify-content:space-between; gap:0.75rem; flex-wrap:wrap; width:100%;">
          <div style="flex:1; min-width:200px;">
            <label style="font-size:0.72rem; color:var(--text-muted); font-weight:700; text-transform:uppercase; margin-bottom:2px; display:block;">Software / Creative Service</label>
            <input type="text" class="form-input tariff-name-input" value="${escapeHtml(item.name)}" style="font-weight:700; font-size:0.95rem; padding:0.4rem 0.6rem; width:100%;">
          </div>
          <div style="width:140px;">
            <label style="font-size:0.72rem; color:var(--text-muted); font-weight:700; text-transform:uppercase; margin-bottom:2px; display:block;">Unit / Terms</label>
            <input type="text" class="form-input tariff-unit-input" value="${escapeHtml(item.unit || 'Starting Price')}" style="font-size:0.85rem; padding:0.4rem 0.6rem; width:100%;">
          </div>
          <div style="width:160px;">
            <label style="font-size:0.72rem; color:var(--text-muted); font-weight:700; text-transform:uppercase; margin-bottom:2px; display:block;">Charge (KSh)</label>
            <div style="display:flex; align-items:center; gap:4px;">
              <span style="font-family:var(--font-mono); font-weight:700; font-size:0.85rem; color:var(--text-secondary);">KSh</span>
              <input type="number" step="500" min="0" class="form-input tariff-price-input" value="${item.price}" style="font-weight:800; font-family:var(--font-mono); color:var(--lime-dark); padding:0.4rem 0.6rem; width:100%;">
            </div>
          </div>
          <div style="display:flex; align-items:flex-end; padding-top:1.1rem;">
            <button class="btn btn-secondary btn-sm" onclick="window.dpRemoveCustomTariff('software', '${item.id}')" title="Permanently delete service item" style="color:#ef4444; border-color:rgba(239,68,68,0.25); padding:0.4rem 0.6rem;">
              <i data-lucide="trash-2" style="width:14px; height:14px;"></i>
            </button>
          </div>
        </div>
        <div style="width:100%;">
          <label style="font-size:0.72rem; color:var(--text-muted); font-weight:600; margin-bottom:2px; display:block;">Software Scope & Deliverables</label>
          <input type="text" class="form-input tariff-desc-input" value="${escapeHtml(item.description || '')}" placeholder="Database backends, creative storyboard, hosting terms..." style="font-size:0.8rem; color:var(--text-secondary); padding:0.35rem 0.6rem; width:100%;">
        </div>
      </div>
    `).join("") + `
      <button type="button" class="btn btn-secondary btn-sm" onclick="window.dpAddCustomTariffToCategory('software')" style="width:100%; margin-top:0.35rem; font-size:0.8rem; padding:0.5rem;">
        <i data-lucide="plus" style="width:13px; height:13px;"></i> + Add Software / Dev Service
      </button>
    `;

    // Render AMC
    amcContainer.innerHTML = tariffs.amc.map((item, idx) => `
      <div class="tariff-edit-row" data-tariff-group="amc" data-id="${item.id}" data-idx="${idx}" style="display:flex; flex-direction:column; gap:0.5rem; padding:0.85rem 1rem; border:1px solid var(--border-color); border-radius:var(--radius-md); background:var(--bg-secondary); margin-bottom:0.75rem;">
        <div style="display:flex; align-items:center; justify-content:space-between; gap:0.75rem; flex-wrap:wrap; width:100%;">
          <div style="flex:1; min-width:200px;">
            <label style="font-size:0.72rem; color:var(--text-muted); font-weight:700; text-transform:uppercase; margin-bottom:2px; display:block;">SLA Retainer / Support Plan</label>
            <input type="text" class="form-input tariff-name-input" value="${escapeHtml(item.name)}" style="font-weight:700; font-size:0.95rem; padding:0.4rem 0.6rem; width:100%;">
          </div>
          <div style="width:140px;">
            <label style="font-size:0.72rem; color:var(--text-muted); font-weight:700; text-transform:uppercase; margin-bottom:2px; display:block;">Period / Unit</label>
            <input type="text" class="form-input tariff-unit-input" value="${escapeHtml(item.unit || '/ year')}" style="font-size:0.85rem; padding:0.4rem 0.6rem; width:100%;">
          </div>
          <div style="width:160px;">
            <label style="font-size:0.72rem; color:var(--text-muted); font-weight:700; text-transform:uppercase; margin-bottom:2px; display:block;">Rate (KSh)</label>
            <div style="display:flex; align-items:center; gap:4px;">
              <span style="font-family:var(--font-mono); font-weight:700; font-size:0.85rem; color:var(--text-secondary);">KSh</span>
              <input type="number" step="500" min="0" class="form-input tariff-price-input" value="${item.price}" style="font-weight:800; font-family:var(--font-mono); color:var(--lime-dark); padding:0.4rem 0.6rem; width:100%;">
            </div>
          </div>
          <div style="display:flex; align-items:flex-end; padding-top:1.1rem;">
            <button class="btn btn-secondary btn-sm" onclick="window.dpRemoveCustomTariff('amc', '${item.id}')" title="Permanently delete retainer" style="color:#ef4444; border-color:rgba(239,68,68,0.25); padding:0.4rem 0.6rem;">
              <i data-lucide="trash-2" style="width:14px; height:14px;"></i>
            </button>
          </div>
        </div>
        <div style="width:100%;">
          <label style="font-size:0.72rem; color:var(--text-muted); font-weight:600; margin-bottom:2px; display:block;">SLA Agreement & Response Commitments</label>
          <input type="text" class="form-input tariff-desc-input" value="${escapeHtml(item.description || '')}" placeholder="Response SLA, monthly preventive maintenance, site visits..." style="font-size:0.8rem; color:var(--text-secondary); padding:0.35rem 0.6rem; width:100%;">
        </div>
      </div>
    `).join("") + `
      <button type="button" class="btn btn-secondary btn-sm" onclick="window.dpAddCustomTariffToCategory('amc')" style="width:100%; margin-top:0.35rem; font-size:0.8rem; padding:0.5rem;">
        <i data-lucide="plus" style="width:13px; height:13px;"></i> + Add Retainer / AMC Plan
      </button>
    `;

    if (window.lucide) window.lucide.createIcons();
  }

  function saveAllTariffs() {
    const current = getSavedTariffs();
    const rows = document.querySelectorAll(".tariff-edit-row");

    rows.forEach(row => {
      const group = row.getAttribute("data-tariff-group");
      const id = row.getAttribute("data-id");
      const nameInput = row.querySelector(".tariff-name-input");
      const unitInput = row.querySelector(".tariff-unit-input");
      const priceInput = row.querySelector(".tariff-price-input");
      const descInput = row.querySelector(".tariff-desc-input");

      if (group && id && current[group]) {
        const item = current[group].find(i => i.id === id);
        if (item) {
          if (nameInput) item.name = nameInput.value.trim();
          if (unitInput) {
            if (group === "essentials") item.period = unitInput.value.trim();
            else item.unit = unitInput.value.trim();
          }
          if (priceInput) item.price = Math.max(0, parseFloat(priceInput.value) || 0);
          if (descInput) item.description = descInput.value.trim();
        }
      }
    });

    try {
      localStorage.setItem(STORAGE_KEYS.TARIFFS, JSON.stringify(current));
      
      // Dual background sync to SQL database backends (Next.js & XAMPP MySQL)
      Object.keys(current).forEach(group => {
        (current[group] || []).forEach(item => {
          const payload = {
            id: item.id,
            code: item.id,
            name: item.name,
            category: group === "essentials" ? "Essentials Packages" : (group === "hardware" ? "Network & Infrastructure" : (group === "software" ? "Development & Creative" : "Maintenance & AMC Retainers")),
            unit: item.period || item.unit || "Per Unit",
            price: item.price,
            description: item.description || ""
          };
          fetch("/api/services", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          }).catch(() => {
            fetch("api/services.php", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload)
            }).catch(() => {});
          });
        });
      });

      showToast("✓ All Commercial Tariffs saved & synced to MySQL dpinc.top_db!");
    } catch (err) {
      console.error("Failed to save tariffs to localStorage:", err);
      showToast("Error saving tariffs. Check browser storage permissions.");
    }
  }

  function resetTariffsToDefault() {
    if (confirm("Are you sure you want to reset all service charges to default factory pricing?")) {
      localStorage.removeItem(STORAGE_KEYS.TARIFFS);
      renderTariffManager();
      showToast("✓ Tariffs reset to factory default rates.");
    }
  }

  window.dpAddCustomTariffToCategory = function(group) {
    const defaultUnits = {
      essentials: "One-Off Investment",
      hardware: "Per Setup",
      software: "Starting Price",
      amc: "/ year"
    };
    const defaultPrices = {
      essentials: 30000,
      hardware: 15000,
      software: 25000,
      amc: 60000
    };

    const name = prompt("Enter service / package title:");
    if (!name || !name.trim()) return;

    const priceStr = prompt("Enter standard rate (KSh):", defaultPrices[group] || 10000);
    const price = parseFloat(priceStr) || 0;

    const unitStr = prompt("Enter billing term / unit:", defaultUnits[group] || "Per Unit");
    const descStr = prompt("Enter deliverables / technical scope description (optional):", "Tailored commercial ICT deliverable.");

    const current = getSavedTariffs();
    const newId = "srv-" + Date.now().toString(36);

    const newItem = {
      id: newId,
      name: name.trim(),
      category: group,
      price: price,
      unit: unitStr || "Per Setup",
      period: unitStr || "One-Off Investment",
      description: descStr || "",
      isCustom: true
    };

    if (!current[group]) current[group] = [];
    current[group].push(newItem);

    try {
      localStorage.setItem(STORAGE_KEYS.TARIFFS, JSON.stringify(current));

      const payload = {
        id: newId,
        code: newId,
        name: name.trim(),
        category: group === "essentials" ? "Essentials Packages" : (group === "hardware" ? "Network & Infrastructure" : (group === "software" ? "Development & Creative" : "Maintenance & AMC Retainers")),
        unit: unitStr || "Per Setup",
        price: price,
        description: descStr || ""
      };

      fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }).catch(() => {
        fetch("api/services.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }).catch(() => {});
      });

      renderTariffManager();
      showToast(`✓ Added custom item "${name.trim()}"!`);
    } catch (err) {
      console.error("Failed to add custom tariff:", err);
    }
  };

  function addCustomTariff() {
    const categoryChoice = prompt("Select category (1: Essentials, 2: Hardware/Network, 3: Software/Creative, 4: AMC Support):", "2");
    let group = "hardware";
    if (categoryChoice === "1") group = "essentials";
    else if (categoryChoice === "3") group = "software";
    else if (categoryChoice === "4") group = "amc";

    window.dpAddCustomTariffToCategory(group);
  }

  window.dpRemoveCustomTariff = function(group, id) {
    if (!confirm("Are you sure you want to permanently delete this service/package from the database?")) return;
    const current = getSavedTariffs();
    if (current[group]) {
      current[group] = current[group].filter(i => i.id !== id);
      try {
        localStorage.setItem(STORAGE_KEYS.TARIFFS, JSON.stringify(current));

        // Sync DELETE to both Next.js and XAMPP PHP APIs
        fetch(`/api/services/${id}`, { method: "DELETE" }).catch(() => {
          fetch(`api/services.php?id=${encodeURIComponent(id)}`, { method: "DELETE" }).catch(() => {});
        });

        renderTariffManager();
        showToast("✓ Service item removed from catalog.");
      } catch (err) {
        console.error("Failed to remove item:", err);
      }
    }
  };

  /* =========================================================================
     14. MASTER RENDER ALL
     ========================================================================= */
  function renderAll() {
    updateOverviewMetrics();
    renderCalendar();
    renderInvoicesHub();
    renderSubscribersTable();
    renderJobCards();
    renderLedgerTable();
    if (activeTab === "analyticsTab") renderAnalytics();
    if (activeTab === "vaultTab") renderVaultDetails();
    if (activeTab === "tariffsTab") renderTariffManager();
  }

})();
