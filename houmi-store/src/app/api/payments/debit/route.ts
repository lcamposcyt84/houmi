import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * Procesa un pago con tarjeta de débito
 * POST /api/payments/debit
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      orderNumber,
      cardNumber,
      cardHolder,
      expiryMonth,
      expiryYear,
      cvv,
      idNumber,
      amount,
    } = body;

    // Validaciones
    if (!orderNumber || !cardNumber || !cardHolder || !expiryMonth || !expiryYear || !cvv || !idNumber) {
      return NextResponse.json(
        { error: "Todos los campos son requeridos" },
        { status: 400 }
      );
    }

    // Validar formato de tarjeta (debe ser de Mercantil)
    if (cardNumber.length < 16) {
      return NextResponse.json(
        { error: "Número de tarjeta inválido" },
        { status: 400 }
      );
    }

    // Buscar el pedido
    const order = await prisma.sale.findUnique({
      where: { orderNumber },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Pedido no encontrado" },
        { status: 404 }
      );
    }

    // Obtener configuración del banco desde Settings
    const settings = await prisma.settings.findUnique({
      where: { id: "main" },
    });

    if (!settings?.mercantilApiUrl || !settings?.mercantilIdComercio) {
      return NextResponse.json(
        { error: "La configuración del banco no está completa" },
        { status: 500 }
      );
    }

    // Configurar los datos de la transacción para Mercantil
    // Según los protocolos de seguridad del banco (Simulado para este ejemplo basado en el README)
    // TODO: Ajustar según la documentación exacta de Mercantil si difiere
    const merchantId = settings.mercantilIdComercio;
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";

    const bankRequestPayload = {
      merchant_id: merchantId,
      terminal_id: "001",
      order_number: orderNumber,
      amount: amount,
      currency: "VES",
      card_number: cardNumber,
      cvv: cvv,
      expiration_date: `${expiryMonth}${expiryYear}`,
      customer_id: idNumber,
      customer_ip: ip,
    };

    // Registrar inicio de procesamiento en el pedido
    await prisma.sale.update({
      where: { orderNumber },
      data: {
        paymentMethod: "debit",
        paymentStatus: "processing",
      },
    });

    // Llamada real a la API del Banco Mercantil
    let paymentReference = "";
    try {
      const response = await fetch(`${settings.mercantilApiUrl}/payments/debit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Merchant-ID": merchantId,
          // Añadir headers de seguridad adicionales si lo requiere el banco
        },
        body: JSON.stringify(bankRequestPayload),
      });

      const data = await response.json();

      if (!response.ok || data.status !== "approved") {
        throw new Error(data.message || "Pago rechazado por el banco");
      }

      paymentReference = data.reference;

      // Actualizar el pedido con el éxito
      await prisma.sale.update({
        where: { orderNumber },
        data: {
          paymentStatus: "approved",
          status: "paid",
          bankReference: paymentReference,
          paymentConfirmedAt: new Date(),
        },
      });

    } catch (error) {
      // Si falla la integración real, volvemos a marcar como fallido
      await prisma.sale.update({
        where: { orderNumber },
        data: {
          paymentStatus: "failed",
        },
      });
      throw error;
    }

    return NextResponse.json({
      success: true,
      reference: paymentReference,
      message: "Pago con tarjeta de débito procesado correctamente",
    });
  } catch (error: any) {
    console.error("Error processing debit payment:", error);
    return NextResponse.json(
      { error: error.message || "Error al procesar el pago con tarjeta de débito" },
      { status: 500 }
    );
  }
}
