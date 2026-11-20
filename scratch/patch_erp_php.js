const fs = require('fs');
let code = fs.readFileSync('c:/xampp/htdocs/dpinc.top/api/erp.php', 'utf8');

const target = "            $inv['clientName'] = $inv['client_name'];\r\n            $inv['docType'] = $inv['doc_type'];";
const replacement = `            $inv['clientName'] = $inv['client_name'];\r
            $inv['clientType'] = !empty($inv['client_type']) ? $inv['client_type'] : 'subscriber';\r
            $inv['status'] = !empty($inv['status']) ? $inv['status'] : 'unpaid';\r
            $inv['phone'] = $inv['phone'] ?? '';\r
            $inv['email'] = $inv['email'] ?? '';\r
            $inv['location'] = !empty($inv['location']) ? $inv['location'] : 'Mombasa';\r
            $inv['docType'] = $inv['doc_type'] ?? 'Invoice';`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('c:/xampp/htdocs/dpinc.top/api/erp.php', code, 'utf8');
  console.log('Successfully updated api/erp.php!');
} else {
  console.error('Target not found in api/erp.php');
}
