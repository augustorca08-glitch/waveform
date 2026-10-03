import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { categories, getCategory, productsByCategory } from "@/content/products";
import { ShopView } from "@/components/shop/shop-view";
import { pickFilters } from "@/lib/filters";

export function generateStaticParams() {
  return categories.map((c) => ({ category: c.id }));
}

export async function generateMetadata({ params }: PageProps<"/shop/[category]">): Promise<Metadata> {
  const { category } = await params;
  const cat = getCategory(category);
  return cat ? { title: cat.label, description: `${cat.label} WAVEFORM. ${cat.tagline}.` } : {};
}

export default async function CategoryPage({ params, searchParams }: PageProps<"/shop/[category]">) {
  const { category } = await params;
  const cat = getCategory(category);
  if (!cat) notFound();
  return <ShopView items={productsByCategory(cat.id)} category={cat.id} initial={pickFilters(await searchParams)} />;
}
