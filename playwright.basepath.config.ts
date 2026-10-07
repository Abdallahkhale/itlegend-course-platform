import { defineConfig } from "@playwright/test";
import mainConfig from "./playwright.config";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH?.replace(/\/+$/, "") || "/itlegend-course-platform";
const origin = "http://127.0.0.1:3001";

export default defineConfig({
  ...mainConfig,
  testIgnore: [],
  testMatch: "**/base-path.spec.ts",
  use: { ...mainConfig.use, baseURL: origin },
  webServer: {
    command: "npm run start -- --port 3001",
    url: `${origin}${basePath}/`,
    env: { NEXT_PUBLIC_BASE_PATH: basePath },
    reuseExistingServer: false,
    timeout: 30000,
  },
});
