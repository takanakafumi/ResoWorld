"use client";

import { type CSSProperties, memo, useEffect, useRef } from "react";
import type { Map as MapLibreMap } from "maplibre-gl";
import type {
  ArtifactCountDetail,
  ArtifactOverlayId,
} from "@/domain/archaeology/artifact-overlay-types";
import { useArtifactOverlay } from "./use-artifact-overlay";
import { useDraggablePanel } from "./use-draggable-panel";
import styles from "./map-artifact-overlay-layer.module.css";
import cardStyles from "./map-artifact-card.module.css";

export const MapArtifactOverlayLayer = memo(function MapArtifactOverlayLayer({
  map,
  mapRevision,
  activeOverlayId,
  selectedSiteId,
  onSelectSite,
}: {
  map: MapLibreMap | null;
  mapRevision: number;
  activeOverlayId: ArtifactOverlayId;
  selectedSiteId: string | null;
  onSelectSite: (siteId: string | null) => void;
}) {
  const artifact = useArtifactOverlay({
    map,
    mapRevision,
    activeOverlayId,
    selectedSiteId,
    onSelectSite,
  });

  const {
    panelStyle: artifactPanelStyle,
    isDragging: isArtifactDragging,
    dragHandleProps: artifactDragHandleProps,
    resetOffset: resetArtifactOffset,
  } = useDraggablePanel({
    anchorOrigin: "bottom-left",
  });

  const prevSelectedArtifactSiteIdRef = useRef<string | null>(artifact.selectedSite?.id ?? null);
  useEffect(() => {
    const currentId = artifact.selectedSite?.id ?? null;
    if (prevSelectedArtifactSiteIdRef.current !== currentId) {
      prevSelectedArtifactSiteIdRef.current = currentId;
      resetArtifactOffset();
    }
  }, [artifact.selectedSite?.id, resetArtifactOffset]);

  return (
    <>
      {artifact.isLayerActive && artifact.screenMarkers.length > 0 ? (
        <svg
          className={styles.mapArtifactOverlaySvg}
          aria-label="出土遺物分布オーバーレイ"
        >
          {/* Supply Chain Trajectory Line (Origin -> Recipient) */}
          {artifact.screenTrajectory ? (
            <g className={styles.artifactTrajectoryGroup}>
              <path
                d={artifact.screenTrajectory.pathD}
                className={styles.artifactSupplyChainTrajectoryLine}
              >
                {artifact.screenTrajectory.distributionRoute ? (
                  <title>{artifact.screenTrajectory.distributionRoute}</title>
                ) : null}
              </path>
            </g>
          ) : null}

          {artifact.screenMarkers.map((marker) => {
            const isSelected = marker.isSelected;
            const isFocusedOrigin = marker.isFocusedOrigin;
            const isPrimarySource = marker.shapeType === "diamond";
            const isWorkshop = marker.shapeType === "hexagon";

            return (
              <g
                key={marker.id}
                className={styles.artifactMarkerGroup}
                data-selected={isSelected}
                data-shape={marker.shapeType}
                data-origin={marker.isOriginSite}
                data-focused-origin={isFocusedOrigin}
                transform={`translate(${marker.screenX}, ${marker.screenY})`}
                onClick={(e) => {
                  e.stopPropagation();
                  artifact.onSelectSite(marker.siteId);
                }}
              >
                <title>{`${marker.name} (${marker.originKindLabel} · ${marker.badgeText})${marker.provenanceRegion ? `\n産地・供給: ${marker.provenanceRegion}` : ""}${isFocusedOrigin ? "\n★選択地点の原料産地・工房" : ""}`}</title>

                {isPrimarySource ? (
                  <>
                    {isFocusedOrigin || isSelected ? (
                      <polygon
                        points={marker.diamondPoints}
                        className={styles.artifactFocusedDiamondPulse}
                      />
                    ) : null}
                    <polygon
                      points={marker.diamondPoints}
                      className={styles.artifactDiamondAura}
                      fill={isFocusedOrigin ? "#fef08a" : marker.accentColor}
                    />
                    <polygon
                      points={marker.diamondPoints}
                      className={styles.artifactDiamondBody}
                      fill={marker.accentColor}
                    />
                    <text className={styles.artifactBadgeText}>
                      {marker.totalCount > 1 ? marker.badgeText : "⛰️ 産地"}
                    </text>
                    <g transform={`translate(0, ${-(marker.pixelRadius * 1.18 + 14)})`}>
                      <rect
                        x={-36}
                        y={-9}
                        width={72}
                        height={18}
                        rx={4}
                        className={styles.artifactOriginPillRect}
                        style={{
                          fill:
                            isFocusedOrigin || isSelected
                              ? "#fef08a"
                              : "rgba(254, 240, 138, 0.92)",
                        }}
                      />
                      <text className={styles.artifactOriginPill}>
                        {isFocusedOrigin ? "⛰️ 供給産地" : "⛰️ 原産地"}
                      </text>
                    </g>
                  </>
                ) : isWorkshop ? (
                  <>
                    {isFocusedOrigin || isSelected ? (
                      <polygon
                        points={marker.hexagonPoints}
                        className={styles.artifactFocusedDiamondPulse}
                        style={{ stroke: "#38bdf8" }}
                      />
                    ) : null}
                    <polygon
                      points={marker.hexagonPoints}
                      className={styles.artifactHexagonAura}
                      fill="#38bdf8"
                    />
                    <polygon
                      points={marker.hexagonPoints}
                      className={styles.artifactHexagonBody}
                      fill={marker.accentColor}
                    />
                    <text className={styles.artifactBadgeText}>
                      {marker.totalCount > 1 ? marker.badgeText : "⚒️ 工房"}
                    </text>
                    <g transform={`translate(0, ${-(marker.pixelRadius * 1.08 + 14)})`}>
                      <rect
                        x={-34}
                        y={-9}
                        width={68}
                        height={18}
                        rx={4}
                        className={styles.artifactOriginPillRect}
                        style={{
                          fill:
                            isFocusedOrigin || isSelected
                              ? "#38bdf8"
                              : "rgba(56, 189, 248, 0.92)",
                        }}
                      />
                      <text className={styles.artifactOriginPill} style={{ fill: "#0c4a6e" }}>
                        ⚒️ 製作工房
                      </text>
                    </g>
                  </>
                ) : (
                  <>
                    {isFocusedOrigin ? (
                      <>
                        <circle
                          r={marker.pixelRadius * 1.3}
                          className={styles.artifactFocusedOriginPulseRingOuter}
                        />
                        <circle
                          r={marker.pixelRadius * 1.1}
                          className={styles.artifactFocusedOriginPulseRing}
                        />
                      </>
                    ) : null}
                    <circle
                      r={marker.pixelRadius * 1.35}
                      className={styles.artifactAura}
                      fill={marker.accentColor}
                    />
                    <circle
                      r={marker.pixelRadius}
                      className={styles.artifactBubble}
                      fill={marker.accentColor}
                    />
                    <text className={styles.artifactBadgeText}>{marker.badgeText}</text>
                  </>
                )}

                <text
                  y={marker.pixelRadius + (isPrimarySource ? 17 : 13)}
                  className={styles.artifactLabelText}
                  style={{
                    fill: isPrimarySource ? "#fef08a" : isWorkshop ? "#7dd3fc" : undefined,
                    fontWeight: isPrimarySource || isWorkshop || isFocusedOrigin ? 700 : undefined,
                  }}
                >
                  {isPrimarySource
                    ? `⛰️ ${marker.name}`
                    : isWorkshop
                      ? `⚒️ ${marker.name}`
                      : marker.name}
                </text>
              </g>
            );
          })}
        </svg>
      ) : null}

      {artifact.selectedSite ? (
        <div
          className={cardStyles.mapArtifactCard}
          style={
            {
              ...artifactPanelStyle,
              "--accent-color": artifact.selectedSite.accentColor,
            } as CSSProperties
          }
          data-dragging={isArtifactDragging}
          aria-label="出土遺跡詳細情報"
          onClick={(event) => event.stopPropagation()}
        >
          <div
            className={cardStyles.mapArtifactCardHeader}
            {...artifactDragHandleProps}
            title="ドラッグして移動できます"
          >
            <div className={cardStyles.mapArtifactCardTitles}>
              <div className={cardStyles.mapArtifactCardTitleRow}>
                <span className={cardStyles.mapArtifactCardDragHandle} aria-hidden="true">
                  ⠿
                </span>
                <span className={cardStyles.mapArtifactCardRubi}>{artifact.selectedSite.rubi}</span>
              </div>
              <div className={cardStyles.mapArtifactCardName}>
                <span>{artifact.selectedSite.name}</span>
                {artifact.selectedSite.provenance?.type === "primary-source" ? (
                  <span className={cardStyles.mapArtifactOriginBadgeTag}>⛰️ 原産地・採掘坑</span>
                ) : artifact.selectedSite.provenance?.type === "production-workshop" ? (
                  <span className={cardStyles.mapArtifactWorkshopBadgeTag}>⚒️ 製作工房</span>
                ) : (
                  <span className={cardStyles.mapArtifactExcavationBadgeTag}>⚱️ 出土遺跡</span>
                )}
                {artifact.selectedSite.designation ? (
                  <span className={cardStyles.mapArtifactCardDesignation}>
                    {artifact.selectedSite.designation}
                  </span>
                ) : null}
              </div>
            </div>
            <button
              type="button"
              className={cardStyles.mapArtifactCardCloseBtn}
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => {
                event.stopPropagation();
                artifact.onSelectSite(null);
              }}
              aria-label="閉じる"
            >
              ×
            </button>
          </div>

          <div className={cardStyles.mapArtifactCardMeta}>
            <span className={cardStyles.mapArtifactCardMetaItem}>
              📍 {artifact.selectedSite.prefecture}
              {artifact.selectedSite.municipality}
            </span>
            <span className={cardStyles.mapArtifactCardMetaItem}>
              ⏳ {artifact.selectedSite.periodLabel}
            </span>
            <span className={cardStyles.mapArtifactCardMetaItem}>
              🏛️ {artifact.selectedSite.siteTypeLabel}
            </span>
            {artifact.selectedSite.burialStructureLabel ? (
              <span
                className={cardStyles.mapArtifactCardMetaItem}
                style={{ borderLeft: "2px solid #ec4899", color: "#fce7f3" }}
              >
                🚪 {artifact.selectedSite.burialStructureLabel}
              </span>
            ) : null}
            {artifact.selectedSite.affiliatedPolity ? (
              <span className={cardStyles.mapArtifactCardMetaItem}>
                👑 {artifact.selectedSite.affiliatedPolity}
              </span>
            ) : null}
          </div>

          <div className={cardStyles.mapArtifactCardCounts}>
            {artifact.selectedSite.countDetails.map((detail: ArtifactCountDetail, idx: number) => (
              <div key={idx} className={cardStyles.mapArtifactCountRow}>
                <span className={cardStyles.mapArtifactCountLabel}>
                  <span style={{ color: artifact.selectedSite!.accentColor }}>●</span>{" "}
                  {detail.label}
                </span>
                <span className={cardStyles.mapArtifactCountValue}>
                  {detail.count} {detail.unit}
                </span>
              </div>
            ))}
          </div>

          {artifact.selectedSite.provenance ? (
            <div className={cardStyles.mapArtifactProvenanceCard}>
              <div className={cardStyles.mapArtifactProvenanceHeader}>
                <span className={cardStyles.mapArtifactProvenanceBadge}>
                  {artifact.selectedSite.provenance.typeLabel}
                </span>
                {artifact.selectedSite.provenance.materialName ? (
                  <span className={cardStyles.mapArtifactProvenanceMaterial}>
                    {artifact.selectedSite.provenance.materialName}
                  </span>
                ) : null}
              </div>
              <div className={cardStyles.mapArtifactProvenanceBody}>
                <div className={cardStyles.mapArtifactProvenanceRow}>
                  <span className={cardStyles.mapArtifactProvenanceLabel}>⛰️ 産地・工房:</span>
                  <span className={cardStyles.mapArtifactProvenanceValue}>
                    {artifact.selectedSite.provenance.sourceRegion}
                  </span>
                </div>
                {artifact.selectedSite.provenance.distributionRoute ? (
                  <div className={cardStyles.mapArtifactProvenanceRow}>
                    <span className={cardStyles.mapArtifactProvenanceLabel}>🚢 流通・経路:</span>
                    <span className={cardStyles.mapArtifactProvenanceValue}>
                      {artifact.selectedSite.provenance.distributionRoute}
                    </span>
                  </div>
                ) : null}
                {artifact.selectedSite.provenance.scientificEvidence ? (
                  <div className={cardStyles.mapArtifactProvenanceRow}>
                    <span className={cardStyles.mapArtifactProvenanceLabel}>🔬 科学的根拠:</span>
                    <span className={cardStyles.mapArtifactProvenanceValue}>
                      {artifact.selectedSite.provenance.scientificEvidence}
                    </span>
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}

          <p className={cardStyles.mapArtifactSignificance}>
            {artifact.selectedSite.historicalSignificance}
          </p>

          {artifact.selectedSite.burialTradition ? (
            <div className={cardStyles.mapArtifactBurialTradition}>
              <strong>⚰️ 埋葬思想・死生観:</strong> {artifact.selectedSite.burialTradition}
            </div>
          ) : null}

          <div className={cardStyles.mapArtifactCurationHighlight}>
            <strong>💡 展示・鑑賞の眼目:</strong> {artifact.selectedSite.curationHighlight}
          </div>

          <div className={cardStyles.mapArtifactCardFooter}>
            {artifact.selectedSite.provenance?.originSiteName &&
            artifact.selectedSite.provenance.type !== "primary-source" ? (
              <button
                type="button"
                className={cardStyles.mapArtifactOriginZoomBtn}
                onClick={() => artifact.handleZoomToOrigin()}
                title={`${artifact.selectedSite.provenance.originSiteName}へカメラを移動`}
              >
                ⛰️ 産地地点へフォーカス ↗
              </button>
            ) : null}
            <button
              type="button"
              className={cardStyles.mapArtifactZoomBtn}
              onClick={() => artifact.handleZoomToSite(artifact.selectedSite!)}
            >
              🔍 この地点へフォーカス
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
});
