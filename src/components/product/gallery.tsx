"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { ArrowLeft, ArrowRight, MagnifyingGlassPlus, X } from "@phosphor-icons/react";
import { useFocusTrap, useScrollLock } from "@/lib/dom";

type Img = { src: string; alt: string };

/** Lightbox con zoom: desktop sigue al cursor, touch alterna zoom con un toque en el punto tocado. */
function Lightbox({ images, index, onClose, onIndex }: { images: Img[]; index: number; onClose: () => void; onIndex: (i: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(false);
  const ox = useMotionValue(50);
  const oy = useMotionValue(50);
  // El origen de transformación en Motion va de 0 a 1
  const originX = useTransform(ox, (v) => v / 100);
  const originY = useTransform(oy, (v) => v / 100);
  useFocusTrap(ref, true, onClose);
  useScrollLock(true);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") onIndex((index + 1) % images.length);
      if (e.key === "ArrowLeft") onIndex((index - 1 + images.length) % images.length);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [index, images.length, onIndex]);

  const setOrigin = (e: React.PointerEvent) => {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    ox.set(((e.clientX - r.left) / r.width) * 100);
    oy.set(((e.clientY - r.top) / r.height) * 100);
  };

  const img = images[index];
  return (
    <motion.div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-label={`Imagen ampliada ${index + 1} de ${images.length}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex flex-col bg-salt"
    >
      <div className="flex h-16 shrink-0 items-center justify-between px-4 md:px-8">
        <p className="mono text-sm" aria-live="polite">
          {index + 1} de {images.length}
        </p>
        <button type="button" onClick={onClose} data-autofocus aria-label="Cerrar imagen ampliada" className="grid h-11 w-11 place-items-center rounded-full hover:bg-ink/[0.06]">
          <X size={20} weight="bold" aria-hidden />
        </button>
      </div>
      <div className="relative min-h-0 flex-1 overflow-hidden">
        <motion.button
          type="button"
          aria-label={zoom ? "Alejar" : "Acercar"}
          data-cursor={zoom ? "Alejar" : "Zoom"}
          onPointerMove={(e) => zoom && e.pointerType === "mouse" && setOrigin(e)}
          onPointerDown={setOrigin}
          onClick={() => setZoom((z) => !z)}
          className="absolute inset-0 h-full w-full cursor-zoom-in overflow-hidden focus-visible:outline-offset-[-4px]"
          style={{ cursor: zoom ? "zoom-out" : "zoom-in" }}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={img.src}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0"
            >
              <motion.div
                className="absolute inset-0"
                animate={{ scale: zoom ? 2.2 : 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 28 }}
                style={{ originX, originY }}
              >
                <Image src={img.src} alt={img.alt} fill sizes="100vw" quality={85} className="object-contain" />
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </motion.button>
      </div>
      <div className="flex shrink-0 items-center justify-center gap-3 py-4">
        <button type="button" onClick={() => { setZoom(false); onIndex((index - 1 + images.length) % images.length); }} aria-label="Imagen anterior" className="grid h-12 w-12 place-items-center rounded-full shadow-[inset_0_0_0_1.5px_var(--color-line)] hover:bg-ink hover:text-salt">
          <ArrowLeft size={18} weight="bold" aria-hidden />
        </button>
        <button type="button" onClick={() => { setZoom(false); onIndex((index + 1) % images.length); }} aria-label="Imagen siguiente" className="grid h-12 w-12 place-items-center rounded-full shadow-[inset_0_0_0_1.5px_var(--color-line)] hover:bg-ink hover:text-salt">
          <ArrowRight size={18} weight="bold" aria-hidden />
        </button>
      </div>
    </motion.div>
  );
}

/**
 * Galería de producto.
 * Desktop: columna de imágenes grandes con recortes variados. Mobile: carrusel con snap a ancho completo.
 * El cambio de color hace crossfade de toda la galería.
 */
export function Gallery({ images, colorKey, name }: { images: Img[]; colorKey: string; name: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const [slide, setSlide] = useState(0);
  const rail = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const onRailScroll = () => {
    const el = rail.current;
    if (!el) return;
    setSlide(Math.round(el.scrollLeft / el.clientWidth));
  };

  // Al cambiar de color vuelve a la primera foto
  const [lastKey, setLastKey] = useState(colorKey);
  if (lastKey !== colorKey) {
    setLastKey(colorKey);
    setSlide(0);
  }
  useEffect(() => {
    rail.current?.scrollTo({ left: 0 });
  }, [colorKey]);

  const layouts = ["aspect-[4/5] lg:col-span-2", "aspect-[4/5]", "aspect-[4/5] lg:mt-24"];

  return (
    <>
      {/* Mobile / tablet: carrusel */}
      <div className="lg:hidden">
        <div
          ref={rail}
          onScroll={onRailScroll}
          className="scrollbar-none flex snap-x snap-mandatory overflow-x-auto"
          role="region"
          aria-label={`Fotos de ${name}`}
          tabIndex={0}
        >
          {images.map((img, i) => (
            <button
              key={`${colorKey}-${i}`}
              type="button"
              onClick={() => setOpen(i)}
              className="relative aspect-[4/5] w-full shrink-0 snap-start bg-salt-deep"
              aria-label={`Ampliar foto ${i + 1} de ${images.length}`}
            >
              <Image src={img.src} alt={img.alt} fill preload={i === 0} sizes="100vw" className="object-cover" />
            </button>
          ))}
        </div>
        <div className="mt-3 flex justify-center gap-1.5" aria-hidden>
          {images.map((_, i) => (
            <span key={i} className={`h-1.5 w-6 origin-center rounded-full bg-ink transition-[transform,opacity] duration-300 ${slide === i ? "scale-x-100" : "scale-x-25 opacity-30"}`} />
          ))}
        </div>
      </div>

      {/* Desktop: columna editorial */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={colorKey}
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="hidden grid-cols-2 gap-4 lg:grid"
        >
          {images.map((img, i) => (
            <button
              key={img.src}
              type="button"
              id={`photo-${i}`}
              onClick={() => setOpen(i)}
              data-cursor="Zoom"
              className={`group relative overflow-hidden bg-salt-deep ${layouts[i] ?? "aspect-[4/5]"}`}
              aria-label={`Ampliar foto ${i + 1} de ${images.length}`}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                preload={i === 0}
                sizes={i === 0 ? "(min-width: 1024px) 50vw, 100vw" : "25vw"}
                className="object-cover transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.03]"
              />
              <span className="absolute bottom-3 right-3 grid h-10 w-10 place-items-center rounded-full bg-salt/85 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                <MagnifyingGlassPlus size={18} weight="bold" aria-hidden />
              </span>
            </button>
          ))}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>{open !== null && <Lightbox images={images} index={open} onClose={() => setOpen(null)} onIndex={setOpen} />}</AnimatePresence>
    </>
  );
}
