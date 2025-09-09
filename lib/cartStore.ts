// src/lib/cartStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Product } from '@prisma/client';

// কার্টে থাকা প্রতিটি আইটেমের টাইপ ডিফাইন করা হচ্ছে
export interface CartItem extends Product {
  quantity: number;
}

// স্টোরের স্টেট (state) এবং অ্যাকশন (actions) এর টাইপ ডিফাইন করা হচ্ছে
interface CartState {
  items: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  // `persist` ব্যবহার করে কার্টের ডেটা localStorage-এ সেভ করা হচ্ছে
  persist(
    (set, get) => ({
      items: [], // শুরুতে কার্ট খালি থাকবে

      // কার্টে প্রোডাক্ট যোগ করার ফাংশন
      addToCart: (product) => {
        const currentItems = get().items;
        const existingItem = currentItems.find((item) => item.id === product.id);

        if (existingItem) {
          // যদি প্রোডাক্টটি আগে থেকেই কার্টে থাকে, তাহলে শুধু তার পরিমাণ (quantity) বাড়ানো হবে
          const updatedItems = currentItems.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
          set({ items: updatedItems });
        } else {
          // যদি প্রোডাক্টটি নতুন হয়, তাহলে সেটিকে পরিমাণ ১ সহ কার্টে যোগ করা হবে
          set((state) => ({
            items: [...state.items, { ...product, quantity: 1 }],
          }));
        }
      },

      // কার্ট থেকে প্রোডাক্ট মুছে ফেলার ফাংশন
      removeFromCart: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== productId),
        }));
      },

      // নির্দিষ্ট প্রোডাক্টের পরিমাণ আপডেট করার ফাংশন
      updateQuantity: (productId, quantity) => {
        if (quantity < 1) {
          // পরিমাণ ১ এর কম হলে, প্রোডাক্টটি কার্ট থেকে মুছে যাবে
          get().removeFromCart(productId);
        } else {
          set((state) => ({
            items: state.items.map((item) =>
              item.id === productId ? { ...item, quantity } : item
            ),
          }));
        }
      },

      // সম্পূর্ণ কার্ট খালি করার ফাংশন
      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'mushroom-cart-storage', // localStorage-এ এই নামে ডেটা সেভ থাকবে
      storage: createJSONStorage(() => localStorage),
    }
  )
);