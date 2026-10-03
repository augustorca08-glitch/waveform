"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ArrowRight } from "@phosphor-icons/react";
import { HeroMedia } from "./hero-media";
import { Sticker } from "@/components/ui/motion";
import { useMediaQuery } from "@/lib/dom";

const EASE = [0.16, 1, 0.3, 1] as const;
// Transformaciones en función: evitan la aceleración por ScrollTimeline, que al salir del rango vuelve al valor base
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/**
 * Hero editorial: video full-bleed, wordmark gigante cortado por el borde y stickers.
 * Al scrollear, la media se recorta hasta un marco y el wordmark se comprime:
 * es la transición narrativa de la marca a la colección.
 */
export function Hero({ hasVideo, hasMobileVideo }: { hasVideo: boolean; hasMobileVideo: boolean }) {
  const wrap = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress: p } = useScroll({ target: wrap, offset: ["start start", "end end"] });

  const clip = useTransform(p, [0, 1], ["inset(0% 0% 0% 0%)", "inset(9% 7% 16% 7%)"]);
  const mediaScale = useTransform(p, [0, 1], [1, 1.06]);
  const wordY = useTransform(p, [0, 1], ["0%", "-38%"]);
  const wdth = useTransform(p, [0, 1], [125, 92]);
  const wordVariation = useTransform(wdth, (w) => `"wdth" ${w.toFixed(1)}`);
  const copyOpacity = useTransform(p, (v) => 1 - clamp01(v / 0.4));
  const copyY = useTransform(p, [0, 0.45], [0, -40]);

  const still = !!reduce;
  // Animar font-variation-settings provoca relayout: solo en pantallas grandes
  const breathe = useMediaQuery("(min-width: 1024px)") && !still;

  return (
    <section ref={wrap} aria-labelledby="hero-title" className={`relative ${still ? "h-[100dvh]" : "h-[175dvh]"}`}>
      <div ref={stage} className="sticky top-0 h-[100dvh] min-h-[560px] overflow-hidden bg-salt">
        <motion.div className="absolute inset-0" style={still ? undefined : { clipPath: clip }}>
          <motion.div className="absolute inset-0" style={still ? undefined : { scale: mediaScale }}>
            <HeroMedia hasVideo={hasVideo} hasMobileVideo={hasMobileVideo} />
          </motion.div>
        </motion.div>

        {/* Copy + CTAs */}
        <motion.div
          style={still ? undefined : { opacity: copyOpacity, y: copyY }}
          className="absolute inset-x-0 top-[calc(var(--header-h)+8vh)] z-10 mx-auto max-w-[1400px] px-4 text-salt md:top-auto md:bottom-[calc(10.5vw+2.5rem)] md:px-8"
          data-surface="dark"
        >
          <motion.p
            initial={reduce ? false : { y: 24 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.5, duration: 0.9, ease: EASE }}
            className="max-w-[26ch] text-lg font-medium leading-snug md:max-w-[30ch] md:text-xl"
          >
            Ropa para días largos de agua salada, ruedas y música fuerte.
          </motion.p>
          <motion.div
            initial={reduce ? false : { y: 24 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.65, duration: 0.9, ease: EASE }}
            className="mt-6 flex flex-wrap gap-3"
          >
            <Link href="/drop/low-tide" className="btn btn-primary">
              <span lang="en">Shop the drop</span> <ArrowRight size={18} weight="bold" aria-hidden />
            </Link>
            <Link href="/lookbook" className="btn btn-ghost">
              Lookbook
            </Link>
          </motion.div>
        </motion.div>

        {/* Wordmark: el titular es la marca */}
        <motion.h1
          id="hero-title"
          style={still ? undefined : { y: wordY }}
          className="absolute inset-x-0 bottom-0 z-10 text-salt mix-blend-difference"
        >
          <span className="sr-only">WAVEFORM, ropa de surf y skate. Nueva colección Low Tide.</span>
          <motion.span
            aria-hidden
            // Solo transform: el wordmark es el LCP y un fade-in lo retrasaría
            initial={reduce ? false : { y: "55%" }}
            animate={{ y: "0%" }}
            transition={{ delay: 0.15, duration: 1.2, ease: EASE }}
            style={breathe ? { fontVariationSettings: wordVariation } : undefined}
            className="display -mb-[0.13em] block select-none text-center text-[25.4vw] leading-[0.8] md:whitespace-nowrap md:text-[13.05vw]"
          >
            <span className="block md:inline">Wave</span>
            <span className="block md:inline">form</span>
          </motion.span>
        </motion.h1>

        <Sticker
          constraints={stage}
          at="right-5 top-[52%] md:right-[9vw] md:top-[22vh]"
          rotate={9}
          className="h-24 w-24 rounded-full bg-sunburn text-[11px] text-ink md:h-32 md:w-32 md:text-[13px]"
        >
          <span>
            Low Tide
            <br />
            Summer 27
          </span>
        </Sticker>
        <Sticker
          constraints={stage}
          at="left-4 top-[58%] hidden md:block md:left-auto md:right-[26vw] md:top-[44vh]"
          rotate={-7}
          className="rounded-full bg-salt px-4 py-2.5 text-[12px] text-ink"
        >
          Salt proof
        </Sticker>
        <Sticker
          constraints={stage}
          at="left-6 top-[60%] md:hidden"
          rotate={-10}
          className="rounded-full bg-sky px-3.5 py-2 text-[11px] text-ink"
        >
          New drop
        </Sticker>
      </div>
    </section>
  );
}
