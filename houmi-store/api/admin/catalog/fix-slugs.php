<?php
require_once dirname(dirname(__DIR__)) . '/db.php';
require_once dirname(__DIR__) . '/auth.php';

$admin = requireAdminAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

try {
    $stmt = $pdo->query('
        SELECT p.id, p.code, c.slug as categorySlug
        FROM Product p
        JOIN Category c ON p.categoryId = c.id
    ');
    $products = $stmt->fetchAll();

    $updated = 0;
    foreach ($products as $p) {
        $slug = strtolower($p['code']) . '-' . $p['categorySlug'];
        $upd = $pdo->prepare('UPDATE Product SET slug = :slug WHERE id = :id');
        $upd->execute([':slug' => $slug, ':id' => $p['id']]);
        $updated++;
    }

    echo json_encode(['success' => true, 'message' => "Updated $updated slugs"]);

} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error', 'details' => $e->getMessage()]);
}
?>
