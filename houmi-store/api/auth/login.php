<?php
require_once dirname(__DIR__) . '/db.php';
require_once 'jwt.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

// Secret from .env.production.local
$jwt_secret = "1ad4f5bc6463a575304c28de4ccb4ebd3a1f2977b368f0e25c93cd381af40254";

$data = json_decode(file_get_contents("php://input"));

if (empty($data->email) || empty($data->password)) {
    http_response_code(400);
    echo json_encode(['error' => 'Email y contraseña son obligatorios']);
    exit();
}

try {
    $stmt = $pdo->prepare('SELECT * FROM Customer WHERE email = :email LIMIT 1');
    $stmt->execute([':email' => $data->email]);
    $customer = $stmt->fetch();

    if (!$customer || !password_verify($data->password, $customer['password'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Credenciales inválidas']);
        exit();
    }

    // Generate JWT
    $payload = [
        'customerId' => $customer['id'],
        'email' => $customer['email'],
        'iat' => time(),
        'exp' => time() + (7 * 24 * 60 * 60) // 7 days expiration
    ];

    $token = generate_jwt($payload, $jwt_secret);

    // SameSite=None required for cross-origin dev (Next.js port 3000 <-> PHP port 80)
    // Secure=false allowed since we're on localhost
    setcookie("auth_token", $token, [
        'expires'  => time() + (7 * 24 * 60 * 60),
        'path'     => '/',
        'domain'   => '',
        'secure'   => false,
        'httponly' => true,
        'samesite' => 'Lax',    // Lax works on localhost without requiring Secure
    ]);

    unset($customer['password']); // don't send the hash back

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'token' => $token,
        'customer' => [
            'id' => $customer['id'],
            'firstName' => $customer['firstName'],
            'lastName' => $customer['lastName'],
            'email' => $customer['email'],
            'avatar' => $customer['avatar'],
            'phone' => $customer['phone']
        ]
    ]);

} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error']);
}
?>
