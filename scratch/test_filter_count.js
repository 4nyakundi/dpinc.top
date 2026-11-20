const cp = require('child_process');
const out = cp.execSync('"c:\\xampp\\php\\php.exe" -r "require \'api/erp.php\';"').toString();
const data = JSON.parse(out);

const invoices = data.invoices || [];
console.log('Invoices count:', invoices.length);

let currentInvoiceFilter = "all";
let currentInvoiceTypeFilter = "all";
let currentInvoiceSearchTerm = "";

let filtered = invoices.filter(inv => {
  if (currentInvoiceFilter === "unpaid" && inv.status !== "unpaid") return false;
  if (currentInvoiceFilter === "partial" && inv.status !== "partial") return false;
  if (currentInvoiceFilter === "paid" && inv.status !== "paid") return false;

  if (currentInvoiceTypeFilter === "subscriber" && inv.clientType === "general") return false;
  if (currentInvoiceTypeFilter === "general" && inv.clientType === "subscriber") return false;

  if (currentInvoiceSearchTerm) {
    const query = currentInvoiceSearchTerm;
    const matchesClient = (inv.clientName || "").toLowerCase().includes(query);
    const matchesNo = (inv.invoiceNo || "").toLowerCase().includes(query);
    const matchesPhone = (inv.phone || "").toLowerCase().includes(query);
    if (!matchesClient && !matchesNo && !matchesPhone) return false;
  }
  return true;
});

console.log('Filtered invoices count:', filtered.length);
