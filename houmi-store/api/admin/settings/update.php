<?php
require_once dirname(dirname(__DIR__)) . '/db.php';
require_once dirname(__DIR__) . '/auth.php';

$admin = requireAdminAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'PUT') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON']);
    exit();
}

try {
    $fields = [];
    $params = [];

    $allowedFields = [
        'storeName', 'storeDescription', 'exchangeRateUsdToVes', 'whatsappNumber',
        'mercantilApiUrl', 'mercantilIdComercio', 'mercantilClavePublica', 'mercantilToken'
    ];

    foreach ($allowedFields as $field) {
        if (isset($input[$field])) {
            $fields[] = "$field = :$field";
            $params[":$field"] = $input[$field];
        }
    }

    if (empty($fields)) {
        http_response_code(400);
        echo json_encode(['error' => 'No valid fields to update']);
        exit();
    }

    $fields[] = 'updatedAt = NOW()';
    $params[':id'] = 'main';

    $stmt = $pdo->prepare('UPDATE Settings SET ' . implode(', ', $fields) . ' WHERE id = :id');
    $stmt->execute($params);

    echo json_encode(['success' => true]);

} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error', 'details' => $e->getMessage()]);
}
?>
