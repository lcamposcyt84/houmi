<?php
require_once dirname(__DIR__) . '/db.php';
require_once 'jwt.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

$jwt_secret = "1ad4f5bc6463a575304c28de4ccb4ebd3a1f2977b368f0e25c93cd381af40254";
$data = json_decode(file_get_contents("php://input"));

if (empty($data->email) || empty($data->password) || empty($data->firstName) || empty($data->lastName)) {
    http_response_code(400);
    echo json_encode(['error' => 'Todos los campos son obligatorios']);
    exit();
}

try {
    // Check if email exists
    $stmt = $pdo->prepare('SELECT id FROM Customer WHERE email = :email LIMIT 1');
    $stmt->execute([':email' => $data->email]);
    if ($stmt->fetch()) {
        http_response_code(400);
        echo json_encode(['error' => 'El correo ya está registrado']);
        exit();
    }

    // Hash password 
    $hashedPassword = password_hash($data->password, PASSWORD_BCRYPT);
    $customerId = 'cst_' . bin2hex(random_bytes(8)); // Simulate CUID

    // Insert customer
    $insertStmt = $pdo->prepare('
        INSERT INTO Customer (id, firstName, lastName, email, phone, password, createdAt, updatedAt) 
        VALUES (:id, :firstName, :lastName, :email, :phone, :password, NOW(), NOW())
    ');
    
    $insertStmt->execute([
        ':id' => $customerId,
        ':firstName' => $data->firstName,
        ':lastName' => $data->lastName,
        ':email' => $data->email,
        ':phone' => $data->phone ?? null,
        ':password' => $hashedPassword
    ]);

    // Generate JWT
    $payload = [
        'customerId' => $customerId,
        'email' => $data->email,
        'iat' => time(),
        'exp' => time() + (7 * 24 * 60 * 60)
    ];

    $token = generate_jwt($payload, $jwt_secret);
    setcookie("auth_token", $token, [
        'expires'  => time() + (7 * 24 * 60 * 60),
        'path'     => '/',
        'domain'   => '',
        'secure'   => false,
        'httponly' => true,
        'samesite' => 'Lax',    // Lax works for same-site (localhost) without Secure
    ]);

    http_response_code(201);
    echo json_encode([
        'success' => true,
        'token' => $token,
        'customer' => [
            'id' => $customerId,
            'firstName' => $data->firstName,
            'lastName' => $data->lastName,
            'email' => $data->email,
            'avatar' => null,
            'phone' => $data->phone ?? null
        ]
    ]);

} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error', 'details' => $e->getMessage()]);
}
?>
