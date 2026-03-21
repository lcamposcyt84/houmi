<?php
// create.php - Create a new order (Sale)
require_once dirname(__DIR__) . '/db.php';
require_once dirname(__DIR__) . '/auth/check.php';

// Optional auth (Guest checkout allowed in Next.js, but let's check for customer)
$customer = getAuthenticatedCustomer();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

$data = json_decode(file_get_contents("php://input"));
if (empty($data->items) || empty($data->customerName) || empty($data->customerEmail)) {
    http_response_code(400);
    echo json_encode(['error' => 'Validación fallida: faltan datos del carrito o cliente']);
    exit();
}

try {
    // Start transaction since we insert into Sale, SaleItem, and update Inventory
    $pdo->beginTransaction();

    $saleId = 'sal_' . bin2hex(random_bytes(8));
    $totalUsd = 0;
    $totalVes = 0;
    
    // Exchange rate
    $settingsStmt = $pdo->query("SELECT exchangeRateUsdToVes FROM Settings WHERE id = 'main'");
    $settings = $settingsStmt->fetch();
    $exchangeRate = $settings ? (float)$settings['exchangeRateUsdToVes'] : 40.0;

    // 1. Process items and calculate totals
    $itemsToInsert = [];
    foreach ($data->items as $item) {
        $pId = $item->productId;
        $qty = (int)$item->quantity;

        // Get actual price from DB to prevent client manipulation
        $priceStmt = $pdo->prepare('SELECT priceUsd, priceVes FROM Pricing WHERE productId = :pId');
        $priceStmt->execute([':pId' => $pId]);
        $pricing = $priceStmt->fetch();

        if (!$pricing) {
            throw new Exception("Producto $pId no válido o sin precio definido");
        }

        $usd = (float)$pricing['priceUsd'];
        $ves = $pricing['priceVes'] !== null ? (float)$pricing['priceVes'] : ($usd * $exchangeRate);

        $totalUsd += ($usd * $qty);
        $totalVes += ($ves * $qty);

        // Check Inventory
        $invStmt = $pdo->prepare('SELECT stock FROM Inventory WHERE productId = :pId FOR UPDATE');
        $invStmt->execute([':pId' => $pId]);
        $inventory = $invStmt->fetch();

        if (!$inventory || $inventory['stock'] < $qty) {
            throw new Exception("Stock insuficiente para el producto $pId");
        }

        $itemsToInsert[] = [
            'id' => 'sit_' . bin2hex(random_bytes(8)),
            'saleId' => $saleId,
            'productId' => $pId,
            'quantity' => $qty,
            'priceUsd' => $usd,
            'priceVes' => $ves
        ];

        // Deduct Inventory
        $updateInv = $pdo->prepare('UPDATE Inventory SET stock = stock - :qty WHERE productId = :pId');
        $updateInv->execute([':qty' => $qty, ':pId' => $pId]);
    }

    // 2. Insert Sale
    $saleStmt = $pdo->prepare('
        INSERT INTO Sale (id, customerId, customerName, customerEmail, customerPhone, shippingAddress, shippingCity, notes, exchangeRate, totalUsd, totalVes, status, paymentMethod, createdAt, updatedAt)
        VALUES (:id, :cId, :name, :email, :phone, :address, :city, :notes, :rate, :tUsd, :tVes, "pending", "transfer_ves", NOW(), NOW())
    ');
    
    $saleStmt->execute([
        ':id' => $saleId,
        ':cId' => $customer ? $customer['customerId'] : null,
        ':name' => $data->customerName,
        ':email' => $data->customerEmail,
        ':phone' => $data->customerPhone ?? '',
        ':address' => $data->shippingAddress ?? '',
        ':city' => $data->shippingCity ?? '',
        ':notes' => $data->notes ?? null,
        ':rate' => $exchangeRate,
        ':tUsd' => $totalUsd,
        ':tVes' => $totalVes
    ]);

    // 3. Insert SaleItems
    $itemStmt = $pdo->prepare('
        INSERT INTO SaleItem (id, saleId, productId, quantity, priceUsd, priceVes, createdAt, updatedAt)
        VALUES (:id, :sId, :pId, :qty, :pUsd, :pVes, NOW(), NOW())
    ');
    foreach ($itemsToInsert as $item) {
        $itemStmt->execute([
            ':id' => $item['id'],
            ':sId' => $item['saleId'],
            ':pId' => $item['productId'],
            ':qty' => $item['quantity'],
            ':pUsd' => $item['priceUsd'],
            ':pVes' => $item['priceVes']
        ]);
    }

    $pdo->commit();

    http_response_code(201);
    echo json_encode(['success' => true, 'order' => ['id' => $saleId]]);

} catch (Exception $e) {
    $pdo->rollBack();
    http_response_code(400);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
