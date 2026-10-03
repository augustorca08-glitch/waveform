/**
 * Catálogo mock de WAVEFORM.
 *
 * Las imágenes siguen la convención:
 *   /public/media/products/{slug}/{colorId}-{n}.jpg   (4:5, 1600×2000)
 *   n = 1 frente · 2 espalda · 3 detalle
 * Para reemplazar un placeholder, sobrescribí el archivo con el mismo nombre.
 * El stock es mock: se usa para tachar talles agotados y mostrar "Quedan N".
 */

export type CategoryId = "tees" | "pants" | "swim" | "outerwear" | "shirts";

export type Category = {
  id: CategoryId;
  label: string;
  /** Statement gráfico (en inglés, voz de marca) */
  tagline: string;
  /** Token de color del bloque de la categoría */
  tone: "sand" | "sky" | "tide" | "ink" | "salt";
};

export const categories: Category[] = [
  { id: "tees", label: "T-Shirts", tagline: "Heavy cotton, soft by noon", tone: "sand" },
  { id: "pants", label: "Pants", tagline: "Built for boardwalks", tone: "ink" },
  { id: "swim", label: "Swim", tagline: "Salt-proof since day one", tone: "sky" },
  { id: "outerwear", label: "Outerwear", tagline: "For the dawn patrol", tone: "tide" },
  { id: "shirts", label: "Shirts", tagline: "Late sets, open collars", tone: "salt" },
];

export type ProductColor = {
  id: string;
  name: string;
  hex: string;
};

export type Product = {
  slug: string;
  name: string;
  category: CategoryId;
  price: number;
  /** Frase corta de producto */
  summary: string;
  description: string;
  materials: string;
  fit: string;
  madeFor: string;
  colors: ProductColor[];
  sizes: string[];
  /** stock[colorId][size] */
  stock: Record<string, Record<string, number>>;
  tags: ("new" | "drop" | "featured")[];
};

const TOP_SIZES = ["XS", "S", "M", "L", "XL"];
const BOTTOM_SIZES = ["28", "30", "32", "34", "36"];

const C = {
  salt: { id: "salt", name: "Salt", hex: "#E9EBE6" },
  ink: { id: "ink", name: "Ink", hex: "#1B2226" },
  sand: { id: "sand", name: "Sand", hex: "#D5C29C" },
  sky: { id: "sky", name: "Sky", hex: "#A9CADB" },
  tide: { id: "tide", name: "Tide", hex: "#1F5566" },
  sunburn: { id: "sunburn", name: "Sunburn", hex: "#F0642E" },
  kelp: { id: "kelp", name: "Kelp", hex: "#5C6B4A" },
} satisfies Record<string, ProductColor>;

/** Genera stock mock determinístico, con algunos talles agotados o bajos. */
function stockFor(colors: ProductColor[], sizes: string[], soldOut: string[] = [], low: string[] = []) {
  const out: Record<string, Record<string, number>> = {};
  colors.forEach((c, ci) => {
    out[c.id] = {};
    sizes.forEach((s, si) => {
      const key = `${c.id}:${s}`;
      out[c.id][s] = soldOut.includes(key) ? 0 : low.includes(key) ? 2 : 6 + ((ci * 3 + si * 5) % 9);
    });
  });
  return out;
}

