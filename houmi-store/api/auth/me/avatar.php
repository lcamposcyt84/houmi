<?php
// avatar.php - Upload customer profile avatar
require_once dirname(dirname(__DIR__)) . '/db.php';
require_once dirname(dirname(__DIR__)) . '/auth/check.php';

$customer = requireAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

if (empty($_FILES['file'])) {
    http_response_code(400);
    echo json_encode(['error' => 'No se recibió ningún archivo']);
    exit();
}

$file = $_FILES['file'];
$allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
if (!in_array($file['type'], $allowedTypes)) {
    http_response_code(422);
    echo json_encode(['error' => 'Tipo de archivo no permitido. Usa JPG, PNG o WebP.']);
    exit();
}

if ($file['size'] > 2 * 1024 * 1024) {
    http_response_code(422);
    echo json_encode(['error' => 'La imagen supera el límite de 2MB.']);
    exit();
}

// Save to /uploads/avatars/ relative to the api root
$uploadsDir = dirname(dirname(dirname(__DIR__))) . '/uploads/avatars/';
if (!is_dir($uploadsDir)) {
    mkdir($uploadsDir, 0755, true);
}

$ext = pathinfo($file['name'], PATHINFO_EXTENSION) ?: 'jpg';
$filename = 'avatar_' . $customer['customerId'] . '_' . time() . '.' . $ext;
$destination = $uploadsDir . $filename;

if (!move_uploaded_file($file['tmp_name'], $destination)) {
    http_response_code(500);
    echo json_encode(['error' => 'Error al guardar la imagen']);
    exit();
}

// Build the public URL
$baseUrl = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http') 
    . '://' . $_SERVER['HTTP_HOST'];
$avatarUrl = $baseUrl . '/houmi-master/uploads/avatars/' . $filename;

try {
    $stmt = $pdo->prepare('UPDATE Customer SET avatar = :url WHERE id = :id');
    $stmt->execute([':url' => $avatarUrl, ':id' => $customer['customerId']]);

    echo json_encode(['success' => true, 'url' => $avatarUrl]);
} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error']);
}
?>
