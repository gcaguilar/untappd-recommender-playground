import { defineConfig, devices } from "@playwright/test"

const PORT = 4321

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile",
      use: { ...devices["Pixel 5"] },
    },
  ],
  webServer: {
    command: `TEST_MODE=true USE_UNTAPPD_MOCK=true ASTRO_DEV_TOOLBAR=off bun run dev --port ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    stdout: "pipe",
    stderr: "pipe",
    env: {
      TEST_MODE: "true",
      USE_UNTAPPD_MOCK: "true",
      ASTRO_DEV_TOOLBAR: "off",
    },
  },
})
