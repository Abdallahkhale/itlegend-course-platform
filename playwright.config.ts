import { existsSync } from "node:fs";
import { defineConfig, devices } from "@playwright/test";

const chrome = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || (existsSync(chrome) ? chrome : undefined);

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    launchOptions: { executablePath },
  },
  projects: [
    { name: "desktop", use: { viewport: { width: 1252, height: 900 } } },
    { name: "mobile", use: { ...devices["iPhone 13 Pro Max"], browserName: "chromium", viewport: { width: 430, height: 932 } } },
  ],
  webServer: { command: "npm run start -- --port 3000", url: "http://127.0.0.1:3000", reuseExistingServer: true, timeout: 30000 },
});
