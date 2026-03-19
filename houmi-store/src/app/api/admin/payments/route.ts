import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const isAdmin = await isAdminAuthenticated();
    if (!isAdmin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const notifications = await prisma.paymentNotification.findMany({
      orderBy: { createdAt: "desc" },
      take: 100, // Últimas 100 notificaciones
      include: {
        sale: {
          select: {
            orderNumber: true,
            customerName: true,
          },
        },
      },
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Error fetching payment notifications:", error);
    return NextResponse.json(
      { error: "Error al obtener notificaciones" },
      { status: 500 }
    );
  }
}
