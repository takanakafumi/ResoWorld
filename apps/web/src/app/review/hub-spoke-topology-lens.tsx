"use client";

import { useEffect, useMemo, useState } from "react";

import { buildLensExplorationLinksByIdentity } from "@/domain/lens-packs/exploration-links";
import { projectLensPreset } from "@/domain/lens-packs/projection";
import { resolveLensEntityForSpot } from "@/domain/lens-packs/preset-selection";
import { matchLensNodeForCandidate } from "@/domain/lenses/candidate-matching";
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
  group: "祭祀集団・氏族",
  polity: "中枢・統治府",
  place: "聖域・拠点・城郭",
  concept: "制度・格付・地層",
  event: "国家祭祀・事変",
  text: "式内台帳・典拠",
};

const relationLabels: Record<string, string> = {
  enshrined_at: "勧請・鎮座",
  associated_with: "管轄・外郭網",
  located_in: "所属・国内配置",
  patronized: "国家奉斎・保護",
  defended: "外郭防衛・遮断",
  interconnected_with: "連絡・回廊網",
  classified_as: "式内名神・社格",
  originated_from: "本源・分祀元",
};

export function HubSpokeTopologyLens({
  lensLabel = "中心・外縁",
  topic,
  claims,
  spots,
  selectedSpotId,
  selectedNodeId = "",
  selectedSuggestion,
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

  useEffect(() => {
    setInternalSelectedNodeId("");
    setInspectorTab("context");
  }, [selectedSuggestion?.id, selectedSpotId, topic.id]);

  // Topology: Radial Calculations
  const { hubCore, radialPositions, spokeEdges } = useMemo(() => {
    const preset = pack.presets.find((p) => p.id === topic.presetId);
    const designatedRootId = preset?.rootEntityIds?.[0];

    const degreeMap = new Map<string, number>();
    for (const node of projection.nodes) {
      degreeMap.set(node.id, 0);
    }
    for (const edge of projection.edges) {
      degreeMap.set(edge.subjectId, (degreeMap.get(edge.subjectId) ?? 0) + 1);
      degreeMap.set(edge.objectId, (degreeMap.get(edge.objectId) ?? 0) + 1);
    }

    let coreNode: LensNode | undefined;
    if (designatedRootId) {
      coreNode = nodeById.get(designatedRootId) ?? packEntityById.get(designatedRootId);
    }

    if (!coreNode) {
      let maxDeg = -1;
      for (const [id, deg] of degreeMap.entries()) {
        if (deg > maxDeg) {
          maxDeg = deg;
          coreNode = nodeById.get(id);
        }
      }
    }

    if (!coreNode && projection.nodes.length > 0) {
      coreNode = projection.nodes[0];
    }

    const coreId = coreNode?.id ?? "";

    // Calculate hop distances from core
    const hopMap = new Map<string, number>();
    hopMap.set(coreId, 0);

    const queue = [coreId];
    while (queue.length > 0) {
      const currentId = queue.shift()!;
      const currentHop = hopMap.get(currentId) ?? 0;

      for (const edge of projection.edges) {
        let neighborId: string | null = null;
        if (edge.subjectId === currentId) neighborId = edge.objectId;
        else if (edge.objectId === currentId) neighborId = edge.subjectId;

        if (neighborId && projection.nodes.some((n) => n.id === neighborId)) {
          if (!hopMap.has(neighborId)) {
            hopMap.set(neighborId, currentHop + 1);
            queue.push(neighborId);
          }
        }
      }
    }

    // Partition remaining nodes into Rings
    const ring1Nodes: LensNode[] = [];
    const ring2Nodes: LensNode[] = [];

    for (const node of projection.nodes) {
      if (node.id === coreId) continue;
      const hop = hopMap.get(node.id) ?? 99;
      if (hop === 1) {
        ring1Nodes.push(node);
      } else {
        ring2Nodes.push(node);
      }
    }

    // Layout coordinates in SVG space (viewBox: 0 0 640 400, Center: 320, 200)
    const cx = 320;
    const cy = 200;
    const r1 = 110;
    const r2 = 175;

    const positions = new Map<
      string,
      { x: number; y: number; isCore: boolean; ring: number; width: number }
    >();

    if (coreNode) {
      const coreWidth = Math.max(120, coreNode.label.length * 14 + 36);
      positions.set(coreNode.id, { x: cx, y: cy, isCore: true, ring: 0, width: coreWidth });
    }

    // Distribute Orbit 1
    const n1 = ring1Nodes.length;
    ring1Nodes.forEach((node, i) => {
      const angle = (2 * Math.PI * i) / Math.max(n1, 1) - Math.PI / 2;
      const x = cx + r1 * Math.cos(angle);
      const y = cy + r1 * Math.sin(angle);
      const pillWidth = Math.max(90, Math.min(130, node.label.length * 14 + 24));
      positions.set(node.id, { x, y, isCore: false, ring: 1, width: pillWidth });
    });

    // Distribute Orbit 2
    const n2 = ring2Nodes.length;
    ring2Nodes.forEach((node, i) => {
      // Offset by half an interval for visual aesthetics
      const offset = n2 > 0 ? Math.PI / n2 : 0;
      const angle = (2 * Math.PI * i) / Math.max(n2, 1) - Math.PI / 2 + offset;
      const x = cx + r2 * Math.cos(angle);
      const y = cy + r2 * Math.sin(angle);
      const pillWidth = Math.max(90, Math.min(130, node.label.length * 14 + 24));
      positions.set(node.id, { x, y, isCore: false, ring: 2, width: pillWidth });
    });

    // Spokes radiating from core or between connected nodes
    const spokeList = projection.edges
      .map((edge) => {
        const fromPos = positions.get(edge.subjectId);
        const toPos = positions.get(edge.objectId);
        if (!fromPos || !toPos) return null;

        const relLabel = relationLabels[edge.predicate] ?? edge.predicate;
        return {
          id: edge.id,
          subjectId: edge.subjectId,
          objectId: edge.objectId,
          from: fromPos,
          to: toPos,
          relation: relLabel,
        };
      })
      .filter((s): s is NonNullable<typeof s> => Boolean(s));

    return {
      hubCore: coreNode,
      radialPositions: positions,
      spokeEdges: spokeList,
    };
  }, [projection.nodes, projection.edges, pack.presets, topic.presetId, nodeById, packEntityById]);

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
    return hubCore?.id ?? projection.nodes[0]?.id ?? "";
  }, [internalSelectedNodeId, matchedSuggestionNodeId, selectedNodeId, spotEntity, hubCore, projection.nodes]);

  const activeNode = nodeById.get(activeNodeId) ?? hubCore ?? projection.nodes[0];
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
    viewportRef,
    pointerHandlers,
    handleZoom,
    handleResetZoom,
    isClickSuppressed,
  } = useLensZoomPan();

  const selectNode = (nodeId: string) => {
    if (isClickSuppressed()) return;
    setInternalSelectedNodeId(nodeId);
    setInspectorTab("node");
    onSelectNode?.(nodeId);
    const link = explorationLinks.get(nodeId);
    const linkedSpotId = link?.observedSpotIds[0] ?? link?.spotIds[0];
    if (linkedSpotId) {
      onSelectSpot(linkedSpotId);
    } else if (onSelectSuggestion) {
      onSelectSuggestion(nodeId);
    }
  };

  const activePos = activeNode ? radialPositions.get(activeNode.id) : undefined;

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
          <span className={styles.topicArchetypePill}>中心・外縁型</span>
          <strong>{projection.title}</strong>
          <small>下段タブで詳細・解説・史料を閲覧</small>
        </div>

        {/* Visual Radial Topology SVG Diagram with Zoom & Pan */}
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
            viewBox="0 0 640 400"
            role="img"
            aria-label={`${projection.title} 中心・外縁トポロジー構造図`}
          >
            <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
              {/* Concentric Orbit Rings */}
              <circle cx={320} cy={200} r={110} className={styles.topologyOrbitRing} />
              <circle cx={320} cy={200} r={175} className={styles.topologyOrbitRing} />

              {/* Radial Spoke Connecting Lines */}
              {spokeEdges.map((spoke) => {
                const isConnected = spoke.subjectId === activeNodeId || spoke.objectId === activeNodeId;

                return (
                  <g key={spoke.id}>
                    <line
                      x1={spoke.from.x}
                      y1={spoke.from.y}
                      x2={spoke.to.x}
                      y2={spoke.to.y}
                      className={
                        isConnected ? styles.topologySpokeLineActive : styles.topologySpokeLine
                      }
                    />
                    {isConnected ? (
                      <text
                        x={(spoke.from.x + spoke.to.x) / 2}
                        y={(spoke.from.y + spoke.to.y) / 2 - 4}
                        fill="var(--gold)"
                        fontSize="9"
                        textAnchor="middle"
                        fontWeight="600"
                      >
                        {spoke.relation}
                      </text>
                    ) : null}
                  </g>
                );
              })}

              {/* Interactive Topology Nodes */}
              {projection.nodes.map((node) => {
                const pos = radialPositions.get(node.id);
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
                      rx={pos.isCore ? 8 : 6}
                      className={styles.topologyNodeRect}
                      data-active={isActive}
                      data-core={pos.isCore}
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
                      x={pos.isCore ? 2 : (isMapSelected ? -4 : 4)}
                      y={1}
                      className={styles.topologyNodeText}
                      fontSize={node.label.length > 7 ? "10" : "11"}
                    >
                      {pos.isCore ? `🎯 ${node.label}` : node.label}
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
                  {activePos?.isCore ? (
                    <span
                      style={{
                        fontSize: "11px",
                        color: "var(--gold)",
                        fontWeight: 700,
                        marginLeft: "auto",
                      }}
                    >
                      🎯 中心拠点
                    </span>
                  ) : activePos?.ring ? (
                    <span
                      style={{
                        fontSize: "10px",
                        color: "var(--aqua)",
                        fontWeight: 600,
                        marginLeft: "auto",
                      }}
                    >
                      {activePos.ring === 1 ? "内環（直結拠点）" : "外環（広域ネットワーク）"}
                    </span>
                  ) : null}
                </div>

                {activeNode.description ? (
                  <p style={{ margin: "4px 0 8px", fontSize: "12px", lineHeight: "1.5", color: "var(--ink)" }}>
                    {activeNode.description}
                  </p>
                ) : null}

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
                    <p>選択中の未訪問候補は、この中心・外縁トポロジーの構成拠点です。</p>
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
