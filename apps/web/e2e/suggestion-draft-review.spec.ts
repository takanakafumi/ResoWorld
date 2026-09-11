import { expect, test } from "@playwright/test";

test("reviews and explicitly adopts a local Suggestion draft", async ({ page }) => {
  let submitted: unknown = null;
  await page.route("**/api/suggestion-draft-apply", async (route) => {
    submitted = route.request().postDataJSON();
    await route.fulfill({ contentType: "application/json", body: JSON.stringify({ ok: true, added: 1, total: 2, atlasFile: "layout-atlas.json", backupFile: "backup.json" }) });
  });
  await page.goto("/imports");

  const review = page.getByRole("region", { name: "Suggestion下書きレビュー" });
  await expect(review.getByRole("heading", { name: "次の接続候補を確認する" })).toBeVisible();
  await expect(review).toContainText("人物の学びは地域の技術導入とどのようにつながったのか？");
  await expect(review).toContainText("未採用");
  const adopt = review.getByRole("button", { name: "0件をAtlasへ採用" });
  await expect(adopt).toBeDisabled();

  await review.getByRole("checkbox").check();
  await review.getByText("根拠と不確実性を確認").click();
  await expect(review).toContainText("高杉晋作と長州の教育・政治の関係を訪問から考えた。");
  await review.getByRole("button", { name: "1件をAtlasへ採用" }).click();

  await expect(review).toContainText("1件をAtlasへ採用しました。");
  await expect(review.getByRole("link", { name: "Reviewで確認 →" })).toBeVisible();
  expect(submitted).toEqual({ draftFile: "layout.ollama.json", selectedIndexes: [0], consent: "apply_reviewed_suggestion_drafts" });
});
