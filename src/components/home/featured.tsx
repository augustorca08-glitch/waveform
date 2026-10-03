import Link from "next/link";
import { products } from "@/content/products";
import { ProductCard } from "@/components/product/product-card";
import { Reveal } from "@/components/ui/motion";

/** Grilla escalonada 2fr/1fr/1fr: una pieza protagonista y cuatro que la acompañan a distintas alturas. */
const placement = [
  { cls: "col-span-2 lg:col-span-1 lg:row-span-2", sizes: "(min-width: 1024px) 45vw, 100vw", ratio: "aspect-[4/5]" },
  { cls: "lg:mt-24", sizes: "(min-width: 1024px) 22vw, 50vw", ratio: "aspect-[4/5]" },
  { cls: "mt-12 lg:mt-48", sizes: "(min-width: 1024px) 22vw, 50vw", ratio: "aspect-[3/4]" },
  { cls: "lg:-mt-6", sizes: "(min-width: 1024px) 22vw, 50vw", ratio: "aspect-[3/4]" },
  { cls: "mt-12 lg:mt-14", sizes: "(min-width: 1024px) 22vw, 50vw", ratio: "aspect-[4/5]" },
];

export function Featured() {
  const featured = products.filter((p) => p.tags.includes("featured")).slice(0, placement.length);
  return (
    <section aria-labelledby="featured-title" className="bg-salt px-4 py-20 md:px-8 lg:py-32">
      <div className="mx-auto max-w-[1400px]">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Reveal>
            <h2 id="featured-title" lang="en" className="display text-[clamp(2.6rem,7vw,6.5rem)]">
              Summer
              <br />
              staples
            </h2>
          </Reveal>
          <Link href="/shop" className="link-draw mb-2 font-semibold">
            Ver todo el shop
          </Link>
        </div>
        <ul className="mt-12 grid grid-cols-2 gap-x-4 gap-y-12 md:gap-x-6 lg:mt-16 lg:grid-cols-[2fr_1fr_1fr] lg:gap-x-8">
          {featured.map((p, i) => (
            <Reveal as="li" key={p.slug} delay={(i % 3) * 0.08} className={placement[i].cls}>
              <ProductCard product={p} sizes={placement[i].sizes} ratio={placement[i].ratio} />
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
