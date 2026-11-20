const fs = require('fs');
const css = fs.readFileSync('c:/xampp/htdocs/dpinc.top/css/style.css', 'utf8');
const lines = css.split('\n');
lines.forEach((l, i) => {
  if (l.includes('.dash-tab-pane') || l.includes('.glass-panel')) {
    console.log(lines.slice(Math.max(0, i - 1), i + 10).join('\n'));
  }
});
