import type { LensAssertion } from "./schema";

const evidenceBasisLabels: Record<LensAssertion["evidenceBasis"], string> = {
  "contemporary-record": "同時代記録",
  "reported-historical-record": "史料記述（現代資料による紹介）",
  "institutional-tradition": "制度的伝承・由緒",
  "modern-documentation": "現代資料による確認",
  "scholarly-analysis": "研究上の分析",
  "user-account": "探索者の記録",
  unspecified: "典拠区分未設定",
};

export function lensHistoricalTimeLabel(
  value: LensAssertion["historicalTime"],
): string | null {
  if (!value) return null;
  if (value.kind === "unknown") return value.label ?? "時期不明";
  if (value.kind === "named") return value.label;

  const range = value.endYear === undefined
    ? `${value.startYear}年`
    : `${value.startYear}–${value.endYear}年`;
  const calendar = `${value.approximate ? "約" : ""}${range}`;
  return value.label ? `${value.label}（${calendar}）` : calendar;
}

export function lensEvidenceBasisLabel(
  value: LensAssertion["evidenceBasis"],
) {
  return evidenceBasisLabels[value];
}

export function lensAssertionEvidenceSummaries(assertions: LensAssertion[]) {
  return [...new Set(assertions.flatMap((assertion) => {
    const eventTime = lensHistoricalTimeLabel(assertion.historicalTime);
    const sourceTime = lensHistoricalTimeLabel(assertion.sourceTime);
    const hasBasis = assertion.evidenceBasis !== "unspecified";
    if (!eventTime && !sourceTime && !hasBasis) return [];

    return [[
      eventTime ? `対象時期：${eventTime}` : undefined,
      sourceTime ? `史料成立：${sourceTime}` : undefined,
      hasBasis ? `典拠：${lensEvidenceBasisLabel(assertion.evidenceBasis)}` : undefined,
    ].filter(Boolean).join(" / ")];
  }))];
}
