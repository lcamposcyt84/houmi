<?php
// upload.php - Secure image upload for products
require_once dirname(__DIR__) . '/auth.php';

$admin = requireAdminAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['error' => 'No se proporcionó imagen válida o ocurrió un error al subirla']);
    exit();
}

$file = $_FILES['file'];
$uploadDir = dirname(dirname(dirname(__DIR__))) . '/public/uploads/'; // Adjust root path as needed in Hostinger

// Ensure directory exists
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// Validate file type
$allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
$fileInfo = finfo_open(FILEINFO_MIME_TYPE);
$mimeType = finfo_file($fileInfo, $file['tmp_name']);
finfo_close($fileInfo);

if (!in_array($mimeType, $allowedTypes)) {
    http_response_code(400);
    echo json_encode(['error' => 'Tipo de archivo no permitido. Solo JPG, PNG, WEBP o GIF.']);
    exit();
}

// Generate unique filename
$extension = pathinfo($file['name'], PATHINFO_EXTENSION);
$filename = uniqid('img_', true) . '.' . $extension;
$destination = $uploadDir . $filename;

if (move_uploaded_file($file['tmp_name'], $destination)) {
    // Return relative URL for Next.js frontend
    $url = '/uploads/' . $filename;
    
    http_response_code(201);
    echo json_encode([
        'success' => true,
        'url' => $url,
        'message' => 'Imagen subida exitosamente'
    ]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Error al mover el archivo subido al directorio de destino']);
}
?>
