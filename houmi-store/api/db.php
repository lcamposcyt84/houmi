<?php
// db.php - Database connection using PDO

// --- CORS: allow credentials from known origins
$allowedOrigins = [
    'http://localhost:3000',     // Next.js dev
    'http://localhost:5173',     // Vite dev
    'http://localhost:5174',     // Vite dev (alternate)
    'http://127.0.0.1:3000',     // Next.js dev
    'http://localhost',          // XAMPP
    'http://127.0.0.1',          // XAMPP
    'https://houmi.vercel.app',  // Vercel
    'https://houmi-store-xi.vercel.app', 
    'https://www.houmi.shop',    
    'https://houmi.shop',        
    'https://api.houmi.shop',
    'https://site.houmi.shop',   // Nuevo subdominio Frontend
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
// Cualquier preview/deploy en *.vercel.app (HTTPS)
$isVercelApp = $origin !== '' && preg_match('#^https://[^/]+\.vercel\.app$#i', $origin) === 1;

if (in_array($origin, $allowedOrigins, true) || $isVercelApp) {
    header("Access-Control-Allow-Origin: $origin");
} elseif ($origin === '') {
    // Peticiones sin cabecera Origin (curl, algunos proxies): solo dev
    header("Access-Control-Allow-Origin: http://localhost:3000");
}
// Si Origin viene pero no está permitido, no enviar ACAO equivocado (el navegador exige coincidencia exacta)
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, Cookie");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight OPTIONS requests for CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit();
}

$host = 'localhost';
$charset = 'utf8mb4';

// Auto-detect environment:
// On Hostinger, the server name will contain the production domain.
// On local XAMPP, HTTP_HOST is localhost or localhost:3000.
$httpHost = $_SERVER['HTTP_HOST'] ?? 'localhost';
$isProduction = (strpos($httpHost, 'localhost') === false) && (strpos($httpHost, '127.0.0.1') === false);

if ($isProduction) {
    // --- Hostinger Production ---
    $db   = 'u111276354_produccion';
    $user = 'u111276354_store';
    $pass = 'Houmi2026';
} else {
    // --- Local XAMPP Development ---
    $db   = 'houmi_dev';
    $user = 'root';
    $pass = '';
}

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database connection failed"]);
    exit();
}
?>
