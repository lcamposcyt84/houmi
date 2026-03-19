import { NextResponse } from "next/server";
import { getCustomerSession } from "@/lib/customer-auth";
import { prisma } from "@/lib/db";

// GET /api/v1/orders — get customer's order history
export async function GET() {
  const session = await getCustomerSession();
  if (!session) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const orders = await prisma.sale.findMany({
    where: { customerId: session.customerId },
    include: {
      items: true,
      shipments: {
        select: { carrier: true, trackingNumber: true, trackingUrl: true, status: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ orders });
}
