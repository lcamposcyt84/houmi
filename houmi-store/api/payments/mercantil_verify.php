<?php
require_once dirname(__DIR__) . '/db.php';

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

$transactiondata = $data->transactiondata ?? null;

if (!$transactiondata) {
    http_response_code(400);
    echo json_encode(['error' => 'transactiondata requerido']);
    exit();
}

try {
    // Try to decrypt with encryption key, fallback to plain base64
    $settingsStmt = $pdo->prepare("SELECT paymentEncryptionKey FROM Settings WHERE id = 'main'");
    $settingsStmt->execute();
    $settings = $settingsStmt->fetch();
    $encryptionKey = $settings['paymentEncryptionKey'] ?? '';

    $raw = base64_decode($transactiondata);
    $txInfo = null;

    if (!empty($encryptionKey) && strlen($raw) > 16) {
        $iv = substr($raw, 0, 16);
        $ciphertext = substr($raw, 16);
        $decrypted = openssl_decrypt($ciphertext, 'aes-256-cbc', substr(hash('sha256', $encryptionKey, true), 0, 32), OPENSSL_RAW_DATA, $iv);
        if ($decrypted !== false) {
            $txInfo = json_decode($decrypted, true);
        }
    }

    if (!$txInfo) {
        $txInfo = json_decode($raw, true);
    }

    // Extraer el orderNumber desde el invoiceNumber (que rellenamos con ceros y es un string)
    $receivedInvoiceNumber = $txInfo['invoiceNumber'] ?? $txInfo['orderNumber'] ?? null;
    
    if ($receivedInvoiceNumber) {
        // Quitamos los ceros a la izquierda que le agregamos en el redirect
        $cleanReceived = ltrim($receivedInvoiceNumber, '0');
        
        // Buscamos la orden donde el orderNumber (sin guiones) coincida con el cleanReceived
        $searchStmt = $pdo->prepare("SELECT orderNumber FROM Sale WHERE REPLACE(orderNumber, '-', '') = :clean");
        $searchStmt->execute([':clean' => $cleanOrderNum ?? $cleanReceived]);
        $foundOrder = $searchStmt->fetch();

        if ($foundOrder) {
            $realOrderNumber = $foundOrder['orderNumber'];
            $updateStmt = $pdo->prepare("UPDATE Sale SET status = 'paid', paymentStatus = 'confirmed', paymentConfirmedAt = NOW(), updatedAt = NOW() WHERE orderNumber = :ord");
            $updateStmt->execute([':ord' => $realOrderNumber]);
            
            echo json_encode([
                'approved' => true,
                'orderNumber' => $realOrderNumber,
                'bankResponse' => [
                    'responseMessage' => 'Transacción aprobada'
                ]
            ]);
            exit();
        }
    }

} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error de base de datos']);
}
