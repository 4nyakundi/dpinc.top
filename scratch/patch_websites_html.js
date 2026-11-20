const fs = require('fs');

let html = fs.readFileSync('c:/xampp/htdocs/dpinc.top/dashboard.html', 'utf8');

// 1. Add sidebar button if not present
if (!html.includes('data-tab="websitesTab"')) {
  const sidebarTarget = `<button class="dash-side-nav-btn" data-tab="vaultTab">`;
  const sidebarAddition = `<button class="dash-side-nav-btn" data-tab="websitesTab">
            <i data-lucide="globe" style="width:18px; height:18px;"></i>
            <span class="nav-text">Websites & Projects</span>
            <span class="nav-badge" style="background:var(--lime); color:#000; font-weight:800;">16</span>
          </button>\n          ` + sidebarTarget;
  html = html.replace(sidebarTarget, sidebarAddition);

  // 2. Add top tab button
  const topTabTarget = `<button class="dash-tab" data-tab="vaultTab">`;
  const topTabAddition = `<button class="dash-tab" data-tab="websitesTab">
              <i data-lucide="globe" style="width:16px; height:16px;"></i> Websites & Projects (16)
            </button>\n            ` + topTabTarget;
  html = html.replace(topTabTarget, topTabAddition);
}

// 3. Add <section id="websitesTab" class="dash-tab-pane"> right after </section> of usersTab
const usersEndTarget = `</section>\n\n      </div>\n    </main>`;
const altUsersEndTarget = `</section>\r\n\r\n      </div>\r\n    </main>`;

const websitesSectionHtml = `
        <!-- =====================================================================
             TAB 9: WEBSITES & DIGITAL PROJECTS CATALOGUE (GITHUB SHOWCASE)
             ===================================================================== -->
        <section id="websitesTab" class="dash-tab-pane">
          <div class="glass-panel" style="padding:clamp(1.5rem, 3vw, 2.25rem); margin-bottom:1.5rem; border-left:4px solid var(--lime);">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
              <div>
                <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.35rem;">
                  <span class="badge" style="background:rgba(92,148,0,0.15); color:var(--lime); border:1px solid rgba(92,148,0,0.3); font-weight:800;">
                    <i data-lucide="folder-git-2" style="width:13px; height:13px; display:inline;"></i> Verified GitHub Deployments
                  </span>
                  <span class="badge" style="font-size:0.72rem; font-weight:700;">16 Real Projects Live</span>
                </div>
                <h2 style="font-size:1.6rem; font-weight:800; margin:0; color:var(--text-primary);">Websites & Digital Systems Catalogue</h2>
                <p class="text-muted" style="font-size:0.875rem; margin-top:0.35rem; max-width:760px; line-height:1.5;">
                  Browse and test live client websites, full-stack portals, commercial retail platforms, IoT parking gate systems, and veterinary medical applications engineered by Emmanuel Nyakundi and the Data Port tech team.
                </p>
              </div>

              <div style="display:flex; gap:0.6rem; align-items:center; flex-wrap:wrap;">
                <a href="https://github.com/4nyakundi" target="_blank" rel="noopener" class="btn btn-secondary btn-sm" style="display:flex; align-items:center; gap:0.4rem;">
                  <i data-lucide="github" style="width:15px; height:15px;"></i> github.com/4nyakundi
                </a>
                <a href="https://github.com/shimix-del" target="_blank" rel="noopener" class="btn btn-secondary btn-sm" style="display:flex; align-items:center; gap:0.4rem;">
                  <i data-lucide="github" style="width:15px; height:15px;"></i> github.com/shimix-del
                </a>
              </div>
            </div>
          </div>

          <!-- Quick Filters & Search Bar -->
          <div class="glass-panel" style="padding:1.25rem; margin-bottom:1.5rem;">
            <div style="display:flex; justify-content:space-between; align-items:center; gap:1rem; flex-wrap:wrap;">
              <div class="calendar-legend" id="websitesCategoryFilterGroup" style="display:flex; gap:0.4rem; flex-wrap:wrap;">
                <button class="cal-filter-pill active" data-web-cat="all">All Projects (16)</button>
                <button class="cal-filter-pill" data-web-cat="ecommerce">E-Commerce & Retail (3)</button>
                <button class="cal-filter-pill" data-web-cat="enterprise">Enterprise Systems (3)</button>
                <button class="cal-filter-pill" data-web-cat="security">Security & IoT (2)</button>
                <button class="cal-filter-pill" data-web-cat="booking">Booking & Health (4)</button>
                <button class="cal-filter-pill" data-web-cat="creative">Creative & Media (4)</button>
              </div>

              <div style="min-width:260px; flex:1; max-width:380px;">
                <input type="text" id="websitesSearchInput" class="form-input" placeholder="Search by name, repo, tag (#PHP, #IoT)..." style="font-size:0.85rem;">
              </div>
            </div>
          </div>

          <!-- Websites Grid Container -->
          <div id="websitesCatalogGrid" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(360px, 1fr)); gap:1.25rem;">
            <!-- Rendered dynamically by js/dashboard.js -->
          </div>
        </section>
`;

if (html.includes(usersEndTarget)) {
  html = html.replace(usersEndTarget, '</section>' + websitesSectionHtml + '\n      </div>\n    </main>');
  console.log('Inserted websitesTab using standard LF newline!');
} else if (html.includes(altUsersEndTarget)) {
  html = html.replace(altUsersEndTarget, '</section>' + websitesSectionHtml + '\r\n      </div>\r\n    </main>');
  console.log('Inserted websitesTab using CRLF newline!');
} else {
  // Fallback: search for </section> right before </div>\n </main>
  const targetTag = `</section>\n      </div>\n    </main>`;
  if (html.includes(targetTag)) {
    html = html.replace(targetTag, '</section>' + websitesSectionHtml + '\n      </div>\n    </main>');
    console.log('Inserted websitesTab using fallback target!');
  } else {
    console.error('Could not find target insertion point for websitesTab in dashboard.html');
  }
}

fs.writeFileSync('c:/xampp/htdocs/dpinc.top/dashboard.html', html, 'utf8');
console.log('Finished updating dashboard.html for websitesTab!');
