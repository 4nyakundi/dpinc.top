<?php
// =============================================================================
// DATA PORT LIMITED - Services & Tariffs CRUD API for XAMPP MySQL
// Database: dpinc.top_db (Table: services)
// =============================================================================

require_once __DIR__ . '/db.php';
header('Content-Type: application/json; charset=utf-8');

$pdo = getDb();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

try {
    switch ($method) {
        case 'GET':
            $category = $_GET['category'] ?? null;
            $search = $_GET['search'] ?? null;

            $sql = "SELECT * FROM `services` WHERE 1=1";
            $params = [];

            if ($category && $category !== 'all') {
                $sql .= " AND `category` = :category";
                $params['category'] = $category;
            }

            if ($search) {
                $sql .= " AND (`name` LIKE :search OR `description` LIKE :search OR `code` LIKE :search)";
                $params['search'] = "%{$search}%";
            }

            $sql .= " ORDER BY `category` ASC, `price` ASC";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            $services = $stmt->fetchAll();

            // Cast numeric/boolean fields
            foreach ($services as &$s) {
                $s['price'] = (float)$s['price'];
                $s['active'] = (bool)$s['active'];
            }

            echo json_encode([
                'success' => true,
                'count'   => count($services),
                'services'=> $services
            ]);
            break;

        case 'POST':
            $raw = file_get_contents('php://input');
            $data = json_decode($raw, true) ?? $_POST;

            $name = trim($data['name'] ?? '');
            if (!$name) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Service name is required.']);
                exit();
            }

            $id = $data['id'] ?? ('srv-' . substr(uniqid(), -8));
            $code = !empty($data['code']) ? trim($data['code']) : ('SRV-' . strtoupper(substr(uniqid(), -6)));
            $category = !empty($data['category']) ? trim($data['category']) : 'Essentials Packages';
            $description = $data['description'] ?? null;
            $unit = !empty($data['unit']) ? trim($data['unit']) : 'One-Off Investment';
            $price = isset($data['price']) ? (float)$data['price'] : 0.00;
            $active = isset($data['active']) ? ($data['active'] ? 1 : 0) : 1;

            // Check if service code or id already exists -> upsert
            $checkStmt = $pdo->prepare("SELECT id FROM `services` WHERE id = :id OR code = :code LIMIT 1");
            $checkStmt->execute(['id' => $id, 'code' => $code]);
            $existing = $checkStmt->fetch();

            if ($existing) {
                $updateStmt = $pdo->prepare("
                    UPDATE `services` 
                    SET `name` = :name, `category` = :category, `description` = :description,
                        `unit` = :unit, `price` = :price, `active` = :active, `updated_at` = NOW()
                    WHERE `id` = :id
                ");
                $updateStmt->execute([
                    'name'        => $name,
                    'category'    => $category,
                    'description' => $description,
                    'unit'        => $unit,
                    'price'       => $price,
                    'active'      => $active,
                    'id'          => $existing['id']
                ]);
                $serviceId = $existing['id'];
            } else {
                $insertStmt = $pdo->prepare("
                    INSERT INTO `services` (`id`, `code`, `name`, `category`, `description`, `unit`, `price`, `active`, `created_at`, `updated_at`)
                    VALUES (:id, :code, :name, :category, :description, :unit, :price, :active, NOW(), NOW())
                ");
                $insertStmt->execute([
                    'id'          => $id,
                    'code'        => $code,
                    'name'        => $name,
                    'category'    => $category,
                    'description' => $description,
                    'unit'        => $unit,
                    'price'       => $price,
                    'active'      => $active
                ]);
                $serviceId = $id;
            }

            $fetchStmt = $pdo->prepare("SELECT * FROM `services` WHERE id = :id");
            $fetchStmt->execute(['id' => $serviceId]);
            $saved = $fetchStmt->fetch();
            if ($saved) {
                $saved['price'] = (float)$saved['price'];
                $saved['active'] = (bool)$saved['active'];
            }

            echo json_encode([
                'success' => true,
                'message' => 'Service saved successfully.',
                'service' => $saved
            ]);
            break;

        case 'PUT':
        case 'PATCH':
            $raw = file_get_contents('php://input');
            $data = json_decode($raw, true) ?? [];
            $id = $_GET['id'] ?? ($data['id'] ?? null);

            if (!$id) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Service ID is required for update.']);
                exit();
            }

            $fields = [];
            $params = ['id' => $id];

            if (isset($data['name'])) {
                $fields[] = "`name` = :name";
                $params['name'] = trim($data['name']);
            }
            if (isset($data['code'])) {
                $fields[] = "`code` = :code";
                $params['code'] = trim($data['code']);
            }
            if (isset($data['category'])) {
                $fields[] = "`category` = :category";
                $params['category'] = trim($data['category']);
            }
            if (isset($data['description'])) {
                $fields[] = "`description` = :description";
                $params['description'] = $data['description'];
            }
            if (isset($data['unit'])) {
                $fields[] = "`unit` = :unit";
                $params['unit'] = trim($data['unit']);
            }
            if (isset($data['price'])) {
                $fields[] = "`price` = :price";
                $params['price'] = (float)$data['price'];
            }
            if (isset($data['active'])) {
                $fields[] = "`active` = :active";
                $params['active'] = $data['active'] ? 1 : 0;
            }

            if (empty($fields)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'No update fields provided.']);
                exit();
            }

            $fields[] = "`updated_at` = NOW()";
            $sql = "UPDATE `services` SET " . implode(", ", $fields) . " WHERE `id` = :id";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);

            $fetchStmt = $pdo->prepare("SELECT * FROM `services` WHERE id = :id");
            $fetchStmt->execute(['id' => $id]);
            $updated = $fetchStmt->fetch();
            if ($updated) {
                $updated['price'] = (float)$updated['price'];
                $updated['active'] = (bool)$updated['active'];
            }

            echo json_encode([
                'success' => true,
                'message' => 'Service updated successfully.',
                'service' => $updated
            ]);
            break;

        case 'DELETE':
            $raw = file_get_contents('php://input');
            $data = json_decode($raw, true) ?? [];
            $id = $_GET['id'] ?? ($data['id'] ?? null);

            if (!$id) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Service ID is required for deletion.']);
                exit();
            }

            $stmt = $pdo->prepare("DELETE FROM `services` WHERE `id` = :id");
            $stmt->execute(['id' => $id]);

            echo json_encode([
                'success' => true,
                'message' => "Service {$id} deleted successfully."
            ]);
            break;

        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'error' => 'Method Not Allowed']);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error'   => 'Server Error: ' . $e->getMessage()
    ]);
}
