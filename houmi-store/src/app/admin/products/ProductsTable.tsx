"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Save, Check, X, Loader2, Edit, Plus } from "lucide-react";
import { Input, Select, Button, Badge, Card } from "@/components/ui";
import { formatUSD, formatBs } from "@/lib/currency";
import type { Category } from "@/types";

interface Product {
  id: string;
  code: string;
  name: string;
  images: string[];
  isActive: boolean;
  category: Category;
  inventory: { stock: number } | null;
  pricing: { priceUsd: number; priceVes: number | null; manualVes: boolean } | null;
}

interface EditingState {
  [productId: string]: {
    stock?: number;
    priceUsd?: number;
    isActive?: boolean;
  };
}

export function ProductsTable() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [exchangeRate, setExchangeRate] = useState(40);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [editing, setEditing] = useState<EditingState>({});
  const [saving, setSaving] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (categoryFilter) params.set("categoryId", categoryFilter);

      const response = await fetch(`/api/admin/products?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        setProducts(data.products);
        setCategories(data.categories);
        setExchangeRate(data.settings?.exchangeRateUsdToVes || 40);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
    setIsLoading(false);
  }, [search, categoryFilter]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleEdit = (productId: string, field: string, value: number | boolean) => {
    setEditing((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value,
      },
    }));
  };

  const handleSave = async (productId: string) => {
    const changes = editing[productId];
    if (!changes) return;

    // Limpiar y validar los valores numéricos
    const cleanedChanges = { ...changes };
    if (typeof cleanedChanges.priceUsd === 'number') {
      // Asegurar que sea un número válido y positivo
      cleanedChanges.priceUsd = Math.max(0, Number(cleanedChanges.priceUsd.toFixed(2)));
    }
    if (typeof cleanedChanges.stock === 'number') {
      cleanedChanges.stock = Math.max(0, Math.floor(cleanedChanges.stock));
    }

    setSaving(productId);
    try {
      const response = await fetch("/api/admin/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, ...cleanedChanges }),
      });

      if (response.ok) {
        const data = await response.json();
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? data.product : p))
        );
        setEditing((prev) => {
          const newEditing = { ...prev };
          delete newEditing[productId];
          return newEditing;
        });
        // Mostrar confirmación visual
        alert(`✅ Producto actualizado correctamente`);
      } else {
        const errorData = await response.json();
        alert(`❌ Error: ${errorData.error || 'No se pudo guardar'}`);
      }
    } catch (error) {
      console.error("Error saving product:", error);
      alert("❌ Error de conexión al guardar");
    }
    setSaving(null);
  };

  const handleCancel = (productId: string) => {
    setEditing((prev) => {
      const newEditing = { ...prev };
      delete newEditing[productId];
      return newEditing;
    });
  };

  const getEditValue = (product: Product, field: "stock" | "priceUsd" | "isActive") => {
    const editState = editing[product.id];
    if (editState && field in editState) {
      return editState[field];
    }
    if (field === "stock") return product.inventory?.stock || 0;
    if (field === "priceUsd") return product.pricing?.priceUsd || 0;
    return product.isActive;
  };

  const hasChanges = (productId: string) => {
    return productId in editing && Object.keys(editing[productId]).length > 0;
  };

  const categoryOptions = [
    { value: "", label: "Todas las categorías" },
    ...categories.map((c) => ({ value: c.id, label: c.name })),
  ];

  return (
    <Card padding="none">
      {/* Filters */}
      <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o código..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900/20 focus:border-[#1B3A6D]"
          />
        </div>
        <div className="w-full md:w-64">
          <Select
            options={categoryOptions}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Producto
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categoría
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Precio USD
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Precio VES
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-brand-primary mx-auto" />
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                  No se encontraron productos
                </td>
              </tr>
            ) : (
              products.map((product) => {
                const stock = getEditValue(product, "stock") as number;
                const priceUsd = getEditValue(product, "priceUsd") as number;
                const isActive = getEditValue(product, "isActive") as boolean;
                const priceVes = priceUsd * exchangeRate;

                return (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                          <Image
                            src={product.images[0] || "/placeholder.svg"}
                            alt={product.name}
                            fill
                            className="object-contain p-1"
                          />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 truncate max-w-[200px]">
                            {product.name}
                          </p>
                          <p className="text-sm text-gray-500">{product.code}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-600">
                        {product.category.name}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <input
                        type="number"
                        min="0"
                        value={stock}
                        onChange={(e) =>
                          handleEdit(product.id, "stock", parseInt(e.target.value) || 0)
                        }
                        className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-900/20 focus:border-[#1B3A6D] text-sm"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        <span className="text-gray-500">$</span>
                        <input
                          type="text"
                          inputMode="decimal"
                          pattern="[0-9]*\.?[0-9]*"
                          value={priceUsd}
                          onChange={(e) => {
                            // Limpiar el valor: solo permitir números y un punto decimal
                            const cleanValue = e.target.value.replace(/[^0-9.]/g, '');
                            // Evitar múltiples puntos decimales
                            const parts = cleanValue.split('.');
                            const sanitized = parts.length > 2 
                              ? parts[0] + '.' + parts.slice(1).join('')
                              : cleanValue;
                            const numValue = parseFloat(sanitized) || 0;
                            handleEdit(product.id, "priceUsd", numValue);
                          }}
                          onBlur={(e) => {
                            // Al perder foco, formatear a 2 decimales
                            const numValue = parseFloat(e.target.value.replace(/[^0-9.]/g, '')) || 0;
                            handleEdit(product.id, "priceUsd", Number(numValue.toFixed(2)));
                          }}
                          className="w-24 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-900/20 focus:border-[#1B3A6D] text-sm"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-600">
                        {formatBs(priceVes)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => handleEdit(product.id, "isActive", !isActive)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          isActive
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {isActive ? "Activo" : "Inactivo"}
                      </button>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="p-1.5 text-brand-primary hover:bg-brand-primary/10 rounded transition-colors"
                          title="Editar producto"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        {hasChanges(product.id) && (
                          <>
                            <button
                              onClick={() => handleSave(product.id)}
                              disabled={saving === product.id}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors disabled:opacity-50"
                              title="Guardar"
                            >
                              {saving === product.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Check className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => handleCancel(product.id)}
                              className="p-1.5 text-gray-500 hover:bg-gray-100 rounded transition-colors"
                              title="Cancelar"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <p className="text-sm text-gray-600">
          {products.length} productos • Tasa de cambio: {formatUSD(1)} = {formatBs(exchangeRate)}
        </p>
      </div>
    </Card>
  );
}

