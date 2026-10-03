"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { lookbook } from "@/content/media";
import { Sticker } from "@/components/ui/motion";

export function DropHero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(p, [0, 1], ["0%", "18%"]);
  const img = lookbook[4];
  return (
    <section ref={ref} className="relative h-[100dvh] min-h-[560px] overflow-hidden bg-tide-deep text-salt" data-surface="dark">
      <motion.div className="absolute inset-0" style={reduce ? undefined : { y }}>
        <Image src={img.src} alt={img.alt} fill preload fetchPriority="high" sizes="100vw" className="object-cover" />
      </motion.div>
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(14_20_23_/_0.35),transparent_35%,rgb(14_20_23_/_0.6))]" />
      <div className="relative z-10 mx-auto flex h-full max-w-[1400px] flex-col justify-end px-4 pb-10 md:px-8 md:pb-14">
        <p className="mono text-xs font-semibold uppercase tracking-[0.18em]">Nueva colección</p>
        <motion.h1
          initial={reduce ? false : { y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          className="display mt-3 text-[clamp(4.5rem,21vw,19rem)] leading-[0.78]"
        >
          Low Tide
        </motion.h1>
        <p className="mt-6 max-w-[40ch] text-lg">Seis piezas pensadas para la marea baja: la hora en que la playa es más larga y nadie tiene apuro.</p>
      </div>
      <Sticker at="right-5 top-24 md:right-12 md:top-28" rotate={10} className="h-24 w-24 rounded-full bg-sunburn text-[11px] text-ink md:h-28 md:w-28">
        <span>Summer<br />27</span>
      </Sticker>
    </section>
  );
}
