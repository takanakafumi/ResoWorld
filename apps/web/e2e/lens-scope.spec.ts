import { expect, test } from "@playwright/test";

const expectedLensNames = {
  all: ["訪問マップ", "神・系譜", "宗教", "政治・社会", "人物"],
  history: ["訪問マップ", "政治・社会", "人物"],
  belief: ["訪問マップ", "神・系譜", "宗教"],
} as const;

async function expectLensNames(page: import("@playwright/test").Page, names: readonly string[]) {
  const lensNav = page.getByRole("navigation", { name: "探索を見直すレンズ" });
  await expect(lensNav.getByRole("button")).toHaveText(names);
}

test("shows only LENS topics directly supported by the selected journey", async ({ page }) => {
  await page.goto("/review");

  await expectLensNames(page, expectedLensNames.all);

  await page.getByRole("button", { name: "人物・産業確認 2地点", exact: true }).click();
  await expectLensNames(page, expectedLensNames.history);

  await page.getByRole("button", { name: "祭祀確認 1地点", exact: true }).click();
  await expectLensNames(page, expectedLensNames.belief);
  await expect(page.getByRole("button", { name: "政治・社会", exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "人物", exact: true })).toHaveCount(0);
});

test("resets to the visit map when changing to a journey without the active LENS", async ({ page }) => {
  await page.goto("/review");
  await page.getByRole("button", { name: "人物", exact: true }).click();
  await expect(page.getByRole("complementary", { name: "人物ネットワークレンズ" })).toBeVisible();

  await page.getByRole("button", { name: "祭祀確認 1地点", exact: true }).click();

  await expect(page.getByRole("button", { name: "訪問マップ", exact: true })).toHaveAttribute("data-active", "true");
  await expect(page.getByRole("complementary", { name: "人物ネットワークレンズ" })).toHaveCount(0);
});
