import { expect, type Page, type TestInfo } from "@playwright/test";

export const ROUTES = [
  { path: "/", name: "home" },
  { path: "/shop", name: "shop" },
  { path: "/shop/swim", name: "shop-swim" },
  { path: "/drop/low-tide", name: "drop" },
  { path: "/product/tide-heavy-tee", name: "product" },
  { path: "/lookbook", name: "lookbook" },
  { path: "/about", name: "about" },
  { path: "/checkout", name: "checkout-empty" },
  { path: "/esta-no-existe", name: "not-found", status: 404 },
];

/** Registra errores de consola, excepciones y respuestas fallidas. */
export function watchPage(page: Page) {
  const errors: string[] = [];
  const failed: string[] = [];
  const requested: string[] = [];
  page.on("console", (m) => {
    // El 404 de la ruta inexistente es esperado
    if (m.type() === "error" && !(m.text().includes("404") && page.url().includes("esta-no-existe"))) errors.push(m.text());
  });
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  page.on("request", (r) => requested.push(r.url()));
  page.on("response", (r) => {
    const url = r.url();
    if (r.status() >= 400 && !url.includes("esta-no-existe")) failed.push(`${r.status()} ${url}`);
  });
  page.on("requestfailed", (r) => {
    const reason = r.failure()?.errorText ?? "";
    // Navegar cancela descargas en curso: no es un error del sitio
    if (!reason.includes("ERR_ABORTED")) failed.push(`failed ${r.url()} ${reason}`);
  });
  return { errors, failed, requested };
}

/** Recorre la página para disparar lazy loading y animaciones de entrada. */
export async function scrollThrough(page: Page) {
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.7;
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 90));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(400);
}

export async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow, "sin scroll horizontal").toBeLessThanOrEqual(0);
}

export function shotPath(info: TestInfo, name: string) {
  return `shots/${info.project.name}/${name}.png`;
}

/** Espera a que React haya hidratado (los handlers ya existen). */
export async function ready(page: Page) {
  await page.locator("html[data-hydrated]").waitFor({ state: "attached" });
}
