const fs = require('fs');
const files = ['dashboard.html', 'index.html', 'services.html', 'portfolio.html', 'quote.html', 'js/dashboard.js'];

files.forEach(f => {
  const c = fs.readFileSync('c:/xampp/htdocs/dpinc.top/' + f, 'utf8');
  const lines = c.split('\n');
  lines.forEach((l, i) => {
    if (l.includes('>ACTION') || l.includes('>Action') || l.includes('INVOICE REF & DOC')) {
      console.log(f, i + 1, l.trim());
    }
  });
});
