"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

// Solo en navegaciones del cliente: la primera carga no espera a ninguna animación.
// En el servidor nunca se renderiza (la variable de módulo persistiría entre requests).
let hydrated = false;

/** Cortina de color entre rutas: continuidad de marca al cambiar de página. */
export function PageCurtain({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  const [animate] = useState(() => typeof window !== "undefined" && hydrated);
  useEffect(() => {
    hydrated = true;
  }, []);
  return (
    <>
      {animate && !reduce && (
        <motion.div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-[90] origin-top bg-tide"
          initial={{ scaleY: 1 }}
          animate={{ scaleY: 0 }}
          transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
        />
      )}
      {children}
    </>
  );
}
