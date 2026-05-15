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

$orderId = $input['orderId'] ?? $input['id'] ?? $_GET['orderId'] ?? $_GET['id'] ?? null;
if (!$orderId) {
    http_response_code(400);
    echo json_encode(['error' => 'Order ID is required']);
    exit();
}

try {
    $allowedStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'completed'];
    $fields = [];
    $params = [':id' => $orderId];

    if (isset($input['status'])) {
        $status = strtolower($input['status']);
        if (!in_array($status, $allowedStatuses)) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid status']);
            exit();
        }
        $fields[] = 'status = :status';
        $params[':status'] = $status;

        if ($status === 'confirmed' || $status === 'completed') {
            $fields[] = 'paymentStatus = :pstatus';
            $params[':pstatus'] = 'confirmed';
            $fields[] = 'paymentConfirmedAt = NOW()';
        }
    }

    if (isset($input['paymentMethod'])) {
        $fields[] = 'paymentMethod = :pm';
        $params[':pm'] = $input['paymentMethod'];
    }

    if (isset($input['paymentStatus'])) {
        $fields[] = 'paymentStatus = :ps';
        $params[':ps'] = $input['paymentStatus'];
    }

    if (isset($input['bankReference'])) {
        $fields[] = 'bankReference = :ref';
        $params[':ref'] = $input['bankReference'];
    }

    if (empty($fields)) {
        http_response_code(400);
        echo json_encode(['error' => 'No fields to update']);
        exit();
    }

    $fields[] = 'updatedAt = NOW()';
    $stmt = $pdo->prepare('UPDATE Sale SET ' . implode(', ', $fields) . ' WHERE id = :id');
    $stmt->execute($params);

    echo json_encode(['success' => true]);

} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error', 'details' => $e->getMessage()]);
}
?>
