
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CartItem, ProductWithPrices } from "@/types";

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  
  // Actions
  addItem: (product: ProductWithPrices, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  
  // Computed
  getTotalItems: () => number;
  getTotalUsd: () => number;
  getTotalVes: () => number;
  getItemQuantity: (productId: string) => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product: ProductWithPrices, quantity = 1) => {
        const { items } = get();
        const existingItem = items.find((item) => item.productId === product.id);

        if (existingItem) {
          // Check stock limit
          const newQuantity = existingItem.quantity + quantity;
          const maxStock = product.stock;
          
          set({
            items: items.map((item) =>
              item.productId === product.id
                ? { ...item, quantity: Math.min(newQuantity, maxStock), product }
                : item
            ),
          });
        } else {
          // Add new item
          set({
            items: [
              ...items,
              {
                productId: product.id,
                product,
                quantity: Math.min(quantity, product.stock),
              },
            ],
          });
        }
      },

      removeItem: (productId: string) => {
        set({
          items: get().items.filter((item) => item.productId !== productId),
        });
      },

      updateQuantity: (productId: string, quantity: number) => {
        const { items } = get();
        
        if (quantity <= 0) {
          set({
            items: items.filter((item) => item.productId !== productId),
          });
          return;
        }

        set({
          items: items.map((item) => {
            if (item.productId !== productId) return item;
            
            // Respect stock limit
            const maxStock = item.product.stock;
            return {
              ...item,
              quantity: Math.min(quantity, maxStock),
            };
          }),
        });
      },

      clearCart: () => {
        set({ items: [] });
      },

      toggleCart: () => {
        set({ isOpen: !get().isOpen });
      },

      openCart: () => {
        set({ isOpen: true });
      },

      closeCart: () => {
        set({ isOpen: false });
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalUsd: () => {
        return get().items.reduce(
          (total, item) => total + (item.product?.priceDisplay?.usdRaw || 0) * item.quantity,
          0
        );
      },

      getTotalVes: () => {
        return get().items.reduce(
          (total, item) => total + (item.product?.priceDisplay?.vesRaw || 0) * item.quantity,
          0
        );
      },

      getItemQuantity: (productId: string) => {
        const item = get().items.find((item) => item.productId === productId);
        return item?.quantity || 0;
      },
    }),
    {
      name: "houmi-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    }
  )
);





