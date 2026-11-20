const fs = require('fs');
const js = fs.readFileSync('c:/xampp/htdocs/dpinc.top/js/dashboard.js', 'utf8');
const html = fs.readFileSync('c:/xampp/htdocs/dpinc.top/dashboard.html', 'utf8');

// Find all document.getElementById calls in js
const regex = /document\.getElementById\(["']([^"']+)["']\)/g;
let match;
const ids = new Set();
while ((match = regex.exec(js)) !== null) {
  ids.add(match[1]);
}

console.log('Total getElementById targets in JS:', ids.size);
const missingInHtml = [];
ids.forEach(id => {
  if (!html.includes(`id="${id}"`) && !html.includes(`id='${id}'`)) {
    missingInHtml.push(id);
  }
});

console.log('IDs in JS but missing in dashboard.html:', missingInHtml);
