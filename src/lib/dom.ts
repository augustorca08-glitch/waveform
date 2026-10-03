"use client";

import { useEffect, useMemo, useRef, useSyncExternalStore, type RefObject } from "react";
import type Lenis from "lenis";

/* Lenis compartido: se registra desde SmoothScroll */
let lenis: Lenis | null = null;
export const setLenis = (l: Lenis | null) => {
  lenis = l;
};
export const getLenis = () => lenis;

let locks = 0;
/** Bloquea el scroll del documento (modales, drawer, menú). Soporta anidamiento. */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    locks++;
    const html = document.documentElement;
    if (locks === 1) {
      html.style.overflow = "hidden";
      lenis?.stop();
    }
    return () => {
      locks--;
      if (locks === 0) {
        html.style.overflow = "";
        lenis?.start();
      }
    };
  }, [active]);
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Atrapa el foco dentro de `ref` mientras está activo, cierra con Escape
 * y devuelve el foco al elemento que lo tenía antes.
 */
export function useFocusTrap(ref: RefObject<HTMLElement | null>, active: boolean, onClose: () => void) {
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  });

  useEffect(() => {
    if (!active) return;
    const previous = document.activeElement as HTMLElement | null;
    const node = ref.current;
    const focusables = () => Array.from(node?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []).filter((el) => el.offsetParent !== null || el === document.activeElement);

    const t = window.setTimeout(() => {
      const initial = node?.querySelector<HTMLElement>("[data-autofocus]") ?? focusables()[0];
      initial?.focus({ preventScroll: true });
    }, 30);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        closeRef.current();
        return;
      }
      if (e.key !== "Tab") return;
      const list = focusables();
      if (!list.length) return;
      const first = list[0];
      const last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      previous?.focus?.({ preventScroll: true });
    };
  }, [active, ref]);
}

function subscribeMedia(query: string) {
  return (cb: () => void) => {
    const mq = window.matchMedia(query);
    mq.addEventListener("change", cb);
    return () => mq.removeEventListener("change", cb);
  };
}

/** Media query reactiva y segura para SSR (false en el servidor). */
export function useMediaQuery(query: string) {
  const subscribe = useMemo(() => subscribeMedia(query), [query]);
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export const useFinePointer = () => useMediaQuery("(hover: hover) and (pointer: fine)");
