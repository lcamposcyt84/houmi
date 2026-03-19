"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input, Select, Button } from "@/components/ui";
import type { Category } from "@/types";
import { useState, useCallback } from "react";

interface ProductFiltersProps {
  categories: Category[];
}

export function ProductFilters({ categories }: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  
  const currentSearch = searchParams.get("search") || "";
  const currentCategory = searchParams.get("category") || "";
  const currentSort = searchParams.get("sort") || "newest";

  const updateParams = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      
      // Reset to page 1 when filters change
      params.delete("page");
      
      router.push(`/products?${params.toString()}`);
    },
    [router, searchParams]
  );

  const clearFilters = () => {
    router.push("/products");
  };

  const hasActiveFilters = currentSearch || currentCategory || currentSort !== "newest";

  const sortOptions = [
    { value: "newest", label: "Más recientes" },
    { value: "price_asc", label: "Precio: menor a mayor" },
    { value: "price_desc", label: "Precio: mayor a menor" },
    { value: "name", label: "Nombre A-Z" },
  ];

  const categoryOptions = [
    { value: "", label: "Todas las categorías" },
    ...categories.map((cat) => ({ value: cat.slug, label: cat.name })),
  ];

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-text-muted" />
          <input
            type="text"
            placeholder="Buscar productos..."
            defaultValue={currentSearch}
            onChange={(e) => {
              // Debounce search
              const value = e.target.value;
              const timeoutId = setTimeout(() => {
                updateParams("search", value);
              }, 500);
              return () => clearTimeout(timeoutId);
            }}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-white text-brand-text placeholder:text-brand-text-muted focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-[#1B3A6D] transition-colors"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="md:hidden"
          aria-label="Mostrar filtros"
        >
          <SlidersHorizontal className="w-5 h-5" />
        </Button>
      </div>

      {/* Filters row */}
      <div
        className={`flex flex-col md:flex-row gap-4 ${
          showFilters ? "block" : "hidden md:flex"
        }`}
      >
        <div className="flex-1 md:max-w-xs">
          <Select
            options={categoryOptions}
            value={currentCategory}
            onChange={(e) => updateParams("category", e.target.value)}
            aria-label="Filtrar por categoría"
          />
        </div>

        <div className="flex-1 md:max-w-xs">
          <Select
            options={sortOptions}
            value={currentSort}
            onChange={(e) => updateParams("sort", e.target.value)}
            aria-label="Ordenar por"
          />
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={clearFilters}
            className="text-brand-text-muted hover:text-brand-text"
          >
            <X className="w-4 h-4 mr-1" />
            Limpiar filtros
          </Button>
        )}
      </div>

      {/* Active filters pills */}
      {(currentSearch || currentCategory) && (
        <div className="flex flex-wrap gap-2">
          {currentSearch && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-900/10 text-brand-primary rounded-full text-sm">
              Búsqueda: &quot;{currentSearch}&quot;
              <button
                onClick={() => updateParams("search", "")}
                className="ml-1 hover:bg-blue-900/20 rounded-full p-0.5"
                aria-label="Quitar filtro de búsqueda"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {currentCategory && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-900/10 text-brand-primary rounded-full text-sm">
              Categoría: {categories.find((c) => c.slug === currentCategory)?.name || currentCategory}
              <button
                onClick={() => updateParams("category", "")}
                className="ml-1 hover:bg-blue-900/20 rounded-full p-0.5"
                aria-label="Quitar filtro de categoría"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}


