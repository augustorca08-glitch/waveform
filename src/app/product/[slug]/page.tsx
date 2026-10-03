import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { completeTheLook, getProduct, productImage, products, relatedProducts, isSoldOut } from "@/content/products";
import { ProductView } from "@/components/product/product-view";
import { ProductRail } from "@/components/product/product-rail";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/product/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = getProduct(slug);
  if (!p) return {};
  return {
    title: p.name,
    description: p.summary,
    openGraph: { images: [productImage(p.slug, p.colors[0].id, 1)] },
  };
}

export default async function ProductPage({ params, searchParams }: PageProps<"/product/[slug]">) {
  const { slug } = await params;
  const p = getProduct(slug);
  if (!p) notFound();
  const { color } = await searchParams;
  const initialColor = typeof color === "string" && p.colors.some((c) => c.id === color) ? color : p.colors[0].id;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.description,
    image: p.colors.map((c) => productImage(p.slug, c.id, 1)),
    brand: { "@type": "Brand", name: "WAVEFORM" },
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: p.price,
      availability: isSoldOut(p) ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\u003c") }} />
      <ProductView key={p.slug} product={p} initialColor={initialColor} />
      <ProductRail title="Wear it with" items={completeTheLook(p)} tone="sand" />
      <ProductRail title="También te puede gustar" items={relatedProducts(p)} />
    </>
  );
}
