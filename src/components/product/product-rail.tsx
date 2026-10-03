import type { Product } from "@/content/products";
import { ProductCard } from "./product-card";
import { Reveal } from "@/components/ui/motion";

/** Rail horizontal con snap. "Wear it with" usa un bloque de color para distinguirse de las recomendaciones. */
export function ProductRail({ title, items, tone }: { title: string; items: Product[]; tone?: "sand" }) {
  if (!items.length) return null;
  const pair = items.length <= 2;
  return (
    <section aria-label={title} className={`mt-24 py-16 lg:mt-32 lg:py-24 ${tone === "sand" ? "bg-sand" : ""}`}>
      <div className="mx-auto max-w-[1400px] px-4 md:px-8">
        <Reveal>
          <h2 lang={title === "Wear it with" ? "en" : undefined} className="display text-[clamp(2.2rem,5vw,4.5rem)]">
            {title}
          </h2>
        </Reveal>
      </div>
      <ul
        className={
          pair
            ? "mx-auto mt-10 grid max-w-[1400px] grid-cols-2 gap-4 px-4 md:px-8 lg:w-[60%] lg:ml-auto lg:mr-0 lg:gap-8"
            : "scrollbar-none mx-auto mt-10 flex max-w-[1400px] snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 md:scroll-px-8 md:px-8 lg:gap-8"
        }
      >
        {items.map((p) => (
          <li key={p.slug} className={pair ? "" : "w-[70vw] shrink-0 snap-start sm:w-[42vw] lg:w-[calc((100%-6rem)/4)]"}>
            <ProductCard product={p} sizes={pair ? "(min-width: 1024px) 30vw, 50vw" : "(min-width: 1024px) 25vw, 70vw"} />
          </li>
        ))}
      </ul>
    </section>
  );
}
