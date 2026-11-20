const fs = require('fs');

const projectsData = JSON.parse(fs.readFileSync('c:/xampp/htdocs/dpinc.top/scratch/projects_data.json', 'utf8'));
let js = fs.readFileSync('c:/xampp/htdocs/dpinc.top/js/dashboard.js', 'utf8');

// Define websites catalog code
const websitesCode = `
  /* =========================================================================
     13B. WEBSITES & DIGITAL PROJECTS CATALOGUE & PREVIEW CONTROLLER
     ========================================================================= */
  const DP_PROJECTS_CATALOG = ${JSON.stringify(projectsData, null, 2)};

  let currentWebCatFilter = "all";
  let currentWebSearchTerm = "";

  function initWebsitesCatalog() {
    const filterGroup = document.getElementById("websitesCategoryFilterGroup");
    if (filterGroup) {
      filterGroup.querySelectorAll(".cal-filter-pill").forEach(pill => {
        pill.addEventListener("click", () => {
          filterGroup.querySelectorAll(".cal-filter-pill").forEach(p => p.classList.remove("active"));
          pill.classList.add("active");
          currentWebCatFilter = pill.getAttribute("data-web-cat") || "all";
          renderWebsitesCatalog();
        });
      });
    }

    const searchInput = document.getElementById("websitesSearchInput");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        currentWebSearchTerm = e.target.value.toLowerCase().trim();
        renderWebsitesCatalog();
      });
    }
  }

  function renderWebsitesCatalog() {
    const grid = document.getElementById("websitesCatalogGrid");
    if (!grid) return;

    const filtered = DP_PROJECTS_CATALOG.filter(p => {
      if (currentWebCatFilter !== "all" && p.category !== currentWebCatFilter) return false;
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
      grid.innerHTML = '<div style="grid-column: 1 / -1; text-align:center; padding:3rem; color:var(--text-muted);">' +
        '<i data-lucide="search-x" style="width:36px; height:36px; opacity:0.5; margin-bottom:0.75rem;"></i>' +
        '<h4 style="font-weight:700; color:var(--text-primary); margin-bottom:0.25rem;">No Matching Projects</h4>' +
        '<p style="font-size:0.875rem;">Try adjusting your search keywords or select "All Projects (16)".</p>' +
        '</div>';
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    grid.innerHTML = filtered.map(p => {
      const tagsHtml = (p.tags || []).map(t => '<span class="tag" style="font-size:0.72rem; padding:2px 7px; border-radius:6px; background:rgba(255,255,255,0.06); border:1px solid var(--border-color); color:var(--text-secondary); font-weight:600;">' + escapeHtml(t) + '</span>').join(" ");
      const featuresHtml = (p.features || []).map(f => '<li style="font-size:0.78rem; color:var(--text-muted); margin-bottom:3px; display:flex; align-items:center; gap:6px;"><i data-lucide="check" style="width:11px; height:11px; color:var(--lime); flex-shrink:0;"></i> ' + escapeHtml(f) + '</li>').join("");

      return '<div class="glass-panel project-hub-card" style="display:flex; flex-direction:column; padding:1.25rem; border-radius:var(--radius-lg); border:1px solid var(--border-color); transition:all 0.2s ease;">' +
        '<div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.75rem; gap:0.5rem;">' +
          '<span class="badge" style="font-size:0.7rem; font-weight:700; background:rgba(92,148,0,0.12); color:var(--lime); border:1px solid rgba(92,148,0,0.3);">' +
            escapeHtml(p.categoryLabel) +
          '</span>' +
          '<span class="badge" style="font-size:0.68rem; font-weight:700; background:rgba(255,255,255,0.05); color:' + p.badgeColor + '; border:1px solid ' + p.badgeColor + '40;">' +
            escapeHtml(p.badge) +
          '</span>' +
        '</div>' +
        '<h3 style="font-size:1.1rem; font-weight:800; color:var(--text-primary); margin:0 0 0.35rem 0; line-height:1.3;">' + escapeHtml(p.name) + '</h3>' +
        '<div style="display:inline-flex; align-items:center; gap:5px; font-family:var(--font-mono); font-size:0.75rem; color:var(--lime); font-weight:700; margin-bottom:0.75rem;">' +
          '<i data-lucide="github" style="width:13px; height:13px;"></i> ' + escapeHtml(p.repo) +
        '</div>' +
        '<p style="font-size:0.835rem; color:var(--text-secondary); line-height:1.45; margin-bottom:0.85rem; flex:1;">' +
          escapeHtml(p.desc) +
        '</p>' +
        '<ul style="list-style:none; padding:0; margin:0 0 1rem 0;">' +
          featuresHtml +
        '</ul>' +
        '<div style="display:flex; flex-wrap:wrap; gap:4px; margin-bottom:1.15rem;">' +
          tagsHtml +
        '</div>' +
        '<div style="display:flex; gap:0.5rem; margin-top:auto; pt:0.5rem; border-top:1px solid var(--border-color); padding-top:0.75rem;">' +
          '<button type="button" class="btn btn-primary btn-sm" style="flex:1; justify-content:center; padding:0.45rem 0.75rem;" onclick="window.dpOpenSitePreview(\\'' + escapeHtml(p.liveUrl) + '\\', \\'' + escapeHtml(p.name).replace(/'/g, "\\\\'") + '\\', \\'' + escapeHtml(p.repoUrl) + '\\')">' +
            '<i data-lucide="monitor" style="width:14px; height:14px;"></i> Live Preview' +
          '</button>' +
          '<a href="' + escapeHtml(p.repoUrl) + '" target="_blank" rel="noopener" class="btn btn-secondary btn-sm" style="padding:0.45rem 0.65rem;" title="View Source Code on GitHub">' +
            '<i data-lucide="github" style="width:14px; height:14px;"></i> Code' +
          '</a>' +
          '<a href="' + escapeHtml(p.liveUrl) + '" target="_blank" rel="noopener" class="btn btn-secondary btn-sm" style="padding:0.45rem 0.65rem;" title="Open Live Site in New Tab">' +
            '<i data-lucide="external-link" style="width:14px; height:14px;"></i>' +
          '</a>' +
        '</div>' +
      '</div>';
    }).join("");

    if (window.lucide) window.lucide.createIcons();
  }

  // Live Site Preview Modal Controller
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
`;

