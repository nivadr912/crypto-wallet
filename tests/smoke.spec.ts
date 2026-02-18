import { test, expect } from "@playwright/test";

test("dashboard renders with required testids", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByTestId("app-shell")).toBeVisible();
  await expect(page.getByTestId("total-balance")).toBeVisible();
  await expect(page.getByTestId("day-change")).toBeVisible();
  await expect(page.getByTestId("holdings-table")).toBeVisible();
  await expect(page.getByTestId("refresh-prices")).toBeVisible();

  // Ensure refresh is wired up (mock refresh)
  await page.getByTestId("refresh-prices").click();

  // Still visible after refresh click
  await expect(page.getByTestId("holdings-table")).toBeVisible();
});
