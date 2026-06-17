<?php
require_once dirname(__DIR__) . '/db.php';
require_once 'IpgBdv2.php';

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

    $merchantId = $settings['paymentMerchantId'] ?? 'J303174043';
    $encryptionKey = $settings['paymentEncryptionKey'] ?? '';

    $orderStmt = $pdo->prepare("SELECT s.*, c.email, c.phone FROM Sale s LEFT JOIN Customer c ON s.customerId = c.id WHERE s.orderNumber = :ord");
    $orderStmt->execute([':ord' => $orderNumber]);
    $order = $orderStmt->fetch();

    if (!$order) {
        http_response_code(404);
        echo json_encode(['error' => 'Orden no encontrada']);
        exit();
    }

    $idLetter = $data->idLetter ?? 'V';
    $idNumber = $data->idNumber ?? '';

    $ipg = new IpgBdv2($merchantId, $encryptionKey);

    $req = new IpgBdvPaymentRequest();
    $req->idLetter = $idLetter;
    $req->idNumber = $idNumber;
    $req->amount = (float) $order['totalVes'];
    $req->currency = 1; // 1 = Bs, 2 = USD
    $req->reference = $orderNumber;
    $req->title = "Pago Orden " . $orderNumber;
    $req->description = "Compra en tienda";
    $req->email = $order['email'] ?? 'correo@ejemplo.com';
    $req->cellphone = $order['phone'] ?? '0000000000';
    
    // Determinar la URL de retorno basado en el origen de la petición
    $origin = $_SERVER['HTTP_ORIGIN'] ?? 'https://www.houmi.shop';
    $req->urlToReturn = $origin . '/checkout/payment?status=verifying&order=' . $orderNumber . '&token={ID}';
    
    // RIF si aplica
    $req->rifLetter = $idLetter;
    $req->rifNumber = $idNumber;

    $resp = $ipg->createPayment($req);

    if ($resp->success) {
        echo json_encode(['paymentUrl' => $resp->urlPayment]);
    } else {
        http_response_code(400);
        echo json_encode(['error' => $resp->responseMessage]);
    }

} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error de base de datos']);
} catch (\Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