export const products: Product[] = [
  {
    slug: "tide-heavy-tee",
    name: "Tide Heavy Tee",
    category: "tees",
    price: 48,
    summary: "La remera base de la marca. Algodón pesado, corte boxy.",
    description:
      "Tejido de 240 g que se ablanda con cada lavado y cada día de sol. Cuello de ribb grueso que no se deforma y hombro caído para moverse sin pensar.",
    materials: "100% algodón peinado, 240 g/m². Prelavada para evitar encogimiento.",
    fit: "Boxy y apenas corta. Si estás entre dos talles, elegí el menor.",
    madeFor: "Sesiones largas, la vuelta en bici, la noche en la playa.",
    colors: [C.salt, C.ink, C.sand],
    sizes: TOP_SIZES,
    stock: stockFor([C.salt, C.ink, C.sand], TOP_SIZES, ["ink:XS", "sand:XL"], ["salt:M"]),
    tags: ["new", "drop", "featured"],
  },
  {
    slug: "low-tide-graphic-tee",
    name: "Low Tide Graphic Tee",
    category: "tees",
    price: 52,
    summary: "Gráfica de la colección Low Tide estampada al agua.",
    description:
      "Estampa al agua que se integra a la tela en lugar de quedar encima. Envejece con vos: cuanto más la usás, mejor se ve.",
    materials: "100% algodón orgánico, 220 g/m². Estampa al agua.",
    fit: "Regular, largo estándar.",
    madeFor: "Todo el verano, sin excepción.",
    colors: [C.salt, C.sky],
    sizes: TOP_SIZES,
    stock: stockFor([C.salt, C.sky], TOP_SIZES, ["sky:S"], ["salt:L"]),
    tags: ["new", "drop"],
  },
  {
    slug: "offshore-pocket-tee",
    name: "Offshore Pocket Tee",
    category: "tees",
    price: 44,
    summary: "Remera con bolsillo al pecho y costuras reforzadas.",
    description:
      "Una remera simple hecha para durar. Bolsillo con doble pespunte y bajo con costura cubierta.",
    materials: "100% algodón, 200 g/m².",
    fit: "Regular.",
    madeFor: "El día a día, con o sin olas.",
    colors: [C.sand, C.tide],
    sizes: TOP_SIZES,
    stock: stockFor([C.sand, C.tide], TOP_SIZES),
    tags: [],
  },
  {
    slug: "dune-cargo-pant",
    name: "Dune Cargo Pant",
    category: "pants",
    price: 118,
    summary: "Cargo de ripstop liviano con cintura elástica.",
    description:
      "Ripstop que seca rápido, bolsillos laterales con fuelle y cordón interno. Pasa del skatepark a la cena sin cambiarte.",
    materials: "Ripstop 98% algodón, 2% elastano.",
    fit: "Relajado, pierna recta. Botamanga con ajuste.",
    madeFor: "Skate, viajes largos, días sin plan.",
    colors: [C.sand, C.ink],
    sizes: BOTTOM_SIZES,
    stock: stockFor([C.sand, C.ink], BOTTOM_SIZES, ["sand:28"], ["ink:32"]),
    tags: ["new", "drop", "featured"],
  },
  {
    slug: "boardwalk-cord-pant",
    name: "Boardwalk Cord Pant",
    category: "pants",
    price: 104,
    summary: "Corderoy de canal ancho, lavado a la piedra.",
    description: "Corderoy suave con caída amplia. El lavado a la piedra le da un color vivido desde el primer día.",
    materials: "100% algodón, corderoy 8 wales.",
    fit: "Amplio, tiro medio.",
    madeFor: "Noches frescas en la costa.",
    colors: [C.kelp, C.tide],
    sizes: BOTTOM_SIZES,
    stock: stockFor([C.kelp, C.tide], BOTTOM_SIZES, ["tide:36"]),
    tags: [],
  },
  {
    slug: "swell-boardshort",
    name: "Swell Boardshort",
    category: "swim",
    price: 78,
    summary: "Boardshort de 18 pulgadas con tela de secado rápido.",
    description:
      "Tela elástica en cuatro direcciones, cintura sin elástico con cordón y bolsillo trasero con ojal para la llave.",
    materials: "88% poliéster reciclado, 12% elastano.",
    fit: "Largo 18\". Se usa sobre la rodilla.",
    madeFor: "Remar, esperar la serie, repetir.",
    colors: [C.sunburn, C.sky],
    sizes: BOTTOM_SIZES,
    stock: stockFor([C.sunburn, C.sky], BOTTOM_SIZES, ["sunburn:36"], ["sunburn:30"]),
    tags: ["new", "drop", "featured"],
  },
  {
    slug: "reef-trunk",
    name: "Reef Trunk",
    category: "swim",
    price: 64,
    summary: "Short de baño corto con red interna.",
    description: "Corto, liviano y con cintura elástica. Para nadar, no para posar.",
    materials: "100% poliéster reciclado.",
    fit: "Corto, 15\".",
    madeFor: "Nadar hasta la boya y volver.",
    colors: [C.ink, C.sky],
    sizes: TOP_SIZES,
    stock: stockFor([C.ink, C.sky], TOP_SIZES),
    tags: ["new"],
  },
  {
    slug: "paddle-out-coach-jacket",
    name: "Paddle Out Coach Jacket",
    category: "outerwear",
    price: 168,
    summary: "Coach jacket rompeviento con forro de malla.",
    description:
      "Nylon repelente al agua, broches metálicos y forro de malla que respira. Para la primera hora del día, cuando el viento todavía está frío.",
    materials: "100% nylon con acabado DWR. Forro 100% poliéster.",
    fit: "Regular, un poco amplio para usar sobre buzo.",
    madeFor: "Dawn patrol y noches con viento.",
    colors: [C.ink, C.tide],
    sizes: TOP_SIZES,
    stock: stockFor([C.ink, C.tide], TOP_SIZES, ["tide:XS"], ["ink:L"]),
    tags: ["drop", "featured"],
  },
  {
    slug: "fog-bank-fleece",
    name: "Fog Bank Fleece",
    category: "outerwear",
    price: 142,
    summary: "Polar de pelo alto con bolsillo canguro.",
    description: "Abrigo sin peso. El polar retiene el calor aunque esté húmedo.",
    materials: "100% poliéster reciclado, polar de 300 g.",
    fit: "Boxy.",
    madeFor: "Salir del agua y seguir mirando el mar.",
    colors: [C.salt, C.sand],
    sizes: TOP_SIZES,
    stock: stockFor([C.salt, C.sand], TOP_SIZES, ["salt:XL"]),
    tags: ["new"],
  },
  {
    slug: "nightset-camp-shirt",
    name: "Nightset Camp Shirt",
    category: "shirts",
    price: 86,
    summary: "Camisa de cuello abierto en rayón con caída fluida.",
    description: "Cuello campero, botones de nácar sintético y caída que se mueve con el viento.",
    materials: "100% rayón.",
    fit: "Relajado, manga corta.",
    madeFor: "Fiestas en la playa y la última luz del día.",
    colors: [C.tide, C.salt],
    sizes: TOP_SIZES,
    stock: stockFor([C.tide, C.salt], TOP_SIZES, [], ["tide:M"]),
    tags: ["new", "drop", "featured"],
  },
  {
    slug: "linen-drift-shirt",
    name: "Linen Drift Shirt",
    category: "shirts",
    price: 92,
    summary: "Camisa de lino lavado, manga larga.",
    description: "Lino que se arruga lindo. Fresca al mediodía, suficiente al atardecer.",
    materials: "100% lino lavado.",
    fit: "Oversize.",
    madeFor: "Viajes al sur y siestas largas.",
    colors: [C.sky, C.sand],
    sizes: TOP_SIZES,
    stock: stockFor([C.sky, C.sand], TOP_SIZES, ["sand:XS"]),
    tags: [],
  },
];

