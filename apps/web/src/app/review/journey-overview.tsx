import type { JourneySummary } from "@/domain/review/journey-summary";

import styles from "./atlas.module.css";

const entityTypeLabels: Record<string, string> = {
  Place: "場所",
  Person: "人物",
  Concept: "概念",
  Group: "集団",
  Event: "出来事",
  Belief: "信仰",
  Deity: "神",
  Artifact: "遺物・建造物",
};

export function JourneyOverview({ summaries, commonEntityTypes, onSelect }: {
  summaries: JourneySummary[];
  commonEntityTypes: string[];
  onSelect: (journeyId: string) => void;
}) {
  if (summaries.length < 2) return null;
  return <section className={styles.journeyOverview}>
    <div className={styles.journeyOverviewHeader}>
      <div><span>CROSS-JOURNEY VIEW</span><strong>旅をまたいで見比べる</strong></div>
      <p>同じ史実だという意味ではなく、自分が繰り返し見ている対象と、各探索の特徴です。</p>
    </div>
    <div className={styles.journeyOverviewGrid}>
      {summaries.map((summary) => <button type="button" key={summary.id} onClick={() => onSelect(summary.id)}>
        <span>{summary.spotCount} SPOTS · {summary.claimCount} RECORDS · {summary.connectionCount} CONNECTIONS</span>
        <strong>{summary.label}</strong>
        <small>{summary.dominantFacets.map((facet) => facet.label).join("・") || "テーマ整理中"}</small>
        <span className={styles.journeyLeadConnection}>
          <small>{summary.leadConnection ? "代表的なつながり" : "接続の状態"}</small>
          <strong>{summary.leadConnection?.title ?? "訪問間のつながりは整理中"}</strong>
          {summary.leadConnection ? <em>{summary.leadConnection.claimCount}件の根拠から再認識</em> : <em>記録と地点は保持されています</em>}
        </span>
      </button>)}
    </div>
    <div className={styles.journeyCommonAxis}>
      <span>両方の探索に現れる観察対象</span>
      <div>{commonEntityTypes.map((type) => <strong key={type}>{entityTypeLabels[type] ?? type}</strong>)}</div>
    </div>
  </section>;
}
