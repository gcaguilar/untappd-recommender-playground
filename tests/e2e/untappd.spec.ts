import { test, expect } from "../fixtures/test"

async function fillUsername(page: any, username: string) {
  const input = page.getByTestId("username-input")
  await input.waitFor({ state: "visible" })
  
  // Wait for React hydration
  await page.waitForFunction(() => {
    const el = document.querySelector('[data-testid="username-input"]')
    return el && Object.keys(el).some(k => k.startsWith('__react'))
  }, { timeout: 10000 })
  
  // Use evaluate to properly set value and trigger React's onChange
  await input.evaluate((el: any, value: string) => {
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set
    if (nativeInputValueSetter) {
      nativeInputValueSetter.call(el, value)
      el.dispatchEvent(new Event('input', { bubbles: true }))
    }
  }, username)
  
  await page.waitForTimeout(200)
  await expect(page.getByTestId("submit-button")).toBeEnabled({ timeout: 5000 })
}

test.describe("Untappd App", () => {
  test("shows username input on home page", async ({ page }) => {
    await page.goto("/")

    await expect(page.getByRole("heading", { name: "Untappd Beer Recommender" })).toBeVisible({ timeout: 10000 })
    await expect(page.getByTestId("username-input")).toBeVisible({ timeout: 10000 })
    await expect(page.getByTestId("submit-button")).toBeVisible()
  })

  test("submit button is disabled when username is empty", async ({ page }) => {
    await page.goto("/")

    await expect(page.getByTestId("username-input")).toBeVisible({ timeout: 10000 })
    const submitBtn = page.getByTestId("submit-button")
    await expect(submitBtn).toBeDisabled()
  })

  test("loads user history for valid username", async ({ page }) => {
    await page.goto("/")

    await expect(page.getByTestId("username-input")).toBeVisible({ timeout: 10000 })
    await fillUsername(page, "beerfan")

    const submitBtn = page.getByTestId("submit-button")
    await submitBtn.click()

    await expect(page.getByRole("heading", { name: "beerfan" })).toBeVisible({ timeout: 15000 })
  })

  test("shows error for non-existent user", async ({ page }) => {
    await page.goto("/")

    await expect(page.getByTestId("username-input")).toBeVisible({ timeout: 10000 })
    await fillUsername(page, "nonexistentuser12345")

    const submitBtn = page.getByTestId("submit-button")
    await submitBtn.click()

    await expect(page.getByText(/User not found|Usuario no encontrado/)).toBeVisible({ timeout: 10000 })
  })

  test("shows error for private user", async ({ page }) => {
    await page.goto("/")

    await expect(page.getByTestId("username-input")).toBeVisible({ timeout: 10000 })
    await fillUsername(page, "privateuser")

    const submitBtn = page.getByTestId("submit-button")
    await submitBtn.click()

    await expect(page.getByText(/private|privado/)).toBeVisible({ timeout: 10000 })
  })

  test("displays user stats after loading history", async ({ page }) => {
    await page.goto("/")

    await expect(page.getByTestId("username-input")).toBeVisible({ timeout: 10000 })
    await fillUsername(page, "beerfan")

    const submitBtn = page.getByTestId("submit-button")
    await submitBtn.click()

    await expect(page.getByRole("heading", { name: "beerfan" })).toBeVisible({ timeout: 15000 })
    await expect(page.getByText("Check-ins")).toBeVisible()
  })

  test("can select a beer and see recommendations", async ({ page }) => {
    await page.goto("/")

    await expect(page.getByTestId("username-input")).toBeVisible({ timeout: 10000 })
    await fillUsername(page, "beerfan")

    const submitBtn = page.getByTestId("submit-button")
    await submitBtn.click()

    await expect(page.getByRole("heading", { name: "beerfan" })).toBeVisible({ timeout: 15000 })

    const firstBeer = page.locator("div.cursor-pointer, div.group").first()
    await firstBeer.click({ timeout: 10000 })

    await expect(page.getByText("Top Recommendations")).toBeVisible({ timeout: 15000 })
  })

  test("can navigate back from recommendations to history", async ({ page }) => {
    await page.goto("/")

    await expect(page.getByTestId("username-input")).toBeVisible({ timeout: 10000 })
    await fillUsername(page, "beerfan")

    const submitBtn = page.getByTestId("submit-button")
    await submitBtn.click()

    await expect(page.getByRole("heading", { name: "beerfan" })).toBeVisible({ timeout: 15000 })

    const firstBeer = page.locator("div.cursor-pointer, div.group").first()
    await firstBeer.click({ timeout: 10000 })

    await expect(page.getByText("Top Recommendations")).toBeVisible({ timeout: 15000 })

    const backBtn = page.getByRole("button", { name: "Back to history" })
    await backBtn.click()

    await expect(page.getByRole("heading", { name: "beerfan" })).toBeVisible({ timeout: 10000 })
  })

  test("can navigate back from history to input", async ({ page }) => {
    await page.goto("/")

    await expect(page.getByTestId("username-input")).toBeVisible({ timeout: 10000 })
    await fillUsername(page, "beerfan")

    const submitBtn = page.getByTestId("submit-button")
    await submitBtn.click()

    await expect(page.getByRole("heading", { name: "beerfan" })).toBeVisible({ timeout: 15000 })

    const backBtn = page.getByRole("button", { name: "Change user" })
    await backBtn.click()

    await expect(page.getByTestId("username-input")).toBeVisible({ timeout: 10000 })
  })
})
