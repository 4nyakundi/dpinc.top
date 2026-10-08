<?php
// =============================================================================
// DATA PORT LIMITED - Invoices & Itemized Line Items CRUD API for XAMPP MySQL
// Database: dpinc.top_db (Tables: invoices, invoice_items)
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
                $stmt = $pdo->prepare("SELECT * FROM `invoices` WHERE `id` = :id LIMIT 1");
                $stmt->execute(['id' => $id]);
                $inv = $stmt->fetch();

                if (!$inv) {
                    http_response_code(404);
                    echo json_encode(['success' => false, 'error' => 'Invoice not found']);
                    exit();
                }

                // Fetch line items
                $itemsStmt = $pdo->prepare("SELECT * FROM `invoice_items` WHERE `invoice_id` = :inv_id ORDER BY id ASC");
                $itemsStmt->execute(['inv_id' => $inv['id']]);
                $inv['items'] = $itemsStmt->fetchAll();

                // Format numbers
                $inv['subtotal'] = (float)($inv['subtotal'] ?? 0);
                $inv['tax'] = (float)($inv['tax'] ?? 0);
                $inv['labour_fee'] = (float)($inv['labour_fee'] ?? 0);
                $inv['total'] = (float)($inv['total'] ?? 0);
                $inv['amount'] = $inv['total'];
                $inv['total_paid'] = (float)($inv['total_paid'] ?? 0);
                $inv['balance_due'] = (float)($inv['balance_due'] ?? 0);
                $inv['deposit_amount'] = (float)($inv['deposit_amount'] ?? 0);
                $inv['has_payment_plan'] = (bool)($inv['has_payment_plan'] ?? 0);

                foreach ($inv['items'] as &$it) {
                    $it['rate'] = (float)($it['rate'] ?? 0);
                    $it['total'] = (float)($it['total'] ?? 0);
                }

                echo json_encode(['success' => true, 'invoice' => $inv]);
                exit();
            }

            // Fetch all invoices
            $sql = "SELECT * FROM `invoices` WHERE 1=1";
            $params = [];
            if ($status && $status !== 'all') {
                $sql .= " AND `status` = :status";
                $params['status'] = $status;
            }
            $sql .= " ORDER BY `created_at` DESC";

            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            $invoices = $stmt->fetchAll();

            // Fetch all items grouped by invoice_id
            $itemsStmt = $pdo->query("SELECT * FROM `invoice_items` ORDER BY id ASC");
            $allItems = $itemsStmt->fetchAll();

            $itemsByInvoice = [];
            foreach ($allItems as $it) {
                $it['rate'] = (float)($it['rate'] ?? 0);
                $it['total'] = (float)($it['total'] ?? 0);
                $itemsByInvoice[$it['invoice_id']][] = $it;
            }

            foreach ($invoices as &$inv) {
                $inv['items'] = $itemsByInvoice[$inv['id']] ?? [];
                $inv['subtotal'] = (float)($inv['subtotal'] ?? 0);
                $inv['tax'] = (float)($inv['tax'] ?? 0);
                $inv['labour_fee'] = (float)($inv['labour_fee'] ?? 0);
                $inv['total'] = (float)($inv['total'] ?? 0);
                $inv['amount'] = $inv['total'];
                $inv['total_paid'] = (float)($inv['total_paid'] ?? 0);
                $inv['balance_due'] = (float)($inv['balance_due'] ?? 0);
                $inv['deposit_amount'] = (float)($inv['deposit_amount'] ?? 0);
                $inv['has_payment_plan'] = (bool)($inv['has_payment_plan'] ?? 0);
                $inv['clientName'] = $inv['client_name'] ?? '';
                $inv['invoiceNo'] = $inv['invoice_no'] ?? '';
                $inv['docType'] = $inv['doc_type'] ?? 'Invoice';
                $inv['issueDate'] = $inv['issue_date'] ?? '';
                $inv['dueDate'] = $inv['due_date'] ?? '';
                $inv['billingPeriod'] = $inv['billing_period'] ?? '';
                $inv['validityNote'] = $inv['validity_note'] ?? '';
                $inv['depositAmount'] = $inv['deposit_amount'];
                $inv['depositLabel'] = $inv['deposit_label'] ?? '1 ST Installment';
                $inv['labourFee'] = $inv['labour_fee'];
            }

            echo json_encode([
                'success'  => true,
                'count'    => count($invoices),
                'invoices' => $invoices
            ]);
            break;

        case 'POST':
            $raw = file_get_contents('php://input');
            $data = json_decode($raw, true) ?? $_POST;

            $clientName = trim($data['clientName'] ?? ($data['client_name'] ?? ''));
            if (!$clientName) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Client name is required.']);
                exit();
            }

            $id = $data['id'] ?? ('inv-' . substr(uniqid(), -8));
            $invoiceNo = trim($data['invoiceNo'] ?? ($data['invoice_no'] ?? ('#INV-' . date('y') . '/' . rand(100, 999))));
            $docType = $data['docType'] ?? ($data['doc_type'] ?? 'Invoice');
            $phone = $data['phone'] ?? null;
            $email = $data['email'] ?? null;
            $location = $data['location'] ?? 'Mombasa';
            $status = $data['status'] ?? 'unpaid';
            $issueDate = $data['issueDate'] ?? ($data['issue_date'] ?? date('Y-m-d'));
            $dueDate = $data['dueDate'] ?? ($data['due_date'] ?? date('Y-m-d', strtotime('+14 days')));
            $billingPeriod = $data['billingPeriod'] ?? ($data['billing_period'] ?? date('F Y'));
            $notes = $data['notes'] ?? '';
            $validityNote = $data['validityNote'] ?? ($data['validity_note'] ?? 'Please Note: Valid for 14 days from date.');
            $hasPaymentPlan = !empty($data['hasPaymentPlan']) || !empty($data['has_payment_plan']) ? 1 : 0;
            $depositAmount = (float)($data['depositAmount'] ?? ($data['deposit_amount'] ?? 0));
            $depositLabel = $data['depositLabel'] ?? ($data['deposit_label'] ?? '1 ST Installment');
            $tax = (float)($data['tax'] ?? 0);
            $labourFee = (float)($data['labourFee'] ?? ($data['labour_fee'] ?? 0));

            $items = $data['items'] ?? [];
            $subtotal = 0;
            foreach ($items as $it) {
                $subtotal += (float)($it['total'] ?? ((float)($it['rate'] ?? 0) * (float)($it['qty'] ?? 1)));
            }
            if ($subtotal === 0 && isset($data['subtotal'])) {
                $subtotal = (float)$data['subtotal'];
            }
            $paid = $status === 'paid' ? $total : ($hasPaymentPlan ? $depositAmount : 0);
            $balanceDue = max(0, $total - $paid);

            $insertStmt = $pdo->prepare("
                INSERT INTO `invoices` (
                    `id`, `invoice_no`, `doc_type`, `client_name`, `phone`, `email`, `location`,
                    `subtotal`, `tax`, `labour_fee`, `total`, `total_paid`, `balance_due`, `status`, `issue_date`,
                    `due_date`, `billing_period`, `notes`, `validity_note`, `has_payment_plan`,
                    `deposit_amount`, `deposit_label`, `created_at`, `updated_at`
                ) VALUES (
                    :id, :invoice_no, :doc_type, :client_name, :phone, :email, :location,
                    :subtotal, :tax, :labour_fee, :total, :total_paid, :balance_due, :status, :issue_date,
                    :due_date, :billing_period, :notes, :validity_note, :has_payment_plan,
                    :deposit_amount, :deposit_label, NOW(), NOW()
                )
            ");

            $insertStmt->execute([
                'id'               => $id,
                'invoice_no'       => $invoiceNo,
                'doc_type'         => $docType,
                'client_name'      => $clientName,
                'phone'            => $phone,
                'email'            => $email,
                'location'         => $location,
                'subtotal'         => $subtotal,
                'tax'              => $tax,
                'labour_fee'       => $labourFee,
                'total'            => $total,
                'total_paid'       => $paid,
                'balance_due'      => $balanceDue,
                'status'           => $status,
                'issue_date'       => $issueDate,
                'due_date'         => $dueDate,
                'billing_period'   => $billingPeriod,
                'notes'            => $notes,
                'validity_note'    => $validityNote,
                'has_payment_plan' => $hasPaymentPlan,
                'deposit_amount'   => $depositAmount,
                'deposit_label'    => $depositLabel,
            ]);

            // Insert line items
            $itemInsertStmt = $pdo->prepare("
                INSERT INTO `invoice_items` (`id`, `invoice_id`, `service_id`, `title`, `description`, `qty`, `rate`, `total`, `created_at`, `updated_at`)
                VALUES (:id, :invoice_id, :service_id, :title, :description, :qty, :rate, :total, NOW(), NOW())
            ");

            foreach ($items as $idx => $it) {
                $itemId = $it['id'] ?? ('item-' . substr(uniqid(), -8) . '-' . $idx);
                $rate = (float)($it['rate'] ?? 0);
                $qty = (string)($it['qty'] ?? '1');
                $itemTotal = (float)($it['total'] ?? ($rate * (float)$qty));

                $itemInsertStmt->execute([
                    'id'          => $itemId,
                    'invoice_id'  => $id,
                    'service_id'  => $it['serviceId'] ?? ($it['service_id'] ?? null),
                    'title'       => trim($it['title'] ?? 'Technical Service Deliverable'),
                    'description' => $it['description'] ?? null,
                    'qty'         => $qty,
                    'rate'        => $rate,
                    'total'       => $itemTotal
                ]);
            }

            echo json_encode([
                'success' => true,
                'message' => "Invoice {$invoiceNo} recorded successfully.",
                'id'      => $id,
                'invoiceNo'=> $invoiceNo
            ], JSON_PRETTY_PRINT);
            break;

        case 'PUT':
        case 'PATCH':
            $raw = file_get_contents('php://input');
            $data = json_decode($raw, true) ?? [];
            $id = $_GET['id'] ?? ($data['id'] ?? null);

            if (!$id) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Invoice ID is required.']);
                exit();
            }

            $fields = [];
            $params = ['id' => $id];

            $mapping = [
                'invoiceNo'       => 'invoice_no',
                'docType'         => 'doc_type',
                'clientName'      => 'client_name',
                'phone'           => 'phone',
                'email'           => 'email',
                'location'        => 'location',
                'amount'          => 'amount',
                'subtotal'        => 'subtotal',
                'tax'             => 'tax',
                'labourFee'       => 'labour_fee',
                'total'           => 'total',
                'status'          => 'status',
                'issueDate'       => 'issue_date',
                'dueDate'         => 'due_date',
                'billingPeriod'   => 'billing_period',
                'notes'           => 'notes',
                'validityNote'    => 'validity_note',
                'hasPaymentPlan'  => 'has_payment_plan',
                'depositAmount'   => 'deposit_amount',
                'depositLabel'    => 'deposit_label'
            ];

            foreach ($mapping as $jsKey => $sqlCol) {
                if (isset($data[$jsKey])) {
                    $fields[] = "`{$sqlCol}` = :{$sqlCol}";
                    $val = $data[$jsKey];
                    if ($jsKey === 'hasPaymentPlan') $val = $val ? 1 : 0;
                    $params[$sqlCol] = $val;
                } elseif (isset($data[$sqlCol])) {
                    $fields[] = "`{$sqlCol}` = :{$sqlCol}";
                    $val = $data[$sqlCol];
                    if ($sqlCol === 'has_payment_plan') $val = $val ? 1 : 0;
                    $params[$sqlCol] = $val;
                }
            }

            if (!empty($fields)) {
                $fields[] = "`updated_at` = NOW()";
                $sql = "UPDATE `invoices` SET " . implode(", ", $fields) . " WHERE `id` = :id";
                $stmt = $pdo->prepare($sql);
                $stmt->execute($params);
            }

            // If items array is provided, replace items
            if (isset($data['items']) && is_array($data['items'])) {
                $delItems = $pdo->prepare("DELETE FROM `invoice_items` WHERE `invoice_id` = :id");
                $delItems->execute(['id' => $id]);

                $itemInsertStmt = $pdo->prepare("
                    INSERT INTO `invoice_items` (`id`, `invoice_id`, `service_id`, `title`, `description`, `qty`, `rate`, `total`, `created_at`, `updated_at`)
                    VALUES (:id, :invoice_id, :service_id, :title, :description, :qty, :rate, :total, NOW(), NOW())
                ");

                foreach ($data['items'] as $idx => $it) {
                    $itemId = $it['id'] ?? ('item-' . substr(uniqid(), -8) . '-' . $idx);
                    $rate = (float)($it['rate'] ?? 0);
                    $qty = (string)($it['qty'] ?? '1');
                    $itemTotal = (float)($it['total'] ?? ($rate * (float)$qty));

                    $itemInsertStmt->execute([
                        'id'          => $itemId,
                        'invoice_id'  => $id,
                        'service_id'  => $it['serviceId'] ?? ($it['service_id'] ?? null),
                        'title'       => trim($it['title'] ?? 'Technical Service Deliverable'),
                        'description' => $it['description'] ?? null,
                        'qty'         => $qty,
                        'rate'        => $rate,
                        'total'       => $itemTotal
                    ]);
                }
            }

            echo json_encode([
                'success' => true,
                'message' => "Invoice {$id} updated successfully."
            ]);
            break;

        case 'DELETE':
            $raw = file_get_contents('php://input');
            $data = json_decode($raw, true) ?? [];
            $id = $_GET['id'] ?? ($data['id'] ?? null);

            if (!$id) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Invoice ID is required for deletion.']);
                exit();
            }

            // Delete child items then invoice
            $delItems = $pdo->prepare("DELETE FROM `invoice_items` WHERE `invoice_id` = :id");
            $delItems->execute(['id' => $id]);

            $delInv = $pdo->prepare("DELETE FROM `invoices` WHERE `id` = :id");
            $delInv->execute(['id' => $id]);

            echo json_encode([
                'success' => true,
                'message' => "Invoice {$id} deleted successfully."
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
