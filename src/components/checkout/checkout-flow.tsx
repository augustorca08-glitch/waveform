"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, Check, LockSimple } from "@phosphor-icons/react";
import { resolveLines, subtotalOf, useCart, useCartHydrated } from "@/lib/cart";
import { FREE_SHIPPING_FROM, SHIPPING_OPTIONS, formatPrice } from "@/lib/site";

type Data = {
  email: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  zip: string;
  country: string;
  shipping: (typeof SHIPPING_OPTIONS)[number]["id"];
  payment: "card" | "transfer";
};
type Errors = Partial<Record<keyof Data, string>>;

const STEPS = ["Contacto", "Envío", "Revisión"] as const;

function validate(step: number, d: Data): Errors {
  const e: Errors = {};
  if (step === 0) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email.trim())) e.email = "Ingresá un email válido, por ejemplo nombre@mail.com.";
    if (d.name.trim().length < 2) e.name = "Ingresá tu nombre y apellido.";
    if (d.phone && d.phone.replace(/\D/g, "").length < 8) e.phone = "El teléfono parece incompleto.";
  }
  if (step === 1 && d.shipping !== "pickup") {
    if (d.address.trim().length < 4) e.address = "Ingresá la calle y el número.";
    if (d.city.trim().length < 2) e.city = "Ingresá la ciudad.";
    if (!/^[A-Za-z0-9 -]{3,10}$/.test(d.zip.trim())) e.zip = "Revisá el código postal.";
  }
  return e;
}

function Field({
  id,
  label,
  error,
  hint,
  ...input
}: { id: string; label: string; error?: string; hint?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ") || undefined;
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
        {!input.required && <span className="font-normal text-ink-soft"> (opcional)</span>}
      </label>
      <input
        id={id}
        aria-invalid={!!error}
        aria-describedby={describedBy}
        className="h-12 rounded-full bg-salt px-5 text-base text-ink shadow-[inset_0_0_0_1.5px_var(--color-line)] placeholder:text-ink-soft hover:shadow-[inset_0_0_0_1.5px_var(--color-ink-soft)] focus-visible:shadow-[inset_0_0_0_1.5px_var(--color-ink)] aria-[invalid=true]:shadow-[inset_0_0_0_2px_var(--color-sunburn)]"
        {...input}
      />
      {hint && (
        <p id={`${id}-hint`} className="text-sm text-ink-soft">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-sm font-semibold text-ink">
          <span aria-hidden className="mr-1 inline-block h-2 w-2 rounded-full bg-sunburn align-middle" />
          {error}
        </p>
      )}
    </div>
  );
}

function Summary({ lines, shippingCost }: { lines: ReturnType<typeof resolveLines>; shippingCost: number }) {
  const subtotal = subtotalOf(lines);
  return (
    <div>
      <ul className="flex flex-col gap-4">
        {lines.map((l) => (
          <li key={l.key} className="grid grid-cols-[64px_1fr_auto] items-center gap-4">
            <div className="relative aspect-[4/5] overflow-hidden bg-salt-deep">
              <Image src={l.image} alt="" fill sizes="64px" className="object-cover" />
              <span className="mono absolute -right-0 -top-0 grid h-6 min-w-6 place-items-center rounded-full bg-ink px-1 text-[11px] text-salt">{l.qty}</span>
            </div>
            <div className="min-w-0">
              <p className="truncate font-semibold">{l.name}</p>
              <p className="text-sm text-ink-soft">
                {l.colorName} · Talle {l.size}
              </p>
            </div>
            <span className="mono text-sm">{formatPrice(l.price * l.qty)}</span>
          </li>
        ))}
      </ul>
      <dl className="mt-6 grid grid-cols-[1fr_auto] gap-y-2 border-t border-line pt-4 text-sm">
        <dt>Subtotal</dt>
        <dd className="mono">{formatPrice(subtotal)}</dd>
        <dt>Envío</dt>
        <dd className="mono">{shippingCost ? formatPrice(shippingCost) : "Sin costo"}</dd>
        <dt className="pt-2 text-base font-semibold">Total</dt>
        <dd className="mono pt-2 text-base font-semibold">{formatPrice(subtotal + shippingCost)}</dd>
      </dl>
    </div>
  );
}

