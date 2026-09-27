"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

import type {
  ExplorationSuggestionStatus,
  ReviewAtlasConnection,
  ReviewAtlasSpot,
  ReviewDataset,
  ReviewExplorationSuggestion,
} from "@/domain/review/types";


import styles from "./atlas.module.css";

const EMPTY_STATUSES = "{}";
const SUGGESTION_EVENT = "resoworld-exploration-status";

export const actionTypeLabels: Record<
  ReviewExplorationSuggestion["actionType"],
  string
> = {
  field_visit: "現地探索",
  literature_research: "文献調査",
  revisit: "再訪・再確認",
};

const targetKindLabels: Record<NonNullable<ReviewExplorationSuggestion["targetKind"]>, string> = {
  missed_visit: "行けなかった未訪問地",
  knowledge_unvisited: "LENS知識でつながる未訪問地",
  research: "資料で調べる",
  critical_revisit: "重要な見落としを確認",
};

function suggestionKindLabel(suggestion: ReviewExplorationSuggestion) {
  return suggestion.targetKind ? targetKindLabels[suggestion.targetKind] : actionTypeLabels[suggestion.actionType];
}

export const suggestionStatusLabels: Record<
  ExplorationSuggestionStatus,
  string
> = {
  suggested: "提案中",
  accepted: "関心あり",
  rejected: "見送る",
};

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(SUGGESTION_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(SUGGESTION_EVENT, callback);
  };
}

function parseStatuses(value: string) {
  try {
    return JSON.parse(value) as Record<string, ExplorationSuggestionStatus>;
  } catch {
    return {};
  }
}

export function useSuggestionStatuses(datasetId: string) {
  const storageKey = `resoworld-exploration:${datasetId}`;
  const getSnapshot = useCallback(
    () => window.localStorage.getItem(storageKey) ?? EMPTY_STATUSES,
    [storageKey],
  );
  const raw = useSyncExternalStore(subscribe, getSnapshot, () => EMPTY_STATUSES);
  const statuses = useMemo(() => parseStatuses(raw), [raw]);
  const updateStatus = (
    suggestionId: string,
    status: ExplorationSuggestionStatus,
  ) => {
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({ ...statuses, [suggestionId]: status }),
    );
    window.dispatchEvent(new Event(SUGGESTION_EVENT));
  };
  return { statuses, updateStatus };
}

function historicalTimeLabel(
  value: ReviewDataset["claims"][number]["historicalTime"],
) {
  if (!value) return "現地体験・問い";
  if (value.kind === "calendar") {
    return value.endYear
      ? `${value.startYear}–${value.endYear}年`
      : `${value.startYear}年`;
  }
  return value.label || "時代未確定";
}

const natureLabels: Record<string, string> = {
  Observation: "現地観察",
  HistoricalSource: "歴史史料",
  Archaeology: "考古学",
  Tradition: "伝承",
  UserHypothesis: "自分の仮説",
  Alternative: "異説",
  AISuggestion: "AIによる整理",
};

export function SuggestionQueue({
  suggestions,
  statuses,
  onSelect,
}: {
  suggestions: ReviewExplorationSuggestion[];
  statuses: Record<string, ExplorationSuggestionStatus>;
  onSelect: (suggestionId: string) => void;
}) {
  return (
    <section className={styles.suggestionQueue}>
      <div className={styles.suggestionQueueHeading}>
        <span>NEXT FROM YOUR JOURNEY</span>
        <strong>これまでの関心から見つかった次の候補</strong>
      </div>
      {suggestions.map((suggestion, index) => {
        const status = statuses[suggestion.id] ?? suggestion.initialStatus;
        return (
          <button
            type="button"
            key={suggestion.id}
            data-status={status}
            onClick={() => onSelect(suggestion.id)}
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
            <div>
              <small>{suggestionKindLabel(suggestion)} · {suggestionStatusLabels[status]}</small>
              <strong>{suggestion.targetName}</strong>
              <p>{suggestion.title}</p>
              <small className={styles.suggestionQueueReason}>
                なぜ：{suggestion.reason}
              </small>
            </div>
          </button>
        );
      })}
    </section>
  );
}

export function LensContinuationQueue({
  suggestions,
  statuses,
  onSelect,
}: {
  suggestions: ReviewExplorationSuggestion[];
  statuses: Record<string, ExplorationSuggestionStatus>;
  onSelect: (suggestionId: string) => void;
}) {
  const visibleSuggestions = suggestions.filter((suggestion) =>
    (statuses[suggestion.id] ?? suggestion.initialStatus) !== "rejected",
  );
  if (visibleSuggestions.length === 0) return null;

  return (
    <section className={styles.lensContinuation} aria-label="この構造から次に確かめる">
      <header>
        <span>NEXT CONNECTION</span>
        <strong>この構造から、次に何を確かめる？</strong>
      </header>
      <div>
        {visibleSuggestions.map((suggestion) => (
          <button type="button" key={suggestion.id} onClick={() => onSelect(suggestion.id)}>
            <small>{suggestionKindLabel(suggestion)} · {suggestion.targetName}</small>
            <strong>{suggestion.question}</strong>
            <span>まだ不明：{suggestion.missingInformation}</span>
            <p>{suggestion.reason}</p>
          </button>
        ))}
      </div>
    </section>
  );
}


