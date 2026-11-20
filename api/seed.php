<?php
// =============================================================================
// DATA PORT LIMITED - Database Seeding & Reset Engine
// Seeds initial Subscribers & Invoices into dpinc.top_db (or purges demo data)
// =============================================================================

require_once __DIR__ . '/db.php';
header('Content-Type: application/json; charset=utf-8');

$pdo = getDb();
$action = $_GET['action'] ?? ($_POST['action'] ?? 'seed');

try {
    if ($action === 'purge_demo') {
        // Purge demo subscribers and invoices
        $demoSubIds = ['sub-101', 'sub-102', 'sub-103', 'sub-104', 'sub-105', 'sub-106', 'sub-107'];
        $demoInvIds = ['inv-001', 'inv-002', 'inv-003', 'inv-004', 'inv-005', 'inv-006', 'inv-007', 'inv-008'];

        $inSub = implode("','", $demoSubIds);
        $inInv = implode("','", $demoInvIds);

        $pdo->exec("DELETE FROM invoice_items WHERE invoice_id IN ('{$inInv}')");
        $pdo->exec("DELETE FROM invoices WHERE id IN ('{$inInv}') OR invoice_no LIKE 'PROF-2026-%'");
        $pdo->exec("DELETE FROM subscribers WHERE id IN ('{$inSub}')");

        echo json_encode([
            'success' => true,
            'message' => 'Demo subscribers and demo invoices successfully purged from database.'
        ]);
        exit();
    }

    // Default: Seed initial records
    $subscribers = [
        [
            'id' => 'sub-101',
            'name' => 'Mombasa Ocean View Suites',
            'company' => 'Ocean View Hospitality Ltd',
            'phone' => '+254 712 345 678',
            'email' => 'management@oceanview.co.ke',
            'location' => 'Nyali Beach Road, Mombasa',
            'ip_address' => '197.232.44.12',
            'package' => '50 Mbps High-Capacity Enterprise',
            'speed' => '50 Mbps',
            'monthly_rate' => 12500,
            'billing_day' => 1,
            'status' => 'subscriber'
        ],
        [
            'id' => 'sub-102',
            'name' => 'Crown Logistics Hub',
            'company' => 'Crown Global Forwarders',
            'phone' => '+254 722 987 654',
            'email' => 'operations@crownlogistics.com',
            'location' => 'Mbaraki Port Area, Mombasa',
            'ip_address' => '197.232.44.18',
            'package' => '30 Mbps Dedicated Business Pro',
            'speed' => '30 Mbps',
            'monthly_rate' => 8500,
            'billing_day' => 1,
            'status' => 'subscriber'
        ],
        [
            'id' => 'sub-103',
            'name' => 'Dr. Sarah Kimani Dental Clinic',
            'company' => 'Kimani Healthcare Group',
            'phone' => '+254 733 112 233',
            'email' => 'reception@kimanidental.co.ke',
            'location' => 'Digo Road, CBD, Mombasa',
            'ip_address' => '197.232.44.25',
            'package' => '20 Mbps Pro Office Dedicated',
            'speed' => '20 Mbps',
            'monthly_rate' => 5500,
            'billing_day' => 5,
            'status' => 'subscriber'
        ],
        [
            'id' => 'sub-104',
            'name' => 'Apex Creative Studio',
            'company' => 'Apex Media House',
            'phone' => '+254 701 445 566',
            'email' => 'accounts@apexcreative.co.ke',
            'location' => 'Bamburi Mtambo, Mombasa',
            'ip_address' => '197.232.44.33',
            'package' => '40 Mbps Creative High-Upload',
            'speed' => '40 Mbps',
            'monthly_rate' => 9500,
            'billing_day' => 10,
            'status' => 'subscriber'
        ],
        [
            'id' => 'sub-105',
            'name' => 'Tudor Heights Apartment 4B',
            'company' => 'Residential Subscriber',
            'phone' => '+254 790 964 002',
            'email' => 'resident4b@tudorheights.ke',
            'location' => 'Tudor, Mombasa',
            'ip_address' => '197.232.44.41',
            'package' => '15 Mbps Home Fiber Fast',
            'speed' => '15 Mbps',
            'monthly_rate' => 3500,
            'billing_day' => 15,
            'status' => 'subscriber'
        ],
        [
            'id' => 'sub-106',
            'name' => 'Coast Marine Spares',
            'company' => 'Coast Marine Engineering',
            'phone' => '+254 720 778 899',
            'email' => 'info@coastmarine.co.ke',
            'location' => 'Shimanzi Industrial Area, Mombasa',
            'ip_address' => '197.232.44.52',
            'package' => '30 Mbps Dedicated Business Pro',
            'speed' => '30 Mbps',
            'monthly_rate' => 8500,
            'billing_day' => 20,
            'status' => 'subscriber'
        ],
        [
            'id' => 'sub-107',
            'name' => 'Shani Chai',
            'company' => 'Shani Chai Operations',
            'phone' => '0795 917 066',
            'email' => 'shanichai@dpinc.co.ke',
            'location' => 'VOK Bombolulu',
            'ip_address' => '197.232.44.60',
            'package' => 'DataPort NET Public IP (25 mbps)',
            'speed' => '25 mbps',
            'monthly_rate' => 3000,
            'billing_day' => 9,
            'status' => 'subscriber'
        ]
    ];

    $sStmt = $pdo->prepare("INSERT INTO subscribers (id, name, company, phone, email, location, ip_address, package, speed, monthly_rate, billing_day, source, status, notes)
        VALUES (:id, :name, :company, :phone, :email, :location, :ip_address, :package, :speed, :monthly_rate, :billing_day, 'web', :status, '')
        ON DUPLICATE KEY UPDATE
        name=VALUES(name), company=VALUES(company), phone=VALUES(phone), email=VALUES(email), location=VALUES(location),
        ip_address=VALUES(ip_address), package=VALUES(package), speed=VALUES(speed), monthly_rate=VALUES(monthly_rate),
        billing_day=VALUES(billing_day), status=VALUES(status)");

    foreach ($subscribers as $s) {
        $sStmt->execute($s);
    }

    $invoices = [
        [
            'id' => 'inv-001',
            'invoice_no' => 'PROF-2026-0089',
            'doc_type' => 'Proforma Invoice',
            'sub_id' => 'sub-101',
            'client_name' => 'Mombasa Ocean View Suites',
            'phone' => '+254 712 345 678',
            'email' => 'management@oceanview.co.ke',
            'location' => 'Nyali Beach Road, Mombasa',
            'subtotal' => 12500,
            'total' => 12500,
            'total_paid' => 12500,
            'balance_due' => 0,
            'billing_period' => 'September 2026',
            'issue_date' => '2026-09-01',
            'due_date' => '2026-09-01',
            'status' => 'paid',
            'has_payment_plan' => 0,
            'deposit_amount' => 0,
            'deposit_label' => '1 ST Installment',
            'items' => [
                ['title' => '50 Mbps High-Capacity Enterprise Fiber', 'qty' => '1 Month', 'rate' => 12500, 'total' => 12500]
            ]
        ],
        [
            'id' => 'inv-002',
            'invoice_no' => 'PROF-2026-0090',
            'doc_type' => 'Proforma Invoice',
            'sub_id' => 'sub-102',
            'client_name' => 'Crown Logistics Hub',
            'phone' => '+254 722 987 654',
            'email' => 'operations@crownlogistics.com',
            'location' => 'Mbaraki Port Area, Mombasa',
            'subtotal' => 8500,
            'total' => 8500,
            'total_paid' => 8500,
            'balance_due' => 0,
            'billing_period' => 'September 2026',
            'issue_date' => '2026-09-01',
            'due_date' => '2026-09-01',
            'status' => 'paid',
            'has_payment_plan' => 0,
            'deposit_amount' => 0,
            'deposit_label' => '1 ST Installment',
            'items' => [
                ['title' => '30 Mbps Dedicated Business Pro', 'qty' => '1 Month', 'rate' => 8500, 'total' => 8500]
            ]
        ],
        [
            'id' => 'inv-003',
            'invoice_no' => 'PROF-2026-0091',
            'doc_type' => 'Proforma Invoice',
            'sub_id' => 'sub-103',
            'client_name' => 'Dr. Sarah Kimani Dental Clinic',
            'phone' => '+254 733 112 233',
            'email' => 'reception@kimanidental.co.ke',
            'location' => 'Digo Road, CBD, Mombasa',
            'subtotal' => 5500,
            'total' => 5500,
            'total_paid' => 5500,
            'balance_due' => 0,
            'billing_period' => 'September 2026',
            'issue_date' => '2026-09-05',
            'due_date' => '2026-09-05',
            'status' => 'paid',
            'has_payment_plan' => 0,
            'deposit_amount' => 0,
            'deposit_label' => '1 ST Installment',
            'items' => [
                ['title' => '20 Mbps Pro Office Dedicated', 'qty' => '1 Month', 'rate' => 5500, 'total' => 5500]
            ]
        ],
        [
            'id' => 'inv-004',
            'invoice_no' => 'PROF-2026-0092',
            'doc_type' => 'Proforma Invoice',
            'sub_id' => 'sub-104',
            'client_name' => 'Apex Creative Studio',
            'phone' => '+254 701 445 566',
            'email' => 'accounts@apexcreative.co.ke',
            'location' => 'Bamburi Mtambo, Mombasa',
            'subtotal' => 9500,
            'total' => 9500,
            'total_paid' => 9500,
            'balance_due' => 0,
            'billing_period' => 'September 2026',
            'issue_date' => '2026-09-10',
            'due_date' => '2026-09-10',
            'status' => 'paid',
            'has_payment_plan' => 0,
            'deposit_amount' => 0,
            'deposit_label' => '1 ST Installment',
            'items' => [
                ['title' => '40 Mbps Creative High-Upload', 'qty' => '1 Month', 'rate' => 9500, 'total' => 9500]
            ]
        ],
        [
            'id' => 'inv-005',
            'invoice_no' => 'PROF-2026-0093',
            'doc_type' => 'Proforma Invoice',
            'sub_id' => 'sub-105',
            'client_name' => 'Tudor Heights Apartment 4B',
            'phone' => '+254 790 964 002',
            'email' => 'resident4b@tudorheights.ke',
            'location' => 'Tudor, Mombasa',
            'subtotal' => 3500,
            'total' => 3500,
            'total_paid' => 0,
            'balance_due' => 3500,
            'billing_period' => 'September 2026',
            'issue_date' => '2026-09-15',
            'due_date' => '2026-09-15',
            'status' => 'unpaid',
            'has_payment_plan' => 0,
            'deposit_amount' => 0,
            'deposit_label' => '1 ST Installment',
            'items' => [
                ['title' => '15 Mbps Home Fiber Fast', 'qty' => '1 Month', 'rate' => 3500, 'total' => 3500]
            ]
        ],
        [
            'id' => 'inv-006',
            'invoice_no' => 'PROF-2026-0094',
            'doc_type' => 'Proforma Invoice',
            'sub_id' => 'sub-106',
            'client_name' => 'Coast Marine Spares',
            'phone' => '+254 720 778 899',
            'email' => 'info@coastmarine.co.ke',
            'location' => 'Shimanzi Industrial Area, Mombasa',
            'subtotal' => 8500,
            'total' => 8500,
            'total_paid' => 0,
            'balance_due' => 8500,
            'billing_period' => 'September 2026',
            'issue_date' => '2026-09-20',
            'due_date' => '2026-09-20',
            'status' => 'unpaid',
            'has_payment_plan' => 0,
            'deposit_amount' => 0,
            'deposit_label' => '1 ST Installment',
            'items' => [
                ['title' => '30 Mbps Dedicated Business Pro', 'qty' => '1 Month', 'rate' => 8500, 'total' => 8500]
            ]
        ],
        [
            'id' => 'inv-007',
            'invoice_no' => '#007/26',
            'doc_type' => 'Invoice',
            'sub_id' => 'sub-107',
            'client_name' => 'Shani Chai',
            'phone' => '0795 917 066',
            'email' => 'shanichai@dpinc.co.ke',
            'location' => 'VOK Bombolulu',
            'subtotal' => 3000,
            'total' => 3000,
            'total_paid' => 3000,
            'balance_due' => 0,
            'billing_period' => 'February 2026',
            'issue_date' => '2026-02-09',
            'due_date' => '2026-02-14',
            'status' => 'paid',
            'has_payment_plan' => 0,
            'deposit_amount' => 0,
            'deposit_label' => '1 ST Installment',
            'items' => [
                ['title' => 'DataPort NET Public IP', 'qty' => '25 mbps', 'rate' => 3000, 'total' => 3000]
            ]
        ],
        [
            'id' => 'inv-008',
            'invoice_no' => '10.23/26',
            'doc_type' => 'Proforma Invoice',
            'sub_id' => null,
            'client_name' => 'Tracy Wangari',
            'phone' => '0722 000 111',
            'email' => 'tracy.wangari@domain.com',
            'location' => 'Mombasa',
            'subtotal' => 18600,
            'total' => 18600,
            'total_paid' => 5000,
            'balance_due' => 13600,
            'billing_period' => 'January 2025',
            'issue_date' => '2025-01-16',
            'due_date' => '2025-01-30',
            'status' => 'partial',
            'has_payment_plan' => 1,
            'deposit_amount' => 5000,
            'deposit_label' => '1 ST Installment',
            'items' => [
                ['title' => 'Domain Name Registaration. (Company).', 'qty' => '1 Year', 'rate' => 2500, 'total' => 2500],
                ['title' => 'Domain Hosting (TrueHost Silver).', 'qty' => '1 Year', 'rate' => 4300, 'total' => 4300],
                ['title' => 'Web Security & Debugging & SSL Security (Ask SSL)', 'qty' => '1 Year', 'rate' => 1800, 'total' => 1800],
                ['title' => 'Web Creation & Design - Full Stacks Creation (JSON/CSS)', 'qty' => 'Lifetime', 'rate' => 10000, 'total' => 10000]
            ]
        ]
    ];

    $iStmt = $pdo->prepare("INSERT INTO invoices
        (id, invoice_no, doc_type, client_name, phone, email, location, sub_id, subtotal, tax, labour_fee, total, total_paid, balance_due, status, issue_date, due_date, billing_period, notes, validity_note, has_payment_plan, deposit_amount, deposit_label, created_at, updated_at)
        VALUES (:id, :invoice_no, :doc_type, :client_name, :phone, :email, :location, :sub_id, :subtotal, 0, 0, :total, :total_paid, :balance_due, :status, :issue_date, :due_date, :billing_period, '', 'Please Note: Valid for 14 days from date.', :has_payment_plan, :deposit_amount, :deposit_label, NOW(), NOW())
        ON DUPLICATE KEY UPDATE
        doc_type=VALUES(doc_type), client_name=VALUES(client_name), phone=VALUES(phone), email=VALUES(email),
        location=VALUES(location), sub_id=VALUES(sub_id), subtotal=VALUES(subtotal), total=VALUES(total),
        total_paid=VALUES(total_paid), balance_due=VALUES(balance_due), status=VALUES(status),
        issue_date=VALUES(issue_date), due_date=VALUES(due_date), billing_period=VALUES(billing_period),
        has_payment_plan=VALUES(has_payment_plan), deposit_amount=VALUES(deposit_amount), deposit_label=VALUES(deposit_label)");

    $itDel = $pdo->prepare("DELETE FROM invoice_items WHERE invoice_id = ?");
    $itIns = $pdo->prepare("INSERT INTO invoice_items (id, invoice_id, service_id, title, description, qty, rate, total, created_at, updated_at)
        VALUES (:id, :invoice_id, NULL, :title, '', :qty, :rate, :total, NOW(), NOW())");

    foreach ($invoices as $inv) {
        $items = $inv['items'] ?? [];
        unset($inv['items']);
        $iStmt->execute($inv);

        $itDel->execute([$inv['id']]);
        foreach ($items as $idx => $it) {
            $itIns->execute([
                ':id'         => $inv['id'] . '-it-' . ($idx + 1),
                ':invoice_id' => $inv['id'],
                ':title'      => $it['title'],
                ':qty'        => $it['qty'],
                ':rate'       => $it['rate'],
                ':total'      => $it['total']
            ]);
        }
    }

    // Seed Job Cards
    $jobCards = [
        [
            'id' => 'job-101',
            'title' => '18-Camera IP CCTV & NVR Setup',
            'client_name' => 'Mombasa Ocean View Suites',
            'technician' => 'Emmanuel Nyakundi (Lead Tech)',
            'date' => '2026-09-15',
            'status' => 'completed',
            'category' => 'CCTV Security',
            'labor_cost' => 25000,
            'total_cost' => 165000,
            'notes' => 'All cameras focused, cloud remote view app configured on manager iPhone & tablet.',
            'site_requirements' => '18x Cat6 drops, 1x 16-Port PoE Gigabit Switch, 1x 4TB SkyHawk HDD.',
            'progress_notes' => 'Completed full commissioning and remote view verification on 15th Sep.',
            'credentials' => 'NVR IP: 192.168.1.200 | User: admin | Pass: Dpinc@Cctv2026',
            'invoice_generated' => 1,
            'invoice_ref' => 'INV-2026-0089'
        ],
        [
            'id' => 'job-102',
            'title' => 'Drop Fiber Splicing & Dual-Band Router Install',
            'client_name' => 'Apex Creative Studio',
            'technician' => 'Ali Hassan (Field Tech)',
            'date' => '2026-09-17',
            'status' => 'completed',
            'category' => 'Fiber Deployment',
            'labor_cost' => 3500,
            'total_cost' => 13800,
            'notes' => 'Optical power reading -18.4 dBm (Optimum range). Latency to IXP 3ms.',
            'site_requirements' => '2-Core drop cable 85m, 1x Huawei AX3 Gigabit WiFi-6 Router.',
            'progress_notes' => 'Drop strung from FAT-04, fusion spliced at splice tray, certified 1 Gbps LAN.',
            'credentials' => 'PPPoE User: apex_creative_media | Pass: dp@apex#2026 | WiFi: Apex_5G',
            'invoice_generated' => 1,
            'invoice_ref' => 'INV-2026-0091'
        ],
        [
            'id' => 'job-103',
            'title' => 'Structured LAN Cabling & Rack Dressing',
            'client_name' => 'Crown Logistics Hub',
            'technician' => 'Ali Hassan & Kevin O.',
            'date' => '2026-09-18',
            'status' => 'in_progress',
            'category' => 'Structured Cabling',
            'labor_cost' => 15000,
            'total_cost' => 42500,
            'notes' => 'Cabling running across warehouse conduit. Termination scheduled for completion.',
            'site_requirements' => '24-Port Patch Panel, Giganet Cat6 LSZH Roll, 9U Data Cabinet, Brush panels.',
            'progress_notes' => 'Conduits fixed, 16 cables pulled. Termination and Fluke testing pending.',
            'credentials' => 'Switch IP: 192.168.10.2 | Console: 9600-8-N-1 | Admin: dpadmin',
            'invoice_generated' => 0,
            'invoice_ref' => null
        ]
    ];

    $jStmt = $pdo->prepare("INSERT INTO job_cards
        (id, title, client_name, technician, date, status, category, labor_cost, total_cost, notes, site_requirements, progress_notes, credentials, invoice_generated, invoice_ref)
        VALUES (:id, :title, :client_name, :technician, :date, :status, :category, :labor_cost, :total_cost, :notes, :site_requirements, :progress_notes, :credentials, :invoice_generated, :invoice_ref)
        ON DUPLICATE KEY UPDATE
        title=VALUES(title), client_name=VALUES(client_name), technician=VALUES(technician), date=VALUES(date),
        status=VALUES(status), category=VALUES(category), labor_cost=VALUES(labor_cost), total_cost=VALUES(total_cost),
        notes=VALUES(notes), site_requirements=VALUES(site_requirements), progress_notes=VALUES(progress_notes),
        credentials=VALUES(credentials), invoice_generated=VALUES(invoice_generated), invoice_ref=VALUES(invoice_ref)");

    foreach ($jobCards as $j) {
        $jStmt->execute($j);
    }

    // Seed Ledger Entries
    $ledger = [
        [
            'id' => 'tx-101',
            'date' => '2026-09-01',
            'description' => 'Monthly Fiber Subscription - Mombasa Ocean View Suites',
            'category' => 'ISP Subscription Income',
            'type' => 'income',
            'amount' => 12500,
            'payment_method' => 'M-Pesa Paybill',
            'reference' => 'QKD8923KL9',
            'entity' => 'DATA PORT Core'
        ],
        [
            'id' => 'tx-102',
            'date' => '2026-09-01',
            'description' => 'Monthly Fiber Subscription - Crown Logistics Hub',
            'category' => 'ISP Subscription Income',
            'type' => 'income',
            'amount' => 8500,
            'payment_method' => 'Bank Transfer',
            'reference' => 'FT26245892',
            'entity' => 'DATA PORT Core'
        ],
        [
            'id' => 'tx-103',
            'date' => '2026-09-03',
            'description' => 'Upstream Wholesale IP Transit & STM Bandwidth (Liquid/IXP)',
            'category' => 'Wholesale Bandwidth Transit',
            'type' => 'expense',
            'amount' => 14000,
            'payment_method' => 'Bank Wire',
            'reference' => 'LQD-TR-992',
            'entity' => 'NOC Operations'
        ],
        [
            'id' => 'tx-104',
            'date' => '2026-09-15',
            'description' => 'Project Settlement: Ocean View Suites CCTV Installation',
            'category' => 'Projects & Installations',
            'type' => 'income',
            'amount' => 165000,
            'payment_method' => 'Bank Transfer',
            'reference' => 'FT26258901',
            'entity' => 'DATA PORT Projects'
        ],
        [
            'id' => 'tx-105',
            'date' => '2026-09-16',
            'description' => 'Technician Field Allowances & Transport Logistics',
            'category' => 'Field Ops & Logistics',
            'type' => 'expense',
            'amount' => 6500,
            'payment_method' => 'M-Pesa Send Money',
            'reference' => 'QKM3321VV7',
            'entity' => 'Operations'
        ]
    ];

    $lStmt = $pdo->prepare("INSERT INTO ledger_entries
        (id, date, description, category, type, amount, payment_method, reference, entity)
        VALUES (:id, :date, :description, :category, :type, :amount, :payment_method, :reference, :entity)
        ON DUPLICATE KEY UPDATE
        date=VALUES(date), description=VALUES(description), category=VALUES(category),
        type=VALUES(type), amount=VALUES(amount), payment_method=VALUES(payment_method),
        reference=VALUES(reference), entity=VALUES(entity)");

    foreach ($ledger as $l) {
        $lStmt->execute($l);
    }

    echo json_encode([
        'success'     => true,
        'subscribers' => count($subscribers),
        'invoices'    => count($invoices),
        'jobCards'    => count($jobCards),
        'ledger'      => count($ledger),
        'message'     => 'All subscribers, invoices, job cards & ledger released & populated into MySQL database!'
    ], JSON_PRETTY_PRINT);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
