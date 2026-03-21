<?php
// get.php - Fetch all expenses for admin
require_once dirname(dirname(__DIR__)) . '/db.php';
require_once dirname(__DIR__) . '/auth.php';

$admin = requireAdminAuth();

try {
    $stmt = $pdo->query('SELECT * FROM Expense ORDER BY createdAt DESC');
    $expenses = $stmt->fetchAll();

    $formattedExpenses = [];
    foreach ($expenses as $exp) {
        $formattedExpenses[] = [
            'id'          => $exp['id'],
            'description' => $exp['description'],
            'category'    => $exp['category'],
            'amountUsd'   => (float)$exp['amountUsd'],
            'amountVes'   => (float)$exp['amountVes'],
            'notes'       => $exp['notes'],
            'createdAt'   => $exp['createdAt'],
        ];
    }

    echo json_encode(['expenses' => $formattedExpenses]);

} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error', 'details' => $e->getMessage()]);
}
?>
