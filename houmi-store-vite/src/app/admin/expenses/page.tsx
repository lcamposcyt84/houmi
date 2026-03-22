import { useState, useEffect } from "react";
import { ExpensesTable } from "./ExpensesTable";
import { phpFetch } from "@/lib/php-client";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [exchangeRate, setExchangeRate] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    phpFetch("admin/expenses/get.php")
      .then(r => r.json())
      .then(data => {
        setExpenses(data.expenses || []);
        setExchangeRate(data.exchangeRate || 1);
        setLoading(false);
      })
      .catch(e => { console.error(e); setLoading(false); });
  }, []);

  if (loading) return <p className="p-8 text-center">Cargando gastos...</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-display text-brand-primary">Gastos</h1>
      <ExpensesTable expenses={expenses} exchangeRate={exchangeRate} />
    </div>
  );
}
