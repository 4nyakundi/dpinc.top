/**
 * DATA PORT - Main JavaScript Controller
 * Powered by GSAP 3, ScrollTrigger & Lenis Smooth Momentum Scrolling
 * Handles Theme Toggling, Mobile Navigation, Interactive Filters, 3D Tilt, Magnetic Hover & Form Dispatch
 */

document.addEventListener("DOMContentLoaded", () => {
  initLenisSmoothScroll();
  initTheme();
  initMobileNav();
  initLucideIcons();
  initYear();
  initContactForm();
  initPortfolioFilters();
  initStatusIndicator();
  initGsapAnimations();
  initCardTilt();
});

/* --- Lenis Smooth Scrolling Engine --- */
let lenis = null;
function initLenisSmoothScroll() {
  if (typeof Lenis !== "undefined") {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
    });

    // Synchronize Lenis with GSAP ScrollTrigger
    if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);

      lenis.on("scroll", ScrollTrigger.update);

      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });

      gsap.ticker.lagSmoothing(0);
    } else {
      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }
  }
}

/* --- GSAP & ScrollTrigger Interactive Animations --- */
function initGsapAnimations() {
  if (typeof gsap === "undefined") return;

  // 1. Scroll Progress Bar
  const progressBar = document.querySelector(".scroll-progress-bar");
  if (progressBar) {
    window.addEventListener("scroll", () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
      progressBar.style.width = progress + "%";
    });
  }

  // 2. Hero Section Entrance Stagger
  const heroBadge = document.querySelector(".hero .badge");
  const heroTitle = document.querySelector(".hero-title");
  const heroSubtitle = document.querySelector(".hero-subtitle");
  const heroButtons = document.querySelector(".hero-buttons");
  const floatingChips = document.querySelectorAll(".floating-chip");

  const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });

  if (heroBadge) {
    heroTl.fromTo(heroBadge, { opacity: 0, y: -20, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.8, delay: 0.2 });
  }
  if (heroTitle) {
    heroTl.fromTo(heroTitle, { opacity: 0, y: 40, letterSpacing: "-0.08em" }, { opacity: 1, y: 0, letterSpacing: "-0.04em", duration: 1.0 }, "-=0.5");
  }
  if (heroSubtitle) {
    heroTl.fromTo(heroSubtitle, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8 }, "-=0.6");
  }
  if (heroButtons) {
    heroTl.fromTo(heroButtons, { opacity: 0, y: 25 }, { opacity: 1, y: 0, duration: 0.8 }, "-=0.5");
  }
  if (floatingChips.length) {
    heroTl.fromTo(floatingChips, { opacity: 0, scale: 0.8, y: 30 }, { opacity: 1, scale: 1, y: 0, duration: 0.9, stagger: 0.15 }, "-=0.6");
  }

  // 3. ScrollTrigger Section Animations
  if (typeof ScrollTrigger !== "undefined") {
    // Parallax floating chips on scroll
    floatingChips.forEach((chip, i) => {
      const speed = (i % 2 === 0 ? 1 : -1) * (40 + i * 20);
      gsap.to(chip, {
        y: speed,
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "bottom top",
          scrub: 1.5,
        }
      });
    });

    // Parallax Glowing Background Orbs
    const orbs = document.querySelectorAll(".glowing-orb");
    orbs.forEach((orb, i) => {
      const yOffset = (i % 2 === 0 ? 100 : -100);
      gsap.to(orb, {
        y: yOffset,
        scrollTrigger: {
          trigger: "body",
          start: "top top",
          end: "bottom bottom",
          scrub: 2,
        }
      });
    });

    // Section Titles & Subtitles Reveal
    gsap.utils.toArray(".section-title").forEach((title) => {
      gsap.fromTo(title, 
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: title,
            start: "top 85%",
            toggleActions: "play none none none"
          }
        }
      );
    });

    // Stat Cards Stagger Reveal
    if (document.querySelector(".stats-grid")) {
      gsap.fromTo(".stat-card",
        { opacity: 0, y: 40, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.12,
          ease: "back.out(1.4)",
          scrollTrigger: {
            trigger: ".stats-grid",
            start: "top 80%",
            toggleActions: "play none none none"
          }
        }
      );
    }

    // Package Cards Stagger Reveal
    if (document.querySelector(".packages-grid")) {
      gsap.fromTo(".package-card",
        { opacity: 0, y: 50, scale: 0.96 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.9,
          stagger: 0.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".packages-grid",
            start: "top 80%",
            toggleActions: "play none none none"
          }
        }
      );
    }

    // Pillar Cards Stagger Reveal
    if (document.querySelector(".pillars-grid")) {
      gsap.fromTo(".pillar-card",
        { opacity: 0, y: 45 },
        {
          opacity: 1,
          y: 0,
          duration: 0.85,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".pillars-grid",
            start: "top 80%",
            toggleActions: "play none none none"
          }
        }
      );
    }

    // Project Cards Reveal
    if (document.querySelector(".portfolio-grid")) {
      gsap.fromTo(".project-card",
        { opacity: 0, y: 45 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".portfolio-grid",
            start: "top 85%",
            toggleActions: "play none none none"
          }
        }
      );
    }

    // Testimonial Cards Reveal
    if (document.querySelector(".testimonials-grid")) {
      gsap.fromTo(".testimonial-card",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".testimonials-grid",
            start: "top 85%",
            toggleActions: "play none none none"
          }
        }
      );
    }

    // CTA Banner Scale Entrance
    const ctaBanner = document.querySelector(".cta-banner");
    if (ctaBanner) {
      gsap.fromTo(ctaBanner,
        { opacity: 0, scale: 0.92, y: 30 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 1.0,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ctaBanner,
            start: "top 85%",
            toggleActions: "play none none none"
          }
        }
      );
    }
  }
}

