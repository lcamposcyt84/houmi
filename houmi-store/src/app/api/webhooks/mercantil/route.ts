import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  decryptMercantilMessage,
  extractPaymentInfo,
  getPaymentStatusFromCode,
} from "@/lib/mercantil-decrypt";
import { MercantilEncryptedRequestSchema, MercantilDecryptedPayloadSchema } from "@/lib/validation";

// ============================================
// SECURITY CONFIGURATION
// ============================================

// IP Whitelist (Banco Mercantil IPs - MUST be configured in production)
const ALLOWED_IPS = process.env.MERCANTIL_ALLOWED_IPS?.split(",") || [];
const ENABLE_IP_WHITELIST = process.env.MERCANTIL_IP_WHITELIST_ENABLED === "true";

// Anti-replay: Accept messages within ±5 minutes
const REPLAY_WINDOW_SECONDS = 300;

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Validates source IP against whitelist
 */
function validateSourceIP(request: NextRequest): { valid: boolean; ip: string } {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const sourceIp = forwardedFor?.split(",")[0].trim() || realIp || "unknown";

  if (!ENABLE_IP_WHITELIST) {
    return { valid: true, ip: sourceIp };
  }

  return {
    valid: ALLOWED_IPS.includes(sourceIp),
    ip: sourceIp,
  };
}

/**
 * Validates timestamp to prevent replay attacks
 */
function validateTimestamp(fecha: string, hora: string): boolean {
  try {
    const year = parseInt(fecha.substring(0, 4));
    const month = parseInt(fecha.substring(4, 6)) - 1;
    const day = parseInt(fecha.substring(6, 8));
    const hour = parseInt(hora.substring(0, 2));
    const minute = parseInt(hora.substring(2, 4));

    const messageTime = new Date(year, month, day, hour, minute);
    const now = new Date();
    const diffSeconds = Math.abs((now.getTime() - messageTime.getTime()) / 1000);

    return diffSeconds <= REPLAY_WINDOW_SECONDS;
  } catch {
    return false;
  }
}

/**
 * Order State Machine Transition
 */
async function transitionOrderState(
  saleId: string,
  newPaymentStatus: string,
  bankReference: string,
  tx: any
) {
  const sale = await tx.sale.findUnique({ where: { id: saleId } });
  if (!sale) throw new Error("Order not found");

  // Determine new order status based on payment status
  let newStatus = sale.status;
  if (newPaymentStatus === "approved") {
    newStatus = "paid";
  } else if (newPaymentStatus === "rejected") {
    // Keep current status but mark payment as failed
    newStatus = sale.status;
  }

  return tx.sale.update({
    where: { id: saleId },
    data: {
      status: newStatus,
      paymentStatus: newPaymentStatus,
      bankReference,
      paymentConfirmedAt: new Date(),
    },
  });
}

/**
 * Webhook for receiving payment confirmations from Banco Mercantil
 * POST /api/webhooks/mercantil
 */
