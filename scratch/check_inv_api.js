const cp = require('child_process');
const out = cp.execSync('"c:\\xampp\\php\\php.exe" -r "require \'api/invoices.php\';"').toString();
const data = JSON.parse(out);
console.log('Invoices API count:', data.count);
console.log('Sample invoice:', data.invoices[0].invoiceNo, data.invoices[0].clientName, data.invoices[0].status, data.invoices[0].total);
