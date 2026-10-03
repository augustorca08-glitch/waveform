"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X, WhatsappLogo, ArrowRight } from "@phosphor-icons/react";
import { resolveLines, subtotalOf, useCart } from "@/lib/cart";
import { useFocusTrap, useScrollLock } from "@/lib/dom";
import { FREE_SHIPPING_FROM, formatPrice, whatsappLink } from "@/lib/site";
import { QtyStepper } from "@/components/ui/qty-stepper";

export function orderMessage(lines: ReturnType<typeof resolveLines>) {
  const items = lines.map((l) => `• ${l.qty} × ${l.name} (${l.colorName}, talle ${l.size}) ${formatPrice(l.price * l.qty)}`);
  return `Hola WAVEFORM, quiero consultar por este pedido:\n${items.join("\n")}\nSubtotal: ${formatPrice(subtotalOf(lines))}`;
}

export function CartDrawer() {
  const open = useCart((s) => s.open);
  const setOpen = useCart((s) => s.setOpen);
  const raw = useCart((s) => s.lines);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const lastRemoved = useCart((s) => s.lastRemoved);
  const undo = useCart((s) => s.undoRemove);
  const lines = resolveLines(raw);
  const subtotal = subtotalOf(lines);
  const panel = useRef<HTMLDivElement>(null);
  const close = () => setOpen(false);
  useFocusTrap(panel, open, close);
  useScrollLock(open);

  const remaining = FREE_SHIPPING_FROM - subtotal;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60]">
          <motion.div
            className="absolute inset-0 bg-ink/45"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            aria-hidden
          />
          <motion.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-labelledby="bag-title"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 32 }}
            className="absolute inset-y-0 right-0 flex w-full max-w-[460px] flex-col bg-salt text-ink shadow-[-30px_0_60px_-30px_rgb(14_20_23_/_0.4)]"
          >
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-5">
              <h2 id="bag-title" className="display text-2xl">
                Bag <span className="mono align-middle text-sm font-medium normal-case tracking-normal">({lines.reduce((n, l) => n + l.qty, 0)})</span>
              </h2>
              <button
                type="button"
                onClick={close}
                data-autofocus
                aria-label="Cerrar bag"
                className="grid h-11 w-11 place-items-center rounded-full hover:bg-ink/[0.06]"
              >
                <X size={20} weight="bold" aria-hidden />
              </button>
            </div>

            {lines.length === 0 ? (
              <div className="flex flex-1 flex-col justify-center px-6 pb-16">
                <p className="display text-[clamp(2.6rem,11vw,3.6rem)]">Nada acá todavía.</p>
                <p className="mt-4 max-w-[34ch] text-ink-soft">
                  El bag está vacío. Empezá por la colección nueva o por lo más vendido del verano.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href="/drop/low-tide" onClick={close} className="btn btn-primary">
                    <span lang="en">Shop the drop</span>
                  </Link>
                  <Link href="/shop" onClick={close} className="btn btn-outline">
                    Ver todo
                  </Link>
                </div>
                {lastRemoved && (
                  <button type="button" onClick={undo} className="mt-6 self-start text-sm font-semibold underline underline-offset-4">
                    Deshacer: volver a agregar el último producto
                  </button>
                )}
              </div>
            ) : (
              <>
                <p className="border-b border-line px-5 py-3 text-sm" aria-live="polite">
                  {remaining > 0 ? (
                    <>
                      Te faltan <strong className="mono">{formatPrice(remaining)}</strong> para el envío gratis.
                    </>
                  ) : (
                    <strong>Tenés envío gratis.</strong>
                  )}
                </p>
                <ul className="flex-1 overflow-y-auto overscroll-contain px-5" data-lenis-prevent>
                  <AnimatePresence initial={false}>
                    {lines.map((l) => (
                      <motion.li
                        key={l.key}
                        layout
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="grid grid-cols-[88px_1fr] gap-4 border-b border-line py-5">
                          <Link href={`/product/${l.slug}?color=${l.colorId}`} onClick={close} className="relative block aspect-[4/5] overflow-hidden bg-salt-deep">
                            <Image src={l.image} alt={`${l.name} en ${l.colorName}`} fill sizes="88px" className="object-cover" />
                          </Link>
                          <div className="flex min-w-0 flex-col">
                            <div className="flex items-start justify-between gap-3">
                              <Link href={`/product/${l.slug}?color=${l.colorId}`} onClick={close} className="-my-1 inline-block py-1 font-semibold leading-tight hover:underline">
                                {l.name}
                              </Link>
                              <span className="mono shrink-0 text-sm">{formatPrice(l.price * l.qty)}</span>
                            </div>
                            <p className="mt-1 text-sm text-ink-soft">
                              {l.colorName} · Talle {l.size}
                            </p>
                            <div className="mt-auto flex items-center justify-between pt-3">
                              <QtyStepper
                                value={l.qty}
                                max={l.max}
                                onChange={(q) => setQty(l.key, q)}
                                label={`Cantidad de ${l.name}`}
                                size="sm"
                              />
                              <button
                                type="button"
                                onClick={() => remove(l.key)}
                                className="min-h-11 px-1 text-sm text-ink-soft underline underline-offset-4 hover:text-ink"
                              >
                                Quitar<span className="sr-only"> {l.name}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                  {lastRemoved && (
                    <li className="py-4">
                      <button type="button" onClick={undo} className="text-sm font-semibold underline underline-offset-4">
                        Deshacer
                      </button>
                    </li>
                  )}
                </ul>
                <div className="shrink-0 border-t border-line bg-salt px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4">
                  <div className="flex items-baseline justify-between">
                    <span className="font-semibold">Subtotal</span>
                    <span className="mono text-lg font-semibold">{formatPrice(subtotal)}</span>
                  </div>
                  <p className="mt-1 text-sm text-ink-soft">Envío e impuestos se calculan en el checkout.</p>
                  <div className="mt-4 grid gap-2">
                    <Link href="/checkout" onClick={close} className="btn btn-ink w-full">
                      Ir al checkout <ArrowRight size={18} weight="bold" aria-hidden />
                    </Link>
                    <a
                      href={whatsappLink(orderMessage(lines))}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline w-full"
                    >
                      <WhatsappLogo size={20} weight="bold" aria-hidden /> Consultar por WhatsApp
                    </a>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
