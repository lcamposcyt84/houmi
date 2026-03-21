<?php
// get.php - Fetch orders for the logged-in customer
require_once dirname(__DIR__) . '/db.php';
require_once dirname(__DIR__) . '/auth/check.php';

$customer = requireAuth();

try {
    $stmt = $pdo->prepare('
        SELECT * FROM Sale 
        WHERE customerId = :cId
        ORDER BY createdAt DESC
    ');
    $stmt->execute([':cId' => $customer['customerId']]);
    $sales = $stmt->fetchAll();

    $formattedSales = [];
    foreach ($sales as $sale) {
        // Get items for each sale
        $itemsStmt = $pdo->prepare('
            SELECT si.*, p.name as productName, p.images, p.slug as productSlug 
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
                'productName' => $item['productName'],
                'quantity' => (int)$item['quantity'],
                'priceUsd' => (float)$item['priceUsd'],
                'priceVes' => (float)$item['priceVes'],
                'product' => [
                    'name' => $item['productName'],
                    'slug' => $item['productSlug'],
                    'images' => json_decode($item['images'], true) ?: []
                ]
            ];
        }

        // Get single shipment for the sale
        $shipStmt = $pdo->prepare('
            SELECT carrier, trackingNumber, trackingUrl, status 
            FROM Shipment 
            WHERE saleId = :sId 
            ORDER BY createdAt DESC LIMIT 1
        ');
        $shipStmt->execute([':sId' => $sale['id']]);
        $shipments = $shipStmt->fetchAll();

        $formattedSales[] = [
            'id' => $sale['id'],
            'orderNumber' => $sale['orderNumber'] ?? null,
            'totalUsd' => (float)$sale['totalUsd'],
            'totalVes' => (float)$sale['totalVes'],
            'status' => $sale['status'],
            'createdAt' => $sale['createdAt'],
            'items' => $formattedItems,
            'shipments' => $shipments
        ];
    }

    echo json_encode(['orders' => $formattedSales]);

} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error', 'details' => $e->getMessage()]);
}
?>
