import { NextRequest, NextResponse } from "next/server";
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

// GET all purchases
export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const purchases = await prisma.purchase.findMany({
      orderBy: { createdAt: "desc" },
      include: { items: true },
    });

    return NextResponse.json(purchases);
  } catch (error) {
    console.error("Error fetching purchases:", error);
    return NextResponse.json(
      { error: "Error al obtener compras" },
      { status: 500 }
    );
  }
}

// CREATE new purchase
export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { supplier, description, totalUsd, totalVes, items } = body;

    const purchase = await prisma.purchase.create({
      data: {
        supplier,
        description,
        totalUsd,
        totalVes,
        status: "received",
        items: {
          create: items.map((item: {
            productId: string | null;
            productName: string;
            quantity: number;
            costUsd: number;
          }) => ({
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            costUsd: item.costUsd,
          })),
        },
      },
      include: { items: true },
    });

    // Update inventory (increase stock) for existing products
    for (const item of items) {
      if (item.productId) {
        await prisma.inventory.upsert({
          where: { productId: item.productId },
          update: {
            stock: {
              increment: item.quantity,
            },
          },
          create: {
            productId: item.productId,
            stock: item.quantity,
          },
        });
      }
    }

    return NextResponse.json({ success: true, purchase });
  } catch (error) {
    console.error("Error creating purchase:", error);
    return NextResponse.json(
      { error: "Error al crear compra" },
      { status: 500 }
    );
  }
}
