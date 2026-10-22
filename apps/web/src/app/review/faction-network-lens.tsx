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
import { calculateFactionPolarLayout } from "@/domain/lenses/layout/faction-polar-layout";
import type { ResolvedLensTopic } from "@/domain/lenses/topic-resolver";
import type {
  ReviewAtlasSpot,
  ReviewDataset,
  ReviewExplorationSuggestion,
} from "@/domain/review/types";

import styles from "./atlas.module.css";
import { LensSourceDetails } from "./lens-source-details";
import { useLensZoomPan, LensZoomControls } from "./use-lens-zoom-pan";

export function FactionNetworkLens({
  lensLabel = "政治・社会",
  topic,
  claims,
  spots,
  selectedSpotId,
  selectedNodeId,
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
  const projection = useMemo(() => projectLensPreset(pack, topic.presetId), [pack, topic.presetId]);
  const nodeById = useMemo(() => new Map(projection.nodes.map((n) => [n.id, n])), [projection.nodes]);
  const packEntityById = useMemo(() => new Map(pack.entities.map((e) => [e.id, e])), [pack.entities]);

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
  const [inspectorTab, setInspectorTab] = useState<"node" | "context" | "sources">("context");

  // Headless Polar Faction Layout Engine
  const { nodePositions, factionZones, edges: layoutEdges, canvasWidth, canvasHeight, boundaryAxis } = useMemo(() => {
    return calculateFactionPolarLayout(projection.nodes, projection.edges);
  }, [projection.nodes, projection.edges]);

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

  const activeNode = nodeById.get(activeNodeId) ?? packEntityById.get(activeNodeId);

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
      setInspectorTab("context");
    }
  }, [selectedSuggestion?.id, selectedSpotId, selectedSpot, topic.id, centerOn, explorationLinks, nodePositions, projection.nodes]);

  // Assertions touching activeNode
  const selectedEdges = projection.edges.filter(
    (e) => e.subjectId === activeNodeId || e.objectId === activeNodeId,
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
    const spotId = resolveSpotForLensNode(node, link, spots);
    if (spotId) {
      onSelectSpot(spotId);
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
    <aside className={styles.genealogyPanel} aria-label={`${topic.label}の勢力・相関レンズ`}>
      <div className={styles.panelHeader}>
        <div>
          <span className={styles.panelIndex}>LENS ({topic.archetypeLabel})</span>
          <h2>{lensLabel}</h2>
        </div>
        <span>PACK {pack.version} / FACTION</span>
      </div>

      <div className={`${styles.genealogyBody} ${styles.factionNetworkBody}`}>
        {/* Sleek Compact Context Bar */}
        <div className={styles.lensCompactContextBar}>
          <span className={styles.topicArchetypePill}>勢力・相関型</span>
          <strong>{topic.label}</strong>
          <small>{factionZones.length}陣営の勢力対峙</small>
        </div>

        {/* Structural Thesis Banner: Instantly conveys the mental model at a single glance */}
        <div className={styles.lensStructuralThesisBanner}>
          <span className={styles.lensStructuralThesisIcon}>💡</span>
          <span className={styles.lensStructuralThesisText}>
            {getTopicStructuralThesis(topic)}
          </span>
        </div>

        {/* Interactive Visual SVG Faction Polar Diagram with Zoom & Pan */}
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
            aria-label={`${projection.title} 勢力相関・対峙構造図`}
          >
            <defs>
              <marker
                id="faction-active-arrow"
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

            <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`} style={{ transition: isCentering ? "transform 0.42s cubic-bezier(0.2, 0.9, 0.3, 1)" : "none" }}>
              {/* 1. Faction Zone Background Cards */}
              {factionZones.map((zone) => (
                <g key={zone.id}>
                  <rect
                    x={zone.bounds.x}
                    y={zone.bounds.y}
                    width={zone.bounds.width}
                    height={zone.bounds.height}
                    rx={10}
                    className={styles.factionZoneRect}
                    style={{
                      fill: `color-mix(in srgb, ${zone.color} 8%, rgba(6, 20, 20, 0.85))`,
                      stroke: `color-mix(in srgb, ${zone.color} 35%, transparent)`,
                    }}
                  />
                  {/* Zone Header Label */}
                  <text
                    x={zone.bounds.x + 14}
                    y={zone.bounds.y + 20}
                    className={styles.factionZoneTitle}
                    fill={zone.color}
                  >
                    ★ {zone.label}
                  </text>
                </g>
              ))}

              {/* 2. Central Boundary Axis Line & Emblem */}
              {boundaryAxis ? (
                <g>
                  <line
                    x1={boundaryAxis.x1}
                    y1={boundaryAxis.y1}
                    x2={boundaryAxis.x2}
                    y2={boundaryAxis.y2}
                    className={styles.factionDemarcationLine}
                  />
                  <g transform={`translate(${boundaryAxis.x1}, ${(boundaryAxis.y1 + boundaryAxis.y2) / 2})`}>
                    <rect
                      x={-(boundaryAxis.label.length * 5.5 + 16)}
                      y={-10}
                      width={boundaryAxis.label.length * 11 + 32}
                      height={20}
                      rx={10}
                      className={styles.factionDemarcationBadge}
                    />
                    <text x={0} y={1} className={styles.factionDemarcationText}>
                      {boundaryAxis.icon} {boundaryAxis.label}
                    </text>
                  </g>
                </g>
              ) : null}

              {/* 3. Cross-Faction & Internal Connector Edges */}
              {layoutEdges
                .sort((a, b) => {
                  const aConn = a.subjectId === activeNodeId || a.objectId === activeNodeId;
                  const bConn = b.subjectId === activeNodeId || b.objectId === activeNodeId;
                  if (aConn === bConn) return 0;
                  return aConn ? 1 : -1;
                })
                .map((edge) => {
                  const relMeta = getRelationMeta(edge.predicate, edge.relationFamily);
                  const isConnected = edge.subjectId === activeNodeId || edge.objectId === activeNodeId;
                  const isCross = edge.isCrossFaction;

                  const strokeColor = isConnected ? "var(--gold)" : relMeta.color;
                  const lineClass = isConnected
                    ? styles.treeConnectorLineActive
                    : isCross
                      ? styles.treeConnectorLinePersistent
                      : styles.treeConnectorLineSecondary;

                  const showBadge = true;

                  return (
                    <g key={edge.id}>
                      <path
                        d={edge.pathD}
                        className={lineClass}
                        style={{
                          stroke: strokeColor,
                          strokeDasharray: "none",
                        }}
                        markerEnd={isConnected ? "url(#faction-active-arrow)" : undefined}
                      />
                      {showBadge ? (
                        <g
                          transform={`translate(${edge.labelPosition.x}, ${edge.labelPosition.y})`}
                          className={styles.edgeBadgeGroup}
                        >
                          <rect
                            x={-(relMeta.shortLabel.length * 5.2 + 6)}
                            y={-7.5}
                            width={relMeta.shortLabel.length * 10.4 + 12}
                            height={15}
                            rx={3}
                            className={styles.persistentEdgeBadge}
                            style={{
                              stroke: isConnected ? "var(--gold)" : relMeta.border,
                            }}
                          />
                          <text
                            x={0}
                            y={1}
                            className={styles.persistentEdgeText}
                            style={{
                              fill: isConnected ? "var(--gold)" : relMeta.color,
                            }}
                          >
                            {isConnected ? relMeta.label : relMeta.shortLabel}
                          </text>
                        </g>
                      ) : null}
                    </g>
                  );
                })}

              {/* 4. Interactive Nodes with Visual Hierarchy */}
              {projection.nodes.map((node) => {
                const pos = nodePositions.get(node.id);
                if (!pos) return null;

                const isActive = node.id === activeNodeId;
                const link = explorationLinks.get(node.id);
                const isVisited =
                  (link?.observedSpotIds.length ?? 0) > 0 || (link?.spotIds.length ?? 0) > 0;
                const isMapSelected = Boolean(
                  selectedSpot &&
                    (link?.spotIds.includes(selectedSpot.id) || spotEntity?.id === node.id),
                );

                const tierMeta = getNodeVisualTier({
                  isRootOrCore: pos.isAnchor,
                  level: pos.isBridge ? 1 : 2,
                });
                const halfW = (pos.width + (tierMeta.isProminent ? 14 : 0)) / 2;
                const halfH = tierMeta.height / 2;
                const meta = getEntityKindMeta(node.kind, node);

                return (
                  <g
                    key={node.id}
                    className={styles.topologyNodeG}
                    transform={`translate(${pos.x}, ${pos.y})`}
                    onClick={() => selectNode(node.id)}
                  >
                    {/* Node Pill Background */}
                    <rect
                      x={-halfW}
                      y={-halfH}
                      width={pos.width + (tierMeta.isProminent ? 14 : 0)}
                      height={tierMeta.height}
                      rx={tierMeta.isProminent ? 8 : 6}
                      className={styles.topologyNodeRect}
                      data-active={isActive}
                      data-tier={tierMeta.tier}
                      style={{
                        borderColor: isActive ? "var(--gold)" : tierMeta.isProminent ? "var(--gold)" : meta.border,
                      }}
                    />

                    {/* Subtle Visited Status Dot */}
                    <circle
                      cx={-halfW + 8}
                      cy={0}
                      r={3}
                      className={isVisited ? styles.topologyVisitedDot : styles.topologyUnvisitedDot}
                    />

                    {/* Entity Kind Icon */}
                    <text
                      x={-halfW + 20}
                      y={1}
                      fontSize={tierMeta.fontSize}
                      dominantBaseline="middle"
                      textAnchor="middle"
                    >
                      {pos.isAnchor ? "★" : meta.icon}
                    </text>

                    {/* Node Label (Full, no truncation, scaled by tier) */}
                    <text
                      x={isMapSelected ? 6 : 10}
                      y={1}
                      className={styles.topologyNodeText}
                      fontSize={node.label.length > 7 ? tierMeta.fontSize - 1 : tierMeta.fontSize}
                      fontWeight={tierMeta.isProminent ? "700" : "600"}
                    >
                      {node.label}
                    </text>

                    {/* Map Selected Pin */}
                    {isMapSelected ? (
                      <text
                        x={halfW - 9}
                        y={1}
                        fill="var(--gold)"
                        fontSize="10"
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        ⚑
                      </text>
                    ) : null}
                  </g>
                );
              })}
            </g>
          </svg>
        </div>

        {/* 5. Split-Stage Tabbed Inspector (Symmetric with Tree & Hub Lenses) */}
        <div className={styles.lensInspectorContainer}>
          <div className={styles.lensInspectorTabs}>
            <button
              type="button"
              className={styles.lensInspectorTabBtn}
              data-active={inspectorTab === "node"}
              onClick={() => setInspectorTab("node")}
            >
              🎯 {activeNode ? activeNode.label : "ノード詳細"}
            </button>
            <button
              type="button"
              className={styles.lensInspectorTabBtn}
              data-active={inspectorTab === "context"}
              onClick={() => setInspectorTab("context")}
            >
              📖 テーマ解説
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

          <div className={styles.lensInspectorTabBody}>
            {inspectorTab === "node" && activeNode ? (() => {
              const activeNodeMeta = getEntityKindMeta(activeNode.kind, activeNode);
              return (
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
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

                  {isCandidateSelected && selectedSuggestion ? (
                    <div className={styles.lensCandidateCallout}>
                      <div className={styles.lensCandidateHeader}>
                        <span className={styles.lensCandidateBadge}>⚑ MAP探索候補と連動中</span>
                        <strong className={styles.lensCandidateTarget}>{selectedSuggestion.targetName}</strong>
                      </div>
                      <div className={styles.lensCandidateBody}>
                        <p className={styles.lensCandidateReason}>
                          <span className={styles.lensCandidateLabel}>陣営での位置づけ：</span>
                          {selectedSuggestion.reason}
                        </p>
                        {selectedSuggestion.question ? (
                          <p className={styles.lensCandidateQuestion}>
                            <span className={styles.lensCandidateLabel}>探索の問い：</span>
                            {selectedSuggestion.question}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  ) : null}

                  {/* Inter-node relationships touching active node */}
                  {selectedEdges.length > 0 ? (
                    <div style={{ marginTop: 8, marginBottom: 8 }}>
                      <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--muted)", display: "block", marginBottom: 4 }}>
                        このノードが結ぶ関係・相関（{selectedEdges.length}件）
                      </span>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        {selectedEdges.map((edge) => {
                          const otherId = edge.subjectId === activeNode.id ? edge.objectId : edge.subjectId;
                          const otherNode = nodeById.get(otherId) ?? packEntityById.get(otherId);
                          const otherMeta = otherNode ? getEntityKindMeta(otherNode.kind, otherNode) : undefined;
                          const relMeta = getRelationMeta(edge.predicate, edge.relationFamily);

                          return (
                            <div
                              key={edge.id}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                padding: "4px 8px",
                                background: "rgba(255, 255, 255, 0.04)",
                                borderRadius: 4,
                                fontSize: "11.5px",
                                cursor: "pointer",
                              }}
                              onClick={() => selectNode(otherId)}
                            >
                              <span style={{ color: relMeta.color, fontWeight: 700 }}>
                                {relMeta.icon} {relMeta.shortLabel}
                              </span>
                              <span style={{ color: "var(--muted)" }}>➜</span>
                              <span style={{ color: otherMeta?.color ?? "var(--ink)", fontWeight: 600 }}>
                                {otherNode?.label ?? otherId}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}

                  {/* Cross-Topic Portals (ADR-0022) */}
                  {(() => {
                    const portals = resolveCrossTopicPortals(
                      { id: activeNode.id, label: activeNode.label, aliases: activeNode.aliases },
                      { currentTopicId: topic.id },
                    );
                    if (portals.length === 0) return null;
                    return (
                      <div style={{ marginTop: 10, marginBottom: 12 }}>
                        <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--muted)", display: "block", marginBottom: 6 }}>
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
              );
            })() : null}

            {inspectorTab === "context" ? (
              <div>
                <strong style={{ display: "block", marginBottom: 6, color: "var(--ink)" }}>{topic.label}</strong>
                <p style={{ margin: "0 0 10px", fontSize: "12px", lineHeight: "1.6", color: "var(--muted)" }}>
                  {topic.description}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
                  <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--gold)" }}>
                    主要勢力ブロック（{factionZones.length}陣営）
                  </span>
                  {factionZones.map((z) => (
                    <div
                      key={z.id}
                      style={{
                        padding: "6px 10px",
                        background: "rgba(255, 255, 255, 0.04)",
                        borderLeft: `3px solid ${z.color}`,
                        borderRadius: "0 4px 4px 0",
                        fontSize: "11px",
                      }}
                    >
                      <strong style={{ color: z.color }}>{z.label}</strong>
                      <span style={{ marginLeft: 8, color: "var(--muted)" }}>
                        {z.memberNodeIds.length + (z.anchorNodeId ? 1 : 0)}要素
                      </span>
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
