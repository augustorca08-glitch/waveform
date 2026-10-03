import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { products, productImage } from "@/content/products";
import { lookbook } from "@/content/media";
import { formatPrice } from "@/lib/site";
import { DropHero } from "@/components/drop/drop-hero";
import { MaskReveal, Reveal } from "@/components/ui/motion";
import { ProductCard } from "@/components/product/product-card";

export const metadata: Metadata = {
  title: "Low Tide · Summer 27",
  description: "La nueva colección WAVEFORM: seis piezas para la marea baja.",
};

/** Cada pieza tiene su propia composición: la colección se presenta como un editorial, no como una grilla. */
const compositions = [
  "lg:grid-cols-[1.3fr_1fr] lg:items-end",
  "lg:grid-cols-[1fr_1.1fr] lg:items-center lg:[&>*:first-child]:order-last",
  "lg:grid-cols-[0.8fr_1.2fr] lg:items-start",
];

export default function DropPage() {
  const drop = products.filter((p) => p.tags.includes("drop"));
  const hero = drop.slice(0, 3);
  const rest = drop.slice(3);
  return (
    <>
      <DropHero />
      <div className="mx-auto max-w-[1400px] px-4 py-20 md:px-8 lg:py-32">
        <div className="flex flex-col gap-24 lg:gap-40">
          {hero.map((p, i) => {
            const c = p.colors[0];
            return (
              <article key={p.slug} className={`grid gap-8 lg:gap-16 ${compositions[i]}`}>
                <Link href={`/product/${p.slug}?color=${c.id}`} data-cursor="View" className={`group relative block overflow-hidden bg-salt-deep ${i === 1 ? "aspect-[3/4]" : "aspect-[4/5]"}`}>
                  <MaskReveal className="absolute inset-0">
                    <Image src={productImage(p.slug, c.id, 1)} alt={`${p.name} en ${c.name}`} fill sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
                  </MaskReveal>
                </Link>
                <Reveal>
                  <h2 className="display text-[clamp(2.6rem,6vw,5.5rem)]">{p.name}</h2>
                  <p className="mono mt-4 text-lg">{formatPrice(p.price)}</p>
                  <p className="mt-4 max-w-[42ch] text-lg leading-snug">{p.description}</p>
                  <div className="mt-6 flex flex-wrap items-center gap-4">
                    <Link href={`/product/${p.slug}?color=${c.id}`} className="btn btn-ink">
                      Ver producto
                    </Link>
                    <span className="flex gap-1.5" aria-label={`Disponible en ${p.colors.map((x) => x.name).join(", ")}`}>
                      {p.colors.map((x) => (
                        <span key={x.id} className="h-5 w-5 rounded-full shadow-[inset_0_0_0_1px_rgb(14_20_23_/_0.25)]" style={{ background: x.hex }} />
                      ))}
                    </span>
                  </div>
                </Reveal>
              </article>
            );
          })}
        </div>
      </div>

      <section aria-labelledby="drop-mood" className="relative h-[80dvh] min-h-[480px] overflow-hidden">
        <Image src={lookbook[5].src} alt={lookbook[5].alt} fill sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgb(14_20_23_/_0.55))]" />
        <h2 id="drop-mood" lang="en" className="display absolute bottom-8 left-4 max-w-[10ch] text-[clamp(2.8rem,8vw,7rem)] text-salt md:left-8">
          Salt proof
        </h2>
      </section>

      <section aria-labelledby="drop-rest" className="mx-auto max-w-[1400px] px-4 py-20 md:px-8 lg:py-28">
        <h2 id="drop-rest" className="display text-[clamp(2.4rem,6vw,5rem)]">
          El resto del drop
        </h2>
        <ul className="mt-12 grid grid-cols-2 gap-x-4 gap-y-12 md:gap-x-6 lg:grid-cols-3 lg:gap-x-8">
          {rest.map((p, i) => (
            <Reveal as="li" key={p.slug} delay={i * 0.08} className={i === 1 ? "lg:mt-20" : ""}>
              <ProductCard product={p} sizes="(min-width: 1024px) 30vw, 50vw" />
            </Reveal>
          ))}
        </ul>
        <Link href="/shop" className="btn btn-outline mt-16">
          Ver todo el shop
        </Link>
      </section>
    </>
  );
}
