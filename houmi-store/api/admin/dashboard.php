<?php
// dashboard.php - Fetch aggregated statistics for the admin dashboard
require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/auth.php';

$admin = requireAdminAuth();

try {
    // 1. Products & Categories Metrics
    $totalProducts = $pdo->query('SELECT COUNT(id) FROM Product')->fetchColumn();
    $activeProducts = $pdo->query('SELECT COUNT(id) FROM Product WHERE isActive = 1')->fetchColumn();
    $totalCategories = $pdo->query('SELECT COUNT(id) FROM Category')->fetchColumn();
    
    // Low stock count (<= 5)
    $lowStock = $pdo->query('SELECT COUNT(id) FROM Inventory WHERE stock <= 5')->fetchColumn();

    // 2. Financial Metrics (Totals)
    // Only Sum completed or paid sales for accurate revenue
    $salesSumResult = $pdo->query("SELECT SUM(totalUsd) as totalUsd, SUM(totalVes) as totalVes FROM Sale WHERE status IN ('paid', 'completed', 'shipped')")->fetch();
    $totalSalesUsd = $salesSumResult['totalUsd'] ?? 0;
    
    $expensesResult = $pdo->query('SELECT SUM(amountUsd) as total FROM Expense')->fetchColumn();
    $totalExpensesUsd = $expensesResult ?? 0;

    $purchasesResult = $pdo->query('SELECT SUM(totalUsd) as total FROM Purchase')->fetchColumn();
    $totalPurchasesUsd = $purchasesResult ?? 0;

    // 3. Settings (Exchange Rate)
    $settingsStmt = $pdo->query("SELECT exchangeRateUsdToVes FROM Settings WHERE id = 'main'");
    $settingsRow = $settingsStmt->fetch();
    $exchangeRate = $settingsRow ? (float)$settingsRow['exchangeRateUsdToVes'] : 40.0;

    // 4. Recent Sales (Last 5)
    $recentSalesStmt = $pdo->query('
        SELECT id, orderNumber, customerName, totalUsd, totalVes, status, createdAt 
        FROM Sale 
        ORDER BY createdAt DESC LIMIT 5
    ');
    $recentSales = $recentSalesStmt->fetchAll();

    echo json_encode([
        'metrics' => [
            'totalProducts' => (int)$totalProducts,
            'activeProducts' => (int)$activeProducts,
            'totalCategories' => (int)$totalCategories,
            'lowStock' => (int)$lowStock,
            'totalSalesUsd' => (float)$totalSalesUsd,
            'totalExpensesUsd' => (float)$totalExpensesUsd,
            'totalPurchasesUsd' => (float)$totalPurchasesUsd,
        ],
        'exchangeRate' => $exchangeRate,
        'recentSales' => $recentSales
    ]);

} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error', 'details' => $e->getMessage()]);
}
?>
