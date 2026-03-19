import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DashboardStats } from "./DashboardStats";
import { RecentActivity } from "./RecentActivity";
import { QuickActions } from "./QuickActions";

export const metadata: Metadata = {
  title: "Dashboard | Admin",
  description: "Panel de control de Houmi Store",
};

async function getDashboardData() {
  const [
    totalProducts,
    activeProducts,
    totalCategories,
    lowStockProducts,
    totalSales,
    recentSales,
    totalExpenses,
    totalPurchases,
    settings,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { isActive: true } }),
    prisma.category.count(),
    prisma.inventory.count({ where: { stock: { lte: 5 } } }),
    prisma.sale.aggregate({
      _sum: { totalUsd: true },
      _count: true,
    }),
    prisma.sale.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { items: true },
    }),
    prisma.expense.aggregate({
      _sum: { amountUsd: true },
      _count: true,
    }),
    prisma.purchase.aggregate({
      _sum: { totalUsd: true },
      _count: true,
    }),
    prisma.settings.findUnique({ where: { id: "main" } }),
  ]);

  const exchangeRate = settings?.exchangeRateUsdToVes || 40;

  return {
    stats: {
      totalProducts,
      activeProducts,
      totalCategories,
      lowStockProducts,
      totalSalesUsd: totalSales._sum.totalUsd || 0,
      totalSalesCount: totalSales._count,
      totalExpensesUsd: totalExpenses._sum.amountUsd || 0,
      totalExpensesCount: totalExpenses._count,
      totalPurchasesUsd: totalPurchases._sum.totalUsd || 0,
      totalPurchasesCount: totalPurchases._count,
      exchangeRate,
    },
    recentSales,
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