export function CheckoutFlow() {
  const hydrated = useCartHydrated();
  const raw = useCart((s) => s.lines);
  const clear = useCart((s) => s.clear);
  const router = useRouter();
  const uid = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const lines = resolveLines(raw);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [d, setD] = useState<Data>({ email: "", name: "", phone: "", address: "", city: "", zip: "", country: "Argentina", shipping: "standard", payment: "card" });

  // Aviso antes de salir si hay datos cargados y el pedido no se confirmó
  const dirty = !submitting && Object.entries(d).some(([k, v]) => !["country", "shipping", "payment"].includes(k) && v !== "");
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const subtotal = subtotalOf(lines);
  const option = SHIPPING_OPTIONS.find((o) => o.id === d.shipping)!;
  const shippingCost = option.id === "standard" && subtotal >= FREE_SHIPPING_FROM ? 0 : option.price;

  const set = <K extends keyof Data>(k: K) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setD((prev) => ({ ...prev, [k]: e.target.value }));
    if (errors[k]) setErrors((prev) => ({ ...prev, [k]: undefined }));
  };

  const next = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate(step, d);
    setErrors(errs);
    const first = Object.keys(errs)[0];
    if (first) {
      formRef.current?.querySelector<HTMLInputElement>(`#${uid}-${first}`)?.focus();
      return;
    }
    if (step < 2) {
      setStep(step + 1);
      window.setTimeout(() => formRef.current?.querySelector<HTMLElement>("h2")?.focus(), 50);
      return;
    }
    setSubmitting(true);
    const order = `WF-${Date.now().toString(36).toUpperCase().slice(-6)}`;
    try {
      sessionStorage.setItem("waveform-last-order", JSON.stringify({ order, email: d.email, total: subtotal + shippingCost, name: d.name.split(" ")[0] }));
    } catch {}
    window.setTimeout(() => {
      clear();
      router.push(`/checkout/success?order=${order}`);
    }, 900);
  };

  if (!hydrated) {
    return (
      <div className="mx-auto grid max-w-[1400px] gap-10 px-4 pt-[calc(var(--header-h)+2.5rem)] md:px-8 lg:grid-cols-[1.3fr_1fr]" aria-busy="true">
        <div className="h-[420px] animate-pulse bg-salt-deep" />
        <div className="h-[300px] animate-pulse bg-salt-deep" />
      </div>
    );
  }

  if (!lines.length) {
    return (
      <div className="mx-auto max-w-[1400px] px-4 pb-24 pt-[calc(var(--header-h)+4rem)] md:px-8">
        <h1 className="display text-[clamp(3rem,10vw,8rem)]">Bag vacío</h1>
        <p className="mt-4 max-w-[40ch] text-lg text-ink-soft">Agregá algo al bag para iniciar la compra.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/drop/low-tide" className="btn btn-primary">
            <span lang="en">Shop the drop</span>
          </Link>
          <Link href="/shop" className="btn btn-outline">
            Ver todo el shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] px-4 pb-24 pt-[calc(var(--header-h)+2rem)] md:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="display text-[clamp(2.6rem,8vw,6rem)]">Checkout</h1>
        <p className="mono mb-2 inline-flex items-center gap-1.5 text-xs text-ink-soft">
          <LockSimple size={14} weight="bold" aria-hidden /> Demo: no se procesan pagos reales
        </p>
      </div>

      <ol className="mt-8 flex flex-wrap gap-2" aria-label="Pasos del checkout">
        {STEPS.map((s, i) => (
          <li key={s} aria-current={i === step ? "step" : undefined}>
            <button
              type="button"
              disabled={i > step}
              onClick={() => i < step && setStep(i)}
              className={`flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold ${
                i === step ? "bg-ink text-salt" : i < step ? "bg-sand text-ink hover:bg-ink hover:text-salt" : "text-ink-soft shadow-[inset_0_0_0_1.5px_var(--color-line)]"
              }`}
            >
              {i < step ? <Check size={14} weight="bold" aria-hidden /> : <span className="mono">{i + 1}</span>}
              {s}
            </button>
          </li>
        ))}
      </ol>

      <div className="mt-10 grid gap-12 lg:grid-cols-[1.3fr_1fr] lg:gap-16">
        <form ref={formRef} onSubmit={next} noValidate className="order-last lg:order-none">
          <AnimatePresence mode="wait" initial={false}>
            <motion.fieldset
              key={step}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col gap-5"
            >
              <legend className="sr-only">{STEPS[step]}</legend>
              <h2 tabIndex={-1} className="display text-3xl outline-none">
                {STEPS[step]}
              </h2>

              {step === 0 && (
                <>
                  <Field id={`${uid}-email`} name="email" label="Email" type="email" required autoComplete="email" inputMode="email" spellCheck={false} placeholder="nombre@mail.com" value={d.email} onChange={set("email")} error={errors.email} hint="Te enviamos la confirmación del pedido acá." />
                  <Field id={`${uid}-name`} name="name" label="Nombre y apellido" required autoComplete="name" value={d.name} onChange={set("name")} error={errors.name} />
                  <Field id={`${uid}-phone`} name="phone" label="Teléfono" type="tel" autoComplete="tel" inputMode="tel" value={d.phone} onChange={set("phone")} error={errors.phone} hint="Solo para coordinar la entrega." />
                </>
              )}

              {step === 1 && (
                <>
                  <fieldset>
                    <legend className="text-sm font-semibold">Método de envío</legend>
                    <div className="mt-3 grid gap-2">
                      {SHIPPING_OPTIONS.map((o) => {
                        const cost = o.id === "standard" && subtotal >= FREE_SHIPPING_FROM ? 0 : o.price;
                        return (
                          <label key={o.id} className="flex min-h-14 cursor-pointer items-center gap-4 rounded-full px-5 shadow-[inset_0_0_0_1.5px_var(--color-line)] has-[:checked]:bg-ink has-[:checked]:text-salt has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ink">
                            <input type="radio" name="shipping" value={o.id} checked={d.shipping === o.id} onChange={set("shipping")} className="sr-only" />
                            <span className="flex-1">
                              <span className="font-semibold">{o.label}</span> <span className="text-sm opacity-75">{o.detail}</span>
                            </span>
                            <span className="mono text-sm">{cost ? formatPrice(cost) : "Sin costo"}</span>
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>
                  {d.shipping !== "pickup" && (
                    <>
                      <Field id={`${uid}-address`} name="address" label="Dirección" required autoComplete="street-address" value={d.address} onChange={set("address")} error={errors.address} placeholder="Calle y número…" />
                      <div className="grid gap-5 sm:grid-cols-[1.4fr_1fr]">
                        <Field id={`${uid}-city`} name="city" label="Ciudad" required autoComplete="address-level2" value={d.city} onChange={set("city")} error={errors.city} />
                        <Field id={`${uid}-zip`} name="zip" label="Código postal" required autoComplete="postal-code" value={d.zip} onChange={set("zip")} error={errors.zip} />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label htmlFor={`${uid}-country`} className="text-sm font-semibold">
                          País
                        </label>
                        <select id={`${uid}-country`} autoComplete="country-name" value={d.country} onChange={set("country")} name="country" className="h-12 rounded-full bg-salt px-5 text-base text-ink shadow-[inset_0_0_0_1.5px_var(--color-line)]">
                          {["Argentina", "Uruguay", "Chile", "Brasil", "Estados Unidos", "España"].map((c) => (
                            <option key={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}
                </>
              )}

              {step === 2 && (
                <>
                  <dl className="grid gap-4 bg-salt-deep p-5 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="mono text-xs uppercase text-ink-soft">Contacto</dt>
                      <dd className="mt-1">
                        {d.name}
                        <br />
                        <span className="break-all">{d.email}</span>
                      </dd>
                    </div>
                    <div>
                      <dt className="mono text-xs uppercase text-ink-soft">Envío</dt>
                      <dd className="mt-1">
                        {option.label}
                        <br />
                        {d.shipping === "pickup" ? option.detail : `${d.address}, ${d.city} (${d.zip}), ${d.country}`}
                      </dd>
                    </div>
                  </dl>
                  <fieldset>
                    <legend className="text-sm font-semibold">Pago (simulado)</legend>
                    <div className="mt-3 grid gap-2">
                      {[
                        { id: "card", label: "Tarjeta de crédito o débito" },
                        { id: "transfer", label: "Transferencia bancaria" },
                      ].map((o) => (
                        <label key={o.id} className="flex min-h-14 cursor-pointer items-center gap-4 rounded-full px-5 shadow-[inset_0_0_0_1.5px_var(--color-line)] has-[:checked]:bg-ink has-[:checked]:text-salt has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ink">
                          <input type="radio" name="payment" value={o.id} checked={d.payment === o.id} onChange={set("payment")} className="sr-only" />
                          <span className="font-semibold">{o.label}</span>
                        </label>
                      ))}
                    </div>
                    <p className="mt-3 text-sm text-ink-soft">En esta versión no se cobra nada. Acá se conectará la pasarela de pago (por ejemplo Mercado Pago o Stripe).</p>
                  </fieldset>
                </>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-4">
                {step > 0 && (
                  <button type="button" onClick={() => setStep(step - 1)} className="btn btn-outline">
                    <ArrowLeft size={16} weight="bold" aria-hidden /> Volver
                  </button>
                )}
                <button type="submit" className="btn btn-primary min-w-48" disabled={submitting} aria-disabled={submitting}>
                  {submitting ? "Confirmando…" : step < 2 ? "Continuar" : `Confirmar pedido · ${formatPrice(subtotal + shippingCost)}`}
                </button>
              </div>
            </motion.fieldset>
          </AnimatePresence>
        </form>

        <aside aria-label="Resumen del pedido" className="lg:sticky lg:top-[calc(var(--header-h)+2rem)] lg:self-start">
          <details className="group bg-salt-deep p-5 lg:hidden">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between font-semibold [&::-webkit-details-marker]:hidden">
              <span>Resumen ({lines.reduce((n, l) => n + l.qty, 0)})</span>
              <span className="mono">{formatPrice(subtotal + shippingCost)}</span>
            </summary>
            <div className="mt-4">
              <Summary lines={lines} shippingCost={shippingCost} />
            </div>
          </details>
          <div className="hidden bg-salt-deep p-6 lg:block">
            <h2 className="display text-2xl">Tu pedido</h2>
            <div className="mt-6">
              <Summary lines={lines} shippingCost={shippingCost} />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
