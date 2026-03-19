import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const isAdmin = await isAdminAuthenticated();
    if (!isAdmin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const categoryId = searchParams.get("categoryId") || "";

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { code: { contains: search } },
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    const [products, categories, settings] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          inventory: true,
          pricing: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.category.findMany({
        orderBy: { name: "asc" },
      }),
      prisma.settings.findUnique({
        where: { id: "main" },
      }),
    ]);

    return NextResponse.json({
      products: products.map((p) => ({
        ...p,
        images: JSON.parse(p.images),
      })),
      categories,
      settings,
    });
  } catch (error) {
    console.error("Error fetching admin products:", error);
    return NextResponse.json(
      { error: "Error al obtener productos" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const isAdmin = await isAdminAuthenticated();
    if (!isAdmin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { productId, stock, priceUsd, isActive, manualVes, priceVes } = body;

    if (!productId) {
      return NextResponse.json(
        { error: "ID de producto requerido" },
        { status: 400 }
      );
    }

    // Update product
    const updateData: Record<string, unknown> = {};
    if (typeof isActive === "boolean") {
      updateData.isActive = isActive;
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.product.update({
        where: { id: productId },
        data: updateData,
      });
    }

    // Update inventory
    if (typeof stock === "number") {
      await prisma.inventory.upsert({
        where: { productId },
        update: { stock },
        create: { productId, stock },
      });
    }

    // Update pricing
    const pricingUpdate: Record<string, unknown> = {};
    if (typeof priceUsd === "number") {
      pricingUpdate.priceUsd = priceUsd;
    }
    if (typeof manualVes === "boolean") {
      pricingUpdate.manualVes = manualVes;
    }
    if (typeof priceVes === "number") {
      pricingUpdate.priceVes = priceVes;
    }

    if (Object.keys(pricingUpdate).length > 0) {
      await prisma.pricing.upsert({
        where: { productId },
        update: pricingUpdate,
        create: {
          productId,
          priceUsd: priceUsd || 0,
          manualVes: manualVes || false,
          priceVes: priceVes || null,
        },
      });
    }

    // Fetch updated product
    const updatedProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
        inventory: true,
        pricing: true,
      },
    });

    // Revalidar las páginas públicas para que muestren los cambios
    revalidatePath("/products");
    revalidatePath("/");
    if (updatedProduct) {
      revalidatePath(`/products/${updatedProduct.slug}`);
    }

    return NextResponse.json({
      success: true,
      product: updatedProduct
        ? { ...updatedProduct, images: JSON.parse(updatedProduct.images) }
        : null,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Error al actualizar producto" },
      { status: 500 }
    );
  }
}





