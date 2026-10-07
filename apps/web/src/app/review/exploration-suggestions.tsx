"use client";

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";

import type {
  ExplorationSuggestionStatus,
  ReviewAtlasConnection,
  ReviewAtlasSpot,
  ReviewDataset,
  ReviewExplorationSuggestion,
} from "@/domain/review/types";


import { registeredLensTopics } from "@/domain/lens-packs/knowledge-registry";
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


const lensNameMap: Record<string, string> = {
  mythology: "神・系譜",
  route: "ルート",
  religion: "宗教",
  politics: "政治・社会",
  people: "人物",
};

export function SuggestionDrawer({
  datasetId,
  suggestion,
  anchorSpots,
  claims,
  connections,
  status,
  selectedJourneyId,
  onStatusChange,
  onSelectAnchorSpot,
  onSelectConnection,
  onSelectLens,
  onClose,
}: {
  datasetId: string;
  suggestion: ReviewExplorationSuggestion;
  anchorSpots: ReviewAtlasSpot[];
  claims: ReviewDataset["claims"];
  connections: ReviewAtlasConnection[];
  status: ExplorationSuggestionStatus;
  selectedJourneyId?: string;
  onStatusChange: (status: ExplorationSuggestionStatus) => void;
  onSelectAnchorSpot: (spotId: string) => void;
  onSelectConnection: (connection: ReviewAtlasConnection) => void;
  onSelectLens?: (lensId: string, topicId?: string, nodeId?: string) => void;
  onClose?: () => void;
}) {
  const [quickVisitStatus, setQuickVisitStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [quickVisitMessage, setQuickVisitMessage] = useState<string | null>(null);

  const handleQuickVisit = async () => {
    setQuickVisitStatus("saving");
    setQuickVisitMessage(null);
    try {
      const response = await fetch("/api/quick-visit-spot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: suggestion.targetName,
          latitude: suggestion.latitude,
          longitude: suggestion.longitude,
          region: suggestion.anchorSpotIds[0] ? anchorSpots.find((s) => s.id === suggestion.anchorSpotIds[0])?.region : undefined,
          journeyId: selectedJourneyId,
          note: `${suggestion.targetName}を現地訪問済として登録。`,
          consent: "quick_register_visited_spot",
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data.error?.message || "訪問済み登録に失敗しました。");
      }
      setQuickVisitStatus("done");
      setQuickVisitMessage("訪問済みに登録しました！画面を更新します…");
      setTimeout(() => {
        window.location.reload();
      }, 700);
    } catch (error) {
      setQuickVisitStatus("error");
      setQuickVisitMessage(error instanceof Error ? error.message : "登録に失敗しました。");
    }
  };

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
        <div style={{ marginTop: 8 }}>
          <button
            type="button"
            className={styles.candidateQuickVisitButton}
            disabled={quickVisitStatus === "saving" || quickVisitStatus === "done"}
            onClick={handleQuickVisit}
          >
            <span>{quickVisitStatus === "saving" ? "訪問済みに登録中…" : quickVisitStatus === "done" ? "✓ 登録完了" : "✓ 訪問済みにする（ワンクリック登録）"}</span>
            <span aria-hidden="true">📍</span>
          </button>
          {quickVisitMessage ? (
            <small style={{ color: quickVisitStatus === "error" ? "var(--accent)" : "var(--gold)", marginTop: 4, display: "block" }}>
              {quickVisitMessage}
            </small>
          ) : null}
        </div>
        {suggestion.lensId && onSelectLens ? (() => {
          const matchingTopic = suggestion.topicId
            ? registeredLensTopics.find((t) => t.id === suggestion.topicId || t.presetId === suggestion.topicId)
            : undefined;
          const lensLabel = lensNameMap[suggestion.lensId] ?? suggestion.lensId;
          const topicLabel = matchingTopic?.label;

          return (
            <div style={{ marginTop: 12 }}>
              <small style={{ display: "block", color: "var(--muted)", marginBottom: 4 }}>関連するLENS / TOPIC</small>
              {topicLabel ? (
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                  <span style={{
                    display: "inline-block",
                    padding: "2px 6px",
                    borderRadius: "4px",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    backgroundColor: "rgba(215, 166, 255, 0.15)",
                    color: "#d7a6ff",
                    border: "1px solid rgba(215, 166, 255, 0.3)",
                  }}>
                    {lensLabel}
                  </span>
                  <strong style={{ fontSize: "0.85rem", color: "var(--text)" }}>
                    {topicLabel}
                  </strong>
                </div>
              ) : null}
              <button
                type="button"
                className={styles.genealogySpotAction}
                style={{ width: "100%", textAlign: "center" }}
                onClick={() => onSelectLens(suggestion.lensId!, suggestion.topicId ?? undefined, suggestion.targetPlaceId ?? undefined)}
              >
                {topicLabel ? `「${topicLabel}」で詳しく見る →` : `${lensLabel} LENS で開く →`}
              </button>
            </div>
          );
        })() : null}
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

        {(() => {
          const allFacets = connections.flatMap((c) => c.facets);
          const allEras = connections.flatMap((c) => c.eras);
          const allConcepts = connections.flatMap((c) => c.concepts);
          const hasAnyContext = allFacets.length > 0 || allEras.length > 0 || allConcepts.length > 0;

          return (
            <section className={styles.recognitionLenses}>
              <div>
                <span>RELATED CONTEXT / 関連する文脈</span>
                <h3>この候補につながる観点・時代・概念</h3>
              </div>
              <div className={styles.recognitionLensGrid}>
                {hasAnyContext ? (
                  <>
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
                  </>
                ) : (
                  <p style={{ color: "var(--muted)", fontSize: "0.85rem", padding: "4px 0" }}>
                    関連付けられた観点・時代タグはありません。
                  </p>
                )}
              </div>
            </section>
          );
        })()}

        <details className={styles.suggestionEvidence}>
          <summary className={styles.evidenceHeading}>
            <span>PRIMARY EVIDENCE / 史料根拠（{claims.length}件の言明）</span>
            <strong>この提案は、何に基づくのか</strong>
          </summary>
          <div className={styles.evidenceCards}>
            {claims.length === 0 ? (
              <p style={{ padding: "16px", color: "var(--muted)", fontSize: "0.85rem" }}>
                直接紐づく言明（Claims）は登録されていません。
              </p>
            ) : (
              claims.slice(0, 6).map((claim) => (
                <article key={claim.id}>
                  <div>
                    <span>{natureLabels[claim.evidence[0]?.sourceNature] ?? "記録"}</span>
                    <span>{historicalTimeLabel(claim.historicalTime)}</span>
                  </div>
                  <p>{claim.statement}</p>
                  <blockquote>{claim.evidence[0]?.passage.quote}</blockquote>
                </article>
              ))
            )}
          </div>
        </details>


      </div>
    </section>
  );
}
