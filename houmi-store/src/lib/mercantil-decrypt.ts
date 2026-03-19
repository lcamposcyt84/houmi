import forge from "node-forge";

/**
 * Descifra un mensaje del Banco Mercantil usando RSA con SHA256
 * @param encryptedData - Datos cifrados en base64
 * @param masterKey - Clave maestra (clave privada RSA en formato PEM)
 * @returns Objeto descifrado
 */
export function decryptMercantilMessage(
  encryptedData: string,
  masterKey: string
): any {
  try {
    // Decodificar base64
    const encryptedBuffer = Buffer.from(encryptedData, "base64");

    // Cargar la clave privada
    const privateKey = forge.pki.privateKeyFromPem(masterKey);

    // Descifrar usando RSA
    const decrypted = privateKey.decrypt(encryptedBuffer.toString("binary"), "RSA-OAEP", {
      md: forge.md.sha256.create(),
      mgf1: forge.mgf.mgf1.create(forge.md.sha256.create()),
    });

    // Convertir a string y parsear JSON
    const decryptedString = Buffer.from(decrypted, "binary").toString("utf8");
    return JSON.parse(decryptedString);
  } catch (error) {
    console.error("Error descifrando mensaje Mercantil:", error);
    throw new Error("Error al descifrar el mensaje del banco");
  }
}

/**
 * Valida la estructura del mensaje descifrado
 */
export function validateMercantilMessage(message: any): boolean {
  return (
    message &&
    message.infoMsg &&
    message.webhookNotificationIn &&
    typeof message.webhookNotificationIn.codigo === "string"
  );
}

/**
 * Extrae información relevante del mensaje para guardar en la BD
 */
export function extractPaymentInfo(message: any) {
  const notification = message.webhookNotificationIn;
  const infoMsg = message.infoMsg;

  return {
    guid: infoMsg.guId || null,
    channel: infoMsg.channel || null,
    subchannel: infoMsg.subchannel || null,
    codigo: notification.codigo || null,
    mensajeCliente: notification.mensajeCliente || null,
    mensajeSistema: notification.mensajeSistema || null,
    referenciaBancoOrdenante: notification.referenciaBancoOrdenante || null,
    referenciaBancoBeneficiario: notification.referenciaBancoBeneficiario || null,
    tipo: notification.tipo || null,
    bancoOrdenante: notification.bancoOrdenante || null,
    bancoBeneficiario: notification.bancoBeneficiario || null,
    idCliente: notification.idCliente || null,
    numeroProductoCliente: notification.numeroProductoCliente || null,
    idComercio: notification.idComercio || null,
    numeroProductoComercio: notification.numeroProductoComercio || null,
    fecha: notification.fecha || null,
    hora: notification.hora || null,
    codigoMoneda: notification.codigoMoneda || null,
    monto: notification.monto || null,
    numeroFactura: notification.numeroFactura || null,
    numeroContrato: notification.numeroContrato || null,
    concepto: notification.concepto || null,
  };
}

/**
 * Determina el estado del pago basado en el código
 */
export function getPaymentStatusFromCode(codigo: string): string {
  // Códigos de éxito
  if (codigo === "00" || codigo === "0000") {
    return "approved";
  }
  // Códigos de error comunes
  if (["51", "52", "53", "54", "55", "56", "57", "58", "59", "61"].includes(codigo)) {
    return "rejected";
  }
  // Otros códigos
  return "processing";
}
