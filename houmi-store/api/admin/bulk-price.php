<?php
// bulk-price.php - Update prices in bulk by category or specific products
require_once dirname(__DIR__) . '/db.php';
require_once dirname(__DIR__) . '/auth.php';

$admin = requireAdminAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->percentage)) {
    http_response_code(400);
    echo json_encode(['error' => 'percentage es requerido']);
    exit();
}

$percentage = (float)$data->percentage;
$multiplier = 1 + ($percentage / 100);

try {
    $pdo->beginTransaction();
    $updatedCount = 0;

    if (!empty($data->categoryId)) {
        // Update by category
        $stmt = $pdo->prepare('
            UPDATE Pricing pr
            JOIN Product p ON pr.productId = p.id
            SET pr.priceUsd = pr.priceUsd * :mult
            WHERE p.categoryId = :catId
        ');
        $stmt->execute([':mult' => $multiplier, ':catId' => $data->categoryId]);
        $updatedCount = $stmt->rowCount();

    } elseif (!empty($data->productIds) && is_array($data->productIds)) {
        // Update specific products
        $inQuery = implode(',', array_fill(0, count($data->productIds), '?'));
        
        $sql = "UPDATE Pricing SET priceUsd = priceUsd * ? WHERE productId IN ($inQuery)";
        $stmt = $pdo->prepare($sql);
        
        $params = array_merge([$multiplier], $data->productIds);    
        $stmt->execute($params);
        $updatedCount = $stmt->rowCount();

    } else {
        http_response_code(400);
        echo json_encode(['error' => 'Se requiere categoryId o productIds']);
        exit();
    }

    $pdo->commit();

    echo json_encode([
        'success' => true,
        'message' => "Precios actualizados masivamente",
        'updatedCount' => $updatedCount
    ]);

} catch (\PDOException $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['error' => 'Error de base de datos', 'details' => $e->getMessage()]);
}
?>
