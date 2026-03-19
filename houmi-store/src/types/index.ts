// Product types
export interface Product {
  id: string;
  code: string;
  name: string;
  slug: string;
  description: string | null;
  images: string[];
  isActive: boolean;
  categoryId: string;
  category: Category;
  inventory: Inventory | null;
  pricing: Pricing | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Inventory {
  id: string;
  productId: string;
  stock: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Pricing {
  id: string;
  productId: string;
  priceUsd: number;
  priceVes: number | null;
  manualVes: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Settings {
  id: string;
  exchangeRateUsdToVes: number;
  storeName: string;
  storeDescription: string | null;
  whatsappNumber: string | null;
  mercantilApiUrl: string | null;
  mercantilApiPath: string | null;
  mercantilApiKey: string | null;
  mercantilApiSecret: string | null;
  mercantilMasterKey: string | null;
  mercantilIdComercio: string | null;
  mercantilWebhookUrl: string | null;
  updatedAt: Date;
}

// API response types
export interface ProductWithPrices extends Product {
  priceDisplay: {
    usd: string;
    ves: string;
    usdRaw: number;
    vesRaw: number;
  };
  stock: number;
  stockStatus: {
    label: string;
    variant: "success" | "warning" | "error";
  };
}

export interface ProductsResponse {
  products: ProductWithPrices[];
  categories: Category[];
  settings: Settings;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Cart types
export interface CartItem {
  productId: string;
  product: ProductWithPrices;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  totalItems: number;
  totalUsd: number;
  totalVes: number;
}

// Checkout types
export interface CheckoutFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  notes?: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  shippingCity: string;
  notes: string | null;
  items: CartItem[];
  totalUsd: number;
  totalVes: number;
  exchangeRate: number;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  createdAt: Date;
}

// Admin types
export interface BulkPriceUpdate {
  productIds?: string[];
  categoryId?: string;
  percentage: number;
}

export interface BulkPricePreview {
  productId: string;
  productName: string;
  currentPrice: number;
  newPrice: number;
  difference: number;
}

// Filter types
export interface ProductFilters {
  search?: string;
  categoryId?: string;
  sortBy?: "newest" | "price_asc" | "price_desc" | "name";
  page?: number;
  limit?: number;
}

// Catalog import types (from import script)
export interface CatalogProduct {
  categoria: string;
  categoriaSlug: string;
  codigo: string;
  nombre: string;
  slug: string;
  rutaImagenPrincipal: string;
  rutasImagenes: string[];
}

export interface CatalogData {
  generatedAt: string;
  categories: string[];
  products: CatalogProduct[];
}





