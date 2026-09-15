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

  const connectionLine = page.getByRole("button", { name: "人物と近代化の接続の説明を表示" });
  await connectionLine.click();
  const lineExplanation = page.getByRole("complementary", { name: "接続線の説明" });
  await expect(lineExplanation).toContainText("人物と近代化の接続");
  await expect(camera.getByText("人物と近代化の接続", { exact: true })).toBeVisible();
  await page.waitForTimeout(750);

  await connectionLine.click();
  await expect(lineExplanation).toHaveCount(0);
  await expect(camera.getByText("現在の表示範囲", { exact: true })).toBeVisible();
  await connectionLine.click();
  await expect(lineExplanation).toContainText("人物と近代化の接続");
  await page.waitForTimeout(750);

  const clickSpotCenter = async (spot: typeof secondSpot) => {
    const box = await spot.boundingBox();
    expect(box).not.toBeNull();
    await page.mouse.click(box!.x + box!.width / 2, box!.y + box!.height / 2);
  };
  await clickSpotCenter(secondSpot);
  await expect(page.getByRole("heading", { name: "萩反射炉", level: 2 })).toBeVisible();
  await expect(camera.getByText("萩反射炉", { exact: true })).toBeVisible();
  await expect(lineExplanation).toContainText("人物と近代化の接続");
  await page.waitForTimeout(750);

  await clickSpotCenter(secondSpot);
  await expect(secondSpot).toHaveAttribute("data-active", "false");
  await expect(page.getByRole("heading", { name: "萩反射炉", level: 2 })).toHaveCount(0);
  await expect(camera.getByText("現在の表示範囲", { exact: true })).toBeVisible();
  await expect(lineExplanation).toContainText("人物と近代化の接続");

  await page.getByRole("button", { name: "接続の説明を閉じる" }).click();
  await expect(lineExplanation).toHaveCount(0);
  await expect(camera.getByText("現在の表示範囲", { exact: true })).toBeVisible();

  const legend = page.getByLabel("地図の地点状態");
  await expect(legend).toContainText("選択中");
  await expect(legend).toContainText("訪問済み");
  await expect(legend).toContainText("候補");
  await expect(legend).not.toContainText("Knowledge Pack");
  await expect(legend).not.toContainText("旅行記の接続");
  await expect(legend).toContainText("史跡・歴史建築");
  await expect(page.locator('button[data-spot-id="layout-spot-person"]')).toHaveAttribute("data-category", "historic");
  await expect(page.locator('button[data-spot-id="layout-area-context"]')).toHaveCount(0);
});

test("focuses a selected journey as a whole until a connection is selected", async ({ page }) => {
  await page.goto("/review");

  await expect(page.getByRole("link", { name: "旅行記を追加" })).toHaveAttribute("href", "/imports");

  const camera = page.getByLabel("地図の表示範囲");
  await expect(page.getByText("全3地点を表示します。行政区域は文脈として保持し、訪問地点には数えません。", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "匿名確認の訪問順の説明を表示" })).toHaveCount(0);
  await page.getByRole("button", { name: "匿名確認 3地点", exact: true }).click();

  await expect(page.getByText("匿名確認の3地点を表示します。旅程を選んだときだけ訪問順も表示します。", { exact: true })).toBeVisible();
  await expect(page.getByText("匿名確認を、時代・人物・宗教などの構造で見直す", { exact: true })).toBeVisible();
  await expect(camera.getByText("表示中の訪問範囲", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "人物と近代化の接続の説明を表示" })).toBeAttached();
  await expect(page.getByRole("button", { name: "匿名確認の訪問順の説明を表示" })).toBeAttached();

  await page.getByRole("button", { name: "匿名確認の訪問順の説明を表示" }).press("Enter");
  await expect(camera.getByText("匿名確認の訪問順", { exact: true })).toBeVisible();
});

test("reveals the paleo-water guide without moving the map camera", async ({ page }) => {
  await page.goto("/review");

  const camera = page.getByLabel("地図の表示範囲");
  const initialCamera = await camera.textContent();
  const toggle = page.getByRole("checkbox", { name: /古地形を重ねる/ });

  await toggle.check();

  await expect(page.getByText("表示中", { exact: true })).toBeVisible();
  await expect(page.getByText("仮想水域（+5m）", { exact: true })).toBeVisible();
  await page.getByLabel("仮想海抜").selectOption("10");
  await expect(page.getByText("仮想水域（+10m）", { exact: true })).toBeVisible();
  await page.getByLabel("仮想海抜").selectOption("30");
  await expect(page.getByText("仮想水域（+30m）", { exact: true })).toBeVisible();
  await expect(camera).toHaveText(initialCamera ?? "");
});
