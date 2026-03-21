<?php
// get.php - Fetch approved reviews for a product
require_once dirname(__DIR__) . '/db.php';

$productId = $_GET['productId'] ?? null;
if (!$productId) {
    http_response_code(400);
    echo json_encode(['error' => 'productId requerido']);
    exit();
}

try {
    $stmt = $pdo->prepare('
        SELECT r.*, c.firstName, c.lastName, c.avatar 
        FROM Review r
        JOIN Customer c ON r.customerId = c.id
        WHERE r.productId = :pId AND r.isApproved = 1
        ORDER BY r.createdAt DESC
    ');
    $stmt->execute([':pId' => $productId]);
    $reviewsRaw = $stmt->fetchAll();

    $statsStmt = $pdo->prepare('
        SELECT AVG(rating) as avgRating, COUNT(id) as totalReviews 
        FROM Review 
        WHERE productId = :pId AND isApproved = 1
    ');
    $statsStmt->execute([':pId' => $productId]);
    $stats = $statsStmt->fetch();

    $formattedReviews = [];
    foreach ($reviewsRaw as $r) {
        $formattedReviews[] = [
            'id' => $r['id'],
            'rating' => (int)$r['rating'],
            'title' => $r['title'],
            'comment' => $r['comment'],
            'isVerified' => (bool)$r['isVerified'],
            'createdAt' => $r['createdAt'],
            'customer' => [
                'firstName' => $r['firstName'],
                'lastName' => $r['lastName'],
                'avatar' => $r['avatar']
            ]
        ];
    }

    echo json_encode([
        'reviews' => $formattedReviews,
        'averageRating' => $stats ? (float)$stats['avgRating'] : 0,
        'totalReviews' => $stats ? (int)$stats['totalReviews'] : 0
    ]);

} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error', 'details' => $e->getMessage()]);
}
?>
