import { expect, test, type Page } from "@playwright/test";
import { ready } from "./helpers";

const bagCount = (page: Page) => page.locator("#bag-button .mono");

test.describe("producto y carrito", () => {
  test("variantes, validación de talle, cantidad y agregar al bag", async ({ page }) => {
    await page.goto("/product/tide-heavy-tee");
    await ready(page);
    await expect(bagCount(page)).toHaveText("0");

    // Sin talle: error inline, nada se agrega
    await page.getByRole("button", { name: /Agregar/ }).first().click();
    await expect(page.getByText("Elegí un talle para agregarlo al bag.")).toBeVisible();
    await expect(bagCount(page)).toHaveText("0");

    // Color: actualiza la URL y la galería
    await page.locator("label:has(input[name=color][value=ink])").click();
    await expect(page).toHaveURL(/color=ink/);
    await expect(page.getByText("Color: Ink")).toBeVisible();
    await expect(page.locator("img[alt*='en Ink']").first()).toBeAttached();

    // Talle agotado deshabilitado (ink XS en el mock)
    await expect(page.getByRole("radio", { name: /^XS/ })).toBeDisabled();

    await page.locator("label:has(input[name=size][value='M'])").click();
    await expect(page.locator("#size-status")).toContainText("talle M");
    await page.getByRole("group", { name: "Cantidad" }).getByRole("button", { name: "Sumar uno" }).click();
    await expect(page.getByRole("group", { name: "Cantidad" }).locator("output")).toHaveText("2");

    await page.getByRole("button", { name: /Agregar/ }).first().click();
    await expect(bagCount(page)).toHaveText("2");

    // Drawer: línea, variantes, subtotal
    await page.locator("#bag-button").click();
    const drawer = page.getByRole("dialog", { name: /Bag/ });
    await expect(drawer).toBeVisible();
    await expect(drawer.getByText("Ink · Talle M")).toBeVisible();
    await expect(drawer.getByText("US$ 96").first()).toBeVisible();

    // Stepper y quitar con deshacer
    await drawer.getByRole("button", { name: "Restar uno" }).click();
    await expect(drawer.getByText("Subtotal").locator("..")).toContainText("US$ 48");
    await drawer.getByRole("button", { name: /Quitar/ }).click();
    await expect(drawer.getByText("Nada acá todavía.")).toBeVisible();
    await drawer.getByRole("button", { name: /Deshacer/ }).click();
    await expect(drawer.getByText("Ink · Talle M")).toBeVisible();

    // Persistencia tras recargar
    await page.keyboard.press("Escape");
    await expect(drawer).toBeHidden();
    await page.reload();
    await ready(page);
    await expect(bagCount(page)).toHaveText("1");
  });

  test("checkout simulado completo con validación", async ({ page }) => {
    await page.goto("/product/dune-cargo-pant?color=ink");
    await ready(page);
    await page.locator("label:has(input[name=size][value='32'])").click();
    await page.getByRole("button", { name: /Agregar/ }).first().click();
    await expect(bagCount(page)).toHaveText("1");

    await page.goto("/checkout");
    await ready(page);
    await expect(page.getByRole("heading", { name: "Checkout" })).toBeVisible();

    // Validación
    await page.getByRole("button", { name: "Continuar" }).click();
    await expect(page.getByText("Ingresá un email válido")).toBeVisible();
    await expect(page.getByLabel("Email")).toHaveAttribute("aria-invalid", "true");
    await expect(page.getByLabel("Email")).toBeFocused();

    await page.getByLabel("Email").fill("mar@olas.com");
    await page.getByLabel("Nombre y apellido").fill("Mar Olivera");
    await page.getByRole("button", { name: "Continuar" }).click();

    await expect(page.getByRole("heading", { name: "Envío" })).toBeVisible();
    await page.getByRole("button", { name: "Continuar" }).click();
    await expect(page.getByText("Ingresá la calle y el número.")).toBeVisible();
    await page.getByLabel("Dirección").fill("Av. Costanera 1234");
    await page.getByLabel("Ciudad").fill("Mar del Plata");
    await page.getByLabel("Código postal").fill("7600");
    await page.getByRole("button", { name: "Continuar" }).click();

    await expect(page.getByRole("heading", { name: "Revisión" })).toBeVisible();
    await expect(page.getByText("Av. Costanera 1234")).toBeVisible();
    await page.getByRole("button", { name: /Confirmar pedido/ }).click();

    await expect(page).toHaveURL(/checkout\/success\?order=WF-/);
    await expect(page.getByRole("heading", { name: /Gracias, Mar/ })).toBeVisible();
    await expect(bagCount(page)).toHaveText("0");
  });

  test("filtros del shop actualizan la lista y la URL", async ({ page }) => {
    await page.goto("/shop");
    await ready(page);
    await expect(page.getByText("11 productos")).toBeVisible();
    await page.getByRole("button", { name: "36", exact: true }).click();
    await expect(page).toHaveURL(/talle=36/);
    const n = Number((await page.locator("p.mono", { hasText: /productos?$/ }).textContent())!.split(" ")[0]);
    expect(n).toBeLessThan(11);
    await page.getByRole("button", { name: "Limpiar filtros" }).first().click();
    await expect(page.getByText("11 productos")).toBeVisible();

    // Filtro que llega por URL desde el servidor
    await page.goto("/shop?color=sunburn");
    await ready(page);
    await expect(page.getByText("1 producto", { exact: true })).toBeVisible();
  });
});

test.describe("quick add", () => {
  test("desktop: hover muestra talles y agrega", async ({ page, isMobile }) => {
    test.skip(isMobile, "solo puntero fino");
    await page.goto("/shop/swim");
    await ready(page);
    const card = page.locator("article").filter({ hasText: "Swell Boardshort" });
    await card.hover();
    const size = card.getByRole("button", { name: "Agregar Swell Boardshort talle 32" });
    await expect(size).toBeVisible();
    await size.click();
    await expect(bagCount(page)).toHaveText("1");
  });

  test("mobile: el botón + abre la hoja de variantes", async ({ page, isMobile }) => {
    test.skip(!isMobile, "solo touch");
    await page.goto("/shop/swim");
    await ready(page);
    await page.getByRole("button", { name: "Agregar rápido Swell Boardshort" }).click();
    const sheet = page.getByRole("dialog", { name: "Swell Boardshort" });
    await expect(sheet).toBeVisible();
    await sheet.getByRole("button", { name: "Agregar al bag" }).click();
    await expect(sheet.getByText("Elegí un talle para agregarlo al bag.")).toBeVisible();
    await sheet.locator("label:has(input[value='32'])").click();
    await sheet.getByRole("button", { name: "Agregar al bag" }).click();
    await expect(page.getByRole("dialog", { name: /Bag/ })).toBeVisible();
    await expect(bagCount(page)).toHaveText("1");
  });

  test("mobile: barra sticky aparece al pasar el CTA y pide talle", async ({ page, isMobile }) => {
    test.skip(!isMobile, "solo mobile");
    await page.goto("/product/swell-boardshort");
    await ready(page);
    await page.evaluate(() => window.scrollTo(0, 1400));
    const bar = page.getByRole("button", { name: "Elegir talle" });
    await expect(bar).toBeVisible();
    await bar.click();
    await expect(page.getByText("Elegí un talle para agregarlo al bag.")).toBeVisible();
  });
});
