<?php
// get.php - Fetch categories with product counts for the admin
require_once dirname(dirname(__DIR__)) . '/db.php';
require_once dirname(__DIR__) . '/auth.php';

$admin = requireAdminAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

try {
    $stmt = $pdo->query('
        SELECT c.*, COUNT(p.id) as productCount 
        FROM Category c
        LEFT JOIN Product p ON c.id = p.categoryId
        GROUP BY c.id
        ORDER BY c.name ASC
    ');
    
    $categories = $stmt->fetchAll();

    $formatted = array_map(function($c) {
        return [
            'id' => $c['id'],
            'name' => $c['name'],
            'slug' => $c['slug'],
            'productCount' => (int)$c['productCount'],
            'createdAt' => $c['createdAt']
        ];
    }, $categories);

    echo json_encode(['categories' => $formatted]);

} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error', 'details' => $e->getMessage()]);
}
?>
