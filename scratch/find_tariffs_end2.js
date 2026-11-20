const fs = require('fs');
const html = fs.readFileSync('c:/xampp/htdocs/dpinc.top/dashboard.html', 'utf8');
const lines = html.split('\n');
console.log(lines.slice(955, 1020).join('\n'));
