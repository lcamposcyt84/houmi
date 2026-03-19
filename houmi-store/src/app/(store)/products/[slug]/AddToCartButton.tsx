"use client";

import { useState } from "react";
import { ShoppingCart, Plus, Minus, Check } from "lucide-react";
import { Button } from "@/components/ui";
import { useCartStore } from "@/store/cart";
import type { ProductWithPrices } from "@/types";

interface AddToCartButtonProps {
  product: ProductWithPrices;
  disabled?: boolean;
}

export function AddToCartButton({ product, disabled }: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem, openCart, getItemQuantity } = useCartStore();
  
  const currentInCart = getItemQuantity(product.id);
  const maxQuantity = product.stock - currentInCart;
  const canAdd = maxQuantity > 0 && !disabled;

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => {
      const newValue = prev + delta;
      if (newValue < 1) return 1;
      if (newValue > maxQuantity) return maxQuantity;
      return newValue;
    });
  };

  const handleAddToCart = () => {
    if (!canAdd) return;
    
    addItem(product, quantity);
    setAdded(true);
    
    setTimeout(() => {
      setAdded(false);
      openCart();
    }, 500);
    
    setQuantity(1);
  };

  if (disabled) {
    return (
      <Button
        variant="primary"
        size="lg"
        className="w-full"
        disabled
      >
        Producto agotado
      </Button>
    );
  }

  return (
    <div className="space-y-4">
      {/* Quantity selector */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-brand-text">Cantidad:</span>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleQuantityChange(-1)}
            disabled={quantity <= 1}
            className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Reducir cantidad"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-12 text-center text-lg font-semibold">
            {quantity}
          </span>
          <button
            onClick={() => handleQuantityChange(1)}
            disabled={quantity >= maxQuantity}
            className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Aumentar cantidad"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        {currentInCart > 0 && (
          <span className="text-sm text-brand-text-muted">
            ({currentInCart} en carrito)
          </span>
        )}
      </div>

      {/* Add to cart button */}
      <Button
        variant="accent"
        size="lg"
        className="w-full"
        onClick={handleAddToCart}
        disabled={!canAdd}
        leftIcon={
          added ? (
            <Check className="w-5 h-5" />
          ) : (
            <ShoppingCart className="w-5 h-5" />
          )
        }
      >
        {added ? "¡Agregado!" : "Agregar al carrito"}
      </Button>

      {maxQuantity <= 0 && currentInCart > 0 && (
        <p className="text-sm text-orange-600 text-center">
          Ya tienes el máximo disponible en tu carrito
        </p>
      )}
    </div>
  );
}


