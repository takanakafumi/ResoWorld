import { expect, test } from "@playwright/test";

test("keeps visited spots clickable before and after selecting a connection line", async ({ page }) => {
  await page.goto("/review");

  const camera = page.getByLabel("地図の表示範囲");
  const firstSpot = page.locator('button[data-spot-id="layout-spot-person"]');
  const secondSpot = page.locator('button[data-spot-id="layout-spot-industry"]');

  await page.getByRole("button", { name: "人物", exact: true }).click();
  const lensReference = page.locator('button[data-kind="lens"]').first();
  await expect(lensReference).toBeAttached();
  const [spotZIndex, lensZIndex] = await Promise.all([
    secondSpot.evaluate((element) => Number(getComputedStyle(element).zIndex)),
    lensReference.evaluate((element) => Number(getComputedStyle(element).zIndex)),
  ]);
  expect(spotZIndex).toBeGreaterThan(lensZIndex);
  await page.getByRole("button", { name: "訪問マップ", exact: true }).click();
  await expect(page.locator('button[data-kind="lens"]')).toHaveCount(0);

  await secondSpot.click();
  await expect(page.getByRole("heading", { name: "萩反射炉", level: 2 })).toBeVisible();
  await expect(camera.getByText("萩反射炉", { exact: true })).toBeVisible();

  await firstSpot.click();
  await expect(page.getByRole("heading", { name: "高杉晋作誕生地", level: 2 })).toBeVisible();
  await expect(camera.getByText("高杉晋作誕生地", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "人物と近代化の接続の説明を表示" }).click();
  const lineExplanation = page.getByRole("complementary", { name: "接続線の説明" });
  await expect(lineExplanation).toContainText("人物と近代化の接続");
  await expect(camera.getByText("人物と近代化の接続", { exact: true })).toBeVisible();

  await secondSpot.click();
  await expect(page.getByRole("heading", { name: "萩反射炉", level: 2 })).toBeVisible();
  await expect(camera.getByText("萩反射炉", { exact: true })).toBeVisible();
});
