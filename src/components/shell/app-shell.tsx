"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { AnimatePresence, MotionConfig, motion, useMotionValue, useSpring } from "motion/react";
import { useCart } from "@/lib/cart";
import { setLenis, useFinePointer, useMediaQuery } from "@/lib/dom";

/** Smooth scroll solo con puntero fino y sin reduced motion. */
function SmoothScroll() {
  const fine = useFinePointer();
  const reduce = useMediaQuery("(prefers-reduced-motion: reduce)");
  useEffect(() => {
    if (!fine || reduce) return;
    const l = new Lenis({ lerp: 0.11, wheelMultiplier: 1, autoRaf: true, anchors: true });
    setLenis(l);
    return () => {
      l.destroy();
      setLenis(null);
    };
  }, [fine, reduce]);
  return null;
}

/** Al navegar, vuelve arriba de forma inmediata (Lenis incluido). */
function RouteScrollReset() {
  const pathname = usePathname();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

/**
 * Etiqueta contextual junto al cursor ("VIEW", "DRAG") sobre elementos con data-cursor.
 * El cursor nativo se mantiene siempre: esto es una pista, no un reemplazo.
 */
function CursorLabel() {
  const fine = useFinePointer();
  const reduce = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [label, setLabel] = useState<string | null>(null);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 420, damping: 36, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 420, damping: 36, mass: 0.6 });

  useEffect(() => {
    if (!fine) return;
    let current: string | null = null;
    const onMove = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const el = (e.target as Element | null)?.closest?.("[data-cursor]");
      const next = el?.getAttribute("data-cursor") ?? null;
      if (next !== current) {
        current = next;
        setLabel(next);
      }
    };
    const onLeave = () => {
      current = null;
      setLabel(null);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [fine, x, y]);

  if (!fine) return null;
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[80]"
      style={{ x: reduce ? x : sx, y: reduce ? y : sy }}
    >
      <AnimatePresence>
        {label && (
          <motion.span
            key={label}
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.4, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="sticker ml-4 mt-4 block rounded-full bg-sunburn px-3.5 py-2 text-[11px] text-ink"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function CartHydration() {
  useEffect(() => {
    useCart.persist.rehydrate();
    // Señal para tests end-to-end: la app ya es interactiva
    document.documentElement.dataset.hydrated = "1";
  }, []);
  return null;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <CartHydration />
      <SmoothScroll />
      <RouteScrollReset />
      {children}
      <CursorLabel />
    </MotionConfig>
  );
}
