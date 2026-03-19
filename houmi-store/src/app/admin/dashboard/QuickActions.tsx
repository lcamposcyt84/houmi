"use client";

import Link from "next/link";
import { Card, Button } from "@/components/ui";
import {
  Package,
  DollarSign,
  Settings,
  Plus,
  Receipt,
  Wallet,
  TrendingUp,
} from "lucide-react";

export function QuickActions() {
  const actions = [
    {
      title: "Ver Productos",
      description: "Gestionar catálogo",
      href: "/admin/products",
      icon: Package,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Precios en Lote",
      description: "Actualizar precios",
      href: "/admin/bulk-pricing",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Registrar Venta",
      description: "Nueva venta manual",
      href: "/admin/sales/new",
      icon: Plus,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Ver Ventas",
      description: "Historial de ventas",
      href: "/admin/sales",
      icon: Receipt,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
    },
    {
      title: "Registrar Gasto",
      description: "Nuevo gasto",
      href: "/admin/expenses/new",
      icon: Wallet,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
    {
      title: "Compras",
      description: "Inventario entrante",
      href: "/admin/purchases",
      icon: TrendingUp,
      color: "text-cyan-600",
      bgColor: "bg-cyan-100",
    },
    {
      title: "Configuración",
      description: "Tasa de cambio",
      href: "/admin/settings",
      icon: Settings,
      color: "text-gray-600",
      bgColor: "bg-gray-100",
    },
  ];

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-brand-text mb-4">
        Acciones Rápidas
      </h2>
      <div className="space-y-2">
        {actions.map((action, index) => (
          <Link key={index} href={action.href}>
            <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
              <div className={`p-2 rounded-lg ${action.bgColor}`}>
                <action.icon className={`w-5 h-5 ${action.color}`} />
              </div>
              <div>
                <p className="font-medium text-brand-text text-sm">
                  {action.title}
                </p>
                <p className="text-xs text-brand-text-muted">
                  {action.description}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
}
