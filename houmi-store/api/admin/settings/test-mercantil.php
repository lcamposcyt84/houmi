<?php
require_once dirname(dirname(__DIR__)) . '/db.php';
require_once dirname(__DIR__) . '/auth.php';

$admin = requireAdminAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);
$apiUrl = $input['apiUrl'] ?? null;
$idComercio = $input['idComercio'] ?? null;

if (!$apiUrl || !$idComercio) {
    $stmt = $pdo->query("SELECT mercantilApiUrl, mercantilIdComercio FROM Settings WHERE id = 'main'");
    $settings = $stmt->fetch();
    $apiUrl = $settings['mercantilApiUrl'] ?? null;
    $idComercio = $settings['mercantilIdComercio'] ?? null;
}

if (!$apiUrl) {
    http_response_code(400);
    echo json_encode(['error' => 'No mercantilApiUrl configured']);
    exit();
}

try {
    $ch = curl_init($apiUrl . '/api/health');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 15,
        CURLOPT_SSL_VERIFYPEER => false,
    ]);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);

    echo json_encode([
        'success' => $httpCode >= 200 && $httpCode < 500,
        'httpCode' => $httpCode,
        'response' => $response ? json_decode($response, true) : null,
        'curlError' => $error ?: null
    ]);

} catch (\Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Connection test failed', 'details' => $e->getMessage()]);
}
?>