export async function POST(request: NextRequest) {
  const receivedAt = new Date();
  let encryptedData = "";
  let bankReference = "";

  try {
    // SECURITY: IP Whitelist validation
    const { valid: ipValid, ip: sourceIp } = validateSourceIP(request);

    if (!ipValid) {
      console.warn(`[SECURITY] Webhook rejected: IP not whitelisted (${sourceIp})`);

      await prisma.paymentWebhookLog.create({
        data: {
          bankReference: "UNKNOWN",
          sourceIp,
          requestTimestamp: receivedAt,
          encryptedPayload: "",
          status: "ip_blocked",
          errorMessage: "Source IP not whitelisted",
        },
      });

      return NextResponse.json(
        {
          codigo: "99",
          mensajeCliente: "Acceso denegado",
          mensajeSistema: "IP not authorized",
          idRegistro: "",
        },
        { status: 403 }
      );
    }

    // Get MasterKey from Settings
    const settings = await prisma.settings.findUnique({
      where: { id: "main" },
    });

    if (!settings?.mercantilMasterKey) {
      console.error("MasterKey not configured in Settings");
      return NextResponse.json(
        {
          codigo: "99",
          mensajeCliente: "Error en plataforma",
          mensajeSistema: "MasterKey not configured",
          idRegistro: "",
        },
        { status: 500 }
      );
    }

    // Parse and validate encrypted request
    const body = await request.json();
    const encryptedValidation = MercantilEncryptedRequestSchema.safeParse(body);

    if (!encryptedValidation.success) {
      return NextResponse.json(
        {
          codigo: "99",
          mensajeCliente: "Formato inválido",
          mensajeSistema: "Invalid request format",
          idRegistro: "",
        },
        { status: 400 }
      );
    }

    encryptedData = encryptedValidation.data.data;

    // Decrypt message
    let decryptedMessage;
    try {
      decryptedMessage = decryptMercantilMessage(
        encryptedData,
        settings.mercantilMasterKey
      );
    } catch (error) {
      console.error("Error decrypting message:", error);
      return NextResponse.json(
        {
          codigo: "99",
          mensajeCliente: "Error en plataforma",
          mensajeSistema: "Decryption failed",
          idRegistro: "",
        },
        { status: 400 }
      );
    }

    // Validate decrypted structure
    const payloadValidation = MercantilDecryptedPayloadSchema.safeParse(decryptedMessage);

    if (!payloadValidation.success) {
      await prisma.paymentWebhookLog.create({
        data: {
          bankReference: "INVALID",
          sourceIp,
          requestTimestamp: receivedAt,
          encryptedPayload: encryptedData,
          decryptedPayload: JSON.stringify(decryptedMessage),
          status: "invalid_structure",
          errorMessage: "Decrypted payload failed schema validation",
        },
      });

      return NextResponse.json(
        {
          codigo: "99",
          mensajeCliente: "Datos inválidos",
          mensajeSistema: "Invalid payload structure",
          idRegistro: "",
        },
        { status: 400 }
      );
    }

    const payload = payloadValidation.data;
    const notification = payload.webhookNotificationIn;
    bankReference = notification.referenciaBancoOrdenante;

    // SECURITY: Anti-replay attack validation
    if (!validateTimestamp(notification.fecha, notification.hora)) {
      await prisma.paymentWebhookLog.create({
        data: {
          bankReference,
          sourceIp,
          requestTimestamp: receivedAt,
          encryptedPayload: encryptedData,
          decryptedPayload: JSON.stringify(payload),
          status: "replay_attack",
          errorMessage: "Timestamp outside acceptable window (±5 min)",
          ...extractPaymentInfo(payload),
        },
      });

      return NextResponse.json(
        {
          codigo: "99",
          mensajeCliente: "Solicitud expirada",
          mensajeSistema: "Timestamp validation failed",
          idRegistro: "",
        },
        { status: 400 }
      );
    }

    // SECURITY: Idempotency check - prevent duplicate processing
    const existingLog = await prisma.paymentWebhookLog.findFirst({
      where: {
        bankReference,
        status: "success",
      },
    });

    if (existingLog) {
      console.info(`[IDEMPOTENCY] Duplicate webhook for reference ${bankReference}`);

      await prisma.paymentWebhookLog.create({
        data: {
          bankReference,
          sourceIp,
          requestTimestamp: receivedAt,
          encryptedPayload: encryptedData,
          decryptedPayload: JSON.stringify(payload),
          status: "duplicate",
          errorMessage: "Already processed",
          ...extractPaymentInfo(payload),
        },
      });

      return NextResponse.json({
        codigo: "0000",
        mensajeCliente: "Notificación ya procesada",
        mensajeSistema: "Duplicate - already processed",
        idRegistro: existingLog.id,
      });
    }

    // Extract payment info
    const paymentInfo = extractPaymentInfo(payload);
    const paymentStatus = getPaymentStatusFromCode(paymentInfo.codigo || "");

    // Find related order
    let relatedSale = null;

    if (notification.numeroFactura && notification.numeroFactura !== "0") {
      relatedSale = await prisma.sale.findFirst({
        where: {
          OR: [
            { orderNumber: notification.numeroFactura },
            { bankReference: notification.referenciaBancoOrdenante },
          ],
        },
      });
    }

    if (!relatedSale && notification.referenciaBancoOrdenante) {
      relatedSale = await prisma.sale.findFirst({
        where: {
          bankReference: notification.referenciaBancoOrdenante,
        },
      });
    }

    if (!relatedSale) {
      await prisma.paymentWebhookLog.create({
        data: {
          bankReference,
          sourceIp,
          requestTimestamp: receivedAt,
          encryptedPayload: encryptedData,
          decryptedPayload: JSON.stringify(payload),
          status: "order_not_found",
          errorMessage: `Order ${notification.numeroFactura} not found`,
          ...paymentInfo,
        },
      });

      return NextResponse.json(
        {
          codigo: "99",
          mensajeCliente: "Pedido no encontrado",
          mensajeSistema: "Order not found",
          idRegistro: "",
        },
        { status: 404 }
      );
    }

    // Parse payment date
    let paymentDate = null;
    if (paymentInfo.fecha && paymentInfo.hora) {
      const year = paymentInfo.fecha.substring(0, 4);
      const month = paymentInfo.fecha.substring(4, 6);
      const day = paymentInfo.fecha.substring(6, 8);
      const hour = paymentInfo.hora.substring(0, 2);
      const minute = paymentInfo.hora.substring(2, 4);
      paymentDate = new Date(`${year}-${month}-${day}T${hour}:${minute}:00`);
    }

    // Process payment with transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update order state
      await transitionOrderState(
        relatedSale.id,
        paymentStatus,
        bankReference,
        tx
      );

      // Update payment date
      await tx.sale.update({
        where: { id: relatedSale.id },
        data: {
          bankBeneficiaryRef: paymentInfo.referenciaBancoBeneficiario,
          transactionType: paymentInfo.tipo,
          paymentDate,
        },
      });

      // Create webhook log
      const log = await tx.paymentWebhookLog.create({
        data: {
          saleId: relatedSale.id,
          bankReference,
          sourceIp,
          requestTimestamp: receivedAt,
          encryptedPayload: encryptedData,
          decryptedPayload: JSON.stringify(payload),
          status: "success",
          ...paymentInfo,
        },
      });

      // Also create legacy PaymentNotification for compatibility
      await tx.paymentNotification.create({
        data: {
          saleId: relatedSale.id,
          rawData: JSON.stringify(decryptedMessage),
          ...paymentInfo,
        },
      });

      return log;
    });

    console.info(`[SUCCESS] Webhook processed for order ${notification.numeroFactura}, reference ${bankReference}`);

    return NextResponse.json({
      codigo: "0000",
      mensajeCliente: "Notificacion recibida con exito!",
      mensajeSistema: "Notificacion recibida con exito!!",
      idRegistro: result.id,
    });

  } catch (error) {
    console.error("[ERROR] Webhook processing failed:", error);

    try {
      await prisma.paymentWebhookLog.create({
        data: {
          bankReference: bankReference || "ERROR",
          sourceIp: "unknown",
          requestTimestamp: receivedAt,
          encryptedPayload: encryptedData,
          status: "failed",
          errorMessage: error instanceof Error ? error.message : "Unknown error",
        },
      });
    } catch (logError) {
      console.error("[CRITICAL] Failed to log webhook error:", logError);
    }

    return NextResponse.json(
      {
        codigo: "99",
        mensajeCliente: "Error en plataforma",
        mensajeSistema: "Internal error",
        idRegistro: "",
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    message: "Webhook Banco Mercantil activo",
    timestamp: new Date().toISOString(),
  });
}
