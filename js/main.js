/**
 * DATA PORT - Modern GSAP 3 Motion Engine
 * Powered by GreenSock GSAP 3, ScrollTrigger & Lenis Smooth Momentum Scrolling
 * Inspired by jaydickinson/free-gsap-effects & annnimate.com
 */

document.addEventListener("DOMContentLoaded", () => {
  document.documentElement.setAttribute("data-theme", "light");
  initLenisSmoothScroll();
  initCustomStudioCursor();
  initLucideIcons();
  initYear();
  initNavbarScrollEffect();
  initHeroAnimations();
  initTypewriterEffect();
  initTelemetrySimulation();
  initScrollTextHighlight();
  initScrollTriggerSections();
  initCountUpCounters();
  initBentoSpotlight();
  initButtonRollingText();
  initTextScramble();
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
   2. TYPEWRITER / CYCLING TEXT EFFECT (Jay Dickinson GSAP Effect)
   ========================================================================== */
function initTypewriterEffect() {
  const target = document.getElementById("heroDynamicText");
  if (!target) return;

  const words = [
    "Enterprise Fiber Networks",
    "4K IP Surveillance NOCs",
    "Full-Stack Web Architecture",
    "Cinematic Motion Media",
    "Cloud DevOps & Splicing"
  ];

  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingSpeed = 90;

  function type() {
    const currentWord = words[wordIndex];

    if (isDeleting) {
      target.textContent = currentWord.substring(0, charIndex - 1);
      charIndex--;
      typingSpeed = 45;
    } else {
      target.textContent = currentWord.substring(0, charIndex + 1);
      charIndex++;
      typingSpeed = 90;
    }

    if (!isDeleting && charIndex === currentWord.length) {
      typingSpeed = 2200; // Hold full word
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      typingSpeed = 400; // Pause before new word
    }

    setTimeout(type, typingSpeed);
  }

  type();
}

/* ==========================================================================
   3. SCROLL TEXT HIGHLIGHT (Jay Dickinson GSAP Effect)
   ========================================================================== */
function initScrollTextHighlight() {
  const textEl = document.querySelector(".scroll-highlight-text");
  if (!textEl || typeof ScrollTrigger === "undefined") return;

  const words = textEl.querySelectorAll(".word-span");
  if (!words.length) return;

  ScrollTrigger.create({
    trigger: textEl,
    start: "top 80%",
    end: "bottom 35%",
    scrub: 1,
    onUpdate: (self) => {
      const totalWords = words.length;
      const activeCount = Math.floor(self.progress * totalWords * 1.15);

      words.forEach((word, index) => {
        if (index <= activeCount) {
          if (word.getAttribute("data-accent") === "true") {
            word.classList.add("highlighted-accent");
          } else {
            word.classList.add("highlighted");
          }
        } else {
          word.classList.remove("highlighted", "highlighted-accent");
        }
      });
    }
  });
}

/* ==========================================================================
   4. LIVE TELEMETRY SIMULATION
   ========================================================================== */
function initTelemetrySimulation() {
  const pingEl = document.getElementById("livePingVal");
  const throughputEl = document.getElementById("liveThroughputVal");

  if (!pingEl && !throughputEl) return;

  setInterval(() => {
    if (pingEl) {
      const ping = Math.floor(Math.random() * 4) + 12; // 12ms - 15ms
      pingEl.textContent = `${ping}ms (Msa IXP)`;
    }
    if (throughputEl) {
      const mbps = (Math.random() * 0.8 + 9.2).toFixed(1); // 9.2 - 10.0 Gbps
      throughputEl.textContent = `${mbps} Gbps`;
    }
  }, 3000);
}

/* ==========================================================================
   5. ANNNIMATE CUSTOM MAGNETIC STUDIO CURSOR
   ========================================================================== */
function initCustomStudioCursor() {
  if (window.innerWidth < 1024 || 'ontouchstart' in window) return;

  let dot = document.querySelector(".custom-cursor-dot");
  let ring = document.querySelector(".custom-cursor-ring");

  if (!dot) {
    dot = document.createElement("div");
    dot.className = "custom-cursor-dot";
    document.body.appendChild(dot);
  }

  if (!ring) {
    ring = document.createElement("div");
    ring.className = "custom-cursor-ring";
    document.body.appendChild(ring);
  }

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;

  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = `${mouseX}px`;
    dot.style.top = `${mouseY}px`;
  }, { passive: true });

  if (typeof gsap !== "undefined") {
    gsap.ticker.add(() => {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      ring.style.left = `${ringX}px`;
      ring.style.top = `${ringY}px`;
    });
  }

  const hoverTargets = document.querySelectorAll(
    "a, button, input, select, textarea, .stat-card, .pillar-card, .package-card, .project-card, .client-card-modern, .testimonial-card, .process-step-card, .bento-showcase-card"
  );

  hoverTargets.forEach((target) => {
    target.addEventListener("mouseenter", () => {
      ring.classList.add("cursor-hover");
      dot.style.transform = "translate(-50%, -50%) scale(1.5)";
    });
    target.addEventListener("mouseleave", () => {
      ring.classList.remove("cursor-hover");
      dot.style.transform = "translate(-50%, -50%) scale(1)";
    });
  });
}

