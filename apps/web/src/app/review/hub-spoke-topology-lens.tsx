"use client";

import { useEffect, useMemo, useState } from "react";

import { buildLensExplorationLinksByIdentity } from "@/domain/lens-packs/exploration-links";
import { projectLensPreset } from "@/domain/lens-packs/projection";
import { resolveLensEntityForSpot } from "@/domain/lens-packs/preset-selection";
import { lensEntityNamesMatch } from "@/domain/lens-packs/entity-identity";
import { matchLensNodeForCandidate, matchCandidateForLensNode, matchLensNodeForSpot, resolveSpotForLensNode } from "@/domain/lenses/candidate-matching";
import { getEntityKindMeta } from "@/domain/lenses/entity-presentation";
import { calculateHubSpokeOrbitLayout } from "@/domain/lenses/layout/hub-spoke-orbit-layout";
import type { ResolvedLensTopic } from "@/domain/lenses/topic-resolver";
import type { LensKnowledgePack } from "@/domain/lens-packs/schema";
import { resolveCrossTopicPortals } from "@/domain/lens-packs/cross-topic-portals";
import type {
  ReviewAtlasSpot,
  ReviewDataset,
  ReviewExplorationSuggestion,
} from "@/domain/review/types";

import styles from "./atlas.module.css";
import { LensSourceDetails } from "./lens-source-details";
import { useLensZoomPan, LensZoomControls } from "./use-lens-zoom-pan";

type LensNode = LensKnowledgePack["entities"][number];

export function HubSpokeTopologyLens({
  lensLabel = "中心・外縁",
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



  // Topology: Radial Calculations (Headless Layout Engine)
  const {
    hubCore,
    radialPositions,
    spokeEdges,
    hasRing3,
    cx,
    cy,
    r1,
    r2,
    r3,
    canvasWidth,
    canvasHeight,
  } = useMemo(() => {
    const preset = pack.presets.find((p) => p.id === topic.presetId);
    return calculateHubSpokeOrbitLayout(projection.nodes, projection.edges, {
      candidateRootIds: preset?.rootEntityIds,
      designatedRootId: preset?.rootEntityIds?.[0],
    });
  }, [projection.nodes, projection.edges, pack.presets, topic.presetId]);

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
      const pos = radialPositions.get(matchedId);
      if (pos) {
        centerOn(pos.x, pos.y);
      }
    } else {
      setInternalSelectedNodeId("");
      setInspectorTab("context");
    }
  }, [selectedSuggestion?.id, selectedSpotId, selectedSpot, topic.id, centerOn, explorationLinks, radialPositions, projection.nodes]);

  const selectNode = (nodeId: string) => {
    if (isClickSuppressed()) return;
    setInternalSelectedNodeId(nodeId);
    setInspectorTab("node");
    const pos = radialPositions.get(nodeId);
    if (pos) {
      centerOn(pos.x, pos.y);
    }
    const node = nodeById.get(nodeId);
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
            aria-label={`${projection.title} 中心・外縁トポロジー構造図`}
          >
            <defs>
              <marker
                id="topology-active-arrow"
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
              {/* Concentric Orbit Rings */}
              <circle cx={cx} cy={cy} r={r1} className={styles.topologyOrbitRing} />
              <circle cx={cx} cy={cy} r={r2} className={styles.topologyOrbitRing} />
              {hasRing3 ? (
                <circle cx={cx} cy={cy} r={r3} className={styles.topologyOrbitRing} />
              ) : null}

              {/* Radial Spoke Connecting Lines */}
              {[...spokeEdges]
                .sort((a, b) => {
                  const aConn = a.subjectId === activeNodeId || a.objectId === activeNodeId;
                  const bConn = b.subjectId === activeNodeId || b.objectId === activeNodeId;
                  if (aConn === bConn) return 0;
                  return aConn ? 1 : -1;
                })
                .map((spoke) => {
                  const isConnected = spoke.subjectId === activeNodeId || spoke.objectId === activeNodeId;
                  const lineClass = isConnected
                    ? styles.topologySpokeLineActive
                    : activeNodeId
                      ? styles.topologySpokeLineDimmed
                      : styles.topologySpokeLine;

                  return (
                    <g key={spoke.id}>
                      <path
                        d={spoke.pathD}
                        className={lineClass}
                        markerEnd={isConnected ? "url(#topology-active-arrow)" : undefined}
                      />
                      {isConnected ? (
                        <g
                          transform={`translate(${spoke.labelPosition.x}, ${spoke.labelPosition.y})`}
                          className={styles.topologyEdgeLabelGroup}
                        >
                          <rect
                            x={-(spoke.relation.length * 5.2 + 8)}
                            y={-8.5}
                            width={spoke.relation.length * 10.4 + 16}
                            height={17}
                            rx={4}
                            className={styles.topologyEdgeBadge}
                          />
                          <text
                            x={0}
                            y={1}
                            className={styles.topologyEdgeText}
                          >
                            {spoke.relation}
                          </text>
                        </g>
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
                      {pos.isCore ? `🎯 ${node.label}` : `${getEntityKindMeta(node.kind).icon} ${node.label}`}
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
                  <span className={styles.entityKindBadge} data-kind={activeNode.kind}>
                    {getEntityKindMeta(activeNode.kind).icon} {getEntityKindMeta(activeNode.kind).label}
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
