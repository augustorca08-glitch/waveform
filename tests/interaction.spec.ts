import { expect, test } from "@playwright/test";
import { ready, shotPath } from "./helpers";

test.describe("navegación", () => {
  test("mobile: menú a pantalla completa con foco atrapado y Escape", async ({ page, isMobile }, info) => {
    test.skip(!isMobile, "solo mobile");
    await page.goto("/shop");
    await ready(page);
    const trigger = page.getByRole("button", { name: /Menu/ });
    await trigger.click();
    const menu = page.getByRole("dialog", { name: "Menú" });
    await expect(menu).toBeVisible();
    await page.waitForTimeout(700);
    await page.screenshot({ path: shotPath(info, "menu-open") });
    await expect(menu.getByRole("button", { name: /Cerrar/ })).toBeFocused();
    const clipped = await menu.locator(".display").evaluateAll((els) => els.filter((e) => e.scrollWidth > e.clientWidth + 1 || e.getBoundingClientRect().right > window.innerWidth).map((e) => e.textContent));
    expect(clipped).toEqual([]);

    // El foco no sale del diálogo
    for (let i = 0; i < 14; i++) await page.keyboard.press("Tab");
    expect(await menu.evaluate((el) => el.contains(document.activeElement))).toBe(true);

    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
    await expect(trigger).toBeFocused();

    // Navegar desde el menú
    await trigger.click();
    await menu.getByRole("link", { name: /Outerwear/ }).click();
    await expect(page).toHaveURL(/\/shop\/outerwear/);
    await expect(menu).toBeHidden();
  });

  test("desktop: panel Shop con teclado y Escape", async ({ page, isMobile }, info) => {
    test.skip(isMobile, "solo desktop");
    await page.goto("/about");
    await ready(page);
    const shop = page.getByRole("button", { name: "Shop", exact: true });
    await shop.click();
    await expect(shop).toHaveAttribute("aria-expanded", "true");
    const panel = page.locator("#mega-panel");
    await expect(panel).toBeVisible();
    await panel.getByRole("link", { name: /Pants/ }).hover();
    await page.waitForTimeout(600);
    await page.screenshot({ path: shotPath(info, "mega-panel") });
    await page.keyboard.press("Escape");
    await expect(panel).toBeHidden();
    await shop.click();
    await panel.getByRole("link", { name: /Ver todo el shop/ }).click();
    await expect(page).toHaveURL(/\/shop$/);
  });

  test("skip link visible con teclado y foco visible", async ({ page, isMobile }) => {
    test.skip(isMobile, "teclado físico");
    await page.goto("/");
    await ready(page);
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Saltar al contenido" });
    await expect(skip).toBeFocused();
    const box = await skip.boundingBox();
    expect(box!.y).toBeGreaterThanOrEqual(0);
    // Siguiente foco: tiene outline visible
    await page.keyboard.press("Tab");
    const outline = await page.evaluate(() => getComputedStyle(document.activeElement!).outlineStyle);
    expect(outline).not.toBe("none");
  });

  test("drawer del bag: diálogo accesible y vacío diseñado", async ({ page }, info) => {
    await page.goto("/lookbook");
    await ready(page);
    await page.locator("#bag-button").click();
    const drawer = page.getByRole("dialog", { name: /Bag/ });
    await expect(drawer).toBeVisible();
    await expect(drawer.getByRole("button", { name: "Cerrar bag" })).toBeFocused();
    await expect(drawer.getByText("Nada acá todavía.")).toBeVisible();
    await page.waitForTimeout(500);
    await page.screenshot({ path: shotPath(info, "bag-empty") });
    await page.keyboard.press("Escape");
    await expect(drawer).toBeHidden();
  });
});

test.describe("hover y cursor", () => {
  test("desktop: índice de categorías tiñe la fila y muestra la foto", async ({ page, isMobile }, info) => {
    test.skip(isMobile, "solo puntero fino");
    await page.goto("/");
    await ready(page);
    const row = page.locator("#shop-title").locator("xpath=ancestor::section").getByRole("link", { name: /Swim/ });
    await row.scrollIntoViewIfNeeded();
    await row.hover();
    await page.waitForTimeout(700);
    await expect(page.locator("section[aria-labelledby=shop-title] img[src*='swim']:visible")).toBeVisible();
    await page.screenshot({ path: shotPath(info, "category-hover") });
  });

  test("desktop: etiqueta contextual del cursor sobre media", async ({ page, isMobile }) => {
    test.skip(isMobile, "solo puntero fino");
    await page.goto("/shop");
    await ready(page);
    const media = page.locator("[data-cursor='View']").first();
    await media.scrollIntoViewIfNeeded();
    const b = (await media.boundingBox())!;
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 4 });
    await expect(page.locator(".sticker", { hasText: /^View$/ })).toBeVisible();
  });
});

test.describe("hero con video", () => {
  test("sin hero.mp4: usa el poster, no pide el video y ofrece LCP prioritario", async ({ page }) => {
    const videoRequests: string[] = [];
    page.on("request", (r) => r.url().includes("/videos/hero") && r.url().endsWith(".mp4") && videoRequests.push(r.url()));
    await page.goto("/", { waitUntil: "networkidle" });
    await ready(page);
    await page.waitForTimeout(2000);
    const poster = page.locator("#hero-title").locator("xpath=ancestor::section").locator("img").first();
    await expect(poster).toHaveAttribute("fetchpriority", "high");
    expect(await poster.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0)).toBe(true);
    expect(videoRequests).toEqual([]);
    // En producción no se muestra la etiqueta de desarrollo
    await expect(page.getByText("Video placeholder")).toHaveCount(0);
  });
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("hero estático, lookbook sin secuestro de scroll, sin cortina", async ({ page, isMobile }, info) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await ready(page);
    const hero = page.locator("section[aria-labelledby=hero-title]");
    const vh = page.viewportSize()!.height;
    const h = (await hero.boundingBox())!.height;
    expect(Math.abs(h - Math.max(vh, 560))).toBeLessThan(4);
    await page.screenshot({ path: shotPath(info, "home-reduced-motion") });

    if (!isMobile) {
      // Con reduced motion el lookbook usa scroll nativo (región desplazable), no el pan fijado
      await expect(page.getByRole("region", { name: /Fotos del lookbook/ })).toBeVisible();
    }

    // Ninguna animación CSS infinita corriendo
    const running = await page.evaluate(() => document.getAnimations().filter((a) => a.effect?.getTiming().iterations === Infinity && a.playState === "running").length);
    expect(running).toBe(0);

    // Sin cortina al navegar
    await page.getByRole("link", { name: "Lookbook" }).first().click();
    await expect(page).toHaveURL(/lookbook/);
    await expect(page.locator(".z-\\[90\\]")).toHaveCount(0);
  });
});