// Insert before window.dpSetPreviewDevice or replace existing
const previewDeviceIdx = js.indexOf("window.dpSetPreviewDevice = function");
if (previewDeviceIdx !== -1) {
  js = js.substring(0, previewDeviceIdx) + websitesCode + "\n\n  " + js.substring(previewDeviceIdx);
  console.log("Successfully inserted websites catalog code!");
} else {
  // Insert before window.dpCloseSitePreview
  const closeIdx = js.indexOf("window.dpCloseSitePreview = function");
  if (closeIdx !== -1) {
    js = js.substring(0, closeIdx) + websitesCode + "\n\n  " + js.substring(closeIdx);
    console.log("Inserted websites code before dpCloseSitePreview!");
  }
}

// Ensure initWebsitesCatalog() is called in startMasterERP()
if (!js.includes("initWebsitesCatalog();")) {
  js = js.replace("initTariffManager();", "initTariffManager();\n    initWebsitesCatalog();");
}

// Ensure renderWebsitesCatalog() is called when targetTabId === "websitesTab"
js = js.replace(
  `else if (targetTabId === "websitesTab") {\n            if (window.lucide) window.lucide.createIcons();\n          }`,
  `else if (targetTabId === "websitesTab") {\n            renderWebsitesCatalog();\n          }`
);

// Ensure renderWebsitesCatalog() is called in renderAll()
if (!js.includes("renderWebsitesCatalog();")) {
  js = js.replace(
    `if (activeTab === "tariffsTab") renderTariffManager();`,
    `if (activeTab === "tariffsTab") renderTariffManager();\n    if (activeTab === "websitesTab") renderWebsitesCatalog();`
  );
}

fs.writeFileSync('c:/xampp/htdocs/dpinc.top/js/dashboard.js', js, 'utf8');
console.log("Saved updated js/dashboard.js!");
