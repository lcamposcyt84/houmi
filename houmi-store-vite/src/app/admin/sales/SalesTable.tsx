
import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, Button, Input } from "@/components/ui";
import { Search, Eye, Plus, Receipt } from "lucide-react";

interface SaleItem {
  id: string;
  productName: string;
  quantity: number;
  priceUsd: number;
}

interface Sale {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string | null;
  totalUsd: number;
  totalVes: number;
  status: string;
  createdAt: Date;
  items: SaleItem[];
}

interface SalesTableProps {
  sales: Sale[];
  exchangeRate: number;
}

export function SalesTable({ sales, exchangeRate }: SalesTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredSales = sales.filter((sale) => {
    const matchesSearch =
      sale.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      sale.customerName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || sale.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("es-VE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      completed: "bg-green-100 text-green-700",
      pending: "bg-yellow-100 text-yellow-700",
      cancelled: "bg-red-100 text-red-700",
    };
    const labels: Record<string, string> = {
      completed: "Completada",
      pending: "Pendiente",
      cancelled: "Cancelada",
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          styles[status] || "bg-gray-100 text-gray-700"
        }`}
      >
        {labels[status] || status}
      </span>
    );
  };

  const totalSalesUsd = filteredSales.reduce((sum, s) => sum + s.totalUsd, 0);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por orden o cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
          >
            <option value="all">Todos los estados</option>
            <option value="pending">Pendientes</option>
            <option value="completed">Completadas</option>
            <option value="cancelled">Canceladas</option>
          </select>
          <Link to="/admin/sales/new">
            <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
              Nueva Venta
            </Button>
          </Link>
        </div>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-sm text-brand-text-muted">Total Ventas</p>
          <p className="text-2xl font-bold text-brand-text">
            {filteredSales.length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-brand-text-muted">Total USD</p>
          <p className="text-2xl font-bold text-green-600">
            ${totalSalesUsd.toFixed(2)}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-brand-text-muted">Total VES</p>
          <p className="text-2xl font-bold text-brand-primary">
            Bs {(totalSalesUsd * exchangeRate).toFixed(2)}
          </p>
        </Card>
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        {filteredSales.length === 0 ? (
          <div className="text-center py-12">
            <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-brand-text-muted">No hay ventas registradas</p>
            <Link to="/admin/sales/new" className="mt-4 inline-block">
              <Button variant="outline" size="sm">
                Registrar primera venta
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-brand-text-muted">
                    Orden
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-brand-text-muted">
                    Cliente
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-brand-text-muted">
                    Productos
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-brand-text-muted">
                    Total
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-brand-text-muted">
                    Estado
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-brand-text-muted">
                    Fecha
                  </th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-brand-text-muted">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="font-medium text-brand-text">
                        #{sale.orderNumber}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-brand-text">{sale.customerName}</p>
                        {sale.customerEmail && (
                          <p className="text-xs text-brand-text-muted">
                            {sale.customerEmail}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-brand-text-muted">
                        {sale.items.length} producto(s)
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-brand-text">
                          ${sale.totalUsd.toFixed(2)}
                        </p>
                        <p className="text-xs text-brand-text-muted">
                          Bs {sale.totalVes.toFixed(2)}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(sale.status)}</td>
                    <td className="px-4 py-3 text-sm text-brand-text-muted">
                      {formatDate(sale.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link to={`/admin/sales/${sale.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
