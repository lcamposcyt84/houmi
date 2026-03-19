import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/auth";
import { applyPercentageChange } from "@/lib/currency";

export async function POST(request: NextRequest) {
  try {
    const isAdmin = await isAdminAuthenticated();
    if (!isAdmin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { categoryId, productIds, percentage, preview } = body;

    if (typeof percentage !== "number") {
      return NextResponse.json(
        { error: "Porcentaje requerido" },
        { status: 400 }
      );
    }

    // Build where clause
    const where: Record<string, unknown> = {};
    
    if (productIds && productIds.length > 0) {
      where.productId = { in: productIds };
    } else if (categoryId) {
      const productsInCategory = await prisma.product.findMany({
        where: { categoryId },
        select: { id: true },
      });
      where.productId = { in: productsInCategory.map((p) => p.id) };
    } else {
      return NextResponse.json(
        { error: "Debe seleccionar categoría o productos" },
        { status: 400 }
      );
    }

    // Get current pricing
    const pricings = await prisma.pricing.findMany({
      where,
      include: {
        product: {
          select: { id: true, name: true, code: true },
        },
      },
    });

    // Calculate new prices
    const changes = pricings.map((pricing) => ({
      productId: pricing.productId,
      productName: pricing.product.name,
      productCode: pricing.product.code,
      currentPrice: pricing.priceUsd,
      newPrice: applyPercentageChange(pricing.priceUsd, percentage),
      difference:
        applyPercentageChange(pricing.priceUsd, percentage) - pricing.priceUsd,
    }));

    // If preview mode, return the changes without applying
    if (preview) {
      return NextResponse.json({
        preview: true,
        percentage,
        changes,
        totalProducts: changes.length,
      });
    }

    // Apply changes
    const updates = changes.map((change) =>
      prisma.pricing.update({
        where: { productId: change.productId },
        data: { priceUsd: change.newPrice },
      })
    );

    await prisma.$transaction(updates);

    return NextResponse.json({
      success: true,
      percentage,
      updatedCount: changes.length,
      changes,
    });
  } catch (error) {
    console.error("Error in bulk price update:", error);
    return NextResponse.json(
      { error: "Error al actualizar precios" },
      { status: 500 }
    );
  }
}





