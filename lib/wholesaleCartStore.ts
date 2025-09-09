// src/lib/wholesaleCartStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Product } from '@prisma/client';

export interface CartItem extends Product {
  quantity: number;
}

interface WholesaleCartState {
  items: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

export const useWholesaleCartStore = create<WholesaleCartState>()(
  persist(
    (set, get) => ({
      items: [],

      addToCart: (product) => {
        const currentItems = get().items;
        const existingItem = currentItems.find((item) => item.id === product.id);

        if (existingItem) {
          const updatedItems = currentItems.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
          set({ items: updatedItems });
        } else {
          set((state) => ({
            items: [...state.items, { ...product, quantity: 1 }],
          }));
        }
      },

      removeFromCart: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== productId),
        }));
      },

      updateQuantity: (productId, quantity) => {
        if (quantity < 1) {
          get().removeFromCart(productId);
        } else {
          set((state) => ({
            items: state.items.map((item) =>
              item.id === productId ? { ...item, quantity } : item
            ),
          }));
        }
      },

      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'mushroom-wholesale-cart', // Use a different name for storage
      storage: createJSONStorage(() => localStorage),
    }
  )
);