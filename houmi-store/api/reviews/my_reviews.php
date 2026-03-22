<?php
// my_reviews.php - Devuelve un arreglo con los IDs de los productos que el usuario ya calificó
require_once dirname(__DIR__) . '/db.php';
require_once dirname(__DIR__) . '/auth/check.php';

$customer = requireAuth();

try {
    $stmt = $pdo->prepare('SELECT productId FROM Review WHERE customerId = :cId');
    $stmt->execute([':cId' => $customer['customerId']]);
    $reviews = $stmt->fetchAll(PDO::FETCH_COLUMN);

    echo json_encode([
        'success' => true,
        'reviewedProductIds' => $reviews
    ]);

} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error', 'details' => $e->getMessage()]);
}
?>
