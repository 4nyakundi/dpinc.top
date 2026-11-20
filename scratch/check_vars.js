const fs = require('fs');
const css = fs.readFileSync('c:/xampp/htdocs/dpinc.top/css/style.css', 'utf8');
const lines = css.split('\n');
console.log(lines.slice(0, 100).join('\n'));
