/**
 * DATA PORT - Elevated GSAP 3 & ScrollTrigger Animation Engine
 * Modern ICT Infrastructure & Creative Media Platform
 * Powered by GreenSock GSAP 3, ScrollTrigger & Lenis Smooth Momentum Scrolling
 */

document.addEventListener("DOMContentLoaded", () => {
  document.documentElement.setAttribute("data-theme", "light");
  initLenisSmoothScroll();
  initLucideIcons();
  initYear();
  initNavbarScrollEffect();
  initHeroAnimations();
  initScrollTriggerSections();
  initCountUpCounters();
  initMagneticButtons();
  initCardTiltAndGlare();
  initMobileNav();
  initPortfolioFilters();
  initContactForm();
  initStatusIndicator();
});

/* ==========================================================================
   1. LENIS SMOOTH MOMENTUM SCROLLING ENGINE
   ========================================================================== */
let lenis = null;
function initLenisSmoothScroll() {
  if (typeof Lenis !== "undefined") {
    lenis = new Lenis({
      duration: 1.25,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1.05,
      touchMultiplier: 1.6,
    });

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

/* ==========================================================================
   2. NAVBAR DYNAMIC GLASS ELEVATION ON SCROLL
   ========================================================================== */
function initNavbarScrollEffect() {
  const navbar = document.querySelector(".navbar");
  if (!navbar || typeof ScrollTrigger === "undefined") return;

  ScrollTrigger.create({
    start: "top -40",
    end: 99999,
    toggleClass: { className: "navbar-scrolled", targets: navbar },
    onUpdate: (self) => {
      if (self.progress > 0.005) {
        gsap.to(navbar, {
          backgroundColor: "rgba(255, 255, 255, 0.98)",
          boxShadow: "0 10px 30px -10px rgba(15, 23, 42, 0.08), 0 1px 3px rgba(15, 23, 42, 0.04)",
          paddingTop: "0.65rem",
          paddingBottom: "0.65rem",
          borderColor: "#E2E8F0",
          duration: 0.3,
          ease: "power2.out",
          overwrite: "auto"
        });
      } else {
        gsap.to(navbar, {
          backgroundColor: "rgba(255, 255, 255, 0.92)",
          boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04)",
          paddingTop: "0.85rem",
          paddingBottom: "0.85rem",
          borderColor: "#E2E8F0",
          duration: 0.3,
          ease: "power2.out",
          overwrite: "auto"
        });
      }
    }
  });
}

/* ==========================================================================
   3. HERO ENTRANCE CINEMATIC TIMELINE
   ========================================================================== */
function initHeroAnimations() {
  if (typeof gsap === "undefined") return;

  // 1. Scroll Progress Bar
  const progressBar = document.querySelector(".scroll-progress-bar");
  if (progressBar) {
    window.addEventListener("scroll", () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
      progressBar.style.width = progress + "%";
    }, { passive: true });
  }

  const heroBadge = document.querySelector(".hero .badge");
  const heroTitle = document.querySelector(".hero-title");
  const heroSubtitle = document.querySelector(".hero-subtitle");
  const heroButtons = document.querySelectorAll(".hero-buttons .btn");
  const floatingChips = document.querySelectorAll(".floating-chip");

  const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });

  if (heroBadge) {
    heroTl.fromTo(heroBadge, 
      { opacity: 0, y: -25, scale: 0.9 }, 
      { opacity: 1, y: 0, scale: 1, duration: 0.75, delay: 0.15 }
    );
  }

  if (heroTitle) {
    heroTl.fromTo(heroTitle, 
      { opacity: 0, y: 35, scale: 0.97 }, 
      { opacity: 1, y: 0, scale: 1, duration: 0.95, ease: "back.out(1.3)" }, 
      "-=0.45"
    );
  }

  if (heroSubtitle) {
    heroTl.fromTo(heroSubtitle, 
      { opacity: 0, y: 25 }, 
      { opacity: 1, y: 0, duration: 0.8 }, 
      "-=0.55"
    );
  }

  if (heroButtons.length) {
    heroTl.fromTo(heroButtons, 
      { opacity: 0, y: 20, scale: 0.94 }, 
      { opacity: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.12, ease: "back.out(1.4)" }, 
      "-=0.5"
    );
  }

  if (floatingChips.length) {
    heroTl.fromTo(floatingChips, 
      { opacity: 0, scale: 0.75, y: 40 }, 
      { opacity: 1, scale: 1, y: 0, duration: 0.9, stagger: 0.15, ease: "back.out(1.5)" }, 
      "-=0.6"
    );
  }

  // Parallax floating chips on scroll
  if (typeof ScrollTrigger !== "undefined" && floatingChips.length) {
    floatingChips.forEach((chip, i) => {
      const speed = (i % 2 === 0 ? 1 : -1) * (35 + i * 15);
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
  }
}

/* ==========================================================================
   4. SCROLLTRIGGER SECTION REVEALS & STAGGER
   ========================================================================== */
function initScrollTriggerSections() {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

  // Background Parallax Orbs
  const orbs = document.querySelectorAll(".glowing-orb");
  orbs.forEach((orb, i) => {
    const yOffset = (i % 2 === 0 ? 120 : -120);
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

  // Section Headers Reveal (Badge + Title + Subtitle)
  gsap.utils.toArray(".section").forEach((sec) => {
    const badge = sec.querySelector(".badge");
    const title = sec.querySelector(".section-title");
    const subtitle = sec.querySelector(".section-subtitle");

    if (title) {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: title,
          start: "top 88%",
          toggleActions: "play none none none"
        }
      });

      if (badge) tl.fromTo(badge, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" });
      tl.fromTo(title, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.75, ease: "power3.out" }, badge ? "-=0.3" : 0);
      if (subtitle) tl.fromTo(subtitle, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.65, ease: "power2.out" }, "-=0.4");
    }
  });

  // Modern Client Cards Grid Reveal
  if (document.querySelector(".clients-grid-modern")) {
    gsap.fromTo(".client-card-modern",
      { opacity: 0, y: 35, scale: 0.9 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.65,
        stagger: 0.1,
        ease: "back.out(1.4)",
        scrollTrigger: {
          trigger: ".clients-grid-modern",
          start: "top 86%",
          toggleActions: "play none none none"
        }
      }
    );
  }

  // Stat Cards Stagger Reveal
  if (document.querySelector(".stats-grid")) {
    gsap.fromTo(".stats-grid .stat-card",
      { opacity: 0, y: 35, scale: 0.94 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.75,
        stagger: 0.12,
        ease: "back.out(1.3)",
        scrollTrigger: {
          trigger: ".stats-grid",
          start: "top 85%",
          toggleActions: "play none none none"
        }
      }
    );
  }

  // Solution Pillar Cards Stagger Reveal
  if (document.querySelector(".pillars-grid")) {
    gsap.fromTo(".pillar-card",
      { opacity: 0, y: 40, scale: 0.96 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        stagger: 0.14,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".pillars-grid",
          start: "top 82%",
          toggleActions: "play none none none"
        }
      }
    );
  }

  // Commercial Packages Grid Reveal
  if (document.querySelector(".packages-grid")) {
    gsap.fromTo(".package-card",
      { opacity: 0, y: 45, scale: 0.95 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.85,
        stagger: 0.18,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".packages-grid",
          start: "top 82%",
          toggleActions: "play none none none"
        }
      }
    );
  }

  // Portfolio Case Studies Grid Reveal
  if (document.querySelector(".portfolio-grid")) {
    gsap.fromTo(".project-card",
      { opacity: 0, y: 40, scale: 0.96 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.75,
        stagger: 0.12,
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
      { opacity: 0, y: 35, scale: 0.95 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.75,
        stagger: 0.14,
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
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ctaBanner,
          start: "top 88%",
          toggleActions: "play none none none"
        }
      }
    );
  }

  // Proposal Tables Wrapper Reveal
  gsap.utils.toArray(".proposal-table-wrapper").forEach(wrapper => {
    gsap.fromTo(wrapper,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.75,
        ease: "power2.out",
        scrollTrigger: {
          trigger: wrapper,
          start: "top 88%",
          toggleActions: "play none none none"
        }
      }
    );
  });
}

