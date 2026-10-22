"use client";

import { useEffect, useMemo, useState } from "react";

import { buildLensExplorationLinksByIdentity } from "@/domain/lens-packs/exploration-links";
import { projectLensPreset } from "@/domain/lens-packs/projection";
import { resolveLensEntityForSpot } from "@/domain/lens-packs/preset-selection";
import { lensEntityNamesMatch } from "@/domain/lens-packs/entity-identity";
import { resolveCrossTopicPortals } from "@/domain/lens-packs/cross-topic-portals";
import {
  matchLensNodeForCandidate,
  matchCandidateForLensNode,
  matchLensNodeForSpot,
  resolveSpotForLensNode,
} from "@/domain/lenses/candidate-matching";
import { getEntityKindMeta, getNodeVisualTier } from "@/domain/lenses/entity-presentation";
import { getRelationMeta, getTopicStructuralThesis } from "@/domain/lenses/relation-presentation";
import {
  calculateMatrixComparisonLayout,
  type MatrixColumnDefinition,
} from "@/domain/lenses/layout/matrix-comparison-layout";
import type { ResolvedLensTopic } from "@/domain/lenses/topic-resolver";
import type {
  ReviewAtlasSpot,
  ReviewDataset,
  ReviewExplorationSuggestion,
} from "@/domain/review/types";

import styles from "./atlas.module.css";
import { LensSourceDetails } from "./lens-source-details";
import { useLensZoomPan, LensZoomControls } from "./use-lens-zoom-pan";