export function SuggestionDrawer({
  datasetId,
  suggestion,
  anchorSpots,
  claims,
  connections,
  status,
  onStatusChange,
  onSelectAnchorSpot,
  onSelectConnection,
  onClose,
}: {
  datasetId: string;
  suggestion: ReviewExplorationSuggestion;
  anchorSpots: ReviewAtlasSpot[];
  claims: ReviewDataset["claims"];
  connections: ReviewAtlasConnection[];
  status: ExplorationSuggestionStatus;
  onStatusChange: (status: ExplorationSuggestionStatus) => void;
  onSelectAnchorSpot: (spotId: string) => void;
  onSelectConnection: (connection: ReviewAtlasConnection) => void;
  onClose?: () => void;
}) {
  return (
    <section className={styles.suggestionDrawer}>
      <aside className={styles.suggestionSummary}>
        {onClose ? (
          <button
            type="button"
            className={styles.mapConnectionInfoClose}
            onClick={onClose}
            aria-label="探索候補の説明を閉じる"
          >
            ×
          </button>
        ) : null}
        <p>あなたの探索の続き</p>
        <span className={styles.suggestionStatus} data-status={status}>
          {suggestionStatusLabels[status]}
        </span>
        <h2>{suggestion.targetName}</h2>
        <h3>{suggestion.title}</h3>
        <div className={styles.drawerActions}>
          <button type="button" onClick={() => onStatusChange("accepted")}>
            気になる
          </button>
          <button type="button" onClick={() => onStatusChange("rejected")}>
            見送る
          </button>
        </div>
      </aside>

      <div className={styles.suggestionDetail}>
        <div className={styles.suggestionFacts}>
          <section>
            <span>これまでとのつながり</span>
            <h3>なぜ、この候補なのか</h3>
            <p>{suggestion.reason}</p>
          </section>
          <section>
            <span>ここで見えてくること</span>
            <h3>次に確かめたい問い</h3>
            <p>{suggestion.question}</p>
          </section>
          <section>
            <span>現地・資料でまず見るところ</span>
            <h3>最初の手がかり</h3>
            <p>{suggestion.expectedObservation}</p>
          </section>
        </div>

        <section className={styles.suggestionOrigins}>
          <div>
            <span>PAST EXPLORATION</span>
            <h3>この候補につながった訪問とテーマ</h3>
          </div>
          <div className={styles.suggestionOriginGrid}>
            {anchorSpots.map((spot) => (
              <button type="button" key={spot.id} onClick={() => onSelectAnchorSpot(spot.id)}>
                <small>訪問 · {spot.region} · {spot.kind}</small>
                <strong>{spot.name}</strong>
                <span>地図で振り返る →</span>
              </button>
            ))}
            {connections.map((connection) => (
              <button type="button" key={connection.id} onClick={() => onSelectConnection(connection)}>
                <small>つながり · {connection.eyebrow}</small>
                <strong>{connection.title}</strong>
                <span>線と時代で見直す →</span>
              </button>
            ))}
          </div>
        </section>

        <details className={styles.suggestionCaveats}>
          <summary>補足：まだ分かっていないこと・調査上の注意</summary>
          <p>{suggestion.missingInformation}</p>
          <p>{suggestion.uncertainty}</p>
        </details>

        <section className={styles.recognitionLenses}>
          <div>
            <span>RE-RECOGNITION LENSES</span>
            <h3>この探索を、別の体系から見直す</h3>
          </div>
          <div className={styles.recognitionLensGrid}>
            {connections.flatMap((connection) =>
              connection.facets.map((facet) => (
                <article key={connection.id + "-facet-" + facet.id}>
                  <span>観点 · {facet.weight}/5</span>
                  <strong>{facet.label}</strong>
                </article>
              )),
            )}
            {connections.flatMap((connection) =>
              connection.eras.map((era) => (
                <article key={connection.id + "-era-" + era.id}>
                  <span>{era.range}</span>
                  <strong>{era.label}</strong>
                </article>
              )),
            )}
            {connections.flatMap((connection) =>
              connection.concepts.map((concept) => (
                <article key={connection.id + "-concept-" + concept}>
                  <span>概念</span>
                  <strong>{concept}</strong>
                </article>
              )),
            )}
          </div>
        </section>

        <details className={styles.suggestionEvidence}>
          <summary className={styles.evidenceHeading}>
            <span>SUPPORTING BASIS / {claims.length} CLAIMS</span>
            <strong>この提案は、何に基づくのか</strong>
          </summary>
          <div className={styles.evidenceCards}>
            {claims.slice(0, 6).map((claim) => (
              <article key={claim.id}>
                <div>
                  <span>{natureLabels[claim.evidence[0]?.sourceNature] ?? "記録"}</span>
                  <span>{historicalTimeLabel(claim.historicalTime)}</span>
                </div>
                <p>{claim.statement}</p>
                <blockquote>{claim.evidence[0]?.passage.quote}</blockquote>
              </article>
            ))}
          </div>
        </details>


      </div>
    </section>
  );
}