/* ==========================================================================
   5. DYNAMIC NUMERIC COUNT-UP ANIMATION (GSAP Counter)
   ========================================================================== */
function initCountUpCounters() {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

  const statValues = document.querySelectorAll(".stat-card .stat-value");
  statValues.forEach(el => {
    const rawText = el.textContent.trim();
    // Parse pure numeric value and suffix
    const match = rawText.match(/^([^\d]*)([\d,.]+)(.*)$/);
    if (!match) return;

    const prefix = match[1];
    const numStr = match[2].replace(/,/g, '');
    const suffix = match[3];
    const targetVal = parseFloat(numStr);

    if (isNaN(targetVal)) return;

    const isDecimal = numStr.includes('.');
    const decimalPlaces = isDecimal ? numStr.split('.')[1].length : 0;

    const counterObj = { val: 0 };

    ScrollTrigger.create({
      trigger: el,
      start: "top 90%",
      once: true,
      onEnter: () => {
        gsap.to(counterObj, {
          val: targetVal,
          duration: 1.8,
          ease: "power2.out",
          onUpdate: () => {
            const formatted = isDecimal 
              ? counterObj.val.toFixed(decimalPlaces) 
              : Math.round(counterObj.val).toLocaleString();
            el.textContent = `${prefix}${formatted}${suffix}`;
          }
        });
      }
    });
  });
}

