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

// GET single order
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const order = await prisma.sale.findUnique({
      where: { id: params.id },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Pedido no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Error al obtener pedido" },
      { status: 500 }
    );
  }
}

// UPDATE order status
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { status } = body;

    const validStatuses = ["pending", "confirmed", "shipped", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Estado inválido" },
        { status: 400 }
      );
    }

    const order = await prisma.sale.update({
      where: { id: params.id },
      data: { status },
    });

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Error al actualizar pedido" },
      { status: 500 }
    );
  }
}

// DELETE order
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    await prisma.sale.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting order:", error);
    return NextResponse.json(
      { error: "Error al eliminar pedido" },
      { status: 500 }
    );
  }
}
