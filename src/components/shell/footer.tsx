"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { InstagramLogo, TiktokLogo, SpotifyLogo, YoutubeLogo, ArrowRight } from "@phosphor-icons/react";
import { categories } from "@/content/products";

function Newsletter() {
  const id = useId();
  const [state, setState] = useState<"idle" | "error" | "done">("idle");
  const [email, setEmail] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      setState("error");
      return;
    }
    setState("done");
  };

  if (state === "done") {
    return (
      <div role="status" className="max-w-md">
        <p className="display text-3xl">Estás adentro.</p>
        <p className="mt-2 text-ink-soft">Te avisamos antes que a nadie cuando salga el próximo drop.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="max-w-md">
      <label htmlFor={`${id}-email`} className="display block text-[clamp(2rem,4vw,3rem)]">
        Primero en el agua.
      </label>
      <p id={`${id}-help`} className="mt-3 text-ink-soft">
        Drops, lookbooks y playlists. Un mail por mes, como mucho.
      </p>
      <div className="mt-5 flex gap-2">
        <input
          id={`${id}-email`}
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          spellCheck={false}
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (state === "error") setState("idle");
          }}
          aria-invalid={state === "error"}
          aria-describedby={`${id}-help${state === "error" ? ` ${id}-error` : ""}`}
          className="h-12 min-w-0 flex-1 rounded-full bg-salt px-5 text-base text-ink shadow-[inset_0_0_0_1.5px_var(--color-ink)] placeholder:text-ink-soft focus-visible:outline-offset-2 aria-[invalid=true]:shadow-[inset_0_0_0_2px_var(--color-sunburn)]"
        />
        <button type="submit" className="btn btn-ink shrink-0 px-5">
          Suscribirme <ArrowRight size={18} weight="bold" aria-hidden className="hidden xs:block" />
        </button>
      </div>
      {state === "error" && (
        <p id={`${id}-error`} role="alert" className="mt-2 text-sm font-semibold text-ink">
          Revisá el email: parece que falta algo.
        </p>
      )}
    </form>
  );
}

const help = [
  { href: "/checkout", label: "Checkout" },
  { href: "/about#envios", label: "Envíos" },
  { href: "/about#cambios", label: "Cambios y devoluciones" },
  { href: "/about#talles", label: "Guía de talles" },
  { href: "/about#contacto", label: "Contacto" },
];
const brand = [
  { href: "/about", label: "Nuestra historia" },
  { href: "/lookbook", label: "Lookbook" },
  { href: "/drop/low-tide", label: "Low Tide" },
];
const social = [
  { href: "https://instagram.com", label: "Instagram", Icon: InstagramLogo },
  { href: "https://tiktok.com", label: "TikTok", Icon: TiktokLogo },
  { href: "https://open.spotify.com", label: "Spotify", Icon: SpotifyLogo },
  { href: "https://youtube.com", label: "YouTube", Icon: YoutubeLogo },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-line bg-salt text-ink">
      <div className="mx-auto grid max-w-[1400px] grid-cols-[minmax(0,1fr)] gap-14 px-4 pb-10 pt-16 md:px-8 lg:grid-cols-[1.2fr_2fr] lg:pt-24">
        <Newsletter />
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
          <nav aria-label="Shop">
            <h2 className="mono text-xs uppercase text-ink-soft">Shop</h2>
            <ul className="mt-4 space-y-2.5">
              {categories.map((c) => (
                <li key={c.id}>
                  <Link href={`/shop/${c.id}`} className="link-draw">
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Ayuda">
            <h2 className="mono text-xs uppercase text-ink-soft">Ayuda</h2>
            <ul className="mt-4 space-y-2.5">
              {help.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="link-draw">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Marca">
            <h2 className="mono text-xs uppercase text-ink-soft">Marca</h2>
            <ul className="mt-4 space-y-2.5">
              {brand.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="link-draw">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <h2 className="mono text-xs uppercase text-ink-soft">Seguinos</h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {social.map(({ href, label, Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="grid h-11 w-11 place-items-center rounded-full shadow-[inset_0_0_0_1.5px_var(--color-line)] transition-colors hover:bg-ink hover:text-salt"
                  >
                    <Icon size={20} weight="bold" aria-hidden />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3 px-4 pb-6 text-sm text-ink-soft md:px-8">
        <p>© 2026 WAVEFORM. Marca ficticia, sitio de demostración.</p>
        <p>Precios en dólares estadounidenses.</p>
      </div>
      <p
        aria-hidden
        translate="no"
        className="display pointer-events-none -mb-[0.2em] select-none whitespace-nowrap text-center text-[13.05vw] leading-[0.8] text-ink"
      >
        Waveform
      </p>
    </footer>
  );
}
