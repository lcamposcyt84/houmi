import { useState, useEffect } from "react";
import { OrdersTable } from "./OrdersTable";
import { phpFetch } from "@/lib/php-client";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [exchangeRate, setExchangeRate] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    phpFetch("admin/orders/get.php")
      .then(r => r.json())
      .then(data => {
        setOrders(data.orders || []);
        setExchangeRate(data.exchangeRate || 1);
        setLoading(false);
      })
      .catch(e => { console.error(e); setLoading(false); });
  }, []);

  if (loading) return <p className="p-8 text-center">Cargando órdenes...</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-display text-brand-primary">Órdenes</h1>
      <OrdersTable orders={orders} exchangeRate={exchangeRate} />
    </div>
  );
}
