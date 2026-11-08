import { chromium } from "playwright-core";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const base = process.env.KALIMA_URL ?? "http://127.0.0.1:1420";
const outDir = fileURLToPath(new URL("../shots/", import.meta.url));
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({
  channel: "msedge",
  headless: true,
});

const page = await browser.newPage({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  colorScheme: "light",
});

const shots = [
  ["home-light", "screen=home&theme=light"],
  ["home-dark", "screen=home&theme=dark"],
  ["words-light", "screen=words&theme=light"],
  ["words-dark", "screen=words&theme=dark"],
  ["settings-light", "screen=settings&theme=light"],
  ["settings-dark", "screen=settings&theme=dark"],
  ["review-light", "screen=review&theme=light"],
  ["review-revealed-dark", "screen=review&theme=dark&revealed=1"],
  ["summary-light", "screen=summary&theme=light"],
  ["summary-dark", "screen=summary&theme=dark"],
];

for (const [name, query] of shots) {
  await page.goto(`${base}/?${query}`, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(900);
  await page.screenshot({ path: path.join(outDir, `${name}.png`) });
  console.log(`captured ${name}`);
}

await browser.close();
