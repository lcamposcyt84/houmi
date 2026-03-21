<?php
// update.php - Update a single product
require_once dirname(dirname(__DIR__)) . '/db.php';
require_once dirname(__DIR__) . '/auth.php';

$admin = requireAdminAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'PUT' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

$data = json_decode(file_get_contents("php://input"));

if (empty($data->id)) {
    http_response_code(400);
    echo json_encode(['error' => 'Id de producto requerido']);
    exit();
}

try {
    $pdo->beginTransaction();
    $productId = $data->id;

    // Build dynamic update query
    $fields = [];
    $params = [':id' => $productId];

    if (isset($data->name)) { $fields[] = "name = :name"; $params[':name'] = $data->name; }
    if (isset($data->code)) { $fields[] = "code = :code"; $params[':code'] = $data->code; }
    if (isset($data->description)) { $fields[] = "description = :desc"; $params[':desc'] = $data->description; }
    if (isset($data->isActive)) { $fields[] = "isActive = :act"; $params[':act'] = $data->isActive ? 1 : 0; }
    if (isset($data->images) && is_array($data->images)) { 
        $fields[] = "images = :img"; $params[':img'] = json_encode($data->images); 
    }
    
    if (isset($data->categoryId)) { 
        $fields[] = "categoryId = :catId"; $params[':catId'] = $data->categoryId; 
        
        // Also update slug if category or code changed, but keep simple for now
        if (isset($data->code)) {
            $catStmt = $pdo->prepare('SELECT slug FROM Category WHERE id = :id LIMIT 1');
            $catStmt->execute([':id' => $data->categoryId]);
            $cat = $catStmt->fetch();
            $fields[] = "slug = :slug";
            $params[':slug'] = strtolower($data->code) . '-' . ($cat ? $cat['slug'] : 'item');
        }
    }

    if (!empty($fields)) {
        $fields[] = "updatedAt = NOW()";
        $sql = "UPDATE Product SET " . implode(', ', $fields) . " WHERE id = :id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
    }

    // Update Pricing
    if (isset($data->priceUsd)) {
        $pdo->prepare('UPDATE Pricing SET priceUsd = ?, updatedAt = NOW() WHERE productId = ?')->execute([(float)$data->priceUsd, $productId]);
    }

    // Update Inventory
    if (isset($data->stock)) {
        $pdo->prepare('UPDATE Inventory SET stock = ?, updatedAt = NOW() WHERE productId = ?')->execute([(int)$data->stock, $productId]);
    }

    $pdo->commit();
    echo json_encode(['success' => true]);

} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
