<?php
// Script para listar admins y resetear/crear uno para pruebas locales
require_once 'c:/xampp/htdocs/houmi-master/houmi-store/api/db.php';

echo "=== ADMINS EN BASE DE DATOS ===\n";
$stmt = $pdo->query('SELECT id, email, name, role, isActive FROM Admin');
$admins = $stmt->fetchAll();
if (empty($admins)) {
    echo "No hay administradores registrados.\n";
} else {
    foreach ($admins as $admin) {
        echo "- Email: {$admin['email']} | Nombre: {$admin['name']} | Rol: {$admin['role']} | Activo: {$admin['isActive']}\n";
    }
}

// Crear/actualizar admin de prueba con password: "admin2024"
$testEmail = 'lcamposcyt@gmail.com';
$testPassword = 'admin2024';
$hash = password_hash($testPassword, PASSWORD_BCRYPT);

// Verificar si existe
$check = $pdo->prepare("SELECT id FROM Admin WHERE email = ?");
$check->execute([$testEmail]);
$existing = $check->fetchColumn();

if ($existing) {
    // Actualizar password
    $pdo->prepare("UPDATE Admin SET password = ?, isActive = 1 WHERE email = ?")->execute([$hash, $testEmail]);
    echo "\n✅ Password del admin '$testEmail' actualizado a: $testPassword\n";
} else {
    // Crear nuevo
    $pdo->prepare("INSERT INTO Admin (id, email, password, name, role, isActive, createdAt, updatedAt) VALUES (?, ?, ?, ?, 'admin', 1, NOW(), NOW())")->execute([
        uniqid('cuid_'), $testEmail, $hash, 'Admin Houmi'
    ]);
    echo "\n✅ Admin creado: $testEmail / $testPassword\n";
}
echo "\nUsa estas credenciales para hacer login:\n";
echo "Email: $testEmail\n";
echo "Password: $testPassword\n";
