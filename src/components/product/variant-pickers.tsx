"use client";

import { motion } from "motion/react";
import { type Product, stockOf } from "@/content/products";

/** Swatches de color como radio group nativo: teclado y lectores de pantalla gratis. */
export function Swatches({
  product,
  value,
  onChange,
  name,
  className = "",
  size = "md",
}: {
  product: Product;
  value: string;
  onChange: (id: string) => void;
  name: string;
  className?: string;
  size?: "sm" | "md";
}) {
  const dim = size === "sm" ? "h-7 w-7" : "h-11 w-11";
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {product.colors.map((c) => (
        <label key={c.id} className="relative cursor-pointer" title={c.name}>
          <input
            type="radio"
            name={name}
            value={c.id}
            checked={value === c.id}
            onChange={() => onChange(c.id)}
            className="peer sr-only"
          />
          <span className="sr-only">{c.name}</span>
          <span
            aria-hidden
            className={`block ${dim} rounded-full shadow-[inset_0_0_0_1px_rgb(14_20_23_/_0.2)] ring-offset-2 ring-offset-salt transition-[box-shadow] peer-checked:ring-2 peer-checked:ring-ink peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-ink`}
            style={{ background: c.hex }}
          />
        </label>
      ))}
    </div>
  );
}

/** Chips de talle. Los agotados se tachan y no se pueden elegir. */
export function SizeChips({
  product,
  colorId,
  value,
  onChange,
  name,
  className = "",
}: {
  product: Product;
  colorId: string;
  value: string | null;
  onChange: (s: string) => void;
  name: string;
  className?: string;
}) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {product.sizes.map((s) => {
        const stock = stockOf(product, colorId, s);
        const out = stock === 0;
        const selected = value === s;
        return (
          <label key={s} className={`relative ${out ? "cursor-not-allowed" : "cursor-pointer"}`}>
            <input
              type="radio"
              name={name}
              value={s}
              checked={selected}
              disabled={out}
              onChange={() => onChange(s)}
              className="peer sr-only"
            />
            <motion.span
              animate={selected ? { scale: [1, 1.12, 1] } : { scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 15 }}
              className={`mono grid h-12 min-w-14 place-items-center rounded-full px-3 text-sm font-semibold transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-3 peer-focus-visible:outline-ink ${
                selected
                  ? "bg-ink text-salt"
                  : out
                    ? "text-ink-soft line-through shadow-[inset_0_0_0_1.5px_var(--color-line)]"
                    : "shadow-[inset_0_0_0_1.5px_var(--color-line)] hover:shadow-[inset_0_0_0_1.5px_var(--color-ink)]"
              }`}
            >
              {s}
            </motion.span>
            <span className="sr-only">{out ? " (agotado)" : stock <= 2 ? ` (quedan ${stock})` : ""}</span>
          </label>
        );
      })}
    </div>
  );
}
