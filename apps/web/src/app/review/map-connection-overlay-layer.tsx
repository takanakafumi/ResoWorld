"use client";

import Link from "next/link";
import {
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type RefObject,
  memo,
  useEffect,
  useRef,
} from "react";
import type { Map as MapLibreMap } from "maplibre-gl";
import type { MapConnectionProjection } from "@/domain/map/connections";
import {
  type ConnectionLayerVisibility,
  useConnectionLines,
} from "./use-connection-lines";
import { useDraggablePanel } from "./use-draggable-panel";
import styles from "./atlas.module.css";
import localStyles from "./map-connection-overlay-layer.module.css";

const connectionKindLabels: Record<MapConnectionProjection["connectionKind"], string> = {
  documented: "記録に基づく接続",
  comparative: "比較による接続",
  interpretive: "解釈による接続",
  itinerary: "訪問順・移動",
  knowledge: "外部Knowledge",
  suggestion: "次の探索候補",
};

const relationFamilyLabels: Record<string, string> = {
  genealogy: "系譜",
  succession: "継承",
  route: "経路",
  identification: "比定",
  "textual-attestation": "史料記載",
  "historical-context": "歴史的背景",
  influence: "影響",
  syncretism: "習合",
  classification: "分類",
  "conceptual-comparison": "概念比較",
  ritual: "祭祀",
  enshrinement: "祭神",
  association: "関連",
};

const confidenceLabels: Record<string, string> = {
  high: "確度 高",
  medium: "確度 中",
  low: "確度 低",
  disputed: "異説あり",
  "not-rated": "確度未評価",
};

function mapEvidenceLabel(connection: MapConnectionProjection) {
  const origin =
    connection.origin === "exploration"
      ? "旅行記"
      : connection.origin === "knowledge-pack"
        ? "Knowledge Pack"
        : "探索候補";
  const evidence =
    connection.claimIds.length > 0
      ? `${connection.claimIds.length}件のClaim`
      : `${connection.assertionIds.length}件のAssertion · ${connection.sourceIds.length}件のSource`;
  const status =
    connection.reviewStatus === "reviewed"
      ? "確認済み"
      : connection.reviewStatus === "draft"
        ? "Draft"
        : "派生表示";
  return `${origin} · ${evidence} · ${status}`;
}

