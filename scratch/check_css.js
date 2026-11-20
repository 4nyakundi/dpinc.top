const fs = require('fs');
const css = fs.readFileSync('c:/xampp/htdocs/dpinc.top/css/style.css', 'utf8');

const matches = [];
const lines = css.split('\n');
lines.forEach((l, i) => {
  if (l.includes('tbody') || l.includes('invoicesMasterTable') || l.includes('proposal-table')) {
    matches.push((i + 1) + ': ' + l);
  }
});
console.log('Matches in style.css:\n' + matches.join('\n'));
