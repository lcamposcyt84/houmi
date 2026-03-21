<?php
// post.php - Submit a new review
require_once dirname(__DIR__) . '/db.php';
require_once dirname(__DIR__) . '/auth/check.php';

$customer = requireAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

$data = json_decode(file_get_contents("php://input"));

if (empty($data->productId) || empty($data->rating)) {
    http_response_code(400);
    echo json_encode(['error' => 'productId y rating son obligatorios']);
    exit();
}

try {
    $productId = $data->productId;
    $customerId = $customer['customerId'];
    $rating = (int)$data->rating;
    $title = $data->title ?? null;
    $comment = $data->comment ?? null;

    // Check if customer already reviewed this product
    $checkStmt = $pdo->prepare('SELECT id FROM Review WHERE customerId = :cId AND productId = :pId LIMIT 1');
    $checkStmt->execute([':cId' => $customerId, ':pId' => $productId]);
    if ($checkStmt->fetch()) {
        http_response_code(409);
        echo json_encode(['error' => 'Ya dejaste una reseña para este producto']);
        exit();
    }

    // Check if verified purchase (Look into SaleItem -> Sale)
    $verifiedStmt = $pdo->prepare('
        SELECT si.id 
        FROM SaleItem si
        JOIN Sale s ON si.saleId = s.id
        WHERE si.productId = :pId AND s.customerId = :cId AND s.status IN ("paid", "completed")
        LIMIT 1
    ');
    $verifiedStmt->execute([':pId' => $productId, ':cId' => $customerId]);
    $isVerified = $verifiedStmt->fetch() ? 1 : 0;

    // Insert review
    $reviewId = 'rev_' . bin2hex(random_bytes(8));
    $insertStmt = $pdo->prepare('
        INSERT INTO Review (id, productId, customerId, rating, title, comment, isVerified, isApproved, createdAt, updatedAt)
        VALUES (:id, :pId, :cId, :rating, :title, :comment, :isVerified, 0, NOW(), NOW())
    ');
    
    $insertStmt->execute([
        ':id' => $reviewId,
        ':pId' => $productId,
        ':cId' => $customerId,
        ':rating' => $rating,
        ':title' => $title,
        ':comment' => $comment,
        ':isVerified' => $isVerified
    ]);

    http_response_code(201);
    echo json_encode([
        'success' => true,
        'message' => 'Tu reseña está pendiente de aprobación',
        'review' => ['id' => $reviewId]
    ]);

} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error', 'details' => $e->getMessage()]);
}
?>
