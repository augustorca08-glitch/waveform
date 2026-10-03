"use client";

import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { getProduct, productImage, stockOf } from "@/content/products";

export type CartLine = {
  /** slug:color:size */
  key: string;
  slug: string;
  colorId: string;
  size: string;
  qty: number;
};

type CartState = {
  lines: CartLine[];
  open: boolean;
  /** Última línea eliminada, para "Deshacer" */
  lastRemoved: { line: CartLine; index: number } | null;
  /** Contador que cambia en cada add, para animar el ícono del bag */
  pulse: number;
  add: (slug: string, colorId: string, size: string, qty?: number) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  undoRemove: () => void;
  clear: () => void;
  setOpen: (open: boolean) => void;
};

export const MAX_QTY = 10;

function maxFor(slug: string, colorId: string, size: string) {
  const p = getProduct(slug);
  return p ? Math.min(MAX_QTY, stockOf(p, colorId, size)) : 0;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      open: false,
      lastRemoved: null,
      pulse: 0,
      add: (slug, colorId, size, qty = 1) => {
        const key = `${slug}:${colorId}:${size}`;
        const max = maxFor(slug, colorId, size);
        if (max <= 0) return;
        const lines = [...get().lines];
        const existing = lines.find((l) => l.key === key);
        if (existing) existing.qty = Math.min(max, existing.qty + qty);
        else lines.unshift({ key, slug, colorId, size, qty: Math.min(max, qty) });
        set({ lines, pulse: get().pulse + 1, lastRemoved: null });
      },
      setQty: (key, qty) => {
        const lines = get().lines.map((l) =>
          l.key === key ? { ...l, qty: Math.max(1, Math.min(maxFor(l.slug, l.colorId, l.size), qty)) } : l,
        );
        set({ lines });
      },
      remove: (key) => {
        const index = get().lines.findIndex((l) => l.key === key);
        if (index < 0) return;
        const line = get().lines[index];
        set({ lines: get().lines.filter((l) => l.key !== key), lastRemoved: { line, index } });
      },
      undoRemove: () => {
        const r = get().lastRemoved;
        if (!r) return;
        const lines = [...get().lines];
        lines.splice(r.index, 0, r.line);
        set({ lines, lastRemoved: null });
      },
      clear: () => set({ lines: [], lastRemoved: null }),
      setOpen: (open) => set({ open }),
    }),
    {
      name: "waveform-bag",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ lines: s.lines }),
      // Evita mismatch de hidratación: se rehidrata manualmente en el cliente
      skipHydration: true,
    },
  ),
);

export type ResolvedLine = CartLine & {
  name: string;
  colorName: string;
  price: number;
  image: string;
  max: number;
};

export function resolveLines(lines: CartLine[]): ResolvedLine[] {
  return lines.flatMap((l) => {
    const p = getProduct(l.slug);
    const color = p?.colors.find((c) => c.id === l.colorId);
    if (!p || !color) return [];
    return [
      {
        ...l,
        name: p.name,
        colorName: color.name,
        price: p.price,
        image: productImage(p.slug, color.id, 1),
        max: maxFor(l.slug, l.colorId, l.size),
      },
    ];
  });
}

export function subtotalOf(lines: ResolvedLine[]) {
  return lines.reduce((sum, l) => sum + l.price * l.qty, 0);
}

export function countOf(lines: CartLine[]) {
  return lines.reduce((n, l) => n + l.qty, 0);
}


/** true cuando el bag ya se leyó de localStorage (evita mostrar "vacío" por un instante). */
export function useCartHydrated() {
  return useSyncExternalStore(
    (cb) => useCart.persist.onFinishHydration(cb),
    () => useCart.persist.hasHydrated(),
    () => false,
  );
}
