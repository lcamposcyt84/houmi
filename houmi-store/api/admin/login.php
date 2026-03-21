<?php
// api/admin/login.php - Admin login endpoint
require_once dirname(__DIR__) . '/db.php';
require_once dirname(__DIR__) . '/auth/jwt.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

$jwt_secret = "1ad4f5bc6463a575304c28de4ccb4ebd3a1f2977b368f0e25c93cd381af40254";
$data = json_decode(file_get_contents("php://input"));

if (empty($data->email) || empty($data->password)) {
    http_response_code(400);
    echo json_encode(['error' => 'Email y contraseña requeridos']);
    exit();
}

try {
    $stmt = $pdo->prepare('SELECT * FROM Admin WHERE email = :email LIMIT 1');
    $stmt->execute([':email' => $data->email]);
    $admin = $stmt->fetch();

    // Verify bcrypt password
    if (!$admin || !password_verify($data->password, $admin['password'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Credenciales inválidas']);
        exit();
    }

    // Generate Admin JWT
    $payload = [
        'adminId' => $admin['id'],
        'email' => $admin['email'],
        'role' => 'admin',
        'permissions' => $admin['permissions'] ?? 'all',
        'iat' => time(),
        'exp' => time() + (24 * 60 * 60) // 24 hours expiration for admin
    ];

    $token = generate_jwt($payload, $jwt_secret);

    // Set HTTPOnly cookie for the admin session
    setcookie("admin_session", $token, time() + (24 * 60 * 60), "/", "", false, true);

    unset($admin['password']);

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'token' => $token,
        'user' => [
            'id' => $admin['id'],
            'email' => $admin['email'],
            'name' => $admin['name'],
            'role' => 'admin'
        ]
    ]);

} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error de base de datos']);
}
?>
