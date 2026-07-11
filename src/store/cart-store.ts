"use client";

import * as React from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Product } from "@/types/product";
import type { CartLine } from "@/types/cart";

const MAX_QUANTITY = 9;

export interface AddLineOptions {
  size: string;
  color: string;
  quantity?: number;
}

interface CartState {
  lines: CartLine[];
  saved: CartLine[];
  /** True once the persisted cart has been read from localStorage. */
  hydrated: boolean;
  addLine: (product: Product, options: AddLineOptions) => void;
  setQuantity: (id: string, quantity: number) => void;
  removeLine: (id: string) => void;
  saveForLater: (id: string) => void;
  moveToBag: (id: string) => void;
  removeSaved: (id: string) => void;
  clearCart: () => void;
}

function lineId(product: Product, size: string, color: string) {
  return `${product.slug}--${size}--${color}`;
}

/**
 * Client cart, persisted to localStorage. Starts empty for new visitors; a
 * previously saved cart is rehydrated after mount. It is the single source of
 * truth for the cart page, mini cart and checkout.
 */
export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      saved: [],
      hydrated: false,

      addLine: (product, { size, color, quantity = 1 }) =>
        set((state) => {
          const id = lineId(product, size, color);
          const existing = state.lines.find((line) => line.id === id);
          if (existing) {
            return {
              lines: state.lines.map((line) =>
                line.id === id
                  ? { ...line, quantity: Math.min(MAX_QUANTITY, line.quantity + quantity) }
                  : line
              ),
            };
          }
          return { lines: [...state.lines, { id, product, size, color, quantity }] };
        }),

      setQuantity: (id, quantity) =>
        set((state) => ({
          lines: state.lines.map((line) =>
            line.id === id
              ? { ...line, quantity: Math.min(MAX_QUANTITY, Math.max(1, quantity)) }
              : line
          ),
        })),

      removeLine: (id) => set((state) => ({ lines: state.lines.filter((l) => l.id !== id) })),

      saveForLater: (id) =>
        set((state) => {
          const line = state.lines.find((l) => l.id === id);
          if (!line) return {};
          return {
            lines: state.lines.filter((l) => l.id !== id),
            saved: [line, ...state.saved],
          };
        }),

      moveToBag: (id) =>
        set((state) => {
          const line = state.saved.find((l) => l.id === id);
          if (!line) return {};
          return {
            saved: state.saved.filter((l) => l.id !== id),
            lines: [...state.lines, line],
          };
        }),

      removeSaved: (id) => set((state) => ({ saved: state.saved.filter((l) => l.id !== id) })),

      clearCart: () => set({ lines: [] }),
    }),
    {
      name: "yasso-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ lines: state.lines, saved: state.saved }),
      // Rehydrate manually after mount so SSR and the first client render
      // always match (both use the seeded demo bag).
      skipHydration: true,
      onRehydrateStorage: () => () => {
        useCartStore.setState({ hydrated: true });
      },
    }
  )
);

/** Rehydrates the persisted cart after mount. Safe to call from many components. */
export function useCartHydration() {
  const hydrated = useCartStore((state) => state.hydrated);
  React.useEffect(() => {
    void useCartStore.persist.rehydrate();
  }, []);
  return hydrated;
}
