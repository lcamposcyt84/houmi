<?php
// create.php - Create a single product
require_once dirname(dirname(__DIR__)) . '/db.php';
require_once dirname(__DIR__) . '/auth.php';

$admin = requireAdminAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

$data = json_decode(file_get_contents("php://input"));

if (empty($data->code) || empty($data->name) || empty($data->categoryId)) {
    http_response_code(400);
    echo json_encode(['error' => 'Código, nombre y categoría son requeridos']);
    exit();
}

try {
    $pdo->beginTransaction();

    // Check code uniqueness
    $stmt = $pdo->prepare('SELECT id FROM Product WHERE code = :code LIMIT 1');
    $stmt->execute([':code' => $data->code]);
    if ($stmt->fetch()) {
        throw new Exception('El código de producto ya existe');
    }

    // Get category slug for product slug generation
    $catStmt = $pdo->prepare('SELECT slug FROM Category WHERE id = :id LIMIT 1');
    $catStmt->execute([':id' => $data->categoryId]);
    $cat = $catStmt->fetch();
    
    $slug = strtolower($data->code) . '-' . ($cat ? $cat['slug'] : 'item');

    $productId = 'prd_' . bin2hex(random_bytes(8));
    $images = !empty($data->images) ? json_encode($data->images) : '["/placeholder.svg"]';

    // Insert Product
    $ins = $pdo->prepare('
        INSERT INTO Product (id, code, name, slug, description, images, isActive, categoryId, createdAt, updatedAt)
        VALUES (:id, :code, :name, :slug, :desc, :images, :isActive, :catId, NOW(), NOW())
    ');
    $ins->execute([
        ':id' => $productId,
        ':code' => $data->code,
        ':name' => $data->name,
        ':slug' => $slug,
        ':desc' => $data->description ?? null,
        ':images' => $images,
        ':isActive' => $data->isActive ?? 1,
        ':catId' => $data->categoryId
    ]);

    // Insert Pricing
    $prcId = 'prc_' . bin2hex(random_bytes(8));
    $pdo->prepare('INSERT INTO Pricing (id, productId, priceUsd) VALUES (?, ?, ?)')->execute([$prcId, $productId, (float)($data->priceUsd ?? 0)]);

    // Insert Inventory
    $invId = 'inv_' . bin2hex(random_bytes(8));
    $pdo->prepare('INSERT INTO Inventory (id, productId, stock) VALUES (?, ?, ?)')->execute([$invId, $productId, (int)($data->stock ?? 0)]);

    $pdo->commit();

    http_response_code(201);
    echo json_encode(['success' => true, 'product' => ['id' => $productId, 'slug' => $slug]]);

} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
