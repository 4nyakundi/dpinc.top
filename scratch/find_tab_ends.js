const fs = require('fs');
const html = fs.readFileSync('c:/xampp/htdocs/dpinc.top/dashboard.html', 'utf8');
const lines = html.split('\n');
lines.forEach((l, i) => {
  if (l.includes('id="vaultTab"') || l.includes('id="tariffsTab"') || l.includes('id="analyticsTab"')) {
    console.log(i + 1, l.trim());
  }
});
