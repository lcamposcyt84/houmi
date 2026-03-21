<?php
// import.php - Read Catalog XLSX and Upsert Data, or Download Template
require_once dirname(dirname(__DIR__)) . '/db.php';
require_once dirname(__DIR__) . '/auth.php';

// Load lightweight simple XLSX parsers (zero-dependency)
require_once dirname(__DIR__) . '/lib/SimpleXLSX.php';
require_once dirname(__DIR__) . '/lib/SimpleXLSXGen.php';

$admin = requireAdminAuth();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // GENERATE TEMPLATE
    try {
        $stmt = $pdo->query('
            SELECT p.code, p.name, p.description, c.name as categoryName, i.stock, pr.priceUsd 
            FROM Product p
            JOIN Category c ON p.categoryId = c.id
            LEFT JOIN Inventory i ON p.id = i.productId
            LEFT JOIN Pricing pr ON p.id = pr.productId
            ORDER BY p.code ASC
        ');
        $products = $stmt->fetchAll();

        $data = [
            ['CODIGO', 'NOMBRE', 'DESCRIPCION', 'CATEGORIA', 'STOCK', 'PRECIO_USD']
        ];

        foreach ($products as $p) {
            $data[] = [
                $p['code'],
                $p['name'],
                $p['description'],
                $p['categoryName'],
                $p['stock'] ?? 0,
                $p['priceUsd'] ?? 0
            ];
        }

        $xlsx = Shuchkin\SimpleXLSXGen::fromArray($data);
        $filename = "productos_houmi_" . date('Y-m-d') . ".xlsx";
        $xlsx->downloadAs($filename);
        exit();

    } catch (\Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Error al generar plantilla', 'details' => $e->getMessage()]);
        exit();
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Parse Uploaded File
    if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
        http_response_code(400);
        echo json_encode(['error' => 'No se proporcionó archivo']);
        exit();
    }

    $fileTmpPath = $_FILES['file']['tmp_name'];

    if ($xlsx = Shuchkin\SimpleXLSX::parse($fileTmpPath)) {
        
        $rows = $xlsx->rows();
        if (count($rows) <= 1) {
            http_response_code(400);
            echo json_encode(['error' => 'El archivo está vacío o sin datos']);
            exit();
        }

        $header = array_map('strtoupper', array_map('trim', $rows[0]));
        $expected = ['CODIGO', 'NOMBRE', 'DESCRIPCION', 'CATEGORIA', 'STOCK', 'PRECIO_USD'];
        
        // Load categories beforehand
        $catStmt = $pdo->query('SELECT id, name, slug FROM Category');
        $categories = $catStmt->fetchAll();
        $catMap = []; // lowercase name => id
        $catSlugMap = []; // id => slug
        foreach ($categories as $c) {
            $catMap[strtolower($c['name'])] = $c['id'];
            $catSlugMap[$c['id']] = $c['slug'];
        }

        $results = [
            'created' => 0,
            'updated' => 0,
            'skipped' => 0,
            'errors' => []
        ];

        $pdo->beginTransaction();

        try {
            for ($i = 1; $i < count($rows); $i++) {
                $row = $rows[$i];
                if (empty(trim($row[0]))) continue; // Skip empty codes

                $codigo = strtoupper(trim($row[0] ?? ''));
                $nombre = trim($row[1] ?? $codigo);
                $descripcion = trim($row[2] ?? '');
                $categoriaName = strtolower(trim($row[3] ?? ''));
                $stock = (int)($row[4] ?? 0);
                $precioUsd = (float)($row[5] ?? 0);

                if (empty($categoriaName) || !isset($catMap[$categoriaName])) {
                    $results['errors'][] = "Fila " . ($i + 1) . ": Categoría '$categoriaName' no existe para código $codigo";
                    $results['skipped']++;
                    continue;
                }

                $catId = $catMap[$categoriaName];
                $catSlug = $catSlugMap[$catId];
                $slug = strtolower($codigo) . "-" . $catSlug;

                // Check if product exists
                $checkStmt = $pdo->prepare('SELECT id FROM Product WHERE code = :code LIMIT 1');
                $checkStmt->execute([':code' => $codigo]);
                $existing = $checkStmt->fetch();

                if ($existing) {
                    $productId = $existing['id'];
                    // Update Product
                    $updStmt = $pdo->prepare('UPDATE Product SET name = :name, description = :desc, categoryId = :catId, slug = :slug WHERE id = :id');
                    $updStmt->execute([':name' => $nombre, ':desc' => $descripcion, ':catId' => $catId, ':slug' => $slug, ':id' => $productId]);

                    // Update/Insert Inventory
                    $invStmt = $pdo->prepare('INSERT INTO Inventory (id, productId, stock) VALUES (:id, :pId, :stock) ON DUPLICATE KEY UPDATE stock = :stock2');
                    $invIt = 'inv_' . bin2hex(random_bytes(8));
                    $invStmt->execute([':id' => $invIt, ':pId' => $productId, ':stock' => $stock, ':stock2' => $stock]);

                    // Update/Insert Pricing
                    $prcStmt = $pdo->prepare('INSERT INTO Pricing (id, productId, priceUsd) VALUES (:id, :pId, :usd) ON DUPLICATE KEY UPDATE priceUsd = :usd2');
                    $prcIt = 'prc_' . bin2hex(random_bytes(8));
                    $prcStmt->execute([':id' => $prcIt, ':pId' => $productId, ':usd' => $precioUsd, ':usd2' => $precioUsd]);

                    $results['updated']++;
                } else {
                    $productId = 'prd_' . bin2hex(random_bytes(8));
                    
                    // Insert Product
                    $insStmt = $pdo->prepare('INSERT INTO Product (id, code, name, slug, description, images, categoryId, isActive, createdAt, updatedAt) VALUES (:id, :code, :name, :slug, :desc, :images, :catId, 1, NOW(), NOW())');
                    $insStmt->execute([
                        ':id' => $productId, ':code' => $codigo, ':name' => $nombre, 
                        ':slug' => $slug, ':desc' => $descripcion, ':images' => '["/placeholder.svg"]', 
                        ':catId' => $catId
                    ]);

                    // Insert Inventory
                    $invIt = 'inv_' . bin2hex(random_bytes(8));
                    $pdo->prepare('INSERT INTO Inventory (id, productId, stock) VALUES (?, ?, ?)')->execute([$invIt, $productId, $stock]);

                    // Insert Pricing
                    $prcIt = 'prc_' . bin2hex(random_bytes(8));
                    $pdo->prepare('INSERT INTO Pricing (id, productId, priceUsd) VALUES (?, ?, ?)')->execute([$prcIt, $productId, $precioUsd]);

                    $results['created']++;
                }
            }
            $pdo->commit();

            echo json_encode([
                'success' => true,
                'message' => "Procesados " . count($rows) . " registros",
                'results' => $results
            ]);

        } catch (\Exception $e) {
            $pdo->rollBack();
            http_response_code(500);
            echo json_encode(['error' => 'Error durante inserción masiva', 'details' => $e->getMessage()]);
        }

    } else {
        http_response_code(400);
        echo json_encode(['error' => 'Formato de Excel inválido: ' . Shuchkin\SimpleXLSX::parseError()]);
    }
} else {
    http_response_code(405);
}
?>
