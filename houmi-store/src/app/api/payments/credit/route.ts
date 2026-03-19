import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * Procesa un pago con tarjeta de crédito
 * POST /api/payments/credit
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

    // Validar formato de tarjeta
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

    // Aquí deberías integrar con la API del procesador de pagos
    // Por ahora, simulamos el procesamiento
    // TODO: Integrar con la API real (Stripe, PayPal, etc.)
    
    // Simular procesamiento de pago
    const paymentReference = `CC-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Actualizar el pedido
    await prisma.sale.update({
      where: { orderNumber },
      data: {
        paymentMethod: "card",
        paymentStatus: "processing",
        bankReference: paymentReference,
      },
    });

    return NextResponse.json({
      success: true,
      reference: paymentReference,
      message: "Pago con tarjeta de crédito procesado correctamente",
    });
  } catch (error) {
    console.error("Error processing credit payment:", error);
    return NextResponse.json(
      { error: "Error al procesar el pago con tarjeta de crédito" },
      { status: 500 }
    );
  }
}
