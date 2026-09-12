import { expect, test } from "@playwright/test";

test("prepares a manual visit note without saving before explicit confirmation", async ({ page }) => {
  await page.goto("/imports");

  const panel = page.getByText("旅行記にない訪問を追記", { exact: true });
  await expect(panel).toBeVisible();
  await panel.click();

  const journey = page.getByLabel("旅程");
  const spot = page.getByLabel("訪問地点");
  const note = page.getByLabel("訪問メモ");
  const consent = page.getByLabel("このメモを、自分の訪問記録としてローカルDatasetへ保存する");
  const save = page.getByRole("button", { name: "訪問の根拠を保存" });
  await expect(journey).toBeVisible();
  await expect(spot.locator("option")).not.toHaveCount(0);
  await note.fill("訪問時に建物と展示を確認した。");
  await expect(save).toBeDisabled();
  await consent.check();
  await expect(save).toBeEnabled();

  await page.getByLabel("地点の状態").selectOption("new");
  const placeName = page.getByLabel("新しい地点名");
  const reviewPosition = page.getByRole("button", { name: "保存して位置を確認" });
  await expect(placeName).toBeVisible();
  await expect(reviewPosition).toBeDisabled();
  await placeName.fill("新しい訪問地点");
  await expect(reviewPosition).toBeEnabled();
});
