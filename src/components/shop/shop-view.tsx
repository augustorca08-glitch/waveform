"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "@phosphor-icons/react";
import { categories, type CategoryId, type Product, stockOf } from "@/content/products";
import { categoryMedia } from "@/content/media";
import { ProductCard } from "@/components/product/product-card";
import { fitDisplay } from "@/lib/type";

const SORTS = [
  { id: "featured", label: "Destacados" },
  { id: "new", label: "Nuevos" },
  { id: "price-asc", label: "Precio: menor a mayor" },
  { id: "price-desc", label: "Precio: mayor a menor" },
] as const;

export type ShopFilters = { color?: string; talle?: string; orden?: string };

export function ShopView({ items, category, initial = {} }: { items: Product[]; category?: CategoryId; initial?: ShopFilters }) {
  const pathname = usePathname();
  const [filters, setFilters] = useState<ShopFilters>(initial);
  const color = filters.color ?? null;
  const size = filters.talle ?? null;
  const sort = filters.orden ?? "featured";

  const apply = (next: ShopFilters) => {
    setFilters(next);
    const qs = new URLSearchParams(Object.entries(next).filter((e): e is [string, string] => !!e[1])).toString();
    // Next sincroniza replaceState con el router sin re-render del servidor
    window.history.replaceState(null, "", qs ? `${pathname}?${qs}` : pathname);
  };
  const setParam = (key: keyof ShopFilters, value: string | null) => apply({ ...filters, [key]: value ?? undefined });
  const clear = () => apply({});

  const colorOptions = useMemo(() => {
    const map = new Map<string, { id: string; name: string; hex: string }>();
    items.forEach((p) => p.colors.forEach((c) => map.set(c.id, c)));
    return [...map.values()];
  }, [items]);
  const sizeOptions = useMemo(() => [...new Set(items.flatMap((p) => p.sizes))], [items]);

  const list = useMemo(() => {
    let out = items.filter((p) => {
      if (color && !p.colors.some((c) => c.id === color)) return false;
      if (size && !p.sizes.includes(size)) return false;
      if (size && !p.colors.some((c) => (!color || c.id === color) && stockOf(p, c.id, size) > 0)) return false;
      return true;
    });
    if (sort === "price-asc") out = [...out].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") out = [...out].sort((a, b) => b.price - a.price);
    if (sort === "new") out = [...out].sort((a, b) => Number(b.tags.includes("new")) - Number(a.tags.includes("new")));
    if (sort === "featured") out = [...out].sort((a, b) => Number(b.tags.includes("featured")) - Number(a.tags.includes("featured")));
    return out;
  }, [items, color, size, sort]);

  const cat = category ? categories.find((c) => c.id === category) : undefined;
  const editorial = cat ? categoryMedia[cat.id] : categoryMedia.swim;
  const active = [color && colorOptions.find((c) => c.id === color)?.name, size && `Talle ${size}`].filter(Boolean);

  return (
    <div className="mx-auto max-w-[1400px] px-4 pb-24 pt-[calc(var(--header-h)+2.5rem)] md:px-8">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="display" style={fitDisplay(cat ? cat.label : "Shop", 13, 88, 11)}>
            {cat ? cat.label : "Shop"}
          </h1>
          <p className="mono mt-3 text-sm text-ink-soft">{cat ? cat.tagline : "Todo WAVEFORM, verano 27"}</p>
        </div>
      </div>

      <nav aria-label="Categorías" className="scrollbar-none -mx-4 mt-8 overflow-x-auto px-4 md:mx-0 md:px-0">
        <ul className="flex w-max gap-2">
          {[{ id: undefined, label: "Todo" }, ...categories].map((c) => {
            const href = c.id ? `/shop/${c.id}` : "/shop";
            const current = c.id === category;
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={current ? "page" : undefined}
                  className={`flex h-11 items-center rounded-full px-5 text-sm font-semibold transition-colors ${
                    current ? "bg-ink text-salt" : "shadow-[inset_0_0_0_1.5px_var(--color-line)] hover:shadow-[inset_0_0_0_1.5px_var(--color-ink)]"
                  }`}
                >
                  {c.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-6 flex flex-wrap items-end gap-x-6 gap-y-4 border-y border-line py-4">
        <fieldset>
          <legend className="mono mb-2 text-xs uppercase text-ink-soft">Color</legend>
          <div className="flex flex-wrap gap-1">
            {colorOptions.map((c) => (
              <button
                key={c.id}
                type="button"
                aria-pressed={color === c.id}
                onClick={() => setParam("color", color === c.id ? null : c.id)}
                className="grid h-11 w-11 place-items-center rounded-full"
              >
                <span
                  className={`block h-6 w-6 rounded-full shadow-[inset_0_0_0_1px_rgb(14_20_23_/_0.25)] ${color === c.id ? "ring-2 ring-ink ring-offset-2 ring-offset-salt" : ""}`}
                  style={{ background: c.hex }}
                />
                <span className="sr-only">{c.name}</span>
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="mono mb-2 text-xs uppercase text-ink-soft">Talle</legend>
          <div className="flex flex-wrap gap-1">
            {sizeOptions.map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={size === s}
                onClick={() => setParam("talle", size === s ? null : s)}
                className={`mono h-11 min-w-11 rounded-full px-3 text-sm font-semibold transition-colors ${
                  size === s ? "bg-ink text-salt" : "hover:bg-ink/[0.06]"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </fieldset>
        <div className="ml-auto">
          <label htmlFor="sort" className="mono mb-2 block text-xs uppercase text-ink-soft">
            Ordenar
          </label>
          <select
            id="sort"
            value={sort}
            onChange={(e) => setParam("orden", e.target.value === "featured" ? null : e.target.value)}
            className="h-11 rounded-full bg-salt px-4 pr-9 text-sm font-semibold text-ink shadow-[inset_0_0_0_1.5px_var(--color-line)]"
          >
            {SORTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 flex min-h-11 flex-wrap items-center gap-2" aria-live="polite">
        <p className="mono text-sm">
          {list.length} {list.length === 1 ? "producto" : "productos"}
        </p>
        {active.map((a) => (
          <span key={a as string} className="rounded-full bg-sand px-3 py-1 text-xs font-semibold">
            {a}
          </span>
        ))}
        {active.length > 0 && (
          <button
            type="button"
            onClick={() => clear()}
            className="inline-flex min-h-11 items-center gap-1 px-2 text-sm font-semibold underline underline-offset-4"
          >
            <X size={14} weight="bold" aria-hidden /> Limpiar filtros
          </button>
        )}
      </div>

      {list.length === 0 ? (
        <div className="py-24">
          <p className="display text-[clamp(2.4rem,7vw,5rem)]">Marea baja.</p>
          <p className="mt-4 max-w-[40ch] text-ink-soft">No hay productos con esos filtros. Probá con otro talle o color.</p>
          <button type="button" onClick={() => clear()} className="btn btn-ink mt-8">
            Limpiar filtros
          </button>
        </div>
      ) : (
        <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-12 md:gap-x-6 lg:grid-cols-4 lg:gap-x-8">
          <AnimatePresence mode="popLayout">
            {list.map((p, i) => {
              const big = i === 0;
              return (
                <motion.li
                  key={p.slug}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className={big ? "col-span-2 row-span-2" : i % 4 === 2 ? "lg:mt-16" : ""}
                >
                  <ProductCard product={p} headingLevel={2} sizes={big ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 25vw, 50vw"} />
                </motion.li>
              );
            })}
            {list.length >= 4 && (
              <motion.li key="editorial" layout className="col-span-2 lg:col-span-2">
                <Link href={cat ? "/lookbook" : "/shop/swim"} className="group relative block aspect-[16/10] overflow-hidden bg-tide" data-cursor="View">
                  <Image src={editorial.src} alt="" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                  <span className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,rgb(14_20_23_/_0.6))]" />
                  <span className="display absolute bottom-5 left-5 text-[clamp(2rem,4vw,3.5rem)] text-salt">{cat ? "Ver el lookbook" : "Swim season"}</span>
                </Link>
              </motion.li>
            )}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}
