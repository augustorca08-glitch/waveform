"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useAnimationControls, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "motion/react";
import { Check, Ruler, Truck, ArrowsClockwise, X } from "@phosphor-icons/react";
import { type Product, productImages, stockOf, getCategory } from "@/content/products";
import { details } from "@/content/media";
import { useCart } from "@/lib/cart";
import { useFocusTrap, useScrollLock } from "@/lib/dom";
import { FREE_SHIPPING_FROM, formatPrice } from "@/lib/site";
import { Gallery } from "./gallery";
import { SizeChips, Swatches } from "./variant-pickers";
import { QtyStepper } from "@/components/ui/qty-stepper";

const VIEWS = ["frente", "espalda", "detalle"];

/** Imagen que vuela desde el botón hasta el ícono del bag: confirma que el producto llegó. */
function FlyToBag({ src, from, onDone }: { src: string; from: DOMRect; onDone: () => void }) {
  const target = document.getElementById("bag-button")?.getBoundingClientRect();
  const size = 72;
  const start = { x: from.left + from.width / 2 - size / 2, y: from.top + from.height / 2 - size / 2 };
  const end = target ? { x: target.right - 40, y: target.top + target.height / 2 - size / 2 } : { x: window.innerWidth - 80, y: 10 };
  return createPortal(
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[85] overflow-hidden rounded-full shadow-lg"
      style={{ width: size, height: size }}
      initial={{ x: start.x, y: start.y, scale: 1, opacity: 1 }}
      animate={{ x: [start.x, (start.x + end.x) / 2, end.x], y: [start.y, Math.min(start.y, end.y) - 120, end.y], scale: [1, 0.9, 0.3], opacity: [1, 1, 0.2] }}
      transition={{ duration: 0.8, ease: [0.5, 0, 0.2, 1] }}
      onAnimationComplete={onDone}
    >
      <Image src={src} alt="" fill sizes="72px" className="object-cover" />
    </motion.div>,
    document.body,
  );
}

function SizeGuide({ product }: { product: Product }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, open, () => setOpen(false));
  useScrollLock(open);
  const tops = product.sizes[0] === "XS";
  const rows = tops
    ? [["XS", "50", "68"], ["S", "53", "70"], ["M", "56", "72"], ["L", "59", "74"], ["XL", "62", "76"]]
    : [["28", "72", "100"], ["30", "77", "101"], ["32", "82", "102"], ["34", "87", "103"], ["36", "92", "104"]];
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold underline underline-offset-4">
        <Ruler size={16} weight="bold" aria-hidden /> Guía de talles
      </button>
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[60] flex items-end justify-center md:items-center">
            <motion.div className="absolute inset-0 bg-ink/45" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} aria-hidden />
            <motion.div
              ref={ref}
              role="dialog"
              aria-modal="true"
              aria-labelledby="size-guide-title"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative w-full max-w-lg bg-salt p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
            >
              <div className="flex items-start justify-between gap-4">
                <h2 id="size-guide-title" className="display text-3xl">
                  Guía de talles
                </h2>
                <button type="button" onClick={() => setOpen(false)} data-autofocus aria-label="Cerrar guía de talles" className="grid h-11 w-11 place-items-center rounded-full hover:bg-ink/[0.06]">
                  <X size={18} weight="bold" aria-hidden />
                </button>
              </div>
              <p className="mt-2 text-sm text-ink-soft">{product.fit}</p>
              <table className="mono mt-6 w-full text-left text-sm">
                <caption className="sr-only">Medidas en centímetros</caption>
                <thead>
                  <tr className="text-ink-soft">
                    <th scope="col" className="pb-2 font-medium">Talle</th>
                    <th scope="col" className="pb-2 font-medium">{tops ? "Ancho de pecho" : "Cintura"}</th>
                    <th scope="col" className="pb-2 font-medium">{tops ? "Largo" : "Largo de pierna"}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={r[0]} className={i % 2 ? "" : "bg-salt-deep"}>
                      <th scope="row" className="px-2 py-2.5 font-semibold">{r[0]}</th>
                      <td className="py-2.5">{r[1]} cm</td>
                      <td className="py-2.5">{r[2]} cm</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

