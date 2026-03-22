import { useState, useEffect, Suspense } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ProductGrid, ProductFilters } from "@/components/products";
import type { ProductWithPrices, Category } from "@/types";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { phpFetch } from "@/lib/php-client";

function ProductsLoading() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-square bg-gray-200 rounded-xl mb-4" />
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
          <div className="h-5 bg-gray-200 rounded w-2/3 mb-2" />
          <div className="h-6 bg-gray-200 rounded w-1/2" />
        </div>
      ))}
    </div>
  );
}

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  searchParams: {
    search?: string;
    category?: string;
    sort?: string;
  };
}

function Pagination({ currentPage, totalItems, itemsPerPage, searchParams }: PaginationProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const buildUrl = (page: number) => {
    const params = new URLSearchParams();
    if (searchParams.search) params.set("search", searchParams.search);
    if (searchParams.category) params.set("category", searchParams.category);
    if (searchParams.sort) params.set("sort", searchParams.sort);
    params.set("page", page.toString());
    return `/products?${params.toString()}`;
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const showPages = 5;
    if (totalPages <= showPages + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="mt-12 flex flex-col items-center gap-4">
      <p className="text-brand-text-muted text-sm">
        Mostrando {startItem}-{endItem} de {totalItems} productos
      </p>
      <nav className="flex items-center gap-1" aria-label="Paginación">
        {currentPage > 1 ? (
          <Link
            to={buildUrl(currentPage - 1)}
            className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-brand-primary text-brand-text-muted hover:text-brand-primary transition-colors"
            aria-label="Página anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
        ) : (
          <span className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-100 text-gray-300 cursor-not-allowed">
            <ChevronLeft className="w-5 h-5" />
          </span>
        )}

        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, index) => {
            if (page === "...") {
              return (
                <span key={`ellipsis-${index}`} className="w-10 h-10 flex items-center justify-center text-brand-text-muted">
                  ...
                </span>
              );
            }
            const pageNum = page as number;
            const isActive = pageNum === currentPage;
            return (
              <Link
                key={pageNum}
                to={buildUrl(pageNum)}
                className={`flex items-center justify-center w-10 h-10 rounded-lg font-medium transition-colors ${
                  isActive
                    ? "bg-brand-primary text-white"
                    : "border border-gray-200 hover:bg-gray-50 hover:border-brand-primary text-brand-text hover:text-brand-primary"
                }`}
                aria-label={`Página ${pageNum}`}
                aria-current={isActive ? "page" : undefined}
              >
                {pageNum}
              </Link>
            );
          })}
        </div>

        {currentPage < totalPages ? (
          <Link
            to={buildUrl(currentPage + 1)}
            className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-brand-primary text-brand-text-muted hover:text-brand-primary transition-colors"
            aria-label="Página siguiente"
          >
            <ChevronRight className="w-5 h-5" />
          </Link>
        ) : (
          <span className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-100 text-gray-300 cursor-not-allowed">
            <ChevronRight className="w-5 h-5" />
          </span>
        )}
      </nav>
    </div>
  );
}

export default function ProductsPage() {
  const [searchParams] = useSearchParams();
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "newest";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = 24;

  const [products, setProducts] = useState<ProductWithPrices[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    if (sort) params.set("sort", sort);
    params.set("page", page.toString());
    params.set("limit", limit.toString());

    Promise.all([
      phpFetch(`get_products.php?${params.toString()}`).then(r => r.json()),
      phpFetch("get_categories.php").then(r => r.json()),
    ])
      .then(([productsRes, categoriesRes]) => {
        setProducts(productsRes.products || []);
        setTotal(productsRes.total || 0);
        setCategories(categoriesRes.categories || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [search, category, sort, page]);

  const currentCategory = category
    ? categories.find((c) => c.slug === category)
    : null;

  return (
    <div className="section">
      <div className="container-custom">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-brand-text font-display">
            {currentCategory ? currentCategory.name : "Todos los productos"}
          </h1>
          <p className="mt-2 text-brand-text-muted">
            {total} {total === 1 ? "producto encontrado" : "productos encontrados"}
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <ProductFilters categories={categories} />
        </div>

        {/* Products grid */}
        {loading ? (
          <ProductsLoading />
        ) : (
          <ProductGrid
            products={products}
            emptyMessage={
              search
                ? `No se encontraron productos para "${search}"`
                : "No hay productos disponibles en esta categoría"
            }
          />
        )}

        {/* Pagination */}
        {total > limit && (
          <Pagination
            currentPage={page}
            totalItems={total}
            itemsPerPage={limit}
            searchParams={{ search, category, sort }}
          />
        )}
      </div>
    </div>
  );
}
