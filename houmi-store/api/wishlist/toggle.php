<?php
// toggle.php - Add or remove product from wishlist
require_once dirname(__DIR__) . '/db.php';
require_once dirname(__DIR__) . '/auth/check.php';

$customer = requireAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

$data = json_decode(file_get_contents("php://input"));
if (empty($data->productId)) {
    http_response_code(400);
    echo json_encode(['error' => 'productId es requerido']);
    exit();
}

try {
    $productId = $data->productId;
    $customerId = $customer['customerId'];

    // Check if it already exists
    $stmt = $pdo->prepare('SELECT id FROM WishlistItem WHERE customerId = :cId AND productId = :pId LIMIT 1');
    $stmt->execute([':cId' => $customerId, ':pId' => $productId]);
    $existing = $stmt->fetch();

    if ($existing) {
        // Remove it
        $delStmt = $pdo->prepare('DELETE FROM WishlistItem WHERE id = :id');
        $delStmt->execute([':id' => $existing['id']]);
        http_response_code(200);
        echo json_encode(['success' => true, 'action' => 'removed']);
    } else {
        // Add it
        $newId = 'wsh_' . bin2hex(random_bytes(8));
        $addStmt = $pdo->prepare('INSERT INTO WishlistItem (id, customerId, productId, createdAt, updatedAt) VALUES (:id, :cId, :pId, NOW(), NOW())');
        $addStmt->execute([':id' => $newId, ':cId' => $customerId, ':pId' => $productId]);
        http_response_code(200);
        echo json_encode(['success' => true, 'action' => 'added']);
    }

} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error', 'details' => $e->getMessage()]);
}
?>
