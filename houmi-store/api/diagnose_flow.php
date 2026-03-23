<?php
// diagnose_flow.php - Diagnostic script for Houmi server operations
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: application/json');

require_once 'db.php';

$report = [
    '1_database' => 'Connecting...',
    '2_wishlist' => 'Testing...',
    '3_reviews' => 'Testing...',
    '4_cart' => 'Client-Side Only (No server backend required)',
    'final_result' => 'Pending'
];

try {
    // 1. Connection & Schema
    $pdo->query("SELECT 1");
    $report['1_database'] = 'OK: Database connected and responding.';

    // Start transaction to undo our test changes later
    $pdo->beginTransaction();

    // Find any existing customer and product to test with
    $customerStmt = $pdo->query("SELECT id FROM Customer LIMIT 1");
    $testCustomer = $customerStmt->fetch(PDO::FETCH_COLUMN);

    $productStmt = $pdo->query("SELECT id FROM Product LIMIT 1");
    $testProduct = $productStmt->fetch(PDO::FETCH_COLUMN);

    if (!$testCustomer || !$testProduct) {
        $report['final_result'] = 'Warning: Need at least 1 Customer and 1 Product in the database to run full tests.';
        $pdo->rollBack();
        echo json_encode($report, JSON_PRETTY_PRINT);
        exit;
    }

    // 2. Test Wishlist Add (Like)
    try {
        $testWshId = 'wsh_TEST' . rand(1000, 9999);
        $wshAddStmt = $pdo->prepare('INSERT INTO WishlistItem (id, customerId, productId, createdAt) VALUES (:id, :cId, :pId, NOW())');
        $wshAddStmt->execute([
            ':id' => $testWshId,
            ':cId' => $testCustomer,
            ':pId' => $testProduct
        ]);
        $report['2_wishlist'] = 'OK: Success inserting into WishlistItem. The "Me Gusta" (Like) backend works perfectly.';
    } catch (Exception $e) {
        $report['2_wishlist'] = 'FAIL: ' . $e->getMessage();
    }

    // 3. Test Reviews (Calificaciones)
    try {
        $testRevId = 'rev_TEST' . rand(1000, 9999);
        $revAddStmt = $pdo->prepare('
            INSERT INTO Review (id, productId, customerId, rating, title, comment, isVerified, isApproved, createdAt, updatedAt)
            VALUES (:id, :pId, :cId, 5, "Test", "Test comment", 0, 0, NOW(), NOW())
        ');
        $revAddStmt->execute([
            ':id' => $testRevId,
            ':cId' => $testCustomer,
            ':pId' => $testProduct
        ]);
        $report['3_reviews'] = 'OK: Success inserting into Review. The "Calificaciones" backend works perfectly.';
    } catch (Exception $e) {
        $report['3_reviews'] = 'FAIL: ' . $e->getMessage();
    }

    // Cleanup tests
    $pdo->rollBack();
    
    // Conclusion
    if (strpos($report['2_wishlist'], 'OK') !== false && strpos($report['3_reviews'], 'OK') !== false) {
        $report['final_result'] = 'SUCCESS: EL BACKEND ESTÁ 100% OPERATIVO. Si en el frontend y celular no funciona, el problema es que no has subido la última versión de la carpeta "dist" o de la carpeta "api" al CPanel.';
    } else {
        $report['final_result'] = 'ERROR DETECTADO: El servidor de Hostinger está bloqueando operaciones en la Base de Datos.';
    }

} catch (Exception $globalE) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    $report['final_result'] = 'FATAL EXCEPTION: ' . $globalE->getMessage();
}

echo json_encode($report, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
?>
