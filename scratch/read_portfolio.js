const fs = require('fs');
const html = fs.readFileSync('c:/xampp/htdocs/dpinc.top/portfolio.html', 'utf8');
const lines = html.split('\n');
console.log(lines.slice(120, 250).join('\n'));
