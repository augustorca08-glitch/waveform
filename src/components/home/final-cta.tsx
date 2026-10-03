"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ArrowRight } from "@phosphor-icons/react";
import { finalCta } from "@/content/media";
import { Marquee } from "@/components/ui/motion";

export function FinalCta() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const imgY = useTransform(p, [0, 1], ["-8%", "8%"]);
  const scale = useTransform(p, [0, 0.5], [0.9, 1]);

  return (
    <section ref={ref} aria-labelledby="final-title" className="relative bg-salt">
      <Marquee items={["See you in the water", "Low Tide", "Summer 27", "Salt proof"]} className="border-y border-line py-4" />
      <div className="relative h-[100dvh] min-h-[560px] overflow-hidden" data-surface="dark">
        <motion.div className="absolute inset-[-8%_0]" style={reduce ? undefined : { y: imgY }}>
          <Image
            src={finalCta.desktop.src}
            alt=""
            fill
            sizes="100vw"
            className="hidden object-cover md:block"
            style={{ objectPosition: finalCta.desktop.focus }}
          />
          <Image src={finalCta.mobile.src} alt="" fill sizes="100vw" className="object-cover md:hidden" />
        </motion.div>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(14_20_23_/_0.1),rgb(14_20_23_/_0.55))]" />
        <div className="relative z-10 mx-auto flex h-full max-w-[1400px] flex-col justify-end px-4 pb-14 text-salt md:px-8 md:pb-20">
          <motion.h2
            id="final-title"
            style={reduce ? undefined : { scale }}
            lang="en"
            className="display origin-bottom-left text-[clamp(3.4rem,11vw,11rem)]"
          >
            See you
            <br />
            in the water
          </motion.h2>
          <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
            <Link href="/drop/low-tide" className="btn btn-primary">
              <span lang="en">Shop the drop</span> <ArrowRight size={18} weight="bold" aria-hidden />
            </Link>
            <p className="max-w-[34ch] text-salt/90">Envío gratis desde US$ 150 y cambios sin costo durante 30 días.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
