const fs = require('fs');
const html = fs.readFileSync('c:/xampp/htdocs/dpinc.top/scratch/dom.html', 'utf8');
const idx = html.indexOf('invoicesMasterTableBody');
if (idx !== -1) {
  console.log(html.substring(idx - 100, idx + 1500));
} else {
  console.log('invoicesMasterTableBody not found in dom.html');
}
