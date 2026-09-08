import { expect, test } from "@playwright/test";

test("reviews a multi-document Journey without changing the Atlas", async ({ page }) => {
  await page.route("**/api/place-candidates", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ ok: true, query: "訪問地点A", cached: false, candidates: [{
        id: "node:sample",
        provider: "nominatim",
        displayName: "訪問地点A, 日本",
        latitude: 35,
        longitude: 135,
        category: "place",
        type: "historic",
        address: { country: "日本" },
        attribution: "© OpenStreetMap contributors",
      }] }),
    });
  });
  await page.route("**/api/journey-place-reviews", async (route) => {
    await route.fulfill({ contentType: "application/json", body: JSON.stringify({ ok: true, file: "sample.place-review.json" }) });
  });
  await page.goto("/imports?candidate=sample.journey-candidate.json");

  const review = page.getByRole("region", { name: "Journey地点候補レビュー" });
  await expect(review.getByRole("heading", { name: "匿名の複数文書探索" })).toBeVisible();
  await expect(review).toContainText("2");
  await expect(page.getByLabel("訪問地点Aの分類")).toHaveValue("visited");
  await expect(page.getByLabel("古代地名Bの分類")).toHaveValue("mentioned");

  await page.getByLabel("古代地名Bの分類").selectOption("historical_candidate");
  await expect(page.getByLabel("古代地名Bの分類")).toHaveValue("historical_candidate");
  await expect(review).toContainText("古代地名・比定候補");
  await expect(review.getByRole("button", { name: "このPCに保存" })).toBeEnabled();
  await expect(review.getByRole("button", { name: "位置候補を検索" })).toHaveCount(1);
  await review.getByRole("button", { name: "位置候補を検索" }).click();
  await expect(review.getByText("訪問地点A, 日本")).toBeVisible();
  await review.getByRole("radio").check();
  await expect(review.getByRole("radio")).toBeChecked();
  const preview = page.getByRole("region", { name: "Atlas反映前の位置候補プレビュー" });
  await expect(preview).toContainText("1地点を選択中");
  await expect(preview.locator("canvas")).toBeVisible();
  await review.getByRole("button", { name: "このPCに保存" }).click();
  await expect(review).toContainText("このPCの非公開Review領域へ保存しました");
});
