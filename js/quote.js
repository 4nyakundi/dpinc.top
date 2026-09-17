/**
 * DATA PORT - Interactive Quote & Invoice Generator
 * Offline-first, localStorage-enabled, dynamic live calculation & print layout
 * Aligned with Data Port Limited Commercial Proposal & Contract
 */

let lineItems = [];
let catalogItems = [];

document.addEventListener("DOMContentLoaded", () => {
  loadCatalogData();
  bindQuoteEvents();
  loadSavedQuotes();
  checkUrlParamsForPresets();
  updateLiveInvoicePreview();
});

async function loadCatalogData() {
  const catalogSelect = document.getElementById("catalogSelect");
  if (!catalogSelect) return;

  try {
    const res = await fetch("data/site-data.json");
    if (res.ok) {
      const data = await res.json();
      catalogItems = data.catalog || [];
      renderCatalogOptions();
    }
  } catch (err) {
    console.warn("Using fallback catalog items", err);
    catalogItems = [
      { id: "pkg-01", name: "[Package] Secure Office Starter (18-CCTV, WiFi, Firewall)", price: 35000 },
      { id: "pkg-02", name: "[Package] Digital Launchpad (5-Page Web, Hosting, 30s Motion Ad)", price: 30000 },
      { id: "itm-01", name: "Small Business Firewall & Configuration", price: 10000 },
      { id: "itm-02", name: "Long-Range WiFi Access Point (Installation Included)", price: 35000 },
      { id: "itm-03", name: "Motion Graphics Ad (Social Media Creative Direction)", price: 20000 },
      { id: "itm-04", name: "Custom Web App / System (Billing Automation Starter)", price: 40000 },
      { id: "itm-05", name: "Windows Server Setup + Domain Controller", price: 45000 },
      { id: "amc-01", name: "[AMC Annual] Standard Plan Retainer (Mon-Fri, 4h SLA)", price: 70000 },
      { id: "amc-02", name: "[AMC Annual] Premium Corporate Plan (24/7, 1h SLA, DevOps)", price: 90000 },
      { id: "adh-01", name: "On-Demand Engineering Support (2 Hours Min)", price: 5000 }
    ];
    renderCatalogOptions();
  }
}

function renderCatalogOptions() {
  const catalogSelect = document.getElementById("catalogSelect");
  if (!catalogSelect) return;

  catalogSelect.innerHTML = '<option value="">-- Choose an official service / package --</option>';
  catalogItems.forEach(item => {
    const opt = document.createElement("option");
    opt.value = item.id;
    opt.textContent = `${item.name} — ${formatKES(item.price)}`;
    catalogSelect.appendChild(opt);
  });
}

function checkUrlParamsForPresets() {
  const urlParams = new URLSearchParams(window.location.search);
  const pkg = urlParams.get("pkg");
  const item = urlParams.get("item");

  if (pkg === "secure-office") {
    lineItems.push({
      id: "pkg_office_" + Date.now(),
      service: "Secure Office Starter Package (18-CCTV Setup, Dual WiFi Config, Firewall Setup)",
      qty: 1,
      price: 35000
    });
  } else if (pkg === "digital-launchpad") {
    lineItems.push({
      id: "pkg_launchpad_" + Date.now(),
      service: "Digital Launchpad Package (5-Page Dynamic Website, 1 Year Hosting & SSL, 30s Motion Graphic Ad)",
      qty: 1,
      price: 30000
    });
  } else if (item === "firewall") {
    lineItems.push({ id: "itm_fw_" + Date.now(), service: "Small Business Firewall & Configuration", qty: 1, price: 10000 });
  } else if (item === "wifi-ap") {
    lineItems.push({ id: "itm_wifi_" + Date.now(), service: "Long-Range WiFi Access Point (Installation Included)", qty: 1, price: 35000 });
  } else if (item === "motion-ad") {
    lineItems.push({ id: "itm_motion_" + Date.now(), service: "Motion Graphics Ad Video (Social Media Creative Direction)", qty: 1, price: 20000 });
  } else if (item === "custom-app") {
    lineItems.push({ id: "itm_app_" + Date.now(), service: "Custom Web App / System (Billing Automation Starter)", qty: 1, price: 40000 });
  } else if (item === "windows-server") {
    lineItems.push({ id: "itm_srv_" + Date.now(), service: "Windows Server Setup + Domain Controller (Service Only)", qty: 1, price: 45000 });
  }

  if (lineItems.length > 0) {
    renderLineItems();
    updateLiveInvoicePreview();
  }
}

