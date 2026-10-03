"use client";

import Image from "next/image";
import Link from "next/link";
import { useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { lookbook } from "@/content/media";
import { useMediaQuery } from "@/lib/dom";
import { fitDisplay } from "@/lib/type";

/** Alturas y offsets desalineados a propósito: rollo fotográfico, no grilla. */
const frame = [
  "h-[62vh] mt-[6vh]",
  "h-[44vh] mt-[26vh]",
  "h-[70vh] mt-0",
  "h-[54vh] mt-[18vh]",
  "h-[40vh] mt-[8vh]",
  "h-[64vh] mt-[14vh]",
  "h-[58vh] mt-[4vh]",
  "h-[42vh] mt-[30vh]",
];

function Frames({ pan }: { pan: boolean }) {
  return (
    <>
      {lookbook.map((m, i) => (
        <figure
          key={m.src}
          className={`shrink-0 ${pan ? frame[i] : "h-[56vh] max-h-[520px] snap-start"}`}
          style={{ aspectRatio: `${m.w} / ${m.h}` }}
        >
          <div className="relative h-[calc(100%-2rem)] overflow-hidden bg-salt-deep">
            <Image src={m.src} alt={m.alt} fill sizes={pan ? "50vw" : "80vw"} className="object-cover" />
          </div>
          <figcaption className="mt-2 text-sm text-ink-soft">{m.caption}</figcaption>
        </figure>
      ))}
    </>
  );
}

/** Desktop: la sección se fija y el scroll vertical se traduce en recorrido horizontal. */
function PinnedPan() {
  const wrap = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);

  useLayoutEffect(() => {
    const measure = () => {
      if (track.current) setDistance(Math.max(0, track.current.scrollWidth - window.innerWidth));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (track.current) ro.observe(track.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const { scrollYProgress } = useScroll({ target: wrap, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], [0, -distance]);

  return (
    <section ref={wrap} aria-labelledby="lookbook-title" className="relative bg-salt" style={{ height: `calc(100dvh + ${distance}px)` }}>
      <div className="sticky top-0 flex h-[100dvh] items-center overflow-hidden">
        <motion.div ref={track} style={{ x }} className="flex h-full items-start gap-[4vw] pl-8 pr-[10vw] pt-[calc(var(--header-h)+3vh)]">
          <div className="flex h-full w-[34vw] shrink-0 flex-col justify-between pb-[8vh]">
            <h2 id="lookbook-title" className="display text-[clamp(3.5rem,8.2vw,9rem)]">
              Look
              <br />
              book
            </h2>
            <div>
              <p className="max-w-[32ch] text-lg leading-snug">Ocho días en la costa con la colección Low Tide. Sin estudio, sin maquillaje, con marea baja.</p>
              <Link href="/lookbook" className="link-draw mt-6 inline-block font-semibold">
                Ver el lookbook completo
              </Link>
            </div>
          </div>
          <Frames pan />
        </motion.div>
      </div>
    </section>
  );
}

/** Mobile / reduced motion: scroll-snap horizontal nativo, sin secuestrar el scroll. */
function NativeRail() {
  return (
    <section aria-labelledby="lookbook-title" className="bg-salt py-20">
      <div className="px-4 md:px-8">
        <h2 id="lookbook-title" className="display" style={fitDisplay("Lookbook", 12, 86, 6)}>
          Lookbook
        </h2>
        <p className="mt-4 max-w-[32ch] text-lg leading-snug">Ocho días en la costa con la colección Low Tide. Sin estudio, sin maquillaje, con marea baja.</p>
      </div>
      <div
        className="scrollbar-none mt-10 flex snap-x snap-mandatory items-end gap-3 overflow-x-auto scroll-px-4 px-4 pb-2 md:gap-5 md:scroll-px-8 md:px-8"
        tabIndex={0}
        role="region"
        aria-label="Fotos del lookbook, desplazá horizontalmente"
        data-lenis-prevent-wheel
      >
        <Frames pan={false} />
      </div>
      <div className="px-4 md:px-8">
        <Link href="/lookbook" className="link-draw mt-8 inline-block font-semibold">
          Ver el lookbook completo
        </Link>
      </div>
    </section>
  );
}

export function LookbookRail() {
  const reduce = useReducedMotion();
  const desktop = useMediaQuery("(min-width: 1024px)");
  return desktop && !reduce ? <PinnedPan /> : <NativeRail />;
}
