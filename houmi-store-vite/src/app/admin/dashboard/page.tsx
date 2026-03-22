import { DashboardStats } from "./DashboardStats";
import { RecentActivity } from "./RecentActivity";
import { QuickActions } from "./QuickActions";
import { useState, useEffect } from "react";
import { getPhpApiBaseUrl } from "@/lib/php-api-base-url";
import { phpFetch } from "@/lib/php-client";

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [recentSales, setRecentSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await phpFetch("admin/dashboard.php");

        if (res.ok) {
          const data = await res.json();
          setStats({
            totalProducts: data.metrics.totalProducts || 0,
            activeProducts: data.metrics.activeProducts || 0,
            totalCategories: data.metrics.totalCategories || 0,
            lowStockProducts: data.metrics.lowStock || 0,
            totalSalesUsd: data.metrics.totalSalesUsd || 0,
            totalSalesCount: data.recentSales?.length || 0,
            totalExpensesUsd: data.metrics.totalExpensesUsd || 0,
            totalExpensesCount: 0,
            totalPurchasesUsd: data.metrics.totalPurchasesUsd || 0,
            totalPurchasesCount: 0,
            exchangeRate: data.exchangeRate || 40,
          });
          setRecentSales(data.recentSales || []);
        }
      } catch (e) {
        console.error("Failed to fetch dashboard data", e);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <div className="p-8 text-center text-brand-text-muted">Cargando dashboard...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-brand-text">Dashboard</h1>
        <p className="text-brand-text-muted">
          Resumen general de tu tienda
        </p>
      </div>

      <DashboardStats stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {stats && (
            <RecentActivity 
              sales={recentSales} 
              exchangeRate={stats.exchangeRate} 
            />
          )}
        </div>
        <div>
          <QuickActions />
        </div>
      </div>
    </div>
  );
}
