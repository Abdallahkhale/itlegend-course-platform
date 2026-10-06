import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { launch } from "chrome-launcher";
import lighthouse from "lighthouse";
import desktopConfig from "lighthouse/core/config/desktop-config.js";

const windowsChrome = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const chromePath = process.env.CHROME_PATH || (existsSync(windowsChrome) ? windowsChrome : undefined);
await mkdir("test-results/audits", { recursive: true });
const chrome = await launch({ chromePath, chromeFlags: ["--headless=new", "--disable-gpu"], logLevel: "silent" });
const summaries = [];
try {
  for (const route of ["courses", "courses/starting-seo"]) {
    for (const formFactor of ["mobile", "desktop"]) {
      const result = await lighthouse(`http://127.0.0.1:3000/${route}/`, {
        port: chrome.port,
        logLevel: "error",
        output: "json",
        onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
        ...(formFactor === "desktop" ? { screenEmulation: { mobile: false, width: 1252, height: 900, deviceScaleFactor: 1, disabled: false } } : {}),
      }, formFactor === "desktop" ? desktopConfig : undefined);
      const name = `${route.replaceAll("/", "-")}-${formFactor}`;
      await writeFile(`test-results/audits/${name}.json`, JSON.stringify(result.lhr, null, 2));
      const summary = {
        route, formFactor,
        scores: Object.fromEntries(Object.entries(result.lhr.categories).map(([key, value]) => [key, Math.round(value.score * 100)])),
        metrics: Object.fromEntries(["first-contentful-paint", "largest-contentful-paint", "total-blocking-time", "cumulative-layout-shift"].map((key) => [key, { value: result.lhr.audits[key].numericValue, display: result.lhr.audits[key].displayValue }])),
        consoleErrors: result.lhr.audits["errors-in-console"].details?.items ?? [],
      };
      summaries.push(summary);
      process.stdout.write(`${JSON.stringify(summary)}\n`);
    }
  }
} finally { await chrome.kill(); }
await writeFile("test-results/audits/summary.json", JSON.stringify(summaries, null, 2));