export function ComparisonMatrixLens({
  lensLabel = "比較・対比",
  topic,
  claims,
  spots,
  selectedSpotId,
  selectedNodeId = "",
  selectedSuggestion,
  suggestions = [],
  onSelectSpot,
  onSelectNode,
  onSelectSuggestion,
  onSelectPortal,
}: {
  lensLabel?: string;
  topic: ResolvedLensTopic;
  claims: ReviewDataset["claims"];
  spots: ReviewAtlasSpot[];
  selectedSpotId: string;
  selectedNodeId?: string;
  selectedSuggestion?: ReviewExplorationSuggestion;
  suggestions?: ReviewExplorationSuggestion[];
  onSelectSpot: (spotId: string) => void;
  onSelectNode?: (nodeId: string) => void;
  onSelectSuggestion?: (suggestionId: string) => void;
  onSelectPortal?: (lensId: string, topicId: string, nodeId?: string) => void;
}) {
  const pack = topic.pack;
  const projection = useMemo(
    () => projectLensPreset(pack, topic.presetId),
    [pack, topic.presetId],
  );

  const nodeById = useMemo(
    () => new Map(projection.nodes.map((node) => [node.id, node])),
    [projection.nodes],
  );

  const packEntityById = useMemo(
    () => new Map(pack.entities.map((entity) => [entity.id, entity])),
    [pack.entities],
  );

  const explorationLinks = useMemo(
    () => buildLensExplorationLinksByIdentity(claims, spots, projection.nodes),
    [claims, spots, projection.nodes],
  );

  const selectedSpot = spots.find((spot) => spot.id === selectedSpotId);
  const spotEntity = useMemo(
    () => resolveLensEntityForSpot(pack, topic.presetId, selectedSpot),
    [pack, selectedSpot, topic.presetId],
  );

  const matchedCandidate = useMemo(
    () => matchLensNodeForCandidate(projection.nodes, selectedSuggestion),
    [projection.nodes, selectedSuggestion],
  );
  const matchedSuggestionNodeId = matchedCandidate?.id;

  const [internalSelectedNodeId, setInternalSelectedNodeId] = useState("");
  const [inspectorTab, setInspectorTab] = useState<"node" | "matrix" | "sources">("matrix");

  // Matrix Columns Construction
  const { columns, contrastNote } = useMemo(() => {
    const preset = pack.presets.find((p) => p.id === topic.presetId);

    // If preset has structured mapConnections (>= 2), use them as primary semantic comparative tracks
    if (preset?.mapConnections && preset.mapConnections.length >= 2) {
      const cols: MatrixColumnDefinition[] = preset.mapConnections.map((conn) => {
        const anchorId = conn.anchorEntityId ?? conn.placeEntityIds[0];
        const allMemberIds = Array.from(
          new Set([...conn.placeEntityIds, ...(conn.contextEntityIds ?? [])]),
        );

        return {
          id: conn.id,
          title: conn.label,
          subtitle: conn.description ?? "",
          color: conn.appearance?.color,
          anchorNodeId: anchorId,
          memberNodeIds: allMemberIds,
        };
      });

      // Include any distinct root entities not covered by mapConnections as additional tracks
      const coveredIds = new Set(cols.flatMap((c) => [c.anchorNodeId, ...c.memberNodeIds]).filter((id): id is string => Boolean(id)));
      const uncoveredRoots = (preset.rootEntityIds ?? []).filter((id) => !coveredIds.has(id));
      for (const rootId of uncoveredRoots) {
        const rootNode = nodeById.get(rootId) ?? packEntityById.get(rootId);
        if (rootNode) {
          const connected = new Set<string>();
          for (const edge of projection.edges) {
            if (edge.subjectId === rootId) connected.add(edge.objectId);
            else if (edge.objectId === rootId) connected.add(edge.subjectId);
          }
          const rootMeta = getEntityKindMeta(rootNode.kind, rootNode);
          cols.push({
            id: rootId,
            title: rootNode.label,
            subtitle: rootNode.description ?? `${rootMeta.icon} ${rootMeta.label}`,
            color: rootMeta.color,
            anchorNodeId: rootId,
            memberNodeIds: Array.from(connected),
          });
        }
      }

      return { columns: cols, contrastNote: preset.description ?? topic.description ?? "" };
    }

    // Fallback: Group / polity or rootEntityIds based clustering
    const rootIds = preset?.rootEntityIds ?? [];
    let columnAnchors = projection.nodes.filter(
      (n) => n.kind === "group" || n.kind === "polity" || n.kind === "concept",
    );

    if (columnAnchors.length === 0 && rootIds.length >= 2) {
      columnAnchors = rootIds
        .map((id) => nodeById.get(id) ?? packEntityById.get(id))
        .filter((n): n is (typeof projection.nodes)[number] => Boolean(n));
    }

    if (columnAnchors.length === 0) {
      const majorPlaces = projection.nodes.filter((n) => n.kind === "place").slice(0, 3);
      if (majorPlaces.length >= 2) {
        columnAnchors = majorPlaces;
      } else {
        columnAnchors = projection.nodes.slice(0, 3);
      }
    }

    const cols: MatrixColumnDefinition[] = columnAnchors.map((anchor) => {
      const connectedNodeIds = new Set<string>();
      for (const edge of projection.edges) {
        if (edge.subjectId === anchor.id && edge.objectId !== anchor.id) {
          connectedNodeIds.add(edge.objectId);
        } else if (edge.objectId === anchor.id && edge.subjectId !== anchor.id) {
          connectedNodeIds.add(edge.subjectId);
        }
      }

      const anchorMeta = getEntityKindMeta(anchor.kind, anchor);
      return {
        id: anchor.id,
        title: anchor.label,
        subtitle: anchor.description ?? `${anchorMeta.icon} ${anchorMeta.label}`,
        color: anchorMeta.color,
        anchorNodeId: anchor.id,
        memberNodeIds: Array.from(connectedNodeIds),
      };
    });

    return { columns: cols, contrastNote: preset?.description ?? topic.description ?? "" };
  }, [projection.nodes, projection.edges, pack.presets, topic.description, topic.presetId, nodeById, packEntityById]);

  // Headless Matrix Comparison Layout Engine
  const { nodePositions, columnZones, edges: layoutEdges, canvasWidth, canvasHeight } = useMemo(() => {
    return calculateMatrixComparisonLayout(projection.nodes, projection.edges, columns);
  }, [projection.nodes, projection.edges, columns]);

  // Active node determination
  const activeNodeId = useMemo(() => {
    if (internalSelectedNodeId && projection.nodes.some((n) => n.id === internalSelectedNodeId)) {
      return internalSelectedNodeId;
    }
    if (matchedSuggestionNodeId && projection.nodes.some((n) => n.id === matchedSuggestionNodeId)) {
      return matchedSuggestionNodeId;
    }
    if (selectedNodeId) {
      const direct = projection.nodes.find((n) => n.id === selectedNodeId);
      if (direct) return direct.id;
      const byName = projection.nodes.find((n) =>
        [n.label, ...n.aliases].some((name) => lensEntityNamesMatch(name, selectedNodeId)),
      );
      if (byName) return byName.id;
    }
    if (spotEntity && projection.nodes.some((n) => n.id === spotEntity.id)) {
      return spotEntity.id;
    }
    return projection.nodes[0]?.id ?? "";
  }, [internalSelectedNodeId, matchedSuggestionNodeId, selectedNodeId, spotEntity, projection.nodes]);

  const activeNode = nodeById.get(activeNodeId) ?? projection.nodes[0];
  const activeNodeMeta = activeNode ? getEntityKindMeta(activeNode.kind, activeNode) : undefined;
  const activeLink = activeNode ? explorationLinks.get(activeNode.id) : undefined;

  const {
    zoom,
    pan,
    isPanning,
    isCentering,
    isExpanded,
    toggleExpand,
    centerOn,
    viewportRef,
    pointerHandlers,
    handleZoom,
    handleResetZoom,
    isClickSuppressed,
  } = useLensZoomPan();

  useEffect(() => {
    let matchedId = "";
    if (selectedSpot) {
      const matched = matchLensNodeForSpot(projection.nodes, selectedSpot, explorationLinks);
      if (matched) matchedId = matched.id;
    } else if (selectedSuggestion) {
      const matchedNode = matchLensNodeForCandidate(projection.nodes, selectedSuggestion);
      if (matchedNode) {
        matchedId = matchedNode.id;
      }
    }
    if (matchedId) {
      setInternalSelectedNodeId(matchedId);
      setInspectorTab("node");
      const pos = nodePositions.get(matchedId);
      if (pos) {
        centerOn(pos.x, pos.y);
      }
    } else {
      setInternalSelectedNodeId("");
    }
  }, [selectedSuggestion?.id, selectedSpotId, selectedSpot, topic.id, centerOn, explorationLinks, nodePositions, projection.nodes]);

  const selectedEdges = projection.edges.filter(
    (edge) => edge.subjectId === activeNodeId || edge.objectId === activeNodeId,
  );
  const selectedAssertions = useMemo(() => {
    const edgeIds = new Set(selectedEdges.map((e) => e.id));
    return pack.assertions.filter((a) => edgeIds.has(a.id));
  }, [selectedEdges, pack.assertions]);

  const selectNode = (nodeId: string) => {
    if (isClickSuppressed()) return;
    setInternalSelectedNodeId(nodeId);
    setInspectorTab("node");
    const pos = nodePositions.get(nodeId);
    if (pos) {
      centerOn(pos.x, pos.y);
    }
    const node = nodeById.get(nodeId) ?? packEntityById.get(nodeId);
    const link = explorationLinks.get(nodeId);
    const linkedSpotId = resolveSpotForLensNode(node, link, spots);
    if (linkedSpotId) {
      onSelectSpot(linkedSpotId);
      return;
    }
    if (onSelectSuggestion && node && suggestions.length > 0) {
      const candidate = matchCandidateForLensNode(node, suggestions);
      if (candidate) {
        onSelectSuggestion(candidate.id);
        return;
      }
    }
    onSelectNode?.(nodeId);
  };

  const isCandidateSelected = Boolean(
    selectedSuggestion && matchedSuggestionNodeId && activeNodeId === matchedSuggestionNodeId,
  );

  return (
    <aside className={styles.genealogyPanel} aria-label={`${lensLabel}レンズ`}>
      <div className={styles.panelHeader}>
        <div>
          <span className={styles.panelIndex}>LENS ({topic.archetypeLabel})</span>
          <h2>{lensLabel}</h2>
        </div>
        <span>
          PACK {projection.packVersion} / {projection.status.toUpperCase()}
        </span>
      </div>

      <div className={styles.genealogyBody}>
        {/* Sleek Compact Context Bar */}
        <div className={styles.lensCompactContextBar}>
          <span className={styles.topicArchetypePill}>仮説対比・マトリクス型</span>
          <strong>{projection.title}</strong>
          <small>{columns.length}系統の並列対比</small>
        </div>

        {/* Structural Thesis Banner */}
        <div className={styles.lensStructuralThesisBanner}>
          <span className={styles.lensStructuralThesisIcon}>💡</span>
          <span className={styles.lensStructuralThesisText}>
            {getTopicStructuralThesis(topic)}
          </span>
        </div>

        {/* Synthesis Contrast Note */}
        {contrastNote ? (
          <div className={styles.matrixContrastCallout} style={{ padding: "8px 12px", margin: "0 0 10px" }}>
            <strong>対比・構造分析の要諦:</strong> {contrastNote}
          </div>
        ) : null}

        {/* Interactive Visual SVG Comparison Matrix with Zoom & Pan */}
        <div
          ref={viewportRef}
          className={styles.lensGraphViewport}
          data-expanded={isExpanded}
          style={{ cursor: isPanning ? "grabbing" : "grab" }}
          {...pointerHandlers}
        >
          <LensZoomControls
            zoom={zoom}
            onZoom={handleZoom}
            onReset={handleResetZoom}
            isExpanded={isExpanded}
            onToggleExpand={toggleExpand}
          />
          <div className={styles.lensZoomHint}>
            <span className={styles.lensZoomHintDesktop}>ドラッグで移動 · ホイールで拡大縮小</span>
            <span className={styles.lensZoomHintMobile}>ピンチで拡大縮小 · 1本指で移動 · ダブルタップ</span>
          </div>

          <svg
            className={styles.lensGraphSvg}
            viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
            role="img"
            aria-label={`${projection.title} 仮説対比マトリクス構造図`}
          >
            <defs>
              <marker
                id="matrix-cross-arrow"
                viewBox="0 0 10 10"
                refX="6"
                refY="5"
                markerWidth="5"
                markerHeight="5"
                orient="auto-start-reverse"
              >
                <path d="M 0 2 L 7 5 L 0 8 z" fill="var(--gold)" />
              </marker>
            </defs>

            <g
              transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}
              style={{
                transition: isCentering ? "transform 0.42s cubic-bezier(0.2, 0.9, 0.3, 1)" : "none",
              }}
            >
              {/* 1. Parallel Column Track Background Cards */}
              {columnZones.map((zone) => (
                <g key={zone.id}>
                  {/* Outer column container */}
                  <rect
                    x={zone.bounds.x}
                    y={zone.bounds.y}
                    width={zone.bounds.width}
                    height={zone.bounds.height}
                    rx="10"
                    className={styles.matrixColumnTrack}
                    style={{
                      borderTop: `3px solid ${zone.color}`,
                    }}
                  />
                  {/* Colored top accent line */}
                  <line
                    x1={zone.bounds.x + 8}
                    y1={zone.bounds.y}
                    x2={zone.bounds.x + zone.bounds.width - 8}
                    y2={zone.bounds.y}
                    stroke={zone.color}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  {/* Track Header Box */}
                  <rect
                    x={zone.bounds.x + 1}
                    y={zone.bounds.y + 1}
                    width={zone.bounds.width - 2}
                    height={46}
                    rx="9"
                    className={styles.matrixColumnTrackHeader}
                  />
                  {/* Track Title */}
                  <text
                    x={zone.bounds.x + zone.bounds.width / 2}
                    y={zone.bounds.y + 20}
                    textAnchor="middle"
                    className={styles.matrixTrackTitle}
                    fill={zone.color}
                  >
                    {zone.title}
                  </text>
                  {/* Track Subtitle / Count */}
                  <text
                    x={zone.bounds.x + zone.bounds.width / 2}
                    y={zone.bounds.y + 35}
                    textAnchor="middle"
                    className={styles.matrixTrackSubtitle}
                  >
                    {zone.subtitle ? zone.subtitle.slice(0, 18) : `${zone.memberCount}要素`}
                  </text>
                </g>
              ))}

              {/* 2. Edges: Intra-column & Cross-column comparative links */}
              {layoutEdges.map((edge) => {
                const isAdjacentToActive =
                  edge.fromId === activeNodeId || edge.toId === activeNodeId;
                if (!edge.isCrossColumn) {
                  return (
                    <path
                      key={edge.id}
                      d={edge.pathD}
                      className={styles.matrixIntraEdge}
                      style={{
                        stroke: isAdjacentToActive ? "var(--gold)" : "rgba(255, 255, 255, 0.15)",
                        strokeWidth: isAdjacentToActive ? 2 : 1.2,
                      }}
                    />
                  );
                }

                // Cross-column comparison edge
                return (
                  <path
                    key={edge.id}
                    d={edge.pathD}
                    className={
                      isAdjacentToActive
                        ? styles.matrixCrossEdgeActive
                        : styles.matrixCrossEdge
                    }
                    style={{
                      stroke: isAdjacentToActive ? "var(--gold)" : edge.color,
                      strokeDasharray: "none",
                    }}
                    markerEnd={isAdjacentToActive ? "url(#matrix-cross-arrow)" : undefined}
                  />
                );
              })}

              {/* 3. Member Nodes in Dimensions */}
              {Array.from(nodePositions.entries()).map(([id, pos]) => {
                const node = nodeById.get(id) ?? packEntityById.get(id);
                const meta = getEntityKindMeta(node?.kind, node);
                const isActive = id === activeNodeId;
                const isCandidateActive = id === matchedSuggestionNodeId;
                const link = explorationLinks.get(id);
                const hasSpots = (link?.spotIds.length ?? 0) > 0;
                const isVisited = (link?.observedSpotIds.length ?? 0) > 0;

                const nodeWidth = pos.width;
                const nodeHeight = pos.height;
                const leftX = pos.x - nodeWidth / 2;
                const topY = pos.y - nodeHeight / 2;

                return (
                  <g
                    key={id}
                    className={styles.lensNodeGroup}
                    data-active={isActive}
                    data-candidate-active={isCandidateActive}
                    data-tier={pos.tier}
                    onClick={() => selectNode(id)}
                    style={{ cursor: "pointer" }}
                  >
                    {/* Active Halo */}
                    {isActive || isCandidateActive ? (
                      <rect
                        x={leftX - 4}
                        y={topY - 4}
                        width={nodeWidth + 8}
                        height={nodeHeight + 8}
                        rx={nodeHeight / 2 + 4}
                        fill="none"
                        stroke={isActive ? "var(--gold)" : "#d7a6ff"}
                        strokeWidth="2.5"
                        filter={
                          isActive
                            ? "drop-shadow(0 0 8px rgba(212, 175, 55, 0.7))"
                            : "drop-shadow(0 0 8px rgba(215, 166, 255, 0.7))"
                        }
                      />
                    ) : null}

                    {/* Main Node Card */}
                    <rect
                      x={leftX}
                      y={topY}
                      width={nodeWidth}
                      height={nodeHeight}
                      rx={nodeHeight / 2}
                      className={styles.lensNodeCard}
                      style={{
                        fill: isActive
                          ? "rgba(212, 175, 55, 0.22)"
                          : pos.tier === 1
                          ? "rgba(18, 36, 44, 0.95)"
                          : "rgba(12, 26, 32, 0.9)",
                        stroke: isActive
                          ? "var(--gold)"
                          : isCandidateActive
                          ? "#d7a6ff"
                          : pos.tier === 1
                          ? "var(--aqua)"
                          : "rgba(255, 255, 255, 0.25)",
                        strokeWidth: isActive || isCandidateActive ? 2 : 1.2,
                      }}
                    />

                    {/* Kind Icon + Label */}
                    <text
                      x={pos.x}
                      y={pos.y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className={styles.lensNodeTitle}
                      style={{
                        fill: isActive ? "var(--gold)" : "var(--ink)",
                        fontWeight: pos.tier === 1 ? 700 : 500,
                        fontSize: pos.tier === 1 ? "12px" : "11px",
                      }}
                    >
                      {meta.icon} {node?.label ?? id}
                    </text>

                    {/* Visited indicator dot */}
                    {hasSpots ? (
                      <circle
                        cx={leftX + nodeWidth - 9}
                        cy={pos.y}
                        r="3.5"
                        fill={isVisited ? "var(--aqua)" : "rgba(255, 255, 255, 0.25)"}
                      />
                    ) : null}
                  </g>
                );
              })}
            </g>
          </svg>
        </div>

        {/* Symmetric Tabbed Inspector Container */}
        <div className={styles.lensInspectorContainer}>
          <div className={styles.lensInspectorTabs}>
            <button
              type="button"
              className={styles.lensInspectorTabBtn}
              data-active={inspectorTab === "node"}
              onClick={() => setInspectorTab("node")}
            >
              🎯 要素詳細
            </button>
            <button
              type="button"
              className={styles.lensInspectorTabBtn}
              data-active={inspectorTab === "matrix"}
              onClick={() => setInspectorTab("matrix")}
            >
              📊 比較系列・要諦 ({columns.length})
            </button>
            <button
              type="button"
              className={styles.lensInspectorTabBtn}
              data-active={inspectorTab === "sources"}
              onClick={() => setInspectorTab("sources")}
            >
              📚 典拠・史料 ({selectedAssertions.length})
            </button>
          </div>

          <div className={styles.lensInspectorContent}>
            {inspectorTab === "node" && activeNode ? (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                  {activeNodeMeta ? (
                    <span
                      className={styles.factionActiveKind}
                      style={{
                        color: activeNodeMeta.color,
                        backgroundColor: activeNodeMeta.bg,
                        borderColor: activeNodeMeta.border,
                      }}
                    >
                      {activeNodeMeta.icon} {activeNodeMeta.label}
                    </span>
                  ) : null}
                  <strong style={{ fontSize: "14px", color: "var(--gold)" }}>{activeNode.label}</strong>
                  {activeNode.aliases && activeNode.aliases.length > 0 ? (
                    <small style={{ color: "var(--muted)", fontSize: "11px" }}>
                      別名: {activeNode.aliases.join(" / ")}
                    </small>
                  ) : null}
                </div>

                {activeNode.description ? (
                  <p style={{ margin: "4px 0 8px", fontSize: "12px", lineHeight: "1.5", color: "var(--ink)" }}>
                    {activeNode.description}
                  </p>
                ) : null}

                {/* Spot Connection */}
                {activeLink && activeLink.spotIds.length > 0 ? (
                  <div className={styles.factionSpotBox}>
                    <span className={styles.factionSpotTitle}>探索スポットとの接続</span>
                    <div className={styles.factionSpotList}>
                      {activeLink.spotIds.map((sId) => {
                        const spot = spots.find((s) => s.id === sId);
                        if (!spot) return null;
                        const isSelected = spot.id === selectedSpotId;

                        return (
                          <button
                            key={spot.id}
                            type="button"
                            className={styles.factionSpotItem}
                            data-active={isSelected}
                            onClick={() => onSelectSpot(spot.id)}
                          >
                            <span>{spot.name}</span>
                            <small>{spot.region}</small>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                {/* Candidate exploration indicator */}
                {isCandidateSelected ? (
                  <div className={styles.candidateFocusNotice}>
                    <strong>候補地探索と一致</strong>
                    <p>選択中の未訪問候補は、この対比マトリクス上の構成要素です。</p>
                  </div>
                ) : null}

                {/* Cross-Topic Portals (ADR-0022) */}
                {(() => {
                  const portals = resolveCrossTopicPortals(
                    { id: activeNode.id, label: activeNode.label, aliases: activeNode.aliases ?? [] },
                    { currentTopicId: topic.id },
                  );
                  if (portals.length === 0) return null;
                  return (
                    <div style={{ marginTop: 10 }}>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 600,
                          color: "var(--muted)",
                          display: "block",
                          marginBottom: 6,
                        }}
                      >
                        この対象を別の視点・トピックで見る
                      </span>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {portals.map((p) => (
                          <button
                            key={p.topicId}
                            type="button"
                            className={styles.genealogySpotAction}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                              padding: "4px 8px",
                              fontSize: "0.75rem",
                            }}
                            onClick={() => onSelectPortal?.(p.lensId, p.topicId, activeNode.id)}
                            title={`${p.lensLabel}: ${p.topicLabel}`}
                          >
                            <span
                              style={{
                                padding: "1px 5px",
                                borderRadius: "3px",
                                fontSize: "0.65rem",
                                fontWeight: 600,
                                backgroundColor: "rgba(215, 166, 255, 0.2)",
                                color: "#d7a6ff",
                              }}
                            >
                              {p.lensLabel}
                            </span>
                            <strong style={{ fontSize: "0.8rem", color: "var(--ink)", fontWeight: 600 }}>
                              {p.topicLabel}
                            </strong>
                            <span style={{ fontSize: "0.75rem", color: "var(--gold)" }}>→</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : null}

            {inspectorTab === "matrix" ? (
              <div>
                <strong style={{ display: "block", marginBottom: 6, color: "var(--ink)" }}>
                  {projection.title}
                </strong>
                {contrastNote ? (
                  <p style={{ margin: "0 0 10px", fontSize: "12px", lineHeight: "1.6", color: "var(--muted)" }}>
                    {contrastNote}
                  </p>
                ) : null}

                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
                  <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--gold)" }}>
                    並列対比系列（{columns.length}系列）
                  </span>
                  {columns.map((col) => (
                    <div
                      key={col.id}
                      style={{
                        padding: "8px 10px",
                        background: "rgba(255, 255, 255, 0.04)",
                        borderLeft: `3px solid ${col.color ?? "var(--aqua)"}`,
                        borderRadius: "0 4px 4px 0",
                        fontSize: "11.5px",
                        cursor: col.anchorNodeId ? "pointer" : "default",
                      }}
                      onClick={() => col.anchorNodeId && selectNode(col.anchorNodeId)}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <strong style={{ color: col.color ?? "var(--aqua)" }}>{col.title}</strong>
                        <span style={{ color: "var(--muted)", fontSize: "11px" }}>
                          {col.memberNodeIds.length + (col.anchorNodeId ? 1 : 0)}要素
                        </span>
                      </div>
                      {col.subtitle ? (
                        <p style={{ margin: "4px 0 0", color: "var(--muted)", fontSize: "11px" }}>
                          {col.subtitle}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {inspectorTab === "sources" ? (
              <LensSourceDetails pack={pack} assertions={selectedAssertions} />
            ) : null}
          </div>
        </div>
      </div>
    </aside>
  );
}
