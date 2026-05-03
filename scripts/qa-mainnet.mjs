import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const url = "https://v7inb-hyaaa-aaaal-qw7aq-cai.icp0.io/";
const screenshotDir = "docs/qa/screenshots/current";

mkdirSync(screenshotDir, { recursive: true });

async function check(viewport, label) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport });
  const logs = [];

  page.on("console", (message) => {
    if (["error", "warning"].includes(message.type())) {
      logs.push(`${message.type()}: ${message.text()}`);
    }
  });
  page.on("pageerror", (error) => logs.push(`pageerror: ${error.message}`));

  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.waitForSelector("h1", { timeout: 20_000 });
  await page.waitForTimeout(1_200);

  const result = await page.evaluate(() => ({
    title: document.querySelector("h1")?.innerText,
    hasCreatorEmail: document.body.innerText.includes("robert19001@gmail.com"),
    hasClient: document.body.innerText.includes("Aster Capital room"),
    hasPIIEmail: document.body.innerText.includes("marta@example.com"),
    scrollW: document.documentElement.scrollWidth,
    innerW: innerWidth,
  }));

  await page.screenshot({ path: join(screenshotDir, `qa-mainnet-current-${label}.png`), fullPage: true });
  await browser.close();

  return { label, result, logs };
}

const results = [
  await check({ width: 1440, height: 1000 }, "desktop"),
  await check({ width: 390, height: 844 }, "mobile"),
];

console.log(JSON.stringify(results, null, 2));

const failures = results.flatMap((item) => {
  const problems = [];
  if (item.logs.length) problems.push(`${item.label}: console warnings/errors`);
  if (!item.result.hasCreatorEmail) problems.push(`${item.label}: creator email missing`);
  if (!item.result.hasClient) problems.push(`${item.label}: public client surface missing`);
  if (item.result.hasPIIEmail) problems.push(`${item.label}: private client email leaked`);
  if (item.result.scrollW !== item.result.innerW) problems.push(`${item.label}: horizontal overflow`);
  return problems;
});

if (failures.length) {
  throw new Error(failures.join("; "));
}
