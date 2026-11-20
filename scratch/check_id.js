const fs = require('fs');
const html = fs.readFileSync('c:/xampp/htdocs/dpinc.top/dashboard.html', 'utf8');
const matches = html.match(/id=["']invoicesMasterTableBody["']/g);
console.log('Matches for invoicesMasterTableBody:', matches);

// Also check lines around line 422
const lines = html.split('\n');
console.log(lines.slice(410, 430).join('\n'));
