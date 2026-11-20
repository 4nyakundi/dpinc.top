<?php
// =============================================================================
// DATA PORT LIMITED - Subscribers API Handler
// MySQL Table: subscribers
// =============================================================================

require_once __DIR__ . '/db.php';
header('Content-Type: application/json; charset=utf-8');

$pdo = getDb();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

try {
    switch ($method) {
        case 'GET':
            $id = $_GET['id'] ?? null;
            $status = $_GET['status'] ?? null;

            if ($id) {
                $stmt = $pdo->prepare("SELECT * FROM subscribers WHERE id = ?");
                $stmt->execute([$id]);
                $subscriber = $stmt->fetch();
                if (!$subscriber) {
                    http_response_code(404);
                    echo json_encode(['success' => false, 'error' => 'Subscriber not found']);
                    exit();
                }
                echo json_encode(['success' => true, 'subscriber' => $subscriber]);
            } else {
                $sql = "SELECT * FROM subscribers";
                $params = [];
                if ($status) {
                    $sql .= " WHERE status = ?";
                    $params[] = $status;
                }
                $sql .= " ORDER BY created_at DESC";
                $stmt = $pdo->prepare($sql);
                $stmt->execute($params);
                $subscribers = $stmt->fetchAll();

                echo json_encode([
                    'success'     => true,
                    'count'       => count($subscribers),
                    'subscribers' => $subscribers
                ]);
            }
            break;

        case 'POST':
            $input = json_decode(file_get_contents('php://input'), true);
            if (!$input) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Invalid JSON payload']);
                exit();
            }

            // Bulk or single
            if (isset($input['subscribers']) && is_array($input['subscribers'])) {
                $saved = 0;
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
                        ':ip_address'   => $s['ip_address'] ?? $s['ipAddress'] ?? $s['ip'] ?? null,
                        ':package'      => $s['package'] ?? $s['plan'] ?? null,
                        ':speed'        => $s['speed'] ?? null,
                        ':monthly_rate' => $s['monthly_rate'] ?? $s['monthlyRate'] ?? $s['price'] ?? $s['rate'] ?? 0,
                        ':billing_day'  => $s['billing_day'] ?? $s['billingDay'] ?? 1,
                        ':source'       => $s['source'] ?? 'web',
                        ':status'       => $s['status'] ?? 'subscriber',
                        ':notes'        => $s['notes'] ?? null
                    ]);
                    $saved++;
                }
                echo json_encode(['success' => true, 'message' => "Successfully synced {$saved} subscribers"]);
                exit();
            }

            // Single insert/update
            $id = $input['id'] ?? ('sub-' . bin2hex(random_bytes(4)));
            $stmt = $pdo->prepare("INSERT INTO subscribers (id, name, company, phone, email, location, ip_address, package, speed, monthly_rate, billing_day, source, status, notes)
                VALUES (:id, :name, :company, :phone, :email, :location, :ip_address, :package, :speed, :monthly_rate, :billing_day, :source, :status, :notes)
                ON DUPLICATE KEY UPDATE
                name = VALUES(name), company = VALUES(company), phone = VALUES(phone), email = VALUES(email),
                location = VALUES(location), ip_address = VALUES(ip_address), package = VALUES(package),
                speed = VALUES(speed), monthly_rate = VALUES(monthly_rate), billing_day = VALUES(billing_day),
                source = VALUES(source), status = VALUES(status), notes = VALUES(notes)");

            $stmt->execute([
                ':id'           => $id,
                ':name'         => $input['name'] ?? 'Unnamed',
                ':company'      => $input['company'] ?? null,
                ':phone'        => $input['phone'] ?? null,
                ':email'        => $input['email'] ?? null,
                ':location'     => $input['location'] ?? 'Mombasa',
                ':ip_address'   => $input['ip_address'] ?? $input['ipAddress'] ?? $input['ip'] ?? null,
                ':package'      => $input['package'] ?? $input['plan'] ?? null,
                ':speed'        => $input['speed'] ?? null,
                ':monthly_rate' => $input['monthly_rate'] ?? $input['monthlyRate'] ?? $input['price'] ?? $input['rate'] ?? 0,
                ':billing_day'  => $input['billing_day'] ?? $input['billingDay'] ?? 1,
                ':source'       => $input['source'] ?? 'web',
                ':status'       => $input['status'] ?? 'subscriber',
                ':notes'        => $input['notes'] ?? null
            ]);

            echo json_encode(['success' => true, 'id' => $id]);
            break;

        case 'DELETE':
            $id = $_GET['id'] ?? null;
            if (!$id) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Missing subscriber ID']);
                exit();
            }

            $stmt = $pdo->prepare("DELETE FROM subscribers WHERE id = ?");
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
