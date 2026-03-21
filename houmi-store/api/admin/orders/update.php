<?php
// update.php - Update the status of an order 
require_once dirname(dirname(__DIR__)) . '/db.php';
require_once dirname(__DIR__) . '/auth.php';

$admin = requireAdminAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

$data = json_decode(file_get_contents("php://input"));

if (empty($data->orderId) || empty($data->status)) {
    http_response_code(400);
    echo json_encode(['error' => 'orderId y status son requeridos']);
    exit();
}

// Valid status ENUM values
$validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
if (!in_array($data->status, $validStatuses)) {
    http_response_code(400);
    echo json_encode(['error' => 'Estado no válido']);
    exit();
}

try {
    $stmt = $pdo->prepare('UPDATE Sale SET status = :status, updatedAt = NOW() WHERE id = :id');
    $stmt->execute([':status' => $data->status, ':id' => $data->orderId]);

    if ($stmt->rowCount() > 0) {
        http_response_code(200);
        echo json_encode(['success' => true, 'message' => 'Estado actualizado a ' . $data->status]);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Orden no encontrada']);
    }

} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error', 'details' => $e->getMessage()]);
}
?>
