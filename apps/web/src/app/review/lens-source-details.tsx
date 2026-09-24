import type { LensAssertion, LensKnowledgePack } from "@/domain/lens-packs/schema";
import { lensAssertionEvidenceSummaries } from "@/domain/lens-packs/assertion-presentation";

import styles from "./atlas.module.css";

const sourceKindLabels: Record<string, string> = {
  "classical-text": "原典・古典史料",
  "modern-reference": "現代の参照資料",
  "research-publication": "研究文献",
  "user-input": "探索時の整理",
};

const sourceStatusLabels = {
  candidate: "要レビュー",
  reviewed: "確認済み",
  rejected: "不採用",
} as const;

export function LensSourceDetails({
  pack,
  assertions,
}: {
  pack: LensKnowledgePack;
  assertions: LensAssertion[];
}) {
  const sourceIds = new Set(assertions.flatMap((assertion) => assertion.sourceIds));
  const sources = pack.sources.filter((source) => sourceIds.has(source.id));
  const reviewedAssertionCount = assertions.filter(
    (assertion) => assertion.reviewStatus === "reviewed",
  ).length;
  const evidenceSummaries = lensAssertionEvidenceSummaries(assertions);

  if (sources.length === 0) return null;

  return (
    <details className={styles.lensSourceDetails}>
      <summary>
        この表示は何に基づく？ <span>{sources.length}件</span>
      </summary>
      <p className={styles.lensReviewSummary}>
        選択中の関係：{reviewedAssertionCount}件確認済み / {assertions.length - reviewedAssertionCount}件レビュー待ち
      </p>
      {evidenceSummaries.length > 0 ? (
        <section className={styles.lensAssertionEvidence} aria-label="関係の時期と典拠区分">
          <strong>関係の時期・典拠区分</strong>
          <ul>
            {evidenceSummaries.map((summary) => <li key={summary}>{summary}</li>)}
          </ul>
        </section>
      ) : null}
      <ul>
        {sources.map((source) => (
          <li key={source.id}>
            <div>
              <strong>{source.title}</strong>
              <span data-reviewed={source.reviewStatus === "reviewed"}>
                {sourceStatusLabels[source.reviewStatus]}
              </span>
            </div>
            <small>
              {[
                sourceKindLabels[source.kind] ?? source.kind,
                source.authors.join("・") || undefined,
                source.publisher,
                source.publishedAt,
                source.citation,
                source.locator,
              ]
                .filter(Boolean)
                .join(" / ")}
            </small>
            {source.note ? <p>{source.note}</p> : null}
            {source.url ? (
              <a href={source.url} target="_blank" rel="noreferrer">
                参照先を開く
              </a>
            ) : null}
          </li>
        ))}
      </ul>
    </details>
  );
}
