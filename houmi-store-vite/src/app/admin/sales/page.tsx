import { useState, useEffect } from "react";
import { SalesTable } from "./SalesTable";
import { phpFetch } from "@/lib/php-client";

export default function SalesPage() {
  const [sales, setSales] = useState<any[]>([]);
  const [exchangeRate, setExchangeRate] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    phpFetch("admin/get_sales.php")
      .then(r => r.json())
      .then(data => {
        setSales(data.sales || []);
        setExchangeRate(data.exchangeRate || 1);
        setLoading(false);
      })
      .catch(e => { console.error(e); setLoading(false); });
  }, []);

  if (loading) return <p className="p-8 text-center">Cargando ventas...</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-display text-brand-primary">Ventas</h1>
      <SalesTable sales={sales} exchangeRate={exchangeRate} />
    </div>
  );
}
