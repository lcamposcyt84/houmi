<?php
// api/admin/auth.php - Admin Authentication middleware
require_once dirname(__DIR__) . '/auth/jwt.php';

function getAuthenticatedAdmin() {
    $jwt_secret = "1ad4f5bc6463a575304c28de4ccb4ebd3a1f2977b368f0e25c93cd381af40254"; // En producción debe venir de entorno o config segura
    
    // First, try to read from HttpOnly Cookie (Next.js auth method)
    $token = $_COOKIE['admin_session'] ?? null;

    // Second, try Authorization header for API access
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

    $payload = verify_jwt($token, $jwt_secret);
    if ($payload && isset($payload['role']) && $payload['role'] === 'admin') {
        return $payload;
    }
    
    return null;
}

function requireAdminAuth() {
    $admin = getAuthenticatedAdmin();
    if (!$admin) {
        http_response_code(401);
        echo json_encode(['error' => 'No autorizado - Requiere privilegios de administrador']);
        exit();
    }
    return $admin;
}
?>
