import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { verifyAdminToken } from "@/lib/auth";
import { cookies } from "next/headers";

async function isAuthenticated() {
  const cookieStore = cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) return false;
  const session = await verifyAdminToken(token);
  return session?.isAdmin === true;
}

// GET single product
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        inventory: true,
        pricing: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...product,
      images: JSON.parse(product.images),
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Error al obtener producto" },
      { status: 500 }
    );
  }
}

// UPDATE product
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      name,
      code,
      description,
      categoryId,
      priceUsd,
      priceVes,
      manualVes,
      stock,
      isActive,
      images,
    } = body;

    // Obtener la categoría para usar su slug
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Categoría no encontrada" },
        { status: 400 }
      );
    }

    // Generar slug usando el código y el slug de la categoría
    const slug = `${code.toLowerCase()}-${category.slug}`;

    // Update product
    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        name,
        code,
        description,
        categoryId,
        isActive,
        images: JSON.stringify(images),
        slug,
      },
    });

    // Update or create pricing
    await prisma.pricing.upsert({
      where: { productId: params.id },
      update: {
        priceUsd,
        priceVes: manualVes ? priceVes : null,
        manualVes,
      },
      create: {
        productId: params.id,
        priceUsd,
        priceVes: manualVes ? priceVes : null,
        manualVes,
      },
    });

    // Update or create inventory
    await prisma.inventory.upsert({
      where: { productId: params.id },
      update: { stock },
      create: { productId: params.id, stock },
    });

    // Revalidar páginas públicas
    revalidatePath("/products");
    revalidatePath("/");
    revalidatePath(`/products/${slug}`);

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Error al actualizar producto" },
      { status: 500 }
    );
  }
}

// DELETE product
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    await prisma.product.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Error al eliminar producto" },
      { status: 500 }
    );
  }
}
