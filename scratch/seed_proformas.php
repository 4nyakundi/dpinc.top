<?php
require_once __DIR__ . '/../api/db.php';
$pdo = getDb();

$proformas = [
    [
        'id' => 'inv-prof-0089',
        'invoice_no' => 'PROF-2026-0089',
        'doc_type' => 'Invoice',
        'client_type' => 'subscriber',
        'client_name' => 'Mombasa Ocean View Suites',
        'phone' => '+254 712 345 678',
        'email' => 'finance@mombasaoceanview.co.ke',
        'location' => 'Nyali Beachfront, Mombasa',
        'sub_id' => 'sub-corp-01',
        'status' => 'paid',
        'issue_date' => '2026-09-01',
        'due_date' => '2026-09-01',
        'billing_period' => 'September 2026',
        'subtotal' => 12500,
        'tax' => 0,
        'labour_fee' => 0,
        'total' => 12500,
        'total_paid' => 12500,
        'balance_due' => 0,
        'has_payment_plan' => 0,
        'deposit_amount' => 0,
        'notes' => '50 Mbps High-Capacity Enterprise Dedicated Fiber Link',
        'items' => [
            ['title' => '50 Mbps High-Capacity Enterprise', 'qty' => '1 Month', 'rate' => 12500, 'total' => 12500]
        ]
    ],
    [
        'id' => 'inv-prof-0090',
        'invoice_no' => 'PROF-2026-0090',
        'doc_type' => 'Invoice',
        'client_type' => 'subscriber',
        'client_name' => 'Crown Logistics Hub',
        'phone' => '+254 722 987 654',
        'email' => 'accounts@crownlogistics.co.ke',
        'location' => 'Mbaraki Wharf, Mombasa',
        'sub_id' => 'sub-corp-02',
        'status' => 'paid',
        'issue_date' => '2026-09-01',
        'due_date' => '2026-09-01',
        'billing_period' => 'September 2026',
        'subtotal' => 8500,
        'tax' => 0,
        'labour_fee' => 0,
        'total' => 8500,
        'total_paid' => 8500,
        'balance_due' => 0,
        'has_payment_plan' => 0,
        'deposit_amount' => 0,
        'notes' => '30 Mbps Dedicated Business Pro Optical Link',
        'items' => [
            ['title' => '30 Mbps Dedicated Business Pro', 'qty' => '1 Month', 'rate' => 8500, 'total' => 8500]
        ]
    ],
    [
        'id' => 'inv-prof-0091',
        'invoice_no' => 'PROF-2026-0091',
        'doc_type' => 'Invoice',
        'client_type' => 'subscriber',
        'client_name' => 'Dr. Sarah Kimani Dental Clinic',
        'phone' => '+254 733 112 233',
        'email' => 'drkimani@mombasadental.co.ke',
        'location' => 'City Centre, Mombasa',
        'sub_id' => 'sub-corp-03',
        'status' => 'paid',
        'issue_date' => '2026-09-05',
        'due_date' => '2026-09-05',
        'billing_period' => 'September 2026',
        'subtotal' => 5500,
        'tax' => 0,
        'labour_fee' => 0,
        'total' => 5500,
        'total_paid' => 5500,
        'balance_due' => 0,
        'has_payment_plan' => 0,
        'deposit_amount' => 0,
        'notes' => '20 Mbps Pro Office Dedicated Medical Cloud Link',
        'items' => [
            ['title' => '20 Mbps Pro Office Dedicated', 'qty' => '1 Month', 'rate' => 5500, 'total' => 5500]
        ]
    ],
    [
        'id' => 'inv-prof-0092',
        'invoice_no' => 'PROF-2026-0092',
        'doc_type' => 'Invoice',
        'client_type' => 'subscriber',
        'client_name' => 'Apex Creative Studio',
        'phone' => '+254 701 445 566',
        'email' => 'studio@apexcreative.co.ke',
        'location' => 'Tudor / Links Road, Mombasa',
        'sub_id' => 'sub-corp-04',
        'status' => 'paid',
        'issue_date' => '2026-09-10',
        'due_date' => '2026-09-10',
        'billing_period' => 'September 2026',
        'subtotal' => 9500,
        'tax' => 0,
        'labour_fee' => 0,
        'total' => 9500,
        'total_paid' => 9500,
        'balance_due' => 0,
        'has_payment_plan' => 0,
        'deposit_amount' => 0,
        'notes' => '40 Mbps Creative High-Upload 1:1 Symmetrical Stream',
        'items' => [
            ['title' => '40 Mbps Creative High-Upload', 'qty' => '1 Month', 'rate' => 9500, 'total' => 9500]
        ]
    ]
];

$stmt = $pdo->prepare("INSERT INTO invoices (id, invoice_no, doc_type, client_type, client_name, phone, email, location, sub_id, subtotal, tax, labour_fee, total, total_paid, balance_due, status, issue_date, due_date, billing_period, notes, validity_note, has_payment_plan, deposit_amount, deposit_label)
VALUES (:id, :invoice_no, :doc_type, :client_type, :client_name, :phone, :email, :location, :sub_id, :subtotal, :tax, :labour_fee, :total, :total_paid, :balance_due, :status, :issue_date, :due_date, :billing_period, :notes, :validity_note, :has_payment_plan, :deposit_amount, :deposit_label)
ON DUPLICATE KEY UPDATE
client_name = VALUES(client_name), total = VALUES(total), total_paid = VALUES(total_paid), balance_due = VALUES(balance_due), status = VALUES(status)");

$itemStmt = $pdo->prepare("INSERT INTO invoice_items (id, invoice_id, service_id, title, description, qty, rate, total)
VALUES (:id, :invoice_id, :service_id, :title, :description, :qty, :rate, :total)
ON DUPLICATE KEY UPDATE title = VALUES(title), rate = VALUES(rate), total = VALUES(total)");

foreach ($proformas as $p) {
    $stmt->execute([
        ':id' => $p['id'],
        ':invoice_no' => $p['invoice_no'],
        ':doc_type' => $p['doc_type'],
        ':client_type' => $p['client_type'],
        ':client_name' => $p['client_name'],
        ':phone' => $p['phone'],
        ':email' => $p['email'],
        ':location' => $p['location'],
        ':sub_id' => $p['sub_id'],
        ':subtotal' => $p['subtotal'],
        ':tax' => $p['tax'],
        ':labour_fee' => $p['labour_fee'],
        ':total' => $p['total'],
        ':total_paid' => $p['total_paid'],
        ':balance_due' => $p['balance_due'],
        ':status' => $p['status'],
        ':issue_date' => $p['issue_date'],
        ':due_date' => $p['due_date'],
        ':billing_period' => $p['billing_period'],
        ':notes' => $p['notes'],
        ':validity_note' => 'Valid for billing cycle.',
        ':has_payment_plan' => $p['has_payment_plan'],
        ':deposit_amount' => $p['deposit_amount'],
        ':deposit_label' => 'Full Payment'
    ]);

    foreach ($p['items'] as $idx => $it) {
        $itemId = $p['id'] . '-item-' . ($idx + 1);
        $itemStmt->execute([
            ':id' => $itemId,
            ':invoice_id' => $p['id'],
            ':service_id' => null,
            ':title' => $it['title'],
            ':description' => 'Dedicated Optical Fiber Link Deliverable',
            ':qty' => $it['qty'],
            ':rate' => $it['rate'],
            ':total' => $it['total']
        ]);
    }
}

echo "Successfully seeded " . count($proformas) . " proformas into database!\n";
