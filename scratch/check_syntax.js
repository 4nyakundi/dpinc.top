const fs = require('fs');

// Check dashboard.js for syntax
const js = fs.readFileSync('c:/xampp/htdocs/dpinc.top/js/dashboard.js', 'utf8');
try {
  new Function(js);
  console.log('dashboard.js parsed successfully as valid JavaScript!');
} catch(e) {
  console.error('Syntax error in dashboard.js:', e);
}