function bindQuoteEvents() {
  const catalogSelect = document.getElementById("catalogSelect");
  const addItemBtn = document.getElementById("addItemBtn");
  const saveQuoteBtn = document.getElementById("saveQuoteBtn");
  const printQuoteBtn = document.getElementById("printQuoteBtn");

  const inputs = ["clientName", "clientPhone", "clientEmail", "clientLocation", "clientCompany", "labourFee", "taxFee"];
  inputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("input", updateLiveInvoicePreview);
    }
  });

  if (catalogSelect) {
    catalogSelect.addEventListener("change", (e) => {
      const selected = catalogItems.find(item => item.id === e.target.value);
      if (selected) {
        document.getElementById("itemService").value = selected.name;
        document.getElementById("itemPrice").value = selected.price;
        document.getElementById("itemQty").value = 1;
      }
    });
  }

  if (addItemBtn) {
    addItemBtn.addEventListener("click", addLineItem);
  }

  if (saveQuoteBtn) {
    saveQuoteBtn.addEventListener("click", saveQuoteToStorage);
  }

  if (printQuoteBtn) {
    printQuoteBtn.addEventListener("click", () => window.print());
  }
}

function addLineItem() {
  const serviceInput = document.getElementById("itemService");
  const qtyInput = document.getElementById("itemQty");
  const priceInput = document.getElementById("itemPrice");

  const service = serviceInput.value.trim();
  const qty = parseInt(qtyInput.value) || 1;
  const price = parseFloat(priceInput.value) || 0;

  if (!service || qty <= 0 || price <= 0) {
    alert("Please enter a valid item description, quantity, and unit price.");
    return;
  }

  const newItem = {
    id: "item_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
    service,
    qty,
    price
  };

  lineItems.push(newItem);
  renderLineItems();
  updateLiveInvoicePreview();

  // Reset form inputs
  serviceInput.value = "";
  qtyInput.value = 1;
  priceInput.value = "";
  document.getElementById("catalogSelect").value = "";
}

function removeLineItem(id) {
  lineItems = lineItems.filter(item => item.id !== id);
  renderLineItems();
  updateLiveInvoicePreview();
}

function renderLineItems() {
  const container = document.getElementById("lineItemsList");
  if (!container) return;

  if (lineItems.length === 0) {
    container.innerHTML = '<p class="text-muted" style="font-size:0.875rem; text-align:center; padding:1rem 0;">No items added yet. Select a service above.</p>';
    return;
  }

  container.innerHTML = "";
  lineItems.forEach(item => {
    const row = document.createElement("div");
    row.className = "line-item-row";
    row.innerHTML = `
      <div>
        <p style="font-weight:600; font-size:0.95rem;">${escapeHtml(item.service)}</p>
        <p class="text-muted" style="font-size:0.8125rem;">${item.qty} × ${formatKES(item.price)}</p>
      </div>
      <div style="display:flex; align-items:center; gap:1rem;">
        <span style="font-weight:700; color:var(--lime);">${formatKES(item.qty * item.price)}</span>
        <button type="button" class="btn btn-secondary btn-sm" style="padding:0.35rem 0.6rem; color:#ef4444;" onclick="removeLineItem('${item.id}')">
          <i data-lucide="trash-2" style="width:14px; height:14px;"></i>
        </button>
      </div>
    `;
    container.appendChild(row);
  });

  if (window.lucide) window.lucide.createIcons();
}

function updateLiveInvoicePreview() {
  const clientName = document.getElementById("clientName")?.value || "Client Name";
  const clientPhone = document.getElementById("clientPhone")?.value || "Phone Number";
  const clientEmail = document.getElementById("clientEmail")?.value || "Email Address";
  const clientLocation = document.getElementById("clientLocation")?.value || "Location";
  const clientCompany = document.getElementById("clientCompany")?.value || "";
  const labourFee = parseFloat(document.getElementById("labourFee")?.value) || 0;
  const taxFee = parseFloat(document.getElementById("taxFee")?.value) || 0;

  const subtotal = lineItems.reduce((acc, item) => acc + (item.qty * item.price), 0);
  const total = subtotal + labourFee + taxFee;

  // Update Preview summary
  setElText("previewClientName", clientCompany ? `${clientName} (${clientCompany})` : clientName);
  setElText("previewClientPhone", clientPhone);
  setElText("previewClientEmail", clientEmail);
  setElText("previewClientLocation", clientLocation);

  setElText("previewSubtotal", formatKES(subtotal));
  setElText("previewLabour", formatKES(labourFee));
  setElText("previewTax", formatKES(taxFee));
  setElText("previewTotal", formatKES(total));

  // Update Printable Table
  const printTableBody = document.getElementById("printTableBody");
  if (printTableBody) {
    if (lineItems.length === 0) {
      printTableBody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:1.5rem; color:#64748b;">No items added to invoice.</td></tr>';
    } else {
      printTableBody.innerHTML = lineItems.map((item, index) => `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px 8px;">${index + 1}. ${escapeHtml(item.service)}</td>
          <td style="padding: 10px 8px; text-align: center;">${item.qty}</td>
          <td style="padding: 10px 8px; text-align: right;">${formatKES(item.price)}</td>
          <td style="padding: 10px 8px; text-align: right; font-weight: 600;">${formatKES(item.qty * item.price)}</td>
        </tr>
      `).join("");
    }
  }

  setElText("printClientName", clientName);
  setElText("printClientCompany", clientCompany);
  setElText("printClientPhone", clientPhone);
  setElText("printClientEmail", clientEmail);
  setElText("printClientLocation", clientLocation);
  setElText("printSubtotal", formatKES(subtotal));
  setElText("printLabour", formatKES(labourFee));
  setElText("printTax", formatKES(taxFee));
  setElText("printTotal", formatKES(total));

  const invoiceNo = document.getElementById("invoiceNumberDisplay")?.textContent || `DP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  setElText("printInvoiceNumber", invoiceNo);
  setElText("printInvoiceDate", new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "long", year: "numeric" }).format(new Date()));
}

function saveQuoteToStorage() {
  const clientName = document.getElementById("clientName")?.value.trim();
  if (!clientName || lineItems.length === 0) {
    alert("Please enter a client name and add at least one line item before saving.");
    return;
  }

  const invoiceNumber = `DP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const quoteData = {
    id: "quote_" + Date.now(),
    invoiceNumber,
    date: new Date().toISOString(),
    clientName,
    clientPhone: document.getElementById("clientPhone")?.value || "",
    clientEmail: document.getElementById("clientEmail")?.value || "",
    clientLocation: document.getElementById("clientLocation")?.value || "",
    clientCompany: document.getElementById("clientCompany")?.value || "",
    lineItems: [...lineItems],
    labourFee: parseFloat(document.getElementById("labourFee")?.value) || 0,
    taxFee: parseFloat(document.getElementById("taxFee")?.value) || 0,
    total: lineItems.reduce((acc, item) => acc + (item.qty * item.price), 0) + (parseFloat(document.getElementById("labourFee")?.value) || 0) + (parseFloat(document.getElementById("taxFee")?.value) || 0)
  };

  const saved = JSON.parse(localStorage.getItem("dp_saved_quotes") || "[]");
  saved.unshift(quoteData);
  localStorage.setItem("dp_saved_quotes", JSON.stringify(saved));

  setElText("invoiceNumberDisplay", invoiceNumber);
  updateLiveInvoicePreview();
  loadSavedQuotes();
  alert(`Quote saved successfully! [${invoiceNumber}]`);
}

