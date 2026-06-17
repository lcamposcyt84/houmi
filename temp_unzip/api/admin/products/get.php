<?php
// get.php - Fetch products for the admin dashboard (paginated table view)
require_once dirname(dirname(__DIR__)) . '/db.php';
require_once dirname(__DIR__) . '/auth.php';

$admin = requireAdminAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

try {
    $search = $_GET['search'] ?? '';
    $categoryId = $_GET['category'] ?? $_GET['categoryId'] ?? '';
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 200;
    
    $where = [];
    $params = [];

    if (!empty($search)) {
        $where[] = "(p.name LIKE :search OR p.code LIKE :search)";
        $params[':search'] = "%$search%";
    }
    
    if (!empty($categoryId) && $categoryId !== 'all') {
        $where[] = "p.categoryId = :catId";
        $params[':catId'] = $categoryId;
    }

    $whereClause = !empty($where) ? 'WHERE ' . implode(' AND ', $where) : '';

    $query = "
        SELECT 
            p.id, p.code, p.name, p.slug, p.images, p.isActive, p.createdAt, p.categoryId,
            c.name as categoryName, c.slug as categorySlug,
            pr.priceUsd, pr.priceVes, pr.manualVes,
            i.stock
        FROM Product p
        JOIN Category c ON p.categoryId = c.id
        LEFT JOIN Pricing pr ON p.id = pr.productId
        LEFT JOIN Inventory i ON p.id = i.productId
        $whereClause
        ORDER BY p.createdAt DESC
        LIMIT :limit
    ";

    $stmt = $pdo->prepare($query);
    foreach ($params as $key => $val) {
        $stmt->bindValue($key, $val);
    }
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->execute();
    $productsRaw = $stmt->fetchAll();

    $formattedProducts = [];
    foreach ($productsRaw as $row) {
        $formattedProducts[] = [
            'id' => $row['id'],
            'code' => $row['code'],
            'name' => $row['name'],
            'slug' => $row['slug'],
            'images' => json_decode($row['images'], true) ?: [],
            'isActive' => (bool)$row['isActive'],
            'categoryId' => $row['categoryId'],
            'category' => [
                'id' => $row['categoryId'],
                'name' => $row['categoryName'],
                'slug' => $row['categorySlug']
            ],
            'pricing' => [
                'priceUsd' => (float)($row['priceUsd'] ?? 0),
                'priceVes' => $row['priceVes'] !== null ? (float)$row['priceVes'] : null,
                'manualVes' => (bool)($row['manualVes'] ?? false)
            ],
            'inventory' => [
                'stock' => (int)($row['stock'] ?? 0)
            ],
            'createdAt' => $row['createdAt']
        ];
    }

    $catStmt = $pdo->query('SELECT id, name, slug FROM Category ORDER BY name ASC');
    $categories = $catStmt->fetchAll();

    $settingsStmt = $pdo->query("SELECT exchangeRateUsdToVes FROM Settings WHERE id = 'main'");
    $settingsRow = $settingsStmt->fetch();

    echo json_encode([
        'products' => $formattedProducts,
        'categories' => $categories,
        'settings' => [
            'exchangeRateUsdToVes' => $settingsRow ? (float)$settingsRow['exchangeRateUsdToVes'] : 40
        ]
    ]);

} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error', 'details' => $e->getMessage()]);
}
?>