export const MapConnectionOverlayLayer = memo(function MapConnectionOverlayLayer({
  map,
  mapRevision,
  containerRef,
  mapConnections,
  activeMapConnectionId,
  connectionVisibility,
  recognitionLens,
  highlightedSpotIds,
  describedConnection,
  connectionChoiceIds,
  onSetConnectionChoiceIds,
  onSelectMapConnection,
  onClearMapConnection,
  onPointClick,
  onSelectRecognitionLens,
}: {
  map: MapLibreMap | null;
  mapRevision: number;
  containerRef: RefObject<HTMLDivElement | null>;
  mapConnections: MapConnectionProjection[];
  activeMapConnectionId: string;
  connectionVisibility: ConnectionLayerVisibility;
  recognitionLens?: string;
  highlightedSpotIds?: string[];
  describedConnection?: MapConnectionProjection;
  connectionChoiceIds: readonly string[];
  onSetConnectionChoiceIds: (ids: string[]) => void;
  onSelectMapConnection: (connection: MapConnectionProjection) => void;
  onClearMapConnection: () => void;
  onPointClick: (point: MapConnectionProjection["points"][number]) => void;
  onSelectRecognitionLens: (lensId: string, topicId?: string) => void;
}) {
  const { renderableLines } = useConnectionLines({
    map,
    mapRevision,
    connections: mapConnections,
    activeConnectionId: activeMapConnectionId,
    visibility: connectionVisibility,
    recognitionLens,
    highlightedSpotIds,
  });

  const {
    panelStyle: connectionPanelStyle,
    isDragging: isConnectionDragging,
    dragHandleProps: connectionDragHandleProps,
    resetOffset: resetConnectionOffset,
  } = useDraggablePanel({
    anchorOrigin: "top-left",
  });

  const prevDescribedConnectionRef = useRef(describedConnection);
  useEffect(() => {
    if (prevDescribedConnectionRef.current && !describedConnection) {
      resetConnectionOffset();
    }
    prevDescribedConnectionRef.current = describedConnection;
  }, [describedConnection, resetConnectionOffset]);

  return (
    <>
      <svg className={localStyles.mapConnectionOverlay} aria-label="地図上の接続線">
        {renderableLines.map(
          ({
            id,
            connection,
            selected,
            emphasized,
            isDimmed,
            origin,
            lensCategory,
            segments,
            hullPoints,
            perimeterPoints,
            themeColor,
            lineStyle,
            haloStyle,
          }) => {
            const openMapConnection = (event?: ReactMouseEvent<SVGElement>) => {
              if (event) {
                if (typeof document !== "undefined") {
                  const elements = document.elementsFromPoint(event.clientX, event.clientY);
                  const hitMarker = elements
                    .map((el) =>
                      el.classList.contains(styles.mapMarker)
                        ? el
                        : el.closest<HTMLElement>(`.${styles.mapMarker}`),
                    )
                    .find((el): el is HTMLElement => Boolean(el));
                  if (hitMarker) {
                    hitMarker.click();
                    return;
                  }
                }

                if (containerRef.current) {
                  const allMarkers = [
                    ...containerRef.current.querySelectorAll<HTMLElement>(`.${styles.mapMarker}`),
                  ];
                  for (const markerEl of allMarkers) {
                    const rect = markerEl.getBoundingClientRect();
                    if (
                      event.clientX >= rect.left - 8 &&
                      event.clientX <= rect.right + 8 &&
                      event.clientY >= rect.top - 8 &&
                      event.clientY <= rect.bottom + 8
                    ) {
                      markerEl.click();
                      return;
                    }
                  }
                }
              }

              const wasSelected = connection.selected;
              onSelectMapConnection(connection);
              onSetConnectionChoiceIds(wasSelected ? [] : [connection.id]);
            };

            if (hullPoints || perimeterPoints) {
              const polygonPoints = hullPoints ?? perimeterPoints;
              const isHull = Boolean(hullPoints);
              return (
                <g
                  key={id}
                  className={localStyles.mapHullConnection}
                  data-selected={selected}
                  data-emphasized={emphasized}
                  data-dimmed={isDimmed}
                  data-origin={origin}
                  data-lens-category={lensCategory}
                  data-type={isHull ? "hull" : "perimeter"}
                  style={{ "--hull-color": themeColor ?? "#c89b5f" } as CSSProperties}
                >
                  <polygon
                    points={polygonPoints}
                    className={localStyles.mapHullBase}
                    role="button"
                    tabIndex={0}
                    aria-label={`${connection.title}の領域・勢力圏を表示`}
                    onClick={openMapConnection}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        openMapConnection();
                      }
                    }}
                  />
                  <polygon points={polygonPoints} className={localStyles.mapHullBorder} />
                </g>
              );
            }

            return (
              <g
                key={id}
                className={localStyles.mapProjectedConnection}
                data-selected={selected}
                data-emphasized={emphasized}
                data-dimmed={isDimmed}
                data-origin={origin}
                data-lens-category={lensCategory}
              >
                {segments.map((segment) => (
                  <g key={segment.id}>
                    {segment.hitPath ? (
                      <path
                        d={segment.hitPath}
                        className={localStyles.mapConnectionHit}
                        role="button"
                        tabIndex={0}
                        aria-label={`${connection.title}の説明を表示`}
                        onClick={openMapConnection}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            openMapConnection();
                          }
                        }}
                      />
                    ) : null}
                    <polyline
                      points={segment.points}
                      className={localStyles.mapConnectionHalo}
                      style={haloStyle}
                    />
                    <polyline
                      points={segment.points}
                      className={localStyles.mapConnectionLine}
                      style={lineStyle}
                    />
                  </g>
                ))}
              </g>
            );
          },
        )}
      </svg>

      {describedConnection ? (
        <aside
          className={localStyles.mapConnectionInfo}
          style={connectionPanelStyle}
          data-dragging={isConnectionDragging}
          aria-label="接続線の説明"
          aria-live="polite"
          onClick={(event) => event.stopPropagation()}
        >
          <div
            className={localStyles.mapConnectionInfoHeader}
            {...connectionDragHandleProps}
            title="ドラッグして移動できます"
          >
            <span className={localStyles.mapConnectionInfoTitle}>
              <span className={localStyles.mapConnectionInfoDragHandle} aria-hidden="true">
                ⠿
              </span>
              <small>MAP CONNECTION</small>
            </span>
            <button
              className={styles.mapConnectionInfoClose}
              type="button"
              aria-label="接続の説明を閉じる"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={() => {
                onSetConnectionChoiceIds([]);
                onClearMapConnection();
              }}
            >
              ×
            </button>
          </div>
          <strong>{describedConnection.title}</strong>
          <span>{mapEvidenceLabel(describedConnection)}</span>
          <div className={localStyles.mapConnectionMetadata}>
            <span>{connectionKindLabels[describedConnection.connectionKind]}</span>
            {describedConnection.relationFamilies.map((family) => (
              <span key={family}>{relationFamilyLabels[family] ?? family}</span>
            ))}
            {describedConnection.confidences.map((confidence) => (
              <span key={confidence}>{confidenceLabels[confidence] ?? confidence}</span>
            ))}
          </div>
          <p>{describedConnection.summary}</p>
          {describedConnection.points.length > 0 ? (
            <div className={localStyles.mapConnectionPoints}>
              <small className={localStyles.mapConnectionPointsTitle}>
                構成拠点（{describedConnection.points.length}地点）
              </small>
              <div className={localStyles.mapConnectionPointTags}>
                {describedConnection.points.map((point) => {
                  const isAreaExplored =
                    point.spatialGranularity === "area" && (point.areaVisitedSpotCount ?? 0) > 0;
                  return (
                    <button
                      key={point.id}
                      type="button"
                      className={localStyles.mapConnectionPointTag}
                      data-kind={isAreaExplored ? "visited" : point.kind}
                      onClick={() => onPointClick(point)}
                      title={
                        isAreaExplored
                          ? `${point.label}（地域踏査済・${point.areaVisitedSpotCount}地点）へ移動`
                          : `${point.label}へ移動`
                      }
                    >
                      <span className={localStyles.mapConnectionPointDot} />
                      <span>
                        {point.label}
                        {isAreaExplored ? ` (${point.areaVisitedSpotCount}地点)` : ""}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
          {describedConnection.lensRefs.length ? (
            <div className={localStyles.mapConnectionLinks}>
              <small>対応するLENS / TOPIC</small>
              {describedConnection.lensRefs.map((reference) => (
                <button
                  key={`${reference.lensId}:${reference.topicId ?? ""}`}
                  type="button"
                  onClick={() => onSelectRecognitionLens(reference.lensId, reference.topicId)}
                >
                  {reference.topicLabel ?? reference.lensId}
                  <span>LENSで見る →</span>
                </button>
              ))}
            </div>
          ) : describedConnection.connectionKind === "itinerary" ? (
            <small>旅程線は移動順を示すため、LENSには割り当てません。</small>
          ) : null}
          {describedConnection.claimIds.length ? (
            <Link
              className={localStyles.mapConnectionEvidenceLink}
              href={`/review?view=graph&claim=${encodeURIComponent(describedConnection.claimIds[0])}`}
            >
              根拠のClaimを見る →
            </Link>
          ) : null}
          {describedConnection.origin === "knowledge-pack" && describedConnection.lensRefs.length ? (
            <span>
              {describedConnection.assertionIds.length}件のAssertionと
              {describedConnection.sourceIds.length}件のSourceは、対応LENSで確認できます。
            </span>
          ) : null}
          {describedConnection.knowledgeEvidence ? (
            <details className={localStyles.mapConnectionEvidenceDetails}>
              <summary>Assertion / Sourceを確認</summary>
              <ul>
                {describedConnection.knowledgeEvidence.assertions.map((assertion) => (
                  <li key={assertion.id}>
                    <strong>
                      {assertion.subjectLabel} → {assertion.objectLabel}
                    </strong>
                    <small>
                      {relationFamilyLabels[assertion.relationFamily] ?? assertion.predicate} ·{" "}
                      {confidenceLabels[assertion.confidence] ?? assertion.confidence} ·{" "}
                      {assertion.reviewStatus === "reviewed"
                        ? "確認済み"
                        : assertion.reviewStatus === "draft"
                          ? "Draft"
                          : "不採用"}
                    </small>
                    {assertion.note ? <p>{assertion.note}</p> : null}
                  </li>
                ))}
              </ul>
              <ul>
                {describedConnection.knowledgeEvidence.sources.map((source) => (
                  <li key={source.id}>
                    <strong>{source.title}</strong>
                    <small>
                      {[
                        source.authors.join("・"),
                        source.publisher,
                        source.publishedAt,
                        source.locator,
                      ]
                        .filter(Boolean)
                        .join(" / ")}
                    </small>
                    {source.url ? (
                      <a href={source.url} target="_blank" rel="noreferrer">
                        参照先を開く ↗
                      </a>
                    ) : null}
                  </li>
                ))}
              </ul>
            </details>
          ) : null}
          {connectionChoiceIds.length > 1 ? (
            <div className={localStyles.mapConnectionChoices}>
              {connectionChoiceIds.map((id) => {
                const connection = mapConnections.find((candidate) => candidate.id === id);
                if (!connection) return null;
                return (
                  <button
                    key={id}
                    type="button"
                    data-active={connection.id === activeMapConnectionId}
                    onClick={() => onSelectMapConnection(connection)}
                  >
                    {connection.title}
                  </button>
                );
              })}
            </div>
          ) : null}
        </aside>
      ) : null}
    </>
  );
});
