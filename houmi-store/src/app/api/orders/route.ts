import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { CreateOrderSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input with Zod
    const validationResult = CreateOrderSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const {
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      items,
      paymentMethod,
    } = validationResult.data;

    // Optional: link order to a registered customer account
    const customerId: string | null = typeof body.customerId === "string" ? body.customerId : null;

    // SECURITY: Fetch products and prices from database (server-side)
    const productIds = items.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        isActive: true,
      },
      include: {
        pricing: true,
        inventory: true,
      },
    });

    // Validate all products exist
    if (products.length !== productIds.length) {
      return NextResponse.json(
        { error: "Uno o más productos no existen o están inactivos" },
        { status: 400 }
      );
    }

    // Get exchange rate
    const settings = await prisma.settings.findUnique({
      where: { id: "main" },
    });
    const exchangeRate = settings?.exchangeRateUsdToVes || 40;

    // Calculate totals and validate stock
    let totalUsd = 0;
    let totalVes = 0;
    const orderItems: Array<{
      productId: string;
      productName: string;
      productCode: string;
      quantity: number;
      priceUsd: number;
      priceVes: number;
    }> = [];

    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) {
        return NextResponse.json(
          { error: `Producto ${item.productId} no encontrado` },
          { status: 400 }
        );
      }

      // Validate stock
      const availableStock = product.inventory?.stock || 0;
      if (item.quantity > availableStock) {
        return NextResponse.json(
          { error: `Stock insuficiente para ${product.name}. Disponible: ${availableStock}` },
          { status: 400 }
        );
      }

      // SECURITY: Use server-side prices only
      const priceUsd = product.pricing?.priceUsd || 0;
      const priceVes = product.pricing?.manualVes
        ? (product.pricing?.priceVes || 0)
        : priceUsd * exchangeRate;

      totalUsd += priceUsd * item.quantity;
      totalVes += priceVes * item.quantity;

      orderItems.push({
        productId: product.id,
        productName: product.name,
        productCode: product.code,
        quantity: item.quantity,
        priceUsd,
        priceVes,
      });
    }

    // Generate unique order number
    const orderNumber = `PED-${Date.now().toString(36).toUpperCase()}`;

    // Create order with transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create sale
      const sale = await tx.sale.create({
        data: {
          orderNumber,
          customerName,
          customerEmail: customerEmail || null,
          customerPhone,
          customerAddress: customerAddress || null,
          totalUsd,
          totalVes,
          status: "pending",
          paymentMethod: paymentMethod || "manual",
          paymentStatus: "pending",
          items: {
            create: orderItems,
          },
        },
        include: {
          items: true,
        },
      });

      // Decrement inventory (optimistic locking)
      for (const item of items) {
        await tx.inventory.updateMany({
          where: {
            productId: item.productId,
            stock: { gte: item.quantity },
          },
          data: {
            stock: { decrement: item.quantity },
          },
        });
      }

      // Link order to customer account if logged in
      if (customerId) {
        await tx.$executeRawUnsafe(
          `UPDATE Sale SET customerId = ? WHERE id = ?`,
          customerId,
          sale.id
        );
      }

      return sale;
    });

    return NextResponse.json({
      success: true,
      orderNumber: order.orderNumber,
      totalUsd: order.totalUsd,
      totalVes: order.totalVes,
      message: "Pedido registrado exitosamente",
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Error al procesar el pedido" },
      { status: 500 }
    );
  }
}
