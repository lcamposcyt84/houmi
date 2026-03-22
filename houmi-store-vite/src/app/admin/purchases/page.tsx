import { useState, useEffect } from "react";
import { PurchasesTable } from "./PurchasesTable";
import { phpFetch } from "@/lib/php-client";

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<any[]>([]);
  const [exchangeRate, setExchangeRate] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    phpFetch("admin/purchases/get.php")
      .then(r => r.json())
      .then(data => {
        setPurchases(data.purchases || []);
        setExchangeRate(data.exchangeRate || 1);
        setLoading(false);
      })
      .catch(e => { console.error(e); setLoading(false); });
  }, []);

  if (loading) return <p className="p-8 text-center">Cargando compras...</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-display text-brand-primary">Compras</h1>
      <PurchasesTable purchases={purchases} exchangeRate={exchangeRate} />
    </div>
  );
}
