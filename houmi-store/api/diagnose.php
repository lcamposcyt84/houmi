<?php
// Script de Diagnóstico para Hostinger
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json');
require_once 'db.php';

$output = [
    'system' => php_uname(),
    'php_version' => phpversion(),
    'tables' => [],
    'errors' => []
];

try {
    // Probar conexión básica (health.php hace esto, debe pasar)
    $stmt = $pdo->query("SELECT 1");
    $output['db_connection'] = 'ok';
    
    // Obtener nombres exactos de las tablas (¡Linux es Case-Sensitive!)
    $tablesStmt = $pdo->query("SHOW TABLES");
    $tables = $tablesStmt->fetchAll(PDO::FETCH_COLUMN);
    $output['tables_found'] = $tables;
    
    // Probar get_products table case sensitivity
    // get_products usa "Product", "Category", "Pricing", "Inventory", "Settings"
    $required = ['Product', 'Category', 'Pricing', 'Inventory', 'Settings'];
    $case_issues = [];
    foreach ($required as $req) {
        if (!in_array($req, $tables)) {
            // Check if a lowercase version exists
            $lowercase = strtolower($req);
            if (in_array($lowercase, $tables)) {
                $case_issues[] = "La tabla '$req' se llama '$lowercase' en el servidor. Linux diferencia Mayúsculas de Minúsculas.";
            } else {
                $case_issues[] = "La tabla '$req' no existe en lo absoluto en la base de datos.";
            }
        }
    }
    
    if (!empty($case_issues)) {
        $output['errors']['case_sensitivity_database'] = $case_issues;
    }
} catch (Exception $e) {
    $output['errors']['database_exception'] = $e->getMessage();
}

echo json_encode($output, JSON_PRETTY_PRINT);
exit;
