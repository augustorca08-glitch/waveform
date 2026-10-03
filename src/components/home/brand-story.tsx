"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { story } from "@/content/media";
import { Sticker } from "@/components/ui/motion";

const MANIFESTO =
  "Empezamos con una van, dos tablas y un parlante con la batería al veinte por ciento. Hacemos ropa para esa sensación: salir del agua con sal en la piel y ningún apuro por volver.";

function Word({ word, i, total, p }: { word: string; i: number; total: number; p: MotionValue<number> }) {
  const start = i / total;
  const a = start * 0.85;
  const opacity = useTransform(p, (v) => 0.2 + 0.8 * Math.min(1, Math.max(0, (v - a) / 0.12)));
  return (
    <motion.span style={{ opacity }} className="inline-block">
      {word}&nbsp;
    </motion.span>
  );
}

/** Capítulo de color (el único cambio de superficie del home). El manifiesto se lee al ritmo del scroll. */
export function BrandStory() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start 75%", "end 70%"] });
  const polaroidY = useTransform(p, [0, 1], [80, -60]);
  const polaroidR = useTransform(p, [0, 1], [-10, -3]);
  const words = MANIFESTO.split(" ");

  return (
    <section
      ref={ref}
      aria-labelledby="story-title"
      data-surface="dark"
      className="relative overflow-hidden bg-tide px-4 py-24 text-salt md:px-8 lg:py-40"
    >
      <div className="relative mx-auto grid max-w-[1400px] gap-14 lg:grid-cols-[1fr_minmax(280px,30%)] lg:items-center">
        <div>
          <h2 id="story-title" className="mono text-xs font-semibold uppercase tracking-[0.18em] text-sky">
            Por qué existimos
          </h2>
          <p className="display mt-6 text-[clamp(1.9rem,4.2vw,4rem)] normal-case leading-[1] tracking-[-0.03em] [font-stretch:105%]">
            {reduce ? MANIFESTO : words.map((w, i) => <Word key={i} word={w} i={i} total={words.length} p={p} />)}
          </p>
          <Link href="/about" className="link-draw mt-10 inline-block text-lg font-semibold">
            Nuestra historia
          </Link>
        </div>

        <motion.div style={reduce ? { rotate: -4 } : { y: polaroidY, rotate: polaroidR }} className="relative mx-auto w-[78%] max-w-[360px] lg:w-full">
          <figure className="bg-salt p-3 pb-14 shadow-[0_40px_60px_-30px_rgb(0_0_0_/_0.6)]">
            <div className="relative aspect-[6/7] overflow-hidden bg-salt-deep">
              <Image src={story.polaroid.src} alt={story.polaroid.alt} fill sizes="(min-width: 1024px) 30vw, 78vw" className="object-cover" />
            </div>
          </figure>
          <Sticker at="-right-4 -top-6 lg:-right-8" rotate={12} float={false} className="h-24 w-24 rounded-full bg-sunburn text-[11px] text-ink">
            <span>
              Made for
              <br />
              long
              <br />
              summers
            </span>
          </Sticker>
        </motion.div>
      </div>
    </section>
  );
}
