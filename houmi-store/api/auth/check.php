<?php
// api/auth/check.php - Authentication middleware
require_once __DIR__ . '/jwt.php';

function getAuthenticatedCustomer() {
    $jwt_secret = "1ad4f5bc6463a575304c28de4ccb4ebd3a1f2977b368f0e25c93cd381af40254";
    
    // First, try to read auth_token (standard name), fallback to customer_session
    $token = $_COOKIE['auth_token'] ?? $_COOKIE['customer_session'] ?? null;

    // Second, try to read from Authorization header if strictly REST
    if (!$token) {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? '';
        if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            $token = $matches[1];
        }
    }

    if (!$token) {
        return null;
    }

    return verify_jwt($token, $jwt_secret);
}

function requireAuth() {
    $customer = getAuthenticatedCustomer();
    if (!$customer) {
        http_response_code(401);
        echo json_encode(['error' => 'No autorizado']);
        exit();
    }
    return $customer;
}
?>
