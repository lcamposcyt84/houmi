import type { ProductWithPrices, Category, Settings, Order } from "@/types";
import { getPhpApiBaseUrl } from "@/lib/php-api-base-url";

const API_URL = getPhpApiBaseUrl();

export async function fetchProducts(options?: { category?: string; limit?: number; search?: string; sort?: string; page?: number; slug?: string }) {
  const params = new URLSearchParams();
  if (options?.category) params.append("category", options.category);
  if (options?.limit) params.append("limit", options.limit.toString());
  if (options?.search) params.append("search", options.search);
  if (options?.sort) params.append("sort", options.sort);
  if (options?.page) params.append("page", options.page.toString());
  if ((options as any)?.slug) params.append("slug", (options as any).slug);

  const url = `${API_URL}/get_products.php?${params.toString()}`;
  const res = await fetch(url, { cache: "no-store" });   // single cache directive

  if (!res.ok) throw new Error(`Failed to fetch products: ${res.status} ${url}`);
  return res.json() as Promise<{ products: ProductWithPrices[], exchangeRate: number, total: number }>;
}

export async function fetchCategories() {
  const res = await fetch(`${API_URL}/get_categories.php`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch categories: ${res.status}`);
  return res.json() as Promise<{ categories: Category[] }>;
}

export async function fetchSettings() {
  const res = await fetch(`${API_URL}/admin/settings/get.php`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch settings");
  return res.json() as Promise<{ settings: Settings }>;
}

export async function fetchProductBySlug(slug: string) {
  const { products, exchangeRate } = await fetchProducts({ slug, limit: 1 } as any);
  if (!products || products.length === 0) return null;
  return { product: products[0], exchangeRate };
}
