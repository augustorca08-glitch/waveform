"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { List, X, ArrowUpRight } from "@phosphor-icons/react";
import { categories } from "@/content/products";
import { categoryMedia } from "@/content/media";
import { nav } from "@/lib/site";
import { countOf, useCart } from "@/lib/cart";
import { useFocusTrap, useScrollLock } from "@/lib/dom";
import { fitDisplay } from "@/lib/type";

/** Rutas cuyo primer bloque es media oscura a pantalla completa */
const OVER_MEDIA = ["/", "/drop/low-tide"];

const toneBg: Record<string, string> = {
  sand: "bg-sand text-ink",
  ink: "bg-ink text-salt",
  sky: "bg-sky text-ink",
  tide: "bg-tide text-salt",
  salt: "bg-salt-deep text-ink",
};

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span translate="no" className={`display inline-block text-[1.15rem] leading-none tracking-[-0.03em] xs:text-[1.35rem] ${className}`}>
      Waveform
    </span>
  );
}

function BagButton({ onDark }: { onDark: boolean }) {
  const lines = useCart((s) => s.lines);
  const pulse = useCart((s) => s.pulse);
  const setOpen = useCart((s) => s.setOpen);
  const count = countOf(lines);
  return (
    <button
      type="button"
      id="bag-button"
      onClick={() => setOpen(true)}
      className={`group relative flex h-11 items-center gap-2 rounded-full pl-3 pr-1.5 text-sm font-semibold transition-colors xs:pl-4 ${
        onDark ? "text-salt hover:bg-salt/15" : "text-ink hover:bg-ink/[0.06]"
      }`}
      aria-label={`Abrir bag, ${count} ${count === 1 ? "producto" : "productos"}`}
    >
      <span className="uppercase tracking-wide">Bag</span>
      <motion.span
        key={pulse}
        initial={pulse ? { scale: 1.5, rotate: -12 } : false}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 420, damping: 14 }}
        className="mono grid h-8 min-w-8 place-items-center rounded-full bg-sunburn px-2 text-xs font-semibold text-ink"
      >
        {count}
      </motion.span>
    </button>
  );
}

