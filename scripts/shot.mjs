// Captura rápida de desarrollo: node scripts/shot.mjs <path> <w>x<h> [scrollY...]
import { chromium } from "@playwright/test";

const [, , route = "/", size = "1440x900", ...scrolls] = process.argv;
const [width, height] = size.split("x").map(Number);
const out = process.env.OUT_DIR ?? "shots";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width, height } });
const logs = [];
page.on("console", (m) => (m.type() === "error" || m.type() === "warning") && logs.push(`${m.type()}: ${m.text()}`));
page.on("pageerror", (e) => logs.push(`pageerror: ${e.message}`));
await page.goto(`http://localhost:3100${route}`, { waitUntil: "networkidle" });
await page.waitForTimeout(1800);
const name = route.replace(/\W+/g, "_") || "home";
const positions = scrolls.length ? scrolls.map(Number) : [0];
for (const y of positions) {
  await page.evaluate((y) => window.scrollTo(0, y), y);
  await page.waitForTimeout(1300);
  await page.screenshot({ path: `${out}/${name}-${width}-${y}.png` });
}
const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
console.log(JSON.stringify({ overflow, height: await page.evaluate(() => document.documentElement.scrollHeight), logs }, null, 1));
await browser.close();
