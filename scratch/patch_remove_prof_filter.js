const fs = require('fs');
let js = fs.readFileSync('c:/xampp/htdocs/dpinc.top/js/dashboard.js', 'utf8');

// 1. Remove the destructive filter that purged PROF-2026-
js = js.replace(
  `erpState.invoices = erpState.invoices.filter(i => !demoInvIds.includes(i.id) && !(i.invoiceNo && i.invoiceNo.startsWith("PROF-2026-")));`,
  `erpState.invoices = erpState.invoices.filter(i => !demoInvIds.includes(i.id));`
);

js = js.replace(
  `erpState.invoices = (erpState.invoices || []).filter(i => !demoInvIds.includes(i.id) && !i.invoiceNo.startsWith("PROF-2026-"));`,
  `erpState.invoices = (erpState.invoices || []).filter(i => !demoInvIds.includes(i.id));`
);

fs.writeFileSync('c:/xampp/htdocs/dpinc.top/js/dashboard.js', js, 'utf8');
console.log('Successfully removed destructive PROF-2026- purge filter!');
