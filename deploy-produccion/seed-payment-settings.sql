-- Actualizar configuración de pasarela de pago en la base de datos de producción
-- Reemplazar los valores con los correctos para el entorno de producción

UPDATE Settings SET
  paymentGatewayUrl = 'https://payment-gateway-frontend-test-2.desqa-ve-ocp-m3c-8x64-2a9350942ee55c9d16ed89a864995080-0000.us-south.containers.appdomain.cloud/',
  paymentMerchantId = 'J303174043',
  paymentIntegratorId = '31',
  paymentEncryptionKey = '0006568485J000000303174043199602010000',
  updatedAt = NOW()
WHERE id = 'main';
