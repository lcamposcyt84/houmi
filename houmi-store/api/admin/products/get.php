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
    $categoryId = $_GET['category'] ?? '';
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;
    
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
            p.id, p.code, p.name, p.slug, p.images, p.isActive, p.createdAt,
            c.name as categoryName, c.id as categoryId,
            pr.priceUsd, i.stock
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
            'codigo' => $row['code'],
            'nombre' => $row['name'],
            'imagen' => (json_decode($row['images'], true)[0] ?? '/placeholder.svg'),
            'categoria' => ['id' => $row['categoryId'], 'name' => $row['categoryName']],
            'precio' => (float)$row['priceUsd'],
            'stock' => (int)$row['stock'],
            'activo' => (bool)$row['isActive'],
            'createdAt' => $row['createdAt']
        ];
    }

    echo json_encode(['products' => $formattedProducts]);

} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error', 'details' => $e->getMessage()]);
}
?>