/* ==========================================================================
   6. MAGNETIC BUTTONS HOVER ATTRACTION
   ========================================================================== */
function initMagneticButtons() {
  if (typeof gsap === "undefined" || window.innerWidth < 768) return;

  const magneticBtns = document.querySelectorAll(".btn-primary, .btn-secondary, .floating-whatsapp-widget");

  magneticBtns.forEach(btn => {
    btn.addEventListener("mousemove", (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      gsap.to(btn, {
        x: x * 0.28,
        y: y * 0.28,
        duration: 0.35,
        ease: "power2.out",
        overwrite: "auto"
      });
    });

    btn.addEventListener("mouseleave", () => {
      gsap.to(btn, {
        x: 0,
        y: 0,
        duration: 0.65,
        ease: "elastic.out(1, 0.4)",
        overwrite: "auto"
      });
    });
  });
}

/* ==========================================================================
   7. 3D CARD TILT & INTERACTIVE GLARE REFLECTION
   ========================================================================== */
function initCardTiltAndGlare() {
  if (typeof gsap === "undefined" || window.innerWidth < 768) return;

  const tiltElements = document.querySelectorAll(
    ".package-card, .pillar-card, .project-card, .stat-card, .client-card-modern, .testimonial-card"
  );

  tiltElements.forEach((el) => {
    el.style.transformStyle = "preserve-3d";

    el.addEventListener("mousemove", (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -5.5; // max 5.5 deg
      const rotateY = ((x - centerX) / centerX) * 5.5;

      gsap.to(el, {
        rotateX: rotateX,
        rotateY: rotateY,
        scale: 1.02,
        duration: 0.4,
        ease: "power2.out",
        transformPerspective: 1000,
        overwrite: "auto"
      });
    });

    el.addEventListener("mouseleave", () => {
      gsap.to(el, {
        rotateX: 0,
        rotateY: 0,
        scale: 1,
        duration: 0.65,
        ease: "power2.out",
        overwrite: "auto"
      });
    });
  });
}

/* ==========================================================================
   8. MOBILE NAVIGATION DRAWER
   ========================================================================== */
function initMobileNav() {
  const menuBtn = document.querySelector(".mobile-menu-btn");
  const mobileNav = document.querySelector(".mobile-nav");

  if (!menuBtn || !mobileNav) return;

  menuBtn.addEventListener("click", () => {
    mobileNav.classList.toggle("open");
    const isOpen = mobileNav.classList.contains("open");

    if (isOpen && typeof gsap !== "undefined") {
      gsap.fromTo(mobileNav.querySelectorAll(".nav-link"),
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.35, stagger: 0.06, ease: "power2.out" }
      );
    }

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

/* ==========================================================================
   9. LUCIDE ICONS & DYNAMIC SVG RE-RENDER
   ========================================================================== */
function initLucideIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

/* ==========================================================================
   10. CURRENT YEAR IN FOOTER
   ========================================================================== */
function initYear() {
  const yearEls = document.querySelectorAll(".current-year");
  const year = new Date().getFullYear();
  yearEls.forEach(el => el.textContent = year);
}

/* ==========================================================================
   11. OFFICE LIVE STATUS INDICATOR
   ========================================================================== */
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
    statusColor = "#5C9400";
  } else if (decimalHour >= 16.5 && decimalHour < 21.0) {
    statusText = "Open • Remote Support Active";
    statusColor = "#5C9400";
  } else {
    statusText = "Offline • Remote Available Tomorrow 8:30 AM";
    statusColor = "#64748B";
  }

  const dot = statusEl.querySelector(".pulse-dot");
  const text = statusEl.querySelector(".status-text");
  if (dot) dot.style.backgroundColor = statusColor;
  if (text) text.textContent = statusText;
}

/* ==========================================================================
   12. PORTFOLIO CATEGORY FILTER WITH GSAP ANIMATION
   ========================================================================== */
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
            gsap.fromTo(card, 
              { opacity: 0, y: 25, scale: 0.93 }, 
              { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: "power2.out" }
            );
          }
        } else {
          card.style.display = "none";
        }
      });
    });
  });
}

/* ==========================================================================
   13. CONTACT FORM TRANSMISSION & TOAST
   ========================================================================== */
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

/* ==========================================================================
   14. GLOBAL TOAST MESSAGE
   ========================================================================== */
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

  if (typeof gsap !== "undefined") {
    gsap.fromTo(toast, 
      { opacity: 0, y: 30, scale: 0.9 }, 
      { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "back.out(1.4)" }
    );
  }

  setTimeout(() => {
    if (typeof gsap !== "undefined") {
      gsap.to(toast, {
        opacity: 0,
        y: 20,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => { toast.style.display = "none"; }
      });
    } else {
      toast.style.display = "none";
    }
  }, 4000);
}
