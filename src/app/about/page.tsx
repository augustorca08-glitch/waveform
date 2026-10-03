import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { about, story } from "@/content/media";
import { FREE_SHIPPING_FROM, SHIPPING_OPTIONS, formatPrice, whatsappLink } from "@/lib/site";
import { MaskReveal, Reveal } from "@/components/ui/motion";

export const metadata: Metadata = {
  title: "About",
  description: "WAVEFORM hace ropa para días largos de agua salada, ruedas y música fuerte.",
};

const values = [
  { title: "Telas que aguantan", body: "Elegimos algodones pesados, nylon reciclado y lino lavado. Si no sobrevive un verano entero, no sale.", tone: "bg-sand" },
  { title: "Tiradas cortas", body: "Hacemos pocas unidades por drop. Cuando algo se agota, casi nunca vuelve igual.", tone: "bg-sky" },
  { title: "Hecho cerca", body: "Trabajamos con talleres chicos que conocemos por nombre. Visitamos cada uno antes de producir.", tone: "bg-salt-deep" },
];

export default function AboutPage() {
  return (
    <>
      <section className="mx-auto max-w-[1400px] px-4 pb-16 pt-[calc(var(--header-h)+2.5rem)] md:px-8">
        <Reveal>
          <h1 className="display max-w-[14ch] text-[clamp(3rem,10vw,9rem)]">Sal en la piel, sin apuro</h1>
        </Reveal>
        <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:items-end">
          <Reveal delay={0.1}>
            <p className="max-w-[46ch] text-lg leading-snug">
              WAVEFORM empezó en una van, con dos tablas y un parlante. Hoy seguimos haciendo lo mismo: ropa para la gente que pasa el verano entre el agua, el skatepark y la música.
            </p>
          </Reveal>
          <MaskReveal className="relative aspect-[16/9] overflow-hidden bg-salt-deep">
            <Image src={about.lead.src} alt={about.lead.alt} fill preload sizes="(min-width: 1024px) 58vw, 100vw" className="object-cover" />
          </MaskReveal>
        </div>
      </section>

      <section aria-labelledby="values-title" className="mx-auto max-w-[1400px] px-4 py-16 md:px-8">
        <h2 id="values-title" className="sr-only">
          Cómo trabajamos
        </h2>
        <ul className="grid gap-4 md:grid-cols-[1.2fr_1fr] lg:grid-cols-[1.3fr_1fr_1fr]">
          {values.map((v, i) => (
            <Reveal as="li" key={v.title} delay={i * 0.08} className={`${v.tone} p-6 md:p-8 ${i === 0 ? "md:row-span-2 lg:row-span-1" : ""} ${i === 2 ? "lg:mt-16" : ""}`}>
              <h3 className="display text-[clamp(1.8rem,3vw,2.6rem)]">{v.title}</h3>
              <p className="mt-4 max-w-[36ch]">{v.body}</p>
            </Reveal>
          ))}
        </ul>
      </section>

      <section aria-label="Información de compra" className="mx-auto grid max-w-[1400px] grid-cols-[minmax(0,1fr)] gap-16 px-4 py-20 md:px-8 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="relative mx-auto w-[70%] max-w-[320px] -rotate-3 bg-salt p-3 pb-12 shadow-[0_30px_50px_-30px_rgb(14_20_23_/_0.55)] lg:mx-0">
          <div className="relative aspect-[6/7] overflow-hidden bg-salt-deep">
            <Image src={story.polaroid.src} alt={story.polaroid.alt} fill sizes="320px" className="object-cover" />
          </div>
        </div>
        <div className="flex flex-col gap-12">
          <div id="envios" className="scroll-mt-24">
            <h2 className="display text-[clamp(1.4rem,6.4vw,1.875rem)]">Envíos</h2>
            <p className="mt-3 max-w-[52ch] text-ink-soft">Despachamos en 24 horas hábiles. Envío gratis en compras desde {formatPrice(FREE_SHIPPING_FROM)}.</p>
            <ul className="mt-4 grid gap-2">
              {SHIPPING_OPTIONS.map((o) => (
                <li key={o.id} className="flex flex-wrap justify-between gap-2 bg-salt-deep px-4 py-3">
                  <span>
                    <strong>{o.label}</strong> <span className="text-ink-soft">{o.detail}</span>
                  </span>
                  <span className="mono">{o.price ? formatPrice(o.price) : "Sin costo"}</span>
                </li>
              ))}
            </ul>
          </div>
          <div id="cambios" className="scroll-mt-24">
            <h2 className="display text-[clamp(1.4rem,6.4vw,1.875rem)]">Cambios y devoluciones</h2>
            <p className="mt-3 max-w-[52ch] text-ink-soft">Tenés 30 días para cambiar talle o color sin costo. La prenda tiene que estar sin uso y con etiqueta.</p>
          </div>
          <div id="talles" className="scroll-mt-24">
            <h2 className="display text-[clamp(1.4rem,6.4vw,1.875rem)]">Guía de talles</h2>
            <p className="mt-3 max-w-[52ch] text-ink-soft">Cada producto tiene su tabla de medidas en la página del producto. Si estás entre dos talles, escribinos y te ayudamos a elegir.</p>
          </div>
          <div id="contacto" className="scroll-mt-24">
            <h2 className="display text-[clamp(1.4rem,6.4vw,1.875rem)]">Contacto</h2>
            <p className="mt-3 max-w-[52ch] text-ink-soft">Respondemos de lunes a viernes, de 10 a 18 h.</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a href={whatsappLink("Hola WAVEFORM, tengo una consulta.")} target="_blank" rel="noopener noreferrer" className="btn btn-ink">
                Escribinos por WhatsApp
              </a>
              <a href="mailto:hola@waveform.example" className="btn btn-outline max-w-full whitespace-normal break-all">
                hola@waveform.example
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-4 pb-24 md:px-8">
        <Link href="/drop/low-tide" className="btn btn-primary">
          <span lang="en">Shop the drop</span>
        </Link>
      </section>
    </>
  );
}
