<?php
// get.php - Fetch store settings
require_once dirname(dirname(__DIR__)) . '/db.php';
require_once dirname(__DIR__) . '/auth.php';

$admin = requireAdminAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

try {
    $stmt = $pdo->query("SELECT * FROM Settings WHERE id = 'main'");
    $settings = $stmt->fetch();

    if (!$settings) {
        http_response_code(404);
        echo json_encode(['error' => 'Configuración no encontrada']);
        exit();
    }

    echo json_encode([
        'settings' => [
            'id' => $settings['id'],
            'exchangeRateUsdToVes' => (float)$settings['exchangeRateUsdToVes'],
            'storeName' => $settings['storeName'],
            'storeDescription' => $settings['storeDescription'],
            'whatsappNumber' => $settings['whatsappNumber'],
            // Don't expose Mercantile secrets even to admins, only public configuration or masked keys
            // But since this is the admin panel, they might need to see/edit them.
            'mercantilApiUrl' => $settings['mercantilApiUrl'],
            'mercantilIdComercio' => $settings['mercantilIdComercio'],
            'paymentGatewayUrl' => $settings['paymentGatewayUrl'],
            'paymentMerchantId' => $settings['paymentMerchantId'],
            'paymentIntegratorId' => $settings['paymentIntegratorId'],
            'paymentEncryptionKey' => $settings['paymentEncryptionKey'],
            'updatedAt' => $settings['updatedAt']
        ]
    ]);

} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error', 'details' => $e->getMessage()]);
}
?>
