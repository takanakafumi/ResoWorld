"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

import type {
  ExplorationSuggestionStatus,
  ReviewAtlasConnection,
  ReviewDataset,
  ReviewExplorationSuggestion,
} from "@/domain/review/types";

import { CodexResearchPanel } from "./public-research-panel";
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
        <span>INTEREST CONTINUATION</span>
        <strong>関心の続き</strong>
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
              <small>{actionTypeLabels[suggestion.actionType]} · {suggestionStatusLabels[status]}</small>
              <strong>{suggestion.targetName}</strong>
              <p>{suggestion.title}</p>
            </div>
          </button>
        );
      })}
    </section>
  );
}

export function SuggestionPanel({
  suggestion,
  status,
  onStatusChange,
  onBack,
}: {
  suggestion: ReviewExplorationSuggestion;
  status: ExplorationSuggestionStatus;
  onStatusChange: (status: ExplorationSuggestionStatus) => void;
  onBack: () => void;
}) {
  return (
    <div className={styles.suggestionPanelBody}>
      <button type="button" className={styles.backToSpot} onClick={onBack}>
        ← 訪問スポットへ戻る
      </button>
      <p className={styles.suggestionEyebrow}>
        INTEREST CONTINUATION · {actionTypeLabels[suggestion.actionType]}
      </p>
      <h2>{suggestion.targetName}</h2>
      <h3>{suggestion.title}</h3>
      <div className={styles.suggestionQuestion}>
        <span>検証したい問い</span>
        <p>{suggestion.question}</p>
      </div>
      <div className={styles.suggestionReason}>
        <span>なぜここを見る？</span>
        <p>{suggestion.reason}</p>
      </div>
      <p className={styles.uncertainty}>
        <strong>不確実性：</strong>{suggestion.uncertainty}
      </p>
      <div className={styles.suggestionActions}>
        <button
          type="button"
          data-active={status === "accepted"}
          data-action="accept"
          onClick={() => onStatusChange("accepted")}
        >
          気になる
        </button>
        <button
          type="button"
          data-active={status === "suggested"}
          onClick={() => onStatusChange("suggested")}
        >
          保留
        </button>
        <button
          type="button"
          data-active={status === "rejected"}
          data-action="reject"
          onClick={() => onStatusChange("rejected")}
        >
          見送る
        </button>
      </div>
    </div>
  );
}

export function SuggestionDrawer({
  datasetId,
  suggestion,
  claims,
  connections,
  status,
  onStatusChange,
}: {
  datasetId: string;
  suggestion: ReviewExplorationSuggestion;
  claims: ReviewDataset["claims"];
  connections: ReviewAtlasConnection[];
  status: ExplorationSuggestionStatus;
  onStatusChange: (status: ExplorationSuggestionStatus) => void;
}) {
  return (
    <section className={styles.suggestionDrawer}>
      <aside className={styles.suggestionSummary}>
        <p>INTEREST THREAD</p>
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
            <span>01 / USER INTEREST</span>
            <h3>何に惹かれて探索した？</h3>
            <p>{suggestion.question}</p>
            <small>{suggestion.reason}</small>
          </section>
          <section>
            <span>02 / SYSTEM SYNTHESIS</span>
            <h3>システムが補う背景とつながり</h3>
            <p>
              {connections
                .map((connection) => connection.summary)
                .join(" ／ ") || suggestion.missingInformation}
            </p>
          </section>
          <section>
            <span>03 / OPTIONAL RESONANCE</span>
            <h3>もし関心が続くなら</h3>
            <p>{suggestion.expectedObservation}</p>
          </section>
        </div>

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

        <CodexResearchPanel datasetId={datasetId} suggestion={suggestion} />
      </div>
    </section>
  );
}
