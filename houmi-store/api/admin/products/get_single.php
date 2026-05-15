<?php
require_once dirname(dirname(__DIR__)) . '/db.php';
require_once dirname(__DIR__) . '/auth.php';

$admin = requireAdminAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

$id = $_GET['id'] ?? null;
if (!$id) {
    http_response_code(400);
    echo json_encode(['error' => 'Product ID is required']);
    exit();
}

try {
    $stmt = $pdo->prepare('
        SELECT 
            p.*, 
            c.name as categoryName, c.slug as categorySlug,
            pr.priceUsd, pr.priceVes, pr.manualVes,
            i.stock
        FROM Product p
        JOIN Category c ON p.categoryId = c.id
        LEFT JOIN Pricing pr ON p.id = pr.productId
        LEFT JOIN Inventory i ON p.id = i.productId
        WHERE p.id = :id
        LIMIT 1
    ');
    
    $stmt->execute([':id' => $id]);
    $product = $stmt->fetch();
    
    if (!$product) {
        http_response_code(404);
        echo json_encode(['error' => 'Product not found']);
        exit();
    }

    $priceUsd = (float)($product['priceUsd'] ?? 0);
    
    echo json_encode([
        'id' => $product['id'],
        'code' => $product['code'],
        'name' => $product['name'],
        'slug' => $product['slug'],
        'description' => $product['description'],
        'images' => json_decode($product['images'], true) ?: [],
        'isActive' => (bool)$product['isActive'],
        'categoryId' => $product['categoryId'],
        'category' => [
            'id' => $product['categoryId'],
            'name' => $product['categoryName'],
            'slug' => $product['categorySlug']
        ],
        'pricing' => [
            'priceUsd' => $priceUsd,
            'priceVes' => $product['priceVes'] !== null ? (float)$product['priceVes'] : null,
            'manualVes' => (bool)($product['manualVes'] ?? false)
        ],
        'inventory' => [
            'stock' => (int)($product['stock'] ?? 0)
        ],
        'createdAt' => $product['createdAt']
    ]);

} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error', 'details' => $e->getMessage()]);
}
?>
