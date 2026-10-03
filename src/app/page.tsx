import { existsSync } from "node:fs";
import path from "node:path";
import { Hero } from "@/components/home/hero";
import { NewDrop } from "@/components/home/new-drop";
import { CategoryIndex } from "@/components/home/category-index";
import { BrandStory } from "@/components/home/brand-story";
import { LookbookRail } from "@/components/home/lookbook-rail";
import { Featured } from "@/components/home/featured";
import { FinalCta } from "@/components/home/final-cta";

/**
 * El hero detecta si existe /public/videos/hero.mp4.
 * En desarrollo se evalúa en cada request: basta con copiar el archivo y recargar.
 * En producción se evalúa en el build.
 */
function publicFileExists(p: string) {
  return existsSync(path.join(process.cwd(), "public", p));
}

export default function Home() {
  const hasVideo = publicFileExists("videos/hero.mp4");
  const hasMobileVideo = publicFileExists("videos/hero-mobile.mp4");
  return (
    <>
      <Hero hasVideo={hasVideo} hasMobileVideo={hasMobileVideo} />
      <NewDrop />
      <CategoryIndex />
      <BrandStory />
      <LookbookRail />
      <Featured />
      <FinalCta />
    </>
  );
}