function MegaPanel({ open, onClose, id }: { open: boolean; onClose: () => void; id: string }) {
  const [active, setActive] = useState(categories[0].id);
  const media = categoryMedia[active];
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          id={id}
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-x-0 top-full border-t border-line bg-salt text-ink shadow-[0_30px_60px_-30px_rgb(14_20_23_/_0.35)]"
        >
          <div className="mx-auto grid max-w-[1400px] grid-cols-[1.4fr_1fr] gap-10 px-8 py-10">
            <ul className="flex flex-col">
              {categories.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/shop/${c.id}`}
                    onClick={onClose}
                    onPointerEnter={() => setActive(c.id)}
                    onFocus={() => setActive(c.id)}
                    className="group flex items-baseline gap-4 py-1"
                  >
                    <span className="display text-[clamp(2.2rem,4vw,3.6rem)] transition-[color,transform] duration-300 group-hover:translate-x-3 group-hover:text-tide group-focus-visible:translate-x-3">
                      {c.label}
                    </span>
                    <span className="mono text-xs text-ink-soft opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                      {c.tagline}
                    </span>
                  </Link>
                </li>
              ))}
              <li className="mt-6">
                <Link href="/shop" onClick={onClose} className="link-draw inline-flex items-center gap-1 text-sm font-semibold">
                  Ver todo el shop <ArrowUpRight size={16} weight="bold" aria-hidden />
                </Link>
              </li>
            </ul>
            <div className="relative aspect-[4/3] overflow-hidden bg-salt-deep">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={active}
                  initial={{ clipPath: "inset(0% 0% 100% 0%)" }}
                  animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-0"
                >
                  <Image src={media.src} alt="" fill sizes="40vw" className="object-cover" />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, open, onClose);
  useScrollLock(open);
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={ref}
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menú"
          initial={{ clipPath: "inset(0% 0% 100% 0%)" }}
          animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
          exit={{ clipPath: "inset(0% 0% 100% 0%)" }}
          transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-50 flex flex-col overflow-y-auto overscroll-contain bg-salt text-ink lg:hidden"
        >
          <div className="flex h-16 shrink-0 items-center justify-between px-4">
            <Link href="/" onClick={onClose} aria-label="WAVEFORM, inicio">
              <Wordmark />
            </Link>
            <button
              type="button"
              onClick={onClose}
              data-autofocus
              className="flex h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold uppercase tracking-wide hover:bg-ink/[0.06]"
            >
              Cerrar <X size={18} weight="bold" aria-hidden />
            </button>
          </div>
          <nav aria-label="Categorías" className="flex flex-col">
            {categories.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.18 + i * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link
                  href={`/shop/${c.id}`}
                  onClick={onClose}
                  className={`flex items-end justify-between px-4 py-4 ${toneBg[c.tone]}`}
                  style={{ rotate: i % 2 ? "0.4deg" : "-0.4deg" }}
                >
                  <span className="display" style={fitDisplay(c.label, 12, 74, 4)}>
                    {c.label}
                  </span>
                  <ArrowUpRight size={22} weight="bold" aria-hidden className="mb-1" />
                </Link>
              </motion.div>
            ))}
          </nav>
          <nav aria-label="Principal" className="mt-auto grid grid-cols-2 gap-x-4 gap-y-1 px-4 pb-8 pt-8">
            {nav.map((n) => (
              <Link key={n.href} href={n.href} onClick={onClose} className="py-2 text-lg font-semibold">
                {n.label}
              </Link>
            ))}
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Header() {
  const pathname = usePathname();
  const overMediaRoute = OVER_MEDIA.includes(pathname);
  const [atTop, setAtTop] = useState(true);
  const [hidden, setHidden] = useState(false);
  const [mega, setMega] = useState(false);
  const [menu, setMenu] = useState(false);
  const megaTimer = useRef<number | undefined>(undefined);
  const hoverOpenedAt = useRef(0);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    // Sobre media el header es transparente solo cerca del tope: más abajo puede quedar sobre
    // un cielo claro (o sobre el margen claro del hero del home al achicarse) y perder contraste.
    const threshold = overMediaRoute ? 80 : 24;
    const top = y < threshold;
    if (top !== atTop) setAtTop(top);
    const shouldHide = y > 240 && y > prev + 2 && !mega;
    const shouldShow = y < prev - 2 || y < 240;
    if (shouldHide && !hidden) setHidden(true);
    else if (shouldShow && hidden) setHidden(false);
  });

  // Al agregar al bag, el header vuelve a mostrarse para que se vea el contador
  const pulse = useCart((st) => st.pulse);
  const [lastPulse, setLastPulse] = useState(pulse);
  if (lastPulse !== pulse) {
    setLastPulse(pulse);
    setHidden(false);
  }

  // Cerrar paneles al cambiar de ruta (ajuste durante el render, sin efecto)
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setMega(false);
    setMenu(false);
  }

  useEffect(() => {
    if (!mega) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMega(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mega]);

  const onDark = overMediaRoute && atTop && !mega;
  const openMega = () => {
    window.clearTimeout(megaTimer.current);
    if (!mega) hoverOpenedAt.current = Date.now();
    setMega(true);
  };
  // Si el hover acaba de abrir el panel, el click no debe cerrarlo
  const toggleMega = () => setMega((m) => (m && Date.now() - hoverOpenedAt.current > 600 ? false : true));
  const closeMega = () => {
    megaTimer.current = window.setTimeout(() => setMega(false), 140);
  };

  return (
    <>
      <a
        href="#main"
        className="fixed left-4 top-3 z-[95] -translate-y-24 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-salt focus:translate-y-0"
      >
        Saltar al contenido
      </a>
      <motion.header
        data-surface={onDark ? "dark" : undefined}
        animate={{ y: hidden ? "-100%" : "0%" }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        onPointerLeave={closeMega}
        className={`fixed inset-x-0 top-0 z-40 transition-colors duration-500 ${
          onDark ? "bg-transparent text-salt" : "bg-salt/90 text-ink backdrop-blur-md"
        } ${!onDark && !atTop ? "shadow-[0_1px_0_var(--color-line)]" : ""}`}
      >
        <div className="mx-auto grid h-16 max-w-[1400px] grid-cols-[1fr_auto_1fr] items-center px-4 md:px-8">
          <Link href="/" aria-label="WAVEFORM, inicio" className="justify-self-start">
            <Wordmark />
          </Link>

          <nav aria-label="Principal" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              <li onPointerEnter={openMega}>
                <button
                  type="button"
                  aria-expanded={mega}
                  aria-controls="mega-panel"
                  onClick={toggleMega}
                  className="rounded-full px-4 py-2.5 text-sm font-semibold uppercase tracking-wide"
                >
                  <span className={`link-draw ${pathname.startsWith("/shop") ? "[background-size:100%_1.5px]" : ""}`}>Shop</span>
                </button>
              </li>
              {nav.slice(1).map((n) => (
                <li key={n.href} onPointerEnter={closeMega}>
                  <Link
                    href={n.href}
                    aria-current={pathname === n.href ? "page" : undefined}
                    className="link-draw mx-4 py-2.5 text-sm font-semibold uppercase tracking-wide"
                  >
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-1 justify-self-end">
            <BagButton onDark={onDark} />
            <button
              type="button"
              onClick={() => setMenu(true)}
              aria-expanded={menu}
              aria-controls="mobile-menu"
              className={`flex h-11 items-center gap-1.5 rounded-full px-2.5 text-sm font-semibold uppercase tracking-wide xs:px-3 lg:hidden ${
                onDark ? "hover:bg-salt/15" : "hover:bg-ink/[0.06]"
              }`}
            >
              Menu <List size={20} weight="bold" aria-hidden />
            </button>
          </div>
        </div>
        <div className="hidden lg:block" onPointerEnter={() => mega && openMega()}>
          <MegaPanel id="mega-panel" open={mega} onClose={() => setMega(false)} />
        </div>
      </motion.header>
      <MobileMenu open={menu} onClose={() => setMenu(false)} />
    </>
  );
}
