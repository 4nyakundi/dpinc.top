<?php
// =============================================================================
// DATA PORT LIMITED - Database Health & Table Counts Diagnostic
// Database: dpinc.top_db
// =============================================================================

require_once __DIR__ . '/db.php';
header('Content-Type: application/json; charset=utf-8');

$pdo = getDb();

try {
    $tables = [
        'services',
        'invoices',
        'invoice_items',
        'subscribers',
        'job_cards',
        'ledger_entries',
        'admins'
    ];

    $counts = [];
    foreach ($tables as $tbl) {
        try {
            $stmt = $pdo->query("SELECT COUNT(*) FROM `{$tbl}`");
            $counts[$tbl] = (int)$stmt->fetchColumn();
        } catch (Exception $e) {
            $counts[$tbl] = 0;
        }
    }

    echo json_encode([
        'success'  => true,
        'database' => 'dpinc.top_db',
        'host'     => '127.0.0.1:3306',
        'status'   => 'connected',
        'engine'   => 'MariaDB / MySQL (XAMPP)',
        'counts'   => $counts,
        'timestamp'=> date('c')
    ], JSON_PRETTY_PRINT);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error'   => $e->getMessage()
    ]);
}
