"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { Plus, X, Check } from "@phosphor-icons/react";
import { type Product, productImage, stockOf } from "@/content/products";
import { useCart } from "@/lib/cart";
import { useFocusTrap, useScrollLock } from "@/lib/dom";
import { formatPrice } from "@/lib/site";
import { SizeChips, Swatches } from "./variant-pickers";

/** Fila de talles sobre la imagen (desktop, hover o foco). Agrega con el color actual. */
export function QuickAddInline({ product, colorId }: { product: Product; colorId: string }) {
  const add = useCart((s) => s.add);
  const [added, setAdded] = useState<string | null>(null);
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="mr-1 text-xs font-semibold uppercase tracking-wide">Agregar</span>
      {product.sizes.map((s) => {
        const out = stockOf(product, colorId, s) === 0;
        return (
          <button
            key={s}
            type="button"
            disabled={out}
            onClick={(e) => {
              e.preventDefault();
              add(product.slug, colorId, s);
              setAdded(s);
              window.setTimeout(() => setAdded(null), 1400);
            }}
            aria-label={out ? `Talle ${s} agotado` : `Agregar ${product.name} talle ${s}`}
            className="mono grid h-9 min-w-9 place-items-center rounded-full bg-salt px-2 text-xs font-semibold text-ink transition-colors hover:bg-ink hover:text-salt disabled:bg-salt/60 disabled:text-ink-soft disabled:line-through"
          >
            {added === s ? <Check size={14} weight="bold" aria-hidden /> : s}
          </button>
        );
      })}
      <span className="sr-only" aria-live="polite">
        {added ? `Agregaste ${product.name} talle ${added} al bag` : ""}
      </span>
    </div>
  );
}

/** Bottom sheet de variantes (mobile y teclado). */
export function QuickAddSheet({ product, initialColor }: { product: Product; initialColor: string }) {
  const [open, setOpen] = useState(false);
  const [color, setColor] = useState(initialColor);
  const [size, setSize] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const add = useCart((s) => s.add);
  const setBag = useCart((s) => s.setOpen);
  const ref = useRef<HTMLDivElement>(null);
  const close = () => setOpen(false);
  useFocusTrap(ref, open, close);
  useScrollLock(open);

  const colorName = product.colors.find((c) => c.id === color)?.name;

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          setOpen(true);
        }}
        aria-label={`Agregar rápido ${product.name}`}
        className="grid h-11 w-11 place-items-center rounded-full bg-salt text-ink shadow-[0_6px_18px_-8px_rgb(14_20_23_/_0.5)] transition-transform hover:scale-105 active:scale-95"
      >
        <Plus size={18} weight="bold" aria-hidden />
      </button>
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[60] flex items-end justify-center md:items-center">
            <motion.div className="absolute inset-0 bg-ink/45" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={close} aria-hidden />
            <motion.div
              ref={ref}
              role="dialog"
              aria-modal="true"
              aria-labelledby={`qa-${product.slug}`}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 34 }}
              className="relative w-full max-w-lg bg-salt p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] text-ink md:rounded-none"
            >
              <div className="flex gap-4">
                <div className="relative aspect-[4/5] w-24 shrink-0 overflow-hidden bg-salt-deep">
                  <Image src={productImage(product.slug, color, 1)} alt="" fill sizes="96px" className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 id={`qa-${product.slug}`} className="font-semibold">
                    {product.name}
                  </h2>
                  <p className="mono mt-1 text-sm">{formatPrice(product.price)}</p>
                </div>
                <button type="button" onClick={close} aria-label="Cerrar" data-autofocus className="grid h-11 w-11 shrink-0 place-items-center rounded-full hover:bg-ink/[0.06]">
                  <X size={18} weight="bold" aria-hidden />
                </button>
              </div>
              <fieldset className="mt-5">
                <legend className="text-sm font-semibold">
                  Color: <span className="font-normal">{colorName}</span>
                </legend>
                <Swatches product={product} value={color} onChange={(c) => { setColor(c); setSize(null); }} name={`qa-color-${product.slug}`} className="mt-2" />
              </fieldset>
              <fieldset className="mt-5">
                <legend className="text-sm font-semibold">Talle</legend>
                <SizeChips product={product} colorId={color} value={size} onChange={(s) => { setSize(s); setError(false); }} name={`qa-size-${product.slug}`} className="mt-2" />
                {error && (
                  <p role="alert" className="mt-2 text-sm font-semibold">
                    Elegí un talle para agregarlo al bag.
                  </p>
                )}
              </fieldset>
              <button
                type="button"
                className="btn btn-ink mt-6 w-full"
                onClick={() => {
                  if (!size) return setError(true);
                  add(product.slug, color, size);
                  close();
                  setBag(true);
                }}
              >
                Agregar al bag
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
