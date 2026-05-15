<?php
require_once dirname(dirname(__DIR__)) . '/db.php';
require_once dirname(__DIR__) . '/auth.php';

$admin = requireAdminAuth();

try {
    $stmt = $pdo->query('
        SELECT 
            s.*,
            c.firstName, c.lastName, c.email as registeredEmail
        FROM Sale s
        LEFT JOIN Customer c ON s.customerId = c.id
        ORDER BY s.createdAt DESC
    ');
    $sales = $stmt->fetchAll();

    $formattedSales = [];
    foreach ($sales as $sale) {
        $itemsStmt = $pdo->prepare('
            SELECT si.*, p.name as productName, p.code as productCode
            FROM SaleItem si
            JOIN Product p ON si.productId = p.id
            WHERE si.saleId = :sId
        ');
        $itemsStmt->execute([':sId' => $sale['id']]);
        $itemsRaw = $itemsStmt->fetchAll();

        $formattedItems = [];
        foreach ($itemsRaw as $item) {
            $formattedItems[] = [
                'id' => $item['id'],
                'quantity' => (int)$item['quantity'],
                'priceUsd' => (float)$item['priceUsd'],
                'priceVes' => (float)$item['priceVes'],
                'product' => [
                    'name' => $item['productName'],
                    'code' => $item['productCode']
                ]
            ];
        }

        $formattedSales[] = [
            'id' => $sale['id'],
            'orderNumber' => $sale['orderNumber'],
            'shippingAddress' => $sale['customerAddress'],
            'notes' => $sale['notes'],
            'customerName' => $sale['customerName'],
            'customerEmail' => $sale['customerEmail'],
            'customerPhone' => $sale['customerPhone'],
            'customer' => [
                'name' => $sale['customerName'],
                'email' => $sale['customerEmail'],
                'phone' => $sale['customerPhone']
            ],
            'shipping' => [
                'address' => $sale['customerAddress'],
                'notes' => $sale['notes']
            ],
            'totals' => [
                'usd' => (float)$sale['totalUsd'],
                'ves' => (float)$sale['totalVes'],
                'exchangeRate' => (float)($sale['exchangeRate'] ?? 0)
            ],
            'status' => $sale['status'],
            'paymentMethod' => $sale['paymentMethod'],
            'referenceNumber' => $sale['bankReference'] ?? $sale['referenceNumber'] ?? '',
            'createdAt' => $sale['createdAt'],
            'items' => $formattedItems
        ];
    }

    echo json_encode(['orders' => $formattedSales]);

} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error', 'details' => $e->getMessage()]);
}
?>
