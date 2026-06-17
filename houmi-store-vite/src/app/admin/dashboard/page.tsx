import { DashboardStats } from "./DashboardStats";
import { RecentActivity } from "./RecentActivity";
import { QuickActions } from "./QuickActions";
import { useState, useEffect } from "react";
import { getDashboardData } from "@/lib/admin-functions";

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [recentSales, setRecentSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardData().then((data) => {
      setStats(data.stats);
      setRecentSales(data.recentSales);
      setLoading(false);
    });
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
