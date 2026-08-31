import type { ReviewExplorationSuggestion } from "@/domain/review/types";

type CodexBriefSuggestion = Pick<
  ReviewExplorationSuggestion,
  | "id"
  | "targetName"
  | "actionType"
  | "question"
  | "missingInformation"
  | "expectedObservation"
>;

export function buildCodexExplorationBrief(
  suggestion: CodexBriefSuggestion,
) {
  return [
    "ResoWorldの次の探索候補を、公開情報から調査してください。",
    "この実行では下記の調査ブリーフを文脈として使ってください。ワークフローから探索記録やEvidenceが追加提供された場合は、それも分析対象にできます。",
    "候補に固執せず、問いを検証しやすい場所・資料を1〜4件提示してください。",
    "各候補に、理由、現地または資料で確認すること、不確実性、直接確認できる出典URLを付けてください。",
    "結果はまだAtlasへ自動採用せず、私の確認を待ってください。",
    "",
    "## 調査ブリーフ",
    `- suggestionId: ${suggestion.id}`,
    `- 現在の候補: ${suggestion.targetName}`,
    `- 行動種別: ${suggestion.actionType}`,
    `- 検証したい問い: ${suggestion.question}`,
    `- 不足情報: ${suggestion.missingInformation}`,
    `- 確認したいこと: ${suggestion.expectedObservation}`,
    "",
    "## 返してほしい形式",
    "1. 調査の要約",
    "2. 候補ごとの名称・行動種別・理由・確認事項・不確実性",
    "3. 候補ごとの出典URL",
    "4. Atlasへ採用する前に人が判断すべき点",
  ].join("\n");
}
