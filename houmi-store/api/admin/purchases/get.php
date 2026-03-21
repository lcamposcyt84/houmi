<?php
// get.php - Fetch all purchases for admin
require_once dirname(dirname(__DIR__)) . '/db.php';
require_once dirname(__DIR__) . '/auth.php';

$admin = requireAdminAuth();

try {
    $stmt = $pdo->query('SELECT * FROM Purchase ORDER BY createdAt DESC');
    $purchases = $stmt->fetchAll();

    $formattedPurchases = [];
    foreach ($purchases as $purchase) {
        // Get items for each purchase
        $itemsStmt = $pdo->prepare('
            SELECT pi.*, p.name as productName, p.code as productCode
            FROM PurchaseItem pi
            JOIN Product p ON pi.productId = p.id
            WHERE pi.purchaseId = :pId
        ');
        $itemsStmt->execute([':pId' => $purchase['id']]);
        $items = $itemsStmt->fetchAll();

        $formattedItems = [];
        foreach ($items as $item) {
            $formattedItems[] = [
                'id'          => $item['id'],
                'productId'   => $item['productId'],
                'productName' => $item['productName'],
                'productCode' => $item['productCode'],
                'quantity'    => (int)$item['quantity'],
                'costUsd'     => (float)$item['costUsd'],
            ];
        }

        $formattedPurchases[] = [
            'id'          => $purchase['id'],
            'supplier'    => $purchase['supplier'],
            'reference'   => $purchase['reference'],
            'totalUsd'    => (float)$purchase['totalUsd'],
            'totalVes'    => (float)$purchase['totalVes'],
            'notes'       => $purchase['notes'],
            'createdAt'   => $purchase['createdAt'],
            'items'       => $formattedItems
        ];
    }

    echo json_encode(['purchases' => $formattedPurchases]);

} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error', 'details' => $e->getMessage()]);
}
?>
