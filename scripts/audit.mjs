// Auditoría técnica WAVEFORM con Playwright.
// Uso: node scripts/audit.mjs [baseURL]   (por defecto http://localhost:3200, build de producción)
// Salida: shots/playwright/*.png y shots/playwright/audit.json
import { chromium, devices } from "@playwright/test";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import sharp from "sharp";

const BASE = process.argv[2] ?? "http://localhost:3200";
const OUT = "shots/playwright";
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

const VIEWPORTS = [
  { id: "desktop-1440", width: 1440, height: 900, mobile: false },
  { id: "desktop-1280", width: 1280, height: 720, mobile: false },
  { id: "mobile-390", width: 390, height: 844, mobile: true },
  { id: "mobile-375", width: 375, height: 812, mobile: true },
];

const SLUGS = [
  "tide-heavy-tee", "low-tide-graphic-tee", "offshore-pocket-tee", "dune-cargo-pant", "boardwalk-cord-pant",
  "swell-boardshort", "reef-trunk", "paddle-out-coach-jacket", "fog-bank-fleece", "nightset-camp-shirt", "linen-drift-shirt",
];
const ROUTES = [
  "/", "/shop", "/shop/tees", "/shop/pants", "/shop/swim", "/shop/outerwear", "/shop/shirts",
  "/drop/low-tide", "/lookbook", "/about", "/checkout", "/checkout/success?order=WF-TEST", "/ruta-inexistente",
  ...SLUGS.map((s) => `/product/${s}`),
];

const issues = [];
const add = (severity, vp, route, kind, detail) => issues.push({ severity, vp, route, kind, detail });

