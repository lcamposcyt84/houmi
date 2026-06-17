<?php
require_once dirname(__DIR__) . '/db.php';
require_once 'IpgBdv2.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

$rawBody = file_get_contents('php://input');
$data = json_decode($rawBody);

if (!$data) {
    parse_str($rawBody, $formData);
    $data = (object)$formData;
}

$token = $data->token ?? null;
$orderNumber = $data->orderNumber ?? null;

if (!$token || !$orderNumber) {
    http_response_code(400);
    echo json_encode(['error' => 'token y orderNumber requeridos']);
    exit();
}

try {
    $settingsStmt = $pdo->prepare("SELECT paymentMerchantId, paymentEncryptionKey FROM Settings WHERE id = 'main'");
    $settingsStmt->execute();
    $settings = $settingsStmt->fetch();

    $merchantId = $settings['paymentMerchantId'] ?? '72744004';
    $encryptionKey = $settings['paymentEncryptionKey'] ?? 'Htnq1p3J';

    $ipg = new IpgBdv2($merchantId, $encryptionKey);
    $resp = $ipg->checkPayment($token);

    if ($resp->success && $resp->responseCode == 0) {
        $updateStmt = $pdo->prepare("UPDATE Sale SET status = 'paid', paymentStatus = 'confirmed', paymentConfirmedAt = NOW(), paymentReference = :ref, updatedAt = NOW() WHERE orderNumber = :ord");
        $updateStmt->execute([
            ':ord' => $orderNumber,
            ':ref' => $resp->transactionId ?? $token
        ]);

        echo json_encode([
            'approved' => true,
            'orderNumber' => $orderNumber,
            'bankResponse' => [
                'responseMessage' => 'Transacción aprobada (BDV)',
                'reference' => $resp->transactionId ?? ''
            ]
        ]);
    } else {
        http_response_code(400);
        echo json_encode([
            'approved' => false,
            'error' => $resp->responseMessage ?? 'Pago rechazado o no encontrado'
        ]);
    }

} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error de base de datos']);
} catch (\Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
