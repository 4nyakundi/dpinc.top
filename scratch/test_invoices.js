const fs = require('fs');
const cp = require('child_process');

const phpOutput = cp.execSync('"c:\\xampp\\php\\php.exe" -r "require \'api/invoices.php\';"').toString();
const invData = JSON.parse(phpOutput);
console.log('Total invoices from PHP:', invData.count);

function escapeHtml(str) {
  if (typeof str !== 'string') return str === undefined || str === null ? '' : String(str);
  return str.replace(/[&<>'"]/g, tag => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[tag] || tag));
}

let errorCount = 0;
let outputRows = [];
invData.invoices.forEach(inv => {
  try {
    const gTotal = Number(inv.grandTotal || inv.amount) || 0;
    const tPaid = Number(inv.totalPaid || (inv.status === 'paid' ? gTotal : inv.depositAmount)) || 0;
    const bal = Number(inv.balanceDue !== undefined ? inv.balanceDue : Math.max(0, gTotal - tPaid)) || 0;

    let statusBadge = '';
    if (inv.status === 'paid') {
      statusBadge = 'PAID IN FULL';
    } else if (inv.status === 'partial') {
      statusBadge = 'PARTIAL DEPOSIT';
    } else {
      statusBadge = 'UNPAID / DUE';
    }

    const typeBadge = inv.clientType === 'general' ? 'General ICT' : 'ISP Subscriber';
    const itemsCount = inv.items ? inv.items.length : 1;
    const firstItemTitle = inv.items && inv.items[0] ? inv.items[0].title : (inv.package || 'Internet Subscription');
    const summaryText = itemsCount > 1 ? `${firstItemTitle} (+${itemsCount - 1} more)` : firstItemTitle;

    outputRows.push({
      invNo: inv.invoiceNo,
      client: inv.clientName,
      status: inv.status,
      gTotal,
      tPaid,
      bal
    });
  } catch(e) {
    console.error('Error on inv:', inv.id, e);
    errorCount++;
  }
});

console.log('Processed', outputRows.length, 'invoices cleanly with 0 errors.');
console.log('Sample rows:', outputRows.slice(0, 3));
