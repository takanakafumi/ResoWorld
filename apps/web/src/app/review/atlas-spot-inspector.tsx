"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import type {
  ExplorationSuggestionStatus,
  ReviewAtlasConnection,
  ReviewAtlasSpot,
  ReviewDataset,
  ReviewExplorationSuggestion,
} from "@/domain/review/types";
import { dominantFacet, FacetCloud, facetColor } from "./atlas-lenses";
import { SuggestionQueue } from "./exploration-suggestions";
import type { SpotKnowledgeContext } from "@/domain/lens-packs/spot-knowledge";
import styles from "./atlas.module.css";

const connectionKindLabels: Record<ReviewAtlasConnection["connectionKind"], string> = {
  documented: "記録に基づく接続",
  comparative: "比較による接続",
  interpretive: "解釈による接続",
  itinerary: "訪問順・移動",
};

const connectionStatusLabels = {
  confirmed: "採用済み",
  suggested: "提案中",
  rejected: "却下",
};

export function AtlasSpotInspector({
  systemLensActive,
  selectedSuggestion,
  selectedSuggestionSpots,
  selectedSpot,
  selectedSpotClaims,
  selectedSpotKnowledge,
  selectedConnection,
  connectionColor,
  spotConnections,
  connectionStatuses,
  includeRejectedConnections,
  suggestions,
  suggestionStatuses,
  onClearFocus,
  onSelectSpot,
  onSelectConnection,
  onUpdatePositionStatus,
  onUpdateConnectionStatus,
  onSelectRecognitionLens,
  onToggleIncludeRejected,
  onSelectSuggestion,
}: {
  systemLensActive: boolean;
  selectedSuggestion?: ReviewExplorationSuggestion;
  selectedSuggestionSpots: ReviewAtlasSpot[];
  selectedSpot?: ReviewAtlasSpot;
  selectedSpotClaims: ReviewDataset["claims"];
  selectedSpotKnowledge: SpotKnowledgeContext[];
  selectedConnection?: ReviewAtlasConnection;
  connectionColor: string;
  spotConnections: ReviewAtlasConnection[];
  connectionStatuses: Record<string, "confirmed" | "suggested" | "rejected">;
  includeRejectedConnections: boolean;
  suggestions: ReviewExplorationSuggestion[];
  suggestionStatuses: Record<string, ExplorationSuggestionStatus>;
  onClearFocus: () => void;
  onSelectSpot: (spotId: string) => void;
  onSelectConnection: (connection: ReviewAtlasConnection) => void;
  onUpdatePositionStatus: (spotId: string, status: "confirmed" | "rejected") => void;
  onUpdateConnectionStatus: (connectionId: string, status: "confirmed" | "suggested" | "rejected") => void;
  onSelectRecognitionLens: (lensId: string, topicId?: string) => void;
  onToggleIncludeRejected: (include: boolean) => void;
  onSelectSuggestion: (suggestionId: string) => void;
}) {
  const primaryFacet = selectedConnection ? dominantFacet(selectedConnection.facets) : undefined;
  const lensNameMap: Record<string, string> = {
    mythology: "神・系譜",
    route: "ルート",
    religion: "宗教",
    politics: "政治・社会",
    people: "人物",
  };

  return (
    <aside
      className={`${styles.spotPanel} ${
        systemLensActive ? styles.spotPanelHidden : ""
      }`}
    >
      <div className={styles.panelHeader}>
        <div>
          <span className={styles.panelIndex}>SPOT</span>
          <h2>{selectedSuggestion ? "次の探索候補" : "ここから何につながる？"}</h2>
        </div>
      </div>

      {selectedSuggestion ? (
        <div className={styles.spotBody}>
          <button
            type="button"
            className={styles.backToSpot}
            onClick={onClearFocus}
          >
            ← 選択を解除
          </button>
          <p className={styles.spotKind}>次の探索候補 · 未訪問</p>
          <h2>{selectedSuggestion.targetName}</h2>
          
          <div style={{ marginTop: 12, marginBottom: 12 }}>
            <span className={styles.microLabel}>なぜこの候補なのか</span>
            <p style={{ margin: "4px 0 12px", fontSize: "0.95rem", lineHeight: 1.5 }}>
              {selectedSuggestion.reason}
            </p>
          </div>

          {selectedSuggestion.question ? (
            <div style={{ marginBottom: 16 }}>
              <span className={styles.microLabel}>次に確かめたい問い</span>
              <p style={{ margin: "4px 0", fontSize: "0.9rem", color: "var(--aqua)", fontStyle: "italic" }}>
                {selectedSuggestion.question}
              </p>
            </div>
          ) : null}

          {selectedSuggestion.lensId ? (
            <div className={styles.suggestionOriginLinks} style={{ marginBottom: 16 }}>
              <span className={styles.microLabel}>関連するLENS</span>
              <button
                type="button"
                className={styles.genealogySpotAction}
                style={{ width: "100%", textAlign: "center", padding: "8px 12px" }}
                onClick={() => onSelectRecognitionLens(selectedSuggestion.lensId!, selectedSuggestion.topicId ?? undefined)}
              >
                {lensNameMap[selectedSuggestion.lensId] ?? selectedSuggestion.lensId} LENS で開く →
              </button>
            </div>
          ) : null}

          {selectedSuggestionSpots.length > 0 ? (
            <div className={styles.suggestionOriginLinks}>
              <span className={styles.microLabel}>この候補につながる訪問地点</span>
              {selectedSuggestionSpots.map((spot) => (
                <button type="button" key={spot.id} onClick={() => onSelectSpot(spot.id)}>
                  <small>{spot.region} · {spot.kind}</small>
                  <strong>{spot.name}</strong>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : selectedSpot ? (
        <div className={styles.spotBody}>
          <p className={styles.spotKind}>{selectedSpot.kind} · {selectedSpot.region}</p>
          <h2>{selectedSpot.name}</h2>
          <p className={styles.spotLead}>
            この場所で得た記録を起点に、別の時代・場所・概念へ線を伸ばします。
          </p>
          <section className={styles.positionReview} data-status={selectedSpot.positionStatus ?? "confirmed"}>
            <div>
              <span>MAP POSITION</span>
              <strong>
                {selectedSpot.positionStatus === "candidate"
                  ? "この位置は候補です"
                  : selectedSpot.positionStatus === "rejected"
                    ? "この位置は除外中です"
                    : "この位置を確認済み"}
              </strong>
            </div>
            <div>
              <button
                type="button"
                data-active={selectedSpot.positionStatus === "confirmed"}
                onClick={() => onUpdatePositionStatus(selectedSpot.id, "confirmed")}
              >
                位置を採用
              </button>
              <button
                type="button"
                data-active={selectedSpot.positionStatus === "rejected"}
                onClick={() => onUpdatePositionStatus(selectedSpot.id, "rejected")}
              >
                除外
              </button>
            </div>
          </section>

          <section className={styles.spotRecords}>
            <div>
              <span className={styles.microLabel}>MY RECORDS / この場所で得た記録</span>
              <strong>{selectedSpotClaims.length}件</strong>
            </div>
            {selectedSpotClaims.length > 0 ? (
              <ul>
                {selectedSpotClaims.slice(0, 6).map((claim) => (
                  <li key={claim.id}>
                    <Link href={`/review?view=graph&claim=${encodeURIComponent(claim.id)}`}>
                      <span>{claim.statement}</span>
                      <small>根拠を見る →</small>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p>この地点に結び付く旅行記Claimはまだ整理されていません。</p>
            )}
            {selectedSpotClaims.length > 6 ? (
              <small>ほか{selectedSpotClaims.length - 6}件はEvidence Graphで確認できます。</small>
            ) : null}
          </section>

          <section className={styles.spotKnowledge}>
            <div className={styles.spotKnowledgeHeader}>
              <span className={styles.microLabel}>SURROUNDING KNOWLEDGE / 外部情報で補う</span>
              <strong>{selectedSpotKnowledge.reduce((count, context) => count + context.relations.length, 0)}件</strong>
            </div>
            {selectedSpotKnowledge.length > 0 ? (
              selectedSpotKnowledge.map((context) => (
                <article key={context.id}>
                  <div>
                    <span>
                      {context.packLabel} · {context.basis === "claim_entity" ? "この場所の記録から" : "地点そのものから"}
                    </span>
                    <strong>{context.entityLabel}</strong>
                  </div>
                  <ul>
                    {context.relations.slice(0, 3).map((relation) => (
                      <li key={relation.id}>
                        <strong>{relation.relatedEntityLabel}</strong>
                        <p>{relation.note ?? `${relation.relationLabel}として登録された関係です。`}</p>
                      </li>
                    ))}
                  </ul>
                  <footer>
                    <button type="button" onClick={() => onSelectRecognitionLens(context.lensId)}>
                      対応するレンズで見る
                    </button>
                    {context.sources.filter((source) => source.url).slice(0, 2).map((source) => (
                      <a key={source.id} href={source.url} target="_blank" rel="noreferrer">
                        {source.publisher ?? "出典"} ↗
                      </a>
                    ))}
                  </footer>
                </article>
              ))
            ) : (
              <p className={styles.spotKnowledgeEmpty}>
                この地点に結び付く外部Knowledgeはまだありません。旅行記の記録は保持したまま、出典を確認できた関係だけをここへ追加します。
              </p>
            )}
          </section>

          {selectedConnection ? (
            <section className={styles.meaningLens}>
              <div>
                <span className={styles.microLabel}>MEANING LENS / 接続の主成分</span>
                <strong style={{ color: connectionColor }}>
                  {primaryFacet?.label} が中心
                </strong>
              </div>
              <FacetCloud facets={selectedConnection.facets} />
              <div className={styles.suggestionActions}>
                <button
                  type="button"
                  data-active={(connectionStatuses[selectedConnection.id] ?? selectedConnection.initialStatus) === "confirmed"}
                  onClick={() => onUpdateConnectionStatus(selectedConnection.id, "confirmed")}
                >
                  接続を採用
                </button>
                <button
                  type="button"
                  data-active={(connectionStatuses[selectedConnection.id] ?? selectedConnection.initialStatus) === "suggested"}
                  onClick={() => onUpdateConnectionStatus(selectedConnection.id, "suggested")}
                >
                  保留
                </button>
                <button
                  type="button"
                  data-active={(connectionStatuses[selectedConnection.id] ?? selectedConnection.initialStatus) === "rejected"}
                  onClick={() => onUpdateConnectionStatus(selectedConnection.id, "rejected")}
                >
                  却下
                </button>
              </div>
            </section>
          ) : null}

          <div className={styles.connectionList}>
            <span className={styles.microLabel}>つながりを選ぶ</span>
            <label className={styles.connectionReviewToggle}>
              <input
                type="checkbox"
                checked={includeRejectedConnections}
                onChange={(event) => onToggleIncludeRejected(event.target.checked)}
              />
              却下も表示
            </label>
            {spotConnections.map((connection) => (
              <button
                type="button"
                key={connection.id}
                data-active={connection.id === selectedConnection?.id}
                style={{ "--item-color": facetColor(dominantFacet(connection.facets)?.id) } as CSSProperties}
                onClick={() => onSelectConnection(connection)}
              >
                <span>{connection.eyebrow}</span>
                <strong>{connection.title}</strong>
                <span>{connectionKindLabels[connection.connectionKind]}</span>
                <span>{connectionStatusLabels[connectionStatuses[connection.id] ?? connection.initialStatus]}</span>
                <small>{connection.spotIds.length}地点 · {connection.claimIds.length}件の根拠</small>
              </button>
            ))}
          </div>

          <SuggestionQueue
            suggestions={suggestions}
            statuses={suggestionStatuses}
            onSelect={onSelectSuggestion}
          />
        </div>
      ) : null}
    </aside>
  );
}
