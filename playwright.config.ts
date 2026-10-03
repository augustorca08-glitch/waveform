import { defineConfig, devices } from "@playwright/test";

/** Corre contra el build de producción en :3200 (sin overlay de desarrollo). */
export default defineConfig({
  testDir: "tests",
  outputDir: "test-results",
  fullyParallel: true,
  workers: 4,
  retries: 0,
  timeout: 60_000,
  expect: { timeout: 8_000 },
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],
  use: {
    baseURL: "http://localhost:3200",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "desktop-1280", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 720 } } },
    { name: "mobile", use: { ...devices["Pixel 7"], viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 } },
    { name: "mobile-375", use: { ...devices["Pixel 7"], viewport: { width: 375, height: 812 }, deviceScaleFactor: 2 } },
  ],
  webServer: {
    command: "npx next start -p 3200",
    url: "http://localhost:3200",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
