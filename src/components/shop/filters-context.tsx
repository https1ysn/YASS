"use client";

import * as React from "react";
import type { Collection } from "@/types/product";

/**
 * Filter state shared by the toolbar, filter panels and active-filter chips.
 * Category selections actually filter the product grid (see ProductBrowser);
 * color/size/availability/price remain UI-only refinements.
 */

export type FilterGroupKey = "categories" | "colors" | "sizes" | "availability";

export interface FiltersState {
  categories: string[];
  colors: string[];
  sizes: string[];
  availability: string[];
  priceMin: string;
  priceMax: string;
  sort: string;
}

const initialState: FiltersState = {
  categories: [],
  colors: [],
  sizes: [],
  availability: [],
  priceMin: "",
  priceMax: "",
  sort: "featured",
};

interface FiltersContextValue {
  state: FiltersState;
  toggle: (group: FilterGroupKey, value: string) => void;
  setPrice: (min: string, max: string) => void;
  clearPrice: () => void;
  setSort: (sort: string) => void;
  clearAll: () => void;
  /** Number of active refinements (price counts as one). */
  activeCount: number;
  /** Live categories from Supabase, for the category filter and its chip labels. */
  categories: Collection[];
}

const FiltersContext = React.createContext<FiltersContextValue | null>(null);

export function FiltersProvider({
  categories,
  children,
}: {
  categories: Collection[];
  children: React.ReactNode;
}) {
  const [state, setState] = React.useState<FiltersState>(initialState);

  const toggle = React.useCallback((group: FilterGroupKey, value: string) => {
    setState((prev) => ({
      ...prev,
      [group]: prev[group].includes(value)
        ? prev[group].filter((v) => v !== value)
        : [...prev[group], value],
    }));
  }, []);

  const setPrice = React.useCallback((min: string, max: string) => {
    setState((prev) => ({ ...prev, priceMin: min, priceMax: max }));
  }, []);

  const clearPrice = React.useCallback(() => {
    setState((prev) => ({ ...prev, priceMin: "", priceMax: "" }));
  }, []);

  const setSort = React.useCallback((sort: string) => {
    setState((prev) => ({ ...prev, sort }));
  }, []);

  const clearAll = React.useCallback(() => {
    setState((prev) => ({ ...initialState, sort: prev.sort }));
  }, []);

  const activeCount =
    state.categories.length +
    state.colors.length +
    state.sizes.length +
    state.availability.length +
    (state.priceMin || state.priceMax ? 1 : 0);

  const value = React.useMemo(
    () => ({ state, toggle, setPrice, clearPrice, setSort, clearAll, activeCount, categories }),
    [state, toggle, setPrice, clearPrice, setSort, clearAll, activeCount, categories]
  );

  return <FiltersContext.Provider value={value}>{children}</FiltersContext.Provider>;
}

export function useFilters() {
  const context = React.useContext(FiltersContext);
  if (!context) throw new Error("useFilters must be used within a FiltersProvider");
  return context;
}
