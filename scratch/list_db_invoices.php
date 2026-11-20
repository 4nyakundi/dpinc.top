<?php
require 'api/db.php';
$pdo = getDb();
$res = $pdo->query('SELECT invoice_no, client_name, total, status FROM invoices')->fetchAll();
echo json_encode($res, JSON_PRETTY_PRINT);
