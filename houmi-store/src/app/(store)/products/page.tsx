import { Suspense } from "react";
import { Metadata } from "next";
import Link from "next/link";

import { calculatePriceDisplay } from "@/lib/currency";
import { getStockStatus } from "@/lib/utils";
import { ProductGrid, ProductFilters } from "@/components/products";
import type { ProductWithPrices, Category } from "@/types";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Productos",
  description: "Explora nuestro catálogo completo de productos. Bicicletas, electrónicos, electrodomésticos y más.",
};

interface ProductsPageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    sort?: string;
    page?: string;
  }>;
}

import { fetchProducts, fetchCategories } from "@/lib/php-api";

async function getProducts(params: {
  search?: string;
  category?: string;
  sort?: string;
  page?: string;
}): Promise<{
  products: ProductWithPrices[];
  categories: Category[];
  total: number;
}> {
  const search = params.search || "";
  const categorySlug = params.category || "";
  const sortBy = params.sort || "newest";
  const page = parseInt(params.page || "1", 10);
  const limit = 24;

  try {
    const [{ products: phpProducts, exchangeRate, total }, { categories }] = await Promise.all([
      fetchProducts({ search, category: categorySlug, sort: sortBy, page, limit }),
      fetchCategories()
    ]);

    const productsWithPrices: any[] = phpProducts.map((product) => {
      const images = Array.isArray(product.images) && product.images.length > 0 
        ? product.images 
        : ["/placeholder.svg"];

      return {
        ...product,
        images,
      };
    });

    return { products: productsWithPrices as ProductWithPrices[], categories, total: total || 0 };
  } catch (error) {
    console.error("Error fetching catalog products:", error);
    return { products: [], categories: [], total: 0 };
  }
}

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
    page?: string;
  };
}

function Pagination({ currentPage, totalItems, itemsPerPage, searchParams }: PaginationProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Build URL with search params
  const buildUrl = (page: number) => {
    const params = new URLSearchParams();
    if (searchParams.search) params.set("search", searchParams.search);
    if (searchParams.category) params.set("category", searchParams.category);
    if (searchParams.sort) params.set("sort", searchParams.sort);
    params.set("page", page.toString());
    return `/products?${params.toString()}`;
  };

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const showPages = 5; // Number of page buttons to show
    
    if (totalPages <= showPages + 2) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push("...");
      }
      
      // Show pages around current
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        pages.push("...");
      }
      
      // Always show last page
      pages.push(totalPages);
    }
    
    return pages;
  };

  return (
    <div className="mt-12 flex flex-col items-center gap-4">
      {/* Info text */}
      <p className="text-brand-text-muted text-sm">
        Mostrando {startItem}-{endItem} de {totalItems} productos
      </p>
      
      {/* Pagination controls */}
      <nav className="flex items-center gap-1" aria-label="Paginación">
        {/* Previous button */}
        {currentPage > 1 ? (
          <Link
            href={buildUrl(currentPage - 1)}
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

        {/* Page numbers */}
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
                href={buildUrl(pageNum)}
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

        {/* Next button */}
        {currentPage < totalPages ? (
          <Link
            href={buildUrl(currentPage + 1)}
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

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const { products, categories, total } = await getProducts(params);
  
  const currentCategory = params.category
    ? categories.find((c) => c.slug === params.category)
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
          <Suspense fallback={<div className="h-12 bg-gray-100 rounded-lg animate-pulse" />}>
            <ProductFilters categories={categories} />
          </Suspense>
        </div>

        {/* Products grid */}
        <Suspense fallback={<ProductsLoading />}>
          <ProductGrid
            products={products}
            emptyMessage={
              params.search
                ? `No se encontraron productos para "${params.search}"`
                : "No hay productos disponibles en esta categoría"
            }
          />
        </Suspense>

        {/* Pagination */}
        {total > 24 && (
          <Pagination 
            currentPage={parseInt(params.page || "1", 10)}
            totalItems={total}
            itemsPerPage={24}
            searchParams={params}
          />
        )}
      </div>
    </div>
  );
}





