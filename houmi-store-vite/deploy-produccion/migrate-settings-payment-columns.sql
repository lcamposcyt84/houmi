-- Migración para agregar columnas de configuración de pago a la tabla Settings
-- Ejecutar en la base de datos de producción: u111276354_produccion

ALTER TABLE Settings
  ADD COLUMN paymentGatewayUrl VARCHAR(500) DEFAULT NULL AFTER mercantilIdComercio,
  ADD COLUMN paymentMerchantId VARCHAR(100) DEFAULT NULL AFTER paymentGatewayUrl,
  ADD COLUMN paymentIntegratorId VARCHAR(50) DEFAULT NULL AFTER paymentMerchantId,
  ADD COLUMN paymentEncryptionKey VARCHAR(500) DEFAULT NULL AFTER paymentIntegratorId;