/* ==========================================================================
   6. BENTO SPOTLIGHT (CURSOR LIGHT TRACKING)
   ========================================================================== */
function initBentoSpotlight() {
  const cards = document.querySelectorAll(
    ".bento-card, .pillar-card, .package-card, .project-card, .stat-card, .client-card-modern, .testimonial-card, .telemetry-widget, .process-step-card, .bento-showcase-card"
  );

  cards.forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      card.style.setProperty("--mouse-x", `${x}px`);
      card.style.setProperty("--mouse-y", `${y}px`);
    }, { passive: true });
  });
}

/* ==========================================================================
   7. DUAL-LAYER ROLLING TEXT BUTTON EFFECT
   ========================================================================== */
function initButtonRollingText() {
  const buttons = document.querySelectorAll(".btn-primary, .btn-secondary, .btn-lg");

  buttons.forEach((btn) => {
    if (btn.querySelector(".roll-text-track")) return;

    const childNodes = Array.from(btn.childNodes);
    childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0) {
        const text = node.textContent.trim();
        const rollWrapper = document.createElement("span");
        rollWrapper.className = "roll-text-track";
        rollWrapper.innerHTML = `
          <span class="roll-text-item">${text}</span>
          <span class="roll-text-item" aria-hidden="true">${text}</span>
        `;
        node.replaceWith(rollWrapper);
      }
    });
  });
}

/* ==========================================================================
   8. ALPHANUMERIC TEXT SCRAMBLE DECODER
   ========================================================================== */
