import { chromium } from "playwright-core";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const base = process.env.KALIMA_URL ?? "http://127.0.0.1:1420";
const outDir = fileURLToPath(new URL("../shots/", import.meta.url));
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ channel: "msedge", headless: true });
const page = await browser.newPage({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
});

const errors = [];
page.on("console", (message) => {
  if (message.type() === "error") errors.push(message.text());
});
page.on("pageerror", (error) => errors.push(String(error)));

await page.goto(base, { waitUntil: "load" });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: "load" });
await page.evaluate(() => document.fonts.ready);

// Complete one review session.
await page.getByRole("button", { name: /Start review/i }).click();
for (let i = 0; i < 10; i += 1) {
  const show = page.getByRole("button", { name: /Show answer/i });
  if (await show.isVisible()) await show.click();
  await page.getByRole("button", { name: /^Good/i }).click();
  await page.waitForTimeout(60);
}
await page.getByRole("heading", { name: /A little more/i }).waitFor();
await page.screenshot({ path: path.join(outDir, "flow-summary.png") });
console.log("review flow reached summary");

// Finish and visit words, then add a word.
const finish = page.getByRole("button", { name: /Finish for now/i });
const backHome = page.getByRole("button", { name: /Back to home/i });
if (await finish.isVisible()) {
  await finish.click();
} else {
  await backHome.click();
}
await page.getByRole("button", { name: "Words", exact: true }).click();
await page.getByRole("button", { name: /Add word/i }).first().click();
await page.getByLabel("Arabic").fill("سَلَام");
await page.getByLabel("Transliteration").fill("salām");
await page.getByLabel("English meaning").fill("peace");
await page.locator(".sheet-footer .save-btn").click();
await page.getByText("Word added").waitFor();
await page.getByPlaceholder("Search Arabic or English").fill("salām");
if ((await page.getByText("peace").count()) === 0) {
  throw new Error("Added word did not appear in search");
}
await page.screenshot({ path: path.join(outDir, "flow-words-added.png") });
console.log("add word flow passed");

// Import a CSV into a new deck.
await page.getByRole("button", { name: /MSA Essentials/ }).click();
const csv = "arabic,transliteration,english,notes\nشَمْس,shams,sun,Root: ش-م-س\nقَمَر,qamar,moon,\n";
await page.locator('input[type="file"]').setInputFiles({
  name: "nature.csv",
  mimeType: "text/csv",
  buffer: Buffer.from(csv),
});
await page.getByText(/Imported 2 words/).waitFor();
if ((await page.getByText("nature", { exact: true }).count()) === 0) {
  throw new Error("Imported deck did not become active");
}
console.log("CSV import flow passed");

// Settings: dark theme, transliteration toggle, then reload persistence.
await page.getByRole("button", { name: "Settings", exact: true }).click();
await page.getByRole("radio", { name: /Dark/i }).click();
await page.waitForTimeout(250);
const theme = await page.evaluate(() => document.documentElement.dataset.theme);
if (theme !== "dark") throw new Error(`Theme did not apply, got ${theme}`);
await page.getByRole("switch", { name: /Show transliteration/i }).click();
await page.reload({ waitUntil: "load" });
const stored = await page.evaluate(() => {
  const raw = localStorage.getItem("kalima.library.v1");
  const lib = raw ? JSON.parse(raw) : null;
  return { theme: lib?.settings?.theme, translit: lib?.settings?.showTransliteration };
});
if (stored.theme !== "dark" || stored.translit !== false) {
  throw new Error(`Settings did not persist: ${JSON.stringify(stored)}`);
}
await page.getByRole("button", { name: "Settings", exact: true }).click();
await page.waitForTimeout(500);
await page.screenshot({ path: path.join(outDir, "flow-settings-dark.png") });
console.log("settings persistence passed");

// Android back contract: a sheet consumes the press, screens go home, and
// home lets the system handle it (which exits the app on device).
const pressBack = () => page.evaluate(() => window.kalimaBack?.() ?? false);

await page.getByRole("button", { name: "Words", exact: true }).click();
await page.getByRole("button", { name: /Add word/i }).first().click();
await page.getByRole("dialog").waitFor();
if (!(await pressBack())) throw new Error("Back was not consumed by the word sheet");
await page.getByRole("dialog").waitFor({ state: "detached" });
if (!(await pressBack())) throw new Error("Back was not consumed by the words screen");
await page.getByRole("heading", { name: /A few words/i }).waitFor();
if (await pressBack()) throw new Error("Home should release back to the system");
console.log("back navigation passed");

if (errors.length > 0) {
  console.error("Browser errors:\n" + errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log("no browser console errors");
}

await browser.close();
