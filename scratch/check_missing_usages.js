const fs = require('fs');
const js = fs.readFileSync('c:/xampp/htdocs/dpinc.top/js/dashboard.js', 'utf8');

const missing = [
  'sideUsersCount',
  'transitPercentLabel',
  'transitProgressBar',
  'hardwarePercentLabel',
  'hardwareProgressBar',
  'profitPercentLabel',
  'profitProgressBar',
  'batchSubsTableBody',
  'batchActiveCount'
];

missing.forEach(id => {
  const lines = js.split('\n');
  lines.forEach((l, i) => {
    if (l.includes(id)) {
      console.log(id, 'line', i + 1, ':', l.trim());
    }
  });
});
