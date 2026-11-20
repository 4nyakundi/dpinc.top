const fs = require('fs');

let html = fs.readFileSync('c:/xampp/htdocs/dpinc.top/portfolio.html', 'utf8');

const additionalCards = `
          <!-- Live Site 13: 6AM Kenya Entertainment Guide -->
          <div class="glass-panel project-card" data-category="creative">
            <div class="project-preview-thumb">
              <img src="public/clients/star-lash.jpg" alt="6AM Kenya" onerror="this.src='public/dp-logo.png'">
              <span class="project-preview-badge"><i data-lucide="music" style="width:12px; height:12px;"></i> Entertainment & Media</span>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.75rem;">
              <span class="project-category" style="color:#f43f5e;">Coastal Nightlife & Events</span>
              <span class="badge" style="font-size:0.7rem; padding:0.15rem 0.5rem;">GitHub: 6amkenya</span>
            </div>
            <h3 class="project-title">6AM Kenya Entertainment & Events Portal</h3>
            <p class="project-desc">
              Coastal lifestyle, concert ticketing, DJ lineup spotlights, nightlife venue directories, and event calendar for Mombasa and Diani beach scenes.
            </p>
            <div class="tag-list" style="margin-bottom:1.25rem;">
              <span class="tag">#Next.js</span>
              <span class="tag">#Event Ticketing</span>
              <span class="tag">#Nightlife Guide</span>
            </div>
            <div style="display:flex; gap:0.5rem; margin-top:auto;">
              <button class="btn btn-primary btn-sm" onclick="window.dpOpenSitePreview('https://6amkenya.co.ke', '6AM Kenya Guide', 'https://github.com/4nyakundi/6amkenya')">
                <i data-lucide="eye" style="width:14px; height:14px;"></i> Live Preview
              </button>
              <a href="https://github.com/4nyakundi/6amkenya" target="_blank" rel="noopener" class="btn btn-secondary btn-sm" title="View Source on GitHub">
                <i data-lucide="github" style="width:14px; height:14px;"></i> Code
              </a>
            </div>
          </div>

          <!-- Live Site 14: R3 Realtors Coastal Realty -->
          <div class="glass-panel project-card" data-category="software">
            <div class="project-preview-thumb">
              <img src="public/clients/equity-afya.jpg" alt="R3 Realtors" onerror="this.src='public/dp-logo.png'">
              <span class="project-preview-badge"><i data-lucide="home" style="width:12px; height:12px;"></i> Real Estate</span>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.75rem;">
              <span class="project-category" style="color:#14b8a6;">Luxury Coastal Properties</span>
              <span class="badge" style="font-size:0.7rem; padding:0.15rem 0.5rem;">GitHub: r3-realtors</span>
            </div>
            <h3 class="project-title">R3 Realtors Coastal Property Listings</h3>
            <p class="project-desc">
              Beachfront property sales, executive residential villas, commercial land parcel listings in Nyali and Vipingo with direct WhatsApp scheduling.
            </p>
            <div class="tag-list" style="margin-bottom:1.25rem;">
              <span class="tag">#Real Estate</span>
              <span class="tag">#Property Search</span>
              <span class="tag">#WhatsApp Inquiries</span>
            </div>
            <div style="display:flex; gap:0.5rem; margin-top:auto;">
              <button class="btn btn-primary btn-sm" onclick="window.dpOpenSitePreview('https://r3realtors.co.ke', 'R3 Realtors Portal', 'https://github.com/4nyakundi/r3-realtors')">
                <i data-lucide="eye" style="width:14px; height:14px;"></i> Live Preview
              </button>
              <a href="https://github.com/4nyakundi/r3-realtors" target="_blank" rel="noopener" class="btn btn-secondary btn-sm" title="View Source on GitHub">
                <i data-lucide="github" style="width:14px; height:14px;"></i> Code
              </a>
            </div>
          </div>

          <!-- Live Site 15: Play-On Gaming Lounge -->
          <div class="glass-panel project-card" data-category="creative">
            <div class="project-preview-thumb">
              <img src="public/clients/art-by-oture.png" alt="Play-On Lounge" onerror="this.src='public/dp-logo.png'">
              <span class="project-preview-badge"><i data-lucide="tv" style="width:12px; height:12px;"></i> Esports & Gaming</span>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.75rem;">
              <span class="project-category" style="color:#a855f7;">Console & Esports Arena</span>
              <span class="badge" style="font-size:0.7rem; padding:0.15rem 0.5rem;">GitHub: Play-On</span>
            </div>
            <h3 class="project-title">Play-On Gaming Lounge System</h3>
            <p class="project-desc">
              Esports lounge management controlling gaming station timers for PS5 and Xbox, tournament bracket match tracking, and snack bar billing.
            </p>
            <div class="tag-list" style="margin-bottom:1.25rem;">
              <span class="tag">#Gaming POS</span>
              <span class="tag">#Timer Billing</span>
              <span class="tag">#Tournament Bracket</span>
            </div>
            <div style="display:flex; gap:0.5rem; margin-top:auto;">
              <button class="btn btn-primary btn-sm" onclick="window.dpOpenSitePreview('https://playonlounge.co.ke', 'Play-On Gaming Lounge', 'https://github.com/4nyakundi/Play-On')">
                <i data-lucide="eye" style="width:14px; height:14px;"></i> Live Preview
              </button>
              <a href="https://github.com/4nyakundi/Play-On" target="_blank" rel="noopener" class="btn btn-secondary btn-sm" title="View Source on GitHub">
                <i data-lucide="github" style="width:14px; height:14px;"></i> Code
              </a>
            </div>
          </div>

          <!-- Live Site 16: Fry Nation Fast-Casual Kitchen -->
          <div class="glass-panel project-card" data-category="live-sites">
            <div class="project-preview-thumb">
              <img src="public/clients/star-lash.jpg" alt="Fry Nation" onerror="this.src='public/dp-logo.png'">
              <span class="project-preview-badge"><i data-lucide="coffee" style="width:12px; height:12px;"></i> Food & Restaurant POS</span>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.75rem;">
              <span class="project-category" style="color:#ea580c;">Fast-Food Restaurant POS</span>
              <span class="badge" style="font-size:0.7rem; padding:0.15rem 0.5rem;">GitHub: frynation</span>
            </div>
            <h3 class="project-title">Fry Nation Kitchen Display & POS</h3>
            <p class="project-desc">
              Digital kitchen order display, cashier till reconciliation, automated thermal receipt printing, and M-Pesa automated transaction verification.
            </p>
            <div class="tag-list" style="margin-bottom:1.25rem;">
              <span class="tag">#Kitchen KDS</span>
              <span class="tag">#Restaurant POS</span>
              <span class="tag">#Thermal Printing</span>
            </div>
            <div style="display:flex; gap:0.5rem; margin-top:auto;">
              <button class="btn btn-primary btn-sm" onclick="window.dpOpenSitePreview('https://frynation.co.ke', 'Fry Nation Kitchen POS', 'https://github.com/shimix-del/frynation')">
                <i data-lucide="eye" style="width:14px; height:14px;"></i> Live Preview
              </button>
              <a href="https://github.com/shimix-del/frynation" target="_blank" rel="noopener" class="btn btn-secondary btn-sm" title="View Source on GitHub">
                <i data-lucide="github" style="width:14px; height:14px;"></i> Code
              </a>
            </div>
          </div>
`;

// Insert before `<!-- Project 13: Enterprise Headquarters Build-Out -->`
const insertTarget = `<!-- Project 13: Enterprise Headquarters Build-Out -->`;
if (html.includes(insertTarget)) {
  html = html.replace(insertTarget, additionalCards + '\n          ' + insertTarget);
  fs.writeFileSync('c:/xampp/htdocs/dpinc.top/portfolio.html', html, 'utf8');
  console.log('Successfully updated portfolio.html with all 16 GitHub projects!');
} else {
  console.error('Target not found in portfolio.html');
}
