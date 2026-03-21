import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";

import { OrdersTable } from "./OrdersTable";

export const metadata: Metadata = {
  title: "Pedidos | Admin",
  description: "Gestión de pedidos de clientes",
};

import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

async function getOrders() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost/houmi-master/houmi-store/api";

  let orders: any[] = [];
  let exchangeRate = 40;

  try {
    const [res, settingsRes] = await Promise.all([
      fetch(`${API_URL}/admin/orders/get.php`, {
        headers: { Cookie: `admin_token=${token}` },
        cache: "no-store",
      }),
      fetch(`${API_URL}/admin/settings/get.php`, {
        headers: { Cookie: `admin_token=${token}` },
        cache: "no-store",
      })
    ]);

    if (res.ok) {
      const data = await res.json();
      orders = (data.orders || []).map((order: any) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customer.name,
        customerEmail: order.customer.email,
        customerPhone: order.customer.phone,
        shippingAddress: order.shipping.address,
        shippingCity: order.shipping.city,
        notes: order.shipping.notes,
        totalUsd: order.totals.usd,
        totalVes: order.totals.ves,
        exchangeRate: order.totals.exchangeRate,
        status: order.status,
        paymentMethod: order.paymentMethod,
        referenceNumber: order.referenceNumber,
        createdAt: new Date(order.createdAt),
        items: order.items.map((item: any) => ({
          id: item.id,
          saleId: order.id,
          productId: "",
          productName: item.product.name,
          productCode: item.product.code,
          quantity: item.quantity,
          priceUsd: item.priceUsd,
          priceVes: item.priceVes,
        }))
      }));
    }

    if (settingsRes.ok) {
      const settingsData = await settingsRes.json();
      exchangeRate = settingsData.settings?.exchangeRateUsdToVes || 40;
    }
  } catch (e) {
    console.error("Failed to fetch orders from PHP API", e);
  }

  return { orders, exchangeRate };
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