/** Tres capítulos cortos: la imagen macro crece con el scroll y el texto la acompaña. */
function Chapter({ n, title, body, img }: { n: number; title: string; body: string; img: { src: string; alt: string } }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start end", "center center"] });
  const scale = useTransform(p, [0, 1], [0.78, 1]);
  const flip = n % 2 === 1;
  return (
    <div ref={ref} className={`grid items-center gap-8 md:grid-cols-2 md:gap-16 ${flip ? "md:[&>*:first-child]:order-last" : ""}`}>
      <motion.div style={reduce ? undefined : { scale }} className="relative aspect-square overflow-hidden bg-salt-deep">
        <Image src={img.src} alt={img.alt} fill sizes="(min-width: 768px) 45vw, 100vw" className="object-cover" />
      </motion.div>
      <div className={flip ? "md:text-right" : ""}>
        <h3 className="display text-[clamp(2.6rem,6vw,5.5rem)]">{title}</h3>
        <p className={`mt-4 max-w-[40ch] text-lg leading-snug ${flip ? "md:ml-auto" : ""}`}>{body}</p>
      </div>
    </div>
  );
}

export function ProductView({ product, initialColor }: { product: Product; initialColor: string }) {
  const [color, setColor] = useState(initialColor);
  const [size, setSize] = useState<string | null>(null);
  const [qtyRaw, setQty] = useState(1);
  const [error, setError] = useState(false);
  const [added, setAdded] = useState(false);
  const [fly, setFly] = useState<DOMRect | null>(null);
  const [ctaVisible, setCtaVisible] = useState(true);
  const add = useCart((s) => s.add);
  const openBag = useCart((s) => s.setOpen);
  const ctaRef = useRef<HTMLButtonElement>(null);
  const sizesRef = useRef<HTMLFieldSetElement>(null);
  const shake = useAnimationControls();
  const reduce = useReducedMotion();

  const colorObj = product.colors.find((c) => c.id === color) ?? product.colors[0];
  const images = productImages(product, colorObj.id).map((src, i) => ({ src, alt: `${product.name} en ${colorObj.name}, vista ${VIEWS[i] ?? i + 1}` }));
  const stock = size ? stockOf(product, colorObj.id, size) : null;
  const category = getCategory(product.category);
  const maxQty = Math.max(1, Math.min(10, stock ?? 10));
  const qty = Math.min(qtyRaw, maxQty);

  // Color en la URL: se puede compartir y respeta el botón atrás
  const changeColor = (id: string) => {
    setColor(id);
    if (size && stockOf(product, id, size) === 0) setSize(null);
    const url = new URL(window.location.href);
    url.searchParams.set("color", id);
    window.history.replaceState(null, "", url);
  };

  // La barra sticky aparece cuando el CTA principal quedó arriba del viewport.
  // Se deriva del scroll (no de IntersectionObserver, que no dispara en saltos que no cruzan el viewport).
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", () => {
    const r = ctaRef.current?.getBoundingClientRect();
    if (!r) return;
    const visible = r.bottom > 0;
    if (visible !== ctaVisible) setCtaVisible(visible);
  });


  const handleAdd = (fromEl?: HTMLElement | null) => {
    if (!size) {
      setError(true);
      sizesRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
      if (!reduce) shake.start({ x: [0, -8, 8, -5, 5, 0], transition: { duration: 0.4 } });
      window.setTimeout(() => sizesRef.current?.querySelector<HTMLInputElement>("input:not(:disabled)")?.focus({ preventScroll: true }), reduce ? 0 : 350);
      return;
    }
    add(product.slug, colorObj.id, size, qty);
    setAdded(true);
    if (!reduce && fromEl) setFly(fromEl.getBoundingClientRect());
    window.setTimeout(() => setAdded(false), 2600);
  };

  return (
    <article className="relative">
      {/* Nombre gigante detrás de la galería (decorativo: el h1 real está en el panel) */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-[calc(var(--header-h)+1rem)] hidden overflow-hidden lg:block">
        <motion.p
          initial={reduce ? false : { y: "30%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="display whitespace-nowrap px-8 text-[10.5vw] text-ink/[0.9]"
        >
          {product.name}
        </motion.p>
      </div>

      <div className="relative mx-auto max-w-[1400px] pt-16 lg:grid lg:grid-cols-12 lg:gap-8 lg:px-8 lg:pt-[calc(var(--header-h)+7.5vw)]">
        {/* Índice de fotos: saltos rápidos */}
        <nav aria-label="Fotos" className="hidden lg:col-span-1 lg:block">
          <ul className="sticky top-[calc(var(--header-h)+2rem)] flex flex-col gap-2 pt-[3vw]">
            {images.map((img, i) => (
              <li key={img.src}>
                <a href={`#photo-${i}`} className="relative block aspect-[4/5] w-full overflow-hidden bg-salt-deep opacity-70 transition-opacity hover:opacity-100 focus-visible:opacity-100">
                  <Image src={img.src} alt={`Ir a la vista ${VIEWS[i]}`} fill sizes="80px" className="object-cover" />
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="relative z-10 lg:col-span-6 lg:pt-[3vw]">
          <Gallery images={images} colorKey={colorObj.id} name={product.name} />
        </div>

        {/* Panel sticky */}
        <div className="relative z-10 px-4 pt-6 md:px-8 lg:col-span-5 lg:px-0 lg:pt-[3vw]">
          <div className="lg:sticky lg:top-[calc(var(--header-h)+2rem)] lg:pl-6">
            <nav aria-label="Ruta" className="mono text-xs text-ink-soft">
              <Link href="/shop" className="-my-1 inline-block py-1 hover:text-ink hover:underline">Shop</Link>
              <span aria-hidden> / </span>
              {category && (
                <Link href={`/shop/${category.id}`} className="-my-1 inline-block py-1 hover:text-ink hover:underline">
                  {category.label}
                </Link>
              )}
            </nav>
            <h1 className="display mt-3 text-[clamp(2.2rem,5vw,3.4rem)] leading-[0.9]">{product.name}</h1>
            <div className="mt-4 flex items-center gap-3">
              <p className="mono text-xl font-semibold">{formatPrice(product.price)}</p>
              {product.tags.includes("new") && (
                <span className="sticker -rotate-3 rounded-full bg-sunburn px-3 py-1 text-[11px] text-ink">New</span>
              )}
            </div>
            <p className="mt-4 max-w-[46ch] text-ink-soft">{product.summary}</p>

            <fieldset className="mt-7">
              <legend className="text-sm font-semibold">
                Color: <span className="font-normal">{colorObj.name}</span>
              </legend>
              <Swatches product={product} value={colorObj.id} onChange={changeColor} name="color" className="mt-3" />
            </fieldset>

            <motion.fieldset ref={sizesRef} animate={shake} className="mt-7" aria-describedby={error ? "size-error" : "size-status"}>
              <div className="flex items-center justify-between gap-4">
                <legend className="float-left text-sm font-semibold">Talle</legend>
                <SizeGuide product={product} />
              </div>
              <SizeChips product={product} colorId={colorObj.id} value={size} onChange={(s) => { setSize(s); setError(false); }} name="size" className="clear-both mt-2" />
              <p id="size-status" className="mt-3 min-h-5 text-sm" aria-live="polite">
                {error ? null : stock === null ? (
                  <span className="text-ink-soft">Elegí tu talle.</span>
                ) : stock <= 2 ? (
                  <strong>Quedan {stock} en talle {size}.</strong>
                ) : (
                  <span className="inline-flex items-center gap-1.5"><Check size={14} weight="bold" aria-hidden /> Disponible en talle {size}.</span>
                )}
              </p>
              {error && (
                <p id="size-error" role="alert" className="-mt-5 text-sm font-semibold">
                  Elegí un talle para agregarlo al bag.
                </p>
              )}
            </motion.fieldset>

            <div className="mt-5 flex gap-3">
              <QtyStepper value={qty} max={maxQty} onChange={setQty} label="Cantidad" />
              <button
                ref={ctaRef}
                type="button"
                onClick={(e) => handleAdd(e.currentTarget)}
                className={`btn min-w-0 flex-1 px-4 ${added ? "btn-primary" : "btn-ink"}`}
                aria-live="polite"
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={added ? "added" : "add"}
                    initial={{ y: 12, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -12, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="inline-flex items-center gap-2"
                  >
                    {added ? (
                      <>
                        <Check size={18} weight="bold" aria-hidden /> Agregado
                      </>
                    ) : (
                      <>
                        <span className="sm:hidden">Agregar</span>
                        <span className="hidden sm:inline">Agregar al bag</span> · {formatPrice(product.price * qty)}
                      </>
                    )}
                  </motion.span>
                </AnimatePresence>
              </button>
            </div>
            <AnimatePresence>
              {added && (
                <motion.button
                  type="button"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  onClick={() => openBag(true)}
                  className="mt-1 py-2 text-sm font-semibold underline underline-offset-4"
                >
                  Ver bag
                </motion.button>
              )}
            </AnimatePresence>

            <ul className="mt-7 grid gap-3 text-sm">
              <li className="flex items-start gap-3">
                <Truck size={20} weight="bold" aria-hidden className="shrink-0" />
                <span>Envío gratis desde {formatPrice(FREE_SHIPPING_FROM)}. Despacho en 24 horas hábiles.</span>
              </li>
              <li className="flex items-start gap-3">
                <ArrowsClockwise size={20} weight="bold" aria-hidden className="shrink-0" />
                <span>Cambios sin costo durante 30 días.</span>
              </li>
            </ul>

            <div className="mt-8 border-t border-line">
              {[
                { t: "Descripción", b: product.description },
                { t: "Materiales y cuidado", b: `${product.materials} Lavar en frío, secar a la sombra.` },
                { t: "Fit", b: product.fit },
              ].map((d, i) => (
                <details key={d.t} className="group border-b border-line" open={i === 0}>
                  <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between font-semibold [&::-webkit-details-marker]:hidden">
                    {d.t}
                    <span aria-hidden className="text-xl transition-transform duration-300 group-open:rotate-45">+</span>
                  </summary>
                  <p className="pb-5 text-ink-soft">{d.b}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Storytelling del producto */}
      <section aria-labelledby="details-title" className="mx-auto mt-24 max-w-[1400px] px-4 md:px-8 lg:mt-40">
        <h2 id="details-title" className="sr-only">
          Detalles del producto
        </h2>
        <div className="flex flex-col gap-20 lg:gap-32">
          <Chapter n={0} title="Tela" body={product.materials} img={details.fabric} />
          <Chapter n={1} title="Fit" body={product.fit} img={details.stitch} />
          <Chapter n={2} title="Hecho para" body={product.madeFor} img={details.label} />
        </div>
      </section>

      {/* Barra sticky mobile */}
      <AnimatePresence>
        {!ctaVisible && (
          <motion.div
            initial={{ y: "110%" }}
            animate={{ y: 0 }}
            exit={{ y: "110%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            data-sticky-buy
            className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-salt/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md lg:hidden"
          >
            <div className="flex items-center gap-3">
              <div className="relative aspect-[4/5] w-11 shrink-0 overflow-hidden bg-salt-deep">
                <Image src={images[0].src} alt="" fill sizes="44px" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{product.name}</p>
                <p className="mono text-xs text-ink-soft">
                  {colorObj.name}
                  {size ? ` · Talle ${size}` : ""}
                </p>
              </div>
              <button type="button" onClick={(e) => handleAdd(e.currentTarget)} className="btn btn-ink h-12 shrink-0 px-5">
                {added ? "Agregado" : size ? "Agregar" : "Elegir talle"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {fly && <FlyToBag src={images[0].src} from={fly} onDone={() => setFly(null)} />}
    </article>
  );
}
