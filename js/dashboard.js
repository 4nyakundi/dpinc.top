/**
 * DATA PORT LIMITED - Unified Master Operations & Financial ERP Engine
 * Modules: NOC Billing Calendar, Field Job Cards, Financial Ledger, P&L Analytics & Executive Vault
 * Stack: Vanilla JavaScript (ES6+), HTML5 Canvas, JSON Sync & LocalStorage Cache
 * Authentication: user: root | pass: admin4all2 | Vault PIN: 4422
 */

(function () {
  const AUTH_USER = "root";
  const AUTH_PASS = "admin4all2";
  const VAULT_DEFAULT_PIN = "4422";

  const STORAGE_KEYS = {
    SESSION: "dp_erp_session",
    VAULT_UNLOCKED: "dp_vault_unlocked",
    ERP_DATA: "dp_erp_master_data"
  };

  // Master State Container
  let erpState = {
    subscribers: [],
    jobCards: [],
    ledger: [],
    invoices: [],
    vault: {
      pin: VAULT_DEFAULT_PIN,
      treasuryBalance: 125000,
      taxReserveBalance: 35000,
      emergencyFund: 50000,
      personalDrawingsMonth: 40000,
      savingsGoals: [],
      allocations: []
    },
    rules: []
  };

  let currentYear = new Date().getFullYear();
  let currentMonth = new Date().getMonth(); // 0-indexed
  let selectedInvoice = null;
  let enteredPin = "";
  let activeTab = "calendarTab";

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
        } else {
          if (loginError) {
            loginError.style.display = "block";
            loginError.textContent = "Invalid administrative credentials. Access restricted to authorized NOC staff.";
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
    setupModalsAndEvents();
    setupVaultKeypad();
    renderAll();
  }

  async function loadDatabase() {
    const cached = localStorage.getItem(STORAGE_KEYS.ERP_DATA);
    if (cached) {
      try {
        erpState = JSON.parse(cached);
      } catch (err) {
        console.error("Error parsing cached ERP data:", err);
      }
    }

    // If local storage is empty or needs seeding, fetch data/erp-data.json
    if (!erpState.subscribers || erpState.subscribers.length === 0) {
      try {
        const res = await fetch("data/erp-data.json");
        if (res.ok) {
          const defaultData = await res.json();
          erpState = Object.assign({}, erpState, defaultData);
          saveDatabase();
        }
      } catch (e) {
        console.warn("Could not fetch data/erp-data.json, using initialized fallback state.");
      }
    }
  }

  function saveDatabase() {
    localStorage.setItem(STORAGE_KEYS.ERP_DATA, JSON.stringify(erpState));
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
            quickActionLabel.textContent = "Add Subscriber";
          } else if (targetTabId === "jobCardsTab") {
            quickActionLabel.textContent = "Create Job Card";
          } else if (targetTabId === "ledgerTab") {
            quickActionLabel.textContent = "Record Transaction";
          } else if (targetTabId === "analyticsTab") {
            quickActionLabel.textContent = "Export Report";
          } else if (targetTabId === "vaultTab") {
            quickActionLabel.textContent = "Vault Deposit";
          }
        }

        if (targetTabId === "analyticsTab") {
          renderAnalytics();
        }
      });
    });

    const quickActionBtn = document.getElementById("quickActionBtn");
    if (quickActionBtn) {
      quickActionBtn.addEventListener("click", () => {
        if (activeTab === "calendarTab" || activeTab === "subscribersTab") {
          openSubscriberModal();
        } else if (activeTab === "jobCardsTab") {
          openJobCardModal();
        } else if (activeTab === "ledgerTab") {
          openLedgerModal();
        } else if (activeTab === "analyticsTab") {
          window.print();
        } else if (activeTab === "vaultTab") {
          openLedgerModal();
        }
      });
    }
  }

  /* =========================================================================
     4. UNIFIED METRICS CALCULATOR
     ========================================================================= */
  function updateOverviewMetrics() {
    const totalSubs = erpState.subscribers ? erpState.subscribers.length : 0;
    
    // MRR from active subscribers
    const mrr = (erpState.subscribers || []).reduce((acc, sub) => acc + (Number(sub.monthlyRate || sub.price) || 0), 0);

    // Total income recorded in current month from ledger + invoices
    const totalIncome = (erpState.ledger || [])
      .filter(tx => tx.type === "income")
      .reduce((acc, tx) => acc + (Number(tx.amount) || 0), 0);

    // Total expenses in current month
    const totalExpenses = (erpState.ledger || [])
      .filter(tx => tx.type === "expense")
      .reduce((acc, tx) => acc + (Number(tx.amount) || 0), 0);

    // Transit specific cost
    const transitCost = (erpState.ledger || [])
      .filter(tx => tx.category && tx.category.toLowerCase().includes("transit"))
      .reduce((acc, tx) => acc + (Number(tx.amount) || 0), 0);

    const grossRevenue = Math.max(mrr, totalIncome);
    const netProfit = grossRevenue - totalExpenses;
    const profitMargin = grossRevenue > 0 ? Math.round((netProfit / grossRevenue) * 100) : 0;

    // Update DOM Elements
    const elSubs = document.getElementById("metricTotalSubs");
    const elGross = document.getElementById("metricGrossRevenue");
    const elMRR = document.getElementById("metricMRR");
    const elExpenses = document.getElementById("metricTotalExpenses");
    const elTransit = document.getElementById("metricTransitCost");
    const elMargin = document.getElementById("metricProfitMargin");
    const elNet = document.getElementById("metricNetCash");

    if (elSubs) elSubs.textContent = totalSubs;
    if (elGross) elGross.textContent = `KSh ${grossRevenue.toLocaleString()}`;
    if (elMRR) elMRR.textContent = `Baseline MRR: KSh ${mrr.toLocaleString()}`;
    if (elExpenses) elExpenses.textContent = `KSh ${totalExpenses.toLocaleString()}`;
    if (elTransit) elTransit.textContent = `Transit: KSh ${transitCost.toLocaleString()}`;
    if (elMargin) elMargin.textContent = `${profitMargin}%`;
    if (elNet) elNet.textContent = `Net: KSh ${netProfit.toLocaleString()}`;

    // Update Tab Counts
    const tabSubs = document.getElementById("tabSubsCount");
    const tabJobs = document.getElementById("tabJobsCount");
    if (tabSubs) tabSubs.textContent = totalSubs;
    if (tabJobs) tabJobs.textContent = erpState.jobCards ? erpState.jobCards.length : 0;
  }

  /* =========================================================================
     5. NOC CALENDAR ENGINE
     ========================================================================= */
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
    const todayDate = today.getDate();

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
      if (isCurrentMonthNow && d === todayDate) {
        cell.classList.add("today-cell");
      }

      // Filter subscribers who have billing on this day
      const daySubs = (erpState.subscribers || []).filter(s => Number(s.billingDay) === d);

      let pillsHtml = "";
      daySubs.forEach(sub => {
        // Find existing invoice or create virtual status
        const invoice = (erpState.invoices || []).find(inv => 
          (inv.subId === sub.id || inv.clientName === sub.name) && 
          inv.period.includes(monthNames[currentMonth])
        );

        const isPaid = invoice ? invoice.status === "paid" : false;
        const isOverdue = !isPaid && isCurrentMonthNow && d < todayDate;
        const isDueToday = !isPaid && isCurrentMonthNow && d === todayDate;

        let statusClass = "pill-upcoming";
        if (isPaid) statusClass = "pill-paid";
        else if (isDueToday) statusClass = "pill-due";
        else if (isOverdue) statusClass = "pill-overdue";

        pillsHtml += `
          <div class="subscriber-pill ${statusClass}" onclick="window.dpOpenDrawerForSub('${sub.id}')">
            <span class="pill-dot"></span>
            <span class="pill-name">${sub.name}</span>
            <span class="pill-price">KSh ${(sub.monthlyRate || sub.price || 0).toLocaleString()}</span>
          </div>
        `;
      });

      cell.innerHTML = `
        <div class="day-header">
          <span class="day-number">${d}</span>
          ${isCurrentMonthNow && d === todayDate ? '<span class="today-tag">TODAY</span>' : ''}
        </div>
        <div class="day-subscriber-pills">${pillsHtml}</div>
      `;
      grid.appendChild(cell);
    }

    if (window.lucide) window.lucide.createIcons();
  }

  /* =========================================================================
     6. SUBSCRIBERS DIRECTORY
     ========================================================================= */
  function renderSubscribersTable() {
    const tbody = document.getElementById("subscribersTableBody");
    if (!tbody) return;
    tbody.innerHTML = "";

    const search = (document.getElementById("subscriberSearchInput")?.value || "").toLowerCase();
    const filterPlan = document.getElementById("subscriberFilterPlan")?.value || "all";

    const filtered = (erpState.subscribers || []).filter(sub => {
      const matchSearch = sub.name.toLowerCase().includes(search) ||
                          (sub.phone && sub.phone.includes(search)) ||
                          (sub.company && sub.company.toLowerCase().includes(search)) ||
                          (sub.ipAddress && sub.ipAddress.includes(search));
      const matchPlan = filterPlan === "all" || (sub.package && sub.package.includes(filterPlan));
      return matchSearch && matchPlan;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted" style="padding:2rem;">No subscribers found matching criteria.</td></tr>`;
      return;
    }

    filtered.forEach(sub => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>
          <div style="font-weight:700; color:#FFFFFF;">${sub.name}</div>
          <div class="text-muted" style="font-size:0.75rem;">${sub.phone} | ${sub.location || 'Mombasa'}</div>
        </td>
        <td>
          <span class="badge" style="font-size:0.75rem;">${sub.package}</span>
        </td>
        <td style="font-family:var(--font-mono); font-weight:700; color:#8ACE00;">
          KSh ${(sub.monthlyRate || sub.price || 0).toLocaleString()}
        </td>
        <td style="font-family:var(--font-mono); font-size:0.875rem;">
          Day ${sub.billingDay} of Month
        </td>
        <td>
          <span class="badge" style="background:rgba(138,206,0,0.15); color:#8ACE00; border-color:#8ACE00;">Active SLA</span>
        </td>
        <td style="text-align:right;">
          <div style="display:flex; justify-content:flex-end; gap:0.5rem;">
            <button class="btn btn-secondary btn-sm" title="Dispatch Bill via WhatsApp" onclick="window.dpOpenDrawerForSub('${sub.id}')">
              <i data-lucide="receipt" style="width:14px; height:14px;"></i> Bill
            </button>
            <button class="btn btn-secondary btn-sm" style="color:#ef4444;" title="Delete" onclick="window.dpDeleteSub('${sub.id}')">
              <i data-lucide="trash-2" style="width:14px; height:14px;"></i>
            </button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });

    if (window.lucide) window.lucide.createIcons();
  }

  /* =========================================================================
     7. FIELD OPS & JOB CARDS ENGINE
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
            <div style="font-weight:700; color:#FFFFFF; margin-bottom:0.25rem;">Itemized Hardware:</div>
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
     8. FINANCIAL GENERAL LEDGER
     ========================================================================= */
  function renderLedgerTable() {
    const tbody = document.getElementById("ledgerTableBody");
    if (!tbody) return;
    tbody.innerHTML = "";

    const ledgerEntries = erpState.ledger || [];
    if (ledgerEntries.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted" style="padding:2rem;">No ledger transactions recorded yet.</td></tr>`;
      return;
    }

    ledgerEntries.forEach(tx => {
      const tr = document.createElement("tr");
      const isIncome = tx.type === "income";

      tr.innerHTML = `
        <td style="font-family:var(--font-mono); font-size:0.85rem; color:#EDEDED;">
          ${tx.date || '2026-09-18'}
        </td>
        <td>
          <div style="font-weight:600; color:#FFFFFF;">${tx.description}</div>
          <div class="text-muted" style="font-size:0.75rem;">Ref: ${tx.reference || 'N/A'}</div>
        </td>
        <td>
          <span class="badge" style="font-size:0.75rem;">${tx.category}</span>
        </td>
        <td>
          <span style="font-size:0.85rem; color:#EDEDED;">${tx.entity || 'DATA PORT Core'}</span>
        </td>
        <td style="font-size:0.85rem; color:var(--text-muted);">
          ${tx.paymentMethod}
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

  /* =========================================================================
     9. CANVAS CASH FLOW & P&L ANALYTICS CHART
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

    // Sample 6-Month Projection Data
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
      ctx.fillStyle = "#FFFFFF";
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
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "11px 'Inter', sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("Gross Revenue", width - 180, 20);

    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(width - 90, 10, 12, 12);
    ctx.fillText("Expenses", width - 70, 20);
  }

  /* =========================================================================
     10. EXECUTIVE VAULT KEYPAD & PIN LOGIC
     ========================================================================= */
  function setupVaultKeypad() {
    const keypadBtns = document.querySelectorAll(".pin-key-btn");
    const lockedState = document.getElementById("vaultLockedState");
    const unlockedState = document.getElementById("vaultUnlockedState");
    const errorEl = document.getElementById("vaultPinError");
    const lockBtn = document.getElementById("lockVaultBtn");

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
      });
    }
  }

  function renderVaultDetails() {
    const rulesGrid = document.getElementById("rulesGrid");
    if (rulesGrid && erpState.rules) {
      rulesGrid.innerHTML = erpState.rules.map(r => `
        <div class="rule-card">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <strong style="color:#FFFFFF;">${r.name}</strong>
            <span class="badge" style="background:rgba(138,206,0,0.15); color:#8ACE00; border-color:#8ACE00;">Active</span>
          </div>
          <p class="text-muted" style="font-size:0.8125rem;">Trigger Threshold: ${r.threshold ? 'KSh ' + r.threshold.toLocaleString() : r.trigger}</p>
        </div>
      `).join('');
    }
  }

  /* =========================================================================
     11. MODAL HANDLERS & DISPATCH DRAWER
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

    // Forms
    const subForm = document.getElementById("subscriberForm");
    if (subForm) {
      subForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const newSub = {
          id: "sub_" + Date.now(),
          name: document.getElementById("subName").value.trim(),
          phone: document.getElementById("subPhone").value.trim(),
          email: document.getElementById("subEmail").value.trim(),
          package: document.getElementById("subPackage").value,
          price: Number(document.getElementById("subPrice").value) || 3500,
          monthlyRate: Number(document.getElementById("subPrice").value) || 3500,
          billingDay: Number(document.getElementById("subBillingDay").value) || 1,
          location: document.getElementById("subLocation").value.trim(),
          status: "active"
        };
        erpState.subscribers.push(newSub);
        saveDatabase();
        document.getElementById("subscriberModal").style.display = "none";
        renderAll();
      });
    }

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
      });
    }

    const ledgerForm = document.getElementById("ledgerForm");
    if (ledgerForm) {
      ledgerForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const newTx = {
          id: "tx_" + Date.now(),
          date: new Date().toISOString().split("T")[0],
          description: document.getElementById("txDescription").value.trim(),
          type: document.getElementById("txType").value,
          amount: Number(document.getElementById("txAmount").value) || 0,
          category: document.getElementById("txCategory").value,
          paymentMethod: document.getElementById("txPaymentMethod").value,
          reference: "TX-" + Math.floor(Math.random() * 89999 + 10000),
          entity: "DATA PORT Core"
        };
        erpState.ledger.unshift(newTx);
        saveDatabase();
        document.getElementById("ledgerModal").style.display = "none";
        renderAll();
      });
    }

    // Modal Triggers
    const openAddJobModalBtn = document.getElementById("openAddJobModalBtn");
    if (openAddJobModalBtn) openAddJobModalBtn.addEventListener("click", openJobCardModal);

    const openAddTxModalBtn = document.getElementById("openAddTxModalBtn");
    if (openAddTxModalBtn) openAddTxModalBtn.addEventListener("click", openLedgerModal);

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
            erpState = imported;
            saveDatabase();
            document.getElementById("syncModal").style.display = "none";
            renderAll();
            alert("ERP Database successfully restored from backup.");
          } catch (err) {
            alert("Invalid JSON backup file.");
          }
        };
        reader.readAsText(file);
      });
    }
  }

  function openSubscriberModal() {
    const modal = document.getElementById("subscriberModal");
    if (modal) modal.style.display = "flex";
  }

  function openJobCardModal() {
    const modal = document.getElementById("jobCardModal");
    if (modal) modal.style.display = "flex";
  }

  function openLedgerModal() {
    const modal = document.getElementById("ledgerModal");
    if (modal) modal.style.display = "flex";
  }

  /* =========================================================================
     12. GLOBAL WINDOW ACTIONS (For inline onclick handlers)
     ========================================================================= */
  window.dpOpenDrawerForSub = function (subId) {
    const sub = (erpState.subscribers || []).find(s => s.id === subId);
    if (!sub) return;

    // Check or create current month invoice
    let inv = (erpState.invoices || []).find(i => (i.subId === sub.id || i.clientName === sub.name) && i.period.includes(monthNames[currentMonth]));
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
          `*Payment Details:*\n` +
          `M-PESA Paybill: *247247*\n` +
          `Account No: *${sub.phone}*\n\n` +
          `Thank you for choosing Data Port Limited. Uninterrupted fiber connectivity is guaranteed.`;
        window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(msg)}`, "_blank");
      };
    }

    // Toggle Payment Status Button
    const togglePaidBtn = document.getElementById("togglePaidBtn");
    if (togglePaidBtn) {
      togglePaidBtn.onclick = () => {
        inv.status = inv.status === "paid" ? "unpaid" : "paid";
        
        // Auto-post to ledger if paid
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
        window.print();
      };
    }

    document.getElementById("invoiceDrawerModal").style.display = "flex";
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
    alert(`Job Card converted into Proforma Invoice ${invNo}!`);
  };

  window.dpToggleJobStatus = function (jobId) {
    const job = (erpState.jobCards || []).find(j => j.id === jobId);
    if (!job) return;
    if (job.status === "in_progress") job.status = "completed";
    else if (job.status === "completed") job.status = "pending";
    else job.status = "in_progress";
    saveDatabase();
    renderAll();
  };

  window.dpDeleteSub = function (subId) {
    if (confirm("Are you sure you want to remove this subscriber?")) {
      erpState.subscribers = (erpState.subscribers || []).filter(s => s.id !== subId);
      saveDatabase();
      renderAll();
    }
  };

  window.dpDeleteTx = function (txId) {
    if (confirm("Delete this ledger entry?")) {
      erpState.ledger = (erpState.ledger || []).filter(t => t.id !== txId);
      saveDatabase();
      renderAll();
    }
  };

  /* =========================================================================
     13. MASTER RENDER ALL
     ========================================================================= */
  function renderAll() {
    updateOverviewMetrics();
    renderCalendar();
    renderSubscribersTable();
    renderJobCards();
    renderLedgerTable();
    if (activeTab === "analyticsTab") renderAnalytics();
  }

})();
