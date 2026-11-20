<?php
// =============================================================================
// DATA PORT LIMITED - Portfolio & Digital Projects API for XAMPP MySQL
// Database: dpinc.top_db (Table: portfolio_projects)
// =============================================================================

require_once __DIR__ . '/db.php';
header('Content-Type: application/json; charset=utf-8');

$pdo = getDb();

// 1. Ensure Table Exists
try {
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `portfolio_projects` (
            `id` VARCHAR(64) PRIMARY KEY,
            `name` VARCHAR(255) NOT NULL,
            `repo` VARCHAR(255) DEFAULT '',
            `repo_url` VARCHAR(500) DEFAULT '',
            `live_url` VARCHAR(500) DEFAULT '',
            `local_url` VARCHAR(500) DEFAULT '',
            `logo` VARCHAR(500) DEFAULT '',
            `hero` VARCHAR(500) DEFAULT '',
            `category` VARCHAR(64) DEFAULT 'custom',
            `category_label` VARCHAR(128) DEFAULT 'Web Development',
            `badge` VARCHAR(64) DEFAULT 'Live Project',
            `badge_color` VARCHAR(32) DEFAULT '#10b981',
            `desc_text` TEXT,
            `tags` TEXT,
            `features` TEXT,
            `is_visible` TINYINT(1) DEFAULT 1,
            `is_featured` TINYINT(1) DEFAULT 1,
            `display_order` INT DEFAULT 0,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");

    // Check if table is empty, auto-seed if needed
    $stmtCount = $pdo->query("SELECT COUNT(*) FROM `portfolio_projects`");
    $count = (int)$stmtCount->fetchColumn();

    if ($count === 0) {
        $seedFile = __DIR__ . '/../scratch/seed_projects.json';
        if (file_exists($seedFile)) {
            $seeds = json_decode(file_get_contents($seedFile), true);
            if (is_array($seeds)) {
                $insertStmt = $pdo->prepare("
                    INSERT INTO `portfolio_projects` 
                    (`id`, `name`, `repo`, `repo_url`, `live_url`, `local_url`, `logo`, `hero`, `category`, `category_label`, `badge`, `badge_color`, `desc_text`, `tags`, `features`, `is_visible`, `display_order`)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
                ");
                foreach ($seeds as $idx => $p) {
                    $insertStmt->execute([
                        $p['id'] ?? ('proj-' . uniqid()),
                        $p['name'] ?? 'Untitled Project',
                        $p['repo'] ?? '',
                        $p['repoUrl'] ?? $p['repo_url'] ?? '',
                        $p['liveUrl'] ?? $p['live_url'] ?? '',
                        $p['localUrl'] ?? $p['local_url'] ?? '',
                        $p['logo'] ?? '',
                        $p['hero'] ?? '',
                        $p['category'] ?? 'custom',
                        $p['categoryLabel'] ?? $p['category_label'] ?? 'Web Development',
                        $p['badge'] ?? 'Active Project',
                        $p['badgeColor'] ?? $p['badge_color'] ?? '#10b981',
                        $p['desc'] ?? $p['desc_text'] ?? '',
                        json_encode($p['tags'] ?? []),
                        json_encode($p['features'] ?? []),
                        $idx
                    ]);
                }
            }
        }
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Database schema initialization failed: ' . $e->getMessage()]);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

try {
    switch ($method) {
        case 'GET':
            $visibleOnly = isset($_GET['visible_only']) && $_GET['visible_only'] === '1';
            $sql = "SELECT * FROM `portfolio_projects`";
            if ($visibleOnly) {
                $sql .= " WHERE `is_visible` = 1";
            }
            $sql .= " ORDER BY `display_order` ASC, `created_at` ASC";

            $stmt = $pdo->query($sql);
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Format for frontend
            $projects = array_map(function($r) {
                return [
                    'id' => $r['id'],
                    'name' => $r['name'],
                    'repo' => $r['repo'],
                    'repoUrl' => $r['repo_url'],
                    'liveUrl' => $r['live_url'],
                    'localUrl' => $r['local_url'],
                    'logo' => $r['logo'],
                    'hero' => $r['hero'],
                    'category' => $r['category'],
                    'categoryLabel' => $r['category_label'],
                    'badge' => $r['badge'],
                    'badgeColor' => $r['badge_color'],
                    'desc' => $r['desc_text'],
                    'tags' => json_decode($r['tags'] ?: '[]', true) ?: [],
                    'features' => json_decode($r['features'] ?: '[]', true) ?: [],
                    'isVisible' => (bool)(int)$r['is_visible'],
                    'isFeatured' => (bool)(int)$r['is_featured'],
                    'displayOrder' => (int)$r['display_order']
                ];
            }, $rows);

            echo json_encode([
                'success' => true,
                'count' => count($projects),
                'projects' => $projects
            ]);
            break;

        case 'POST':
            $input = json_decode(file_get_contents('php://input'), true);
            if (!$input) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Invalid JSON input']);
                exit();
            }

            $id = !empty($input['id']) ? trim($input['id']) : ('proj-' . substr(md5(uniqid(mt_rand(), true)), 0, 8));
            $name = trim($input['name'] ?? 'Untitled Project');
            $repo = trim($input['repo'] ?? '');
            $repoUrl = trim($input['repoUrl'] ?? $input['repo_url'] ?? '');
            $liveUrl = trim($input['liveUrl'] ?? $input['live_url'] ?? '');
            $localUrl = trim($input['localUrl'] ?? $input['local_url'] ?? ($liveUrl ?: ''));
            $logo = trim($input['logo'] ?? 'public/dp-logo.png');
            $hero = trim($input['hero'] ?? 'public/projects/mombasa-mall-hero.jpg');
            $category = trim($input['category'] ?? 'custom');
            $categoryLabel = trim($input['categoryLabel'] ?? $input['category_label'] ?? 'Web Development');
            $badge = trim($input['badge'] ?? 'Active Project');
            $badgeColor = trim($input['badgeColor'] ?? $input['badge_color'] ?? '#10b981');
            $descText = trim($input['desc'] ?? $input['desc_text'] ?? '');
            $tags = is_array($input['tags'] ?? null) ? json_encode($input['tags']) : json_encode([]);
            $features = is_array($input['features'] ?? null) ? json_encode($input['features']) : json_encode([]);
            $isVisible = isset($input['isVisible']) ? ($input['isVisible'] ? 1 : 0) : 1;
            $displayOrder = isset($input['displayOrder']) ? (int)$input['displayOrder'] : 0;

            // Check if exists
            $checkStmt = $pdo->prepare("SELECT id FROM `portfolio_projects` WHERE id = ?");
            $checkStmt->execute([$id]);
            $exists = $checkStmt->fetch();

            if ($exists) {
                // Update
                $updateStmt = $pdo->prepare("
                    UPDATE `portfolio_projects` SET
                        `name` = ?,
                        `repo` = ?,
                        `repo_url` = ?,
                        `live_url` = ?,
                        `local_url` = ?,
                        `logo` = ?,
                        `hero` = ?,
                        `category` = ?,
                        `category_label` = ?,
                        `badge` = ?,
                        `badge_color` = ?,
                        `desc_text` = ?,
                        `tags` = ?,
                        `features` = ?,
                        `is_visible` = ?,
                        `display_order` = ?
                    WHERE `id` = ?
                ");
                $updateStmt->execute([
                    $name, $repo, $repoUrl, $liveUrl, $localUrl, $logo, $hero,
                    $category, $categoryLabel, $badge, $badgeColor, $descText,
                    $tags, $features, $isVisible, $displayOrder, $id
                ]);
            } else {
                // Insert
                $insertStmt = $pdo->prepare("
                    INSERT INTO `portfolio_projects`
                    (`id`, `name`, `repo`, `repo_url`, `live_url`, `local_url`, `logo`, `hero`, `category`, `category_label`, `badge`, `badge_color`, `desc_text`, `tags`, `features`, `is_visible`, `display_order`)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ");
                $insertStmt->execute([
                    $id, $name, $repo, $repoUrl, $liveUrl, $localUrl, $logo, $hero,
                    $category, $categoryLabel, $badge, $badgeColor, $descText,
                    $tags, $features, $isVisible, $displayOrder
                ]);
            }

            echo json_encode([
                'success' => true,
                'message' => 'Project saved successfully',
                'id' => $id
            ]);
            break;

        case 'PATCH':
            $input = json_decode(file_get_contents('php://input'), true);
            $id = $input['id'] ?? $_GET['id'] ?? null;
            if (!$id) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Missing project ID']);
                exit();
            }

            $fields = [];
            $values = [];

            if (isset($input['isVisible'])) {
                $fields[] = "`is_visible` = ?";
                $values[] = $input['isVisible'] ? 1 : 0;
            }
            if (isset($input['logo'])) {
                $fields[] = "`logo` = ?";
                $values[] = trim($input['logo']);
            }
            if (isset($input['hero'])) {
                $fields[] = "`hero` = ?";
                $values[] = trim($input['hero']);
            }
            if (isset($input['liveUrl'])) {
                $fields[] = "`live_url` = ?";
                $values[] = trim($input['liveUrl']);
            }
            if (isset($input['localUrl'])) {
                $fields[] = "`local_url` = ?";
                $values[] = trim($input['localUrl']);
            }

            if (empty($fields)) {
                echo json_encode(['success' => true, 'message' => 'No fields updated']);
                exit();
            }

            $values[] = $id;
            $patchStmt = $pdo->prepare("UPDATE `portfolio_projects` SET " . implode(", ", $fields) . " WHERE `id` = ?");
            $patchStmt->execute($values);

            echo json_encode(['success' => true, 'message' => 'Project updated successfully']);
            break;

        case 'DELETE':
            $id = $_GET['id'] ?? null;
            if (!$id) {
                $input = json_decode(file_get_contents('php://input'), true);
                $id = $input['id'] ?? null;
            }
            if (!$id) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Missing project ID for deletion']);
                exit();
            }

            $delStmt = $pdo->prepare("DELETE FROM `portfolio_projects` WHERE `id` = ?");
            $delStmt->execute([$id]);

            echo json_encode(['success' => true, 'message' => 'Project deleted successfully']);
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
