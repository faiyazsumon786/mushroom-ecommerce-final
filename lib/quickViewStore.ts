// src/lib/quickViewStore.ts
import { create } from 'zustand';
import { Product } from '@prisma/client';

interface QuickViewState {
  isOpen: boolean;
  product: Product | null;
  onOpen: (product: Product) => void;
  onClose: () => void;
}

export const useQuickViewStore = create<QuickViewState>((set) => ({
  isOpen: false,
  product: null,
  onOpen: (product) => set({ isOpen: true, product }),
  onClose: () => set({ isOpen: false, product: null }),
}));