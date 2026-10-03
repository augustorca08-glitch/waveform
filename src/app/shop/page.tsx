import type { Metadata } from "next";
import { products } from "@/content/products";
import { ShopView } from "@/components/shop/shop-view";
import { pickFilters } from "@/lib/filters";

export const metadata: Metadata = {
  title: "Shop",
  description: "Remeras, pantalones, swim, abrigos y camisas WAVEFORM.",
};

export default async function ShopPage({ searchParams }: PageProps<"/shop">) {
  return <ShopView items={products} initial={pickFilters(await searchParams)} />;
}
