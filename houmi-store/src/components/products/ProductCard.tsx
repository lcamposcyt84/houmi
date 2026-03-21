"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Eye, Heart } from "lucide-react";
import { Badge, Button } from "@/components/ui";
import { useCartStore } from "@/store/cart";
import type { ProductWithPrices } from "@/types";
import { cn } from "@/lib/utils";
import { phpFetch } from "@/lib/php-client";

interface ProductCardProps {
  product: ProductWithPrices;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { addItem, openCart, getItemQuantity } = useCartStore();
  const quantityInCart = getItemQuantity(product.id);
  const isOutOfStock = product.stock === 0;
  const canAddMore = quantityInCart < product.stock;

  // Wishlist state
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user is logged in and if product is in wishlist
    phpFetch("auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.customer) {
          setIsLoggedIn(true);
          // Check wishlist status
          return phpFetch("wishlist/get");
        }
        return null;
      })
      .then((r) => (r?.ok ? r.json() : null))
      .then((data) => {
        if (data?.items) {
          setIsWishlisted(
            data.items.some((item: { product: { id: string } }) => item.product.id === product.id)
          );
        }
      })
      .catch(() => {});
  }, [product.id]);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isOutOfStock && canAddMore) {
      addItem(product);
      openCart();
    }
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      window.location.href = "/login?redirect=" + encodeURIComponent(window.location.pathname);
      return;
    }

    setWishlistLoading(true);
    const optimisticState = !isWishlisted;
    setIsWishlisted(optimisticState); // Optimistic update

    try {
      if (optimisticState) {
        await phpFetch("wishlist/add", {
          method: "POST",
          body: JSON.stringify({ productId: product.id }),
        });
      } else {
        await phpFetch("wishlist/remove", {
          method: "DELETE",
          body: JSON.stringify({ productId: product.id }),
        });
      }
    } catch {
      setIsWishlisted(!optimisticState); // Revert on error
    } finally {
      setWishlistLoading(false);
    }
  };

  return (
    <Link
      href={`/products/${product.slug}`}
      className={cn(
        "group block bg-white rounded-xl border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-blue-900/20",
        className
      )}
    >
      {/* Image container */}
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        <Image
          src={product.images[0] || "/placeholder.svg"}
          alt={product.name}
          fill
          className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />

        {/* Stock badge */}
        <div className="absolute top-3 left-3">
          <Badge variant={product.stockStatus.variant}>
            {product.stockStatus.label}
          </Badge>
        </div>

        {/* Wishlist button — always visible on mobile, visible on hover on desktop */}
        <button
          onClick={handleWishlist}
          disabled={wishlistLoading}
          className={cn(
            "absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full shadow-md transition-all duration-200 z-10",
            "md:opacity-0 md:group-hover:opacity-100",
            isWishlisted
              ? "bg-red-500 text-white"
              : "bg-white text-gray-400 hover:text-red-500"
          )}
          aria-label={isWishlisted ? "Quitar de favoritos" : "Agregar a favoritos"}
        >
          <Heart
            className={cn("w-4 h-4 transition-transform", isWishlisted && "fill-current")}
          />
        </button>

        {/* Quick actions overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100">
          <div className="flex gap-2">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || !canAddMore}
              className={cn(
                "w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-md transition-transform duration-200",
                isOutOfStock || !canAddMore
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:scale-110 hover:bg-brand-accent"
              )}
              aria-label="Agregar al carrito"
            >
              <ShoppingCart className="w-5 h-5 text-brand-primary" />
            </button>
            <span
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-md hover:scale-110 hover:bg-brand-primary hover:text-white transition-all duration-200"
              aria-label="Ver producto"
            >
              <Eye className="w-5 h-5" />
            </span>
          </div>
        </div>

        {/* Quantity in cart indicator */}
        {quantityInCart > 0 && (
          <div className="absolute bottom-3 right-3 w-6 h-6 flex items-center justify-center bg-brand-accent text-brand-primary text-xs font-bold rounded-full">
            {quantityInCart}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Category */}
        <p className="text-xs text-brand-text-muted uppercase tracking-wide mb-1">
          {product.category?.name}
        </p>

        {/* Name */}
        <h3 className="font-medium text-brand-text line-clamp-2 mb-2 group-hover:text-brand-primary transition-colors">
          {product.name}
        </h3>

        {/* Prices */}
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-brand-primary">
            {product.priceDisplay.usd}
          </span>
          <span className="text-sm text-brand-text-muted">
            {product.priceDisplay.ves}
          </span>
        </div>

        {/* Add to cart button (mobile) */}
        <div className="mt-3 md:hidden">
          <Button
            variant="accent"
            size="sm"
            className="w-full"
            onClick={handleAddToCart}
            disabled={isOutOfStock || !canAddMore}
            leftIcon={<ShoppingCart className="w-4 h-4" />}
          >
            {isOutOfStock ? "Agotado" : "Agregar"}
          </Button>
        </div>
      </div>
    </Link>
  );
}
