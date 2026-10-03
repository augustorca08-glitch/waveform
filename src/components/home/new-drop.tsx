"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { ArrowRight } from "@phosphor-icons/react";
import { getProduct, productImage } from "@/content/products";
import { drop } from "@/content/media";
import { formatPrice } from "@/lib/site";
import { MaskReveal, Reveal } from "@/components/ui/motion";

function useLayer(p: MotionValue<number>, distance: number) {
  return useTransform(p, [0, 1], [distance, -distance]);
}

const pieces = [
  { slug: "tide-heavy-tee", color: "salt", speed: 90, pos: "lg:left-[3%] lg:top-[40%] lg:w-[23%]", rotate: -2 },
  { slug: "swell-boardshort", color: "sunburn", speed: 150, pos: "lg:left-[73%] lg:top-[30%] lg:w-[22%]", rotate: 2.5 },
  { slug: "paddle-out-coach-jacket", color: "ink", speed: 50, pos: "lg:left-[31%] lg:top-[66%] lg:w-[19%]", rotate: -1 },
];

function Piece({ i, p }: { i: number; p: MotionValue<number> }) {
  const piece = pieces[i];
  const product = getProduct(piece.slug)!;
  const color = product.colors.find((c) => c.id === piece.color)!;
  const reduce = useReducedMotion();
  const y = useLayer(p, piece.speed);
  return (
    <motion.figure
      style={reduce ? undefined : { y }}
      className={`relative z-10 ${i === 1 ? "mt-16 lg:mt-0" : ""} lg:absolute ${piece.pos}`}
    >
      <Link href={`/product/${product.slug}?color=${color.id}`} data-cursor="View" className="group block">
        <div className="relative aspect-[4/5] overflow-hidden bg-salt-deep shadow-[0_30px_50px_-30px_rgb(14_20_23_/_0.55)]" style={{ rotate: `${piece.rotate}deg` }}>
          <MaskReveal className="absolute inset-0" delay={0.1 + i * 0.12}>
            <Image
              src={productImage(product.slug, color.id, 1)}
              alt={`${product.name} en ${color.name}`}
              fill
              sizes="(min-width: 1024px) 23vw, 45vw"
              className="object-cover transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-105"
            />
          </MaskReveal>
        </div>
        <figcaption className="mt-3 flex items-baseline justify-between gap-2 text-sm">
          <span className="font-semibold group-hover:underline group-hover:underline-offset-4">{product.name}</span>
          <span className="mono">{formatPrice(product.price)}</span>
        </figcaption>
      </Link>
    </motion.figure>
  );
}

export function NewDrop() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const leadY = useLayer(p, 30);
  const titleX = useTransform(p, [0, 1], ["4%", "-6%"]);

  return (
    <section ref={ref} aria-labelledby="drop-title" className="relative overflow-hidden bg-salt px-4 pb-24 pt-10 md:px-8 lg:pb-12 lg:pt-4">
      <div className="relative mx-auto max-w-[1400px] lg:aspect-[1400/1250]">
        <motion.h2
          id="drop-title"
          style={reduce ? undefined : { x: titleX }}
          className="display relative z-20 text-[25vw] leading-[0.8] lg:absolute lg:left-0 lg:top-[2%] lg:text-[13.5vw] 2xl:text-[190px]"
        >
          Low
          <br />
          <span className="lg:pl-[0.6em]">Tide</span>
        </motion.h2>

        <motion.div
          style={reduce ? undefined : { y: leadY }}
          className="relative mt-6 lg:absolute lg:left-[40%] lg:top-[4%] lg:mt-0 lg:w-[38%]"
        >
          <MaskReveal className="relative aspect-[4/5] overflow-hidden bg-salt-deep">
            <Image src={drop.lead.src} alt={drop.lead.alt} fill sizes="(min-width: 1024px) 38vw, 100vw" className="object-cover" />
          </MaskReveal>
        </motion.div>

        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 lg:mt-0 lg:block">
          {pieces.map((_, i) => (
            <Piece key={i} i={i} p={p} />
          ))}
        </div>

        <Reveal className="relative z-10 mt-14 max-w-sm lg:absolute lg:bottom-[4%] lg:right-0 lg:mt-0">
          <p className="text-lg leading-snug">
            Seis piezas para la marea baja: telas que secan rápido, colores lavados por el sol y cortes para moverse.
          </p>
          <Link href="/drop/low-tide" className="btn btn-ink mt-6">
            <span lang="en">Shop the drop</span> <ArrowRight size={18} weight="bold" aria-hidden />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
