import { useState, useEffect } from "react";
import { OrdersTable } from "./OrdersTable";
import { phpFetch } from "@/lib/php-client";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [exchangeRate, setExchangeRate] = useState(40);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      phpFetch("admin/orders/get.php"),
      phpFetch("admin/settings/get.php")
    ]).then(async ([ordersRes, settingsRes]) => {
      if (ordersRes.ok) {
        const data = await ordersRes.json();
        // Mapear la respuesta anidada de PHP a campos planos (igual que Next.js)
        const mapped = (data.orders || []).map((order: any) => ({
          id: order.id,
          orderNumber: order.orderNumber,
          customerName: order.customer?.name || order.customerName || "Cliente",
          customerEmail: order.customer?.email || order.customerEmail || null,
          customerPhone: order.customer?.phone || order.customerPhone || null,
          customerAddress: order.shipping?.address
            ? `${order.shipping.address}${order.shipping.city ? ", " + order.shipping.city : ""}`
            : order.shippingAddress || null,
          shippingCity: order.shipping?.city || order.shippingCity || null,
          notes: order.shipping?.notes || order.notes || null,
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
            priceUsd: item.priceUsd ?? 0,
            priceVes: item.priceVes ?? 0,
          }))
        }));
        setOrders(mapped);
      }
      if (settingsRes.ok) {
        const sd = await settingsRes.json();
        setExchangeRate(sd.settings?.exchangeRateUsdToVes || 40);
      }
    })
    .catch(e => console.error(e))
    .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="p-8 text-center text-brand-text-muted">Cargando órdenes...</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-text">Pedidos</h1>
        <p className="text-brand-text-muted">Solicitudes de compra de clientes</p>
      </div>
      <OrdersTable orders={orders} exchangeRate={exchangeRate} />
    </div>
  );
}
