const fs = require('fs');
const jsFiles = fs.readdirSync('c:/xampp/htdocs/dpinc.top/js').filter(f => f.endsWith('.js'));

jsFiles.forEach(f => {
  const content = fs.readFileSync('c:/xampp/htdocs/dpinc.top/js/' + f, 'utf8');
  const lines = content.split('\n');
  lines.forEach((l, i) => {
    if (l.includes('invoicesMasterTableBody') || l.includes('invoicesMasterTable')) {
      console.log(f, i + 1, l.trim());
    }
  });
});
