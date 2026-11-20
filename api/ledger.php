<?php
// =============================================================================
// DATA PORT LIMITED - Ledger API Handler
// MySQL Table: ledger_entries
// =============================================================================

require_once __DIR__ . '/db.php';
header('Content-Type: application/json; charset=utf-8');

$pdo = getDb();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

try {
    switch ($method) {
        case 'GET':
            $id = $_GET['id'] ?? null;
            if ($id) {
                $stmt = $pdo->prepare("SELECT * FROM ledger_entries WHERE id = ?");
                $stmt->execute([$id]);
                $entry = $stmt->fetch();
                if (!$entry) {
                    http_response_code(404);
                    echo json_encode(['success' => false, 'error' => 'Ledger entry not found']);
                    exit();
                }
                echo json_encode(['success' => true, 'entry' => $entry]);
            } else {
                $stmt = $pdo->query("SELECT * FROM ledger_entries ORDER BY date DESC, created_at DESC");
                $entries = $stmt->fetchAll();
                echo json_encode(['success' => true, 'count' => count($entries), 'ledger' => $entries]);
            }
            break;

        case 'POST':
            $input = json_decode(file_get_contents('php://input'), true);
            if (!$input) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Invalid JSON payload']);
                exit();
            }

            $id = $input['id'] ?? ('tx-' . bin2hex(random_bytes(4)));
            $stmt = $pdo->prepare("INSERT INTO ledger_entries 
                (id, date, description, category, type, amount, payment_method, reference, entity)
                VALUES (:id, :date, :description, :category, :type, :amount, :payment_method, :reference, :entity)
                ON DUPLICATE KEY UPDATE
                date = VALUES(date), description = VALUES(description), category = VALUES(category),
                type = VALUES(type), amount = VALUES(amount), payment_method = VALUES(payment_method),
                reference = VALUES(reference), entity = VALUES(entity)");

            $stmt->execute([
                ':id'             => $id,
                ':date'           => $input['date'] ?? date('Y-m-d'),
                ':description'    => $input['description'] ?? 'Financial transaction',
                ':category'       => $input['category'] ?? 'General Operations',
                ':type'           => $input['type'] ?? 'income',
                ':amount'         => $input['amount'] ?? 0,
                ':payment_method' => $input['paymentMethod'] ?? $input['payment_method'] ?? 'M-Pesa Paybill',
                ':reference'      => $input['reference'] ?? null,
                ':entity'         => $input['entity'] ?? 'DATA PORT Core'
            ]);

            echo json_encode(['success' => true, 'id' => $id]);
            break;

        case 'DELETE':
            $raw = file_get_contents('php://input');
            $data = json_decode($raw, true) ?? [];
            $id = $_GET['id'] ?? ($data['id'] ?? null);

            if (!$id) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Ledger entry ID is required for deletion.']);
                exit();
            }

            $stmt = $pdo->prepare("DELETE FROM ledger_entries WHERE id = ?");
            $stmt->execute([$id]);

            echo json_encode(['success' => true, 'deleted' => $id]);
            break;

        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'error' => 'Method not allowed']);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
