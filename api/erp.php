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

        // Handle sync of subscribers batch
        if (!empty($input['subscribers']) && is_array($input['subscribers'])) {
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
                    ':ip_address'   => $s['ip_address'] ?? $s['ip'] ?? null,
                    ':package'      => $s['package'] ?? $s['plan'] ?? null,
                    ':speed'        => $s['speed'] ?? null,
                    ':monthly_rate' => $s['monthly_rate'] ?? $s['rate'] ?? 0,
                    ':billing_day'  => $s['billing_day'] ?? 1,
                    ':source'       => $s['source'] ?? 'web',
                    ':status'       => $s['status'] ?? 'subscriber',
                    ':notes'        => $s['notes'] ?? null
                ]);
            }
        }

        echo json_encode(['success' => true, 'synced_at' => date('c')]);
        exit();
    } else {
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
