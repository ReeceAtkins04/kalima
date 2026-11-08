import { chromium } from "playwright-core";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const font = await readFile(
  path.join(root, "node_modules/@fontsource/amiri/files/amiri-arabic-400-normal.woff2"),
);
const fontData = font.toString("base64");

const browser = await chromium.launch({ channel: "msedge", headless: true });
const page = await browser.newPage({
  viewport: { width: 1024, height: 1024 },
  deviceScaleFactor: 1,
});

await page.setContent(`<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<style>
  @font-face {
    font-family: "Amiri";
    src: url(data:font/woff2;base64,${fontData}) format("woff2");
    font-weight: 400;
    font-style: normal;
  }
  * { box-sizing: border-box; }
  html, body { margin: 0; width: 1024px; height: 1024px; overflow: hidden; }
  body {
    display: grid;
    place-items: center;
    background:
      radial-gradient(70% 70% at 76% 12%, rgba(120, 200, 164, 0.38), transparent 60%),
      linear-gradient(150deg, #116a50 0%, #0e5a43 46%, #083e2e 100%);
    position: relative;
  }
  .ring {
    position: absolute;
    width: 700px;
    height: 700px;
    border: 3px solid rgba(199, 163, 75, 0.26);
    border-radius: 50%;
  }
  .ring::after {
    content: "";
    position: absolute;
    inset: 34px;
    border: 1.5px solid rgba(251, 248, 239, 0.14);
    border-radius: 50%;
  }
  .kaf {
    font-family: "Amiri", serif;
    font-size: 590px;
    line-height: 1;
    color: #fbf8ef;
    transform: translateY(-18px);
    text-shadow: 0 26px 60px rgba(0, 0, 0, 0.22);
    letter-spacing: 0;
  }
  .dot {
    position: absolute;
    top: 188px;
    right: 194px;
    width: 88px;
    height: 88px;
    border-radius: 50%;
    background: linear-gradient(145deg, #ddc075, #b98f35);
    box-shadow:
      0 0 0 18px rgba(199, 163, 75, 0.12),
      0 10px 28px rgba(0, 0, 0, 0.2);
  }
  .arc {
    position: absolute;
    bottom: 176px;
    width: 170px;
    height: 2px;
    background: linear-gradient(90deg, transparent, rgba(199, 163, 75, 0.75), transparent);
  }
</style>
</head>
<body>
  <div class="ring"></div>
  <div class="kaf" lang="ar" dir="rtl">ك</div>
  <div class="arc"></div>
  <div class="dot"></div>
</body>
</html>`);
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(250);
await page.screenshot({
  path: path.join(root, "src-tauri/icons/source.png"),
  omitBackground: false,
});
await browser.close();
console.log("wrote src-tauri/icons/source.png");
