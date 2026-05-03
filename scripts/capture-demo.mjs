import { chromium } from "playwright";
import { mkdirSync, renameSync, rmSync } from "node:fs";
import { join } from "node:path";

const url = "https://v7inb-hyaaa-aaaal-qw7aq-cai.icp0.io/";
const outputDir = "docs/qa/screenshots/demo";

mkdirSync(outputDir, { recursive: true });
rmSync(join(outputDir, "sovereign-desk-desktop.webm"), { force: true });
rmSync(join(outputDir, "sovereign-desk-mobile.webm"), { force: true });

const viewports = [
  ["desktop", { width: 1440, height: 1000 }],
  ["mobile", { width: 390, height: 844 }],
];

const browser = await chromium.launch({ headless: true });

for (const [label, viewport] of viewports) {
  const page = await browser.newPage({
    viewport,
    recordVideo: {
      dir: outputDir,
      size: viewport,
    },
  });
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.waitForSelector("h1", { timeout: 20_000 });
  await page.screenshot({ path: join(outputDir, `sovereign-desk-${label}.png`), fullPage: true });
  await page.locator("a[href='#trust']").first().click().catch(() => undefined);
  await page.waitForTimeout(1_200);
  await page.screenshot({ path: join(outputDir, `sovereign-desk-trust-${label}.png`), fullPage: true });
  const video = page.video();
  await page.close();
  if (video) {
    renameSync(await video.path(), join(outputDir, `sovereign-desk-${label}.webm`));
  }
}

await browser.close();

console.log(JSON.stringify({ outputDir, url }, null, 2));
