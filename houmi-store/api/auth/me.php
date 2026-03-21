<?php
// me.php - Get the currently authenticated customer
require_once dirname(__DIR__) . '/db.php';
require_once 'check.php';

$customer = getAuthenticatedCustomer();

if (!$customer) {
    http_response_code(401);
    echo json_encode(['error' => 'No autorizado']);
    exit();
}

try {
    $stmt = $pdo->prepare('SELECT id, firstName, lastName, email, phone, avatar FROM Customer WHERE id = :id LIMIT 1');
    $stmt->execute([':id' => $customer['customerId']]);
    $row = $stmt->fetch();

    if (!$row) {
        http_response_code(404);
        echo json_encode(['error' => 'Cliente no encontrado']);
        exit();
    }

    echo json_encode(['customer' => $row]);

} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error']);
}
?>
