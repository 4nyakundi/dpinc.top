/**
 * DATA PORT - NOC Billing & Subscriber Calendar Dashboard Engine
 * Powered by JavaScript, GSAP, and LocalStorage / REST Sync
 * Authentication: user: root | pass: admin4all2
 */

(function () {
  const AUTH_USER = "root";
  const AUTH_PASS = "admin4all2";
  const SESSION_KEY = "dp_admin_session";
  const SUBS_KEY = "dp_subscribers_data";
  const INVOICES_KEY = "dp_invoices_data";

  // Initial Seed Subscribers (Mombasa Businesses)
  const SEED_SUBSCRIBERS = [
    {
      id: "sub_101",
      name: "Apex Logistics Ltd",
      phone: "+254790964002",
      email: "accounts@apexlogistics.co.ke",
      company: "Apex Logistics Ltd",
      package: "20 Mbps Pro Office Dedicated",
      price: 6500,
      billingDay: 1,
      location: "Mombasa Mall, 1st Floor",
      notes: "Mikrotik Hex S, IP: 192.168.10.1",
      status: "active"
    },
    {
      id: "sub_102",
      name: "Coastline Media Studio",
      phone: "+254711822800",
      email: "studio@coastmedia.top",
      company: "Coastline Media",
      package: "50 Mbps High-Capacity Enterprise",
      price: 12000,
      billingDay: 5,
      location: "Jomo Kenyatta Ave, Plaza 4",
      notes: "4K Upload Channel, Static IP assigned",
      status: "active"
    },
    {
      id: "sub_103",
      name: "Nyali Marine Supplies",
      phone: "+254722334455",
      email: "billing@nyalimarine.com",
      company: "Nyali Marine",
      package: "10 Mbps Standard Business",
      price: 3500,
      billingDay: 5,
      location: "Old Port Road, Suite 8",
      notes: "Dual-band WiFi 6 AP deployed",
      status: "active"
    },
    {
      id: "sub_104",
      name: "Al-Baraka Pharmacy",
      phone: "+254733445566",
      email: "info@albaraka.co.ke",
      company: "Al-Baraka Health",
      package: "5 Mbps SOHO Fiber",
      price: 2500,
      billingDay: 10,
      location: "Digo Road",
      notes: "POS terminal link priority",
      status: "active"
    },
    {
      id: "sub_105",
      name: "Kizingo Legal Advocates",
      phone: "+254799887766",
      email: "accounts@kizingolegal.com",
      company: "Kizingo Law Firm",
      package: "10 Mbps Standard Business",
      price: 3500,
      billingDay: 15,
      location: "Kizingo Tower",
      notes: "Encrypted VPN tunnel enabled",
      status: "active"
    },
    {
      id: "sub_106",
      name: "Ocean View Boutique Hotel",
      phone: "+254712345678",
      email: "gm@oceanview.co.ke",
      company: "Ocean View Ltd",
      package: "Secure Office Starter AMC",
      price: 5800,
      billingDay: 28,
      location: "Mama Ngina Drive",
      notes: "Includes 8-Ch CCTV maintenance retainer",
      status: "active"
    }
  ];

  // Global State
  let subscribers = [];
  let invoices = [];
  let currentYear = new Date().getFullYear();
  let currentMonth = new Date().getMonth(); // 0-indexed
  let selectedInvoice = null;

  document.addEventListener("DOMContentLoaded", () => {
    initAuth();
  });

  /* --- 1. Authentication & Session Management --- */
  function initAuth() {
    const loginGate = document.getElementById("loginGate");
    const dashboardApp = document.getElementById("dashboardApp");
    const loginForm = document.getElementById("loginForm");
    const loginError = document.getElementById("loginError");
    const logoutBtn = document.getElementById("logoutBtn");

    const session = localStorage.getItem(SESSION_KEY);
    if (session === "authenticated") {
      loginGate.style.display = "none";
      dashboardApp.style.display = "block";
      startDashboard();
    } else {
      loginGate.style.display = "flex";
      dashboardApp.style.display = "none";
    }

    if (loginForm) {
      loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const user = document.getElementById("loginUsername").value.trim();
        const pass = document.getElementById("loginPassword").value.trim();

        if (user === AUTH_USER && pass === AUTH_PASS) {
          localStorage.setItem(SESSION_KEY, "authenticated");
          loginError.style.display = "none";
          loginGate.style.display = "none";
          dashboardApp.style.display = "block";
          startDashboard();
        } else {
          loginError.style.display = "block";
          loginError.textContent = "Invalid administrative credentials. Access restricted to authorized NOC staff.";
        }
      });
    }

    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        localStorage.removeItem(SESSION_KEY);
        window.location.reload();
      });
    }
  }

  /* --- 2. Dashboard Lifecycle Initialization --- */
  function startDashboard() {
    loadData();
    initClock();
    initTabs();
    initCalendarControls();
    initSubscriberForm();
    initSearchAndFilters();
    renderAll();
  }

  /* --- 3. Data Loading & Persistence --- */
  function loadData() {
    const savedSubs = localStorage.getItem(SUBS_KEY);
    if (savedSubs) {
      try {
        subscribers = JSON.parse(savedSubs);
      } catch (e) {
        subscribers = SEED_SUBSCRIBERS;
      }
    } else {
      subscribers = SEED_SUBSCRIBERS;
      saveSubscribers();
    }

    const savedInvoices = localStorage.getItem(INVOICES_KEY);
    if (savedInvoices) {
      try {
        invoices = JSON.parse(savedInvoices);
      } catch (e) {
        invoices = [];
      }
    } else {
      // Auto-generate seed invoices for the current month
      invoices = [];
      generateSeedInvoices();
    }
  }

  function saveSubscribers() {
    localStorage.setItem(SUBS_KEY, JSON.stringify(subscribers));
  }

  function saveInvoices() {
    localStorage.setItem(INVOICES_KEY, JSON.stringify(invoices));
  }

  function generateSeedInvoices() {
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const period = `${monthNames[currentMonth]} ${currentYear}`;

    subscribers.forEach((sub, i) => {
      const isPaid = i % 2 === 0;
      const invoiceNo = `PROF-${currentYear}-${(1000 + i + 1)}`;
      invoices.push({
        id: `inv_${sub.id}_${currentYear}_${currentMonth}`,
        invoiceNo: invoiceNo,
        subId: sub.id,
        clientName: sub.name,
        company: sub.company,
        phone: sub.phone,
        email: sub.email,
        package: sub.package,
        amount: sub.price,
        period: period,
        year: currentYear,
        month: currentMonth,
        billingDay: sub.billingDay,
        dueDate: `${sub.billingDay} ${period}`,
        status: isPaid ? "paid" : "unpaid",
        issuedAt: new Date(currentYear, currentMonth, 1).toISOString(),
        paidAt: isPaid ? new Date(currentYear, currentMonth, sub.billingDay).toISOString() : null
      });
    });
    saveInvoices();
  }

  /* --- 4. Live Kenya Clock --- */
  function initClock() {
    const clockEl = document.getElementById("liveKenyaClock");
    if (!clockEl) return;

    function update() {
      const now = new Date();
      const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      const kenyaTime = new Date(utc + (3600000 * 3));
      const hours = String(kenyaTime.getHours()).padStart(2, "0");
      const mins = String(kenyaTime.getMinutes()).padStart(2, "0");
      const secs = String(kenyaTime.getSeconds()).padStart(2, "0");
      clockEl.textContent = `Nairobi: ${hours}:${mins}:${secs} (EAT)`;
    }

    update();
    setInterval(update, 1000);
  }

  /* --- 5. Navigation Tabs --- */
  function initTabs() {
    const tabBtns = document.querySelectorAll(".dash-tab");
    const tabPanes = document.querySelectorAll(".dash-tab-pane");

    tabBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        tabBtns.forEach(b => b.classList.remove("active"));
        tabPanes.forEach(p => p.classList.remove("active"));

        btn.classList.add("active");
        const targetId = btn.getAttribute("data-tab");
        const targetPane = document.getElementById(targetId);
        if (targetPane) {
          targetPane.classList.add("active");
          if (window.lucide) window.lucide.createIcons();
        }
      });
    });
  }

  /* --- 6. Render All Components --- */
  function renderAll() {
    renderMetrics();
    renderCalendar();
    renderSubscribersTable();
    renderInvoicesTable();
    if (window.lucide) window.lucide.createIcons();
  }

  /* --- 7. Metrics & Telemetry Calculation --- */
  function renderMetrics() {
    const totalSubs = subscribers.length;
    const mrr = subscribers.reduce((acc, s) => acc + (Number(s.price) || 0), 0);

    // Current month invoices
    const currentMonthInvoices = invoices.filter(inv => inv.year === currentYear && inv.month === currentMonth);
    const collected = currentMonthInvoices
      .filter(inv => inv.status === "paid")
      .reduce((acc, inv) => acc + (Number(inv.amount) || 0), 0);
    const pending = currentMonthInvoices
      .filter(inv => inv.status !== "paid")
      .reduce((acc, inv) => acc + (Number(inv.amount) || 0), 0);

    const percent = mrr > 0 ? Math.round((collected / mrr) * 100) : 0;
    const overdueCount = currentMonthInvoices.filter(inv => {
      const today = new Date().getDate();
      return inv.status !== "paid" && inv.billingDay < today;
    }).length;

    document.getElementById("metricTotalSubs").textContent = totalSubs;
    document.getElementById("metricMRR").textContent = `KSh ${mrr.toLocaleString()}`;
    document.getElementById("metricCollected").textContent = `KSh ${collected.toLocaleString()}`;
    document.getElementById("metricCollectedPercent").textContent = `${percent}% of monthly target`;
    document.getElementById("metricPending").textContent = `KSh ${pending.toLocaleString()}`;
    document.getElementById("metricOverdueCount").textContent = `${overdueCount} overdue proformas`;

    document.getElementById("tabSubsCount").textContent = totalSubs;
    document.getElementById("tabInvoicesCount").textContent = invoices.length;
  }

  /* --- 8. Interactive Calendar View Engine --- */
  function initCalendarControls() {
    const prevBtn = document.getElementById("prevMonthBtn");
    const nextBtn = document.getElementById("nextMonthBtn");
    const todayBtn = document.getElementById("todayBtn");
    const batchBtn = document.getElementById("batchGenerateBtn");

    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        currentMonth--;
        if (currentMonth < 0) {
          currentMonth = 11;
          currentYear--;
        }
        renderAll();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        currentMonth++;
        if (currentMonth > 11) {
          currentMonth = 0;
          currentYear++;
        }
        renderAll();
      });
    }

    if (todayBtn) {
      todayBtn.addEventListener("click", () => {
        const now = new Date();
        currentYear = now.getFullYear();
        currentMonth = now.getMonth();
        renderAll();
      });
    }

    if (batchBtn) {
      batchBtn.addEventListener("click", batchGenerateMonthInvoices);
    }
  }

  function renderCalendar() {
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    const titleEl = document.getElementById("calendarMonthYearTitle");
    if (titleEl) {
      titleEl.textContent = `${monthNames[currentMonth]} ${currentYear}`;
    }

    const gridEl = document.getElementById("calendarGrid");
    if (!gridEl) return;
    gridEl.innerHTML = "";

    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sunday
    // Adjust for Monday start (0: Mon, ..., 6: Sun)
    const adjustedFirstDay = (firstDayIndex + 6) % 7;
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const todayDate = new Date();
    const isCurrentRealMonth = todayDate.getFullYear() === currentYear && todayDate.getMonth() === currentMonth;
    const realToday = todayDate.getDate();

    // Previous month filler days
    for (let i = adjustedFirstDay - 1; i >= 0; i--) {
      const cell = document.createElement("div");
      cell.className = "calendar-day-cell prev-month-day";
      cell.innerHTML = `<div class="day-number">${daysInPrevMonth - i}</div>`;
      gridEl.appendChild(cell);
    }

    // Active month days
    for (let day = 1; day <= daysInMonth; day++) {
      const cell = document.createElement("div");
      cell.className = "calendar-day-cell";
      if (isCurrentRealMonth && day === realToday) {
        cell.classList.add("today-cell");
      }

      // Day Number Header
      const headerDiv = document.createElement("div");
      headerDiv.className = "day-header";
      headerDiv.innerHTML = `<span class="day-number">${day}</span>`;
      if (isCurrentRealMonth && day === realToday) {
        headerDiv.innerHTML += `<span class="today-tag">TODAY</span>`;
      }
      cell.appendChild(headerDiv);

      // Find subscribers due on this day
      const subsOnDay = subscribers.filter(s => Number(s.billingDay) === day);
      
      const pillsContainer = document.createElement("div");
      pillsContainer.className = "day-subscriber-pills";

      subsOnDay.forEach(sub => {
        // Find or build invoice for this month
        let inv = invoices.find(i => i.subId === sub.id && i.year === currentYear && i.month === currentMonth);
        
        let statusClass = "upcoming";
        if (inv && inv.status === "paid") {
          statusClass = "paid";
        } else if (isCurrentRealMonth) {
          if (day === realToday || (day > realToday && day <= realToday + 3)) {
            statusClass = "due";
          } else if (day < realToday) {
            statusClass = "overdue";
          }
        }

        const pill = document.createElement("button");
        pill.className = `subscriber-pill pill-${statusClass}`;
        pill.setAttribute("title", `${sub.name} • KSh ${sub.price.toLocaleString()} (${statusClass.toUpperCase()})`);
        pill.innerHTML = `
          <span class="pill-dot"></span>
          <span class="pill-name">${sub.name.split(" ")[0]}</span>
          <span class="pill-price">${(sub.price / 1000).toFixed(1)}k</span>
        `;

        pill.addEventListener("click", (e) => {
          e.stopPropagation();
          openInvoiceDrawer(sub, day);
        });

        pillsContainer.appendChild(pill);
      });

      cell.appendChild(pillsContainer);

      // Quick-add on day click
      cell.addEventListener("click", () => {
        openAddSubscriberModal(day);
      });

      gridEl.appendChild(cell);
    }

    // Next month filler days to complete grid rows
    const totalCells = adjustedFirstDay + daysInMonth;
    const remaining = 7 - (totalCells % 7);
    if (remaining < 7) {
      for (let i = 1; i <= remaining; i++) {
        const cell = document.createElement("div");
        cell.className = "calendar-day-cell next-month-day";
        cell.innerHTML = `<div class="day-number">${i}</div>`;
        gridEl.appendChild(cell);
      }
    }
  }

  /* --- 9. Batch Generate Invoices for Current Month --- */
  function batchGenerateMonthInvoices() {
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const period = `${monthNames[currentMonth]} ${currentYear}`;

    let generatedCount = 0;

    subscribers.forEach((sub, idx) => {
      const existing = invoices.find(i => i.subId === sub.id && i.year === currentYear && i.month === currentMonth);
      if (!existing) {
        const invoiceNo = `PROF-${currentYear}-${(1000 + invoices.length + 1)}`;
        invoices.push({
          id: `inv_${sub.id}_${currentYear}_${currentMonth}`,
          invoiceNo: invoiceNo,
          subId: sub.id,
          clientName: sub.name,
          company: sub.company,
          phone: sub.phone,
          email: sub.email,
          package: sub.package,
          amount: sub.price,
          period: period,
          year: currentYear,
          month: currentMonth,
          billingDay: sub.billingDay,
          dueDate: `${sub.billingDay} ${period}`,
          status: "unpaid",
          issuedAt: new Date(currentYear, currentMonth, 1).toISOString(),
          paidAt: null
        });
        generatedCount++;
      }
    });

    saveInvoices();
    renderAll();

    if (window.showToast) {
      window.showToast(`Batch Generated ${generatedCount} Proformas for ${period}!`);
    } else {
      alert(`Batch Generated ${generatedCount} Proformas for ${period}!`);
    }
  }

  /* --- 10. Invoice Drawer & Multi-Channel Dispatch --- */
  function openInvoiceDrawer(subscriber, day) {
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const period = `${monthNames[currentMonth]} ${currentYear}`;

    // Get or create invoice
    let inv = invoices.find(i => i.subId === subscriber.id && i.year === currentYear && i.month === currentMonth);
    if (!inv) {
      const invoiceNo = `PROF-${currentYear}-${(1000 + invoices.length + 1)}`;
      inv = {
        id: `inv_${subscriber.id}_${currentYear}_${currentMonth}`,
        invoiceNo: invoiceNo,
        subId: subscriber.id,
        clientName: subscriber.name,
        company: subscriber.company,
        phone: subscriber.phone,
        email: subscriber.email,
        package: subscriber.package,
        amount: subscriber.price,
        period: period,
        year: currentYear,
        month: currentMonth,
        billingDay: subscriber.billingDay,
        dueDate: `${subscriber.billingDay} ${period}`,
        status: "unpaid",
        issuedAt: new Date(currentYear, currentMonth, 1).toISOString(),
        paidAt: null
      };
      invoices.push(inv);
      saveInvoices();
      renderAll();
    }

    selectedInvoice = inv;

    // Fill Drawer Content
    document.getElementById("drawerClientTitle").textContent = `${subscriber.name} (${subscriber.company || 'Direct'})`;
    document.getElementById("drawerInvoiceNo").textContent = inv.invoiceNo;
    document.getElementById("drawerPeriod").textContent = inv.period;
    document.getElementById("drawerPackage").textContent = subscriber.package;
    document.getElementById("drawerAmount").textContent = `KSh ${Number(inv.amount).toLocaleString()}`;
    document.getElementById("drawerDueDate").textContent = inv.dueDate;

    const statusBadge = document.getElementById("drawerStatusBadge");
    if (inv.status === "paid") {
      statusBadge.innerHTML = `<span class="badge" style="background:rgba(138,206,0,0.15); color:#8ACE00; border-color:#8ACE00;">PAID IN FULL</span>`;
    } else {
      statusBadge.innerHTML = `<span class="badge" style="background:rgba(239,68,68,0.15); color:#ef4444; border-color:#ef4444;">UNPAID / PENDING</span>`;
    }

    // Setup Dispatch Buttons
    const waBtn = document.getElementById("sendWhatsAppBtn");
    const emailBtn = document.getElementById("sendEmailBtn");
    const togglePaidBtn = document.getElementById("togglePaidBtn");
    const printBtn = document.getElementById("printInvoiceBtn");

    waBtn.onclick = () => dispatchWhatsApp(subscriber, inv);
    emailBtn.onclick = () => dispatchEmail(subscriber, inv);
    
    togglePaidBtn.onclick = () => {
      inv.status = inv.status === "paid" ? "unpaid" : "paid";
      inv.paidAt = inv.status === "paid" ? new Date().toISOString() : null;
      saveInvoices();
      renderAll();
      openInvoiceDrawer(subscriber, day); // refresh drawer
      if (window.showToast) window.showToast(`Invoice ${inv.invoiceNo} marked as ${inv.status.toUpperCase()}`);
    };

    printBtn.onclick = () => printInvoice(subscriber, inv);

    // Open Modal
    const modal = document.getElementById("invoiceDrawerModal");
    modal.style.display = "flex";
    if (window.lucide) window.lucide.createIcons();
  }

  /* --- 11. WhatsApp Direct Kenya Billing Dispatch --- */
  function dispatchWhatsApp(subscriber, invoice) {
    const cleanPhone = subscriber.phone.replace(/[^\d+]/g, "");
    const formattedPhone = cleanPhone.startsWith("0") ? `254${cleanPhone.slice(1)}` : cleanPhone.replace("+", "");

    const message = 
`*DATA PORT LIMITED — INVOICE NOTICE*
━━━━━━━━━━━━━━━━━━━━━━
*Client:* ${subscriber.name}
*Invoice No:* ${invoice.invoiceNo}
*Service Period:* ${invoice.period}
*Package:* ${subscriber.package}
*Amount Due:* KSh ${Number(invoice.amount).toLocaleString()}
*Due Date:* ${invoice.dueDate}
*Status:* ${invoice.status.toUpperCase()}

*PAYMENT OPTIONS:*
• *M-PESA / Send Money:* 0790964002
• *M-PESA Paybill:* 247247 (Acc: ${cleanPhone})
• *Bank:* Equity Bank / KCB Bank
  _Account Name:_ DATA PORT LIMITED

_Thank you for your business. For support or inquiries, contact +254 790 964 002._`;

    const waUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, "_blank");
  }

  /* --- 12. Email / Mailto Dispatch --- */
  function dispatchEmail(subscriber, invoice) {
    const subject = `DATA PORT Limited — Monthly Invoice ${invoice.invoiceNo} (${invoice.period})`;
    const body = 
`Dear ${subscriber.name},

Please find the invoice summary for your monthly high-speed internet subscription with Data Port Limited:

• Invoice Number: ${invoice.invoiceNo}
• Billing Period: ${invoice.period}
• Bandwidth Package: ${subscriber.package}
• Total Amount Due: KSh ${Number(invoice.amount).toLocaleString()}
• Due Date: ${invoice.dueDate}

PAYMENT INSTRUCTIONS:
- M-Pesa Paybill: 247247 | Account: ${subscriber.phone}
- Direct Phone: 0790964002
- Bank: Equity Bank / KCB Bank (DATA PORT LIMITED)

Thank you for choosing Data Port Limited as your technology and connectivity partner.

Sincerely,
Accounts & Billing Department
DATA PORT LIMITED
Along Jomo Kenyatta Avenue, Mombasa Mall
Phone: +254 790 964 002 | Web: https://dpinc.top`;

    const mailto = `mailto:${subscriber.email || 'support@dpinc.top'}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
  }

  /* --- 13. Print A4 Invoice Formatting --- */
  function printInvoice(subscriber, invoice) {
    document.getElementById("printDocType").textContent = invoice.status === "paid" ? "TAX INVOICE / RECEIPT" : "PROFORMA INVOICE";
    document.getElementById("printInvoiceNo").textContent = invoice.invoiceNo;
    document.getElementById("printIssueDate").textContent = new Date(invoice.issuedAt).toLocaleDateString('en-GB');
    document.getElementById("printDueDate").textContent = invoice.dueDate;

    document.getElementById("printClientName").textContent = subscriber.name;
    document.getElementById("printClientPhone").textContent = `Phone: ${subscriber.phone}`;
    document.getElementById("printClientEmail").textContent = `Email: ${subscriber.email || 'accounts@client.com'}`;
    document.getElementById("printClientLocation").textContent = `Location: ${subscriber.location || 'Mombasa'}`;
    document.getElementById("printPeriod").textContent = invoice.period;

    const statusEl = document.getElementById("printPaymentStatus");
    if (invoice.status === "paid") {
      statusEl.textContent = "PAID IN FULL";
      statusEl.style.background = "#dcfce7";
      statusEl.style.color = "#15803d";
    } else {
      statusEl.textContent = "UNPAID / DUE";
      statusEl.style.background = "#fee2e2";
      statusEl.style.color = "#b91c1c";
    }

    document.getElementById("printItemTitle").textContent = `Monthly Internet Subscription: ${subscriber.package}`;
    document.getElementById("printItemDesc").textContent = `Dedicated Bandwidth SLA • Routing IP: ${subscriber.notes || 'Static Assigned'}`;
    document.getElementById("printItemRate").textContent = Number(invoice.amount).toLocaleString() + ".00";
    document.getElementById("printItemTotal").textContent = Number(invoice.amount).toLocaleString() + ".00";
    document.getElementById("printGrandTotal").textContent = `KSh ${Number(invoice.amount).toLocaleString()}.00`;
    document.getElementById("printAccNo").textContent = subscriber.phone;

    window.print();
  }

  /* --- 14. Subscriber Table Rendering --- */
  function renderSubscribersTable() {
    const tbody = document.getElementById("subscribersTableBody");
    if (!tbody) return;
    tbody.innerHTML = "";

    const search = (document.getElementById("subscriberSearchInput")?.value || "").toLowerCase();
    const filterPlan = document.getElementById("subscriberFilterPlan")?.value || "all";

    const filtered = subscribers.filter(s => {
      const matchSearch = s.name.toLowerCase().includes(search) || 
                          s.phone.includes(search) || 
                          (s.company && s.company.toLowerCase().includes(search));
      const matchPlan = filterPlan === "all" || s.package.includes(filterPlan);
      return matchSearch && matchPlan;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted" style="padding:2rem;">No matching subscribers found.</td></tr>`;
      return;
    }

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    filtered.forEach(sub => {
      const tr = document.createElement("tr");
      
      const inv = invoices.find(i => i.subId === sub.id && i.year === currentYear && i.month === currentMonth);
      const isPaid = inv && inv.status === "paid";

      tr.innerHTML = `
        <td>
          <div style="font-weight:700; color:var(--text-primary);">${sub.name}</div>
          <div class="text-muted" style="font-size:0.75rem;">${sub.phone} • ${sub.location || 'Mombasa'}</div>
        </td>
        <td>
          <span class="tag" style="color:var(--text-primary); border-color:var(--accent-gold);">${sub.package}</span>
        </td>
        <td style="font-family:var(--font-mono); font-weight:700; color:var(--text-primary);">
          KSh ${Number(sub.price).toLocaleString()}
        </td>
        <td style="text-align:center;">
          <span class="badge" style="font-size:0.8rem; font-weight:700;">${sub.billingDay}th of mo.</span>
        </td>
        <td style="font-size:0.85rem; color:var(--amber-gold);">
          ${sub.billingDay} ${monthNames[currentMonth]} ${currentYear}
        </td>
        <td>
          <span class="badge" style="${isPaid ? 'background:rgba(138,206,0,0.15); color:#8ACE00; border-color:#8ACE00;' : 'background:rgba(239,68,68,0.15); color:#ef4444; border-color:#ef4444;'}">
            ${isPaid ? 'Paid' : 'Unpaid'}
          </span>
        </td>
        <td style="text-align:right;">
          <div style="display:flex; justify-content:flex-end; gap:0.5rem;">
            <button class="btn btn-secondary btn-sm" title="Open Billing Proforma" onclick="window.dpOpenDrawer('${sub.id}')">
              <i data-lucide="receipt" style="width:14px; height:14px;"></i>
            </button>
            <button class="btn btn-secondary btn-sm" title="Edit Subscriber" onclick="window.dpEditSub('${sub.id}')">
              <i data-lucide="edit-3" style="width:14px; height:14px;"></i>
            </button>
            <button class="btn btn-secondary btn-sm" style="color:#ef4444;" title="Delete Subscriber" onclick="window.dpDeleteSub('${sub.id}')">
              <i data-lucide="trash-2" style="width:14px; height:14px;"></i>
            </button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  /* --- 15. Invoices Ledger Rendering --- */
  function renderInvoicesTable() {
    const tbody = document.getElementById("invoicesTableBody");
    if (!tbody) return;
    tbody.innerHTML = "";

    const search = (document.getElementById("invoiceSearchInput")?.value || "").toLowerCase();
    const filterStatus = document.getElementById("invoiceFilterStatus")?.value || "all";

    const filtered = invoices.filter(inv => {
      const matchSearch = inv.invoiceNo.toLowerCase().includes(search) || 
                          inv.clientName.toLowerCase().includes(search);
      const matchStatus = filterStatus === "all" || inv.status === filterStatus;
      return matchSearch && matchStatus;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted" style="padding:2rem;">No invoices in record for selected criteria.</td></tr>`;
      return;
    }

    filtered.forEach(inv => {
      const sub = subscribers.find(s => s.id === inv.subId) || { name: inv.clientName, phone: inv.phone };
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td style="font-family:var(--font-mono); font-weight:700; color:var(--text-primary);">
          ${inv.invoiceNo}
        </td>
        <td>
          <div style="font-weight:600;">${inv.clientName}</div>
          <div class="text-muted" style="font-size:0.75rem;">${inv.package}</div>
        </td>
        <td>${inv.period}</td>
        <td style="font-family:var(--font-mono); font-weight:700; color:var(--text-primary);">
          KSh ${Number(inv.amount).toLocaleString()}
        </td>
        <td style="font-size:0.85rem; color:var(--amber-gold);">${inv.dueDate}</td>
        <td>
          <span class="badge" style="${inv.status === 'paid' ? 'background:rgba(138,206,0,0.15); color:#8ACE00; border-color:#8ACE00;' : 'background:rgba(239,68,68,0.15); color:#ef4444; border-color:#ef4444;'}">
            ${inv.status.toUpperCase()}
          </span>
        </td>
        <td style="text-align:right;">
          <div style="display:flex; justify-content:flex-end; gap:0.5rem;">
            <button class="btn btn-secondary btn-sm" title="Dispatch WhatsApp" onclick="window.dpDispatchWA('${inv.id}')">
              <i data-lucide="message-square" style="width:14px; height:14px; color:var(--neon-mint);"></i>
            </button>
            <button class="btn btn-secondary btn-sm" title="Print Invoice" onclick="window.dpPrintInvoice('${inv.id}')">
              <i data-lucide="printer" style="width:14px; height:14px;"></i>
            </button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  /* --- 16. Search & Filters Listener --- */
  function initSearchAndFilters() {
    document.getElementById("subscriberSearchInput")?.addEventListener("input", renderSubscribersTable);
    document.getElementById("subscriberFilterPlan")?.addEventListener("change", renderSubscribersTable);
    document.getElementById("invoiceSearchInput")?.addEventListener("input", renderInvoicesTable);
    document.getElementById("invoiceFilterStatus")?.addEventListener("change", renderInvoicesTable);
  }

  /* --- 17. Add / Edit Subscriber Modal --- */
  function initSubscriberForm() {
    const openBtn = document.getElementById("openAddSubModalBtn");
    const modal = document.getElementById("subscriberModal");
    const form = document.getElementById("subscriberForm");

    if (openBtn) {
      openBtn.addEventListener("click", () => openAddSubscriberModal());
    }

    // Close modal handlers
    document.querySelectorAll("[data-close]").forEach(btn => {
      btn.addEventListener("click", () => {
        const targetId = btn.getAttribute("data-close");
        const el = document.getElementById(targetId);
        if (el) el.style.display = "none";
      });
    });

    // Preset pricing based on package select
    const pkgSelect = document.getElementById("subPackage");
    const priceInput = document.getElementById("subPrice");
    if (pkgSelect && priceInput) {
      pkgSelect.addEventListener("change", () => {
        const val = pkgSelect.value;
        if (val.includes("5 Mbps")) priceInput.value = "2500";
        else if (val.includes("10 Mbps")) priceInput.value = "3500";
        else if (val.includes("20 Mbps")) priceInput.value = "6500";
        else if (val.includes("50 Mbps")) priceInput.value = "12000";
        else if (val.includes("AMC")) priceInput.value = "5800";
      });
    }

    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const editId = document.getElementById("subEditId").value;
        const name = document.getElementById("subName").value.trim();
        const phone = document.getElementById("subPhone").value.trim();
        const email = document.getElementById("subEmail").value.trim();
        const pkg = document.getElementById("subPackage").value;
        const price = Number(document.getElementById("subPrice").value) || 0;
        const billingDay = Number(document.getElementById("subBillingDay").value) || 1;
        const location = document.getElementById("subLocation").value.trim();
        const notes = document.getElementById("subNotes").value.trim();

        if (editId) {
          // Update existing
          const sub = subscribers.find(s => s.id === editId);
          if (sub) {
            sub.name = name;
            sub.phone = phone;
            sub.email = email;
            sub.package = pkg;
            sub.price = price;
            sub.billingDay = billingDay;
            sub.location = location;
            sub.notes = notes;
          }
        } else {
          // Add new
          const newSub = {
            id: `sub_${Date.now()}`,
            name,
            phone,
            email,
            company: name,
            package: pkg,
            price,
            billingDay,
            location,
            notes,
            status: "active"
          };
          subscribers.push(newSub);
        }

        saveSubscribers();
        modal.style.display = "none";
        form.reset();
        document.getElementById("subEditId").value = "";
        renderAll();

        if (window.showToast) window.showToast("Subscriber saved successfully!");
      });
    }
  }

  function openAddSubscriberModal(defaultDay = 1) {
    const modal = document.getElementById("subscriberModal");
    const form = document.getElementById("subscriberForm");
    if (!modal || !form) return;

    form.reset();
    document.getElementById("subEditId").value = "";
    document.getElementById("subModalTitle").textContent = "Add New Internet Client";
    document.getElementById("subBillingDay").value = defaultDay;
    document.getElementById("subPrice").value = "3500";

    modal.style.display = "flex";
    if (window.lucide) window.lucide.createIcons();
  }

  /* --- Global Window Bridge Functions for Inline Triggers --- */
  window.dpOpenDrawer = function (subId) {
    const sub = subscribers.find(s => s.id === subId);
    if (sub) openInvoiceDrawer(sub, sub.billingDay);
  };

  window.dpEditSub = function (subId) {
    const sub = subscribers.find(s => s.id === subId);
    if (!sub) return;

    document.getElementById("subEditId").value = sub.id;
    document.getElementById("subModalTitle").textContent = `Edit Subscriber: ${sub.name}`;
    document.getElementById("subName").value = sub.name;
    document.getElementById("subPhone").value = sub.phone;
    document.getElementById("subEmail").value = sub.email || "";
    document.getElementById("subPackage").value = sub.package;
    document.getElementById("subPrice").value = sub.price;
    document.getElementById("subBillingDay").value = sub.billingDay;
    document.getElementById("subLocation").value = sub.location || "";
    document.getElementById("subNotes").value = sub.notes || "";

    document.getElementById("subscriberModal").style.display = "flex";
    if (window.lucide) window.lucide.createIcons();
  };

  window.dpDeleteSub = function (subId) {
    if (!confirm("Are you sure you want to delete this subscriber?")) return;
    subscribers = subscribers.filter(s => s.id !== subId);
    saveSubscribers();
    renderAll();
    if (window.showToast) window.showToast("Subscriber removed.");
  };

  window.dpDispatchWA = function (invId) {
    const inv = invoices.find(i => i.id === invId);
    if (!inv) return;
    const sub = subscribers.find(s => s.id === inv.subId) || { name: inv.clientName, phone: inv.phone, package: inv.package };
    dispatchWhatsApp(sub, inv);
  };

  window.dpPrintInvoice = function (invId) {
    const inv = invoices.find(i => i.id === invId);
    if (!inv) return;
    const sub = subscribers.find(s => s.id === inv.subId) || { name: inv.clientName, phone: inv.phone, package: inv.package, location: "Mombasa" };
    printInvoice(sub, inv);
  };

})();
