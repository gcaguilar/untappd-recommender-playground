import { test as base, expect } from "@playwright/test"

type TestFixtures = {
  mockApiError: () => Promise<void>
  mockApiDelay: (ms: number) => Promise<void>
}

export const test = base.extend<TestFixtures>({
  mockApiError: async ({ page }, use) => {
    await use(async () => {
      await page.route("**/api/beers*", async (route) => {
        await route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ error: "Internal server error" }),
        })
      })
    })
  },

  mockApiDelay: async ({ page }, use) => {
    await use(async (ms: number) => {
      await page.route("**/api/beers*", async (route) => {
        await new Promise((r) => setTimeout(r, ms))
        await route.continue()
      })
    })
  },
})

export { expect }
