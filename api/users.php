<?php
// =============================================================================
// DATA PORT LIMITED - Authorized Users & Access Control API
// Enforces Google Gmail Authentication & Role-Based Permissions
// =============================================================================

require_once __DIR__ . '/db.php';
header('Content-Type: application/json; charset=utf-8');

$pdo = getDb();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

// Read JSON input if any
$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true) ?? [];

try {
    // -------------------------------------------------------------------------
    // 1. GET Requests: List all users OR check authorization for a specific email
    // -------------------------------------------------------------------------
    if ($method === 'GET') {
        // A. Check specific email authorization (Used during Google Sign-In)
        if (isset($_GET['check_email'])) {
            $checkEmail = strtolower(trim($_GET['check_email']));

            if (empty($checkEmail)) {
                echo json_encode(['success' => false, 'authorized' => false, 'error' => 'Email parameter is required.']);
                exit();
            }

            $stmt = $pdo->prepare("SELECT * FROM authorized_users WHERE LOWER(email) = ?");
            $stmt->execute([$checkEmail]);
            $user = $stmt->fetch();

            if ($user && $user['status'] === 'active') {
                if (empty($user['can_login_google'])) {
                    echo json_encode([
                        'success'    => true,
                        'authorized' => false,
                        'message'    => 'Google sign-in is disabled for this user. Please contact an administrator.'
                    ]);
                    exit();
                }

                // Update last login timestamp
                $upd = $pdo->prepare("UPDATE authorized_users SET last_login_at = NOW() WHERE id = ?");
                $upd->execute([$user['id']]);

                echo json_encode([
                    'success'    => true,
                    'authorized' => true,
                    'user'       => [
                        'id'                  => $user['id'],
                        'name'                => $user['name'],
                        'email'               => $user['email'],
                        'role'                => $user['role'],
                        'status'              => $user['status'],
                        'can_access_invoices' => (bool)$user['can_access_invoices'],
                        'can_access_subscribers' => (bool)$user['can_access_subscribers'],
                        'can_access_ledger'   => (bool)$user['can_access_ledger'],
                        'can_access_vault'    => (bool)$user['can_access_vault'],
                        'can_manage_users'    => (bool)$user['can_manage_users']
                    ]
                ]);
                exit();
            } else {
                echo json_encode([
                    'success'    => true,
                    'authorized' => false,
                    'message'    => "Access Denied: The account ({$checkEmail}) has not been granted permission to access DATA PORT NOC."
                ]);
                exit();
            }
        }

        // B. Fetch all authorized users list
        $stmt = $pdo->query("SELECT id, email, name, role, status, can_login_google, can_access_invoices, can_access_subscribers, can_access_ledger, can_access_vault, can_manage_users, notes, avatar_url, last_login_at, created_at, updated_at FROM authorized_users ORDER BY created_at ASC");
        $users = $stmt->fetchAll();

        echo json_encode([
            'success'   => true,
            'users'     => $users,
            'count'     => count($users),
            'timestamp' => date('c')
        ]);
        exit();
    }

    // -------------------------------------------------------------------------
    // 2. POST / PUT Requests: Create or Update Authorized User
    // -------------------------------------------------------------------------
    if ($method === 'POST') {
        $action = $data['action'] ?? ($_POST['action'] ?? 'save');

        // A. Delete / Revoke User
        if ($action === 'delete') {
            $id = $data['id'] ?? ($_POST['id'] ?? null);
            if (!$id) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'User ID is required.']);
                exit();
            }

            // Prevent deleting root admin
            $check = $pdo->prepare("SELECT role, email FROM authorized_users WHERE id = ?");
            $check->execute([$id]);
            $target = $check->fetch();
            if ($target && $target['id'] === 'usr-root-owner') {
                http_response_code(403);
                echo json_encode(['success' => false, 'error' => 'Cannot delete primary root owner account.']);
                exit();
            }

            $delStmt = $pdo->prepare("DELETE FROM authorized_users WHERE id = ?");
            $delStmt->execute([$id]);

            echo json_encode(['success' => true, 'message' => 'User authorization revoked and deleted successfully.']);
            exit();
        }

        // B. Toggle Status (Active / Suspended)
        if ($action === 'toggle_status') {
            $id = $data['id'] ?? null;
            $newStatus = $data['status'] ?? 'active';
            if (!$id || !in_array($newStatus, ['active', 'suspended', 'revoked'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Invalid parameters.']);
                exit();
            }

            $upd = $pdo->prepare("UPDATE authorized_users SET status = ?, updated_at = NOW() WHERE id = ?");
            $upd->execute([$newStatus, $id]);
            echo json_encode(['success' => true, 'message' => "User status updated to {$newStatus}."]);
            exit();
        }

        // C. Create or Edit Authorized User
        $email = strtolower(trim($data['email'] ?? ''));
        $name = trim($data['name'] ?? '');
        $role = trim($data['role'] ?? 'noc_engineer');
        $status = trim($data['status'] ?? 'active');
        $canGoogle = isset($data['can_login_google']) ? (int)$data['can_login_google'] : 1;
        $canInv = isset($data['can_access_invoices']) ? (int)$data['can_access_invoices'] : 1;
        $canSub = isset($data['can_access_subscribers']) ? (int)$data['can_access_subscribers'] : 1;
        $canLedger = isset($data['can_access_ledger']) ? (int)$data['can_access_ledger'] : 1;
        $canVault = isset($data['can_access_vault']) ? (int)$data['can_access_vault'] : 0;
        $canManageUsers = isset($data['can_manage_users']) ? (int)$data['can_manage_users'] : 0;
        $notes = trim($data['notes'] ?? '');

        if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'A valid email address is required.']);
            exit();
        }

        if (empty($name)) {
            $parts = explode('@', $email);
            $name = ucwords(str_replace(['.', '_', '-'], ' ', $parts[0]));
        }

        $id = $data['id'] ?? ('usr-' . bin2hex(random_bytes(4)));

        $upsertStmt = $pdo->prepare("INSERT INTO authorized_users 
            (id, email, name, role, status, can_login_google, can_access_invoices, can_access_subscribers, can_access_ledger, can_access_vault, can_manage_users, notes, created_at, updated_at)
            VALUES (:id, :email, :name, :role, :status, :can_google, :can_inv, :can_sub, :can_ledger, :can_vault, :can_manage_users, :notes, NOW(), NOW())
            ON DUPLICATE KEY UPDATE
            name = VALUES(name), role = VALUES(role), status = VALUES(status), can_login_google = VALUES(can_login_google),
            can_access_invoices = VALUES(can_access_invoices), can_access_subscribers = VALUES(can_access_subscribers),
            can_access_ledger = VALUES(can_access_ledger), can_access_vault = VALUES(can_access_vault),
            can_manage_users = VALUES(can_manage_users), notes = VALUES(notes), updated_at = NOW()");

        $upsertStmt->execute([
            ':id'               => $id,
            ':email'            => $email,
            ':name'             => $name,
            ':role'             => $role,
            ':status'           => $status,
            ':can_google'       => $canGoogle,
            ':can_inv'          => $canInv,
            ':can_sub'          => $canSub,
            ':can_ledger'       => $canLedger,
            ':can_vault'        => $canVault,
            ':can_manage_users' => $canManageUsers,
            ':notes'            => $notes
        ]);

        echo json_encode([
            'success' => true,
            'message' => "User {$email} successfully authorized for DATA PORT NOC.",
            'id'      => $id,
            'email'   => $email
        ]);
        exit();
    }

    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed.']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
