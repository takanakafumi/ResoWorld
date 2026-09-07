import { expect, test, type Locator } from "@playwright/test";

async function expectDiagramSeparateFromExplanation(
  diagram: Locator,
  explanation: Locator,
) {
  const [diagramBox, explanationBox] = await Promise.all([
    diagram.boundingBox(), explanation.boundingBox(),
  ]);
  expect(diagramBox).not.toBeNull();
  expect(explanationBox).not.toBeNull();
  const separatedHorizontally = explanationBox!.x >= diagramBox!.x + diagramBox!.width
    || diagramBox!.x >= explanationBox!.x + explanationBox!.width;
  const separatedVertically = explanationBox!.y >= diagramBox!.y + diagramBox!.height
    || diagramBox!.y >= explanationBox!.y + explanationBox!.height;
  expect(separatedHorizontally || separatedVertically).toBe(true);
}

test("keeps the people diagram separate from its explanation in both desktop layouts", async ({ page }) => {
  await page.goto("/review");
  await page.getByRole("button", { name: "人物", exact: true }).click();

  const map = page.getByRole("region", { name: "訪問マップ" });
  const lens = page.getByRole("complementary", { name: "人物ネットワークレンズ" });
  const diagram = page.getByRole("img", { name: "維新志士と藩・事件の関係図" });
  const explanation = page.getByRole("region", { name: "選択した人物・接続の説明" });

  await expect(page.getByText("維新志士の人物網", { exact: true })).toBeVisible();
  const [mapBox, lensBox] = await Promise.all([
    map.boundingBox(), lens.boundingBox(),
  ]);
  expect(mapBox).not.toBeNull();
  expect(lensBox).not.toBeNull();
  expect(lensBox!.width).toBeGreaterThanOrEqual(mapBox!.width);
  await expectDiagramSeparateFromExplanation(diagram, explanation);
  const [focusedDiagramBox, focusedExplanationBox] = await Promise.all([
    diagram.boundingBox(), explanation.boundingBox(),
  ]);
  expect(focusedExplanationBox!.x).toBeGreaterThanOrEqual(focusedDiagramBox!.x + focusedDiagramBox!.width);

  await page.getByRole("button", { name: "並列", exact: true }).click();
  const [balancedMapBox, balancedLensBox] = await Promise.all([map.boundingBox(), lens.boundingBox()]);
  expect(balancedMapBox!.width).toBeGreaterThan(balancedLensBox!.width);
  await expectDiagramSeparateFromExplanation(diagram, explanation);
  const [balancedDiagramBox, balancedExplanationBox] = await Promise.all([
    diagram.boundingBox(), explanation.boundingBox(),
  ]);
  expect(balancedExplanationBox!.y).toBeGreaterThanOrEqual(balancedDiagramBox!.y + balancedDiagramBox!.height);
});

test("keeps the politics diagram separate from its explanation", async ({ page }) => {
  await page.goto("/review");
  await page.getByRole("button", { name: "政治・社会", exact: true }).click();

  await expect(page.getByText("長州藩の政治と近代化", { exact: true })).toBeVisible();
  await expectDiagramSeparateFromExplanation(
    page.getByRole("img", { name: "萩の幕末における人材形成と近代化の関係図" }),
    page.getByRole("region", { name: "選択した幕末構造の説明" }),
  );
});
