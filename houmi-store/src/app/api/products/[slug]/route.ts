import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { calculatePriceDisplay } from "@/lib/currency";
import { getStockStatus } from "@/lib/utils";
import type { ProductWithPrices } from "@/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    const [product, settings] = await Promise.all([
      prisma.product.findUnique({
        where: { slug },
        include: {
          category: true,
          inventory: true,
          pricing: true,
        },
      }),
      prisma.settings.findUnique({
        where: { id: "main" },
      }),
    ]);

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    const exchangeRate = settings?.exchangeRateUsdToVes || 40;
    const priceUsd = product.pricing?.priceUsd || 0;
    const manualVes = product.pricing?.manualVes || false;
    const priceVes = product.pricing?.priceVes || null;
    const stock = product.inventory?.stock || 0;
    const images = JSON.parse(product.images) as string[];

    const productWithPrices: ProductWithPrices = {
      ...product,
      images,
      priceDisplay: calculatePriceDisplay(
        priceUsd,
        exchangeRate,
        priceVes,
        manualVes
      ),
      stock,
      stockStatus: getStockStatus(stock),
    };

    return NextResponse.json({
      product: productWithPrices,
      settings,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}





