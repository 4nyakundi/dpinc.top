const fs = require('fs');
const js = fs.readFileSync('c:/xampp/htdocs/dpinc.top/js/dashboard.js', 'utf8');
const lines = js.split('\n');
lines.forEach((l, i) => {
  if (l.includes('dpPurgeDemoRecords')) {
    console.log(lines.slice(Math.max(0, i - 5), i + 40).join('\n'));
  }
});