function initTextScramble() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_#@&%";
  const scrambleElements = document.querySelectorAll(".badge span:last-child, .dash-tag");

  scrambleElements.forEach((el) => {
    const originalText = el.textContent.trim();
    if (!originalText || originalText.length < 3) return;

    let interval = null;

    const doScramble = () => {
      let iteration = 0;
      clearInterval(interval);

      interval = setInterval(() => {
        el.textContent = originalText
          .split("")
          .map((letter, index) => {
            if (index < iteration) {
              return originalText[index];
            }
            if (letter === " " || letter === "•" || letter === "/" || letter === "-") return letter;
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join("");

        if (iteration >= originalText.length) {
          clearInterval(interval);
          el.textContent = originalText;
        }

        iteration += 1 / 2;
      }, 25);
    };

    el.addEventListener("mouseenter", doScramble);

    if (typeof ScrollTrigger !== "undefined") {
      ScrollTrigger.create({
        trigger: el,
        start: "top 90%",
        once: true,
        onEnter: doScramble
      });
    }
  });
}

/* ==========================================================================
   9. NAVBAR DYNAMIC GLASS ELEVATION ON SCROLL
   ========================================================================== */
function initNavbarScrollEffect() {
  const navbar = document.querySelector(".navbar");
  if (!navbar || typeof ScrollTrigger === "undefined") return;

  ScrollTrigger.create({
    start: "top -40",
    end: 99999,
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
          backgroundColor: "rgba(255, 255, 255, 0.94)",
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
   10. HERO ENTRANCE CINEMATIC TIMELINE
   ========================================================================== */
function initHeroAnimations() {
  if (typeof gsap === "undefined") return;

  const progressBar = document.querySelector(".scroll-progress-bar");
  if (progressBar) {
    window.addEventListener("scroll", () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
      progressBar.style.width = progress + "%";
    }, { passive: true });
  }

  const heroBadge = document.querySelector(".hero-modern .badge");
  const heroTitle = document.querySelector(".hero-title");
  const heroSubtitle = document.querySelector(".hero-subtitle");
  const heroButtons = document.querySelectorAll(".hero-buttons .btn");
  const telemetryWidget = document.querySelector(".telemetry-widget");

  const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });

  if (heroBadge) {
    heroTl.fromTo(heroBadge, 
      { opacity: 0, y: -20, scale: 0.9 }, 
      { opacity: 1, y: 0, scale: 1, duration: 0.75, delay: 0.15 }
    );
  }

  if (heroTitle) {
    heroTl.fromTo(heroTitle, 
      { opacity: 0, y: 30 }, 
      { opacity: 1, y: 0, duration: 0.9, ease: "power3.out" }, 
      "-=0.45"
    );
  }

  if (heroSubtitle) {
    heroTl.fromTo(heroSubtitle, 
      { opacity: 0, y: 20 }, 
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

  if (telemetryWidget) {
    heroTl.fromTo(telemetryWidget,
      { opacity: 0, x: 40, scale: 0.95 },
      { opacity: 1, x: 0, scale: 1, duration: 0.95, ease: "back.out(1.2)" },
      "-=0.6"
    );
  }
}

/* ==========================================================================
   11. SCROLLTRIGGER SECTION REVEALS & STAGGER
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

  // Section Headers Reveal
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

  // Process Steps Stagger Reveal
  if (document.querySelector(".process-rail-grid")) {
    gsap.fromTo(".process-step-card",
      { opacity: 0, y: 35, scale: 0.94 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.75,
        stagger: 0.12,
        ease: "back.out(1.3)",
        scrollTrigger: {
          trigger: ".process-rail-grid",
          start: "top 85%",
          toggleActions: "play none none none"
        }
      }
    );
  }

  // Bento Showcase Cards Reveal
  if (document.querySelector(".bento-showcase-grid")) {
    gsap.fromTo(".bento-showcase-card",
      { opacity: 0, y: 40, scale: 0.95 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        stagger: 0.14,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".bento-showcase-grid",
          start: "top 82%",
          toggleActions: "play none none none"
        }
      }
    );
  }

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

  // Package Cards Reveal
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
}

/* ==========================================================================
   12. DYNAMIC NUMERIC COUNT-UP ANIMATION
   ========================================================================== */
function initCountUpCounters() {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

  const statValues = document.querySelectorAll(".stat-card .stat-value");
  statValues.forEach(el => {
    const rawText = el.textContent.trim();
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
   13. MAGNETIC BUTTONS (PHYSICS SPRING)
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
   14. 3D CARD TILT & INTERACTIVE PERSPECTIVE
   ========================================================================== */
function initCardTiltAndGlare() {
  if (typeof gsap === "undefined" || window.innerWidth < 768) return;

  const tiltElements = document.querySelectorAll(
    ".package-card, .pillar-card, .project-card, .stat-card, .client-card-modern, .testimonial-card, .process-step-card, .bento-showcase-card, .telemetry-widget"
  );

  tiltElements.forEach((el) => {
    el.style.transformStyle = "preserve-3d";

    el.addEventListener("mousemove", (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -5.5;
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
   15. MOBILE NAVIGATION DRAWER
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
   16. LUCIDE ICONS & FOOTER YEAR
   ========================================================================== */
function initLucideIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function initYear() {
  const yearEls = document.querySelectorAll(".current-year");
  const year = new Date().getFullYear();
  yearEls.forEach(el => el.textContent = year);
}

/* ==========================================================================
   17. OFFICE LIVE STATUS INDICATOR
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
   18. PORTFOLIO CATEGORY FILTER WITH GSAP ANIMATION
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
   19. CONTACT FORM TRANSMISSION & TOAST
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
   20. GLOBAL TOAST MESSAGE
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
