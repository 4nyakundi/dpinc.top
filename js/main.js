/**
 * DATA PORT - Main JavaScript Controller
 * Handles Theme Toggling, Mobile Navigation, Interactive Filters, Data Binding, and Form Transmissions
 */

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initMobileNav();
  initLucideIcons();
  initYear();
  initContactForm();
  initPortfolioFilters();
  initStatusIndicator();
});

/* --- Theme Management (Dark / Light) --- */
function initTheme() {
  const savedTheme = localStorage.getItem("dp_theme") || (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
  setTheme(savedTheme);

  const toggleBtns = document.querySelectorAll(".theme-toggle-btn");
  toggleBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const currentTheme = document.documentElement.getAttribute("data-theme") || "dark";
      const newTheme = currentTheme === "dark" ? "light" : "dark";
      setTheme(newTheme);
    });
  });
}

function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("dp_theme", theme);

  const iconContainers = document.querySelectorAll(".theme-icon");
  iconContainers.forEach(icon => {
    icon.setAttribute("data-lucide", theme === "dark" ? "sun" : "moon");
  });

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

/* --- Mobile Navigation --- */
function initMobileNav() {
  const menuBtn = document.querySelector(".mobile-menu-btn");
  const mobileNav = document.querySelector(".mobile-nav");

  if (!menuBtn || !mobileNav) return;

  menuBtn.addEventListener("click", () => {
    mobileNav.classList.toggle("open");
    const isOpen = mobileNav.classList.contains("open");
    const icon = menuBtn.querySelector("i");
    if (icon) {
      icon.setAttribute("data-lucide", isOpen ? "x" : "menu");
      if (window.lucide) window.lucide.createIcons();
    }
  });

  // Close on outside click
  document.addEventListener("click", (e) => {
    if (!menuBtn.contains(e.target) && !mobileNav.contains(e.target)) {
      mobileNav.classList.remove("open");
      const icon = menuBtn.querySelector("i");
      if (icon) {
        icon.setAttribute("data-lucide", "menu");
        if (window.lucide) window.lucide.createIcons();
      }
    }
  });
}

/* --- Lucide Icons --- */
function initLucideIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

/* --- Footer Year --- */
function initYear() {
  const yearEls = document.querySelectorAll(".current-year");
  const year = new Date().getFullYear();
  yearEls.forEach(el => el.textContent = year);
}

/* --- Office Live Status Indicator --- */
function initStatusIndicator() {
  const statusEl = document.querySelector(".office-status-badge");
  if (!statusEl) return;

  // Kenya Time is UTC+3
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const kenyaTime = new Date(utc + (3600000 * 3));
  const hour = kenyaTime.getHours();
  const min = kenyaTime.getMinutes();
  const decimalHour = hour + (min / 60);

  // Office hours: 8:30 to 16:30 (8.5 to 16.5)
  // Remote support: 16.5 to 21.0
  let statusText = "Closed";
  let statusColor = "#ef4444";

  if (decimalHour >= 8.5 && decimalHour < 16.5) {
    statusText = "Open • On-Site & Remote";
    statusColor = "#10b981";
  } else if (decimalHour >= 16.5 && decimalHour < 21.0) {
    statusText = "Open • Remote Support Active";
    statusColor = "#06b6d4";
  } else {
    statusText = "Offline • Remote Available Tomorrow 8:30 AM";
    statusColor = "#94a3b8";
  }

  const dot = statusEl.querySelector(".pulse-dot");
  const text = statusEl.querySelector(".status-text");
  if (dot) dot.style.backgroundColor = statusColor;
  if (text) text.textContent = statusText;
}

/* --- Portfolio Category Filter --- */
function initPortfolioFilters() {
  const filterBtns = document.querySelectorAll(".filter-btn");
  const projectCards = document.querySelectorAll(".project-card");

  if (!filterBtns.length || !projectCards.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const filter = btn.getAttribute("data-filter");

      projectCards.forEach(card => {
        const category = card.getAttribute("data-category");
        if (filter === "all" || category === filter) {
          card.style.display = "flex";
          card.style.animation = "fadeInDown 0.4s ease forwards";
        } else {
          card.style.display = "none";
        }
      });
    });
  });
}

/* --- Contact Form Transmission --- */
function initContactForm() {
  const form = document.getElementById("contactForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = form.querySelector("[name='name']").value;
    const email = form.querySelector("[name='email']").value;
    const subject = form.querySelector("[name='subject']").value;
    const message = form.querySelector("[name='message']").value;

    if (!name || !email || !message) {
      showToast("Please fill in all required fields.");
      return;
    }

    // Compose mailto as instant zero-server backup
    const mailtoLink = `mailto:support@dpinc.top?subject=${encodeURIComponent(subject || 'Inquiry from dpinc.top')}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`)}`;
    
    showToast("Transmission received! Preparing dispatch...");
    
    setTimeout(() => {
      window.location.href = mailtoLink;
      form.reset();
    }, 800);
  });
}

/* --- Global Toast Message --- */
function showToast(msg) {
  let toast = document.getElementById("globalToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "globalToast";
    toast.className = "toast-msg";
    document.body.appendChild(toast);
  }

  toast.textContent = msg;
  toast.style.display = "block";

  setTimeout(() => {
    toast.style.display = "none";
  }, 4000);
}
