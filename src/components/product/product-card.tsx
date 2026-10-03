"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { type Product, productImage, isSoldOut } from "@/content/products";
import { formatPrice } from "@/lib/site";
import { QuickAddInline, QuickAddSheet } from "./quick-add";

/**
 * Tarjeta de producto sin caja: la imagen es la tarjeta.
 * Hover: cambia a la vista de espalda y aparece la fila de talles para agregar rápido.
 */
export function ProductCard({
  product,
  sizes = "(min-width: 1024px) 30vw, 50vw",
  ratio = "aspect-[4/5]",
  className = "",
  headingLevel = 3,
}: {
  product: Product;
  sizes?: string;
  ratio?: string;
  className?: string;
  headingLevel?: 2 | 3;
}) {
  const [color, setColor] = useState(product.colors[0].id);
  const href = `/product/${product.slug}?color=${color}`;
  const soldOut = isSoldOut(product);
  const H = `h${headingLevel}` as "h2" | "h3";
  const isNew = product.tags.includes("new");

  return (
    <article className={`group relative ${className}`}>
      <div className={`relative overflow-hidden bg-salt-deep ${ratio}`}>
        <Link href={href} data-cursor="View" tabIndex={-1} aria-hidden className="absolute inset-0 block">
          <Image
            src={productImage(product.slug, color, 1)}
            alt=""
            fill
            sizes={sizes}
            className="object-cover transition-[transform,opacity] duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.03]"
          />
          <Image
            src={productImage(product.slug, color, 2)}
            alt=""
            fill
            sizes={sizes}
            className="object-cover opacity-0 transition-opacity duration-500 [@media(hover:hover)]:group-hover:opacity-100"
          />
        </Link>
        {isNew && (
          <span className="sticker pointer-events-none absolute left-3 top-3 -rotate-6 rounded-full bg-sunburn px-3 py-1.5 text-[11px] text-ink">
            New
          </span>
        )}
        {!soldOut && (
          <>
            <div className="absolute inset-x-3 bottom-3 hidden translate-y-3 opacity-0 transition-[opacity,transform] duration-300 group-focus-within:translate-y-0 group-focus-within:opacity-100 [@media(hover:hover)]:block [@media(hover:hover)]:group-hover:translate-y-0 [@media(hover:hover)]:group-hover:opacity-100">
              <QuickAddInline product={product} colorId={color} />
            </div>
            <div className="absolute bottom-3 right-3 [@media(hover:hover)]:hidden">
              <QuickAddSheet product={product} initialColor={color} />
            </div>
          </>
        )}
      </div>
      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <H className="text-[0.95rem] font-semibold leading-snug">
            <Link href={href} className="hover:underline hover:underline-offset-4">
              {product.name}
            </Link>
          </H>
          <div className="mt-2 flex gap-1.5" role="group" aria-label={`Colores de ${product.name}`}>
            {product.colors.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setColor(c.id)}
                aria-pressed={color === c.id}
                aria-label={c.name}
                className="grid h-7 w-7 place-items-center rounded-full"
              >
                <span
                  className={`block h-4 w-4 rounded-full shadow-[inset_0_0_0_1px_rgb(14_20_23_/_0.25)] ${color === c.id ? "ring-2 ring-ink ring-offset-2 ring-offset-salt" : ""}`}
                  style={{ background: c.hex }}
                />
              </button>
            ))}
          </div>
        </div>
        <p className="mono shrink-0 text-sm">{soldOut ? "Agotado" : formatPrice(product.price)}</p>
      </div>
    </article>
  );
}
