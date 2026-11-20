const fs = require('fs');
const html = fs.readFileSync('c:/xampp/htdocs/dpinc.top/dashboard.html', 'utf8');
const lines = html.split('\n');
lines.forEach((l, i) => {
  if (l.includes('sitePreviewModal') || l.includes('sitePreviewIframe')) {
    console.log(i + 1, l.trim());
  }
});
