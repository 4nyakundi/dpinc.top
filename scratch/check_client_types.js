const cp = require('child_process');
const out = cp.execSync('"c:\\xampp\\php\\php.exe" -r "require \'api/erp.php\';"').toString();
const data = JSON.parse(out);
console.log('Sample invoice clientType and status:');
data.invoices.forEach(inv => {
  console.log(inv.id, inv.invoiceNo, inv.clientName, 'status:', inv.status, 'client_type:', inv.client_type, 'clientType:', inv.clientType);
});
