const fs = require('fs');
const { JSDOM } = require('jsdom');

const html = fs.readFileSync('c:/xampp/htdocs/dpinc.top/dashboard.html', 'utf8');
const js = fs.readFileSync('c:/xampp/htdocs/dpinc.top/js/dashboard.js', 'utf8');

// Set up virtual DOM
const dom = new JSDOM(html, {
  url: 'http://localhost/dpinc.top/dashboard.html',
  runScripts: 'dangerously',
  resources: 'usable'
});

const window = dom.window;
const document = window.document;

// Mock localStorage with authenticated session
window.localStorage.setItem('dataport_auth_session', 'authenticated');

window.addEventListener('error', (event) => {
  console.error('WINDOW ERROR:', event.message, event.filename, event.lineno, event.colno, event.error);
});

// Execute dashboard.js in window context
try {
  const scriptEl = document.createElement('script');
  scriptEl.textContent = js;
  document.body.appendChild(scriptEl);
} catch(e) {
  console.error('SCRIPT APPEND ERROR:', e);
}

// Give async code 2 seconds to complete
setTimeout(() => {
  const tbody = document.getElementById('invoicesMasterTableBody');
  console.log('invoicesMasterTableBody children count:', tbody ? tbody.children.length : 'NULL');
  if (tbody && tbody.children.length > 0) {
    console.log('First row text:', tbody.children[0].textContent.replace(/\s+/g, ' ').trim());
  } else if (tbody) {
    console.log('tbody innerHTML:', tbody.innerHTML);
  }
}, 2500);
