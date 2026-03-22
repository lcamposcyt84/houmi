<?php
require_once 'db.php';

// Limpiar buffers
if (ob_get_length()) ob_clean();

$status = [
    'status' => 'ok',
    'message' => 'Houmi API is running correctly',
    'environment' => $isProduction ? 'production' : 'development',
    'php_version' => phpversion(),
    'timestamp' => date('c')
];

// Test Database Connection
try {
    $stmt = $pdo->query("SELECT 1");
    if ($stmt) {
        $status['database'] = 'connected';
    } else {
        throw new Exception("Query executed but returned false");
    }
} catch (Exception $e) {
    http_response_code(500);
    $status['status'] = 'error';
    $status['database'] = 'disconnected';
    $status['error_details'] = $e->getMessage();
}

echo json_encode($status);
exit();