// ---------- checks que corren dentro de la página ----------
const inPageChecks = () => {
  const vw = document.documentElement.clientWidth;
  const vh = window.innerHeight;
  const out = { overflow: document.documentElement.scrollWidth - vw, clipped: [], overlaps: [], small: [], noName: [], noAlt: [], broken: [], distorted: [], oversized: [], contrast: [], deadButtons: [] };

  const visible = (el) => {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return false;
    const closed = el.closest("details:not([open])");
    if (closed && !el.closest("summary")) return false;
    for (let a = el; a; a = a.parentElement) {
      const s = getComputedStyle(a);
      if (s.display === "none" || s.visibility === "hidden" || a.getAttribute("aria-hidden") === "true") return false;
    }
    return true;
  };
  const inScroller = (el) => {
    for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
      const s = getComputedStyle(a);
      if (["auto", "scroll"].includes(s.overflowX)) return true;
    }
    return false;
  };
  const clippedByAncestor = (el) => {
    for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
      const s = getComputedStyle(a);
      if (s.overflowX !== "visible" && s.overflowX !== "clip" ? true : s.overflowX === "clip") return a;
    }
    return null;
  };
  const label = (el) => `${el.tagName.toLowerCase()}${el.id ? "#" + el.id : ""} "${(el.textContent || el.getAttribute("aria-label") || "").trim().replace(/\s+/g, " ").slice(0, 40)}"`;

  // Hojas de texto
  const leaves = [...document.querySelectorAll("body *")].filter(
    (el) => el.childElementCount === 0 || [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()),
  ).filter((el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()) && visible(el) && !el.closest(".sr-only") && !["SCRIPT", "STYLE", "OPTION", "TITLE"].includes(el.tagName));

  for (const el of leaves) {
    const r = el.getBoundingClientRect();
    // Texto que se sale del viewport (fuera de carruseles/recortes intencionales)
    // El track del lookbook se desplaza horizontalmente a propósito (pan fijado)
    const onScreen = r.bottom > 0 && r.top < vh;
    if (onScreen && !inScroller(el) && !el.closest("section[aria-labelledby=lookbook-title] .sticky") && (r.right > vw + 1 || r.left < -1)) {
      const anc = clippedByAncestor(el);
      const ar = anc?.getBoundingClientRect();
      const cutByAncestor = anc && (r.right > ar.right + 1 || r.left < ar.left - 1);
      if (!anc || cutByAncestor) out.clipped.push(`${label(el)} left=${Math.round(r.left)} right=${Math.round(r.right)} vw=${vw}`);
    }
    // Texto recortado dentro de su propia caja
    const s = getComputedStyle(el);
    if (s.overflow !== "visible" && s.textOverflow !== "ellipsis" && el.scrollWidth > el.clientWidth + 2 && !inScroller(el)) out.clipped.push(`${label(el)} scrollW=${el.scrollWidth} clientW=${el.clientWidth}`);
  }

  // Superposición de textos (en el viewport actual)
  const fixedAncestor = (el) => { for (let a = el; a; a = a.parentElement) { const p = getComputedStyle(a).position; if (p === "fixed" || p === "sticky") return a; } return null; };
  const inView = leaves.filter((el) => { const r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < vh && parseFloat(getComputedStyle(el).opacity) > 0.05 && getComputedStyle(el).display !== "inline" && !fixedAncestor(el); });
  for (let i = 0; i < inView.length; i++) {
    for (let j = i + 1; j < inView.length; j++) {
      const a = inView[i], b = inView[j];
      if (a.contains(b) || b.contains(a)) continue;
      const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
      const ix = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left);
      const iy = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top);
      if (ix > 4 && iy > 4 && ix * iy > 0.15 * Math.min(ra.width * ra.height, rb.width * rb.height)) out.overlaps.push(`${label(a)} ⟂ ${label(b)}`);
    }
  }

  // Interactivos: tamaño y nombre accesible
  const interactive = [...document.querySelectorAll("a[href], button, input:not([type=hidden]), select, textarea, summary, [role=button], [tabindex]:not([tabindex='-1'])")];
  for (const el of interactive) {
    const isRadio = el.matches("input[type=radio], input[type=checkbox]");
    const target = isRadio ? el.closest("label") ?? el : el;
    if (!visible(target) && !(isRadio && visible(el.closest("label") ?? el))) continue;
    const r = target.getBoundingClientRect();
    const inline = el.tagName === "A" && getComputedStyle(el).display === "inline" && el.closest("p, li, dd");
    if (!inline && (r.width < 24 || r.height < 24)) out.small.push(`${label(target)} ${Math.round(r.width)}×${Math.round(r.height)}`);
    let name = el.getAttribute("aria-label") || (el.getAttribute("aria-labelledby") && document.getElementById(el.getAttribute("aria-labelledby"))?.textContent) || el.textContent?.trim() || el.getAttribute("title") || el.querySelector("img[alt]")?.getAttribute("alt") || "";
    if (el.id && document.querySelector(`label[for="${el.id}"]`)) name ||= document.querySelector(`label[for="${el.id}"]`).textContent;
    if (el.closest("label")) name ||= el.closest("label").textContent;
    if (el.getAttribute("aria-hidden") === "true" && el.tabIndex < 0) continue;
    if (!name.trim()) out.noName.push(label(el) + " " + el.outerHTML.slice(0, 90));
    // Botón sin handler de React ni submit
    if (el.tagName === "BUTTON" && !el.disabled) {
      const key = Object.keys(el).find((k) => k.startsWith("__reactProps$"));
      const props = key ? el[key] : {};
      const submits = el.type === "submit" && el.form;
      if (!props?.onClick && !props?.onPointerDown && !submits) out.deadButtons.push(label(el));
    }
  }

  // Imágenes
  for (const img of document.images) {
    if (img.getAttribute("alt") === null) out.noAlt.push(img.currentSrc || img.src);
    if (img.complete && img.naturalWidth === 0 && img.loading !== "lazy") out.broken.push(img.src);
    if (!visible(img) || !img.naturalWidth) continue;
    const r = img.getBoundingClientRect();
    const fit = getComputedStyle(img).objectFit;
    if (fit === "fill" && Math.abs(r.width / r.height - img.naturalWidth / img.naturalHeight) > 0.03) out.distorted.push(`${img.src.slice(-60)} ${Math.round(r.width)}×${Math.round(r.height)} vs ${img.naturalWidth}×${img.naturalHeight}`);
    if (img.naturalWidth > r.width * devicePixelRatio * 2.2 && img.naturalWidth > 700) out.oversized.push(`${(img.currentSrc || "").replace(/.*url=/, "").slice(0, 70)} natural=${img.naturalWidth} rendered=${Math.round(r.width)}@${devicePixelRatio}x`);
  }

  // Contraste de texto sobre fondos sólidos
  // Canvas normaliza cualquier formato (oklab, oklch, color-mix) a RGBA
  const cv = document.createElement("canvas"); cv.width = cv.height = 1; const cx = cv.getContext("2d", { willReadFrequently: true });
  const parse = (c) => { cx.clearRect(0, 0, 1, 1); cx.fillStyle = "#000"; cx.fillStyle = c; cx.fillRect(0, 0, 1, 1); const [r, g, b, a] = cx.getImageData(0, 0, 1, 1).data; return { r, g, b, a: a / 255 }; };
  const lum = ({ r, g, b }) => [r, g, b].map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }).reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0);
  const blend = (fg, bg) => ({ r: fg.r * fg.a + bg.r * (1 - fg.a), g: fg.g * fg.a + bg.g * (1 - fg.a), b: fg.b * fg.a + bg.b * (1 - fg.a), a: 1 });
  for (const el of leaves) {
    let op = 1;
    let bg = null;
    let overMedia = false;
    for (let a = el; a; a = a.parentElement) {
      const s = getComputedStyle(a);
      op *= parseFloat(s.opacity);
      if (!bg) {
        if (s.backgroundImage !== "none") { overMedia = true; break; }
        const c = parse(s.backgroundColor);
        if (c.a > 0.9) bg = c;
      }
      // Hermanos con imagen/video debajo del texto
      if (a.parentElement && [...a.parentElement.children].some((sib) => sib !== a && (sib.matches("img, video") || sib.querySelector?.("img, video")) && getComputedStyle(sib).position === "absolute")) { overMedia = !bg; if (overMedia) break; }
    }
    // El header se mide aparte, con píxeles reales
    if (overMedia || op < 0.99 || el.closest("header")) continue;
    bg ??= parse(getComputedStyle(document.body).backgroundColor);
    const s = getComputedStyle(el);
    const fg = blend(parse(s.color), bg);
    const L1 = lum(fg), L2 = lum(bg);
    const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
    const size = parseFloat(s.fontSize);
    const large = size >= 24 || (size >= 18.66 && parseInt(s.fontWeight) >= 700);
    if (ratio < (large ? 3 : 4.5)) out.contrast.push(`${label(el)} ${ratio.toFixed(2)}:1 (${s.color} sobre rgb(${bg.r},${bg.g},${bg.b}))`);
  }

  for (const k of Object.keys(out)) if (Array.isArray(out[k])) out[k] = [...new Set(out[k])];
  return out;
};

