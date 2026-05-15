<?php
require_once dirname(dirname(__DIR__)) . '/db.php';
require_once dirname(__DIR__) . '/auth.php';

$admin = requireAdminAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'PUT') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON']);
    exit();
}

$productId = $input['productId'] ?? $input['id'] ?? null;
if (!$productId) {
    http_response_code(400);
    echo json_encode(['error' => 'Product ID is required']);
    exit();
}

try {
    $fields = [];
    $params = [':id' => $productId];

    if (isset($input['name'])) { $fields[] = 'name = :name'; $params[':name'] = $input['name']; }
    if (isset($input['code'])) { $fields[] = 'code = :code'; $params[':code'] = $input['code']; }
    if (isset($input['description'])) { $fields[] = 'description = :desc'; $params[':desc'] = $input['description']; }
    if (isset($input['isActive'])) { $fields[] = 'isActive = :active'; $params[':active'] = $input['isActive'] ? 1 : 0; }
    if (isset($input['categoryId'])) { $fields[] = 'categoryId = :catId'; $params[':catId'] = $input['categoryId']; }
    if (isset($input['images'])) { $fields[] = 'images = :images'; $params[':images'] = json_encode($input['images']); }

    $pdo->beginTransaction();

    if (!empty($fields)) {
        $fields[] = 'updatedAt = NOW()';
        $stmt = $pdo->prepare('UPDATE Product SET ' . implode(', ', $fields) . ' WHERE id = :id');
        $stmt->execute($params);
    }

    if (isset($input['stock'])) {
        $invId = 'inv_' . bin2hex(random_bytes(8));
        $stmt = $pdo->prepare('INSERT INTO Inventory (id, productId, stock) VALUES (:id, :pid, :s) ON DUPLICATE KEY UPDATE stock = :s2');
        $stmt->execute([':id' => $invId, ':pid' => $productId, ':s' => (int)$input['stock'], ':s2' => (int)$input['stock']]);
    }

    if (isset($input['priceUsd'])) {
        $prcId = 'prc_' . bin2hex(random_bytes(8));
        $priceVes = $input['priceVes'] ?? null;
        $manualVes = isset($input['manualVes']) ? ($input['manualVes'] ? 1 : 0) : 0;
        $stmt = $pdo->prepare('INSERT INTO Pricing (id, productId, priceUsd, priceVes, manualVes) VALUES (:id, :pid, :usd, :ves, :mv) ON DUPLICATE KEY UPDATE priceUsd = :usd2, priceVes = :ves2, manualVes = :mv2');
        $stmt->execute([':id' => $prcId, ':pid' => $productId, ':usd' => (float)$input['priceUsd'], ':ves' => $priceVes, ':mv' => $manualVes, ':usd2' => (float)$input['priceUsd'], ':ves2' => $priceVes, ':mv2' => $manualVes]);
    }

    $pdo->commit();

    $getStmt = $pdo->prepare('
        SELECT p.*, c.name as categoryName, c.slug as categorySlug,
               pr.priceUsd, pr.priceVes, pr.manualVes, i.stock
        FROM Product p
        JOIN Category c ON p.categoryId = c.id
        LEFT JOIN Pricing pr ON p.id = pr.productId
        LEFT JOIN Inventory i ON p.id = i.productId
        WHERE p.id = :id LIMIT 1
    ');
    $getStmt->execute([':id' => $productId]);
    $row = $getStmt->fetch();

    echo json_encode([
        'success' => true,
        'product' => [
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
        ]
    ]);

} catch (\PDOException $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['error' => 'Database error', 'details' => $e->getMessage()]);
}
?>
