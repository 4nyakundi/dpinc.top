const fs = require('fs');
const cp = require('child_process');

const out = cp.execSync('"c:\\xampp\\php\\php.exe" -r "require \'api/erp.php\';"').toString();
const erpData = JSON.parse(out);

console.log('Invoices count from ERP:', erpData.invoices.length);

// Test metrics computation
let totalBilled = 0;
let totalPaid = 0;
let partialDeposits = 0;
let pendingReceivables = 0;

let countAll = erpData.invoices.length;
let countUnpaid = 0;
let countPartial = 0;
let countPaid = 0;

erpData.invoices.forEach(inv => {
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

console.log('Metrics summary:');
console.log('Total Billed: KSh', totalBilled.toLocaleString());
console.log('Total Paid: KSh', totalPaid.toLocaleString());
console.log('Pending Receivables: KSh', pendingReceivables.toLocaleString());
console.log('Counts: All:', countAll, '| Paid:', countPaid, '| Unpaid/Overdue:', countUnpaid, '| Partial:', countPartial);
