import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@prisma/client';

export type CartItem = Product & { quantity: number };

type CartStore = {
  items: CartItem[];
  addToCart: (product: Product, quantityToAdd?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
};

export const useWholesaleCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      // addToCart ফাংশনটিকে এখন আরও শক্তিশালী করা হয়েছে
      addToCart: (product, quantityToAdd = 1) => {
        const items = get().items;
        const existingItem = items.find((item) => item.id === product.id);

        if (existingItem) {
          // যদি আইটেমটি আগে থেকেই থাকে, তাহলে শুধু quantity বাড়ানো হচ্ছে
          const updatedItems = items.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + quantityToAdd }
              : item
          );
          set({ items: updatedItems });
        } else {
          // যদি আইটেমটি নতুন হয়, তাহলে এটিকে quantity সহ যোগ করা হচ্ছে
          set({ items: [...items, { ...product, quantity: quantityToAdd }] });
        }
      },
      removeFromCart: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== productId),
        }));
      },
      updateQuantity: (productId, quantity) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === productId ? { ...item, quantity: quantity } : item
          ),
        }));
      },
      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'wholesale-cart-storage',
    }
  )
);