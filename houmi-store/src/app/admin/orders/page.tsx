import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { OrdersTable } from "./OrdersTable";

export const metadata: Metadata = {
  title: "Pedidos | Admin",
  description: "Gestión de pedidos de clientes",
};

export const dynamic = "force-dynamic";

async function getOrders() {
  const [orders, settings] = await Promise.all([
    prisma.sale.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        items: true,
      },
    }),
    prisma.settings.findUnique({ where: { id: "main" } }),
  ]);

  return {
    orders,
    exchangeRate: settings?.exchangeRateUsdToVes || 40,
  };
}

export default async function OrdersPage() {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  const { orders, exchangeRate } = await getOrders();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-text">Pedidos</h1>
        <p className="text-brand-text-muted">
          Solicitudes de compra de clientes
        </p>
      </div>

      <OrdersTable orders={orders} exchangeRate={exchangeRate} />
    </div>
  );
}
