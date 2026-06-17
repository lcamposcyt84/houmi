<?php
/**
 * check_payment_config.php
 * Diagnóstico de configuración del botón de pagos Mercantil.
 * Subir a: api.houmi.shop/check_payment_config.php
 * ⚠️ ELIMINAR DESPUÉS DE VERIFICAR
 */
require_once __DIR__ . '/db.php';

$stmt = $pdo->query("SELECT 
    paymentGatewayUrl,
    paymentMerchantId,
    paymentIntegratorId,
    LEFT(paymentEncryptionKey, 10) AS encryptionKeyPreview,
    LENGTH(paymentEncryptionKey) AS encryptionKeyLength,
    mercantilApiUrl,
    mercantilIdComercio,
    exchangeRateUsdToVes
FROM Settings WHERE id = 'main'");

$settings = $stmt->fetch();

if (!$settings) {
    echo json_encode(['error' => 'No Settings row found (id=main does not exist)']);
    exit();
}

$diagnostics = [
    'database_has_row'       => true,
    'paymentGatewayUrl'      => $settings['paymentGatewayUrl'] ?: '❌ NULL / VACÍO — migración no ejecutada?',
    'paymentMerchantId'      => $settings['paymentMerchantId'] ?: '❌ NULL / VACÍO',
    'paymentIntegratorId'    => $settings['paymentIntegratorId'] ?: '❌ NULL / VACÍO',
    'encryptionKey_preview'  => $settings['encryptionKeyPreview'] ?: '❌ NULL / VACÍO',
    'encryptionKey_length'   => $settings['encryptionKeyLength'],
    'mercantilApiUrl'        => $settings['mercantilApiUrl'] ?: '⚠️ NULL',
    'mercantilIdComercio'    => $settings['mercantilIdComercio'] ?: '⚠️ NULL',
    'exchangeRate'           => $settings['exchangeRateUsdToVes'],
    'redirect_url_preview'   => null,
];

// Simulate what mercantil_redirect.php would build
if ($settings['paymentGatewayUrl']) {
    $gatewayUrl   = $settings['paymentGatewayUrl'];
    $merchantId   = $settings['paymentMerchantId']   ?? 'J303174043';
    $integratorId = $settings['paymentIntegratorId'] ?? '31';
    $separator    = strpos($gatewayUrl, '?') === false ? '?' : '&';

    $diagnostics['redirect_url_preview'] = $gatewayUrl . $separator . http_build_query([
        'merchantid'      => $merchantId,
        'transactiondata' => base64_encode(json_encode(['test' => true, 'ts' => time()])),
        'integratorid'    => $integratorId,
    ]);

    // Check if it looks like test or production
    $isTest = stripos($gatewayUrl, 'test') !== false 
           || stripos($gatewayUrl, 'sandbox') !== false
           || stripos($gatewayUrl, 'desqa') !== false;
    $diagnostics['environment'] = $isTest ? '⚠️ TEST/SANDBOX URL detectada' : '✅ Parece URL de producción';
} else {
    $diagnostics['redirect_url_preview'] = '❌ No se puede construir — paymentGatewayUrl está vacío';
    $diagnostics['environment']          = '❌ Sin configurar';
}

echo json_encode($diagnostics, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
