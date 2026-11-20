<?php
// =============================================================================
// DATA PORT LIMITED - Full ERP Synchronization & Dump API
// Provides full database state to Dashboard (Subscribers, Invoices, Job Cards, Ledger)
// =============================================================================

require_once __DIR__ . '/db.php';
header('Content-Type: application/json; charset=utf-8');

$pdo = getDb();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

try {
    if ($method === 'GET') {
        // Fetch full state for Dashboard initial load
        $subscribers = $pdo->query("SELECT * FROM subscribers ORDER BY created_at DESC")->fetchAll();
        $services    = $pdo->query("SELECT * FROM services WHERE active = 1 ORDER BY price ASC")->fetchAll();
        $ledger      = $pdo->query("SELECT * FROM ledger_entries ORDER BY date DESC, created_at DESC")->fetchAll();
        $jobCards    = $pdo->query("SELECT * FROM job_cards ORDER BY date DESC, created_at DESC")->fetchAll();

        // Fetch Invoices with Items
        $invStmt = $pdo->query("SELECT * FROM invoices ORDER BY created_at DESC");
        $rawInvoices = $invStmt->fetchAll();

        $invoices = [];
        $itemStmt = $pdo->prepare("SELECT * FROM invoice_items WHERE invoice_id = ? ORDER BY id ASC");
        foreach ($rawInvoices as $inv) {
            $itemStmt->execute([$inv['id']]);
            $items = $itemStmt->fetchAll();
            $inv['items'] = $items;
            $inv['invoiceNo'] = $inv['invoice_no'];
            $inv['clientName'] = $inv['client_name'];
            $inv['docType'] = $inv['doc_type'];
            $inv['issueDate'] = $inv['issue_date'];
            $inv['dueDate'] = $inv['due_date'];
            $inv['billingPeriod'] = $inv['billing_period'];
            $inv['totalPaid'] = (float)$inv['total_paid'];
            $inv['balanceDue'] = (float)$inv['balance_due'];
            $inv['subtotal'] = (float)$inv['subtotal'];
            $inv['tax'] = (float)$inv['tax'];
            $inv['labourFee'] = (float)$inv['labour_fee'];
            $inv['grandTotal'] = (float)$inv['total'];
            $inv['amount'] = (float)$inv['total'];
            $inv['depositAmount'] = (float)$inv['deposit_amount'];
            $inv['depositLabel'] = $inv['deposit_label'];
            $inv['hasPaymentPlan'] = (bool)$inv['has_payment_plan'];
            $inv['validityNote'] = $inv['validity_note'];
            $invoices[] = $inv;
        }

        echo json_encode([
            'success'     => true,
            'source'      => 'mysql',
            'subscribers' => $subscribers,
            'services'    => $services,
            'invoices'    => $invoices,
            'jobCards'    => $jobCards,
            'ledger'      => $ledger,
            'timestamp'   => date('c')
        ]);
        exit();
    } elseif ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Invalid JSON payload']);
            exit();
        }

        // 1. Sync subscribers
        if (isset($input['subscribers']) && is_array($input['subscribers'])) {
            $stmt = $pdo->prepare("INSERT INTO subscribers (id, name, company, phone, email, location, ip_address, package, speed, monthly_rate, billing_day, source, status, notes)
                VALUES (:id, :name, :company, :phone, :email, :location, :ip_address, :package, :speed, :monthly_rate, :billing_day, :source, :status, :notes)
                ON DUPLICATE KEY UPDATE
                name = VALUES(name), company = VALUES(company), phone = VALUES(phone), email = VALUES(email),
                location = VALUES(location), ip_address = VALUES(ip_address), package = VALUES(package),
                speed = VALUES(speed), monthly_rate = VALUES(monthly_rate), billing_day = VALUES(billing_day),
                source = VALUES(source), status = VALUES(status), notes = VALUES(notes)");

            foreach ($input['subscribers'] as $s) {
                $id = $s['id'] ?? ('sub-' . bin2hex(random_bytes(4)));
                $stmt->execute([
                    ':id'           => $id,
                    ':name'         => $s['name'] ?? 'Unnamed',
                    ':company'      => $s['company'] ?? null,
                    ':phone'        => $s['phone'] ?? null,
                    ':email'        => $s['email'] ?? null,
                    ':location'     => $s['location'] ?? 'Mombasa',
                    ':ip_address'   => $s['ipAddress'] ?? $s['ip_address'] ?? null,
                    ':package'      => $s['package'] ?? null,
                    ':speed'        => $s['speed'] ?? null,
                    ':monthly_rate' => $s['monthlyRate'] ?? $s['monthly_rate'] ?? $s['price'] ?? 0,
                    ':billing_day'  => $s['billingDay'] ?? $s['billing_day'] ?? 1,
                    ':source'       => $s['source'] ?? 'web',
                    ':status'       => $s['status'] ?? 'subscriber',
                    ':notes'        => $s['notes'] ?? null
                ]);
            }
        }

        // 2. Sync job cards
        if (isset($input['jobCards']) && is_array($input['jobCards'])) {
            $jStmt = $pdo->prepare("INSERT INTO job_cards 
                (id, title, client_name, technician, date, status, category, labor_cost, total_cost, notes, site_requirements, progress_notes, credentials, invoice_generated, invoice_ref)
                VALUES (:id, :title, :client_name, :technician, :date, :status, :category, :labor_cost, :total_cost, :notes, :site_requirements, :progress_notes, :credentials, :invoice_generated, :invoice_ref)
                ON DUPLICATE KEY UPDATE
                title = VALUES(title), client_name = VALUES(client_name), technician = VALUES(technician),
                date = VALUES(date), status = VALUES(status), category = VALUES(category),
                labor_cost = VALUES(labor_cost), total_cost = VALUES(total_cost), notes = VALUES(notes),
                site_requirements = VALUES(site_requirements), progress_notes = VALUES(progress_notes), credentials = VALUES(credentials),
                invoice_generated = VALUES(invoice_generated), invoice_ref = VALUES(invoice_ref)");

            foreach ($input['jobCards'] as $j) {
                $id = $j['id'] ?? ('job-' . bin2hex(random_bytes(4)));
                $jStmt->execute([
                    ':id'                => $id,
                    ':title'             => $j['title'] ?? 'Field Job',
                    ':client_name'       => $j['clientName'] ?? $j['client_name'] ?? 'Client',
                    ':technician'        => $j['technician'] ?? 'Tech',
                    ':date'              => $j['date'] ?? date('Y-m-d'),
                    ':status'            => $j['status'] ?? 'in_progress',
                    ':category'          => $j['category'] ?? 'Field Operations',
                    ':labor_cost'        => $j['laborCost'] ?? $j['labor_cost'] ?? 0,
                    ':total_cost'        => $j['totalCost'] ?? $j['total_cost'] ?? 0,
                    ':notes'             => $j['notes'] ?? null,
                    ':site_requirements' => $j['siteRequirements'] ?? $j['site_requirements'] ?? null,
                    ':progress_notes'    => $j['progressNotes'] ?? $j['progress_notes'] ?? null,
                    ':credentials'       => $j['credentials'] ?? null,
                    ':invoice_generated' => !empty($j['invoiceGenerated']) ? 1 : 0,
                    ':invoice_ref'       => $j['invoiceRef'] ?? $j['invoice_ref'] ?? null
                ]);
            }
        }

        // 3. Sync ledger entries
        if (isset($input['ledger']) && is_array($input['ledger'])) {
            $lStmt = $pdo->prepare("INSERT INTO ledger_entries 
                (id, date, description, category, type, amount, payment_method, reference, entity)
                VALUES (:id, :date, :description, :category, :type, :amount, :payment_method, :reference, :entity)
                ON DUPLICATE KEY UPDATE
                date = VALUES(date), description = VALUES(description), category = VALUES(category),
                type = VALUES(type), amount = VALUES(amount), payment_method = VALUES(payment_method),
                reference = VALUES(reference), entity = VALUES(entity)");

            foreach ($input['ledger'] as $l) {
                $id = $l['id'] ?? ('tx-' . bin2hex(random_bytes(4)));
                $lStmt->execute([
                    ':id'             => $id,
                    ':date'           => $l['date'] ?? date('Y-m-d'),
                    ':description'    => $l['description'] ?? 'Transaction',
                    ':category'       => $l['category'] ?? 'Operations',
                    ':type'           => $l['type'] ?? 'income',
                    ':amount'         => $l['amount'] ?? 0,
                    ':payment_method' => $l['paymentMethod'] ?? $l['payment_method'] ?? 'M-Pesa',
                    ':reference'      => $l['reference'] ?? null,
                    ':entity'         => $l['entity'] ?? 'DATA PORT Core'
                ]);
            }
        }

        // 4. Sync invoices
        if (isset($input['invoices']) && is_array($input['invoices'])) {
            $invStmt = $pdo->prepare("INSERT INTO invoices
                (id, invoice_no, doc_type, client_name, phone, email, location, sub_id, subtotal, tax, labour_fee, total, total_paid, balance_due, status, issue_date, due_date, billing_period, notes, validity_note, has_payment_plan, deposit_amount, deposit_label, created_at, updated_at)
                VALUES (:id, :invoice_no, :doc_type, :client_name, :phone, :email, :location, :sub_id, :subtotal, :tax, :labour_fee, :total, :total_paid, :balance_due, :status, :issue_date, :due_date, :billing_period, :notes, :validity_note, :has_payment_plan, :deposit_amount, :deposit_label, NOW(), NOW())
                ON DUPLICATE KEY UPDATE
                doc_type = VALUES(doc_type), client_name = VALUES(client_name), phone = VALUES(phone), email = VALUES(email),
                location = VALUES(location), sub_id = VALUES(sub_id), subtotal = VALUES(subtotal), tax = VALUES(tax),
                labour_fee = VALUES(labour_fee), total = VALUES(total), total_paid = VALUES(total_paid), balance_due = VALUES(balance_due),
                status = VALUES(status), issue_date = VALUES(issue_date), due_date = VALUES(due_date), billing_period = VALUES(billing_period),
                notes = VALUES(notes), validity_note = VALUES(validity_note), has_payment_plan = VALUES(has_payment_plan),
                deposit_amount = VALUES(deposit_amount), deposit_label = VALUES(deposit_label), updated_at = NOW()");

            $itDelStmt = $pdo->prepare("DELETE FROM invoice_items WHERE invoice_id = ?");
            $itInsStmt = $pdo->prepare("INSERT INTO invoice_items (id, invoice_id, service_id, title, description, qty, rate, total, created_at, updated_at)
                VALUES (:id, :invoice_id, :service_id, :title, :description, :qty, :rate, :total, NOW(), NOW())");

            foreach ($input['invoices'] as $inv) {
                $id = $inv['id'] ?? ('inv-' . bin2hex(random_bytes(4)));
                $invoiceNo = $inv['invoiceNo'] ?? ($inv['invoice_no'] ?? ('#INV-' . date('y') . '/' . rand(100, 999)));
                $subtotal = (float)($inv['subtotal'] ?? 0);
                $tax = (float)($inv['tax'] ?? 0);
                $labour = (float)($inv['labourFee'] ?? ($inv['labour_fee'] ?? 0));
                $total = (float)($inv['total'] ?? ($inv['grandTotal'] ?? ($inv['amount'] ?? ($subtotal + $tax + $labour))));
                $paid = (float)($inv['totalPaid'] ?? ($inv['total_paid'] ?? ($inv['status'] === 'paid' ? $total : 0)));
                $bal = max(0, $total - $paid);

                $invStmt->execute([
                    ':id'               => $id,
                    ':invoice_no'       => $invoiceNo,
                    ':doc_type'         => $inv['docType'] ?? ($inv['doc_type'] ?? 'Invoice'),
                    ':client_name'      => $inv['clientName'] ?? ($inv['client_name'] ?? 'Client'),
                    ':phone'            => $inv['phone'] ?? null,
                    ':email'            => $inv['email'] ?? null,
                    ':location'         => $inv['location'] ?? 'Mombasa',
                    ':sub_id'           => $inv['subId'] ?? ($inv['sub_id'] ?? null),
                    ':subtotal'         => $subtotal,
                    ':tax'              => $tax,
                    ':labour_fee'       => $labour,
                    ':total'            => $total,
                    ':total_paid'       => $paid,
                    ':balance_due'      => $bal,
                    ':status'           => $inv['status'] ?? 'unpaid',
                    ':issue_date'       => $inv['issueDate'] ?? ($inv['issue_date'] ?? date('Y-m-d')),
                    ':due_date'         => $inv['dueDate'] ?? ($inv['due_date'] ?? date('Y-m-d', strtotime('+14 days'))),
                    ':billing_period'   => $inv['billingPeriod'] ?? ($inv['billing_period'] ?? date('F Y')),
                    ':notes'            => $inv['notes'] ?? null,
                    ':validity_note'    => $inv['validityNote'] ?? ($inv['validity_note'] ?? 'Please Note: Valid for 14 days from date.'),
                    ':has_payment_plan' => !empty($inv['hasPaymentPlan']) || !empty($inv['has_payment_plan']) ? 1 : 0,
                    ':deposit_amount'   => (float)($inv['depositAmount'] ?? ($inv['deposit_amount'] ?? 0)),
                    ':deposit_label'    => $inv['depositLabel'] ?? ($inv['deposit_label'] ?? '1 ST Installment')
                ]);

                if (isset($inv['items']) && is_array($inv['items']) && count($inv['items']) > 0) {
                    $itDelStmt->execute([$id]);
                    foreach ($inv['items'] as $idx => $it) {
                        $itemId = $it['id'] ?? ('item-' . bin2hex(random_bytes(4)) . '-' . $idx);
                        $rate = (float)($it['rate'] ?? 0);
                        $qty = (string)($it['qty'] ?? '1');
                        $itTotal = (float)($it['total'] ?? ($rate * (float)$qty));
                        $itInsStmt->execute([
                            ':id'          => $itemId,
                            ':invoice_id'  => $id,
                            ':service_id'  => $it['serviceId'] ?? ($it['service_id'] ?? null),
                            ':title'       => $it['title'] ?? 'Technical Service Deliverable',
                            ':description' => $it['description'] ?? null,
                            ':qty'         => $qty,
                            ':rate'        => $rate,
                            ':total'       => $itTotal
                        ]);
                    }
                }
            }
        }

        echo json_encode(['success' => true, 'synced_at' => date('c')]);
        exit();
    } elseif ($method === 'DELETE') {
        // Universal permanent delete endpoint
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $type = $_GET['type'] ?? ($input['type'] ?? null);
        $id   = $_GET['id'] ?? ($input['id'] ?? null);

        if (!$type || !$id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Type and ID required for permanent deletion.']);
            exit();
        }

        $tableMap = [
            'subscriber' => 'subscribers',
            'jobCard'    => 'job_cards',
            'ledger'     => 'ledger_entries',
            'service'    => 'services',
            'invoice'    => 'invoices'
        ];

        if (!isset($tableMap[$type])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => "Invalid entity type: {$type}"]);
            exit();
        }

        $table = $tableMap[$type];

        if ($type === 'invoice') {
            $delItems = $pdo->prepare("DELETE FROM invoice_items WHERE invoice_id = ?");
            $delItems->execute([$id]);
        }

        $delStmt = $pdo->prepare("DELETE FROM `{$table}` WHERE `id` = ?");
        $delStmt->execute([$id]);

        echo json_encode([
            'success' => true,
            'deleted' => $id,
            'table'   => $table,
            'message' => "Record {$id} permanently deleted from database."
        ]);
        exit();
    } else {
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
