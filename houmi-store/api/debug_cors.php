<?php
/**
 * debug_cors.php - Diagnóstico de CORS y configuración del servidor
 * Subir a: api.houmi.shop/debug_cors.php
 * Acceder desde el navegador o con curl para ver el diagnóstico.
 * ⚠️ ELIMINAR ESTE ARCHIVO DESPUÉS DE DIAGNOSTICAR
 */

// Forzar respuesta JSON con CORS abierto para este diagnóstico
$origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
header("Access-Control-Allow-Origin: $origin");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");
header("Vary: Origin");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit();
}

// ── Recopilar información ─────────────────────────────────────────────────────

$info = [];

// 1. Request info
$info['request'] = [
    'method'     => $_SERVER['REQUEST_METHOD'] ?? 'unknown',
    'origin'     => $_SERVER['HTTP_ORIGIN'] ?? '(no Origin header)',
    'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown',
    'remote_ip'  => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
    'request_uri'=> $_SERVER['REQUEST_URI'] ?? 'unknown',
    'http_host'  => $_SERVER['HTTP_HOST'] ?? 'unknown',
    'https'      => (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'YES' : 'NO',
];

// 2. All incoming headers
$allHeaders = [];
foreach ($_SERVER as $key => $value) {
    if (str_starts_with($key, 'HTTP_')) {
        $headerName = str_replace('_', '-', substr($key, 5));
        $allHeaders[$headerName] = $value;
    }
}
$info['incoming_headers'] = $allHeaders;

// 3. CORS logic test
$allowedOrigins = [
    'http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174',
    'http://127.0.0.1:3000', 'http://localhost', 'http://127.0.0.1',
    'https://houmi.vercel.app', 'https://houmi-store-xi.vercel.app',
    'https://www.houmi.shop', 'https://houmi.shop',
    'https://api.houmi.shop', 'https://site.houmi.shop',
];
$requestOrigin = $_SERVER['HTTP_ORIGIN'] ?? '';
$isAllowed     = in_array($requestOrigin, $allowedOrigins, true)
    || preg_match('#^https://[^/]+\.vercel\.app$#i', $requestOrigin) === 1;

$info['cors_check'] = [
    'request_origin'    => $requestOrigin ?: '(not sent)',
    'is_in_whitelist'   => in_array($requestOrigin, $allowedOrigins, true),
    'matches_vercel_re' => preg_match('#^https://[^/]+\.vercel\.app$#i', $requestOrigin) === 1,
    'would_allow_cors'  => $isAllowed,
    'allowed_origins'   => $allowedOrigins,
];

// 4. PHP & Server environment
$info['environment'] = [
    'php_version'    => PHP_VERSION,
    'server_software'=> $_SERVER['SERVER_SOFTWARE'] ?? 'unknown',
    'document_root'  => $_SERVER['DOCUMENT_ROOT'] ?? 'unknown',
    'script_filename'=> $_SERVER['SCRIPT_FILENAME'] ?? 'unknown',
    'cwd'            => getcwd(),
];

// 5. Apache modules (if available)
$info['apache_modules'] = [];
if (function_exists('apache_get_modules')) {
    $modules = apache_get_modules();
    $info['apache_modules'] = [
        'all_modules'       => $modules,
        'mod_headers'       => in_array('mod_headers', $modules) ? 'ENABLED' : 'DISABLED',
        'mod_rewrite'       => in_array('mod_rewrite', $modules) ? 'ENABLED' : 'DISABLED',
        'mod_security'      => in_array('mod_security2', $modules) ? 'ENABLED' : 'DISABLED ✅',
    ];
} else {
    $info['apache_modules'] = 'apache_get_modules() not available (FastCGI/FPM mode)';
}

// 6. Files in current directory
$apiDir = __DIR__;
$files  = [];
if (is_dir($apiDir)) {
    foreach (scandir($apiDir) as $f) {
        if ($f === '.' || $f === '..') continue;
        $files[] = $f . (is_dir("$apiDir/$f") ? '/' : '');
    }
}
$info['api_files'] = $files;

// 7. Check db.php exists and read first lines
$dbFile = $apiDir . '/db.php';
if (file_exists($dbFile)) {
    $info['db_php'] = [
        'exists'     => true,
        'size_bytes' => filesize($dbFile),
        'first_lines'=> implode("\n", array_slice(file($dbFile), 0, 10)),
    ];
} else {
    $info['db_php'] = ['exists' => false];
}

// 8. Check .htaccess
$htaccessFile = $apiDir . '/.htaccess';
if (file_exists($htaccessFile)) {
    $info['htaccess'] = [
        'exists'  => true,
        'content' => file_get_contents($htaccessFile),
    ];
} else {
    $info['htaccess'] = ['exists' => false];
}

// 9. Response headers we are sending (this script)
$info['response_headers_sent_by_this_script'] = headers_list();

// 10. Diagnosis summary
$problems = [];
if (!$isAllowed && $requestOrigin) {
    $problems[] = "❌ Origin '$requestOrigin' NOT in whitelist — CORS would be blocked";
}
if ($requestOrigin === '') {
    $problems[] = "⚠️ No 'Origin' header in request — test from browser with origin or add ?origin=https://site.houmi.shop";
}
if (!function_exists('apache_get_modules')) {
    $problems[] = "⚠️ Cannot detect Apache modules (PHP running as FPM/CGI) — mod_headers status unknown";
}
if (empty($problems)) {
    $problems[] = "✅ No obvious CORS problems detected from PHP side";
}
$info['diagnosis'] = $problems;

echo json_encode($info, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
