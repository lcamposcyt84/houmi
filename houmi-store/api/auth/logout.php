<?php
// logout.php - Invalidate session cookie
require_once dirname(__DIR__) . '/db.php';

// Clear the auth_token cookie
setcookie("auth_token", "", [
    'expires'  => time() - 3600,
    'path'     => '/',
    'domain'   => '',
    'secure'   => false,
    'httponly' => true,
    'samesite' => 'None',
]);

// Also clear the old cookie name for compatibility
setcookie("customer_session", "", [
    'expires'  => time() - 3600,
    'path'     => '/',
    'domain'   => '',
    'secure'   => false,
    'httponly' => true,
    'samesite' => 'None',
]);

echo json_encode(['success' => true, 'message' => 'Sesión cerrada']);
?>
