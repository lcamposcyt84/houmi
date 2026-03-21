<?php
// remove.php - Remove a product from the wishlist
require_once dirname(__DIR__) . '/db.php';
require_once dirname(__DIR__) . '/auth/check.php';

$customer = requireAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
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
    $productId  = $data->productId;
    $customerId = $customer['customerId'];

    $stmt = $pdo->prepare('DELETE FROM WishlistItem WHERE customerId = :cId AND productId = :pId');
    $stmt->execute([':cId' => $customerId, ':pId' => $productId]);

    echo json_encode(['success' => true, 'action' => 'removed']);

} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error', 'details' => $e->getMessage()]);
}
?>
