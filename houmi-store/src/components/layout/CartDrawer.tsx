"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import { formatUSD, formatBs } from "@/lib/currency";

export function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    getTotalUsd,
    getTotalVes,
    getTotalItems,
  } = useCartStore();
  
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent body scroll when cart is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!mounted) return null;

  const totalItems = getTotalItems();
  const totalUsd = getTotalUsd();
  const totalVes = getTotalVes();

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 z-50 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-xl z-50 transform transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Carrito de compras"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-brand-text flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              Carrito ({totalItems})
            </h2>
            <button
              onClick={closeCart}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Cerrar carrito"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto p-6">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <ShoppingBag className="w-16 h-16 text-brand-text-muted mb-4" />
                <p className="text-brand-text-muted mb-4">
                  Tu carrito está vacío
                </p>
                <Button onClick={closeCart} variant="outline">
                  Continuar comprando
                </Button>
              </div>
            ) : (
              <ul className="space-y-4">
                {items.map((item) => (
                  <li
                    key={item.productId}
                    className="flex gap-4 p-3 rounded-lg bg-gray-50"
                  >
                    {/* Image */}
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-white shrink-0">
                      <Image
                        src={
                          Array.isArray(item.product.images) 
                            ? (item.product.images[0] || "/placeholder.svg")
                            : (typeof item.product.images === "string" 
                                ? (() => { try { return JSON.parse(item.product.images)[0] || "/placeholder.svg" } catch { return "/placeholder.svg" } })()
                                : "/placeholder.svg")
                        }
                        alt={item.product.name}
                        fill
                        className="object-contain"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-brand-text truncate">
                        {item.product.name}
                      </h3>
                      <p className="text-sm text-brand-text-muted mb-2">
                        {item.product.category?.name}
                      </p>
                      
                      {/* Price */}
                      <div className="flex items-baseline gap-2">
                        <span className="font-semibold text-brand-primary">
                          {item.product.priceDisplay?.usd || "$0.00"}
                        </span>
                        <span className="text-xs text-brand-text-muted">
                          {item.product.priceDisplay?.ves || "Bs 0.00"}
                        </span>
                      </div>

                      {/* Quantity controls */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              updateQuantity(item.productId, item.quantity - 1)
                            }
                            className="w-7 h-7 flex items-center justify-center rounded-full border border-gray-200 hover:bg-gray-100 transition-colors"
                            aria-label="Reducir cantidad"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.productId, item.quantity + 1)
                            }
                            disabled={item.quantity >= item.product.stock}
                            className="w-7 h-7 flex items-center justify-center rounded-full border border-gray-200 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Aumentar cantidad"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.productId)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                          aria-label="Eliminar del carrito"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-gray-200 p-6 space-y-4">
              {/* Totals */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-brand-text-muted">Subtotal</span>
                  <div className="text-right">
                    <p className="font-semibold text-brand-primary">
                      {formatUSD(totalUsd)}
                    </p>
                    <p className="text-sm text-brand-text-muted">
                      {formatBs(totalVes)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <Link href="/checkout" onClick={closeCart} className="block">
                  <Button variant="accent" className="w-full" size="lg">
                    Finalizar compra
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={closeCart}
                >
                  Continuar comprando
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