/* --- Interactive 3D Card Tilt with GSAP Damping --- */
function initCardTilt() {
  const tiltElements = document.querySelectorAll(".package-card, .pillar-card, .project-card, .stat-card");

  tiltElements.forEach((el) => {
    el.style.transformStyle = "preserve-3d";

    el.addEventListener("mousemove", (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -6; // max 6 deg
      const rotateY = ((x - centerX) / centerX) * 6;

      if (typeof gsap !== "undefined") {
        gsap.to(el, {
          rotateX: rotateX,
          rotateY: rotateY,
          duration: 0.4,
          ease: "power2.out",
          transformPerspective: 1000,
        });
      }
    });

    el.addEventListener("mouseleave", () => {
      if (typeof gsap !== "undefined") {
        gsap.to(el, {
          rotateX: 0,
          rotateY: 0,
          duration: 0.6,
          ease: "power2.out",
        });
      }
    });
  });
}

/* --- Theme Management (Dark / Light) --- */
function initTheme() {
  const savedTheme = localStorage.getItem("dp_theme") || (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
  setTheme(savedTheme);

  const toggleBtns = document.querySelectorAll(".theme-toggle-btn");
  toggleBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const currentTheme = document.documentElement.getAttribute("data-theme") || "dark";
      const newTheme = currentTheme === "dark" ? "light" : "dark";
      setTheme(newTheme);
    });
  });
}

function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("dp_theme", theme);

  const toggleBtns = document.querySelectorAll(".theme-toggle-btn");
  toggleBtns.forEach(btn => {
    btn.innerHTML = `<i data-lucide="${theme === 'dark' ? 'sun' : 'moon'}" class="theme-icon" style="width:18px; height:18px;"></i>`;
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

  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const kenyaTime = new Date(utc + (3600000 * 3));
  const hour = kenyaTime.getHours();
  const min = kenyaTime.getMinutes();
  const decimalHour = hour + (min / 60);

  let statusText = "Closed";
  let statusColor = "#ef4444";

  if (decimalHour >= 8.5 && decimalHour < 16.5) {
    statusText = "Open • On-Site & Remote";
    statusColor = "#48E586";
  } else if (decimalHour >= 16.5 && decimalHour < 21.0) {
    statusText = "Open • Remote Support Active";
    statusColor = "#2DD4BF";
  } else {
    statusText = "Offline • Remote Available Tomorrow 8:30 AM";
    statusColor = "#8EA483";
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
          if (typeof gsap !== "undefined") {
            gsap.fromTo(card, { opacity: 0, y: 20, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "power2.out" });
          }
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
