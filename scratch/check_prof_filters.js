const fs = require('fs');
const js = fs.readFileSync('c:/xampp/htdocs/dpinc.top/js/dashboard.js', 'utf8');
const lines = js.split('\n');
console.log('--- Lines 945-960 ---');
console.log(lines.slice(940, 960).join('\n'));
console.log('--- Lines 2730-2745 ---');
console.log(lines.slice(2725, 2745).join('\n'));