export const IMAGES_PER_COLOR = 3;

export function productImage(slug: string, colorId: string, n: number) {
  return `/media/products/${slug}/${colorId}-${n}.jpg`;
}

export function productImages(p: Product, colorId: string) {
  return Array.from({ length: IMAGES_PER_COLOR }, (_, i) => productImage(p.slug, colorId, i + 1));
}

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}

export function getCategory(id: string) {
  return categories.find((c) => c.id === id);
}

export function productsByCategory(id: CategoryId) {
  return products.filter((p) => p.category === id);
}

export function stockOf(p: Product, colorId: string, size: string) {
  return p.stock[colorId]?.[size] ?? 0;
}

export function isSoldOut(p: Product) {
  return Object.values(p.stock).every((sizes) => Object.values(sizes).every((n) => n === 0));
}

export function relatedProducts(p: Product, n = 4) {
  const same = products.filter((x) => x.slug !== p.slug && x.category === p.category);
  const rest = products.filter((x) => x.slug !== p.slug && x.category !== p.category && x.tags.includes("featured"));
  return [...same, ...rest].slice(0, n);
}

/** "Wear it with": combina una pieza de arriba con una de abajo. */
export function completeTheLook(p: Product, n = 2) {
  const isTop = ["tees", "shirts", "outerwear"].includes(p.category);
  const pool = products.filter(
    (x) => x.slug !== p.slug && (isTop ? ["pants", "swim"] : ["tees", "shirts", "outerwear"]).includes(x.category),
  );
  return pool.filter((x) => x.tags.includes("featured")).concat(pool).filter((x, i, a) => a.indexOf(x) === i).slice(0, n);
}
