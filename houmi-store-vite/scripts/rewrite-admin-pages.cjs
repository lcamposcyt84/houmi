/**
 * Este script convierte páginas admin que aún tienen lógica de servidor (await, getOrders, etc.)
 * a componentes React puros usando useEffect + useState para fetch de datos.
 */
const fs = require('fs');
const path = require('path');

// Páginas admin que necesitan ser reemplazadas por stubs que usan phpFetch
const adminPageStubs = {
  'src/app/admin/orders/page.tsx': `
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
`,
  'src/app/admin/sales/page.tsx': `
import { useState, useEffect } from "react";
import { SalesTable } from "./SalesTable";
import { phpFetch } from "@/lib/php-client";

export default function SalesPage() {
  const [sales, setSales] = useState<any[]>([]);
  const [exchangeRate, setExchangeRate] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    phpFetch("admin/sales/get.php")
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
`,
  'src/app/admin/expenses/page.tsx': `
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
`,
  'src/app/admin/purchases/page.tsx': `
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
`,
};

// Admin layout fix - remove 'session' reference
const adminLayoutFix = `
import { Outlet } from "react-router-dom";
import { AdminSidebar } from "./components/AdminSidebar";
import { AdminHeader } from "./components/AdminHeader";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader />
        <main className="flex-1 p-6 overflow-y-auto">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}
`;

// php-client token fix
const phpClientFix = fs.readFileSync('src/lib/php-client.ts', 'utf8')
  .replace(/return token \? \{ Authorization: `Bearer \$\{token\}` \} : \{\};/g,
           'const t = getToken(); return t ? { Authorization: `Bearer ${t}` } : {};');

// Fix admin/dashboard/page.tsx - remove await from non-async function
let dashboardContent = fs.readFileSync('src/app/admin/dashboard/page.tsx', 'utf8');
dashboardContent = dashboardContent.replace(/const \{ stats, recentSales \} = await getDashboardData\(\);/, 
  'const [stats, setStats] = useState<any>(null);\n  const [recentSales, setRecentSales] = useState<any[]>([]);\n  useEffect(() => { getDashboardData().then(d => { setStats(d.stats); setRecentSales(d.recentSales || []); }); }, []);');
dashboardContent = dashboardContent.replace(/^(import.*from.*;\n)*/m, (match) => {
  if (!match.includes('useState')) {
    return match + 'import { useState, useEffect } from "react";\n';
  }
  return match;
});

// Write all fixes
for (const [filePath, content] of Object.entries(adminPageStubs)) {
  fs.writeFileSync(filePath, content.trim() + '\n', 'utf8');
  console.log('Rewritten:', filePath);
}

fs.writeFileSync('src/app/admin/layout.tsx', adminLayoutFix.trim() + '\n', 'utf8');
console.log('Rewritten: src/app/admin/layout.tsx');

fs.writeFileSync('src/lib/php-client.ts', phpClientFix, 'utf8');
console.log('Fixed: src/lib/php-client.ts');

fs.writeFileSync('src/app/admin/dashboard/page.tsx', dashboardContent, 'utf8');
console.log('Fixed: src/app/admin/dashboard/page.tsx');

console.log('Done! All admin pages converted to SPA pattern.');
