import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";

import { DashboardStats } from "./DashboardStats";
import { RecentActivity } from "./RecentActivity";
import { QuickActions } from "./QuickActions";

export const metadata: Metadata = {
  title: "Dashboard | Admin",
  description: "Panel de control de Houmi Store",
};

import { cookies } from "next/headers";

async function getDashboardData() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost/houmi-master/houmi-store/api";

  try {
    const res = await fetch(`${API_URL}/admin/dashboard.php`, {
      headers: {
        Cookie: `admin_token=${token}`
      },
      cache: "no-store"
    });

    if (res.ok) {
      const data = await res.json();
      return {
        stats: {
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
        },
        recentSales: data.recentSales || [],
      };
    }
  } catch (e) {
    console.error("Failed to fetch dashboard data", e);
  }

  return {
    stats: {
      totalProducts: 0,
      activeProducts: 0,
      totalCategories: 0,
      lowStockProducts: 0,
      totalSalesUsd: 0,
      totalSalesCount: 0,
      totalExpensesUsd: 0,
      totalExpensesCount: 0,
      totalPurchasesUsd: 0,
      totalPurchasesCount: 0,
      exchangeRate: 40,
    },
    recentSales: [],
  };
}

export default async function DashboardPage() {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  const { stats, recentSales } = await getDashboardData();

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
          <RecentActivity sales={recentSales} exchangeRate={stats.exchangeRate} />
        </div>
        <div>
          <QuickActions />
        </div>
      </div>
    </div>
  );
}