// ---------- utilidades ----------
async function ready(page) {
  await page.locator("html[data-hydrated]").waitFor({ state: "attached", timeout: 15000 }).catch(() => {});
}
async function scrollThrough(page, collect) {
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  const vh = await page.evaluate(() => innerHeight);
  const results = [];
  for (let y = 0; y < h; y += vh * 0.6) {
    await page.mouse.wheel(0, vh * 0.6);
    await page.waitForTimeout(160);
    if (collect) results.push(await page.evaluate(inPageChecks));
  }
  await page.waitForTimeout(500);
  return results;
}
function merge(target, res) {
  for (const k of Object.keys(res)) {
    if (Array.isArray(res[k])) target[k] = [...new Set([...(target[k] ?? []), ...res[k]])];
    else target[k] = Math.max(target[k] ?? -Infinity, res[k]);
  }
  return target;
}

// ---------- corrida ----------
const browser = await chromium.launch();
const linkTargets = new Set();
const report = { viewports: {}, links: [], perf: {} };

for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext(
    vp.mobile
      ? { ...devices["Pixel 7"], viewport: { width: vp.width, height: vp.height } }
      : { viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1 },
  );
  await ctx.addInitScript(() => {
    window.__cls = 0; window.__clsEntries = []; window.__loaf = [];
    new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) { window.__cls += e.value; window.__clsEntries.push({ v: e.value, t: Math.round(e.startTime), src: e.sources?.map((s) => s.node?.nodeName + "." + String(s.node?.className ?? "").slice(0, 40)) }); } }).observe({ type: "layout-shift", buffered: true });
    try { new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__loaf.push(Math.round(e.duration)); }).observe({ type: "long-animation-frame", buffered: true }); } catch {}
  });
  report.viewports[vp.id] = {};

  for (const route of ROUTES) {
    const page = await ctx.newPage();
    const errors = [], failed = [], imgBytes = [];
    page.on("console", (m) => { if (["error", "warning"].includes(m.type())) errors.push(`${m.type()}: ${m.text().slice(0, 220)}`); });
    page.on("pageerror", (e) => errors.push(`pageerror: ${e.message.slice(0, 220)}`));
    page.on("requestfailed", (r) => { const t = r.failure()?.errorText ?? ""; if (!t.includes("ERR_ABORTED")) failed.push(`${t} ${r.url()}`); });
    page.on("response", async (r) => {
      if (r.status() >= 400 && !r.url().includes("ruta-inexistente")) failed.push(`${r.status()} ${r.url()}`);
      if (r.request().resourceType() === "image") { try { imgBytes.push([(await r.body()).length, r.url()]); } catch {} }
    });

    const res = await page.goto(BASE + route, { waitUntil: "networkidle" });
    const status = res?.status();
    await ready(page);
    const expected = route === "/ruta-inexistente" ? 404 : 200;
    if (status !== expected) add("CRÍTICO", vp.id, route, "status", `HTTP ${status}`);

    const loadCls = await page.evaluate(() => window.__cls);
    const top = await page.evaluate(inPageChecks);
    const during = await scrollThrough(page, true);
    const agg = during.reduce(merge, merge({}, top));
    const after = await page.evaluate(() => ({ cls: window.__cls, entries: window.__clsEntries.slice(-6), loaf: window.__loaf.filter((d) => d > 150) }));
    const fonts = await page.evaluate(async () => { await document.fonts.ready; return [...new Set([...document.fonts].filter((f) => f.status === "loaded").map((f) => f.family.split(" ")[0]))]; });

    // Links internos
    for (const href of await page.$$eval("a[href^='/']", (as) => as.map((a) => a.getAttribute("href")))) linkTargets.add(href);

    const R = (report.viewports[vp.id][route] = { status, loadCls: +loadCls.toFixed(4), cls: +after.cls.toFixed(4), longFrames: after.loaf, fonts, errors, failed, ...agg, heavyImages: imgBytes.filter(([b]) => b > 250_000).map(([b, u]) => `${Math.round(b / 1024)}KB ${u.slice(-60)}`) });

    // Clasificación
    const hydr = errors.filter((e) => /hydrat/i.test(e));
    if (hydr.length) add("CRÍTICO", vp.id, route, "hidratación", hydr[0]);
    const js = errors.filter((e) => e.startsWith("pageerror"));
    if (js.length) add("CRÍTICO", vp.id, route, "error JS", js.join(" | "));
    const cons = errors.filter((e) => !/hydrat/i.test(e) && !e.startsWith("pageerror") && !(route === "/ruta-inexistente" && e.includes("404")));
    if (cons.length) add("IMPORTANTE", vp.id, route, "consola", cons.join(" | "));
    if (failed.length) add("CRÍTICO", vp.id, route, "red", failed.join(" | "));
    if (R.overflow > 0) add("CRÍTICO", vp.id, route, "overflow horizontal", `${R.overflow}px`);
    if (R.clipped.length) add("IMPORTANTE", vp.id, route, "texto cortado", R.clipped.join(" | "));
    if (R.overlaps.length) add("IMPORTANTE", vp.id, route, "texto superpuesto", R.overlaps.join(" | "));
    if (R.noName.length) add("CRÍTICO", vp.id, route, "sin nombre accesible", R.noName.join(" | "));
    if (R.noAlt.length) add("IMPORTANTE", vp.id, route, "img sin alt", R.noAlt.join(" | "));
    if (R.broken.length) add("CRÍTICO", vp.id, route, "imagen rota", R.broken.join(" | "));
    if (R.distorted.length) add("IMPORTANTE", vp.id, route, "imagen deformada", R.distorted.join(" | "));
    if (R.small.length) add(vp.mobile ? "IMPORTANTE" : "MENOR", vp.id, route, "target < 24px", R.small.join(" | "));
    if (R.contrast.length) add("IMPORTANTE", vp.id, route, "contraste", R.contrast.join(" | "));
    if (R.deadButtons.length) add("IMPORTANTE", vp.id, route, "botón sin handler", R.deadButtons.join(" | "));
    if (R.oversized.length) add("MENOR", vp.id, route, "imagen sobredimensionada", R.oversized.slice(0, 4).join(" | "));
    if (R.heavyImages.length) add("MENOR", vp.id, route, "imagen pesada", R.heavyImages.join(" | "));
    if (R.loadCls > 0.05) add("IMPORTANTE", vp.id, route, "CLS en carga", `${R.loadCls}`);
    if (R.cls - R.loadCls > 0.1) add("MENOR", vp.id, route, "CLS al scrollear", `${(R.cls - R.loadCls).toFixed(3)} ${JSON.stringify(after.entries)}`);
    if (R.longFrames.length > 3) add("MENOR", vp.id, route, "frames largos al scrollear", R.longFrames.join(","));
    if (!fonts.includes("Archivo") || !fonts.includes("Geist")) add("CRÍTICO", vp.id, route, "fuentes", fonts.join(","));

    await page.close();
  }

  // Barra fija que tapa contenido al final de la página (mobile)
  if (vp.mobile) {
    const pg = await ctx.newPage();
    await pg.goto(BASE + "/product/tide-heavy-tee", { waitUntil: "networkidle" });
    await ready(pg);
    // Dos pasadas: al aparecer la barra, el footer reserva su alto y la página se alarga
    for (let k = 0; k < 2; k++) {
      await pg.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await pg.waitForTimeout(900);
    }
    const covered = await pg.evaluate(() => {
      const bars = [...document.querySelectorAll("body *")].filter((e) => getComputedStyle(e).position === "fixed" && getComputedStyle(e).pointerEvents !== "none" && !e.closest("[aria-hidden=true]") && e.getBoundingClientRect().bottom >= innerHeight - 2 && e.getBoundingClientRect().height > 30 && e.getBoundingClientRect().height < innerHeight / 2 && !e.closest("header"));
      const texts = [...document.querySelectorAll("footer p, footer a, footer button")].filter((t) => !t.closest("[aria-hidden=true]"));
      return bars.flatMap((bar) => { const br = bar.getBoundingClientRect(); return texts.filter((t) => { const r = t.getBoundingClientRect(); return r.bottom > br.top + 2 && r.top < br.bottom; }).map((t) => t.textContent.trim().slice(0, 40)); });
    });
    if (covered.length) add("IMPORTANTE", vp.id, "/product/*", "barra fija tapa contenido", covered.join(" | "));
    await pg.close();
  }

  // El pan del lookbook (desktop) debe llegar a mostrar la última foto completa
  if (!vp.mobile) {
    const pg = await ctx.newPage();
    await pg.goto(BASE + "/", { waitUntil: "networkidle" });
    await ready(pg);
    const end = await pg.evaluate(() => { const s = document.querySelector("section[aria-labelledby=lookbook-title]"); return s.offsetTop + s.offsetHeight - innerHeight; });
    await pg.evaluate((y) => window.scrollTo(0, y), end);
    await pg.waitForTimeout(1200);
    const last = await pg.evaluate(() => { const f = [...document.querySelectorAll("section[aria-labelledby=lookbook-title] figure")].pop().getBoundingClientRect(); return { left: Math.round(f.left), right: Math.round(f.right), vw: innerWidth }; });
    if (last.right > last.vw || last.left < 0) add("IMPORTANTE", vp.id, "/", "lookbook pan incompleto", JSON.stringify(last));
    await pg.screenshot({ path: `${OUT}/${vp.id}-home-lookbook-end.png` });
    await pg.close();
  }

  // Contraste real del header (píxeles) mientras el hero se transforma, con el header visible (subiendo)
  const lumOf = (r, g, b) => [r, g, b].map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }).reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0);
  for (const route of ["/", "/drop/low-tide"]) {
    const pg = await ctx.newPage();
    await pg.goto(BASE + route, { waitUntil: "networkidle" });
    await ready(pg);
    await pg.waitForTimeout(800);
    for (const frac of [0, 0.1, 0.2, 0.3, 0.5, 0.7, 0.9, 1.1]) {
      const y = Math.round(frac * vp.height);
      await pg.evaluate((v) => window.scrollTo(0, v), y + 120);
      await pg.waitForTimeout(250);
      await pg.evaluate((v) => window.scrollTo(0, v), y);
      await pg.waitForTimeout(800);
      const mark = pg.locator("header a[aria-label*='inicio'] span").first();
      const box = await mark.boundingBox();
      if (!box || box.y + box.height < 0) continue;
      const color = await mark.evaluate((e) => getComputedStyle(e).color);
      const png = await pg.screenshot({ clip: { x: Math.max(0, box.x - 6), y: Math.max(0, box.y - 6), width: box.width + 12, height: box.height + 12 } });
      const { data, info } = await sharp(png).raw().toBuffer({ resolveWithObject: true });
      const [tr, tg, tb] = (color.match(/[\d.]+/g) ?? []).map(Number);
      const edge = [];
      for (let x = 0; x < info.width; x++) for (const yy of [0, 1, info.height - 2, info.height - 1]) { const i = (yy * info.width + x) * info.channels; edge.push(lumOf(data[i], data[i + 1], data[i + 2])); }
      edge.sort((a, b) => a - b);
      const bgL = edge[Math.floor(edge.length / 2)];
      const tL = lumOf(tr, tg, tb);
      const ratio = (Math.max(bgL, tL) + 0.05) / (Math.min(bgL, tL) + 0.05);
      if (ratio < 3) add("CRÍTICO", vp.id, route, "header ilegible", `scroll ${y}px: contraste ${ratio.toFixed(2)}:1`);
    }
    await pg.close();
  }

  // ---------- capturas y flujos por viewport ----------
  const page = await ctx.newPage();
  const shot = (name) => page.screenshot({ path: `${OUT}/${vp.id}${name ? "-" + name : ""}.png` });
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await ready(page);
  await page.waitForTimeout(2600);
  await shot("");
  // Secciones del home
  for (const [name, sel] of [["hero-scrolled", null], ["new-drop", "#drop-title"], ["collection", "#shop-title"], ["story", "#story-title"], ["lookbook", "#lookbook-title"], ["featured", "#featured-title"], ["final-cta", "#final-title"], ["footer", "footer"]]) {
    if (sel) await page.locator(sel).first().evaluate((el) => el.scrollIntoView({ block: "start" }));
    else await page.evaluate(() => window.scrollTo(0, innerHeight * 0.6));
    await page.waitForTimeout(1300);
    await shot(`home-${name}`);
  }
  // Navegación
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(600);
  if (vp.mobile) {
    await page.getByRole("button", { name: /Menu/ }).click();
    await page.waitForTimeout(900);
    const menuCheck = await page.evaluate(inPageChecks);
    if (menuCheck.clipped.length) add("IMPORTANTE", vp.id, "menú mobile", "texto cortado", menuCheck.clipped.join(" | "));
    if (menuCheck.small.length) add("IMPORTANTE", vp.id, "menú mobile", "target < 24px", menuCheck.small.join(" | "));
    await shot("menu");
    await page.keyboard.press("Escape");
  } else {
    await page.getByRole("button", { name: "Shop", exact: true }).click();
    await page.waitForTimeout(800);
    await shot("mega-menu");
    await page.keyboard.press("Escape");
  }
  // Catálogo y filtros
  await page.goto(BASE + "/shop", { waitUntil: "networkidle" });
  await ready(page);
  await page.waitForTimeout(800);
  await shot("shop");
  await page.getByRole("button", { name: "M", exact: true }).click();
  await page.locator("fieldset").filter({ hasText: "Color" }).getByRole("button").nth(1).click();
  await page.waitForTimeout(700);
  await shot("shop-filtered");
  // Producto: color, talle, cantidad, bag
  await page.goto(BASE + "/product/swell-boardshort", { waitUntil: "networkidle" });
  await ready(page);
  await page.waitForTimeout(1200);
  await shot("product");
  await page.locator("label:has(input[name=color][value=sky])").click();
  await page.locator("label:has(input[name=size][value='32'])").click();
  await page.getByRole("group", { name: "Cantidad" }).getByRole("button", { name: "Sumar uno" }).click();
  await page.locator("label:has(input[name=size][value='32'])").scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await shot("product-variants");
  await page.getByRole("button", { name: /Agregar/ }).first().click();
  await page.waitForTimeout(1200);
  const count = await page.locator("#bag-button .mono").textContent();
  if (count?.trim() !== "2") add("CRÍTICO", vp.id, "/product/swell-boardshort", "carrito", `contador=${count}`);
  await page.locator("#bag-button").click();
  await page.waitForTimeout(900);
  const drawerCheck = await page.evaluate(inPageChecks);
  if (drawerCheck.small.length) add(vp.mobile ? "IMPORTANTE" : "MENOR", vp.id, "drawer", "target < 24px", drawerCheck.small.join(" | "));
  if (drawerCheck.clipped.length) add("IMPORTANTE", vp.id, "drawer", "texto cortado", drawerCheck.clipped.join(" | "));
  await shot("cart");
  await page.keyboard.press("Escape");
  // Checkout
  await page.goto(BASE + "/checkout", { waitUntil: "networkidle" });
  await ready(page);
  await page.waitForTimeout(700);
  await shot("checkout");
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.waitForTimeout(300);
  await shot("checkout-errors");

  // Teclado: foco visible y no tapado por elementos fijos
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await ready(page);
  const focusProblems = [];
  for (let i = 0; i < 40; i++) {
    await page.keyboard.press("Tab");
    const f = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      el.scrollIntoView?.({ block: "nearest" });
      const s = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      const ring = s.outlineStyle !== "none" && parseFloat(s.outlineWidth) > 0;
      const label = el.closest("label");
      const peerRing = label && [...label.querySelectorAll("*")].some((c) => getComputedStyle(c).outlineStyle !== "none");
      const cx = Math.min(Math.max(r.left + r.width / 2, 1), innerWidth - 1), cy = Math.min(Math.max(r.top + r.height / 2, 1), innerHeight - 1);
      const hit = document.elementFromPoint(cx, cy);
      const covered = hit && !el.contains(hit) && !hit.contains(el) && !(label && label.contains(hit)) && hit.closest("header, [role=dialog]") && !el.closest("header, [role=dialog]");
      return { el: `${el.tagName.toLowerCase()} "${(el.textContent || el.getAttribute("aria-label") || "").trim().slice(0, 30)}"`, ring: ring || !!peerRing, covered: !!covered, visible: r.width > 0 && r.bottom > 0 && r.top < innerHeight };
    });
    if (!f) continue;
    if (!f.ring) focusProblems.push(`sin foco visible: ${f.el}`);
    if (f.covered) focusProblems.push(`foco tapado por header: ${f.el}`);
  }
  if (focusProblems.length) add("IMPORTANTE", vp.id, "/", "teclado", [...new Set(focusProblems)].join(" | "));

  // Reduced motion
  const rm = await browser.newContext({ ...(vp.mobile ? devices["Pixel 7"] : {}), viewport: { width: vp.width, height: vp.height }, reducedMotion: "reduce" });
  const p2 = await rm.newPage();
  await p2.goto(BASE + "/", { waitUntil: "networkidle" });
  await p2.waitForTimeout(1200);
  const rmState = await p2.evaluate(() => ({
    heroH: document.querySelector("section[aria-labelledby=hero-title]").getBoundingClientRect().height,
    infinite: document.getAnimations().filter((a) => a.effect?.getTiming().iterations === Infinity && a.playState === "running").length,
    vh: innerHeight,
  }));
  if (Math.abs(rmState.heroH - Math.max(rmState.vh, 560)) > 4 || rmState.infinite) add("IMPORTANTE", vp.id, "/", "reduced motion", JSON.stringify(rmState));
  await p2.screenshot({ path: `${OUT}/${vp.id}-reduced-motion.png` });
  await rm.close();

  await ctx.close();
}

// ---------- links internos ----------
const ctx = await browser.newContext();
for (const href of linkTargets) {
  const [path, hash] = href.split("#");
  const r = await ctx.request.get(BASE + path);
  if (r.status() !== 200) { add("CRÍTICO", "-", href, "link roto", `HTTP ${r.status()}`); continue; }
  if (hash) {
    const html = await r.text();
    if (!html.includes(`id="${hash}"`)) add("IMPORTANTE", "-", href, "ancla inexistente", `#${hash}`);
  }
}
report.links = [...linkTargets].sort();
await browser.close();

report.issues = issues;
writeFileSync(`${OUT}/audit.json`, JSON.stringify(report, null, 1));
const bySev = (s) => issues.filter((i) => i.severity === s);
console.log(`Rutas: ${ROUTES.length} × ${VIEWPORTS.length} viewports · links internos: ${linkTargets.size}`);
for (const s of ["CRÍTICO", "IMPORTANTE", "MENOR"]) {
  console.log(`\n== ${s} (${bySev(s).length})`);
  for (const i of bySev(s)) console.log(`- [${i.vp}] ${i.route} · ${i.kind}: ${i.detail.slice(0, 400)}`);
}
