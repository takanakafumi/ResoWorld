import { expect, test } from "@playwright/test";

test("reviews a multi-document Journey without changing the Atlas", async ({ page }) => {
  await page.goto("/imports?candidate=sample.journey-candidate.json");

  const review = page.getByRole("region", { name: "Journey地点候補レビュー" });
  await expect(review.getByRole("heading", { name: "匿名の複数文書探索" })).toBeVisible();
  await expect(review).toContainText("2");
  await expect(page.getByLabel("訪問地点Aの分類")).toHaveValue("visited");
  await expect(page.getByLabel("古代地名Bの分類")).toHaveValue("mentioned");

  await page.getByLabel("古代地名Bの分類").selectOption("historical_candidate");
  await expect(page.getByLabel("古代地名Bの分類")).toHaveValue("historical_candidate");
  await expect(review).toContainText("古代地名・比定候補");
  await expect(review.getByRole("button", { name: "地点分類Review Draftを保存" })).toBeEnabled();
});
