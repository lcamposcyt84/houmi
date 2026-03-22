
import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, Button } from "@/components/ui";
import { Search, Plus, Wallet, Trash2 } from "lucide-react";

interface Expense {
  id: string;
  category: string;
  description: string;
  amountUsd: number;
  amountVes: number | null;
  date: Date;
}

interface ExpensesTableProps {
  expenses: Expense[];
  exchangeRate: number;
}

const categoryLabels: Record<string, string> = {
  rent: "Alquiler",
  utilities: "Servicios",
  marketing: "Marketing",
  supplies: "Suministros",
  salary: "Salarios",
  transport: "Transporte",
  other: "Otros",
};

const categoryColors: Record<string, string> = {
  rent: "bg-purple-100 text-purple-700",
  utilities: "bg-blue-100 text-blue-700",
  marketing: "bg-pink-100 text-pink-700",
  supplies: "bg-green-100 text-green-700",
  salary: "bg-orange-100 text-orange-700",
  transport: "bg-cyan-100 text-cyan-700",
  other: "bg-gray-100 text-gray-700",
};

export function ExpensesTable({ expenses, exchangeRate }: ExpensesTableProps) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch = expense.description
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || expense.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("es-VE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const totalUsd = filteredExpenses.reduce((sum, e) => sum + e.amountUsd, 0);

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este gasto?")) return;

    try {
      const response = await fetch(`/api/admin/expenses/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        window.location.reload();
      }
    } catch (err) {
      console.error("Error deleting expense:", err);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por descripción..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
          >
            <option value="all">Todas las categorías</option>
            {Object.entries(categoryLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
          <Link to="/admin/expenses/new">
            <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
              Nuevo Gasto
            </Button>
          </Link>
        </div>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-sm text-brand-text-muted">Total Gastos</p>
          <p className="text-2xl font-bold text-brand-text">
            {filteredExpenses.length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-brand-text-muted">Total USD</p>
          <p className="text-2xl font-bold text-red-600">
            ${totalUsd.toFixed(2)}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-brand-text-muted">Total VES</p>
          <p className="text-2xl font-bold text-brand-primary">
            Bs {(totalUsd * exchangeRate).toFixed(2)}
          </p>
        </Card>
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-12">
            <Wallet className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-brand-text-muted">No hay gastos registrados</p>
            <Link to="/admin/expenses/new" className="mt-4 inline-block">
              <Button variant="outline" size="sm">
                Registrar primer gasto
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-brand-text-muted">
                    Fecha
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-brand-text-muted">
                    Categoría
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-brand-text-muted">
                    Descripción
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-brand-text-muted">
                    Monto
                  </th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-brand-text-muted">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredExpenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-brand-text-muted">
                      {formatDate(expense.date)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          categoryColors[expense.category] ||
                          "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {categoryLabels[expense.category] || expense.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-brand-text">
                      {expense.description}
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-brand-text">
                          ${expense.amountUsd.toFixed(2)}
                        </p>
                        <p className="text-xs text-brand-text-muted">
                          Bs{" "}
                          {(expense.amountVes ||
                            expense.amountUsd * exchangeRate).toFixed(2)}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(expense.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
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
