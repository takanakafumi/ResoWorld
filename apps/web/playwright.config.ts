import { existsSync } from "node:fs";
import { resolve } from "node:path";

import { defineConfig } from "@playwright/test";

const fixtureRoot = resolve(process.cwd(), "e2e/fixtures");
const chromePath = process.env.PLAYWRIGHT_CHROME_PATH ?? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  use: {
    baseURL: "http://localhost:3100",
    viewport: { width: 1440, height: 1000 },
    launchOptions: existsSync(chromePath) ? { executablePath: chromePath } : undefined,
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "pnpm dev --port 3100",
    url: "http://localhost:3100/review",
    reuseExistingServer: true,
    timeout: 120_000,
    env: {
      RESOWORLD_NEXT_DIST_DIR: ".next-playwright",
      RESOWORLD_REVIEW_ENABLED: "true",
      RESOWORLD_REVIEW_DIR: fixtureRoot,
      RESOWORLD_REVIEW_FILE: "layout-dataset.json",
      RESOWORLD_REVIEW_ATLAS_FILE: "layout-atlas.json",
      RESOWORLD_LOCAL_IMPORT_ENABLED: "true",
      RESOWORLD_IMPORT_DIR: fixtureRoot,
    },
  },
});
