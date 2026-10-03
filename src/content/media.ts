/**
 * Manifiesto de media de WAVEFORM.
 *
 * Cada slot editorial del sitio vive acá. Para usar tus fotos reales:
 *   1. Sobrescribí el archivo en /public con el mismo nombre, o
 *   2. Cambiá `src` acá apuntando a tu archivo.
 * Mantené el ratio indicado (w/h) para que las composiciones no se rompan.
 * Los archivos actuales son placeholders generados por scripts/make-placeholders.mjs.
 */

export type MediaSlot = {
  src: string;
  alt: string;
  w: number;
  h: number;
  /** object-position para recortes responsivos */
  focus?: string;
};

const slot = (src: string, w: number, h: number, alt: string, focus?: string): MediaSlot => ({ src, w, h, alt, focus });

export const hero = {
  /** Colocá tu video acá. Si no existe, el hero usa el poster. */
  video: "/videos/hero.mp4",
  /** Opcional: corte vertical para mobile. Si no existe, se usa hero.mp4 */
  videoMobile: "/videos/hero-mobile.mp4",
  poster: slot("/videos/hero-poster.jpg", 1920, 1080, "", "50% 60%"),
};

export const drop = {
  lead: slot("/media/drop/low-tide-lead.jpg", 1600, 2000, "Surfista caminando por la orilla con la Paddle Out Coach Jacket al atardecer"),
};

export const categoryMedia: Record<string, MediaSlot> = {
  tees: slot("/media/categories/tees.jpg", 1500, 2000, "Remeras Tide Heavy Tee dobladas sobre una tabla"),
  pants: slot("/media/categories/pants.jpg", 1920, 1080, "Skater con el Dune Cargo Pant en una rampa de hormigón"),
  swim: slot("/media/categories/swim.jpg", 1600, 2000, "Boardshort Swell mojado a la salida del agua"),
  outerwear: slot("/media/categories/outerwear.jpg", 1920, 1080, "Coach jacket con viento en la costa al amanecer"),
  shirts: slot("/media/categories/shirts.jpg", 1500, 2000, "Camisa Nightset abierta en una fiesta en la playa"),
};

export const lookbook: (MediaSlot & { caption: string })[] = [
  { ...slot("/media/lookbook/look-01.jpg", 1600, 2000, "Dos amigos con tablas bajo el brazo caminando hacia el mar"), caption: "Tide Heavy Tee en Salt, Dune Cargo en Sand" },
  { ...slot("/media/lookbook/look-02.jpg", 1920, 1080, "Estacionamiento frente al mar con una van y tablas en el techo"), caption: "Paddle Out Coach Jacket en Ink" },
  { ...slot("/media/lookbook/look-03.jpg", 1500, 2000, "Skater en un bowl con la luz de la tarde"), caption: "Offshore Pocket Tee en Tide" },
  { ...slot("/media/lookbook/look-04.jpg", 1600, 2000, "Retrato en la orilla con la Nightset Camp Shirt"), caption: "Nightset Camp Shirt en Tide" },
  { ...slot("/media/lookbook/look-05.jpg", 1920, 1080, "Serie de olas vista desde el acantilado"), caption: "Low Tide, verano 27" },
  { ...slot("/media/lookbook/look-06.jpg", 1500, 2000, "Swell Boardshort en Sunburn secándose al sol"), caption: "Swell Boardshort en Sunburn" },
  { ...slot("/media/lookbook/look-07.jpg", 1600, 2000, "Grupo alrededor de un parlante en la arena al anochecer"), caption: "Fog Bank Fleece en Salt" },
  { ...slot("/media/lookbook/look-08.jpg", 1920, 1080, "Ruta costera con tablas en bicicleta"), caption: "Linen Drift Shirt en Sky" },
];

export const story = {
  polaroid: slot("/media/story/polaroid.jpg", 1200, 1400, "Foto instantánea de un grupo de amigos sentados sobre las tablas"),
};

export const details = {
  fabric: slot("/media/details/fabric.jpg", 1400, 1400, "Primer plano de la trama del algodón pesado"),
  stitch: slot("/media/details/stitch.jpg", 1400, 1400, "Costura de doble pespunte en el bajo"),
  label: slot("/media/details/label.jpg", 1400, 1400, "Etiqueta tejida WAVEFORM en el cuello"),
};

export const finalCta = {
  desktop: slot("/media/cta/final.jpg", 1920, 1080, "Surfista remando hacia una serie al atardecer", "50% 55%"),
  mobile: slot("/media/cta/final-mobile.jpg", 1600, 2000, "Surfista remando hacia una serie al atardecer"),
};

export const about = {
  lead: slot("/media/about/studio.jpg", 1920, 1080, "Mesa de trabajo con telas, muestras de color y fotos de viaje"),
};
