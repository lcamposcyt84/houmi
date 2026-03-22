
import {
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Layers,
  CreditCard,
} from "lucide-react";
import { Card } from "@/components/ui";

interface StatsProps {
  stats: {
    totalProducts: number;
    activeProducts: number;
    totalCategories: number;
    lowStockProducts: number;
    totalSalesUsd: number;
    totalSalesCount: number;
    totalExpensesUsd: number;
    totalExpensesCount: number;
    totalPurchasesUsd: number;
    totalPurchasesCount: number;
    exchangeRate: number;
  };
}

export function DashboardStats({ stats }: StatsProps) {
  if (!stats) return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
    {[...Array(8)].map((_, i) => (
      <Card key={i} className="h-32 bg-gray-100"><div /></Card>
    ))}
  </div>;

  const profit = stats.totalSalesUsd - stats.totalExpensesUsd - stats.totalPurchasesUsd;
  const profitVes = profit * stats.exchangeRate;

  const statCards = [
    {
      title: "Ventas Totales",
      value: `$${stats.totalSalesUsd.toFixed(2)}`,
      subValue: `Bs ${(stats.totalSalesUsd * stats.exchangeRate).toFixed(2)}`,
      description: `${stats.totalSalesCount} ventas realizadas`,
      icon: ShoppingCart,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Compras (Inventario)",
      value: `$${stats.totalPurchasesUsd.toFixed(2)}`,
      subValue: `Bs ${(stats.totalPurchasesUsd * stats.exchangeRate).toFixed(2)}`,
      description: `${stats.totalPurchasesCount} compras registradas`,
      icon: CreditCard,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Gastos",
      value: `$${stats.totalExpensesUsd.toFixed(2)}`,
      subValue: `Bs ${(stats.totalExpensesUsd * stats.exchangeRate).toFixed(2)}`,
      description: `${stats.totalExpensesCount} gastos registrados`,
      icon: TrendingDown,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
    {
      title: "Ganancia Neta",
      value: `$${profit.toFixed(2)}`,
      subValue: `Bs ${profitVes.toFixed(2)}`,
      description: profit >= 0 ? "Balance positivo" : "Balance negativo",
      icon: profit >= 0 ? TrendingUp : TrendingDown,
      color: profit >= 0 ? "text-emerald-600" : "text-red-600",
      bgColor: profit >= 0 ? "bg-emerald-100" : "bg-red-100",
    },
    {
      title: "Productos",
      value: stats.totalProducts.toString(),
      subValue: `${stats.activeProducts} activos`,
      description: `en ${stats.totalCategories} categorías`,
      icon: Package,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Stock Bajo",
      value: stats.lowStockProducts.toString(),
      subValue: "productos",
      description: "con 5 o menos unidades",
      icon: AlertTriangle,
      color: stats.lowStockProducts > 0 ? "text-amber-600" : "text-gray-600",
      bgColor: stats.lowStockProducts > 0 ? "bg-amber-100" : "bg-gray-100",
    },
    {
      title: "Tasa de Cambio",
      value: `$1 = Bs ${stats.exchangeRate.toFixed(2)}`,
      subValue: "USD a VES",
      description: "Configurable en ajustes",
      icon: DollarSign,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
    },
    {
      title: "Categorías",
      value: stats.totalCategories.toString(),
      subValue: "categorías",
      description: "organizando productos",
      icon: Layers,
      color: "text-cyan-600",
      bgColor: "bg-cyan-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => (
        <Card key={index} className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-brand-text-muted">{stat.title}</p>
              <p className="text-2xl font-bold text-brand-text mt-1">
                {stat.value}
              </p>
              <p className="text-sm text-brand-text-muted">{stat.subValue}</p>
            </div>
            <div className={`p-3 rounded-xl ${stat.bgColor}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
          </div>
          <p className="text-xs text-brand-text-muted mt-3">{stat.description}</p>
        </Card>
      ))}
    </div>
  );
}
