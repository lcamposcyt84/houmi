import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Eye, Heart } from "lucide-react";
import { Badge, Button } from "@/components/ui";
import { useCartStore } from "@/store/cart";
import { useAuth } from "@/contexts/AuthContext";
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

  const { isLoggedIn } = useAuth();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      setIsWishlisted(false);
      return;
    }
    phpFetch("wishlist/get")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.items) {
          setIsWishlisted(
            data.items.some((item: { product: { id: string } }) => item.product.id === product.id)
          );
        }
      })
      .catch(() => {});
  }, [product.id, isLoggedIn]);

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
    <div
      className={cn(
        "group flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-blue-900/20 relative",
        className
      )}
    >
      {/* Enlace invisible superpuesto para hacer que toda la tarjeta sea clickeable sin dañar el HTML */}
      <Link to={`/products/${product.slug}`} className="absolute inset-0 z-0" aria-label={product.name} />

      {/* Image container */}
      <div className="relative aspect-square bg-gray-50 overflow-hidden pointer-events-none">
        <img
          src={product.images[0] || "/placeholder.svg"}
          alt={product.name}
          className="w-full h-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />

        {/* Stock badge */}
        <div className="absolute top-3 left-3 z-10 pointer-events-none">
          <Badge variant={product.stockStatus.variant}>
            {product.stockStatus.label}
          </Badge>
        </div>

        {/* Wishlist button — always visible on mobile, visible on hover on desktop */}
        <button
          onClick={handleWishlist}
          disabled={wishlistLoading}
          className={cn(
            "absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full shadow-md transition-all duration-200 z-20 cursor-pointer",
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
        <div className="absolute inset-0 pointer-events-none bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100 z-10">
          <div className="flex gap-2 pointer-events-auto">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || !canAddMore}
              className={cn(
                "w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-md transition-transform duration-200 cursor-pointer",
                isOutOfStock || !canAddMore
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:scale-110 hover:bg-brand-accent"
              )}
              aria-label="Agregar al carrito"
            >
              <ShoppingCart className="w-5 h-5 text-brand-primary" />
            </button>
            <Link
              to={`/products/${product.slug}`}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-md hover:scale-110 hover:bg-brand-primary hover:text-white transition-all duration-200 cursor-pointer"
              aria-label="Ver producto"
            >
              <Eye className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Quantity in cart indicator */}
        {quantityInCart > 0 && (
          <div className="absolute bottom-3 right-3 w-6 h-6 flex items-center justify-center bg-brand-accent text-brand-primary text-xs font-bold rounded-full z-10 pointer-events-none">
            {quantityInCart}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col pointer-events-none">
        {/* Category */}
        <p className="text-xs text-brand-text-muted uppercase tracking-wide mb-1">
          {product.category?.name}
        </p>

        {/* Name */}
        <h3 className="font-medium text-brand-text line-clamp-2 mb-2 group-hover:text-brand-primary transition-colors flex-1 relative z-10">
          {product.name}
        </h3>

        {/* Prices */}
        <div className="flex items-baseline gap-2 relative z-10">
          <span className="text-lg font-bold text-brand-primary">
            {product.priceDisplay.usd}
          </span>
          <span className="text-sm text-brand-text-muted">
            {product.priceDisplay.ves}
          </span>
        </div>

        {/* Add to cart button (mobile) */}
        <div className="mt-3 md:hidden relative z-20 pointer-events-auto">
          <Button
            variant="accent"
            size="sm"
            className="w-full cursor-pointer"
            onClick={handleAddToCart}
            disabled={isOutOfStock || !canAddMore}
            leftIcon={<ShoppingCart className="w-4 h-4" />}
          >
            {isOutOfStock ? "Agotado" : "Agregar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
