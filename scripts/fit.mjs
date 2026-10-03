// Detecta texto display que no entra en su contenedor o en el viewport
import { chromium } from "@playwright/test";
const routes = ["/", "/shop", "/shop/outerwear", "/product/paddle-out-coach-jacket", "/drop/low-tide", "/lookbook", "/about", "/checkout", "/nope"];
const widths = (process.argv[2] ?? "360,390").split(",").map(Number);
const b = await chromium.launch();
for (const w of widths) {
  const p = await b.newPage({ viewport: { width: w, height: 800 } });
  for (const r of routes) {
    await p.goto(`http://localhost:3100${r}`, { waitUntil: "networkidle" });
    await p.waitForTimeout(600);
    const res = await p.evaluate(() => {
      const vw = document.documentElement.clientWidth;
      const bad = [...document.querySelectorAll(".display")].filter((el) => {
        if (el.closest("[aria-hidden=true]")) return false;
        const r = el.getBoundingClientRect();
        return r.width > 0 && (el.scrollWidth > el.clientWidth + 1 || r.right > vw + 1);
      }).map((el) => `"${el.textContent.trim().slice(0, 30)}" sw=${el.scrollWidth} cw=${el.clientWidth}`);
      return { sw: document.documentElement.scrollWidth - vw, bad };
    });
    if (res.sw > 0 || res.bad.length) console.log(w, r, JSON.stringify(res));
  }
  await p.close();
}
console.log("done");
await b.close();
