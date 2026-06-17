import { useState, useEffect } from "react";
import { SalesTable } from "./SalesTable";
import { phpFetch } from "@/lib/php-client";

export default function SalesPage() {
  const [sales, setSales] = useState<any[]>([]);
  const [exchangeRate, setExchangeRate] = useState(40);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      phpFetch("admin/orders/get.php"),
      phpFetch("admin/settings/get.php")
    ]).then(async ([ordersRes, settingsRes]) => {
      if (ordersRes.ok) {
        const data = await ordersRes.json();
        // Map PHP orders response to SalesTable structure (igual que Next.js)
        const mapped = (data.orders || []).map((order: any) => ({
          id: order.id,
          orderNumber: order.orderNumber,
          customerName: order.customer?.name || order.customerName || "Cliente",
          customerEmail: order.customer?.email || order.customerEmail || null,
          customerPhone: order.customer?.phone || order.customerPhone || null,
          totalUsd: order.totals?.usd ?? order.totalUsd ?? 0,
          totalVes: order.totals?.ves ?? order.totalVes ?? 0,
          status: order.status,
          paymentMethod: order.paymentMethod,
          referenceNumber: order.referenceNumber,
          createdAt: new Date(order.createdAt),
          items: (order.items || []).map((item: any) => ({
            id: item.id,
            productName: item.product?.name || item.productName || "",
            productCode: item.product?.code || item.productCode || "",
            quantity: item.quantity,
            priceUsd: item.priceUsd,
            priceVes: item.priceVes,
          }))
        }));
        setSales(mapped);
      }
      if (settingsRes.ok) {
        const sd = await settingsRes.json();
        setExchangeRate(sd.settings?.exchangeRateUsdToVes || 40);
      }
    })
    .catch(e => console.error(e))
    .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="p-8 text-center">Cargando ventas...</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-text">Ventas</h1>
        <p className="text-brand-text-muted">Historial de todas las ventas</p>
      </div>
      <SalesTable sales={sales} exchangeRate={exchangeRate} />
    </div>
  );
}
