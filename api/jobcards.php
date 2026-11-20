<?php
// =============================================================================
// DATA PORT LIMITED - Job Cards API Handler
// MySQL Table: job_cards
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
                $stmt = $pdo->prepare("SELECT * FROM job_cards WHERE id = ?");
                $stmt->execute([$id]);
                $job = $stmt->fetch();
                if (!$job) {
                    http_response_code(404);
                    echo json_encode(['success' => false, 'error' => 'Job Card not found']);
                    exit();
                }
                echo json_encode(['success' => true, 'jobCard' => $job]);
            } else {
                $stmt = $pdo->query("SELECT * FROM job_cards ORDER BY date DESC, created_at DESC");
                $jobs = $stmt->fetchAll();
                echo json_encode(['success' => true, 'count' => count($jobs), 'jobCards' => $jobs]);
            }
            break;

        case 'POST':
            $input = json_decode(file_get_contents('php://input'), true);
            if (!$input) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Invalid JSON payload']);
                exit();
            }

            $id = $input['id'] ?? ('job-' . bin2hex(random_bytes(4)));
            $stmt = $pdo->prepare("INSERT INTO job_cards 
                (id, title, client_name, technician, date, status, category, labor_cost, total_cost, notes, invoice_generated, invoice_ref)
                VALUES (:id, :title, :client_name, :technician, :date, :status, :category, :labor_cost, :total_cost, :notes, :invoice_generated, :invoice_ref)
                ON DUPLICATE KEY UPDATE
                title = VALUES(title), client_name = VALUES(client_name), technician = VALUES(technician),
                date = VALUES(date), status = VALUES(status), category = VALUES(category),
                labor_cost = VALUES(labor_cost), total_cost = VALUES(total_cost), notes = VALUES(notes),
                invoice_generated = VALUES(invoice_generated), invoice_ref = VALUES(invoice_ref)");

            $stmt->execute([
                ':id'                => $id,
                ':title'             => $input['title'] ?? 'Field Job',
                ':client_name'       => $input['clientName'] ?? $input['client_name'] ?? 'Client',
                ':technician'        => $input['technician'] ?? 'Lead Tech',
                ':date'              => $input['date'] ?? date('Y-m-d'),
                ':status'            => $input['status'] ?? 'in_progress',
                ':category'          => $input['category'] ?? 'Field Operations',
                ':labor_cost'        => $input['laborCost'] ?? $input['labor_cost'] ?? 0,
                ':total_cost'        => $input['totalCost'] ?? $input['total_cost'] ?? 0,
                ':notes'             => $input['notes'] ?? null,
                ':invoice_generated' => !empty($input['invoiceGenerated']) ? 1 : 0,
                ':invoice_ref'       => $input['invoiceRef'] ?? $input['invoice_ref'] ?? null
            ]);

            echo json_encode(['success' => true, 'id' => $id]);
            break;

        case 'DELETE':
            $raw = file_get_contents('php://input');
            $data = json_decode($raw, true) ?? [];
            $id = $_GET['id'] ?? ($data['id'] ?? null);

            if (!$id) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Job Card ID is required for deletion.']);
                exit();
            }

            $stmt = $pdo->prepare("DELETE FROM job_cards WHERE id = ?");
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
