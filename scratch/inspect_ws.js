const fs = require('fs');
const content = fs.readFileSync('c:/xampp/htdocs/dpinc.top/api/erp.php', 'utf8');
const lines = content.split('\n');
console.log(lines.slice(26, 42).map(l => JSON.stringify(l)).join('\n'));
