const fs = require('fs');
const html = fs.readFileSync('c:/xampp/htdocs/dpinc.top/dashboard.html', 'utf8');
const lines = html.split('\n');
lines.forEach((l, i) => {
  if (l.includes('class="dash-tab-pane active"')) {
    console.log(i + 1, l);
  }
});
