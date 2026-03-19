import { NextResponse } from "next/server";
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

export async function POST() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    // Obtener todos los productos con sus categorías
    const products = await prisma.product.findMany({
      include: {
        category: true,
      },
    });

    let updated = 0;
    const errors: string[] = [];

    for (const product of products) {
      try {
        const correctSlug = `${product.code.toLowerCase()}-${product.category.slug}`;
        
        if (product.slug !== correctSlug) {
          await prisma.product.update({
            where: { id: product.id },
            data: { slug: correctSlug },
          });
          updated++;
        }
      } catch (err) {
        errors.push(`Error actualizando ${product.code}: ${err}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `${updated} productos actualizados de ${products.length} total`,
      updated,
      total: products.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Error fixing slugs:", error);
    return NextResponse.json(
      { error: "Error al corregir slugs" },
      { status: 500 }
    );
  }
}
