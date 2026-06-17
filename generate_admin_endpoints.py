import os

# Root api dir
API_DIR = r"c:\xampp\htdocs\houmi-master\houmi-store\api\admin"

files_to_create = {
    "sales/create.php": """<?php
require_once dirname(dirname(__DIR__)) . '/db.php';
require_once dirname(__DIR__) . '/auth.php';
$admin = requireAdminAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); exit();
}

$data = json_decode(file_get_contents("php://input"));
if (!$data) { http_response_code(400); echo json_encode(['error' => 'Datos inválidos']); exit(); }

try {
    $pdo->beginTransaction();
    
    $orderNumber = 'POS-' . time() . '-' . rand(1000, 9999);
    
    $stmt = $pdo->prepare("INSERT INTO Sale (id, orderNumber, customerName, totalUsd, totalVes, status, paymentMethod, paymentStatus, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())");
    $saleId = uniqid('cuid_');
    $stmt->execute([
        $saleId, 
        $orderNumber, 
        $data->customerName ?? 'Cliente POS',
        (float)($data->totalUsd ?? 0),
        (float)($data->totalVes ?? 0),
        $data->status ?? 'completed',
        $data->paymentMethod ?? 'manual',
        $data->paymentStatus ?? 'approved'
    ]);
    
    if (isset($data->items) && is_array($data->items)) {
        $itemStmt = $pdo->prepare("INSERT INTO SaleItem (id, saleId, productId, productName, productCode, quantity, priceUsd, priceVes, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())");
        foreach ($data->items as $item) {
            $itemStmt->execute([
                uniqid('cuii_'),
                $saleId,
                $item->productId ?? '',
                $item->productName ?? '',
                $item->productCode ?? '',
                (int)($item->quantity ?? 1),
                (float)($item->priceUsd ?? 0),
                (float)($item->priceVes ?? 0)
            ]);
            
            // Reducir stock
            if (!empty($item->productId)) {
                $pdo->prepare("UPDATE Inventory SET stock = GREATEST(0, stock - ?) WHERE productId = ?")->execute([(int)($item->quantity ?? 1), $item->productId]);
            }
        }
    }
    
    $pdo->commit();
    echo json_encode(['success' => true, 'orderNumber' => $orderNumber]);
} catch (\Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>""",
    "sales/get.php": """<?php
require_once dirname(dirname(__DIR__)) . '/db.php';
require_once dirname(__DIR__) . '/auth.php';
$admin = requireAdminAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405); exit();
}

try {
    $stmt = $pdo->query("SELECT * FROM Sale ORDER BY createdAt DESC LIMIT 100");
    $sales = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($sales);
} catch (\Exception $e) {
    http_response_code(500); echo json_encode(['error' => $e->getMessage()]);
}
?>""",
    "purchases/create.php": """<?php
require_once dirname(dirname(__DIR__)) . '/db.php';
require_once dirname(__DIR__) . '/auth.php';
$admin = requireAdminAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); exit();
}

$data = json_decode(file_get_contents("php://input"));
if (!$data) { http_response_code(400); echo json_encode(['error' => 'Datos inválidos']); exit(); }

try {
    $pdo->beginTransaction();
    
    $stmt = $pdo->prepare("INSERT INTO Purchase (id, supplier, description, totalUsd, totalVes, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())");
    $purchaseId = uniqid('cuip_');
    $stmt->execute([
        $purchaseId, 
        $data->supplier ?? 'Proveedor General',
        $data->description ?? '',
        (float)($data->totalUsd ?? 0),
        (float)($data->totalVes ?? 0),
        $data->status ?? 'received'
    ]);
    
    if (isset($data->items) && is_array($data->items)) {
        $itemStmt = $pdo->prepare("INSERT INTO PurchaseItem (id, purchaseId, productId, productName, quantity, costUsd, createdAt) VALUES (?, ?, ?, ?, ?, ?, NOW())");
        foreach ($data->items as $item) {
            $itemStmt->execute([
                uniqid('cuipi_'),
                $purchaseId,
                $item->productId ?? '',
                $item->productName ?? '',
                (int)($item->quantity ?? 1),
                (float)($item->costUsd ?? 0)
            ]);
            
            // Aumentar stock si se recibe
            if (!empty($item->productId) && ($data->status ?? 'received') === 'received') {
                $pdo->prepare("UPDATE Inventory SET stock = stock + ? WHERE productId = ?")->execute([(int)($item->quantity ?? 1), $item->productId]);
            }
        }
    }
    
    $pdo->commit();
    echo json_encode(['success' => true]);
} catch (\Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>""",
    "expenses/create.php": """<?php
require_once dirname(dirname(__DIR__)) . '/db.php';
require_once dirname(__DIR__) . '/auth.php';
$admin = requireAdminAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); exit();
}

$data = json_decode(file_get_contents("php://input"));
if (!$data) { http_response_code(400); echo json_encode(['error' => 'Datos inválidos']); exit(); }

try {
    $stmt = $pdo->prepare("INSERT INTO Expense (id, category, description, amountUsd, amountVes, date, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())");
    $expenseId = uniqid('cuie_');
    $stmt->execute([
        $expenseId,
        $data->category ?? 'other',
        $data->description ?? '',
        (float)($data->amountUsd ?? 0),
        (float)($data->amountVes ?? 0),
        $data->date ?? date('Y-m-d H:i:s')
    ]);
    
    echo json_encode(['success' => true]);
} catch (\Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>""",
    "expenses/update.php": """<?php
require_once dirname(dirname(__DIR__)) . '/db.php';
require_once dirname(__DIR__) . '/auth.php';
$admin = requireAdminAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'PUT' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); exit();
}

$data = json_decode(file_get_contents("php://input"));
if (empty($data->id)) { http_response_code(400); echo json_encode(['error' => 'ID requerido']); exit(); }

try {
    $stmt = $pdo->prepare("UPDATE Expense SET category=?, description=?, amountUsd=?, amountVes=?, date=?, updatedAt=NOW() WHERE id=?");
    $stmt->execute([
        $data->category ?? 'other',
        $data->description ?? '',
        (float)($data->amountUsd ?? 0),
        (float)($data->amountVes ?? 0),
        $data->date ?? date('Y-m-d H:i:s'),
        $data->id
    ]);
    
    echo json_encode(['success' => true]);
} catch (\Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>"""
}

for rel_path, content in files_to_create.items():
    full_path = os.path.join(API_DIR, rel_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content)

print("Backend endpoints generated successfully.")
