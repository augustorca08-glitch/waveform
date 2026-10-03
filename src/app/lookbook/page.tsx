import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { lookbook } from "@/content/media";
import { MaskReveal, Reveal } from "@/components/ui/motion";
import { fitDisplay } from "@/lib/type";

export const metadata: Metadata = {
  title: "Lookbook",
  description: "Ocho días en la costa con la colección Low Tide.",
};

/** Collage: cada foto tiene su lugar en la grilla, con cruces y desalineados intencionales. */
const spans = [
  "lg:col-span-5 lg:col-start-1",
  "lg:col-span-6 lg:col-start-7 lg:mt-40",
  "lg:col-span-4 lg:col-start-3 lg:-mt-10",
  "lg:col-span-4 lg:col-start-8 lg:-mt-32",
  "lg:col-span-10 lg:col-start-2",
  "lg:col-span-4 lg:col-start-1",
  "lg:col-span-5 lg:col-start-6 lg:mt-24",
  "lg:col-span-8 lg:col-start-5 lg:-mt-16",
];
const mobile = ["", "w-[82%] ml-auto", "w-[70%]", "w-[88%] ml-auto", "", "w-[76%]", "w-[84%] ml-auto", ""];

export default function LookbookPage() {
  return (
    <div className="mx-auto max-w-[1400px] px-4 pb-24 pt-[calc(var(--header-h)+2.5rem)] md:px-8">
      <Reveal>
        <h1 className="display" style={fitDisplay("Lookbook", 15, 88, 13)}>
          Lookbook
        </h1>
        <p className="mt-6 max-w-[44ch] text-lg leading-snug">Ocho días en la costa con la colección Low Tide. Sin estudio, sin maquillaje, con marea baja.</p>
      </Reveal>
      <ul className="mt-16 flex flex-col gap-10 lg:grid lg:grid-cols-12 lg:gap-x-8 lg:gap-y-20">
        {lookbook.map((m, i) => (
          <li key={m.src} className={`${spans[i]} ${mobile[i]} lg:ml-0 lg:w-auto`}>
            <figure>
              <MaskReveal className="relative overflow-hidden bg-salt-deep" style={{ aspectRatio: `${m.w} / ${m.h}` }} from={i % 2 ? "right" : "bottom"}>
                <Image src={m.src} alt={m.alt} fill sizes="(min-width: 1024px) 60vw, 90vw" className="object-cover" />
              </MaskReveal>
              <figcaption className="mt-2 text-sm text-ink-soft">{m.caption}</figcaption>
            </figure>
          </li>
        ))}
      </ul>
      <div className="mt-24 flex flex-wrap items-center gap-4">
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
