"use client";

import { useEffect, useMemo, useState } from "react";

import { buildLensExplorationLinksByIdentity } from "@/domain/lens-packs/exploration-links";
import { projectLensPreset } from "@/domain/lens-packs/projection";
import { resolveLensEntityForSpot } from "@/domain/lens-packs/preset-selection";
import { matchLensNodeForCandidate, matchCandidateForLensNode, matchLensNodeForSpot, resolveSpotForLensNode } from "@/domain/lenses/candidate-matching";
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

type LensNode = LensKnowledgePack["entities"][number];

const kindLabels: Record<string, string> = {
  deity: "神格",
  person: "人物",
  group: "神群・集団",
  place: "祭祀地・史跡",
  concept: "系譜・概念",
  event: "出来事・契機",
  text: "史料",
};

const predicateLabels: Record<string, string> = {
  parent_of: "親 ➔ 子",
  gives_birth_to: "生成・誕生",
  child_of: "子 ➔ 親",
  descendant_of: "後裔・末裔",
  educated: "師匠 ➔ 門下生",
  influenced: "思想的影響",
  led: "主宰・指導",
  enshrined_at: "祭祀・鎮座",
  associated_with: "ゆかり・関連",
  born_at: "生誕地",
  buried_at: "墓所・奥津城",
  attested_in: "史料記載",
  participates_in: "誓約・契機",
  launched_uprising_at: "挙兵地",
  claimed_origin_of: "神統・皇統主張",
  succession: "継承",
  originated_from: "本源",
};

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



  // Tree Generational Calculations & 2D Layout
  const { nodePositions, treeConnectorEdges, canvasWidth, canvasHeight } = useMemo(() => {
    // 1. Collect all directed hierarchy edges (Parent/Origin -> Child/Target)
    const hierarchyEdges: Array<{
      id: string;
      sourceId: string;
      targetId: string;
      predicate: string;
      label: string;
    }> = [];

    const forwardPredicates = new Set([
      "parent_of",
      "gives_birth_to",
      "participates_in",
      "educated",
      "influenced",
      "led",
      "succession",
      "claimed_origin_of",
      "enshrined_at",
      "associated_with",
      "born_at",
      "buried_at",
      "launched_uprising_at",
      "attested_in",
    ]);

    const reversePredicates = new Set([
      "child_of",
      "descendant_of",
      "originated_from",
    ]);

    for (const edge of projection.edges) {
      if (forwardPredicates.has(edge.predicate) || edge.relationFamily === "genealogy") {
        hierarchyEdges.push({
          id: edge.id,
          sourceId: edge.subjectId,
          targetId: edge.objectId,
          predicate: edge.predicate,
          label: predicateLabels[edge.predicate] ?? edge.predicate,
        });
      } else if (reversePredicates.has(edge.predicate)) {
        hierarchyEdges.push({
          id: edge.id,
          sourceId: edge.objectId,
          targetId: edge.subjectId,
          predicate: edge.predicate,
          label: predicateLabels[edge.predicate] ?? edge.predicate,
        });
      }
    }

    const nodeIds = new Set(projection.nodes.map((n) => n.id));
    const validEdges = hierarchyEdges.filter(
      (e) => nodeIds.has(e.sourceId) && nodeIds.has(e.targetId) && e.sourceId !== e.targetId,
    );

    const inDegrees = new Map<string, number>();
    for (const id of nodeIds) {
      inDegrees.set(id, 0);
    }
    for (const edge of validEdges) {
      inDegrees.set(edge.targetId, (inDegrees.get(edge.targetId) ?? 0) + 1);
    }

    const nodeTier = new Map<string, number>();
    const queue: string[] = [];

    // True roots have in-degree 0 in the hierarchy
    for (const node of projection.nodes) {
      if ((inDegrees.get(node.id) ?? 0) === 0) {
        nodeTier.set(node.id, 0);
        queue.push(node.id);
      }
    }

    // Fallback if graph is cyclic or all have in-degree > 0
    if (queue.length === 0 && projection.nodes.length > 0) {
      const fallbackId = projection.nodes[0]!.id;
      nodeTier.set(fallbackId, 0);
      queue.push(fallbackId);
    }

    // Adjacency list for downward DAG traversal
    const adj = new Map<string, string[]>();
    for (const edge of validEdges) {
      if (!adj.has(edge.sourceId)) adj.set(edge.sourceId, []);
      adj.get(edge.sourceId)!.push(edge.targetId);
    }

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      const currentTier = nodeTier.get(currentId) ?? 0;

      const children = adj.get(currentId) ?? [];
      for (const childId of children) {
        const existingTier = nodeTier.get(childId);
        // Use longest path so child is below all ancestors, capped at tier 3
        const targetTier = Math.min(3, currentTier + 1);
        if (existingTier === undefined || existingTier < targetTier) {
          nodeTier.set(childId, targetTier);
          queue.push(childId);
        }
      }
    }

    // Ensure all nodes are assigned
    for (const node of projection.nodes) {
      if (!nodeTier.has(node.id)) {
        if (node.kind === "place" || node.kind === "text") {
          nodeTier.set(node.id, 3);
        } else {
          nodeTier.set(node.id, 0);
        }
      }
    }

    // Group nodes by tier level
    const tierMap = new Map<number, LensNode[]>();
    for (const node of projection.nodes) {
      const tier = Math.min(nodeTier.get(node.id) ?? 0, 3);
      if (!tierMap.has(tier)) tierMap.set(tier, []);
      tierMap.get(tier)!.push(node);
    }

    // Layout positions in SVG space
    const maxNodesInAnyTier = Math.max(
      1,
      ...Array.from(tierMap.values()).map((nodes) => nodes.length),
    );
    const canvasWidth = Math.max(760, maxNodesInAnyTier * 170 + 80);
    const canvasHeight = 420;

    const yLevels: Record<number, number> = {
      0: 60,
      1: 160,
      2: 260,
      3: 355,
    };

    const positions = new Map<string, { x: number; y: number; width: number; level: number }>();

    for (const [level, nodes] of tierMap.entries()) {
      const y = yLevels[level] ?? (60 + level * 95);
      const n = nodes.length;
      // Generous spacing so pills NEVER collide
      const spacing = Math.min(200, (canvasWidth - 100) / Math.max(n, 1));
      const startX = canvasWidth / 2 - ((n - 1) * spacing) / 2;

      nodes.forEach((node, idx) => {
        const x = startX + idx * spacing;
        const pillWidth = Math.max(92, Math.min(145, node.label.length * 14 + 28));
        positions.set(node.id, { x, y, width: pillWidth, level });
      });
    }

    // Branch connectors
    const connectors = validEdges
      .map((edge) => {
        const parentPos = positions.get(edge.sourceId);
        const childPos = positions.get(edge.targetId);
        if (!parentPos || !childPos) return null;

        return {
          id: edge.id,
          parentId: edge.sourceId,
          childId: edge.targetId,
          from: parentPos,
          to: childPos,
          label: edge.label,
        };
      })
      .filter((c): c is NonNullable<typeof c> => Boolean(c));

    return {
      nodePositions: positions,
      treeConnectorEdges: connectors,
      canvasWidth,
      canvasHeight,
    };
  }, [projection.nodes, projection.edges]);

  // Active node determination
  const activeNodeId = useMemo(() => {
    if (internalSelectedNodeId && projection.nodes.some((n) => n.id === internalSelectedNodeId)) {
      return internalSelectedNodeId;
    }
    if (matchedSuggestionNodeId && projection.nodes.some((n) => n.id === matchedSuggestionNodeId)) {
      return matchedSuggestionNodeId;
    }
    if (selectedNodeId && projection.nodes.some((n) => n.id === selectedNodeId)) {
      return selectedNodeId;
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
    onSelectNode?.(nodeId);
    const pos = nodePositions.get(nodeId);
    if (pos) {
      centerOn(pos.x, pos.y);
    }
    const node = nodeById.get(nodeId) ?? packEntityById.get(nodeId);
    const link = explorationLinks.get(nodeId);
    const linkedSpotId = resolveSpotForLensNode(node, link, spots);
    if (linkedSpotId) {
      onSelectSpot(linkedSpotId);
    } else if (onSelectSuggestion) {
      if (node && suggestions.length > 0) {
        const candidate = matchCandidateForLensNode(node, suggestions);
        if (candidate) {
          onSelectSuggestion(candidate.id);
        }
      }
    }
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

        {/* Interactive Visual SVG Genealogy Tree Diagram with Zoom & Pan */}
        <div
          ref={viewportRef}
          className={styles.lensGraphViewport}
          style={{ cursor: isPanning ? "grabbing" : "grab" }}
          {...pointerHandlers}
        >
          <LensZoomControls zoom={zoom} onZoom={handleZoom} onReset={handleResetZoom} />
          <div className={styles.lensZoomHint}>ドラッグで移動 · ホイールで拡大縮小</div>

          <svg
            className={styles.lensGraphSvg}
            viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
            role="img"
            aria-label={`${projection.title} 樹状・系譜図`}
          >
            <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`} style={{ transition: isCentering ? "transform 0.42s cubic-bezier(0.2, 0.9, 0.3, 1)" : "none" }}>
              {/* Tree Generation Level Dividers (Subtle background guides) */}
              <line x1={20} y1={110} x2={canvasWidth - 20} y2={110} stroke="rgba(255,255,255,0.05)" strokeDasharray="2 4" />
              <line x1={20} y1={210} x2={canvasWidth - 20} y2={210} stroke="rgba(255,255,255,0.05)" strokeDasharray="2 4" />
              <line x1={20} y1={310} x2={canvasWidth - 20} y2={310} stroke="rgba(255,255,255,0.05)" strokeDasharray="2 4" />

              <text x={30} y={45} fill="var(--gold)" fontSize="10" opacity="0.6" fontWeight="600">
                始祖・師匠・源流（第1層）
              </text>
              <text x={30} y={145} fill="var(--aqua)" fontSize="10" opacity="0.6" fontWeight="600">
                契機・結節点・中核（第2層）
              </text>
              <text x={30} y={245} fill="var(--muted)" fontSize="10" opacity="0.6" fontWeight="600">
                門下生・直系・継承（第3層）
              </text>
              <text x={30} y={340} fill="rgba(255,255,255,0.4)" fontSize="10" opacity="0.6" fontWeight="600">
                展開・史跡・奉斎地（第4層）
              </text>

              {/* Branch Connectors (Smooth downward bezier curves) */}
              {treeConnectorEdges.map((connector) => {
                const isConnected =
                  connector.parentId === activeNodeId || connector.childId === activeNodeId;
                const midY = (connector.from.y + connector.to.y) / 2;
                const pathD = `M ${connector.from.x} ${connector.from.y + 14} C ${connector.from.x} ${midY}, ${connector.to.x} ${midY}, ${connector.to.x} ${connector.to.y - 14}`;

                return (
                  <g key={connector.id}>
                    <path
                      d={pathD}
                      className={
                        isConnected ? styles.treeConnectorLineActive : styles.treeConnectorLine
                      }
                    />
                    {isConnected ? (
                      <text
                        x={(connector.from.x + connector.to.x) / 2}
                        y={midY - 4}
                        fill="var(--gold)"
                        fontSize="9"
                        textAnchor="middle"
                        fontWeight="600"
                      >
                        {connector.label}
                      </text>
                    ) : null}
                  </g>
                );
              })}

              {/* Interactive Tree Nodes */}
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

                const halfW = pos.width / 2;

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
                      y={-14}
                      width={pos.width}
                      height={28}
                      rx={6}
                      className={styles.topologyNodeRect}
                      data-active={isActive}
                    />

                    {/* Subtle Visited Status Dot (Space-saving: 5px dot instead of giant text!) */}
                    <circle
                      cx={-halfW + 10}
                      cy={0}
                      r={3.5}
                      className={isVisited ? styles.topologyVisitedDot : styles.topologyUnvisitedDot}
                    />

                    {/* Node Label (Full, no truncation) */}
                    <text
                      x={isMapSelected ? -4 : 4}
                      y={1}
                      className={styles.topologyNodeText}
                      fontSize={node.label.length > 7 ? "10" : "11"}
                    >
                      {node.label}
                    </text>

                    {/* Map Selected Pin */}
                    {isMapSelected ? (
                      <text
                        x={halfW - 10}
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
            {inspectorTab === "node" && activeNode ? (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                  <span className={styles.factionActiveKind}>
                    {kindLabels[activeNode.kind] ?? activeNode.kind}
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

                {isCandidateSelected ? (
                  <div className={styles.candidateFocusNotice} style={{ marginTop: "8px" }}>
                    <strong>候補地探索と一致</strong>
                    <p>選択中の未訪問候補は、この系譜の構成要素として位置付けられています。</p>
                  </div>
                ) : null}
              </div>
            ) : inspectorTab === "node" ? (
              <p style={{ color: "var(--muted)", fontSize: "12px", margin: 0 }}>
                図上のノードをクリックすると、ここに人物・神格・拠点の詳細と探索接続が表示されます。
              </p>
            ) : inspectorTab === "context" ? (
              <div>
                <strong style={{ fontSize: "13px", color: "var(--gold)", display: "block", marginBottom: "6px" }}>
                  {projection.title}
                </strong>
                <p style={{ fontSize: "12px", lineHeight: "1.6", color: "var(--ink)", margin: 0 }}>
                  {projection.description}
                </p>
              </div>
            ) : (
              <LensSourceDetails pack={pack} assertions={selectedAssertions} />
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
