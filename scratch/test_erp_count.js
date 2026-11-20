const cp = require('child_process');
const out = cp.execSync('"c:\\xampp\\php\\php.exe" -r "require \'api/erp.php\';"').toString();
const data = JSON.parse(out);
console.log('ERP success:', data.success);
console.log('Subscribers:', data.subscribers ? data.subscribers.length : 0);
console.log('Invoices:', data.invoices ? data.invoices.length : 0);
console.log('Job cards:', data.jobCards ? data.jobCards.length : 0);
console.log('Ledger:', data.ledger ? data.ledger.length : 0);
