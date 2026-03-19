"use client";

import { useState, useEffect } from "react";
import { Percent, AlertTriangle, Check, ArrowUp, ArrowDown } from "lucide-react";
import { Button, Input, Select, Card } from "@/components/ui";
import { formatUSD } from "@/lib/currency";
import type { Category } from "@/types";

interface PriceChange {
  productId: string;
  productName: string;
  productCode: string;
  currentPrice: number;
  newPrice: number;
  difference: number;
}

export function BulkPricingForm() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [percentage, setPercentage] = useState("");
  const [preview, setPreview] = useState<PriceChange[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/admin/products");
      const data = await response.json();
      if (response.ok) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handlePreview = async () => {
    if (!selectedCategory || !percentage) {
      setError("Selecciona una categoría e ingresa un porcentaje");
      return;
    }

    setError("");
    setIsLoading(true);
    setPreview(null);
    setSuccess(false);

    try {
      const response = await fetch("/api/admin/bulk-price", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId: selectedCategory,
          percentage: parseFloat(percentage),
          preview: true,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setPreview(data.changes);
      } else {
        setError(data.error || "Error al generar vista previa");
      }
    } catch {
      setError("Error de conexión");
    }

    setIsLoading(false);
  };

  const handleApply = async () => {
    if (!preview || preview.length === 0) return;

    setIsApplying(true);
    setError("");

    try {
      const response = await fetch("/api/admin/bulk-price", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId: selectedCategory,
          percentage: parseFloat(percentage),
          preview: false,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setPreview(null);
        setPercentage("");
        setSelectedCategory("");
      } else {
        setError(data.error || "Error al aplicar cambios");
      }
    } catch {
      setError("Error de conexión");
    }

    setIsApplying(false);
  };

  const categoryOptions = [
    { value: "", label: "Seleccionar categoría" },
    ...categories.map((c) => ({ value: c.id, label: c.name })),
  ];

  const percentageNum = parseFloat(percentage) || 0;
  const isIncrease = percentageNum > 0;
  const isDecrease = percentageNum < 0;

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Form */}
      <Card>
        <div className="p-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Configuración
            </h2>

            <div className="space-y-4">
              <Select
                label="Categoría"
                options={categoryOptions}
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setPreview(null);
                  setSuccess(false);
                }}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Porcentaje de cambio
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={percentage}
                    onChange={(e) => {
                      setPercentage(e.target.value);
                      setPreview(null);
                      setSuccess(false);
                    }}
                    placeholder="Ej: 10 para +10%, -5 para -5%"
                    className="w-full pl-4 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900/20 focus:border-[#1B3A6D]"
                  />
                  <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
                <p className="mt-1.5 text-sm text-gray-500">
                  Usa valores positivos para aumentar, negativos para disminuir
                </p>
              </div>

              {percentage && (
                <div
                  className={`p-3 rounded-lg ${
                    isIncrease
                      ? "bg-green-50 text-green-800"
                      : isDecrease
                      ? "bg-red-50 text-red-800"
                      : "bg-gray-50 text-gray-800"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isIncrease && <ArrowUp className="w-4 h-4" />}
                    {isDecrease && <ArrowDown className="w-4 h-4" />}
                    <span className="font-medium">
                      {isIncrease
                        ? `Aumento del ${percentage}%`
                        : isDecrease
                        ? `Disminución del ${Math.abs(percentageNum)}%`
                        : "Sin cambios"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg">
              <Check className="w-4 h-4 shrink-0" />
              Precios actualizados correctamente
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handlePreview}
              isLoading={isLoading}
              disabled={!selectedCategory || !percentage}
              className="flex-1"
            >
              Vista previa
            </Button>
            {preview && preview.length > 0 && (
              <Button
                variant="primary"
                onClick={handleApply}
                isLoading={isApplying}
                className="flex-1"
              >
                Aplicar cambios
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Preview */}
      <Card padding="none">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Vista previa de cambios
          </h2>
          {preview && (
            <p className="text-sm text-gray-600 mt-1">
              {preview.length} productos afectados
            </p>
          )}
        </div>

        <div className="max-h-[500px] overflow-y-auto">
          {!preview ? (
            <div className="p-8 text-center text-gray-500">
              <Percent className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Selecciona una categoría y porcentaje para ver la vista previa</p>
            </div>
          ) : preview.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No hay productos en esta categoría
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Producto
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                    Actual
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                    Nuevo
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                    Diferencia
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {preview.map((change) => (
                  <tr key={change.productId} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 text-sm truncate max-w-[150px]">
                        {change.productName}
                      </p>
                      <p className="text-xs text-gray-500">{change.productCode}</p>
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-gray-600">
                      {formatUSD(change.currentPrice)}
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                      {formatUSD(change.newPrice)}
                    </td>
                    <td
                      className={`px-4 py-3 text-right text-sm font-medium ${
                        change.difference > 0
                          ? "text-green-600"
                          : change.difference < 0
                          ? "text-red-600"
                          : "text-gray-500"
                      }`}
                    >
                      {change.difference > 0 ? "+" : ""}
                      {formatUSD(change.difference)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
}


