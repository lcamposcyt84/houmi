-- Actualizar configuración de pasarela de pago en la base de datos de producción
-- Reemplazar los valores con los correctos para el entorno de producción

UPDATE Settings SET
  paymentMerchantId = '72744004',
  paymentEncryptionKey = 'Htnq1p3J',
  updatedAt = NOW()
WHERE id = 'main';
