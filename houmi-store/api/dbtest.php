<?php
// TEMPORAL: Diagnostic script to test DB connection
// DELETE THIS FILE after diagnosing the issue
$host = 'localhost';
$db   = 'u111276354_produccion';
$user = 'u111276354_store';
$pass = 'Houmi2026';
$charset = 'utf8mb4';
$dsn = "mysql:host=$host;dbname=$db;charset=$charset";

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

try {
    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    ]);
    $stmt = $pdo->query('SELECT COUNT(*) as total FROM Product');
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    echo json_encode(['success' => true, 'products_in_db' => $result['total'], 'host' => $_SERVER['HTTP_HOST'] ?? 'unknown']);
} catch (\PDOException $e) {
    echo json_encode(['error' => $e->getMessage(), 'host_detected' => $_SERVER['HTTP_HOST'] ?? 'unknown']);
}
?>
