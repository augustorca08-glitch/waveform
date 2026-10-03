// Mide LCP/CLS con perfil mobile (4G + CPU 4x). Requiere: npm run build && npx next start -p 3200
import { chromium, devices } from "@playwright/test";
const b = await chromium.launch();
for (const route of ["/", "/product/tide-heavy-tee", "/shop"]) {
  const ctx = await b.newContext({ ...devices["Pixel 7"] });
  const p = await ctx.newPage();
  const cdp = await ctx.newCDPSession(p);
  await cdp.send("Network.enable");
  // Perfil "Fast 4G" + CPU 4x
  await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: (9 * 1024 * 1024) / 8, uploadThroughput: (1.5 * 1024 * 1024) / 8 });
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  let js = 0, img = 0, font = 0;
  p.on("response", async (r) => { const t = r.request().resourceType(); const len = Number((await r.headerValue("content-length")) ?? 0); if (t === "script") js += len; if (t === "image") img += len; if (t === "font") font += len; });
  await p.addInitScript(() => {
    window.__lcp = 0; window.__cls = 0;
    new PerformanceObserver((l) => { for (const e of l.getEntries()) { window.__lcp = e.startTime; window.__lcpEl = (e.element?.tagName ?? "") + "." + String(e.element?.className ?? "").slice(0, 40) + " " + (e.url || "").slice(-40); } }).observe({ type: "largest-contentful-paint", buffered: true });
    new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type: "layout-shift", buffered: true });
  });
  await p.goto(`http://localhost:3200${route}`, { waitUntil: "networkidle" });
  await p.waitForTimeout(1500);
  const m = await p.evaluate(() => ({ lcp: Math.round(window.__lcp), el: window.__lcpEl, cls: window.__cls.toFixed(3) }));
  console.log(route, JSON.stringify({ ...m, jsKB: Math.round(js / 1024), imgKB: Math.round(img / 1024), fontKB: Math.round(font / 1024) }));
  await ctx.close();
}
await b.close();
