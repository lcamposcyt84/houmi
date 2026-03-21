<?php
// get_categories.php - Fetch all categories with product counts
require_once 'db.php';

try {
    $stmt = $pdo->query('
        SELECT c.id, c.name, c.slug,
               COUNT(p.id) AS productCount
        FROM Category c
        LEFT JOIN Product p ON p.categoryId = c.id AND p.isActive = 1
        GROUP BY c.id
        ORDER BY c.name ASC
    ');
    $categories = $stmt->fetchAll();

    // Cast productCount to int
    foreach ($categories as &$cat) {
        $cat['productCount'] = (int)$cat['productCount'];
    }

    echo json_encode(['categories' => $categories]);
} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>
