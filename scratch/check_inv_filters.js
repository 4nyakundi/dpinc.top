const fs = require('fs');
const js = fs.readFileSync('c:/xampp/htdocs/dpinc.top/js/dashboard.js', 'utf8');
const lines = js.split('\n');
lines.forEach((l, i) => {
  if (l.includes('currentInvoiceFilter') || l.includes('currentInvoiceTypeFilter') || l.includes('currentInvoiceSearchTerm')) {
    console.log(i + 1, l.trim());
  }
});
