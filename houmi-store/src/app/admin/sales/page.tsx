import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";

import { SalesTable } from "./SalesTable";

export const metadata: Metadata = {
  title: "Ventas | Admin",
  description: "Gestión de ventas",
};

import { cookies } from "next/headers";
import { getPhpApiBaseUrl } from "@/lib/php-api-base-url";

async function getSales() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  const API_URL = getPhpApiBaseUrl();

  let sales: any[] = [];
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
      // Map the PHP response back to the Prisma-like structure expected by SalesTable
      sales = (data.orders || []).map((order: any) => ({
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
    console.error("Failed to fetch sales from PHP API", e);
  }

  return { sales, exchangeRate };
}

export default async function SalesPage() {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  const { sales, exchangeRate } = await getSales();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-text">Ventas</h1>
          <p className="text-brand-text-muted">
            Historial de todas las ventas
          </p>
        </div>
      </div>

      <SalesTable sales={sales} exchangeRate={exchangeRate} />
    </div>
  );
}
