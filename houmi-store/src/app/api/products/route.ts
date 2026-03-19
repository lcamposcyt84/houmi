import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { calculatePriceDisplay } from "@/lib/currency";
import { getStockStatus } from "@/lib/utils";
import type { ProductWithPrices, ProductsResponse } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Parse query params
    const search = searchParams.get("search") || "";
    const categorySlug = searchParams.get("category") || "";
    const sortBy = searchParams.get("sort") || "newest";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "24", 10);
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {
      isActive: true,
    };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { code: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (categorySlug) {
      where.category = { slug: categorySlug };
    }

    // Build orderBy
    let orderBy: Record<string, string> = { createdAt: "desc" };
    
    if (sortBy === "price_asc") {
      orderBy = { pricing: { priceUsd: "asc" } } as unknown as Record<string, string>;
    } else if (sortBy === "price_desc") {
      orderBy = { pricing: { priceUsd: "desc" } } as unknown as Record<string, string>;
    } else if (sortBy === "name") {
      orderBy = { name: "asc" };
    }

    // Fetch products
    const [products, total, categories, settings] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          inventory: true,
          pricing: true,
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
      prisma.category.findMany({
        orderBy: { name: "asc" },
      }),
      prisma.settings.findUnique({
        where: { id: "main" },
      }),
    ]);

    const exchangeRate = settings?.exchangeRateUsdToVes || 40;

    // Transform products with calculated prices
    const productsWithPrices: ProductWithPrices[] = products.map((product) => {
      const priceUsd = product.pricing?.priceUsd || 0;
      const manualVes = product.pricing?.manualVes || false;
      const priceVes = product.pricing?.priceVes || null;
      const stock = product.inventory?.stock || 0;
      const images = JSON.parse(product.images) as string[];

      return {
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
    });

    const response: ProductsResponse = {
      products: productsWithPrices,
      categories,
      settings: settings || {
        id: "main",
        exchangeRateUsdToVes: 40,
        storeName: "Houmi Store",
        storeDescription: null,
        whatsappNumber: null,
        mercantilApiUrl: null,
        mercantilApiPath: null,
        mercantilApiKey: null,
        mercantilApiSecret: null,
        mercantilMasterKey: null,
        mercantilIdComercio: null,
        mercantilWebhookUrl: null,
        updatedAt: new Date(),
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}





