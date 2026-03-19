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

// GET all sales
export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const sales = await prisma.sale.findMany({
      orderBy: { createdAt: "desc" },
      include: { items: true },
    });

    return NextResponse.json(sales);
  } catch (error) {
    console.error("Error fetching sales:", error);
    return NextResponse.json(
      { error: "Error al obtener ventas" },
      { status: 500 }
    );
  }
}

// CREATE new sale
export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      totalUsd,
      totalVes,
      items,
    } = body;

    // Generate order number
    const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}`;

    const sale = await prisma.sale.create({
      data: {
        orderNumber,
        customerName,
        customerEmail,
        customerPhone,
        customerAddress,
        totalUsd,
        totalVes,
        status: "completed",
        items: {
          create: items.map((item: {
            productId: string;
            productName: string;
            productCode: string;
            quantity: number;
            priceUsd: number;
            priceVes: number;
          }) => ({
            productId: item.productId,
            productName: item.productName,
            productCode: item.productCode,
            quantity: item.quantity,
            priceUsd: item.priceUsd,
            priceVes: item.priceVes,
          })),
        },
      },
      include: { items: true },
    });

    // Update inventory (reduce stock)
    for (const item of items) {
      if (item.productId) {
        await prisma.inventory.updateMany({
          where: { productId: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }
    }

    return NextResponse.json({ success: true, sale });
  } catch (error) {
    console.error("Error creating sale:", error);
    return NextResponse.json(
      { error: "Error al crear venta" },
      { status: 500 }
    );
  }
}
