"use client";

import { useEffect, useMemo, useState } from "react";

import { buildLensExplorationLinksByIdentity } from "@/domain/lens-packs/exploration-links";
import { projectLensPreset } from "@/domain/lens-packs/projection";
import { resolveLensEntityForSpot } from "@/domain/lens-packs/preset-selection";
import { lensEntityNamesMatch } from "@/domain/lens-packs/entity-identity";
import { resolveCrossTopicPortals } from "@/domain/lens-packs/cross-topic-portals";
import { matchLensNodeForCandidate, matchCandidateForLensNode, matchLensNodeForSpot, resolveSpotForLensNode } from "@/domain/lenses/candidate-matching";
import { getEntityKindMeta, getNodeVisualTier } from "@/domain/lenses/entity-presentation";
import { getRelationMeta, getTopicStructuralThesis } from "@/domain/lenses/relation-presentation";
import { calculateGenealogyDagLayout } from "@/domain/lenses/layout/genealogy-dag-layout";
import type { ResolvedLensTopic } from "@/domain/lenses/topic-resolver";
import type { LensKnowledgePack } from "@/domain/lens-packs/schema";
import type {
  ReviewAtlasSpot,
  ReviewDataset,
  ReviewExplorationSuggestion,
} from "@/domain/review/types";

import styles from "./atlas.module.css";
import { LensSourceDetails } from "./lens-source-details";
import { useLensZoomPan, LensZoomControls } from "./use-lens-zoom-pan";
import { StructuralThesisBanner } from "./structural-thesis-banner";
import { StructuralGuideContextPanel } from "./structural-guide-context-panel";

type LensNode = LensKnowledgePack["entities"][number];