function loadSavedQuotes() {
  const container = document.getElementById("savedQuotesList");
  if (!container) return;

  const saved = JSON.parse(localStorage.getItem("dp_saved_quotes") || "[]");
  if (saved.length === 0) {
    container.innerHTML = '<p class="text-muted" style="font-size:0.875rem;">No saved quotes in local memory yet.</p>';
    return;
  }

  container.innerHTML = "";
  saved.slice(0, 5).forEach(quote => {
    const card = document.createElement("div");
    card.className = "line-item-row";
    card.style.cursor = "pointer";
    card.innerHTML = `
      <div onclick="restoreQuote('${quote.id}')">
        <p style="font-weight:700; color:var(--lime); font-family:var(--font-mono);">${escapeHtml(quote.invoiceNumber)}</p>
        <p style="font-size:0.875rem; font-weight:500;">${escapeHtml(quote.clientName)}</p>
        <p class="text-muted" style="font-size:0.75rem;">${new Date(quote.date).toLocaleDateString()}</p>
      </div>
      <div style="text-align:right;">
        <p style="font-weight:700; color:var(--text-primary);">${formatKES(quote.total)}</p>
        <button type="button" class="btn btn-secondary btn-sm" style="margin-top:0.35rem; color:#ef4444; padding:0.2rem 0.5rem;" onclick="deleteSavedQuote('${quote.id}', event)">
          <i data-lucide="trash-2" style="width:12px; height:12px;"></i>
        </button>
      </div>
    `;
    container.appendChild(card);
  });

  if (window.lucide) window.lucide.createIcons();
}

window.restoreQuote = function(id) {
  const saved = JSON.parse(localStorage.getItem("dp_saved_quotes") || "[]");
  const quote = saved.find(q => q.id === id);
  if (!quote) return;

  document.getElementById("clientName").value = quote.clientName || "";
  document.getElementById("clientPhone").value = quote.clientPhone || "";
  document.getElementById("clientEmail").value = quote.clientEmail || "";
  document.getElementById("clientLocation").value = quote.clientLocation || "";
  document.getElementById("clientCompany").value = quote.clientCompany || "";
  document.getElementById("labourFee").value = quote.labourFee || 0;
  document.getElementById("taxFee").value = quote.taxFee || 0;

  lineItems = [...quote.lineItems];
  setElText("invoiceNumberDisplay", quote.invoiceNumber);

  renderLineItems();
  updateLiveInvoicePreview();
  alert(`Restored Quote ${quote.invoiceNumber}`);
};

window.deleteSavedQuote = function(id, e) {
  e.stopPropagation();
  let saved = JSON.parse(localStorage.getItem("dp_saved_quotes") || "[]");
  saved = saved.filter(q => q.id !== id);
  localStorage.setItem("dp_saved_quotes", JSON.stringify(saved));
  loadSavedQuotes();
};

function formatKES(val) {
  return "Ksh " + Number(val || 0).toLocaleString("en-KE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function setElText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function escapeHtml(str) {
  return String(str || "").replace(/[&<>"']/g, m => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[m]);
}
