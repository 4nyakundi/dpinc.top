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