export function GenealogyTreeLens({
  lensLabel = "神・系譜",
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
  const [inspectorTab, setInspectorTab] = useState<"node" | "context" | "sources">("context");



  // Tree Generational Calculations & 2D Layout (Headless Layout Engine)
  const { nodePositions, treeConnectorEdges, canvasWidth, canvasHeight, numTiers } = useMemo(() => {
    return calculateGenealogyDagLayout(projection.nodes, projection.edges);
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

  const activeNode = nodeById.get(activeNodeId) ?? projection.nodes[0];
  const activeLink = activeNode ? explorationLinks.get(activeNode.id) : undefined;
  const isCandidateSelected = Boolean(
    selectedSuggestion && matchedSuggestionNodeId && activeNodeId === matchedSuggestionNodeId,
  );

  const selectedAssertions = useMemo(() => {
    if (!activeNodeId) return projection.edges;
    const related = projection.edges.filter(
      (edge) => edge.subjectId === activeNodeId || edge.objectId === activeNodeId,
    );
    return related.length > 0 ? related : projection.edges;
  }, [activeNodeId, projection.edges]);

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

  // Lineage navigation
  const activeNodeLineage = useMemo(() => {
    if (!activeNode) return { parents: [], children: [], places: [] };

    const parents: Array<{ id: string; label: string; predicate: string }> = [];
    const children: Array<{ id: string; label: string; predicate: string }> = [];
    const places: Array<{ id: string; label: string; predicate: string }> = [];

    for (const edge of projection.edges) {
      if (edge.objectId === activeNode.id) {
        const subject = nodeById.get(edge.subjectId) ?? packEntityById.get(edge.subjectId);
        if (subject) {
          if (edge.predicate === "parent_of" || edge.predicate === "educated" || edge.predicate === "gives_birth_to" || edge.predicate === "led") {
            parents.push({ id: subject.id, label: subject.label, predicate: edge.predicate });
          } else if (subject.kind === "place") {
            places.push({ id: subject.id, label: subject.label, predicate: edge.predicate });
          }
        }
      } else if (edge.subjectId === activeNode.id) {
        const object = nodeById.get(edge.objectId) ?? packEntityById.get(edge.objectId);
        if (object) {
          if (edge.predicate === "parent_of" || edge.predicate === "educated" || edge.predicate === "gives_birth_to" || edge.predicate === "influenced") {
            children.push({ id: object.id, label: object.label, predicate: edge.predicate });
          } else if (object.kind === "place") {
            places.push({ id: object.id, label: object.label, predicate: edge.predicate });
          }
        }
      }
    }

    return { parents, children, places };
  }, [activeNode, projection.edges, nodeById, packEntityById]);

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
        {/* Sleek Compact Context Bar (Prevents Vertical Scroll Pressure) */}
        <div className={styles.lensCompactContextBar}>
          <span className={styles.topicArchetypePill}>樹状・系譜型</span>
          <strong>{projection.title}</strong>
          <small>下段タブで詳細・解説・史料を閲覧</small>
        </div>

        {/* Structural Thesis Banner: Instantly conveys the mental model at a single glance */}
        <StructuralThesisBanner topic={topic} />

        {/* Interactive Visual SVG Genealogy Tree Diagram with Zoom & Pan */}
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
            aria-label={`${projection.title} 樹状・系譜図`}
          >
            <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`} style={{ transition: isCentering ? "transform 0.42s cubic-bezier(0.2, 0.9, 0.3, 1)" : "none" }}>
              {/* Tree Generation Level Dividers (Subtle background guides) */}
              {Array.from({ length: numTiers - 1 }).map((_, i) => (
                <line
                  key={i}
                  x1={20}
                  y1={110 + i * 95}
                  x2={canvasWidth - 20}
                  y2={110 + i * 95}
                  stroke="rgba(255,255,255,0.05)"
                  strokeDasharray="2 4"
                />
              ))}

              <text x={30} y={45} fill="var(--gold)" fontSize="10" opacity="0.6" fontWeight="600">
                始祖・師匠・源流（第1層）
              </text>
              <text x={30} y={140} fill="var(--aqua)" fontSize="10" opacity="0.6" fontWeight="600">
                契機・結節点・中核（第2層）
              </text>
              <text x={30} y={235} fill="var(--muted)" fontSize="10" opacity="0.6" fontWeight="600">
                門下生・直系・継承（第3層）
              </text>
              {numTiers >= 5 ? (
                <text x={30} y={330} fill="var(--gold)" fontSize="10" opacity="0.6" fontWeight="600">
                  展開・直系後継（第4層）
                </text>
              ) : null}
              {numTiers >= 6 ? (
                <text x={30} y={425} fill="var(--aqua)" fontSize="10" opacity="0.6" fontWeight="600">
                  第5世代（第5層）
                </text>
              ) : null}
              <text x={30} y={canvasHeight - 65} fill="rgba(255,255,255,0.4)" fontSize="10" opacity="0.6" fontWeight="600">
                展開・史跡・奉斎地（最終層）
              </text>

              {/* Branch Connectors (Smooth downward bezier curves with semantic color and persistent key badges) */}
              {treeConnectorEdges.map((connector) => {
                const relMeta = getRelationMeta(connector.predicate);
                const isConnected =
                  connector.parentId === activeNodeId || connector.childId === activeNodeId;
                const isBackbone = connector.isBackbone;
                const midY = (connector.from.y + connector.to.y) / 2;
                const pathD = `M ${connector.from.x} ${connector.from.y + 14} C ${connector.from.x} ${midY}, ${connector.to.x} ${midY}, ${connector.to.x} ${connector.to.y - 14}`;

                const strokeColor = isConnected ? "var(--gold)" : relMeta.color;
                const lineClass = isConnected
                  ? styles.treeConnectorLineActive
                  : isBackbone
                    ? styles.treeConnectorLinePersistent
                    : styles.treeConnectorLineSecondary;

                const showBadge = isConnected || isBackbone;

                return (
                  <g key={connector.id}>
                    <path
                      d={pathD}
                      className={lineClass}
                      style={{
                        stroke: strokeColor,
                        strokeDasharray: "none",
                      }}
                    />
                    {showBadge ? (
                      <g
                        transform={`translate(${(connector.from.x + connector.to.x) / 2}, ${midY})`}
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
                          {isConnected ? connector.label : relMeta.shortLabel}
                        </text>
                      </g>
                    ) : null}
                  </g>
                );
              })}

              {/* Interactive Tree Nodes with Visual Hierarchy (Tiered Nodes) */}
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
                  level: pos.level,
                  isRootOrCore: pos.level === 0,
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
                      {meta.icon}
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

        {/* Split-Stage Tabbed Inspector (Solves Issue A: View Fragmentation) */}
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

                {/* Direct Lineage Relationships */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", margin: "8px 0" }}>
                  {activeNodeLineage.parents.length > 0 ? (
                    <div style={{ fontSize: "11px" }}>
                      <span style={{ color: "var(--gold)", fontWeight: 600 }}>⬆️ 親・師匠：</span>
                      {activeNodeLineage.parents.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => selectNode(p.id)}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "var(--aqua)",
                            cursor: "pointer",
                            textDecoration: "underline",
                            margin: "0 4px",
                            fontSize: "11px",
                          }}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  ) : null}

                  {activeNodeLineage.children.length > 0 ? (
                    <div style={{ fontSize: "11px" }}>
                      <span style={{ color: "var(--aqua)", fontWeight: 600 }}>⬇️ 子・門下生：</span>
                      {activeNodeLineage.children.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => selectNode(c.id)}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "var(--aqua)",
                            cursor: "pointer",
                            textDecoration: "underline",
                            margin: "0 4px",
                            fontSize: "11px",
                          }}
                        >
                          {c.label}
                        </button>
                      ))}
                    </div>
                  ) : null}

                  {activeNodeLineage.places.length > 0 ? (
                    <div style={{ fontSize: "11px" }}>
                      <span style={{ color: "var(--muted)", fontWeight: 600 }}>🏛️ 奉斎・史跡：</span>
                      {activeNodeLineage.places.map((pl) => (
                        <span key={pl.id} style={{ margin: "0 4px", color: "var(--foreground)" }}>
                          {pl.label}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>

                {/* Spot Connection Callout */}
                {activeLink && activeLink.spotIds.length > 0 ? (
                  <div className={styles.factionSpotBox} style={{ marginTop: "8px" }}>
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
                            <span>📍 {spot.name}</span>
                            <small>{spot.region}</small>
                          </button>
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
                            <span style={{
                              padding: "1px 5px",
                              borderRadius: "3px",
                              fontSize: "0.65rem",
                              fontWeight: 600,
                              backgroundColor: "rgba(215, 166, 255, 0.2)",
                              color: "#d7a6ff",
                            }}>
                              {p.lensLabel}
                            </span>
                            <strong style={{ fontSize: "0.8rem", color: "var(--ink)", fontWeight: 600 }}>{p.topicLabel}</strong>
                            <span style={{ fontSize: "0.75rem", color: "var(--gold)" }}>→</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {isCandidateSelected ? (
                  <div className={styles.candidateFocusNotice} style={{ marginTop: "8px" }}>
                    <strong>候補地探索と一致</strong>
                    <p>選択中の未訪問候補は、この系譜の構成要素として位置付けられています。</p>
                  </div>
                ) : null}
              </div>
              );
            })() : inspectorTab === "node" ? (
              <p style={{ color: "var(--muted)", fontSize: "12px", margin: 0 }}>
                図上のノードをクリックすると、ここに人物・神格・拠点の詳細と探索接続が表示されます。
              </p>
            ) : inspectorTab === "context" ? (
              <StructuralGuideContextPanel
                topic={topic}
                projectionTitle={projection.title}
              />
            ) : (
              <LensSourceDetails pack={pack} assertions={selectedAssertions} />
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
