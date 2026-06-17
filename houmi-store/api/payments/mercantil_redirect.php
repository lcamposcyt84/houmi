<?php
require_once dirname(__DIR__) . '/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

$data = json_decode(file_get_contents('php://input'));
$orderNumber = $data->orderNumber ?? null;

if (!$orderNumber) {
    http_response_code(400);
    echo json_encode(['error' => 'Número de orden requerido']);
    exit();
}

try {
    $settingsStmt = $pdo->prepare("SELECT paymentGatewayUrl, paymentMerchantId, paymentIntegratorId, paymentEncryptionKey FROM Settings WHERE id = 'main'");
    $settingsStmt->execute();
    $settings = $settingsStmt->fetch();

    $gatewayUrl = $settings['paymentGatewayUrl'] ?? '';
    $merchantId = $settings['paymentMerchantId'] ?? 'J303174043';
    $integratorId = $settings['paymentIntegratorId'] ?? '31';
    $encryptionKey = $settings['paymentEncryptionKey'] ?? '';

    if (empty($gatewayUrl)) {
        http_response_code(400);
        echo json_encode(['error' => 'Pasarela de pago no configurada']);
        exit();
    }

    $orderStmt = $pdo->prepare("SELECT * FROM Sale WHERE orderNumber = :ord");
    $orderStmt->execute([':ord' => $orderNumber]);
    $order = $orderStmt->fetch();

    if (!$order) {
        http_response_code(404);
        echo json_encode(['error' => 'Orden no encontrada']);
        exit();
    }

    // Formatear el invoiceNumber a 12 caracteres alfanuméricos (Requerido por Mercantil)
    // Conservamos el orderNumber original eliminando el guión. Ej: "ORD-1A2B3C4D" -> "ORD1A2B3C4D" (11 chars) -> "0ORD1A2B3C4D" (12 chars)
    $cleanOrderNum = preg_replace('/[^a-zA-Z0-9]/', '', $orderNumber);
    $invoiceNumberStr = str_pad(substr($cleanOrderNum, 0, 12), 12, '0', STR_PAD_LEFT);

    // Determinar URL de retorno dinámica (a donde redirigirá el banco tras pagar)
    // ATENCIÓN: El banco rechaza la transacción si la URL contiene parámetros extra (?order=...)
    $returnUrl = "https://site.houmi.shop/checkout/success";

    // Construir el payload EXACTAMENTE como lo requiere el Gateway de Mercantil
    $txPayload = json_encode([
        'merchantId' => $merchantId,
        'amount' => number_format((float)$order['totalVes'], 2, '.', ''), // Monto en VES
        'returnUrl' => $returnUrl,
        'invoiceNumber' => $invoiceNumberStr, // El banco pide que sea un string directo de 12 caracteres
        'trxType' => 'compra',
        'currency' => 'ves',
        'customerName' => $order['customerName'] ?? 'Cliente',
        'paymentConcepts' => ['c2p', 'b2b', 'tdd']
    ], JSON_UNESCAPED_SLASHES);

    if (!empty($encryptionKey)) {
        $iv = openssl_random_pseudo_bytes(16);
        $encrypted = openssl_encrypt($txPayload, 'aes-256-cbc', substr(hash('sha256', $encryptionKey, true), 0, 32), OPENSSL_RAW_DATA, $iv);
        $transactiondata = base64_encode($iv . $encrypted);
    } else {
        $transactiondata = base64_encode($txPayload);
    }

    $separator = strpos($gatewayUrl, '?') === false ? '?' : '&';
    $redirectUrl = $gatewayUrl . $separator . http_build_query([
        'merchantid' => $merchantId,
        'transactiondata' => $transactiondata,
        'integratorid' => $integratorId
    ]);

    echo json_encode(['redirectUrl' => $redirectUrl]);

} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error de base de datos']);
} catch (\Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
