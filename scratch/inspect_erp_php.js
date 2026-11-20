const fs = require('fs');
const php = fs.readFileSync('c:/xampp/htdocs/dpinc.top/api/erp.php', 'utf8');
const lines = php.split('\n');
console.log(lines.slice(20, 60).join('\n'));
