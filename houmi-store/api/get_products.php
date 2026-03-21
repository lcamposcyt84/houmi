<?php
// get_products.php - Fetch products with pricing, inventory and category
require_once 'db.php';

try {
    $categoryFilter = isset($_GET['category']) ? $_GET['category'] : null;
    $search = isset($_GET['search']) ? trim($_GET['search']) : null;
    $slugFilter = isset($_GET['slug']) ? trim($_GET['slug']) : null;
    $sort = isset($_GET['sort']) ? $_GET['sort'] : 'newest';
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 24;
    $page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
    $offset = ($page - 1) * $limit;

    $where = ["p.isActive = 1"];
    $params = [];

    if ($slugFilter) {
        $where[] = "p.slug = :slug";
        $params[':slug'] = $slugFilter;
    }

    if ($categoryFilter) {
        $where[] = "c.slug = :category";
        $params[':category'] = $categoryFilter;
    }

    if ($search) {
        $where[] = "(p.name LIKE :search OR p.code LIKE :search OR p.description LIKE :search)";
        $params[':search'] = "%$search%";
    }

    $whereClause = "WHERE " . implode(' AND ', $where);

    $orderClause = "ORDER BY p.createdAt DESC";
    if ($sort === 'price_asc') $orderClause = "ORDER BY pr.priceUsd ASC";
    if ($sort === 'price_desc') $orderClause = "ORDER BY pr.priceUsd DESC";
    if ($sort === 'name') $orderClause = "ORDER BY p.name ASC";

    // Get total count for pagination
    $countQuery = "SELECT COUNT(p.id) as total FROM Product p JOIN Category c ON p.categoryId = c.id $whereClause";
    $countStmt = $pdo->prepare($countQuery);
    $countStmt->execute($params);
    $totalCount = (int)$countStmt->fetch()['total'];

    $query = "
        SELECT 
            p.*, 
            c.name as categoryName, c.slug as categorySlug,
            pr.priceUsd, pr.priceVes, pr.manualVes,
            i.stock
        FROM Product p
        JOIN Category c ON p.categoryId = c.id
        LEFT JOIN Pricing pr ON p.id = pr.productId
        LEFT JOIN Inventory i ON p.id = i.productId
        $whereClause
        $orderClause
        LIMIT :offset, :limit
    ";

    $stmt = $pdo->prepare($query);
    // Bind main params
    foreach ($params as $key => $val) {
        $stmt->bindValue($key, $val);
    }
    // Bind pagination params
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    $productsRaw = $stmt->fetchAll();

    // Fetch exchange rate from settings
    $settingsStmt = $pdo->query("SELECT exchangeRateUsdToVes FROM Settings WHERE id = 'main'");
    $settings = $settingsStmt->fetch();
    $exchangeRate = $settings ? (float)$settings['exchangeRateUsdToVes'] : 40.0;

    // Format products exactly as Next.js expects them (mimicking ProductWithPrices)
    $formattedProducts = [];
    foreach ($productsRaw as $row) {
        $priceUsd = (float)($row['priceUsd'] ?? 0);
        $priceVesRaw = $row['priceVes'] !== null ? (float)$row['priceVes'] : ($priceUsd * $exchangeRate);
        $stock = (int)($row['stock'] ?? 0);

        // Calculate USD and VES display prices
        
        $usdDisplay = '$' . number_format($priceUsd, 2);
        $vesDisplay = 'Bs. ' . number_format($priceVesRaw, 2);

        $stockStatus = [
            'label' => 'Sin stock', 'variant' => 'error'
        ];
        if ($stock > 5) {
            $stockStatus = ['label' => 'En stock', 'variant' => 'success'];
        } elseif ($stock > 0) {
            $stockStatus = ['label' => 'Pocas unidades', 'variant' => 'warning'];
        }

        $formattedProducts[] = [
            'id' => $row['id'],
            'code' => $row['code'],
            'name' => $row['name'],
            'slug' => $row['slug'],
            'description' => $row['description'],
            'images' => json_decode($row['images'], true) ?: [],
            'categoryId' => $row['categoryId'],
            'category' => [
                'id' => $row['categoryId'],
                'name' => $row['categoryName'],
                'slug' => $row['categorySlug']
            ],
            'pricing' => [
                'priceUsd' => $priceUsd,
                'priceVes' => $row['priceVes'] !== null ? (float)$row['priceVes'] : null,
                'manualVes' => (bool)$row['manualVes']
            ],
            'priceDisplay' => [
                'usd' => $usdDisplay,
                'ves' => $vesDisplay,
                'usdRaw' => $priceUsd,
                'vesRaw' => $priceVesRaw
            ],
            'stock' => $stock,
            'stockStatus' => $stockStatus,
            'createdAt' => $row['createdAt']
        ];
    }

    echo json_encode([
        'products' => $formattedProducts,
        'exchangeRate' => $exchangeRate,
        'total' => $totalCount
    ]);

} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error', 'details' => $e->getMessage()]);
}
?>
