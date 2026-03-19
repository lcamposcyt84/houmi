"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, ArrowLeft, Trash2, ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/cart";

interface RawProduct {
  id: string;
  name: string;
  slug: string;
  code: string;
  images: string; // JSON string
  category: { id: string; name: string; slug: string };
  inventory: { stock: number } | null;
  pricing: { priceUsd: number; priceVes: number | null; manualVes: boolean } | null;
}

interface WishlistItem {
  id: string;
  product: RawProduct;
}

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [exchangeRate, setExchangeRate] = useState(40); // fallback
  const { addItem } = useCartStore();

  useEffect(() => {
    // Fetch exchange rate for price calculations
    fetch("/api/settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((s) => { if (s?.exchangeRateUsdToVes) setExchangeRate(s.exchangeRateUsdToVes); })
      .catch(() => {});

    fetch("/api/v1/wishlist")
      .then((r) => r.json())
      .then((data) => { if (data.items) setItems(data.items); })
      .finally(() => setLoading(false));
  }, []);

  const removeItem = async (productId: string) => {
    await fetch("/api/v1/wishlist", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    });
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const moveToCart = (item: WishlistItem) => {
    const p = item.product;
    const priceUsd = p.pricing?.priceUsd ?? 0;
    const priceVes = p.pricing?.manualVes
      ? (p.pricing?.priceVes ?? priceUsd * exchangeRate)
      : priceUsd * exchangeRate;

    // Build a ProductWithPrices-compatible object the cart store can handle
    const cartProduct = {
      ...p,
      images: (() => { try { return JSON.parse(p.images); } catch { return []; } })(),
      stock: p.inventory?.stock ?? 0,
      stockStatus: { label: "En stock", variant: "success" as const },
      priceDisplay: {
        usd: `$${priceUsd.toFixed(2)}`,
        ves: `Bs ${priceVes.toFixed(2)}`,
        usdRaw: priceUsd,
        vesRaw: priceVes,
      },
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    addItem(cartProduct as any);
    removeItem(p.id);
  };

  return (
    <div className="container-custom py-12 max-w-5xl">
      <div className="mb-10 text-center md:text-left">
        <Link 
          href="/account" 
          className="inline-flex items-center gap-2 text-sm font-medium text-brand-text-muted hover:text-brand-primary transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Mi Espacio
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-brand-text font-display mb-2">Lista de Deseos</h1>
            <p className="text-brand-text-muted">Tus productos favoritos guardados para más tarde.</p>
          </div>
          {!loading && items.length > 0 && (
            <div className="px-4 py-2 bg-red-50 text-red-500 font-semibold rounded-2xl border border-red-100">
              {items.length} producto{items.length !== 1 ? 's' : ''} guardado{items.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 bg-white/50 rounded-[2.5rem] border border-gray-100">
          <div className="w-12 h-12 border-4 border-red-500/20 border-t-red-500 rounded-full animate-spin mb-4" />
          <p className="text-brand-text-muted font-medium animate-pulse">Cargando tus favoritos...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="relative overflow-hidden bg-white border border-gray-100 shadow-sm rounded-[2.5rem] p-12 lg:p-20 text-center group">
          {/* Decorative blurs for empty state */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-red-500/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-red-500/10 transition-colors duration-700" />
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-24 h-24 bg-red-50/80 backdrop-blur-sm border border-red-100 rounded-[2rem] flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform duration-500">
              <Heart className="w-10 h-10 text-red-400 group-hover:text-red-500 transition-colors duration-500 fill-red-100 group-hover:fill-red-200" />
            </div>
            <h2 className="text-2xl font-bold font-display text-brand-text mb-3">Tu lista de deseos está vacía</h2>
            <p className="text-brand-text-muted mb-8 max-w-md mx-auto text-lg leading-relaxed">
              Descubre productos increíbles en nuestro catálogo y dales ❤️ para guardarlos aquí.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center justify-center px-8 py-4 bg-red-500 text-white font-semibold rounded-[1.5rem] hover:bg-red-600 hover:-translate-y-1 hover:shadow-xl hover:shadow-red-500/20 transition-all duration-300"
            >
              Explorar el catálogo
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => {
            // Safely parse image url handling stringified JSON from the API
            let safeImgUrl = "/placeholder.svg";
            try {
              if (Array.isArray(item.product.images)) {
                safeImgUrl = item.product.images[0] || "/placeholder.svg";
              } else if (typeof item.product.images === "string") {
                const parsed = JSON.parse(item.product.images);
                safeImgUrl = Array.isArray(parsed) ? (parsed[0] || "/placeholder.svg") : "/placeholder.svg";
              }
            } catch {
              // fallback to placeholder if parse fails
            }

            return (
              <div 
                key={item.id} 
                className="group relative flex flex-col bg-white border border-gray-100 rounded-[2rem] overflow-hidden hover:shadow-xl hover:shadow-red-500/5 hover:border-red-100 transition-all duration-300"
              >
                {/* Image Section */}
                <div className="relative w-full aspect-[4/3] bg-gray-50 overflow-hidden">
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 z-10" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={safeImgUrl} 
                    alt={item.product.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                  />
                  
                  {/* Remove Button Overlay */}
                  <button
                    onClick={() => removeItem(item.product.id)}
                    className="absolute top-4 right-4 z-20 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-y-2 group-hover:translate-y-0"
                    title="Eliminar de favoritos"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                {/* Content Section */}
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex-1">
                    <span className="text-xs font-bold text-brand-primary uppercase tracking-wider mb-2 block">
                      {item.product.category?.name || "Categoría"}
                    </span>
                    <Link href={`/products/${item.product.slug}`} className="block group/link">
                      <h3 className="font-bold text-brand-text text-lg leading-tight mb-2 line-clamp-2 group-hover/link:text-brand-primary transition-colors">
                        {item.product.name}
                      </h3>
                    </Link>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between gap-4">
                    <p className="text-2xl font-black font-display text-brand-text">
                      ${(item.product.pricing?.priceUsd ?? 0).toFixed(2)}
                    </p>
                    <button
                      onClick={() => moveToCart(item)}
                      className="flex items-center justify-center gap-2 py-3 px-5 bg-black text-white text-sm font-semibold rounded-2xl hover:bg-brand-primary hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Añadir
                    </button>
                  </div>
                </div>

                {/* Decorative border highlight on hover */}
                <div className="absolute inset-x-0 bottom-0 h-1 bg-red-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
