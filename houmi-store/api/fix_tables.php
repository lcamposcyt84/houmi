<?php
// fix_tables.php - Renombra las tablas minúsculas al formato PascalCase original
require_once 'db.php';

// Mapa de tablas minúsculas obtenidas del servidor Linux a su formato correcto requerido por el código
$tables = [
    'address' => 'Address',
    'admin' => 'Admin',
    'auditlog' => 'AuditLog',
    'cartitem' => 'CartItem',
    'category' => 'Category',
    'coupon' => 'Coupon',
    'couponusage' => 'CouponUsage',
    'customer' => 'Customer',
    'expense' => 'Expense',
    'inventory' => 'Inventory',
    'notification' => 'Notification',
    'paymentnotification' => 'PaymentNotification',
    'paymentwebhooklog' => 'PaymentWebhookLog',
    'pricing' => 'Pricing',
    'product' => 'Product',
    'productimage' => 'ProductImage',
    'productvariant' => 'ProductVariant',
    'purchase' => 'Purchase',
    'purchaseitem' => 'PurchaseItem',
    'return' => 'Return',
    'returnitem' => 'ReturnItem',
    'review' => 'Review',
    'sale' => 'Sale',
    'saleitem' => 'SaleItem',
    'settings' => 'Settings',
    'shipment' => 'Shipment',
    'shippingzone' => 'ShippingZone',
    'wishlistitem' => 'WishlistItem'
];

$results = [];

try {
    foreach ($tables as $old => $new) {
        // Verificamos si existe la versión minúscula
        $checkStmt = $pdo->query("SHOW TABLES LIKE '$old'");
        if ($checkStmt->rowCount() > 0) {
            // En Linux, a veces hacer un RENAME directo a la misma palabra con mayúsculas falla si
            // el sistema de archivos es engañoso. Es más seguro pasar por un nombre temporal.
            $tempName = $old . '_temp_rename';
            
            $pdo->exec("RENAME TABLE `$old` TO `$tempName`");
            $pdo->exec("RENAME TABLE `$tempName` TO `$new`");
            
            $results[] = "✅ Éxito: `$old` fue renombrada a `$new`";
        } else {
            // Verificamos si la nueva ya existe
            $checkNew = $pdo->query("SHOW TABLES LIKE '$new'");
            if ($checkNew->rowCount() > 0) {
                $results[] = "ℹ️ Omitido: La tabla `$new` ya está en el formato correcto.";
            } else {
                $results[] = "❌ Error: No se encontró ni `$old` ni `$new`.";
            }
        }
    }
} catch (Exception $e) {
    echo "<h2>Error Fatal:</h2><p>" . $e->getMessage() . "</p>";
    exit;
}

echo "<h2>Resolución de Case-Sensitivity de MySQL Completa</h2>";
echo "<ul>";
foreach ($results as $r) {
    echo "<li>$r</li>";
}
echo "</ul>";
echo "<br><h3><strong>¡Listo! Por favor, recarga tu lista de deseos o la tienda principal. Los errores 500 deberían haber desaparecido.</strong></h3>";
?>
