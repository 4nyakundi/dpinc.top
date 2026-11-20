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
    "10 Mbps Home Lite": 1000,
    "15 Mbps Home Package": 1500,
    "15 Mbps Business Package": 1500,
    "20 Mbps Home": 2000,
    "20 Mbps Business": 2500,
    "30 Mbps Max Home": 3000,
    "30 Mbps Max Business": 3000,
    "Custom Plan": 1000
  };

  // Complete Embedded Default Seed Dataset (Zero-dependency fallback for file:// and offline use)
  const INITIAL_ERP_DATA = {
    version: "2.5.0",
    lastUpdated: new Date().toISOString(),
    subscribers: [],
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
    invoices: [],
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
  const FIREBASE_CONFIG = {
    apiKey: "AIzaSyAKYXsp1AK_chwSZ4IR2zkzA4UgwvQBbRU",
    authDomain: "pulseinvest-ffd58.firebaseapp.com",
    projectId: "pulseinvest-ffd58",
    storageBucket: "pulseinvest-ffd58.firebasestorage.app",
    messagingSenderId: "747317448358",
    appId: "1:747317448358:web:90f4314030ed6d530eee67",
    measurementId: "G-M59VQM3VKK"
  };

  let firebaseAuthInstance = null;
  function getFirebaseAuth() {
    if (typeof firebase === "undefined") return null;
    if (!firebase.apps.length) {
      try {
        firebase.initializeApp(FIREBASE_CONFIG);
      } catch (err) {
        console.warn("Firebase Init:", err);
      }
    }
    return firebase.auth();
  }

  function updateUserProfileUI(userData) {
    const badge = document.getElementById("userProfileBadge");
    const nameEl = document.getElementById("userDisplayName");
    const avatarEl = document.getElementById("userAvatarImg");
    if (!badge) return;

    if (userData && (userData.email || userData.name)) {
      if (nameEl) nameEl.textContent = userData.name || userData.email;
      if (avatarEl) {
        if (userData.photoURL) {
          avatarEl.src = userData.photoURL;
          avatarEl.style.display = "block";
        } else {
          avatarEl.style.display = "none";
        }
      }
      badge.style.display = "flex";
    } else {
      badge.style.display = "none";
    }
  }

  const SOLE_GOOGLE_PERMITS = [
    "jerrykhaboy@gmail.com",
    "emmanuelnyakundi2@gmail.com",
    "dpinc.top@gmail.com"
  ];

  function initAuth() {
    const loginGate = document.getElementById("loginGate");
    const dashboardApp = document.getElementById("dashboardApp");
    const loginForm = document.getElementById("loginForm");
    const loginError = document.getElementById("loginError");
    const logoutBtn = document.getElementById("logoutBtn");
    const googleBtn = document.getElementById("googleSignInBtn");

    // Check existing cached user profile and ensure authorization
    try {
      const cached = JSON.parse(localStorage.getItem("dp_auth_user") || "null");
      if (cached && cached.email) {
        const cEmail = cached.email.toLowerCase().trim();
        // If logged in via email/google, enforce permit
        if (cEmail.includes("@") && !SOLE_GOOGLE_PERMITS.includes(cEmail)) {
          localStorage.removeItem(STORAGE_KEYS.SESSION);
          localStorage.removeItem("dp_auth_user");
        } else {
          updateUserProfileUI(cached);
        }
      }
    } catch (_) {}

    // Initialize Firebase Auth listener with strict whitelist enforcement
    try {
      firebaseAuthInstance = getFirebaseAuth();
      if (firebaseAuthInstance) {
        firebaseAuthInstance.onAuthStateChanged(async (user) => {
          if (user) {
            const googleEmail = (user.email || "").toLowerCase().trim();
            if (!SOLE_GOOGLE_PERMITS.includes(googleEmail)) {
              console.warn("Unauthorized Google account attempt:", googleEmail);
              await firebaseAuthInstance.signOut();
              localStorage.removeItem(STORAGE_KEYS.SESSION);
              localStorage.removeItem("dp_auth_user");
              if (loginGate) loginGate.style.display = "flex";
              if (dashboardApp) dashboardApp.style.display = "none";
              if (loginError) {
                loginError.style.display = "block";
                loginError.innerHTML = `<i data-lucide="shield-alert" style="width:16px; height:16px; display:inline;"></i> <strong>Google NOC Access Restricted:</strong> <code>${escapeHtml(googleEmail)}</code> does not have permit to access DATA PORT NOC. Only designated administrator accounts (jerrykhaboy@gmail.com, emmanuelnyakundi2@gmail.com, dpinc.top@gmail.com) are permitted.`;
                if (window.lucide) window.lucide.createIcons();
              }
              return;
            }

            // User is on the strict Google NOC permit list!
            localStorage.setItem(STORAGE_KEYS.SESSION, "authenticated");
            const authUserData = {
              email: googleEmail,
              name: user.displayName || googleEmail,
              photoURL: user.photoURL,
              role: "admin"
            };
            localStorage.setItem("dp_auth_user", JSON.stringify(authUserData));
            updateUserProfileUI(authUserData);
            if (loginGate) loginGate.style.display = "none";
            if (dashboardApp) dashboardApp.style.display = "block";
            startMasterERP();
          }
        });
      }
    } catch (err) {
      console.warn("Firebase Auth listener error:", err);
    }

    const session = localStorage.getItem(STORAGE_KEYS.SESSION);
    const authUser = JSON.parse(localStorage.getItem("dp_auth_user") || "null");
    if (session === "authenticated" && authUser) {
      const aEmail = (authUser.email || "").toLowerCase().trim();
      if (aEmail.includes("@") && !SOLE_GOOGLE_PERMITS.includes(aEmail)) {
        localStorage.removeItem(STORAGE_KEYS.SESSION);
        localStorage.removeItem("dp_auth_user");
        if (loginGate) loginGate.style.display = "flex";
        if (dashboardApp) dashboardApp.style.display = "none";
      } else {
        if (loginGate) loginGate.style.display = "none";
        if (dashboardApp) dashboardApp.style.display = "block";
        startMasterERP();
      }
    } else {
      if (loginGate) loginGate.style.display = "flex";
      if (dashboardApp) dashboardApp.style.display = "none";
    }

    if (logoutBtn) {
      logoutBtn.addEventListener("click", async () => {
        const auth = getFirebaseAuth();
        if (auth) {
          try { await auth.signOut(); } catch (_) {}
        }
        localStorage.removeItem(STORAGE_KEYS.SESSION);
        localStorage.removeItem("dp_auth_user");
        if (dashboardApp) dashboardApp.style.display = "none";
        if (loginGate) loginGate.style.display = "flex";
      });
    }

    if (loginForm) {
      loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const u = document.getElementById("loginUsername").value.trim();
        const p = document.getElementById("loginPassword").value.trim();
        if ((u === "root" && p === "admin4all2") || (u === "admin" && p === "admin4all2")) {
          localStorage.setItem(STORAGE_KEYS.SESSION, "authenticated");
          localStorage.setItem("dp_auth_user", JSON.stringify({ email: "admin@dataport.co.ke", name: "DATA PORT Root Admin", role: "admin" }));
          if (loginGate) loginGate.style.display = "none";
          if (dashboardApp) dashboardApp.style.display = "block";
          startMasterERP();
        } else {
          if (loginError) {
            loginError.style.display = "block";
            loginError.textContent = "Invalid administrative credentials.";
          }
        }
      });
    }

    // Google Sign-In Click Handler
    if (googleBtn) {
      googleBtn.addEventListener("click", async () => {
        const auth = getFirebaseAuth();
        if (!auth) {
          alert("Firebase SDK is initializing, please check internet connection or reload.");
          return;
        }
        try {
          googleBtn.disabled = true;
          googleBtn.innerHTML = `<span class="pulse-dot"></span><span>Connecting to Google NOC Gateway...</span>`;
          const provider = new firebase.auth.GoogleAuthProvider();
          provider.setCustomParameters({ prompt: "select_account" });
          const result = await auth.signInWithPopup(provider);
          if (result && result.user) {
            const googleEmail = (result.user.email || "").toLowerCase().trim();

            // 1. Strictly verify against sole Google permits
            if (!SOLE_GOOGLE_PERMITS.includes(googleEmail)) {
              console.warn("Unauthorized Google Sign-In attempt rejected:", googleEmail);
              await auth.signOut();
              localStorage.removeItem(STORAGE_KEYS.SESSION);
              localStorage.removeItem("dp_auth_user");
              if (loginError) {
                loginError.style.display = "block";
                loginError.innerHTML = `<i data-lucide="shield-alert" style="width:16px; height:16px; display:inline;"></i> <strong>Google NOC Access Restricted:</strong> <code>${escapeHtml(googleEmail)}</code> does not have permit to access DATA PORT NOC. Only designated administrator accounts (jerrykhaboy@gmail.com, emmanuelnyakundi2@gmail.com, dpinc.top@gmail.com) have Google verification permits.`;
                if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
              }
              return;
            }

            // 2. Enforce Server-Side Authorization Whitelist Check
            try {
              const checkRes = await fetch("api/users.php?check_email=" + encodeURIComponent(googleEmail));
              const checkData = await checkRes.json();

              if (checkData.success && checkData.authorized) {
                // User is permitted!
                const authorizedRole = checkData.user.role || "admin";
                const authUserData = {
                  email: googleEmail,
                  name: checkData.user.name || result.user.displayName || googleEmail,
                  photoURL: result.user.photoURL,
                  role: authorizedRole,
                  permissions: checkData.user
                };
                localStorage.setItem(STORAGE_KEYS.SESSION, "authenticated");
                localStorage.setItem("dp_auth_user", JSON.stringify(authUserData));
                updateUserProfileUI(authUserData);
                if (loginGate) loginGate.style.display = "none";
                if (dashboardApp) dashboardApp.style.display = "block";
                startMasterERP();
                showToast(`NOC Access Granted: Welcome ${authUserData.name} (Authorized NOC Administrator)`);
              } else {
                // Access Denied! Email not on whitelist or suspended
                await auth.signOut();
                localStorage.removeItem(STORAGE_KEYS.SESSION);
                localStorage.removeItem("dp_auth_user");
                if (loginError) {
                  loginError.style.display = "block";
                  loginError.innerHTML = `<i data-lucide="shield-alert" style="width:16px; height:16px; display:inline;"></i> <strong>Access Denied:</strong> ${checkData.message || 'Permission denied.'}`;
                  if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
                }
              }
            } catch (err) {
              console.error("Authorization check error:", err);
              // Fallback strictly allowing only the 3 sole permits
              if (SOLE_GOOGLE_PERMITS.includes(googleEmail)) {
                localStorage.setItem(STORAGE_KEYS.SESSION, "authenticated");
                const authUserData = {
                  email: googleEmail,
                  name: result.user.displayName || googleEmail,
                  photoURL: result.user.photoURL,
                  role: "admin"
                };
                localStorage.setItem("dp_auth_user", JSON.stringify(authUserData));
                updateUserProfileUI(authUserData);
                if (loginGate) loginGate.style.display = "none";
                if (dashboardApp) dashboardApp.style.display = "block";
                startMasterERP();
                showToast(`NOC Access Granted: Welcome ${authUserData.name} (NOC Administrator)`);
              } else {
                await auth.signOut();
                if (loginError) {
                  loginError.style.display = "block";
                  loginError.innerHTML = `<i data-lucide="shield-alert" style="width:16px; height:16px; display:inline;"></i> <strong>Access Denied:</strong> ${googleEmail} is not authorized for DATA PORT NOC.`;
                  if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
                }
              }
            }
          }
        } catch (err) {
          console.error("Google Auth Error:", err);
          if (loginError) {
            loginError.style.display = "block";
            loginError.textContent = err.message || "Google Authentication failed.";
          }
        } finally {
          if (googleBtn) {
            googleBtn.disabled = false;
            googleBtn.innerHTML = `
              <svg class="google-icon-svg" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Continue with Google (NOC Access)</span>`;
          }
        }
      });
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
        try {
          const auth = getFirebaseAuth();
          if (auth) auth.signOut();
        } catch (_) {}
        localStorage.removeItem(STORAGE_KEYS.SESSION);
        localStorage.removeItem("dp_auth_user");
        sessionStorage.removeItem(STORAGE_KEYS.VAULT_UNLOCKED);
        window.location.reload();
      });
    }
  }

  /* =========================================================================
     2. MASTER ERP STARTUP & DATA SYNC
     ========================================================================= */
  async 
  /* =========================================================================
     15. AUTHORIZED USERS & TEAM ACCESS CONTROL ENGINE (RBAC / GMAIL WHITELIST)
     ========================================================================= */
  let userSearchQuery = "";
  let userRoleFilterValue = "all";

  function initUsersModule() {
    const openBtn = document.getElementById("openAddUserModalBtn");
    if (openBtn) {
      openBtn.removeEventListener("click", () => openUserModal());
      openBtn.addEventListener("click", () => openUserModal());
    }

    const closeBtn = document.getElementById("closeUserModalBtn");
    if (closeBtn) {
      closeBtn.removeEventListener("click", closeUserModal);
      closeBtn.addEventListener("click", closeUserModal);
    }

    const cancelBtn = document.getElementById("cancelUserModalBtn");
    if (cancelBtn) {
      cancelBtn.removeEventListener("click", closeUserModal);
      cancelBtn.addEventListener("click", closeUserModal);
    }

    const form = document.getElementById("userForm");
    if (form) {
      form.removeEventListener("submit", handleUserFormSubmit);
      form.addEventListener("submit", handleUserFormSubmit);
    }

    const searchInput = document.getElementById("userSearchInput");
    if (searchInput) {
      searchInput.removeEventListener("input", handleUserSearch);
      searchInput.addEventListener("input", handleUserSearch);
    }

    const roleFilter = document.getElementById("userRoleFilter");
    if (roleFilter) {
      roleFilter.removeEventListener("change", handleUserRoleFilter);
      roleFilter.addEventListener("change", handleUserRoleFilter);
    }
  }

  function handleUserSearch(e) {
    userSearchQuery = e.target.value.toLowerCase().trim();
    renderUsers();
  }

  function handleUserRoleFilter(e) {
    userRoleFilterValue = e.target.value;
    renderUsers();
  }

  async function loadUsersFromApi() {
    try {
      const res = await fetch("api/users.php");
      const data = await res.json();
      if (data.success && Array.isArray(data.users)) {
        if (!db) db = {};
        db.users = data.users;
        renderUsers();
      }
    } catch (err) {
      console.warn("Could not load users from api/users.php:", err);
    }
  }

  function renderUsers() {
    const tbody = document.getElementById("authorizedUsersTableBody");
    const sideCount = document.getElementById("sideUsersCount");
    const statTotal = document.getElementById("usrStatTotal");
    const statGoogle = document.getElementById("usrStatGoogle");
    const statAdmins = document.getElementById("usrStatAdmins");

    const users = (db && db.users) ? db.users : [];

    if (sideCount) sideCount.textContent = users.length;
    if (statTotal) statTotal.textContent = users.length;
    if (statGoogle) statGoogle.textContent = users.filter(u => u.can_login_google == 1).length;
    if (statAdmins) statAdmins.textContent = users.filter(u => u.role === "admin" || u.role === "noc_engineer").length;

    if (!tbody) return;

    // Filter users
    const filtered = users.filter(u => {
      if (userRoleFilterValue !== "all" && u.role !== userRoleFilterValue) {
        return false;
      }
      if (userSearchQuery) {
        const full = `${u.name} ${u.email} ${u.role} ${u.notes || ""}`.toLowerCase();
        if (!full.includes(userSearchQuery)) return false;
      }
      return true;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center text-muted" style="padding:2.5rem;">
            No authorized users found matching your criteria.
          </td>
        </tr>
      `;
      return;
    }

    const roleBadges = {
      admin: '<span class="badge" style="background:rgba(168,85,247,0.15); color:#c084fc; border:1px solid rgba(168,85,247,0.3); font-weight:700;">Super Admin</span>',
      noc_engineer: '<span class="badge" style="background:rgba(138,206,0,0.15); color:var(--lime); border:1px solid rgba(138,206,0,0.3); font-weight:700;">NOC Engineer</span>',
      billing_agent: '<span class="badge" style="background:rgba(59,130,246,0.15); color:#60a5fa; border:1px solid rgba(59,130,246,0.3);">Billing & Finance</span>',
      technician: '<span class="badge" style="background:rgba(245,158,11,0.15); color:#fbbf24; border:1px solid rgba(245,158,11,0.3);">Field Tech</span>',
      viewer: '<span class="badge" style="background:rgba(255,255,255,0.06); color:var(--text-secondary);">Observer</span>'
    };

    tbody.innerHTML = filtered.map(u => {
      const initials = (u.name || u.email).substring(0, 2).toUpperCase();
      const isActive = (u.status === "active");
      const canGoogle = (u.can_login_google == 1);

      const perms = [];
      if (u.can_access_invoices == 1) perms.push("Billing");
      if (u.can_access_subscribers == 1) perms.push("Subs");
      if (u.can_access_ledger == 1) perms.push("Ledger");
      if (u.can_access_vault == 1) perms.push("Vault");
      const permsStr = perms.length ? perms.join(" • ") : "None";

      const googleBadge = canGoogle
        ? '<span class="badge" style="background:rgba(138,206,0,0.12); color:var(--lime);"><i data-lucide="check" style="width:11px; height:11px; display:inline;"></i> Gmail Auth Active</span>'
        : '<span class="badge" style="background:rgba(239,68,68,0.12); color:#ef4444;"><i data-lucide="x" style="width:11px; height:11px; display:inline;"></i> Disabled</span>';

      const statusBadge = isActive
        ? '<span class="badge" style="background:rgba(16,185,129,0.15); color:#10b981;">Active</span>'
        : '<span class="badge" style="background:rgba(239,68,68,0.15); color:#ef4444;">Suspended</span>';

      const lastLoginStr = u.last_login_at ? u.last_login_at.substring(0, 16) : "Never";

      return `
        <tr>
          <td>
            <div style="display:flex; align-items:center; gap:0.75rem;">
              <div style="width:36px; height:36px; border-radius:50%; background:rgba(138,206,0,0.12); border:1px solid rgba(138,206,0,0.25); display:flex; align-items:center; justify-content:center; font-weight:800; font-size:0.8125rem; color:var(--lime);">
                ${initials}
              </div>
              <div>
                <strong style="color:var(--text-primary); font-size:0.875rem; display:block;">${u.name}</strong>
                <span class="text-muted" style="font-family:var(--font-mono); font-size:0.75rem;">${u.email}</span>
              </div>
            </div>
          </td>
          <td>${roleBadges[u.role] || u.role}</td>
          <td>${googleBadge}</td>
          <td style="font-size:0.75rem; color:var(--text-secondary);">${permsStr}</td>
          <td>${statusBadge}</td>
          <td style="font-size:0.75rem; font-family:var(--font-mono); color:var(--text-muted);">${lastLoginStr}</td>
          <td style="text-align:right;">
            <div style="display:inline-flex; gap:0.35rem; align-items:center;">
              <button class="btn btn-secondary btn-sm" onclick="window.dpEditUser('${u.id}')" title="Edit Permissions">
                <i data-lucide="edit-3" style="width:13px; height:13px;"></i>
              </button>
              <button class="btn btn-secondary btn-sm" onclick="window.dpToggleUserStatus('${u.id}', '${u.status}')" title="${isActive ? 'Suspend Access' : 'Activate Access'}">
                <i data-lucide="${isActive ? 'pause-circle' : 'play-circle'}" style="width:13px; height:13px; color:${isActive ? '#f59e0b' : 'var(--lime)'};"></i>
              </button>
              ${u.id !== 'usr-root-owner' ? `
                <button class="btn btn-secondary btn-sm" onclick="window.dpDeleteUser('${u.id}', '${u.email}')" title="Revoke & Delete Access" style="color:#ef4444;">
                  <i data-lucide="trash-2" style="width:13px; height:13px;"></i>
                </button>
              ` : ''}
            </div>
          </td>
        </tr>
      `;
    }).join("");

    if (window.lucide && window.lucide.createIcons) {
      window.lucide.createIcons();
    }
  }

  function openUserModal(userId = null) {
    initUsersModule();
    const modal = document.getElementById("userModal");
    const title = document.getElementById("userModalTitle");
    const formId = document.getElementById("usrFormId");
    const formName = document.getElementById("usrFormName");
    const formEmail = document.getElementById("usrFormEmail");
    const formRole = document.getElementById("usrFormRole");
    const formCanGoogle = document.getElementById("usrFormCanGoogle");
    const formPermInv = document.getElementById("usrPermInvoices");
    const formPermSub = document.getElementById("usrPermSubscribers");
    const formPermLedger = document.getElementById("usrPermLedger");
    const formPermVault = document.getElementById("usrPermVault");
    const formNotes = document.getElementById("usrFormNotes");

    if (!modal) return;

    if (userId) {
      const users = (db && db.users) ? db.users : [];
      const user = users.find(u => u.id === userId);
      if (user) {
        if (title) title.textContent = "Edit Authorized User Permissions";
        if (formId) formId.value = user.id;
        if (formName) formName.value = user.name || "";
        if (formEmail) formEmail.value = user.email || "";
        if (formRole) formRole.value = user.role || "noc_engineer";
        if (formCanGoogle) formCanGoogle.checked = (user.can_login_google == 1);
        if (formPermInv) formPermInv.checked = (user.can_access_invoices == 1);
        if (formPermSub) formPermSub.checked = (user.can_access_subscribers == 1);
        if (formPermLedger) formPermLedger.checked = (user.can_access_ledger == 1);
        if (formPermVault) formPermVault.checked = (user.can_access_vault == 1);
        if (formNotes) formNotes.value = user.notes || "";
      }
    } else {
      if (title) title.textContent = "Authorize User for NOC Dashboard";
      if (formId) formId.value = "";
      if (formName) formName.value = "";
      if (formEmail) formEmail.value = "";
      if (formRole) formRole.value = "noc_engineer";
      if (formCanGoogle) formCanGoogle.checked = true;
      if (formPermInv) formPermInv.checked = true;
      if (formPermSub) formPermSub.checked = true;
      if (formPermLedger) formPermLedger.checked = true;
      if (formPermVault) formPermVault.checked = false;
      if (formNotes) formNotes.value = "";
    }

    modal.style.display = "flex";
    if (formName) formName.focus();
  }

  function closeUserModal() {
    const modal = document.getElementById("userModal");
    if (modal) modal.style.display = "none";
  }

  async function handleUserFormSubmit(e) {
    e.preventDefault();
    const id = document.getElementById("usrFormId").value;
    const name = document.getElementById("usrFormName").value.trim();
    const email = document.getElementById("usrFormEmail").value.trim().toLowerCase();
    const role = document.getElementById("usrFormRole").value;
    const canGoogle = document.getElementById("usrFormCanGoogle").checked ? 1 : 0;
    const canInv = document.getElementById("usrPermInvoices").checked ? 1 : 0;
    const canSub = document.getElementById("usrPermSubscribers").checked ? 1 : 0;
    const canLedger = document.getElementById("usrPermLedger").checked ? 1 : 0;
    const canVault = document.getElementById("usrPermVault").checked ? 1 : 0;
    const notes = document.getElementById("usrFormNotes").value.trim();

    if (!email) {
      alert("Email address is required.");
      return;
    }

    const payload = {
      action: "save",
      id: id || undefined,
      name,
      email,
      role,
      status: "active",
      can_login_google: canGoogle,
      can_access_invoices: canInv,
      can_access_subscribers: canSub,
      can_access_ledger: canLedger,
      can_access_vault: canVault,
      notes
    };

    try {
      const res = await fetch("api/users.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        showToast(`User ${email} successfully authorized with Google sign-in.`);
        closeUserModal();
        await loadUsersFromApi();
      } else {
        alert("Error saving user: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Save user error:", err);
      alert("Failed to connect to users API: " + err.message);
    }
  }

  window.dpEditUser = function(id) {
    openUserModal(id);
  };

  window.dpToggleUserStatus = async function(id, currentStatus) {
    const newStatus = (currentStatus === "active") ? "suspended" : "active";
    try {
      const res = await fetch("api/users.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle_status", id, status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`User status updated to ${newStatus}.`);
        await loadUsersFromApi();
      }
    } catch (err) {
      console.error(err);
    }
  };

  window.dpDeleteUser = async function(id, email) {
    if (!confirm(`Are you sure you want to permanently revoke NOC access and delete ${email}?`)) {
      return;
    }
    try {
      const res = await fetch("api/users.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Revoked access for ${email}.`);
        await loadUsersFromApi();
      } else {
        alert("Cannot delete user: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
    }
  };


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
    initWebsitesCatalog();
    renderAll();
  }

  async function loadDatabase() {
    // 1. Try to fetch live state from backend database (API)
    try {
      const endpoints = ["api/erp.php", "/api/erp"];
      let liveData = null;
      for (const ep of endpoints) {
        try {
          const res = await fetch(ep);
          if (res.ok) {
            const data = await res.json();
            if (data && data.success) {
              liveData = data;
              break;
            }
          }
        } catch (_) {}
      }

      if (liveData) {
        // Map database fields to JavaScript camelCase conventions
        const mappedSubs = (liveData.subscribers || []).map(s => ({
          id: s.id,
          name: s.name,
          company: s.company || "",
          phone: s.phone || "",
          email: s.email || "",
          location: s.location || "Mombasa",
          ipAddress: s.ip_address || s.ipAddress || "",
          pppoeUser: s.pppoe_user || s.pppoeUser || "",
          pppoePass: s.pppoe_pass || s.pppoePass || "",
          routerModel: s.router_model || s.routerModel || "",
          package: s.package || "Fiber Internet",
          speed: s.speed || "",
          monthlyRate: Number(s.monthly_rate) || Number(s.monthlyRate) || 0,
          price: Number(s.monthly_rate) || Number(s.price) || 0,
          billingDay: Number(s.billing_day) || Number(s.billingDay) || 1,
          source: s.source || "web",
          status: s.status || "active",
          notes: s.notes || ""
        }));

        const mappedInvoices = (liveData.invoices || []).map(i => ({
          id: i.id,
          invoiceNo: i.invoice_no || i.invoiceNo || "",
          docType: i.doc_type || i.docType || "Invoice",
          clientType: i.client_type || i.clientType || "general",
          clientName: i.client_name || i.clientName || "",
          phone: i.phone || "",
          email: i.email || "",
          location: i.location || "Mombasa",
          subId: i.sub_id || i.subId || null,
          status: i.status || "unpaid",
          issueDate: i.issue_date || i.issueDate || "",
          dueDate: i.due_date || i.dueDate || "",
          billingPeriod: i.billing_period || i.billingPeriod || "",
          subtotal: Number(i.subtotal) || 0,
          tax: Number(i.tax) || 0,
          labourFee: Number(i.labour_fee) || Number(i.labourFee) || 0,
          total: Number(i.total) || Number(i.grandTotal) || Number(i.amount) || 0,
          amount: Number(i.total) || Number(i.amount) || 0,
          grandTotal: Number(i.total) || Number(i.grandTotal) || 0,
          totalPaid: Number(i.total_paid) || Number(i.totalPaid) || 0,
          balanceDue: Number(i.balance_due) || Number(i.balanceDue) || 0,
          hasPaymentPlan: Boolean(Number(i.has_payment_plan) || i.hasPaymentPlan),
          depositAmount: Number(i.deposit_amount) || Number(i.depositAmount) || 0,
          depositLabel: i.deposit_label || i.depositLabel || "1 ST Installment",
          notes: i.notes || "",
          validityNote: i.validity_note || i.validityNote || "Please Note: Valid for 14 days from date.",
          items: (i.items || []).map(it => ({
            id: it.id,
            title: it.title || "Technical Service Deliverable",
            description: it.description || "",
            qty: it.qty || "1",
            rate: Number(it.rate) || 0,
            total: Number(it.total) || 0
          }))
        }));

        const mappedJobs = (liveData.jobCards || []).map(j => ({
          id: j.id,
          title: j.title,
          clientName: j.client_name || j.clientName || "",
          technician: j.technician || "Lead Tech",
          date: j.date || new Date().toISOString().split("T")[0],
          status: j.status || "in_progress",
          category: j.category || "Field Operations",
          laborCost: Number(j.labor_cost) || Number(j.laborCost) || 0,
          totalCost: Number(j.total_cost) || Number(j.totalCost) || 0,
          notes: j.notes || "",
          siteRequirements: j.site_requirements || j.siteRequirements || "",
          progressNotes: j.progress_notes || j.progressNotes || "",
          credentials: j.credentials || "",
          invoiceGenerated: Boolean(Number(j.invoice_generated)),
          invoiceRef: j.invoice_ref || j.invoiceRef || null
        }));

        const mappedLedger = (liveData.ledger || []).map(l => ({
          id: l.id,
          date: l.date || new Date().toISOString().split("T")[0],
          description: l.description,
          category: l.category || "General",
          type: l.type || "income",
          amount: Number(l.amount) || 0,
          paymentMethod: l.payment_method || l.paymentMethod || "M-Pesa",
          reference: l.reference || "",
          entity: l.entity || "DATA PORT Core"
        }));

        erpState = {
          subscribers: mappedSubs,
          invoices: mappedInvoices,
          jobCards: mappedJobs,
          ledger: mappedLedger,
          users: liveData.users || [],
          inventory: (liveData.inventory && liveData.inventory.length) ? liveData.inventory : (INITIAL_ERP_DATA.inventory || []),
          lastUpdated: liveData.timestamp || new Date().toISOString()
        };
        saveDatabase(false); // save to local cache without re-triggering remote push
        return;
      }
    } catch (err) {
      console.warn("Live backend fetch unavailable, falling back to cache:", err);
    }

    // 2. Fallback to localStorage cache (No forced re-injection of deleted records)
    const cached = localStorage.getItem(STORAGE_KEYS.ERP_DATA);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed === "object") {
          erpState = parsed;
          if (!Array.isArray(erpState.subscribers)) erpState.subscribers = [];
          if (!Array.isArray(erpState.invoices)) erpState.invoices = [];
          if (!Array.isArray(erpState.jobCards)) erpState.jobCards = [];
          if (!Array.isArray(erpState.ledger)) erpState.ledger = [];
          // Automatically purge obsolete demo placeholder records from storage
          const demoSubIds = ['sub-101', 'sub-102', 'sub-103', 'sub-104', 'sub-105', 'sub-106', 'sub-107'];
          const demoInvIds = ['inv-001', 'inv-002', 'inv-003', 'inv-004', 'inv-005', 'inv-006', 'inv-007', 'inv-008'];
          erpState.subscribers = erpState.subscribers.filter(s => !demoSubIds.includes(s.id) && !(s.name && s.name.includes("Mombasa Ocean View")));
          erpState.invoices = erpState.invoices.filter(i => !demoInvIds.includes(i.id));
          saveDatabase(false);
          return;
        }
      } catch (err) {
        console.error("Error parsing cached ERP data, loading defaults:", err);
      }
    }

    // 3. Absolute initial state
    erpState = JSON.parse(JSON.stringify(INITIAL_ERP_DATA));
    saveDatabase(false);
  }

  function saveDatabase(syncToBackend = true) {
    try {
      erpState.lastUpdated = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.ERP_DATA, JSON.stringify(erpState));
      
      if (syncToBackend) {
        // Sync updated state to backend database asynchronously
        const syncPayload = {
          subscribers: erpState.subscribers || [],
          invoices: erpState.invoices || [],
          jobCards: erpState.jobCards || [],
          ledger: erpState.ledger || [],
          lastUpdated: erpState.lastUpdated
        };
        const headers = { "Content-Type": "application/json", "x-admin-key": "dpinc-staff-master" };
        fetch("api/erp.php", { method: "POST", headers, body: JSON.stringify(syncPayload) })
          .catch(() => fetch("/api/erp", { method: "POST", headers, body: JSON.stringify(syncPayload) }))
          .catch(e => console.warn("Backend ERP sync notice:", e));
      }
    } catch (e) {
      console.warn("LocalStorage save error:", e);
    }
  }

  // Universal Permanent Deletion Helper
  window.dpPermanentDelete = async function(type, id) {
    const endpoints = [
      `/api/erp?type=${encodeURIComponent(type)}&id=${encodeURIComponent(id)}`,
      `api/erp.php?type=${encodeURIComponent(type)}&id=${encodeURIComponent(id)}`
    ];
    for (const url of endpoints) {
      try {
        const res = await fetch(url, {
          method: "DELETE",
          headers: { "x-admin-key": "dpinc-staff-master" }
        });
        if (res.ok) return true;
      } catch (_) {}
    }
    return false;
  };

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
     3. TAB NAVIGATION CONTROLLER & SIDEBAR PANEL
     ========================================================================= */
  function setupTabNavigation() {
    const tabBtns = document.querySelectorAll(".dash-tab, .dash-side-nav-btn");
    const tabPanes = document.querySelectorAll(".dash-tab-pane");
    const quickActionLabel = document.getElementById("quickActionLabel");
    const sidebarToggleBtn = document.getElementById("sidebarToggleBtn");
    const sidebar = document.getElementById("dashSidebar");

    // Sidebar Toggle
    if (sidebarToggleBtn && sidebar) {
      sidebarToggleBtn.addEventListener("click", () => {
        sidebar.classList.toggle("collapsed");
      });
    }

    tabBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const targetTabId = btn.getAttribute("data-tab");
        activeTab = targetTabId;

        // Sync active state on both top-bar and sidebar buttons
        tabBtns.forEach(b => {
          if (b.getAttribute("data-tab") === targetTabId) {
            b.classList.add("active");
          } else {
            b.classList.remove("active");
          }
        });

        tabPanes.forEach(p => p.classList.remove("active"));

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
          initUsersModule();
    loadUsersFromApi();
    renderUsers();
    renderCalendar();
        } else if (targetTabId === "vaultTab") {
          renderVaultDetails();
        } else if (targetTabId === "tariffsTab") {
          renderTariffManager();
        } else if (targetTabId === "websitesTab") {
          if (window.lucide) window.lucide.createIcons();
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

    // Update Tab Counts (both top tab bar and side panel)
    const tabSubs = document.getElementById("tabSubsCount");
    const sideSubs = document.getElementById("sideSubsCount");
    const tabJobs = document.getElementById("tabJobsCount");
    const sideJobs = document.getElementById("sideJobsCount");
    const tabInvoices = document.getElementById("tabInvoicesCount");
    const sideInvoices = document.getElementById("sideInvoicesCount");
    const subsCountVal = totalSubs;
    const jobsCountVal = erpState.jobCards ? erpState.jobCards.length : 0;
    const invoicesCountVal = erpState.invoices ? erpState.invoices.length : 0;

    if (tabSubs) tabSubs.textContent = subsCountVal;
    if (sideSubs) sideSubs.textContent = subsCountVal;
    if (tabJobs) tabJobs.textContent = jobsCountVal;
    if (sideJobs) sideJobs.textContent = jobsCountVal;
    if (tabInvoices) tabInvoices.textContent = invoicesCountVal;
    if (sideInvoices) sideInvoices.textContent = invoicesCountVal;

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
    fetch("api/invoices.php", {
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
    const invoices = (erpState && Array.isArray(erpState.invoices)) ? erpState.invoices : [];

    // Compute Metrics safely
    let totalBilled = 0;
    let totalPaid = 0;
    let partialDeposits = 0;
    let pendingReceivables = 0;

    let countAll = invoices.length;
    let countUnpaid = 0;
    let countPartial = 0;
    let countPaid = 0;

    invoices.forEach(inv => {
      if (!inv) return;
      const gTotal = Number(inv.grandTotal || inv.total || inv.amount) || 0;
      const tPaid = Number(inv.totalPaid !== undefined ? inv.totalPaid : (inv.status === "paid" ? gTotal : (inv.depositAmount || 0))) || 0;
      const bal = Number(inv.balanceDue !== undefined ? inv.balanceDue : Math.max(0, gTotal - tPaid)) || 0;

      totalBilled += gTotal;

      if (inv.status === "paid" || (bal === 0 && gTotal > 0)) {
        totalPaid += gTotal;
        countPaid++;
      } else if (inv.status === "partial" || (tPaid > 0 && bal > 0)) {
        totalPaid += tPaid;
        partialDeposits += tPaid;
        pendingReceivables += bal;
        countPartial++;
      } else {
        pendingReceivables += (bal > 0 ? bal : gTotal);
        countUnpaid++;
      }
    });

    // Update stats cards
    const elBilled = document.getElementById("invStatTotalBilled");
    const elPaid = document.getElementById("invStatTotalPaid");
    const elPartial = document.getElementById("invStatPartialDeposits");
    const elPending = document.getElementById("invStatPendingBalance");

    if (elBilled) elBilled.textContent = 'KSh ' + totalBilled.toLocaleString();
    if (elPaid) elPaid.textContent = 'KSh ' + totalPaid.toLocaleString();
    if (elPartial) elPartial.textContent = 'KSh ' + partialDeposits.toLocaleString();
    if (elPending) elPending.textContent = 'KSh ' + pendingReceivables.toLocaleString();

    const elTotalCount = document.getElementById("invStatTotalCount");
    const elPaidCount = document.getElementById("invStatPaidCount");
    const elPartialCount = document.getElementById("invStatPartialCount");
    const elDueCount = document.getElementById("invStatDueCount");

    if (elTotalCount) elTotalCount.textContent = countAll + ' Invoices Recorded';
    if (elPaidCount) elPaidCount.textContent = countPaid + ' Cleared Full';
    if (elPartialCount) elPartialCount.textContent = countPartial + ' Active Plans';
    if (elDueCount) elDueCount.textContent = countUnpaid + ' Due / Unpaid';

    // Update filter pill badges
    const pillAll = document.getElementById("pillCountAll");
    const pillUnpaid = document.getElementById("pillCountUnpaid");
    const pillPartial = document.getElementById("pillCountPartial");
    const pillPaid = document.getElementById("pillCountPaid");

    if (pillAll) pillAll.textContent = countAll;
    if (pillUnpaid) pillUnpaid.textContent = countUnpaid;
    if (pillPartial) pillPartial.textContent = countPartial;
    if (pillPaid) pillPaid.textContent = countPaid;

    const sideInvCount = document.getElementById("sideInvoicesCount");
    if (sideInvCount) sideInvCount.textContent = countAll;

    const tabInvCount = document.getElementById("tabInvoicesCount");
    if (tabInvCount) tabInvCount.textContent = countAll;

    if (!tbody) return;

    // Filter Invoices
    let filtered = invoices.filter(inv => {
      if (!inv) return false;
      const gTotal = Number(inv.grandTotal || inv.total || inv.amount) || 0;
      const tPaid = Number(inv.totalPaid !== undefined ? inv.totalPaid : (inv.status === "paid" ? gTotal : (inv.depositAmount || 0))) || 0;
      const bal = Number(inv.balanceDue !== undefined ? inv.balanceDue : Math.max(0, gTotal - tPaid)) || 0;
      const isPaid = (inv.status === "paid" || bal === 0);
      const isPartial = (inv.status === "partial" || (tPaid > 0 && bal > 0));
      const isUnpaid = (inv.status === "unpaid" || (bal > 0 && tPaid === 0));

      // Status filter
      if (currentInvoiceFilter === "unpaid" && !isUnpaid) return false;
      if (currentInvoiceFilter === "partial" && !isPartial) return false;
      if (currentInvoiceFilter === "paid" && !isPaid) return false;

      // Type filter
      const clientType = (inv.clientType || inv.client_type || "subscriber").toLowerCase();
      if (currentInvoiceTypeFilter === "subscriber" && clientType.includes("general")) return false;
      if (currentInvoiceTypeFilter === "general" && !clientType.includes("general")) return false;

      // Search term
      if (currentInvoiceSearchTerm) {
        const query = currentInvoiceSearchTerm;
        const matchesClient = (inv.clientName || inv.client_name || "").toLowerCase().includes(query);
        const matchesNo = (inv.invoiceNo || inv.invoice_no || "").toLowerCase().includes(query);
        const matchesPhone = (inv.phone || "").toLowerCase().includes(query);
        if (!matchesClient && !matchesNo && !matchesPhone) return false;
      }

      return true;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" class="text-center" style="padding:3.5rem 1.5rem; color:var(--text-muted);">' +
        '<div style="max-width:420px; margin:0 auto; text-align:center;">' +
        '<i data-lucide="inbox" style="width:42px; height:42px; margin-bottom:0.75rem; color:var(--text-muted); opacity:0.5;"></i>' +
        '<h4 style="font-weight:700; color:var(--text-primary); margin-bottom:0.5rem;">No Invoices Found</h4>' +
        '<p style="font-size:0.875rem; line-height:1.5; margin-bottom:1.25rem;">No client invoices match the active filter. You can create a new invoice or switch the status filter.</p>' +
        '<button class="btn btn-primary btn-sm" onclick="window.dpOpenCreateInvoice()"><i data-lucide="plus" style="width:14px; height:14px;"></i> Create New Invoice</button>' +
        '</div></td></tr>';
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    tbody.innerHTML = filtered.map(inv => {
      const gTotal = Number(inv.grandTotal || inv.total || inv.amount) || 0;
      const tPaid = Number(inv.totalPaid !== undefined ? inv.totalPaid : (inv.status === "paid" ? gTotal : (inv.depositAmount || 0))) || 0;
      const bal = Number(inv.balanceDue !== undefined ? inv.balanceDue : Math.max(0, gTotal - tPaid)) || 0;

      const isPaid = (inv.status === "paid" || bal === 0);
      const isPartial = (inv.status === "partial" || (tPaid > 0 && bal > 0));
      const isOverdue = (bal > 0);

      // Status pill
      let statusBadge = "";
      if (isPaid) {
        statusBadge = '<span class="badge" style="display:inline-flex; align-items:center; gap:4px; padding:4px 10px; border-radius:12px; font-weight:800; font-size:0.75rem; text-transform:uppercase; background:rgba(34,197,94,0.12); border:1px solid #22c55e; color:#15803d;">' +
          '<i data-lucide="check-circle" style="width:12px; height:12px;"></i> PAID IN FULL</span>';
      } else if (isPartial) {
        statusBadge = '<span class="badge" style="display:inline-flex; align-items:center; gap:4px; padding:4px 10px; border-radius:12px; font-weight:800; font-size:0.75rem; text-transform:uppercase; background:rgba(234,179,8,0.12); border:1px solid #eab308; color:#a16207;">' +
          '<i data-lucide="clock" style="width:12px; height:12px;"></i> PARTIAL DEPOSIT</span>';
      } else {
        statusBadge = '<span class="badge" style="display:inline-flex; align-items:center; gap:4px; padding:4px 10px; border-radius:12px; font-weight:800; font-size:0.75rem; text-transform:uppercase; background:rgba(239,68,68,0.12); border:1px solid #ef4444; color:#b91c1c;">' +
          '<i data-lucide="alert-triangle" style="width:12px; height:12px;"></i> OVERDUE</span>';
      }

      // Client type pill
      const clientType = (inv.clientType || inv.client_type || "subscriber").toLowerCase();
      const typeBadge = clientType.includes("general")
        ? '<span class="badge" style="font-size:0.68rem; padding:1px 6px; background:rgba(59,130,246,0.1); border:1px solid rgba(59,130,246,0.3); color:#3b82f6;">GENERAL ICT</span>'
        : '<span class="badge" style="font-size:0.68rem; padding:1px 6px; background:rgba(92,148,0,0.12); border:1px solid rgba(92,148,0,0.3); color:var(--lime);">ISP SUBSCRIBER</span>';

      // Scope summary
      const itemsCount = (inv.items && Array.isArray(inv.items)) ? inv.items.length : 1;
      const firstItemTitle = (inv.items && inv.items[0] && inv.items[0].title) ? inv.items[0].title : (inv.package || "Fiber Internet Subscription");
      const summaryText = itemsCount > 1 ? firstItemTitle + ' (+' + (itemsCount - 1) + ' more)' : firstItemTitle;

      const dueDateText = inv.dueDate || inv.due_date || "--";
      const billingPeriodText = inv.billingPeriod || inv.billing_period || "";

      return '<tr style="border-bottom:1px solid var(--border-color); transition:background 0.15s ease;">' +
        '<td>' +
          '<div style="font-family:var(--font-mono); font-weight:800; font-size:0.9rem; color:var(--text-primary); letter-spacing:-0.02em;">' + escapeHtml(inv.invoiceNo || inv.invoice_no || '') + '</div>' +
          '<div style="font-size:0.72rem; color:var(--text-muted); text-transform:uppercase; font-weight:700; margin-top:2px;">' + escapeHtml(inv.docType || inv.doc_type || 'INVOICE') + (billingPeriodText ? ' • ' + escapeHtml(billingPeriodText) : '') + '</div>' +
        '</td>' +
        '<td>' +
          '<div style="display:flex; align-items:center; gap:0.45rem; margin-bottom:2px; flex-wrap:wrap;">' +
            '<strong style="color:var(--text-primary); font-size:0.925rem; font-weight:700;">' + escapeHtml(inv.clientName || inv.client_name || 'Client') + '</strong>' +
            typeBadge +
          '</div>' +
          '<div style="font-size:0.8rem; color:var(--text-muted);">' + escapeHtml(inv.phone || 'No phone') + ' • ' + escapeHtml(inv.location || 'Mombasa') + '</div>' +
        '</td>' +
        '<td>' +
          '<div style="font-size:0.875rem; color:var(--text-primary); font-weight:600;">' + escapeHtml(summaryText) + '</div>' +
          '<div style="font-size:0.75rem; color:var(--text-muted); margin-top:2px; display:flex; align-items:center; gap:4px;">' +
            '<span>Due: ' + escapeHtml(dueDateText) + '</span>' +
            (isOverdue ? '<span style="color:#ef4444; font-weight:800; font-size:0.72rem; text-transform:uppercase; background:rgba(239,68,68,0.1); padding:1px 5px; border-radius:4px;">Action Required</span>' : '') +
          '</div>' +
        '</td>' +
        '<td style="text-align:right; font-family:var(--font-mono); font-weight:800; color:var(--text-primary); font-size:0.95rem;">' +
          'KSh ' + gTotal.toLocaleString() +
        '</td>' +
        '<td style="text-align:right; font-family:var(--font-mono); font-weight:700; color:#15803d; font-size:0.95rem;">' +
          'KSh ' + tPaid.toLocaleString() +
        '</td>' +
        '<td style="text-align:right; font-family:var(--font-mono); font-weight:800; color:' + (bal > 0 ? '#ef4444' : '#15803d') + '; font-size:0.95rem;">' +
          'KSh ' + bal.toLocaleString() +
        '</td>' +
        '<td style="text-align:center;">' +
          statusBadge +
        '</td>' +
        '<td style="text-align:right;">' +
          '<div style="display:flex; justify-content:flex-end; gap:0.35rem; flex-wrap:wrap;">' +
            '<button class="btn btn-secondary btn-sm" style="padding:0.35rem 0.5rem;" title="Live A4 Preview" onclick="window.dpOpenPreviewInvoice(\'' + inv.id + '\')">' +
              '<i data-lucide="eye" style="width:14px; height:14px;"></i>' +
            '</button>' +
            '<button class="btn btn-secondary btn-sm" style="padding:0.35rem 0.5rem;" title="Print / Save PDF" onclick="window.dpPrintInvoice(\'' + inv.id + '\')">' +
              '<i data-lucide="printer" style="width:14px; height:14px;"></i>' +
            '</button>' +
            '<button class="btn btn-secondary btn-sm" style="padding:0.35rem 0.5rem; color:#15803d; border-color:rgba(34,197,94,0.3);" title="Record Payment / Deposit" onclick="window.dpRecordInvoicePayment(\'' + inv.id + '\')">' +
              '<i data-lucide="wallet" style="width:14px; height:14px;"></i>' +
            '</button>' +
            '<button class="btn btn-secondary btn-sm" style="padding:0.35rem 0.5rem; color:#25D366; border-color:rgba(37,211,102,0.3);" title="Send WhatsApp Bill" onclick="window.dpDispatchInvoiceWhatsApp(\'' + inv.id + '\')">' +
              '<i data-lucide="message-square" style="width:14px; height:14px;"></i>' +
            '</button>' +
            '<button class="btn btn-secondary btn-sm" style="padding:0.35rem 0.5rem;" title="Edit Invoice" onclick="window.dpOpenCreateInvoice(null, \'' + inv.id + '\')">' +
              '<i data-lucide="edit-3" style="width:14px; height:14px;"></i>' +
            '</button>' +
            '<button class="btn btn-secondary btn-sm" style="padding:0.35rem 0.5rem; color:#ef4444; border-color:rgba(239,68,68,0.3);" title="Delete Invoice" onclick="window.dpDeleteInvoice(\'' + inv.id + '\')">' +
              '<i data-lucide="trash-2" style="width:14px; height:14px;"></i>' +
            '</button>' +
          '</div>' +
        '</td>' +
      '</tr>';
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

  window.dpDeleteInvoice = async function(invId) {
    const inv = (erpState.invoices || []).find(i => i.id === invId);
    if (!inv) return;
    if (!confirm(`Are you sure you want to permanently delete invoice ${inv.invoiceNo} for ${inv.clientName}?`)) return;

    erpState.invoices = (erpState.invoices || []).filter(i => i.id !== invId);
    saveDatabase();

    // Background permanent delete from SQL database backend
    await fetch(`api/invoices.php?id=${encodeURIComponent(invId)}`, { method: "DELETE" }).catch(() => {});
    await window.dpPermanentDelete("invoice", invId);

    renderAll();
    showToast(`Invoice ${inv.invoiceNo} permanently deleted from database.`);
  };

  window.dpPurgeDemoRecords = async function() {
    if (!confirm("Are you sure you want to release and permanently purge all demo subscribers and demo invoices from the database? This will give you a clean slate to add your own real records.")) return;

    try {
      const res = await fetch("api/seed.php?action=purge_demo");
      const data = await res.json();
      if (data && data.success) {
        const demoSubIds = ['sub-101', 'sub-102', 'sub-103', 'sub-104', 'sub-105', 'sub-106', 'sub-107'];
        const demoInvIds = ['inv-001', 'inv-002', 'inv-003', 'inv-004', 'inv-005', 'inv-006', 'inv-007', 'inv-008'];

        erpState.subscribers = (erpState.subscribers || []).filter(s => !demoSubIds.includes(s.id));
        erpState.invoices = (erpState.invoices || []).filter(i => !demoInvIds.includes(i.id));

        saveDatabase();
        renderAll();
        showToast("Demo subscribers & invoices released and cleared from database!");
      } else {
        alert("Notice: " + (data.error || "Purge completed."));
      }
    } catch (e) {
      console.error("Purge error:", e);
      showToast("Purge request processed.");
    }
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

        ${job.siteRequirements ? `
          <div style="background:rgba(0,0,0,0.03); border-radius:6px; padding:0.5rem 0.75rem; margin-bottom:0.65rem; font-size:0.8rem; border-left:3px solid var(--border-color);">
            <div style="font-weight:700; color:var(--text-primary); margin-bottom:0.15rem; display:flex; align-items:center; gap:0.35rem;">
              <i data-lucide="clipboard-list" style="width:12px; height:12px;"></i> Site Requirements:
            </div>
            <div style="color:var(--text-secondary); white-space:pre-wrap;">${job.siteRequirements}</div>
          </div>
        ` : ''}

        ${job.progressNotes ? `
          <div style="background:rgba(92, 148, 0, 0.04); border-radius:6px; padding:0.5rem 0.75rem; margin-bottom:0.65rem; font-size:0.8rem; border-left:3px solid var(--lime);">
            <div style="font-weight:700; color:var(--lime); margin-bottom:0.15rem; display:flex; align-items:center; gap:0.35rem;">
              <i data-lucide="activity" style="width:12px; height:12px;"></i> Progress Milestones:
            </div>
            <div style="color:var(--text-secondary); white-space:pre-wrap;">${job.progressNotes}</div>
          </div>
        ` : ''}

        ${job.credentials ? `
          <div style="background:rgba(0,0,0,0.05); border-radius:6px; padding:0.5rem 0.75rem; margin-bottom:0.65rem; font-size:0.78rem; font-family:var(--font-mono); border-left:3px solid #6366f1;">
            <div style="font-weight:700; color:#4f46e5; margin-bottom:0.15rem; display:flex; align-items:center; gap:0.35rem; font-family:var(--font-sans);">
              <i data-lucide="key" style="width:12px; height:12px;"></i> Site Credentials & Logins:
            </div>
            <div style="color:var(--text-primary); white-space:pre-wrap;">${job.credentials}</div>
          </div>
        ` : ''}

        ${job.notes ? `<p class="text-muted" style="font-size:0.8rem; margin-bottom:1rem; font-style:italic;">"${job.notes}"</p>` : ''}

        <div class="job-cost-bar">
          <div>
            <div class="text-muted" style="font-size:0.75rem; text-transform:uppercase;">Total Billable</div>
            <div style="font-family:var(--font-mono); font-size:1.15rem; font-weight:800; color:#8ACE00;">
              KSh ${(job.totalCost || 0).toLocaleString()}
            </div>
          </div>
          <div style="display:flex; gap:0.4rem; flex-wrap:wrap; justify-content:flex-end;">
            <button class="btn btn-secondary btn-sm" onclick="window.dpEditJobCard('${job.id}')" title="Edit Job Details, Progress & Credentials">
              <i data-lucide="edit" style="width:14px;"></i> Edit
            </button>
            ${!job.invoiceGenerated ? `
              <button class="btn btn-primary btn-sm" onclick="window.dpConvertJobToInvoice('${job.id}')" title="Generate Client Invoice">
                <i data-lucide="file-plus" style="width:14px;"></i> Invoice
              </button>
            ` : `
              <span class="badge" style="background:rgba(138,206,0,0.12); color:#8ACE00; border-color:#8ACE00;">
                <i data-lucide="check" style="width:12px;"></i> Invoiced
              </span>
            `}
            <button class="btn btn-secondary btn-sm" onclick="window.dpToggleJobStatus('${job.id}')" title="Toggle Status">
              <i data-lucide="rotate-cw" style="width:14px;"></i>
            </button>
            <button class="btn btn-secondary btn-sm" style="color:#ef4444;" onclick="window.dpDeleteJob('${job.id}')" title="Delete Job Card">
              <i data-lucide="trash-2" style="width:14px;"></i>
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
    /* =========================================================================
     10. PULSE INVESTMENT FINANCIAL INTELLIGENCE & MONTHLY REPORTS ENGINE
     ========================================================================= */
  let currentPulseMonth = "2026-11";
  let pulseTableSearchQuery = "";
  let pulseTableTypeFilter = "all";

  function initPulseAnalyticsListeners() {
    const monthSelect = document.getElementById("pulseMonthFilter");
    if (monthSelect) {
      monthSelect.removeEventListener("change", handlePulseMonthChange);
      monthSelect.addEventListener("change", handlePulseMonthChange);
    }

    const searchInput = document.getElementById("pulseTableSearch");
    if (searchInput) {
      searchInput.removeEventListener("input", handlePulseSearchInput);
      searchInput.addEventListener("input", handlePulseSearchInput);
    }

    const typeSelect = document.getElementById("pulseTypeFilter");
    if (typeSelect) {
      typeSelect.removeEventListener("change", handlePulseTypeChange);
      typeSelect.addEventListener("change", handlePulseTypeChange);
    }

    const exportBtn = document.getElementById("exportCsvBtn");
    if (exportBtn) {
      exportBtn.removeEventListener("click", exportPulseCsv);
      exportBtn.addEventListener("click", exportPulseCsv);
    }

    const printBtn = document.getElementById("printAnalyticsBtn");
    if (printBtn) {
      printBtn.removeEventListener("click", handlePrintAnalytics);
      printBtn.addEventListener("click", handlePrintAnalytics);
    }
  }

  function handlePulseMonthChange(e) {
    currentPulseMonth = e.target.value;
    renderAnalytics();
  }

  function handlePulseSearchInput(e) {
    pulseTableSearchQuery = e.target.value.toLowerCase().trim();
    renderPulseTable();
  }

  function handlePulseTypeChange(e) {
    pulseTableTypeFilter = e.target.value;
    renderPulseTable();
  }

  function handlePrintAnalytics() {
    window.print();
  }

  function exportPulseCsv() {
    const rawLedger = (db && db.ledger) ? db.ledger : [];
    const filtered = rawLedger.filter(item => {
      if (currentPulseMonth === "all") return true;
      return item.date && item.date.startsWith(currentPulseMonth);
    });

    if (!filtered.length) {
      showToast("No records available to export for this period.");
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Date,Description,Category,Type,Amount (Ksh),Payment Method,Reference\n";

    filtered.forEach(row => {
      const line = [
        row.date || "",
        `"${(row.description || "").replace(/"/g, '""')}"`,
        `"${(row.category || "").replace(/"/g, '""')}"`,
        row.type || "income",
        row.amount || 0,
        `"${(row.payment_method || row.paymentMethod || "M-Pesa").replace(/"/g, '""')}"`,
        `"${(row.reference || "").replace(/"/g, '""')}"`
      ].join(",");
      csvContent += line + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `DataPort_Financial_Report_${currentPulseMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${filtered.length} records to CSV.`);
  }

  function getMonthLabel(ym) {
    const map = {
      "2026-05": "May 2026",
      "2026-06": "June 2026",
      "2026-07": "July 2026",
      "2026-08": "August 2026",
      "2026-09": "September 2026",
      "2026-10": "October 2026",
      "2026-11": "November 2026",
      "all": "All Time (May - Nov 2026)"
    };
    return map[ym] || ym;
  }

  function renderAnalytics() {
    initPulseAnalyticsListeners();

    const rawLedger = (db && db.ledger) ? db.ledger : [];
    const monthSelect = document.getElementById("pulseMonthFilter");
    if (monthSelect && monthSelect.value) {
      currentPulseMonth = monthSelect.value;
    }

    // Filter items
    const isAll = (currentPulseMonth === "all");
    const activeEntries = rawLedger.filter(item => {
      if (isAll) return true;
      return item.date && item.date.startsWith(currentPulseMonth);
    });

    // Calculate Inflow and Outflow
    let inflow = 0;
    let outflow = 0;
    const revCategoryMap = {};
    const expCategoryMap = {};

    activeEntries.forEach(item => {
      const amt = parseFloat(item.amount) || 0;
      const isInc = (item.type === "income" || (item.type && item.type.toLowerCase().includes("income")));
      if (isInc) {
        inflow += amt;
        const cat = item.category || "General Revenue";
        revCategoryMap[cat] = (revCategoryMap[cat] || 0) + amt;
      } else {
        outflow += amt;
        const cat = item.category || "Operating Expenses";
        expCategoryMap[cat] = (expCategoryMap[cat] || 0) + amt;
      }
    });

    const net = inflow - outflow;
    const margin = inflow > 0 ? ((net / inflow) * 100).toFixed(1) : "0.0";

    // Outstanding owed
    let owed = 0;
    if (isAll || currentPulseMonth === "2026-08" || currentPulseMonth === "2026-11") {
      // Afribot outstanding balance
      owed = 1500;
    }

    // Update KPI stat cards
    const elInflow = document.getElementById("pulseInflowVal");
    const elOutflow = document.getElementById("pulseOutflowVal");
    const elNet = document.getElementById("pulseNetVal");
    const elMargin = document.getElementById("pulseMarginVal");
    const elOwed = document.getElementById("pulseOwedVal");
    const elTreasury = document.getElementById("pulseTreasuryVal");
    const elInflowSub = document.getElementById("pulseInflowSub");
    const elOutflowSub = document.getElementById("pulseOutflowSub");
    const elNetSub = document.getElementById("pulseNetSub");

    if (elInflow) elInflow.textContent = `KSh ${inflow.toLocaleString()}`;
    if (elOutflow) elOutflow.textContent = `KSh ${outflow.toLocaleString()}`;
    if (elNet) {
      elNet.textContent = (net >= 0 ? "+" : "-") + `KSh ${Math.abs(net).toLocaleString()}`;
      elNet.style.color = (net >= 0) ? "var(--lime)" : "#ef4444";
    }
    if (elMargin) elMargin.textContent = `${margin}%`;
    if (elOwed) elOwed.textContent = `KSh ${owed.toLocaleString()}`;
    if (elTreasury) {
      if (inflow === 0) {
        elTreasury.textContent = "Standby";
      } else {
        const expRatio = (outflow / inflow) * 100;
        if (expRatio <= 50) {
          elTreasury.textContent = "Optimal (50/30/20)";
          elTreasury.style.color = "var(--lime)";
        } else {
          elTreasury.textContent = `Spend ${expRatio.toFixed(0)}%`;
          elTreasury.style.color = "#f59e0b";
        }
      }
    }

    const monthName = getMonthLabel(currentPulseMonth);
    if (elInflowSub) elInflowSub.textContent = `Verified cash receipts (${monthName})`;
    if (elOutflowSub) elOutflowSub.textContent = `Total disbursements (${monthName})`;
    if (elNetSub) elNetSub.textContent = `Net liquidity gain (${monthName})`;

    // Render Revenue Breakdown List
    const revContainer = document.getElementById("pulseRevenueBreakdownList");
    if (revContainer) {
      const entries = Object.entries(revCategoryMap).sort((a, b) => b[1] - a[1]);
      if (entries.length === 0) {
        revContainer.innerHTML = '<div class="text-muted" style="font-size:0.8125rem;">No revenue recorded for this period.</div>';
      } else {
        revContainer.innerHTML = entries.map(([cat, amt]) => {
          const pct = inflow > 0 ? ((amt / inflow) * 100).toFixed(1) : 0;
          return `
            <div style="margin-bottom:0.75rem;">
              <div class="breakdown-item-header" style="display:flex; justify-content:space-between; font-size:0.8125rem; margin-bottom:0.25rem;">
                <span>${cat}</span>
                <strong style="color:var(--lime); font-family:var(--font-mono);">KSh ${amt.toLocaleString()} (${pct}%)</strong>
              </div>
              <div class="progress-track" style="height:6px; background:rgba(255,255,255,0.06); border-radius:3px; overflow:hidden;">
                <div class="progress-fill-green" style="width:${pct}%; height:100%; background:var(--lime); border-radius:3px;"></div>
              </div>
            </div>
          `;
        }).join("");
      }
    }

    // Render Expense Breakdown List
    const expContainer = document.getElementById("pulseExpenseBreakdownList");
    if (expContainer) {
      const entries = Object.entries(expCategoryMap).sort((a, b) => b[1] - a[1]);
      if (entries.length === 0) {
        expContainer.innerHTML = '<div class="text-muted" style="font-size:0.8125rem;">No expenses recorded for this period.</div>';
      } else {
        expContainer.innerHTML = entries.map(([cat, amt]) => {
          const pct = outflow > 0 ? ((amt / outflow) * 100).toFixed(1) : 0;
          return `
            <div style="margin-bottom:0.75rem;">
              <div class="breakdown-item-header" style="display:flex; justify-content:space-between; font-size:0.8125rem; margin-bottom:0.25rem;">
                <span>${cat}</span>
                <strong style="color:#ef4444; font-family:var(--font-mono);">KSh ${amt.toLocaleString()} (${pct}%)</strong>
              </div>
              <div class="progress-track" style="height:6px; background:rgba(255,255,255,0.06); border-radius:3px; overflow:hidden;">
                <div style="width:${pct}%; height:100%; background:#ef4444; border-radius:3px;"></div>
              </div>
            </div>
          `;
        }).join("");
      }
    }

    // Render Canvas Chart
    renderPulseCanvasChart(isAll, rawLedger, activeEntries);

    // Render Table
    renderPulseTable();
  }

  function renderPulseCanvasChart(isAll, allEntries, activeEntries) {
    const canvas = document.getElementById("cashFlowCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const w = (rect.width || 700);
    const h = (rect.height || 300);
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, w, h);

    const padding = { top: 35, right: 30, bottom: 45, left: 65 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;

    if (isAll) {
      // 7-Month Comparative View: May to Nov 2026
      const monthKeys = ["2026-05", "2026-06", "2026-07", "2026-08", "2026-09", "2026-10", "2026-11"];
      const monthNames = ["May '26", "Jun '26", "Jul '26", "Aug '26", "Sep '26", "Oct '26", "Nov '26"];

      const monthlyData = monthKeys.map(k => {
        let inf = 0;
        let out = 0;
        allEntries.forEach(item => {
          if (item.date && item.date.startsWith(k)) {
            const amt = parseFloat(item.amount) || 0;
            if (item.type === "income" || (item.type && item.type.toLowerCase().includes("income"))) inf += amt;
            else out += amt;
          }
        });
        return { key: k, inflow: inf, outflow: out, net: inf - out };
      });

      let maxVal = 70000;
      monthlyData.forEach(d => {
        if (d.inflow > maxVal) maxVal = d.inflow * 1.15;
      });

      // Grid Lines
      ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
      ctx.lineWidth = 1;
      for (let i = 0; i <= 4; i++) {
        const y = padding.top + (chartH / 4) * i;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(w - padding.right, y);
        ctx.stroke();

        ctx.fillStyle = "#A1A1AA";
        ctx.font = "10px 'JetBrains Mono', monospace";
        ctx.textAlign = "right";
        const val = Math.round(maxVal - (maxVal / 4) * i);
        ctx.fillText(`${(val / 1000).toFixed(0)}k`, padding.left - 10, y + 4);
      }

      const colW = chartW / monthKeys.length;
      const barW = Math.max(14, Math.min(24, colW * 0.28));

      monthlyData.forEach((d, i) => {
        const xc = padding.left + colW * i + colW / 2;

        // Inflow Bar (Lime)
        const inH = (d.inflow / maxVal) * chartH;
        const inY = padding.top + chartH - inH;
        ctx.fillStyle = "#8ACE00";
        ctx.beginPath();
        ctx.roundRect(xc - barW - 2, inY, barW, inH, [3, 3, 0, 0]);
        ctx.fill();

        // Outflow Bar (Red/Gray)
        const outH = (d.outflow / maxVal) * chartH;
        const outY = padding.top + chartH - outH;
        ctx.fillStyle = "#ef4444";
        ctx.beginPath();
        ctx.roundRect(xc + 2, outY, barW, outH, [3, 3, 0, 0]);
        ctx.fill();

        // Month Label
        ctx.fillStyle = "#EDEDED";
        ctx.font = "11px 'Inter', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(monthNames[i], xc, h - padding.bottom + 20);

        // Highlight Net text
        ctx.fillStyle = d.net >= 0 ? "rgba(138,206,0,0.85)" : "rgba(239,68,68,0.85)";
        ctx.font = "9px 'JetBrains Mono', monospace";
        const netStr = (d.net >= 0 ? "+" : "") + Math.round(d.net / 1000) + "k";
        ctx.fillText(netStr, xc, inY - 6);
      });

      // Legend
      ctx.fillStyle = "#8ACE00";
      ctx.fillRect(w - 240, 12, 10, 10);
      ctx.fillStyle = "#EDEDED";
      ctx.font = "11px 'Inter', sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("Cash Inflow", w - 224, 21);

      ctx.fillStyle = "#ef4444";
      ctx.fillRect(w - 140, 12, 10, 10);
      ctx.fillStyle = "#EDEDED";
      ctx.fillText("Expenses", w - 124, 21);
    } else {
      // Single Month Daily Timeline
      const daysMap = {};
      activeEntries.forEach(item => {
        if (!item.date) return;
        const parts = item.date.split("-");
        const day = parseInt(parts[2], 10) || 1;
        if (!daysMap[day]) daysMap[day] = { inflow: 0, outflow: 0 };
        const amt = parseFloat(item.amount) || 0;
        if (item.type === "income" || (item.type && item.type.toLowerCase().includes("income"))) {
          daysMap[day].inflow += amt;
        } else {
          daysMap[day].outflow += amt;
        }
      });

      const days = Object.keys(daysMap).map(n => parseInt(n, 10)).sort((a, b) => a - b);
      if (days.length === 0) {
        ctx.fillStyle = "#71717A";
        ctx.font = "13px 'Inter', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("No transactions recorded for " + getMonthLabel(currentPulseMonth), w / 2, h / 2);
        return;
      }

      let maxVal = 10000;
      days.forEach(d => {
        if (daysMap[d].inflow > maxVal) maxVal = daysMap[d].inflow * 1.2;
        if (daysMap[d].outflow > maxVal) maxVal = daysMap[d].outflow * 1.2;
      });

      // Grid Lines
      ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
      ctx.lineWidth = 1;
      for (let i = 0; i <= 4; i++) {
        const y = padding.top + (chartH / 4) * i;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(w - padding.right, y);
        ctx.stroke();

        ctx.fillStyle = "#A1A1AA";
        ctx.font = "10px 'JetBrains Mono', monospace";
        ctx.textAlign = "right";
        const val = Math.round(maxVal - (maxVal / 4) * i);
        ctx.fillText(`${(val / 1000).toFixed(1)}k`, padding.left - 10, y + 4);
      }

      const colW = chartW / Math.max(days.length, 1);
      const barW = Math.max(10, Math.min(20, colW * 0.35));

      days.forEach((day, i) => {
        const xc = padding.left + colW * i + colW / 2;
        const d = daysMap[day];

        if (d.inflow > 0) {
          const inH = (d.inflow / maxVal) * chartH;
          const inY = padding.top + chartH - inH;
          ctx.fillStyle = "#8ACE00";
          ctx.beginPath();
          ctx.roundRect(xc - barW - 1, inY, barW, inH, [2, 2, 0, 0]);
          ctx.fill();
        }

        if (d.outflow > 0) {
          const outH = (d.outflow / maxVal) * chartH;
          const outY = padding.top + chartH - outH;
          ctx.fillStyle = "#ef4444";
          ctx.beginPath();
          ctx.roundRect(xc + 1, outY, barW, outH, [2, 2, 0, 0]);
          ctx.fill();
        }

        ctx.fillStyle = "#EDEDED";
        ctx.font = "11px 'Inter', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(`Day ${day}`, xc, h - padding.bottom + 20);
      });

      // Legend
      ctx.fillStyle = "#8ACE00";
      ctx.fillRect(w - 240, 12, 10, 10);
      ctx.fillStyle = "#EDEDED";
      ctx.font = "11px 'Inter', sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("Day Inflow", w - 224, 21);

      ctx.fillStyle = "#ef4444";
      ctx.fillRect(w - 140, 12, 10, 10);
      ctx.fillStyle = "#EDEDED";
      ctx.fillText("Day Outflow", w - 124, 21);
    }
  }

  function renderPulseTable() {
    const tbody = document.getElementById("pulseAuditTableBody");
    const summaryEl = document.getElementById("pulseTableSummary");
    const titleEl = document.getElementById("pulseTableTitle");
    if (!tbody) return;

    const rawLedger = (db && db.ledger) ? db.ledger : [];
    const isAll = (currentPulseMonth === "all");

    if (titleEl) {
      titleEl.textContent = `Financial Ledger Audit — ${getMonthLabel(currentPulseMonth)}`;
    }

    const filtered = rawLedger.filter(item => {
      if (!isAll && item.date && !item.date.startsWith(currentPulseMonth)) {
        return false;
      }
      const isInc = (item.type === "income" || (item.type && item.type.toLowerCase().includes("income")));
      if (pulseTableTypeFilter === "income" && !isInc) return false;
      if (pulseTableTypeFilter === "expense" && isInc) return false;

      if (pulseTableSearchQuery) {
        const fullStr = `${item.date} ${item.description} ${item.category} ${item.amount} ${item.reference}`.toLowerCase();
        if (!fullStr.includes(pulseTableSearchQuery)) return false;
      }
      return true;
    });

    if (summaryEl) {
      summaryEl.textContent = `Displaying ${filtered.length} entries for ${getMonthLabel(currentPulseMonth)}`;
    }

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center text-muted" style="padding:2.5rem;">
            No transactions found matching the selected period and criteria.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filtered.map(item => {
      const isInc = (item.type === "income" || (item.type && item.type.toLowerCase().includes("income")));
      const amt = parseFloat(item.amount) || 0;
      const typeBadge = isInc
        ? '<span class="badge" style="background:rgba(138,206,0,0.15); color:var(--lime);"><i data-lucide="arrow-down-left" style="width:10px; height:10px; display:inline;"></i> Inflow</span>'
        : '<span class="badge" style="background:rgba(239,68,68,0.15); color:#ef4444;"><i data-lucide="arrow-up-right" style="width:10px; height:10px; display:inline;"></i> Outflow</span>';

      const isAfribotOwed = (item.description && item.description.toLowerCase().includes("afribot") && amt === 0);
      const balDue = isAfribotOwed ? 1500 : 0;
      const statusBadge = isAfribotOwed
        ? '<span class="badge" style="background:rgba(245,158,11,0.15); color:#f59e0b;">Pending (KSh 1,500)</span>'
        : '<span class="badge" style="background:rgba(16,185,129,0.15); color:#10b981;">Cleared</span>';

      return `
        <tr>
          <td style="font-family:var(--font-mono); font-size:0.8125rem; white-space:nowrap;">${item.date || "-"}</td>
          <td style="font-weight:600; color:var(--text-primary);">${item.description || "General Entry"}</td>
          <td><span class="badge" style="background:rgba(255,255,255,0.06); font-size:0.75rem;">${item.category || "General"}</span></td>
          <td>${typeBadge}</td>
          <td style="text-align:right; font-family:var(--font-mono); font-weight:700;">${isAfribotOwed ? "1,500" : amt.toLocaleString()}</td>
          <td style="text-align:right; font-family:var(--font-mono); color:${isInc ? 'var(--lime)' : '#ef4444'}; font-weight:700;">${amt.toLocaleString()}</td>
          <td style="text-align:right; font-family:var(--font-mono); color:${balDue > 0 ? '#f59e0b' : 'var(--text-muted)'};">${balDue > 0 ? balDue.toLocaleString() : "0"}</td>
          <td>${statusBadge}</td>
        </tr>
      `;
    }).join("");

    if (window.lucide && window.lucide.createIcons) {
      window.lucide.createIcons();
    }
  }


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
        fetch("api/subscribers.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editId ? (erpState.subscribers.find(s => s.id === editId) || {}) : newSub)
        }).catch(() => {});
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

    // 3. Create / Edit Job Card Form
    const jobForm = document.getElementById("jobCardForm");
    if (jobForm) {
      jobForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const editId = document.getElementById("jobEditId").value;
        const labor = Number(document.getElementById("jobLaborCost").value) || 0;
        const materials = Number(document.getElementById("jobMaterialCost").value) || 0;
        const title = document.getElementById("jobTitle").value.trim();
        const clientName = document.getElementById("jobClient").value.trim();
        const tech = document.getElementById("jobTech").value.trim();
        const category = document.getElementById("jobCategory").value;
        const status = document.getElementById("jobStatus").value || "in_progress";
        const siteReq = document.getElementById("jobSiteRequirements").value.trim();
        const progNotes = document.getElementById("jobProgressNotes").value.trim();
        const credentials = document.getElementById("jobCredentials").value.trim();
        const notes = document.getElementById("jobNotes").value.trim();

        if (editId) {
          const job = (erpState.jobCards || []).find(j => j.id === editId);
          if (job) {
            job.title = title;
            job.clientName = clientName;
            job.technician = tech;
            job.category = category;
            job.status = status;
            job.laborCost = labor;
            job.totalCost = labor + materials;
            job.siteRequirements = siteReq;
            job.progressNotes = progNotes;
            job.credentials = credentials;
            job.notes = notes;
            showToast(`Job Card "${title}" updated.`);
          }
        } else {
          const newJob = {
            id: "job_" + Date.now(),
            title: title,
            clientName: clientName,
            technician: tech,
            category: category,
            date: new Date().toISOString().split("T")[0],
            laborCost: labor,
            totalCost: labor + materials,
            status: status,
            siteRequirements: siteReq,
            progressNotes: progNotes,
            credentials: credentials,
            notes: notes,
            invoiceGenerated: false
          };
          erpState.jobCards.push(newJob);
          showToast(`Job Card "${newJob.title}" created.`);
        }

        saveDatabase();
        document.getElementById("jobCardModal").style.display = "none";
        renderAll();
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
    document.getElementById("subPackage").value = "10 Mbps Home Lite";
    document.getElementById("subPrice").value = 1000;
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
    document.getElementById("subPackage").value = sub.package || "10 Mbps Home Lite";
    document.getElementById("subPrice").value = sub.monthlyRate || sub.price || 1000;
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

  window.dpDeleteSub = async function (subId) {
    if (confirm("Are you sure you want to permanently remove this subscriber from the database?")) {
      erpState.subscribers = (erpState.subscribers || []).filter(s => s.id !== subId);
      saveDatabase();
      await fetch(`api/subscribers.php?id=${encodeURIComponent(subId)}`, { method: "DELETE" }).catch(() => {});
      await window.dpPermanentDelete("subscriber", subId);
      renderAll();
      showToast("Subscriber permanently deleted from database.");
    }
  };

  window.dpDeleteTx = async function (txId) {
    if (confirm("Permanently delete this ledger entry from the database?")) {
      erpState.ledger = (erpState.ledger || []).filter(t => t.id !== txId);
      saveDatabase();
      await window.dpPermanentDelete("ledger", txId);
      renderAll();
      showToast("Ledger entry permanently deleted.");
    }
  };

  window.dpDeleteJob = async function (jobId) {
    if (confirm("Permanently delete this Job Card from the database?")) {
      erpState.jobCards = (erpState.jobCards || []).filter(j => j.id !== jobId);
      saveDatabase();
      await window.dpPermanentDelete("jobCard", jobId);
      renderAll();
      showToast("Job Card permanently deleted.");
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
    const title = document.getElementById("jobCardModalTitle");
    const editIdInput = document.getElementById("jobEditId");
    if (form) form.reset();
    if (editIdInput) editIdInput.value = "";
    if (title) title.textContent = "Create Field Deployment Job Card";
    if (modal) modal.style.display = "flex";
    if (window.lucide) window.lucide.createIcons();
  }

  window.dpEditJobCard = function (jobId) {
    const job = (erpState.jobCards || []).find(j => j.id === jobId);
    if (!job) return;

    const modal = document.getElementById("jobCardModal");
    const title = document.getElementById("jobCardModalTitle");
    if (title) title.textContent = `Edit Job Card: ${job.title}`;

    document.getElementById("jobEditId").value = job.id;
    document.getElementById("jobTitle").value = job.title || "";
    document.getElementById("jobClient").value = job.clientName || "";
    document.getElementById("jobTech").value = job.technician || "";
    document.getElementById("jobCategory").value = job.category || "Fiber Deployment";
    document.getElementById("jobStatus").value = job.status || "in_progress";
    document.getElementById("jobLaborCost").value = job.laborCost || 0;
    
    const matCost = Math.max(0, (job.totalCost || 0) - (job.laborCost || 0));
    document.getElementById("jobMaterialCost").value = matCost;

    document.getElementById("jobSiteRequirements").value = job.siteRequirements || "";
    document.getElementById("jobProgressNotes").value = job.progressNotes || "";
    document.getElementById("jobCredentials").value = job.credentials || "";
    document.getElementById("jobNotes").value = job.notes || "";

    if (modal) modal.style.display = "flex";
    if (window.lucide) window.lucide.createIcons();
  };

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
    ],
    internet: [
      {
        id: "isp-10m-lite",
        name: "10 Mbps Home Lite",
        category: "Home",
        price: 1000,
        unit: "/ month",
        description: "Entry-level unlimited streaming, social media & home browsing."
      },
      {
        id: "isp-15m-home",
        name: "15 Mbps Home Package",
        category: "Home",
        price: 1500,
        unit: "/ month",
        description: "Ideal for families, online school, Zoom calls & smart TVs."
      },
      {
        id: "isp-15m-biz",
        name: "15 Mbps Business Package",
        category: "Business",
        price: 1500,
        unit: "/ month",
        description: "Built for shops, clinics, POS checkouts & front-office WiFi."
      },
      {
        id: "isp-20m-home",
        name: "20 Mbps Home",
        category: "Home",
        price: 2000,
        unit: "/ month",
        description: "High-speed 4K streaming, remote work, video conferencing."
      },
      {
        id: "isp-20m-biz",
        name: "20 Mbps Business",
        category: "Business",
        price: 2500,
        unit: "/ month",
        description: "Professional SME bandwidth for office workstations & CCTV."
      },
      {
        id: "isp-30m-home",
        name: "30 Mbps Max Home",
        category: "Home",
        price: 3000,
        unit: "/ month",
        description: "Ultimate home speed for gamers, content creators & large villas."
      },
      {
        id: "isp-30m-biz",
        name: "30 Mbps Max Business",
        category: "Business",
        price: 3000,
        unit: "/ month",
        description: "High-concurrency business fiber for corporate operations & teams."
      }
    ]
  };

  function getSavedTariffs() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TARIFFS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object") {
          if (!parsed.internet || !parsed.internet.length) {
            parsed.internet = JSON.parse(JSON.stringify(DEFAULT_COMMERCIAL_TARIFFS.internet));
          }
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

    const internetContainer = document.getElementById("internetTariffsList");
    if (!essentialsContainer || !hardwareContainer || !softwareContainer || !amcContainer) return;

    // Render Internet Bandwidth Plans
    if (internetContainer && tariffs.internet) {
      internetContainer.innerHTML = tariffs.internet.map((item, idx) => `
        <div class="tariff-edit-row" data-tariff-group="internet" data-id="${item.id}" data-idx="${idx}" style="display:flex; flex-direction:column; gap:0.5rem; padding:0.85rem 1rem; border:1px solid var(--border-color); border-radius:var(--radius-md); background:var(--bg-secondary); margin-bottom:0.75rem;">
          <div style="display:flex; align-items:center; justify-content:space-between; gap:0.75rem; flex-wrap:wrap; width:100%;">
            <div style="flex:1; min-width:180px;">
              <label style="font-size:0.72rem; color:var(--text-muted); font-weight:700; text-transform:uppercase; margin-bottom:2px; display:block;">Internet Plan Name</label>
              <input type="text" class="form-input tariff-name-input" value="${escapeHtml(item.name)}" style="font-weight:700; font-size:0.95rem; padding:0.4rem 0.6rem; width:100%;">
            </div>
            <div style="width:130px;">
              <label style="font-size:0.72rem; color:var(--text-muted); font-weight:700; text-transform:uppercase; margin-bottom:2px; display:block;">Billing Term</label>
              <input type="text" class="form-input tariff-unit-input" value="${escapeHtml(item.unit || '/ month')}" style="font-size:0.85rem; padding:0.4rem 0.6rem; width:100%;">
            </div>
            <div style="width:150px;">
              <label style="font-size:0.72rem; color:var(--text-muted); font-weight:700; text-transform:uppercase; margin-bottom:2px; display:block;">Monthly Rate (KSh)</label>
              <div style="display:flex; align-items:center; gap:4px;">
                <span style="font-family:var(--font-mono); font-weight:700; font-size:0.85rem; color:var(--text-secondary);">KSh</span>
                <input type="number" step="100" min="0" class="form-input tariff-price-input" value="${item.price}" style="font-weight:800; font-family:var(--font-mono); color:var(--lime-dark); padding:0.4rem 0.6rem; width:100%;">
              </div>
            </div>
            <div style="display:flex; align-items:flex-end; padding-top:1.1rem;">
              <button class="btn btn-secondary btn-sm" onclick="window.dpRemoveCustomTariff('internet', '${item.id}')" title="Permanently delete plan" style="color:#ef4444; border-color:rgba(239,68,68,0.25); padding:0.4rem 0.6rem;">
                <i data-lucide="trash-2" style="width:14px; height:14px;"></i>
              </button>
            </div>
          </div>
          <div style="width:100%;">
            <label style="font-size:0.72rem; color:var(--text-muted); font-weight:600; margin-bottom:2px; display:block;">Bandwidth Deliverables & Specifications</label>
            <input type="text" class="form-input tariff-desc-input" value="${escapeHtml(item.description || '')}" placeholder="Unlimited fiber, low latency peering, 24/7 SLA..." style="font-size:0.8rem; color:var(--text-secondary); padding:0.35rem 0.6rem; width:100%;">
          </div>
        </div>
      `).join("") + `
        <button type="button" class="btn btn-secondary btn-sm" onclick="window.dpAddCustomTariffToCategory('internet')" style="width:100%; margin-top:0.35rem; font-size:0.8rem; padding:0.5rem; grid-column:1 / -1;">
          <i data-lucide="plus" style="width:13px; height:13px;"></i> + Add New Internet Bandwidth Plan
        </button>
      `;
    }

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
            category: group === "internet" ? "Internet Bandwidth" : group === "essentials" ? "Essentials Packages" : (group === "hardware" ? "Network & Infrastructure" : (group === "software" ? "Development & Creative" : "Maintenance & AMC Retainers")),
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
      internet: "/ month",
      essentials: "One-Off Investment",
      hardware: "Per Setup",
      software: "Starting Price",
      amc: "/ year"
    };
    const defaultPrices = {
      internet: 1500,
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
     LIVE PREVIEW MODAL HANDLERS FOR DASHBOARD
     ========================================================================= */
  window.dpOpenSitePreview = function(url, title, repoUrl) {
    const modal = document.getElementById("sitePreviewModal");
    const iframe = document.getElementById("sitePreviewIframe");
    const urlBar = document.getElementById("previewUrlBar");
    const newTabBtn = document.getElementById("previewNewTabBtn");
    const repoBtn = document.getElementById("previewRepoBtn");

    if (!modal || !iframe) {
      window.open(url, "_blank");
      return;
    }

    if (urlBar) urlBar.textContent = url;
    if (newTabBtn) newTabBtn.href = url;
    if (repoBtn) {
      if (repoUrl) {
        repoBtn.href = repoUrl;
        repoBtn.style.display = "inline-flex";
      } else {
        repoBtn.style.display = "none";
      }
    }

    iframe.src = url;
    if (typeof window.dpSetPreviewDevice === "function") {
      window.dpSetPreviewDevice("desktop");
    }
    modal.style.display = "flex";
    document.body.style.overflow = "hidden";

    if (window.lucide) window.lucide.createIcons();
  };

  
    /* =========================================================================
     13B. WEBSITES & DIGITAL PROJECTS CATALOGUE & LIVE SIMULATOR CONTROLLER
     ========================================================================= */
  let DP_PROJECTS_CATALOG = [
  {
    "id": "proj-mombasa-mall",
    "name": "Mombasa Mall 2.0 Commercial Platform",
    "repo": "4nyakundi/MOMBASA-MALL",
    "repoUrl": "https://github.com/4nyakundi/MOMBASA-MALL",
    "liveUrl": "https://mombasamall.co.ke",
    "localUrl": "http://localhost/mombasamall.co.ke/index.html",
    "logo": "public/projects/mombasa-mall-logo.png",
    "hero": "public/projects/mombasa-mall-hero.jpg",
    "category": "ecommerce",
    "categoryLabel": "E-Commerce & Retail",
    "badge": "Active Retail Portal",
    "badgeColor": "#10b981",
    "desc": "Comprehensive coastal commercial mall portal featuring multi-store tenant directories, promotions catalog, floor plan locator, and Daraja M-Pesa automated billing.",
    "tags": [
      "PHP",
      "MySQL",
      "JavaScript",
      "E-Commerce",
      "Multi-Tenant",
      "M-Pesa API"
    ],
    "features": [
      "Store directory & floor plan guide",
      "Tenant management dashboard",
      "Live event promotional alerts",
      "Integrated Daraja M-Pesa billing"
    ]
  },
  {
    "id": "proj-catch-sec",
    "name": "Catch Security Links Ltd",
    "repo": "4nyakundi/catchsecuritylinksltd.co.ke",
    "repoUrl": "https://github.com/4nyakundi/catchsecuritylinksltd.co.ke",
    "liveUrl": "https://catchsecuritylinks.co.ke",
    "localUrl": "http://localhost/Catch%20Security%20System/index.html",
    "logo": "public/projects/catch-security-logo.jpg",
    "hero": "public/projects/catch-security-hero.jpg",
    "category": "security",
    "categoryLabel": "Security & IoT",
    "badge": "Enterprise SLA",
    "badgeColor": "#3b82f6",
    "desc": "Corporate portal for leading coastal Kenya perimeter surveillance provider. Manages IP CCTV camera installations, biometric turnstiles, and emergency patrol dispatch.",
    "tags": [
      "PHP",
      "JavaScript",
      "Security IoT",
      "CCTV Monitoring",
      "Tailwind CSS"
    ],
    "features": [
      "Live service ticketing engine",
      "CCTV equipment catalog",
      "AMC contract management",
      "NOC security monitoring"
    ]
  },
  {
    "id": "proj-modoria",
    "name": "Modoria Media & Tech Agency",
    "repo": "4nyakundi/modoria.co.ke",
    "repoUrl": "https://github.com/4nyakundi/modoria.co.ke",
    "liveUrl": "https://modoria.co.ke",
    "localUrl": "http://localhost/projects-live/modoria/index.html",
    "logo": "public/projects/modoria-logo.png",
    "hero": "public/projects/modoria-hero.jpg",
    "category": "creative",
    "categoryLabel": "Creative & Media",
    "badge": "Live Agency Portal",
    "badgeColor": "#8b5cf6",
    "desc": "High-end digital agency website presenting enterprise software engineering, bespoke brand identity design, media production, and digital marketing strategies.",
    "tags": [
      "HTML5",
      "CSS3",
      "JavaScript",
      "GSAP Animations",
      "UI/UX Design"
    ],
    "features": [
      "Case studies interactive showcase",
      "Interactive client portfolio",
      "Lead intake & proposal engine",
      "SEO-optimized structure"
    ]
  },
  {
    "id": "proj-ace-vet",
    "name": "Ace Vet Care Kenya",
    "repo": "4nyakundi/acevetcarekenya",
    "repoUrl": "https://github.com/4nyakundi/acevetcarekenya",
    "liveUrl": "https://acevetcarekenya.co.ke",
    "localUrl": "http://localhost/acevetcarekenya/index.html",
    "logo": "public/projects/ace-vet-logo.png",
    "hero": "public/projects/ace-vet-hero.jpg",
    "category": "booking",
    "categoryLabel": "Healthcare & Veterinary",
    "badge": "Active Health System",
    "badgeColor": "#06b6d4",
    "desc": "Veterinary medical portal providing patient health records, surgical procedure appointments, domestic pet checkups, and farm animal mobile triage.",
    "tags": [
      "PHP",
      "MySQL",
      "Appointment Engine",
      "Medical Records",
      "Bootstrap"
    ],
    "features": [
      "Patient medical history logs",
      "Automated SMS appointment reminders",
      "Pet vaccination passport tracker",
      "Tele-triage intake"
    ]
  },
  {
    "id": "proj-starlash",
    "name": "Star Lash Kenya Beauty Studio",
    "repo": "4nyakundi/starlashkenya",
    "repoUrl": "https://github.com/4nyakundi/starlashkenya",
    "liveUrl": "https://starlashkenya.co.ke",
    "localUrl": "http://localhost/projects-live/starlash/index.html",
    "logo": "public/projects/starlash-logo.jpg",
    "hero": "public/projects/starlash-hero.jpg",
    "category": "booking",
    "categoryLabel": "Beauty & Lifestyle",
    "badge": "E-Commerce & Booking",
    "badgeColor": "#ec4899",
    "desc": "Luxury beauty studio appointment booking and cosmetics storefront. Features beauty therapist slot reservation, deposit payments, and curated beauty products.",
    "tags": [
      "JavaScript",
      "Tailwind CSS",
      "Booking Calendar",
      "Product Shop"
    ],
    "features": [
      "Time-slot reservation engine",
      "Deposit payment collection",
      "Cosmetics online shopping",
      "Client review gallery"
    ]
  },
  {
    "id": "proj-azurite-rental",
    "name": "Azurite Property Rental System",
    "repo": "4nyakundi/Azurite-Rental-System",
    "repoUrl": "https://github.com/4nyakundi/Azurite-Rental-System",
    "liveUrl": "https://azuriterentals.co.ke",
    "localUrl": "http://localhost/Azurite-Rental-System/index.php",
    "logo": "public/projects/azurite-living.jpg",
    "hero": "public/projects/azurite-hero.jpg",
    "category": "enterprise",
    "categoryLabel": "Real Estate & Leasing",
    "badge": "SaaS Portal",
    "badgeColor": "#10b981",
    "desc": "Automated real estate tenancy lease management system with automated monthly rent invoicing, utility billing, arrears tracking, and landlord financial statements.",
    "tags": [
      "PHP",
      "MySQL",
      "Property ERP",
      "M-Pesa Auto-Reconcile",
      "PDF Invoicing"
    ],
    "features": [
      "Tenant automated monthly invoicing",
      "Landlord payout statements",
      "Maintenance request ticketing",
      "Vacant unit showcase"
    ]
  },
  {
    "id": "proj-parking",
    "name": "Smart Parking & Barrier Gate System",
    "repo": "4nyakundi/parking",
    "repoUrl": "https://github.com/4nyakundi/parking",
    "liveUrl": "https://parking.dpinc.top",
    "localUrl": "http://localhost/parking/index.php",
    "logo": "public/projects/parking-logo.png",
    "hero": "public/projects/parking-wordmark.png",
    "category": "security",
    "categoryLabel": "IoT & Access Control",
    "badge": "Hardware & Gate Barrier",
    "badgeColor": "#059669",
    "desc": "Automated boom barrier gate and smart parking ticket management system. Tracks license plates (ALPR), hourly parking tariffs, and automated cashier validation.",
    "tags": [
      "PHP",
      "MySQL",
      "Barrier Gate IoT",
      "Ticket Barcode",
      "Hourly Billing"
    ],
    "features": [
      "Automatic number plate logging",
      "Barcode ticket validation",
      "Cash & M-Pesa exit toll",
      "Occupancy bay live counter"
    ]
  },
  {
    "id": "proj-edocs",
    "name": "eDocs Medical Appointment System",
    "repo": "4nyakundi/edocs-appointment-sys",
    "repoUrl": "https://github.com/4nyakundi/edocs-appointment-sys",
    "liveUrl": "https://edocs.co.ke",
    "localUrl": "http://localhost/edocs/index.php",
    "logo": "public/projects/edocs-hero.jpg",
    "hero": "public/projects/edocs-bg.jpg",
    "category": "booking",
    "categoryLabel": "Health & Telemedicine",
    "badge": "Medical Portal",
    "badgeColor": "#0284c7",
    "desc": "Doctor appointment booking and electronic patient triage system designed for medical specialists, diagnostic clinics, and hospital outpatient departments.",
    "tags": [
      "PHP",
      "MySQL",
      "HIPAA Compliant",
      "Doctor Rostering",
      "Audit Logs"
    ],
    "features": [
      "Specialist doctor calendar slots",
      "Intake symptom pre-screening",
      "Digital prescription storage",
      "Patient queue management"
    ]
  },
  {
    "id": "proj-tudor-cleaners",
    "name": "Tudor Carpet Cleaners",
    "repo": "4nyakundi/Tudorcarpetcleaners",
    "repoUrl": "https://github.com/4nyakundi/Tudorcarpetcleaners",
    "liveUrl": "https://tudorcleaners.co.ke",
    "localUrl": "http://localhost/projects-live/tudor/index.html",
    "logo": "public/projects/tudor-hero.webp",
    "hero": "public/projects/tudor-hero.webp",
    "category": "booking",
    "categoryLabel": "Commercial Services",
    "badge": "Dispatch System",
    "badgeColor": "#f59e0b",
    "desc": "On-demand carpet, upholstery, and commercial sanitization booking portal. Features square-meter pricing estimator, van dispatch scheduling, and instant quotations.",
    "tags": [
      "PHP",
      "MySQL",
      "Dispatch Logistics",
      "Service Estimator"
    ],
    "features": [
      "Instant area square-meter cost estimator",
      "Van dispatch scheduling",
      "Before & after cleaning showcase",
      "WhatsApp instant confirmation"
    ]
  },
  {
    "id": "proj-6am-kenya",
    "name": "6AM Kenya Entertainment Guide",
    "repo": "4nyakundi/6amkenya",
    "repoUrl": "https://github.com/4nyakundi/6amkenya",
    "liveUrl": "https://6amkenya.co.ke",
    "localUrl": "http://localhost/projects-live/6amkenya/index.html",
    "logo": "public/projects/6amkenya-hero.jpg",
    "hero": "public/projects/6amkenya-hero.jpg",
    "category": "creative",
    "categoryLabel": "Media & Entertainment",
    "badge": "Digital Media",
    "badgeColor": "#f43f5e",
    "desc": "Coastal nightlife, concert ticketing, DJ festival showcases, venue directories, and tourism entertainment guide for Mombasa, Nyali, and Diani Beach.",
    "tags": [
      "Next.js",
      "Tailwind",
      "Event Ticketing",
      "Media Player"
    ],
    "features": [
      "Event ticket checkout engine",
      "Interactive venue map",
      "Artist & performer spotlights",
      "Push notifications for events"
    ]
  },
  {
    "id": "proj-r3-realtors",
    "name": "R3 Realtors Coastal Realty",
    "repo": "4nyakundi/r3-realtors",
    "repoUrl": "https://github.com/4nyakundi/r3-realtors",
    "liveUrl": "https://r3realtors.co.ke",
    "localUrl": "http://localhost/projects-live/r3realtors/index.html",
    "logo": "public/projects/r3realtors-hero.jpg",
    "hero": "public/projects/r3realtors-hero.jpg",
    "category": "enterprise",
    "categoryLabel": "Real Estate & Land",
    "badge": "Listing Portal",
    "badgeColor": "#14b8a6",
    "desc": "Luxury coastal property brokerage platform featuring prime beachfront land, executive villas in Nyali & Diani, and commercial leasing listings with virtual tours.",
    "tags": [
      "PHP",
      "MySQL",
      "Property Listings",
      "Search Filters",
      "Inquiry CRM"
    ],
    "features": [
      "Advanced price & location filters",
      "Direct agent WhatsApp scheduling",
      "Title deed verification badges",
      "Virtual photo walkthroughs"
    ]
  },
  {
    "id": "proj-paws-hooves",
    "name": "Paws & Hooves Wildlife Sanctuary",
    "repo": "4nyakundi/Paws-Hooves",
    "repoUrl": "https://github.com/4nyakundi/Paws-Hooves",
    "liveUrl": "https://pawsandhooves.co.ke",
    "localUrl": "http://localhost/projects-live/paws-hooves/index.html",
    "logo": "public/projects/paws-hooves-logo.png",
    "hero": "public/projects/paws-hooves-logo.png",
    "category": "booking",
    "categoryLabel": "Animal Sanctuary & Care",
    "badge": "Rescue & Shelter ERP",
    "badgeColor": "#10b981",
    "desc": "Animal rescue, veterinary surgery, and sanctuary registry. Manages pet adoption listings, emergency rescue ambulance dispatch, and donor contributions.",
    "tags": [
      "PHP",
      "MySQL",
      "Adoption Portal",
      "Donations",
      "Animal Health"
    ],
    "features": [
      "Pet adoption matching intake",
      "Animal rescue ambulance dispatch",
      "Medical treatment records",
      "Online donor sponsorship portal"
    ]
  },
  {
    "id": "proj-playon",
    "name": "Play-On Gaming Lounge",
    "repo": "4nyakundi/Play-On",
    "repoUrl": "https://github.com/4nyakundi/Play-On",
    "liveUrl": "https://playonlounge.co.ke",
    "localUrl": "http://localhost/playon",
    "logo": "public/projects/playon-logo.png",
    "hero": "public/projects/playon-logo.png",
    "category": "creative",
    "categoryLabel": "Gaming & Esports",
    "badge": "Console & Tournament Hub",
    "badgeColor": "#a855f7",
    "desc": "Esports gaming lounge management system controlling PlayStation 5, Xbox Series X, and PC station timers, member wallet balance, and tournament brackets.",
    "tags": [
      "JavaScript",
      "Node.js",
      "Timer System",
      "POS Terminal",
      "WebSocket"
    ],
    "features": [
      "Station countdown timer billing",
      "Tournament leaderboard brackets",
      "Snack bar & cafe POS",
      "Member credit wallet"
    ]
  },
  {
    "id": "proj-frynation",
    "name": "Fry Nation Quick Kitchen POS",
    "repo": "shimix-del/frynation",
    "repoUrl": "https://github.com/shimix-del/frynation",
    "liveUrl": "https://frynation.co.ke",
    "localUrl": "http://localhost/nanifrys%20git/frynation/client/public/index.html",
    "logo": "public/projects/frynation-logo.jpg",
    "hero": "public/projects/frynation-hero.jpg",
    "category": "ecommerce",
    "categoryLabel": "Food & Restaurant POS",
    "badge": "Fast-Food POS",
    "badgeColor": "#ea580c",
    "desc": "Fast-casual restaurant food ordering, kitchen display system (KDS), automated thermal receipt printing, and cashier cash drawer reconciliation.",
    "tags": [
      "PHP",
      "MySQL",
      "Kitchen KDS",
      "M-Pesa POS",
      "Receipt Printing"
    ],
    "features": [
      "Digital menu ordering screen",
      "Kitchen prep display screen",
      "Daily till cash balance audit",
      "Combo meal discount rules"
    ]
  },
  {
    "id": "proj-artbyoture",
    "name": "Art By Oture Canvas Gallery",
    "repo": "4nyakundi/artbyoture_ABO26",
    "repoUrl": "https://github.com/4nyakundi/artbyoture_ABO26",
    "liveUrl": "https://artbyoture.co.ke",
    "localUrl": "https://artbyoture.co.ke",
    "logo": "public/projects/artbyoture-logo.png",
    "hero": "public/projects/artbyoture-hero.jpg",
    "category": "creative",
    "categoryLabel": "Art & Exhibition",
    "badge": "Fine Art Portfolio",
    "badgeColor": "#d946ef",
    "desc": "Original oil on canvas paintings, African contemporary portraiture, and commissioned artwork showcase with international delivery cost calculation.",
    "tags": [
      "JavaScript",
      "CSS3",
      "Art Gallery",
      "Commission Form"
    ],
    "features": [
      "High-res canvas zoom viewer",
      "Bespoke commission request form",
      "Framing option customizer",
      "Artist bio and exhibits"
    ]
  },
  {
    "id": "proj-car-rental",
    "name": "Coastal Car Rental System",
    "repo": "4nyakundi/Car-Rental-System-",
    "repoUrl": "https://github.com/4nyakundi/Car-Rental-System-",
    "liveUrl": "https://coastalcarrental.co.ke",
    "localUrl": "https://coastalcarrental.co.ke",
    "logo": "public/projects/parking-wordmark.png",
    "hero": "public/projects/parking-wordmark.png",
    "category": "enterprise",
    "categoryLabel": "Automotive & Fleet",
    "badge": "Fleet Management",
    "badgeColor": "#6366f1",
    "desc": "Vehicle fleet leasing, reservation, and driver tracking management system. Includes daily rate calculations, security deposit handling, and GPS fleet inspection.",
    "tags": [
      "PHP",
      "MySQL",
      "Fleet Management",
      "Contract Generator",
      "REST API"
    ],
    "features": [
      "Live vehicle availability grid",
      "Digital rental contract signing",
      "Driver allocation system",
      "Automated return condition audits"
    ]
  }
];

  const AUTHENTIC_COVERS = [
    { name: "Mombasa Mall", path: "public/projects/mombasa-mall-hero.jpg" },
    { name: "Catch Security", path: "public/projects/catch-security-hero.jpg" },
    { name: "Ace Vet Care", path: "public/projects/ace-vet-hero.jpg" },
    { name: "eDocs Medical", path: "public/projects/edocs-hero.jpg" },
    { name: "Modoria Living", path: "public/projects/modoria-hero.jpg" },
    { name: "Fry Nation POS", path: "public/projects/frynation-hero.jpg" },
    { name: "R3 Realtors", path: "public/projects/r3realtors-hero.jpg" },
    { name: "Star Lash", path: "public/projects/starlash-hero.jpg" },
    { name: "Tudor Carpet", path: "public/projects/tudor-hero.webp" },
    { name: "6AM Kenya", path: "public/projects/6amkenya-hero.jpg" },
    { name: "Azurite Rental", path: "public/projects/azurite-hero.jpg" },
    { name: "Art By Oture", path: "public/projects/artbyoture-hero.jpg" }
  ];

  const AUTHENTIC_LOGOS = [
    { name: "Mombasa Mall", path: "public/projects/mombasa-mall-logo.png" },
    { name: "Catch Security", path: "public/projects/catch-security-logo.jpg" },
    { name: "Ace Vet Care", path: "public/projects/ace-vet-logo.png" },
    { name: "Parking LPR", path: "public/projects/parking-logo.png" },
    { name: "Paws & Hooves", path: "public/projects/paws-hooves-logo.png" },
    { name: "Modoria", path: "public/projects/modoria-logo.png" },
    { name: "Fry Nation", path: "public/projects/frynation-logo.jpg" },
    { name: "Art By Oture", path: "public/projects/artbyoture-logo.png" },
    { name: "Play-On", path: "public/projects/playon-logo.png" },
    { name: "Star Lash", path: "public/projects/starlash-logo.jpg" },
    { name: "Data Port", path: "public/dp-logo.png" }
  ];

  let currentWebVisFilter = "all"; // "all" | "visible" | "hidden"
  let currentWebCatFilter = "all";
  let currentWebSearchTerm = "";
  let currentActiveStageProjectId = "proj-mombasa-mall";

  async function loadProjectsFromApi() {
    try {
      const endpoints = ["api/projects.php", "/api/projects"];
      for (const ep of endpoints) {
        try {
          const res = await fetch(ep);
          if (res.ok) {
            const data = await res.json();
            if (data && data.success && Array.isArray(data.projects) && data.projects.length > 0) {
              DP_PROJECTS_CATALOG = data.projects;
              try {
                localStorage.setItem("DP_PORTFOLIO_PROJECTS", JSON.stringify(DP_PROJECTS_CATALOG));
              } catch (_) {}
              renderWebsitesCatalog();
              return;
            }
          }
        } catch (_) {}
      }
    } catch (e) {
      console.warn("Portfolio API load notice:", e);
    }

    // Fallback to localStorage cache
    try {
      const cached = localStorage.getItem("DP_PORTFOLIO_PROJECTS");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          DP_PROJECTS_CATALOG = parsed;
          renderWebsitesCatalog();
        }
      }
    } catch (_) {}
  }

  function initWebsitesCatalog() {
    // 1. Visibility Filter Group
    const visGroup = document.getElementById("websitesVisibilityFilterGroup");
    if (visGroup) {
      visGroup.querySelectorAll(".cal-filter-pill").forEach(pill => {
        pill.addEventListener("click", () => {
          visGroup.querySelectorAll(".cal-filter-pill").forEach(p => p.classList.remove("active"));
          pill.classList.add("active");
          currentWebVisFilter = pill.getAttribute("data-web-vis") || "all";
          renderWebsitesCatalog();
        });
      });
    }

    // 2. Category Filter Group
    const catGroup = document.getElementById("websitesCategoryFilterGroup");
    if (catGroup) {
      catGroup.querySelectorAll(".cal-filter-pill").forEach(pill => {
        pill.addEventListener("click", () => {
          catGroup.querySelectorAll(".cal-filter-pill").forEach(p => p.classList.remove("active"));
          pill.classList.add("active");
          currentWebCatFilter = pill.getAttribute("data-web-cat") || "all";
          renderWebsitesCatalog();
        });
      });
    }

    // 3. Search Input
    const searchInput = document.getElementById("websitesSearchInput");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        currentWebSearchTerm = e.target.value.toLowerCase().trim();
        renderWebsitesCatalog();
      });
    }

    // 4. Setup Modal Presets & Form
    initProjectModalPresets();
    setupEditProjectForm();

    // 5. Load latest live data from database
    loadProjectsFromApi();

    // 6. Initialize in-page live simulator with primary project
    if (DP_PROJECTS_CATALOG.length > 0) {
      window.dpLoadProjectIntoInPageStage(DP_PROJECTS_CATALOG[0].id);
    }
  }

  function initProjectModalPresets() {
    const coverContainer = document.getElementById("coverPresetPickerContainer");
    if (coverContainer) {
      coverContainer.innerHTML = AUTHENTIC_COVERS.map(c => {
        return '<button type="button" onclick="window.dpSelectPresetHero(\'' + c.path + '\')" ' +
          'style="flex-shrink:0; display:flex; flex-direction:column; align-items:center; gap:3px; padding:3px; background:var(--bg-card); border:1px solid var(--border-color); border-radius:6px; cursor:pointer; transition:all 0.15s ease;" ' +
          'title="Set cover to ' + c.name + '">' +
          '<img src="' + c.path + '" alt="" style="width:58px; height:34px; object-fit:cover; border-radius:4px;" onerror="this.src=\'public/dp-logo.png\'">' +
          '<span style="font-size:0.65rem; color:var(--text-muted); max-width:60px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">' + c.name + '</span>' +
        '</button>';
      }).join("");
    }

    const logoContainer = document.getElementById("logoPresetPickerContainer");
    if (logoContainer) {
      logoContainer.innerHTML = AUTHENTIC_LOGOS.map(l => {
        return '<button type="button" onclick="window.dpSelectPresetLogo(\'' + l.path + '\')" ' +
          'style="flex-shrink:0; display:flex; flex-direction:column; align-items:center; gap:3px; padding:4px 6px; background:#FFFFFF; border:1px solid var(--border-color); border-radius:6px; cursor:pointer; transition:all 0.15s ease;" ' +
          'title="Set logo to ' + l.name + '">' +
          '<img src="' + l.path + '" alt="" style="width:28px; height:28px; object-fit:contain;" onerror="this.src=\'public/dp-logo.png\'">' +
          '<span style="font-size:0.65rem; color:#0F172A; max-width:55px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-weight:600;">' + l.name + '</span>' +
        '</button>';
      }).join("");
    }

    // Sync color picker with text input
    const colorPicker = document.getElementById("editProjBadgeColor");
    const colorText = document.getElementById("editProjBadgeColorText");
    if (colorPicker && colorText) {
      colorPicker.addEventListener("input", (e) => { colorText.value = e.target.value; });
      colorText.addEventListener("input", (e) => { colorPicker.value = e.target.value; });
    }
  }

  window.dpSelectPresetHero = function(path) {
    const input = document.getElementById("editProjHero");
    const preview = document.getElementById("editProjHeroPreview");
    if (input) input.value = path;
    if (preview) preview.src = path;
  };

  window.dpSelectPresetLogo = function(path) {
    const input = document.getElementById("editProjLogo");
    const preview = document.getElementById("editProjLogoPreview");
    if (input) input.value = path;
    if (preview) preview.src = path;
  };

  function setupEditProjectForm() {
    const form = document.getElementById("editProjectForm");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const id = document.getElementById("editProjId").value.trim() || ("proj-" + Date.now());
      const name = document.getElementById("editProjName").value.trim();
      const category = document.getElementById("editProjCategory").value;
      const categoryLabel = document.getElementById("editProjCategoryLabel").value.trim() || "Web Application";
      const liveUrl = document.getElementById("editProjLiveUrl").value.trim();
      const localUrl = document.getElementById("editProjLocalUrl").value.trim() || liveUrl;
      const repo = document.getElementById("editProjRepo").value.trim();
      const repoUrl = document.getElementById("editProjRepoUrl").value.trim();
      const hero = document.getElementById("editProjHero").value.trim() || "public/projects/mombasa-mall-hero.jpg";
      const logo = document.getElementById("editProjLogo").value.trim() || "public/projects/mombasa-mall-logo.png";
      const badge = document.getElementById("editProjBadge").value.trim() || "Live Project";
      const badgeColor = document.getElementById("editProjBadgeColor").value || "#10b981";
      const desc = document.getElementById("editProjDesc").value.trim();
      const tagsRaw = document.getElementById("editProjTags").value.trim();
      const tags = tagsRaw ? tagsRaw.split(",").map(t => t.trim()).filter(Boolean) : [];
      const isVisible = document.getElementById("editProjVisible").checked;

      const projectData = {
        id,
        name,
        category,
        categoryLabel,
        liveUrl,
        localUrl,
        repo,
        repoUrl,
        hero,
        logo,
        badge,
        badgeColor,
        desc,
        tags,
        features: [
          "Responsive multi-device layouts",
          "Production-ready backend API",
          "Integrated database persistence"
        ],
        isVisible,
        isFeatured: true
      };

      // Check if existing in memory
      const existingIdx = DP_PROJECTS_CATALOG.findIndex(p => p.id === id);
      if (existingIdx >= 0) {
        DP_PROJECTS_CATALOG[existingIdx] = Object.assign({}, DP_PROJECTS_CATALOG[existingIdx], projectData);
      } else {
        DP_PROJECTS_CATALOG.unshift(projectData);
      }

      // Save to localStorage immediately
      try {
        localStorage.setItem("DP_PORTFOLIO_PROJECTS", JSON.stringify(DP_PROJECTS_CATALOG));
      } catch (_) {}

      // Push to backend MySQL API
      try {
        await fetch("api/projects.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(projectData)
        });
      } catch (err) {
        console.warn("Backend project save notice:", err);
      }

      // Close modal
      const modal = document.getElementById("editProjectModal");
      if (modal) modal.style.display = "none";

      // Re-render UI
      renderWebsitesCatalog();

      // If editing current stage project, reload stage
      if (currentActiveStageProjectId === id) {
        window.dpLoadProjectIntoInPageStage(id);
      }

      showToast("Portfolio project '" + name + "' saved successfully!");
    });
  }

  window.dpOpenCreateProject = function() {
    const modal = document.getElementById("editProjectModal");
    const form = document.getElementById("editProjectForm");
    if (!modal || !form) return;

    form.reset();
    document.getElementById("editProjId").value = "proj-" + Date.now();
    document.getElementById("editProjectModalTitle").textContent = "Add New Portfolio Link & Project";
    document.getElementById("editProjCategory").value = "custom";
    document.getElementById("editProjCategoryLabel").value = "Web Application";
    document.getElementById("editProjBadge").value = "Live Project";
    document.getElementById("editProjBadgeColor").value = "#10b981";
    document.getElementById("editProjBadgeColorText").value = "#10b981";
    document.getElementById("editProjHero").value = "public/projects/mombasa-mall-hero.jpg";
    document.getElementById("editProjHeroPreview").src = "public/projects/mombasa-mall-hero.jpg";
    document.getElementById("editProjLogo").value = "public/projects/mombasa-mall-logo.png";
    document.getElementById("editProjLogoPreview").src = "public/projects/mombasa-mall-logo.png";
    document.getElementById("editProjVisible").checked = true;

    modal.style.display = "flex";
    if (window.lucide) window.lucide.createIcons();
  };

  window.dpOpenEditProject = function(projectId) {
    const project = DP_PROJECTS_CATALOG.find(p => p.id === projectId);
    if (!project) return;

    const modal = document.getElementById("editProjectModal");
    if (!modal) return;

    document.getElementById("editProjId").value = project.id || "";
    document.getElementById("editProjectModalTitle").textContent = "Edit Project: " + project.name;
    document.getElementById("editProjName").value = project.name || "";
    document.getElementById("editProjCategory").value = project.category || "custom";
    document.getElementById("editProjCategoryLabel").value = project.categoryLabel || "Web Development";
    document.getElementById("editProjLiveUrl").value = project.liveUrl || "";
    document.getElementById("editProjLocalUrl").value = project.localUrl || "";
    document.getElementById("editProjRepo").value = project.repo || "";
    document.getElementById("editProjRepoUrl").value = project.repoUrl || "";
    
    const heroPath = project.hero || "public/projects/mombasa-mall-hero.jpg";
    document.getElementById("editProjHero").value = heroPath;
    document.getElementById("editProjHeroPreview").src = heroPath;

    const logoPath = project.logo || "public/projects/mombasa-mall-logo.png";
    document.getElementById("editProjLogo").value = logoPath;
    document.getElementById("editProjLogoPreview").src = logoPath;

    document.getElementById("editProjBadge").value = project.badge || "Live Project";
    const badgeCol = project.badgeColor || "#10b981";
    document.getElementById("editProjBadgeColor").value = badgeCol;
    document.getElementById("editProjBadgeColorText").value = badgeCol;

    document.getElementById("editProjDesc").value = project.desc || "";
    document.getElementById("editProjTags").value = Array.isArray(project.tags) ? project.tags.join(", ") : "";
    document.getElementById("editProjVisible").checked = (project.isVisible !== false);

    modal.style.display = "flex";
    if (window.lucide) window.lucide.createIcons();
  };

  window.dpEditCurrentStageProject = function() {
    if (currentActiveStageProjectId) {
      window.dpOpenEditProject(currentActiveStageProjectId);
    }
  };

  window.dpToggleProjectVisibility = async function(projectId, event) {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }

    const project = DP_PROJECTS_CATALOG.find(p => p.id === projectId);
    if (!project) return;

    // Invert visibility
    project.isVisible = (project.isVisible === false) ? true : false;

    // Save to localStorage
    try {
      localStorage.setItem("DP_PORTFOLIO_PROJECTS", JSON.stringify(DP_PROJECTS_CATALOG));
    } catch (_) {}

    // Send PATCH to backend API
    try {
      await fetch("api/projects.php", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: projectId, isVisible: project.isVisible })
      });
    } catch (e) {
      console.warn("Visibility sync notice:", e);
    }

    renderWebsitesCatalog();
    showToast(project.name + " is now " + (project.isVisible ? "Visible on Portfolio" : "Hidden from Portfolio"));
  };

  window.dpSelectAllProjectsForPortfolio = async function(makeVisible) {
    DP_PROJECTS_CATALOG.forEach(p => { p.isVisible = makeVisible; });
    try {
      localStorage.setItem("DP_PORTFOLIO_PROJECTS", JSON.stringify(DP_PROJECTS_CATALOG));
    } catch (_) {}

    renderWebsitesCatalog();

    // Broadcast patch updates asynchronously
    for (const p of DP_PROJECTS_CATALOG) {
      fetch("api/projects.php", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: p.id, isVisible: makeVisible })
      }).catch(() => {});
    }

    showToast(makeVisible ? "All 16 systems enabled for portfolio view!" : "All systems set to draft/hidden from portfolio.");
  };

  window.dpDeleteProject = async function(projectId, event) {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }

    const project = DP_PROJECTS_CATALOG.find(p => p.id === projectId);
    if (!project) return;

    if (!confirm("Are you sure you want to delete '" + project.name + "' from your portfolio and websites catalogue?")) {
      return;
    }

    DP_PROJECTS_CATALOG = DP_PROJECTS_CATALOG.filter(p => p.id !== projectId);
    try {
      localStorage.setItem("DP_PORTFOLIO_PROJECTS", JSON.stringify(DP_PROJECTS_CATALOG));
    } catch (_) {}

    try {
      await fetch("api/projects.php?id=" + encodeURIComponent(projectId), {
        method: "DELETE"
      });
    } catch (e) {
      console.warn("Delete API notice:", e);
    }

    renderWebsitesCatalog();
    showToast("Project '" + project.name + "' removed.");
  };

  function renderWebsitesCatalog() {
    const grid = document.getElementById("websitesCatalogGrid");
    const pillsContainer = document.getElementById("inPageQuickSwitchPills");

    // Update Counts on Badges and Filter Pills
    const totalCount = DP_PROJECTS_CATALOG.length;
    const visibleCount = DP_PROJECTS_CATALOG.filter(p => p.isVisible !== false).length;
    const hiddenCount = totalCount - visibleCount;

    const elTotal = document.getElementById("pillWebCountAll");
    const elVis = document.getElementById("pillWebCountVisible");
    const elHid = document.getElementById("pillWebCountHidden");
    const elDashLive = document.getElementById("dashPortfolioLiveCount");
    const elDashSel = document.getElementById("dashPortfolioSelectedCount");

    if (elTotal) elTotal.textContent = totalCount;
    if (elVis) elVis.textContent = visibleCount;
    if (elHid) elHid.textContent = hiddenCount;
    if (elDashLive) elDashLive.textContent = totalCount + " Live Deployments";
    if (elDashSel) elDashSel.textContent = visibleCount + " Selected for Portfolio";

    // 1. Render Quick Switch Pills underneath stage
    if (pillsContainer) {
      pillsContainer.innerHTML = DP_PROJECTS_CATALOG.map(p => {
        const isActive = (p.id === currentActiveStageProjectId);
        const isSelected = (p.isVisible !== false);
        return '<button type="button" class="btn btn-sm" onclick="window.dpLoadProjectIntoInPageStage(\'' + p.id + '\')" ' +
          'style="padding:0.35rem 0.75rem; border-radius:20px; font-size:0.78rem; font-weight:700; white-space:nowrap; display:inline-flex; align-items:center; gap:6px; transition:all 0.2s ease; ' +
          (isActive ? 'background:var(--lime); color:#000; border:1px solid var(--lime); box-shadow:0 2px 8px rgba(92,148,0,0.3);' : 'background:var(--bg-card); color:var(--text-secondary); border:1px solid var(--border-color);') + '">' +
          '<img src="' + p.logo + '" alt="" style="width:14px; height:14px; object-fit:contain; border-radius:3px;" onerror="this.style.display=\'none\'">' +
          escapeHtml(p.name.split(" ")[0] + " " + (p.name.split(" ")[1] || "")) +
          (!isSelected ? '<span style="width:6px; height:6px; border-radius:50%; background:#ef4444; display:inline-block;" title="Hidden from portfolio"></span>' : '') +
        '</button>';
      }).join("");
    }

    if (!grid) return;

    // 2. Filter Projects for the Grid
    const filtered = DP_PROJECTS_CATALOG.filter(p => {
      // Visibility Filter
      const isVisible = (p.isVisible !== false);
      if (currentWebVisFilter === "visible" && !isVisible) return false;
      if (currentWebVisFilter === "hidden" && isVisible) return false;

      // Category Filter
      if (currentWebCatFilter !== "all" && p.category !== currentWebCatFilter) return false;

      // Search Term
      if (currentWebSearchTerm) {
        const query = currentWebSearchTerm;
        const matchesName = (p.name || "").toLowerCase().includes(query);
        const matchesRepo = (p.repo || "").toLowerCase().includes(query);
        const matchesDesc = (p.desc || "").toLowerCase().includes(query);
        const matchesTags = (p.tags || []).some(t => t.toLowerCase().includes(query));
        if (!matchesName && !matchesRepo && !matchesDesc && !matchesTags) return false;
      }
      return true;
    });

    if (filtered.length === 0) {
      grid.innerHTML = '<div style="grid-column: 1 / -1; text-align:center; padding:3.5rem 1.5rem; color:var(--text-muted);">' +
        '<i data-lucide="search-x" style="width:38px; height:38px; opacity:0.5; margin-bottom:0.75rem;"></i>' +
        '<h4 style="font-weight:800; color:var(--text-primary); margin-bottom:0.35rem;">No Matching Deployments</h4>' +
        '<p style="font-size:0.875rem;">Try another keyword or select "All Systems" to view all live projects.</p>' +
        '</div>';
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    grid.innerHTML = filtered.map(p => {
      const isCurrentStage = (p.id === currentActiveStageProjectId);
      const isVisible = (p.isVisible !== false);
      const tagsHtml = (p.tags || []).map(t => '<span class="tag" style="font-size:0.72rem; padding:2px 7px; border-radius:6px; background:rgba(255,255,255,0.06); border:1px solid var(--border-color); color:var(--text-secondary); font-weight:600;">' + escapeHtml(t) + '</span>').join(" ");
      const featuresHtml = (p.features || []).map(f => '<li style="font-size:0.78rem; color:var(--text-muted); margin-bottom:3px; display:flex; align-items:center; gap:6px;"><i data-lucide="check" style="width:11px; height:11px; color:var(--lime); flex-shrink:0;"></i> ' + escapeHtml(f) + '</li>').join("");

      return '<div class="glass-panel project-hub-card" style="display:flex; flex-direction:column; padding:1.25rem; border-radius:var(--radius-lg); border:1px solid ' + (isCurrentStage ? 'var(--lime)' : 'var(--border-color)') + '; background:var(--bg-card); box-shadow:var(--shadow-card); transition:all 0.2s ease;">' +
        
        // Thumbnail & Logo Banner
        '<div style="position:relative; width:100%; height:160px; border-radius:var(--radius-md); overflow:hidden; margin-bottom:1rem; background:#0F172A; display:flex; align-items:center; justify-content:center;">' +
          '<img src="' + p.hero + '" alt="' + escapeHtml(p.name) + '" style="width:100%; height:100%; object-fit:cover; opacity:0.85;" onerror="this.src=\'public/projects/modoria-hero.jpg\'">' +
          '<div style="position:absolute; inset:0; background:linear-gradient(to top, rgba(15,23,42,0.92) 0%, rgba(15,23,42,0.2) 60%);"></div>' +
          
          // Floating Logo Badge
          '<div style="position:absolute; bottom:12px; left:12px; display:flex; align-items:center; gap:8px;">' +
            '<div style="width:38px; height:38px; border-radius:8px; background:#FFFFFF; padding:3px; box-shadow:0 4px 12px rgba(0,0,0,0.25); display:flex; align-items:center; justify-content:center; flex-shrink:0;">' +
              '<img src="' + p.logo + '" alt="" style="width:100%; height:100%; object-fit:contain; border-radius:6px;" onerror="this.style.display=\'none\'">' +
            '</div>' +
            '<div>' +
              '<span class="badge" style="font-size:0.65rem; padding:1px 6px; font-weight:700; background:rgba(92,148,0,0.9); color:#FFFFFF; border:none;">' +
                escapeHtml(p.categoryLabel) +
              '</span>' +
            '</div>' +
          '</div>' +

          // Top Badges: Status Badge + Portfolio Visibility Pill
          '<div style="position:absolute; top:10px; right:10px; display:flex; flex-direction:column; align-items:flex-end; gap:4px;">' +
            '<span class="badge" style="font-size:0.68rem; font-weight:700; background:rgba(15,23,42,0.85); color:' + p.badgeColor + '; border:1px solid ' + p.badgeColor + '60; backdrop-filter:blur(4px);">' +
              escapeHtml(p.badge) +
            '</span>' +
            '<button type="button" onclick="window.dpToggleProjectVisibility(\'' + p.id + '\', event)" ' +
              'style="border:none; cursor:pointer; padding:2px 8px; border-radius:12px; font-size:0.68rem; font-weight:800; display:inline-flex; align-items:center; gap:4px; backdrop-filter:blur(4px); transition:all 0.15s ease; ' +
              (isVisible ? 'background:rgba(34,197,94,0.9); color:#FFFFFF;' : 'background:rgba(239,68,68,0.85); color:#FFFFFF;') + '" ' +
              'title="Click to toggle whether this project is displayed on public portfolio.html">' +
              (isVisible ? '<i data-lucide="check" style="width:10px; height:10px;"></i> On Portfolio' : '<i data-lucide="eye-off" style="width:10px; height:10px;"></i> Hidden') +
            '</button>' +
          '</div>' +
        '</div>' +

        // Title & GitHub link
        '<div style="display:flex; justify-content:space-between; align-items:flex-start; gap:0.5rem; margin-bottom:0.25rem;">' +
          '<h3 style="font-size:1.125rem; font-weight:800; color:var(--text-primary); margin:0; line-height:1.3; flex:1;">' + escapeHtml(p.name) + '</h3>' +
          '<button type="button" class="btn btn-secondary btn-sm" onclick="window.dpOpenEditProject(\'' + p.id + '\')" title="Edit Cover Picture, Logo & Links" style="padding:0.25rem 0.5rem; font-size:0.75rem; flex-shrink:0;">' +
            '<i data-lucide="edit-3" style="width:12px; height:12px;"></i> Edit' +
          '</button>' +
        '</div>' +

        (p.repoUrl ? '<a href="' + escapeHtml(p.repoUrl) + '" target="_blank" rel="noopener" style="display:inline-flex; align-items:center; gap:5px; font-family:var(--font-mono); font-size:0.75rem; color:var(--lime); font-weight:700; margin-bottom:0.75rem; text-decoration:none;">' +
          '<i data-lucide="github" style="width:13px; height:13px;"></i> ' + escapeHtml(p.repo || p.repoUrl.replace('https://github.com/', '')) +
        '</a>' : '<div style="margin-bottom:0.5rem;"></div>') +

        '<p style="font-size:0.835rem; color:var(--text-secondary); line-height:1.45; margin-bottom:0.85rem; flex:1;">' +
          escapeHtml(p.desc) +
        '</p>' +

        '<ul style="list-style:none; padding:0; margin:0 0 1rem 0;">' +
          featuresHtml +
        '</ul>' +

        '<div style="display:flex; flex-wrap:wrap; gap:4px; margin-bottom:1.15rem;">' +
          tagsHtml +
        '</div>' +

        // Action Buttons: Operate in Stage + Edit + Delete + External Link
        '<div style="display:flex; gap:0.45rem; margin-top:auto; padding-top:0.75rem; border-top:1px solid var(--border-color); flex-wrap:wrap;">' +
          '<button type="button" class="btn btn-primary btn-sm" style="flex:1; justify-content:center; padding:0.45rem 0.65rem; font-size:0.8rem; font-weight:700;" onclick="window.dpLoadProjectIntoInPageStage(\'' + p.id + '\', true)">' +
            '<i data-lucide="play" style="width:13px; height:13px;"></i> Operate Live' +
          '</button>' +
          '<button type="button" class="btn btn-secondary btn-sm" style="padding:0.45rem 0.65rem;" title="Edit Cover, Logo & Links" onclick="window.dpOpenEditProject(\'' + p.id + '\')">' +
            '<i data-lucide="image" style="width:13px; height:13px;"></i>' +
          '</button>' +
          '<button type="button" class="btn btn-secondary btn-sm" style="padding:0.45rem 0.65rem;" title="Full Screen Modal Preview" onclick="window.dpOpenSitePreview(\'' + escapeHtml(p.localUrl || p.liveUrl) + '\', \'' + escapeHtml(p.name).replace(/'/g, "\\'") + '\', \'' + escapeHtml(p.repoUrl) + '\')">' +
            '<i data-lucide="maximize-2" style="width:13px; height:13px;"></i>' +
          '</button>' +
          (p.liveUrl ? '<a href="' + escapeHtml(p.liveUrl) + '" target="_blank" rel="noopener" class="btn btn-secondary btn-sm" style="padding:0.45rem 0.65rem;" title="Open Live Site">' +
            '<i data-lucide="external-link" style="width:13px; height:13px;"></i>' +
          '</a>' : '') +
          '<button type="button" class="btn btn-secondary btn-sm" style="padding:0.45rem 0.65rem; color:#ef4444; border-color:rgba(239,68,68,0.3);" title="Delete Project" onclick="window.dpDeleteProject(\'' + p.id + '\', event)">' +
            '<i data-lucide="trash-2" style="width:13px; height:13px;"></i>' +
          '</button>' +
        '</div>' +
      '</div>';
    }).join("");

    if (window.lucide) window.lucide.createIcons();
  }

  // Load a project into the In-Page Live Simulator Stage
  window.dpLoadProjectIntoInPageStage = function(projectId, scrollToStage = false) {
    const project = DP_PROJECTS_CATALOG.find(p => p.id === projectId);
    if (!project) return;

    currentActiveStageProjectId = projectId;

    const stageTitle = document.getElementById("inPageStageTitle");
    const stageBadge = document.getElementById("inPageStageBadge");
    const stageLogo = document.getElementById("inPageStageLogo");
    const stageUrl = document.getElementById("inPageStageUrl");
    const stageRepo = document.getElementById("inPageStageRepoBtn");
    const stageExt = document.getElementById("inPageStageExternalBtn");
    const iframe = document.getElementById("inPageLiveIframe");

    const targetUrl = project.localUrl || project.liveUrl;

    if (stageTitle) stageTitle.textContent = project.name;
    if (stageBadge) {
      stageBadge.textContent = project.badge;
      stageBadge.style.color = project.badgeColor;
      stageBadge.style.borderColor = project.badgeColor + "50";
    }
    if (stageLogo) {
      stageLogo.src = project.logo;
      stageLogo.style.display = "block";
    }
    if (stageUrl) stageUrl.textContent = targetUrl;
    if (stageRepo) stageRepo.href = project.repoUrl || "https://github.com/4nyakundi";
    if (stageExt) stageExt.href = targetUrl;

    if (iframe) {
      iframe.src = targetUrl;
    }

    // Refresh quick switch pills active state
    const pillsContainer = document.getElementById("inPageQuickSwitchPills");
    if (pillsContainer) {
      renderWebsitesCatalog();
    }

    if (scrollToStage) {
      const container = document.getElementById("inPageLiveStageContainer");
      if (container) {
        container.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  // In-Page Viewport Switcher
  window.dpSetInPageDevice = function(device) {
    const wrapper = document.getElementById("inPageFrameWrapper");
    const btnDesktop = document.getElementById("inpageBtnDesktop");
    const btnTablet = document.getElementById("inpageBtnTablet");
    const btnMobile = document.getElementById("inpageBtnMobile");

    [btnDesktop, btnTablet, btnMobile].forEach(b => { if (b) b.classList.remove("active"); });

    if (!wrapper) return;

    if (device === "mobile") {
      wrapper.style.maxWidth = "390px";
      wrapper.style.boxShadow = "0 20px 40px rgba(0,0,0,0.2)";
      wrapper.style.margin = "0 auto";
      if (btnMobile) btnMobile.classList.add("active");
    } else if (device === "tablet") {
      wrapper.style.maxWidth = "768px";
      wrapper.style.boxShadow = "0 20px 40px rgba(0,0,0,0.15)";
      wrapper.style.margin = "0 auto";
      if (btnTablet) btnTablet.classList.add("active");
    } else {
      wrapper.style.maxWidth = "100%";
      wrapper.style.boxShadow = "0 8px 30px rgba(0,0,0,0.06)";
      wrapper.style.margin = "0";
      if (btnDesktop) btnDesktop.classList.add("active");
    }
  };

  window.dpReloadInPageFrame = function() {
    const iframe = document.getElementById("inPageLiveIframe");
    if (iframe && iframe.src) {
      const current = iframe.src;
      iframe.src = "about:blank";
      setTimeout(() => { iframe.src = current; }, 50);
    }
  };

  // Full Screen Modal Preview Controller
  window.dpOpenSitePreview = function(url, title, repoUrl) {
    const modal = document.getElementById("sitePreviewModal");
    const iframe = document.getElementById("sitePreviewIframe");
    const urlBar = document.getElementById("previewUrlBar");
    const repoBtn = document.getElementById("previewRepoBtn");
    const newTabBtn = document.getElementById("previewNewTabBtn");

    if (!modal) return;

    if (urlBar) urlBar.textContent = url || "https://...";
    if (repoBtn) {
      repoBtn.href = repoUrl || "https://github.com/4nyakundi";
      repoBtn.style.display = repoUrl ? "inline-flex" : "none";
    }
    if (newTabBtn) {
      newTabBtn.href = url || "#";
    }

    if (iframe) {
      iframe.src = url || "about:blank";
    }

    window.dpSetPreviewDevice("desktop");
    modal.style.display = "flex";
    document.body.style.overflow = "hidden";
    if (window.lucide) window.lucide.createIcons();
  };

  window.dpSetPreviewDevice = function(device) {
    const iframe = document.getElementById("sitePreviewIframe");
    const btnDesktop = document.getElementById("btnDeviceDesktop");
    const btnTablet = document.getElementById("btnDeviceTablet");
    const btnMobile = document.getElementById("btnDeviceMobile");

    [btnDesktop, btnTablet, btnMobile].forEach(b => { if (b) b.classList.remove("active"); });

    if (!iframe) return;

    if (device === "mobile") {
      iframe.style.maxWidth = "390px";
      iframe.style.boxShadow = "0 20px 40px rgba(0,0,0,0.3)";
      iframe.style.margin = "0 auto";
      if (btnMobile) btnMobile.classList.add("active");
    } else if (device === "tablet") {
      iframe.style.maxWidth = "768px";
      iframe.style.boxShadow = "0 20px 40px rgba(0,0,0,0.25)";
      iframe.style.margin = "0 auto";
      if (btnTablet) btnTablet.classList.add("active");
    } else {
      iframe.style.maxWidth = "100%";
      iframe.style.boxShadow = "none";
      iframe.style.margin = "0";
      if (btnDesktop) btnDesktop.classList.add("active");
    }
  };


  window.dpCloseSitePreview = function() {
    const modal = document.getElementById("sitePreviewModal");
    const iframe = document.getElementById("sitePreviewIframe");
    if (modal) modal.style.display = "none";
    if (iframe) iframe.src = "";
    document.body.style.overflow = "";
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
    if (activeTab === "usersTab") renderUsers();
    if (activeTab === "vaultTab") renderVaultDetails();
    if (activeTab === "tariffsTab") renderTariffManager();
  }

})();
