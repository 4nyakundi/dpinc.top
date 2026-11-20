const fs = require('fs');
const js = fs.readFileSync('c:/xampp/htdocs/dpinc.top/js/dashboard.js', 'utf8');
const lines = js.split('\n');
console.log(lines.slice(2370, 2515).join('\n'));
