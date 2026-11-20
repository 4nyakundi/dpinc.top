const fs = require('fs');

const projectsData = JSON.parse(fs.readFileSync('c:/xampp/htdocs/dpinc.top/scratch/projects_data.json', 'utf8'));

let js = fs.readFileSync('c:/xampp/htdocs/dpinc.top/js/dashboard.js', 'utf8');

// Embed projects data into js/dashboard.js
const projectsJsonString = JSON.stringify(projectsData);

// 1. Upgrade renderInvoicesHub
const newRenderInvoicesHub = `  function renderInvoicesHub() {
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
            '<button class="btn btn-secondary btn-sm" style="padding:0.35rem 0.5rem;" title="Live A4 Preview" onclick="window.dpOpenPreviewInvoice(\\'' + inv.id + '\\')">' +
              '<i data-lucide="eye" style="width:14px; height:14px;"></i>' +
            '</button>' +
            '<button class="btn btn-secondary btn-sm" style="padding:0.35rem 0.5rem;" title="Print / Save PDF" onclick="window.dpPrintInvoice(\\'' + inv.id + '\\')">' +
              '<i data-lucide="printer" style="width:14px; height:14px;"></i>' +
            '</button>' +
            '<button class="btn btn-secondary btn-sm" style="padding:0.35rem 0.5rem; color:#15803d; border-color:rgba(34,197,94,0.3);" title="Record Payment / Deposit" onclick="window.dpRecordInvoicePayment(\\'' + inv.id + '\\')">' +
              '<i data-lucide="wallet" style="width:14px; height:14px;"></i>' +
            '</button>' +
            '<button class="btn btn-secondary btn-sm" style="padding:0.35rem 0.5rem; color:#25D366; border-color:rgba(37,211,102,0.3);" title="Send WhatsApp Bill" onclick="window.dpDispatchInvoiceWhatsApp(\\'' + inv.id + '\\')">' +
              '<i data-lucide="message-square" style="width:14px; height:14px;"></i>' +
            '</button>' +
            '<button class="btn btn-secondary btn-sm" style="padding:0.35rem 0.5rem;" title="Edit Invoice" onclick="window.dpOpenCreateInvoice(null, \\'' + inv.id + '\\')">' +
              '<i data-lucide="edit-3" style="width:14px; height:14px;"></i>' +
            '</button>' +
            '<button class="btn btn-secondary btn-sm" style="padding:0.35rem 0.5rem; color:#ef4444; border-color:rgba(239,68,68,0.3);" title="Delete Invoice" onclick="window.dpDeleteInvoice(\\'' + inv.id + '\\')">' +
              '<i data-lucide="trash-2" style="width:14px; height:14px;"></i>' +
            '</button>' +
          '</div>' +
        '</td>' +
      '</tr>';
    }).join("");

    if (window.lucide) window.lucide.createIcons();
  }`;

// Find start and end of current function renderInvoicesHub()
const startIdx = js.indexOf("function renderInvoicesHub() {");
const endMarker = "function dispatchInvoiceViaWhatsApp(data) {";
const endIdx = js.indexOf(endMarker);

if (startIdx !== -1 && endIdx !== -1) {
  js = js.substring(0, startIdx) + newRenderInvoicesHub + "\n\n  " + js.substring(endIdx);
  console.log("Successfully replaced renderInvoicesHub()!");
} else {
  console.error("Could not find start/end markers for renderInvoicesHub()", { startIdx, endIdx });
}

fs.writeFileSync('c:/xampp/htdocs/dpinc.top/js/dashboard.js', js, 'utf8');
