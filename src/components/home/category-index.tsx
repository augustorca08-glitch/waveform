"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { ArrowUpRight } from "@phosphor-icons/react";
import { categories, productsByCategory, type Category } from "@/content/products";
import { categoryMedia } from "@/content/media";
import { Reveal } from "@/components/ui/motion";
import { fitDisplay } from "@/lib/type";

const toneFill: Record<Category["tone"], string> = {
  sand: "bg-sand",
  ink: "bg-ink",
  sky: "bg-sky",
  tide: "bg-tide",
  salt: "bg-salt-deep",
};
const toneText: Record<Category["tone"], string> = {
  sand: "group-hover:text-ink",
  ink: "group-hover:text-salt",
  sky: "group-hover:text-ink",
  tide: "group-hover:text-salt",
  salt: "group-hover:text-ink",
};

/** Desktop: índice tipográfico. La foto sigue al cursor y la fila se tiñe con el color de su categoría. */
function IndexList() {
  const box = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [active, setActive] = useState<string | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 180, damping: 22, mass: 0.7 });
  const sy = useSpring(y, { stiffness: 180, damping: 22, mass: 0.7 });

  const onMove = (e: React.PointerEvent) => {
    const r = box.current?.getBoundingClientRect();
    if (!r) return;
    x.set(e.clientX - r.left);
    y.set(e.clientY - r.top);
  };

  return (
    <div ref={box} className="relative" onPointerMove={onMove} onPointerLeave={() => setActive(null)}>
      <ul className="border-t border-line">
        {categories.map((c) => {
          const count = productsByCategory(c.id).length;
          return (
            <li key={c.id} className="border-b border-line">
              <Link
                href={`/shop/${c.id}`}
                onPointerEnter={() => setActive(c.id)}
                onFocus={() => setActive(c.id)}
                onBlur={() => setActive(null)}
                className="group relative grid grid-cols-[1fr_auto] items-center gap-6 overflow-hidden px-2 py-3 focus-visible:outline-offset-[-4px]"
              >
                <span
                  aria-hidden
                  className={`absolute inset-0 origin-left scale-x-0 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:scale-x-100 group-focus-visible:scale-x-100 ${toneFill[c.tone]}`}
                />
                <span className={`display relative text-[clamp(3.5rem,9vw,8.5rem)] transition-[color,transform] duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-6 ${toneText[c.tone]}`}>
                  {c.label}
                </span>
                <span className={`relative flex items-center gap-6 transition-colors ${toneText[c.tone]}`}>
                  <span className="mono hidden text-sm opacity-0 transition-opacity duration-300 group-hover:opacity-100 xl:inline">{c.tagline}</span>
                  <span className="mono whitespace-nowrap text-sm">
                    {count} {count === 1 ? "pieza" : "piezas"}
                  </span>
                  <ArrowUpRight size={28} weight="bold" aria-hidden className="transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      {!reduce && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 z-10 w-[19vw] max-w-[300px] -translate-x-1/2 -translate-y-1/2"
          style={{ x: sx, y: sy }}
        >
          <AnimatePresence>
            {active && (
              <motion.div
                key={active}
                initial={{ opacity: 0, scale: 0.7, rotate: -8 }}
                animate={{ opacity: 1, scale: 1, rotate: -3 }}
                exit={{ opacity: 0, scale: 0.85, rotate: 4 }}
                transition={{ type: "spring", stiffness: 260, damping: 24 }}
                className="absolute inset-x-0 top-0 aspect-[4/5] -translate-y-1/2 overflow-hidden shadow-[0_30px_60px_-25px_rgb(14_20_23_/_0.6)]"
              >
                <Image src={categoryMedia[active].src} alt="" fill sizes="300px" className="object-cover" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}

/** Touch / mobile: bloques apilados, cada uno con su color, recorte y alineación. */
const blockMedia = [
  "aspect-[4/3] w-[62%] ml-auto -mt-6",
  "aspect-[16/9] w-full",
  "aspect-[4/5] w-[52%] -mt-10",
  "aspect-[21/9] w-full",
  "aspect-square w-[46%] ml-auto -mt-12 rounded-full",
];

function IndexBlocks() {
  return (
    <ul className="flex flex-col gap-3">
      {categories.map((c, i) => {
        const m = categoryMedia[c.id];
        const dark = c.tone === "ink" || c.tone === "tide";
        return (
          <Reveal as="li" key={c.id} delay={0.04 * i} y={40}>
            <Link
              href={`/shop/${c.id}`}
              className={`block overflow-hidden p-4 md:p-6 ${toneFill[c.tone]} ${dark ? "text-salt" : "text-ink"}`}
              style={{ rotate: i % 2 ? "0.5deg" : "-0.5deg" }}
              data-surface={dark ? "dark" : undefined}
            >
              <span className="mono block text-xs">{c.tagline}</span>
              <span className="display relative z-10 mt-1 flex items-end justify-between gap-2" style={fitDisplay(c.label, 11, 66, 5)}>
                {c.label}
                <ArrowUpRight size={24} weight="bold" aria-hidden className="mb-1 shrink-0" />
              </span>
              <span className={`relative mt-4 block overflow-hidden ${blockMedia[i]}`}>
                <Image src={m.src} alt="" fill sizes="(min-width: 768px) 60vw, 90vw" className="object-cover" />
              </span>
            </Link>
          </Reveal>
        );
      })}
    </ul>
  );
}

export function CategoryIndex() {
  return (
    <section aria-labelledby="shop-title" className="bg-salt px-4 py-20 md:px-8 lg:py-28">
      <div className="mx-auto max-w-[1400px]">
        <Reveal>
          <h2 id="shop-title" lang="en" className="display max-w-[12ch] text-[clamp(2rem,6vw,5rem)]">
            Shop the collection
          </h2>
        </Reveal>
        <div className="mt-10 hidden lg:mt-14 [@media(hover:hover)_and_(min-width:1024px)]:block">
          <IndexList />
        </div>
        <div className="mt-10 [@media(hover:hover)_and_(min-width:1024px)]:hidden">
          <IndexBlocks />
        </div>
      </div>
    </section>
  );
}
