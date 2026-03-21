<?php
// get.php - Fetch customer's wishlist
require_once dirname(__DIR__) . '/db.php';
require_once dirname(__DIR__) . '/auth/check.php';

$customer = requireAuth();

try {
    $stmt = $pdo->prepare('
        SELECT 
            w.id as wishlistItemId,
            p.*, 
            c.name as categoryName, c.slug as categorySlug,
            pr.priceUsd, pr.priceVes, pr.manualVes,
            i.stock
        FROM WishlistItem w
        JOIN Product p ON w.productId = p.id
        JOIN Category c ON p.categoryId = c.id
        LEFT JOIN Pricing pr ON p.id = pr.productId
        LEFT JOIN Inventory i ON p.id = i.productId
        WHERE w.customerId = :customerId
        ORDER BY w.createdAt DESC
    ');
    
    $stmt->execute([':customerId' => $customer['customerId']]);
    $productsRaw = $stmt->fetchAll();

    // Exchange rate
    $settingsStmt = $pdo->query("SELECT exchangeRateUsdToVes FROM Settings WHERE id = 'main'");
    $settings = $settingsStmt->fetch();
    $exchangeRate = $settings ? (float)$settings['exchangeRateUsdToVes'] : 40.0;

    $formattedProducts = [];
    foreach ($productsRaw as $row) {
        $priceUsd = (float)($row['priceUsd'] ?? 0);
        $priceVesRaw = $row['priceVes'] !== null ? (float)$row['priceVes'] : ($priceUsd * $exchangeRate);
        $stock = (int)($row['stock'] ?? 0);

        $usdDisplay = '$' . number_format($priceUsd, 2);
        $vesDisplay = 'Bs. ' . number_format($priceVesRaw, 2);

        $stockStatus = [
            'label' => 'Sin stock', 'variant' => 'error'
        ];
        if ($stock > 5) {
            $stockStatus = ['label' => 'En stock', 'variant' => 'success'];
        } elseif ($stock > 0) {
            $stockStatus = ['label' => 'Pocas unidades', 'variant' => 'warning'];
        }

        $formattedProducts[] = [
            'wishlist_id' => $row['wishlistItemId'], // Keep relationship ID
            'id' => $row['id'],
            'name' => $row['name'],
            'slug' => $row['slug'],
            'images' => json_decode($row['images'], true) ?: [],
            'category' => [
                'name' => $row['categoryName'],
                'slug' => $row['categorySlug']
            ],
            'priceDisplay' => [
                'usd' => $usdDisplay,
                'ves' => $vesDisplay,
                'usdRaw' => $priceUsd,
                'vesRaw' => $priceVesRaw
            ],
            'stock' => $stock,
            'stockStatus' => $stockStatus
        ];
    }

    echo json_encode(['wishlist' => $formattedProducts, 'exchangeRate' => $exchangeRate]);

} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error', 'details' => $e->getMessage()]);
}
?>
