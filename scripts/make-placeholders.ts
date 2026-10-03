/**
 * Genera placeholders locales y claramente identificables para cada slot de imagen.
 * Uso: node scripts/make-placeholders.ts [--force]
 *
 * No sobrescribe archivos existentes salvo con --force, así tus fotos reales quedan a salvo.
 */
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { products, productImage, IMAGES_PER_COLOR, categories } from "../src/content/products.ts";
import * as media from "../src/content/media.ts";

const ROOT = path.resolve(import.meta.dirname, "..", "public");
const FORCE = process.argv.includes("--force");

let written = 0;
let skipped = 0;

async function write(publicPath: string, svg: string, w: number, h: number) {
  const out = path.join(ROOT, publicPath);
  if (existsSync(out) && !FORCE) {
    skipped++;
    return;
  }
  mkdirSync(path.dirname(out), { recursive: true });
  await sharp(Buffer.from(svg)).resize(w, h).jpeg({ quality: 80, mozjpeg: true }).toFile(out);
  written++;
}

function hexToRgb(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function shade(hex: string, amt: number) {
  const [r, g, b] = hexToRgb(hex).map((c) => Math.max(0, Math.min(255, Math.round(c + amt * 255))));
  return `rgb(${r},${g},${b})`;
}
function isDark(hex: string) {
  const [r, g, b] = hexToRgb(hex);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 140;
}
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

function label(lines: string[], w: number, h: number, color: string) {
  const size = Math.round(Math.min(w, h) * 0.022);
  const x = Math.round(w * 0.05);
  const y0 = h - Math.round(h * 0.05) - (lines.length - 1) * size * 1.5;
  return lines
    .map(
      (l, i) =>
        `<text x="${x}" y="${y0 + i * size * 1.5}" font-family="Consolas, 'Courier New', monospace" font-size="${size}" fill="${color}" letter-spacing="2">${esc(l)}</text>`,
    )
    .join("");
}

function productSvg(opts: { hex: string; view: number; word: string; lines: string[]; w: number; h: number }) {
  const { hex, view, word, lines, w, h } = opts;
  const dark = isDark(hex);
  const ink = dark ? "rgba(255,255,255,0.72)" : "rgba(14,20,23,0.7)";
  const ghost = dark ? "rgba(255,255,255,0.08)" : "rgba(14,20,23,0.07)";
  const light = view === 2 ? "78% 18%" : "22% 14%";
  const [lx, ly] = light.split(" ").map((v) => parseFloat(v) / 100);
  const pattern =
    view === 3
      ? `<defs><pattern id="weave" width="18" height="18" patternUnits="userSpaceOnUse" patternTransform="rotate(38)"><rect width="18" height="18" fill="none"/><line x1="0" y1="0" x2="0" y2="18" stroke="${ghost}" stroke-width="7"/></pattern></defs><rect width="${w}" height="${h}" fill="url(#weave)"/>`
      : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <radialGradient id="l" cx="${lx}" cy="${ly}" r="1.1">
      <stop offset="0" stop-color="${shade(hex, view === 2 ? 0.02 : 0.1)}"/>
      <stop offset="0.6" stop-color="${hex}"/>
      <stop offset="1" stop-color="${shade(hex, -0.12)}"/>
    </radialGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#l)"/>
  ${pattern}
  <text x="${w / 2}" y="${h * 0.56}" text-anchor="middle" transform="rotate(-5 ${w / 2} ${h / 2})" font-family="'Arial Black', Arial, sans-serif" font-weight="900" font-size="${Math.min(w * 0.24, (w * 1.35) / Math.max(1, word.length))}" fill="${ghost}">${esc(word)}</text>
  ${label(lines, w, h, ink)}
</svg>`;
}

type Scene = { sky: [string, string]; sea: string; sand: string; horizon: number; shore: number; sun?: [number, number, number, string] };
const SCENES: Scene[] = [
  { sky: ["#9FC4D6", "#E6ECE8"], sea: "#1F5566", sand: "#D5C29C", horizon: 0.46, shore: 0.72, sun: [0.72, 0.3, 0.05, "#F4F0E4"] },
  { sky: ["#23384A", "#F08A5A"], sea: "#17495A", sand: "#6B5A45", horizon: 0.55, shore: 0.8, sun: [0.3, 0.5, 0.07, "#FF5B1F"] },
  { sky: ["#C9DCE4", "#EEF0EC"], sea: "#3F7482", sand: "#E0D2B2", horizon: 0.36, shore: 0.6 },
  { sky: ["#F2B38A", "#F6E2C9"], sea: "#2A5E6E", sand: "#C9B389", horizon: 0.5, shore: 0.74, sun: [0.55, 0.44, 0.09, "#FF7A3D"] },
  { sky: ["#7FA9BE", "#DCE8EC"], sea: "#123D4B", sand: "#B8A57F", horizon: 0.62, shore: 0.86 },
  { sky: ["#0E1417", "#29485A"], sea: "#0F2F3A", sand: "#3A3430", horizon: 0.58, shore: 0.84, sun: [0.8, 0.22, 0.03, "#EEF0EC"] },
];

function sceneSvg(i: number, w: number, h: number, lines: string[] | null) {
  const s = SCENES[i % SCENES.length];
  const hy = h * s.horizon;
  const sy = h * s.shore;
  const wave = (y: number, amp: number, seed: number) => {
    let d = `M0 ${y}`;
    const steps = 8;
    for (let k = 1; k <= steps; k++) {
      const x = (w / steps) * k;
      const cy = y + Math.sin(k * 1.7 + seed) * amp;
      d += ` Q ${x - w / steps / 2} ${cy + amp} ${x} ${cy}`;
    }
    return `${d} L ${w} ${h} L 0 ${h} Z`;
  };
  const labelColor = isDark(s.sand) ? "rgba(238,240,236,0.8)" : "rgba(14,20,23,0.72)";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${s.sky[0]}"/><stop offset="1" stop-color="${s.sky[1]}"/></linearGradient>
    <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${shade(s.sea, 0.08)}"/><stop offset="1" stop-color="${shade(s.sea, -0.06)}"/></linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#sky)"/>
  ${s.sun ? `<circle cx="${w * s.sun[0]}" cy="${h * s.sun[1]}" r="${Math.max(w, h) * s.sun[2]}" fill="${s.sun[3]}"/>` : ""}
  <rect y="${hy}" width="${w}" height="${h - hy}" fill="url(#sea)"/>
  <path d="${wave(hy + (sy - hy) * 0.55, h * 0.006, i)}" fill="${shade(s.sea, 0.14)}" opacity="0.5"/>
  <path d="${wave(sy - h * 0.02, h * 0.008, i + 2)}" fill="#EEF0EC" opacity="0.55"/>
  <path d="${wave(sy, h * 0.01, i + 1)}" fill="${s.sand}"/>
  ${lines ? label(lines, w, h, labelColor) : ""}
</svg>`;
}

const ratio = (w: number, h: number) => {
  const g = (a: number, b: number): number => (b ? g(b, a % b) : a);
  const d = g(w, h);
  return `${w / d}:${h / d}`;
};

async function main() {
  // Productos
  for (const p of products) {
    const cat = categories.find((c) => c.id === p.category)!;
    for (const color of p.colors) {
      for (let n = 1; n <= IMAGES_PER_COLOR; n++) {
        const view = ["FRENTE", "ESPALDA", "DETALLE"][n - 1];
        await write(
          productImage(p.slug, color.id, n),
          productSvg({
            hex: color.hex,
            view: n,
            word: cat.label.toUpperCase().replace("T-SHIRTS", "TEE"),
            lines: ["PRODUCT PLACEHOLDER", `${p.name} / ${color.name}`, `${view} · 4:5 · 1600×2000`],
            w: 1600,
            h: 2000,
          }),
          1600,
          2000,
        );
      }
    }
  }

  // Slots editoriales
  const slots: [string, media.MediaSlot][] = [
    ["drop-lead", media.drop.lead],
    ...Object.entries(media.categoryMedia).map(([k, v]) => [`category-${k}`, v] as [string, media.MediaSlot]),
    ...media.lookbook.map((v, i) => [`lookbook-0${i + 1}`, v] as [string, media.MediaSlot]),
    ["story-polaroid", media.story.polaroid],
    ["cta-final", media.finalCta.desktop],
    ["cta-final-mobile", media.finalCta.mobile],
    ["about-studio", media.about.lead],
  ];
  let i = 0;
  for (const [name, s] of slots) {
    await write(s.src, sceneSvg(i++, s.w, s.h, ["LIFESTYLE PLACEHOLDER", name, `${ratio(s.w, s.h)} · ${s.w}×${s.h}`]), s.w, s.h);
  }

  // Macros de detalle: usan la textura de producto
  const macro: [media.MediaSlot, string][] = [
    [media.details.fabric, "#D5C29C"],
    [media.details.stitch, "#1F5566"],
    [media.details.label, "#E9EBE6"],
  ];
  for (const [s, hex] of macro) {
    await write(s.src, productSvg({ hex, view: 3, word: "", lines: ["DETAIL PLACEHOLDER", s.src.split("/").pop()!, "1:1 · 1400×1400"], w: s.w, h: s.h }), s.w, s.h);
  }

  // Poster del hero: sin etiqueta incrustada (la etiqueta de desarrollo la pone el componente)
  await write(media.hero.poster.src, sceneSvg(1, 1920, 1080, null), 1920, 1080);

  console.log(`Placeholders: ${written} generados, ${skipped} existentes preservados.`);
}

main();
