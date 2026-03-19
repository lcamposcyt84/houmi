import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCustomerSession } from "@/lib/customer-auth";

// GET /api/v1/wishlist — get customer's wishlist
export async function GET() {
  const session = await getCustomerSession();
  if (!session) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const items = await prisma.wishlistItem.findMany({
    where: { customerId: session.customerId },
    include: {
      product: {
        include: {
          category: true,
          pricing: true,
          inventory: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ items });
}

// POST /api/v1/wishlist — add product to wishlist
export async function POST(request: NextRequest) {
  const session = await getCustomerSession();
  if (!session) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { productId } = await request.json();
  if (!productId) return NextResponse.json({ error: "productId requerido" }, { status: 400 });

  try {
    const item = await prisma.wishlistItem.create({
      data: { customerId: session.customerId, productId },
    });
    return NextResponse.json({ success: true, item }, { status: 201 });
  } catch {
    // Unique constraint violation = already in wishlist
    return NextResponse.json({ error: "El producto ya está en tu lista de deseos" }, { status: 409 });
  }
}

// DELETE /api/v1/wishlist — remove product from wishlist
export async function DELETE(request: NextRequest) {
  const session = await getCustomerSession();
  if (!session) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { productId } = await request.json();
  if (!productId) return NextResponse.json({ error: "productId requerido" }, { status: 400 });

  await prisma.wishlistItem.deleteMany({
    where: { customerId: session.customerId, productId },
  });

  return NextResponse.json({ success: true });
}
