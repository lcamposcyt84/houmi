"use client";

import { Card } from "@/components/ui";
import { ShoppingBag, Clock } from "lucide-react";

interface Sale {
  id: string;
  orderNumber: string;
  customerName: string;
  totalUsd: number;
  status: string;
  createdAt: Date;
  items: Array<{
    id: string;
    productName: string;
    quantity: number;
  }>;
}

interface RecentActivityProps {
  sales: Sale[];
  exchangeRate: number;
}

export function RecentActivity({ sales, exchangeRate }: RecentActivityProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("es-VE", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Completada";
      case "pending":
        return "Pendiente";
      case "cancelled":
        return "Cancelada";
      default:
        return status;
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-brand-text">
          Actividad Reciente
        </h2>
        <ShoppingBag className="w-5 h-5 text-brand-text-muted" />
      </div>

      {sales.length === 0 ? (
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-brand-text-muted">No hay ventas recientes</p>
          <p className="text-sm text-brand-text-muted mt-1">
            Las ventas aparecerán aquí cuando se registren
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sales.map((sale) => (
            <div
              key={sale.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <p className="font-medium text-brand-text">
                    #{sale.orderNumber}
                  </p>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                      sale.status
                    )}`}
                  >
                    {getStatusText(sale.status)}
                  </span>
                </div>
                <p className="text-sm text-brand-text-muted mt-1">
                  {sale.customerName} • {sale.items.length} producto(s)
                </p>
                <p className="text-xs text-brand-text-muted mt-1">
                  {formatDate(sale.createdAt)}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-brand-text">
                  ${sale.totalUsd.toFixed(2)}
                </p>
                <p className="text-sm text-brand-text-muted">
                  Bs {(sale.totalUsd * exchangeRate).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
