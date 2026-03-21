<?php
// create.php - Create a new category 
require_once dirname(dirname(__DIR__)) . '/db.php';
require_once dirname(__DIR__) . '/auth.php';

$admin = requireAdminAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

$data = json_decode(file_get_contents("php://input"));

if (empty($data->name) || empty($data->slug)) {
    http_response_code(400);
    echo json_encode(['error' => 'name y slug son requeridos']);
    exit();
}

try {
    // Check slug uniqueness
    $stmt = $pdo->prepare('SELECT id FROM Category WHERE slug = :slug LIMIT 1');
    $stmt->execute([':slug' => $data->slug]);
    if ($stmt->fetch()) {
        http_response_code(409);
        echo json_encode(['error' => 'Una categoría con este slug ya existe']);
        exit();
    }

    $id = 'cat_' . bin2hex(random_bytes(8));
    $ins = $pdo->prepare('INSERT INTO Category (id, name, slug, createdAt, updatedAt) VALUES (:id, :name, :slug, NOW(), NOW())');
    $ins->execute([
        ':id' => $id,
        ':name' => $data->name,
        ':slug' => $data->slug
    ]);

    http_response_code(201);
    echo json_encode([
        'success' => true,
        'category' => [
            'id' => $id,
            'name' => $data->name,
            'slug' => $data->slug
        ]
    ]);

} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error', 'details' => $e->getMessage()]);
}
?>
