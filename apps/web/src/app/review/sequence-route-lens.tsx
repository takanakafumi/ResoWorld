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
import { calculateSequenceCorridorLayout } from "@/domain/lenses/layout/sequence-corridor-layout";
import type { ResolvedLensTopic } from "@/domain/lenses/topic-resolver";
import type {
  ReviewAtlasConnection,
  ReviewAtlasSpot,
  ReviewDataset,
  ReviewExplorationSuggestion,
} from "@/domain/review/types";

import styles from "./atlas.module.css";
import { LensSourceDetails } from "./lens-source-details";
import { useLensZoomPan, LensZoomControls } from "./use-lens-zoom-pan";

export function SequenceRouteLens({
  lensLabel = "ルート",
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
  connection,
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
  connection?: ReviewAtlasConnection;
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
  const [inspectorTab, setInspectorTab] = useState<"node" | "overview" | "sources">("overview");

  // Primary mapConnection
  const primaryConnection = useMemo(() => {
    const preset = pack.presets.find((p) => p.id === topic.presetId);
    return preset?.mapConnections?.[0];
  }, [pack, topic.presetId]);

  const explorationQuestions = primaryConnection?.explorationQuestions ?? {};

  // Ordered waypoints along route
  const waypoints = useMemo(() => {
    if (primaryConnection && primaryConnection.placeEntityIds.length > 0) {
      return primaryConnection.placeEntityIds.map((id) => {
        const node = nodeById.get(id) ?? packEntityById.get(id);
        const q = explorationQuestions[id];
        return {
          id,
          label: node?.label ?? id,
          description: node?.description ?? "",
          question: q?.question,
          reason: q?.reason,
          kind: node?.kind ?? "place",
        };
      });
    }
    const placeNodes = projection.nodes.filter((n) => n.kind === "place");
    return placeNodes.map((node) => {
      const q = explorationQuestions[node.id];
      return {
        id: node.id,
        label: node.label,
        description: node.description ?? "",
        question: q?.question,
        reason: q?.reason,
        kind: node.kind,
      };
    });
  }, [primaryConnection, explorationQuestions, nodeById, packEntityById, projection.nodes]);

  const waypointIdSet = useMemo(() => new Set(waypoints.map((w) => w.id)), [waypoints]);

  // Non-waypoint context nodes (people, deities, concepts branching off waypoints)
  const contextNodes = useMemo(() => {
    return projection.nodes
      .filter((n) => !waypointIdSet.has(n.id))
      .map((n) => ({
        id: n.id,
        label: n.label,
        kind: n.kind,
        description: n.description,
      }));
  }, [projection.nodes, waypointIdSet]);

  const layoutEdges = useMemo(() => {
    return projection.edges.map((e) => ({
      id: e.id,
      subjectId: e.subjectId,
      objectId: e.objectId,
      predicate: e.predicate,
      relationFamily: e.relationFamily,
    }));
  }, [projection.edges]);

  // Headless Sequence Corridor Layout Engine
  const { nodePositions, stepEdges, branchEdges, canvasWidth, canvasHeight } = useMemo(() => {
    return calculateSequenceCorridorLayout(waypoints, contextNodes, layoutEdges);
  }, [waypoints, contextNodes, layoutEdges]);

  // Active node determination
  const activeNodeId = useMemo(() => {
    if (internalSelectedNodeId && (waypointIdSet.has(internalSelectedNodeId) || projection.nodes.some((n) => n.id === internalSelectedNodeId))) {
      return internalSelectedNodeId;
    }
    if (matchedSuggestionNodeId && (waypointIdSet.has(matchedSuggestionNodeId) || projection.nodes.some((n) => n.id === matchedSuggestionNodeId))) {
      return matchedSuggestionNodeId;
    }
    if (selectedNodeId) {
      const direct = waypoints.find((w) => w.id === selectedNodeId) ?? projection.nodes.find((n) => n.id === selectedNodeId);
      if (direct) return direct.id;
      const byName =
        waypoints.find((w) => {
          const entity = packEntityById.get(w.id);
          const aliases = entity?.aliases ?? [];
          return [w.label, ...aliases].some((name) => lensEntityNamesMatch(name, selectedNodeId));
        }) ??
        projection.nodes.find((n) =>
          [n.label, ...n.aliases].some((name) => lensEntityNamesMatch(name, selectedNodeId)),
        );
      if (byName) return byName.id;
    }
    if (spotEntity && (waypointIdSet.has(spotEntity.id) || projection.nodes.some((n) => n.id === spotEntity.id))) {
      return spotEntity.id;
    }
    return waypoints[0]?.id ?? projection.nodes[0]?.id ?? "";
  }, [internalSelectedNodeId, matchedSuggestionNodeId, selectedNodeId, spotEntity, waypointIdSet, waypoints, projection.nodes, packEntityById]);

  const activeWaypoint = waypoints.find((w) => w.id === activeNodeId);
  const activeNode = nodeById.get(activeNodeId) ?? packEntityById.get(activeNodeId);
  const activeNodeMeta = activeNode ? getEntityKindMeta(activeNode.kind, activeNode) : undefined;

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
      const matched = matchLensNodeForCandidate(projection.nodes, selectedSuggestion);
      if (matched) matchedId = matched.id;
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

  const connectedContextEntities = useMemo(() => {
    const neighborIds = selectedEdges.map((e) =>
      e.subjectId === activeNodeId ? e.objectId : e.subjectId,
    );
    return projection.nodes.filter(
      (n) => neighborIds.includes(n.id) && (n.kind === "person" || n.kind === "deity"),
    );
  }, [selectedEdges, activeNodeId, projection.nodes]);

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
    <aside className={styles.genealogyPanel} aria-label={`${topic.label}の回廊・行程レンズ`}>
      <div className={styles.panelHeader}>
        <div>
          <span className={styles.panelIndex}>LENS ({topic.archetypeLabel})</span>
          <h2>{lensLabel}</h2>
        </div>
        <span>PACK {pack.version} / SEQUENCE</span>
      </div>

      <div className={`${styles.genealogyBody} ${styles.routeLensBody}`}>
        {connection ? (
          <section className={styles.lensSelectedConnection} aria-label="選択中の探索接続">
            <span>この探索で選択中の接続</span>
            <strong>{connection.title}</strong>
            <p>{connection.summary}</p>
            <small>
              {connection.spotIds.length}地点 · {connection.claimIds.length}件の根拠
            </small>
          </section>
        ) : null}

        {/* Sleek Compact Context Bar */}
        <div className={styles.lensCompactContextBar}>
          <span className={styles.topicArchetypePill}>シーケンス・回廊型</span>
          <strong>{topic.label}</strong>
          <small>{waypoints.length}地点の行程</small>
        </div>

        {/* Structural Thesis Banner */}
        <div className={styles.lensStructuralThesisBanner}>
          <span className={styles.lensStructuralThesisIcon}>💡</span>
          <span className={styles.lensStructuralThesisText}>
            {getTopicStructuralThesis(topic)}
          </span>
        </div>

        {/* Interactive Visual SVG Sequence Corridor Diagram with Zoom & Pan */}
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
            aria-label={`${projection.title} 行程・回廊フロー構造図`}
          >
            <defs>
              <marker
                id="sequence-flow-arrow"
                viewBox="0 0 10 10"
                refX="6"
                refY="5"
                markerWidth="5"
                markerHeight="5"
                orient="auto-start-reverse"
              >
                <path d="M 0 2 L 7 5 L 0 8 z" fill="var(--aqua)" />
              </marker>
              <marker
                id="sequence-active-arrow"
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
              {/* 1. Branch Edges (Waypoints to Context Figures) */}
              {branchEdges.map((branch) => {
                const isBranchActive =
                  branch.waypointId === activeNodeId || branch.contextNodeId === activeNodeId;
                return (
                  <path
                    key={branch.id}
                    d={branch.pathD}
                    className={styles.sequenceBranchPath}
                    style={{
                      stroke: isBranchActive ? "var(--gold)" : "rgba(255, 255, 255, 0.3)",
                      strokeWidth: isBranchActive ? 2 : 1.2,
                    }}
                  />
                );
              })}

              {/* 2. Sequential Step Flow Edges */}
              {stepEdges.map((edge) => {
                const isAdjacentToActive =
                  edge.fromId === activeNodeId || edge.toId === activeNodeId;
                return (
                  <g key={edge.id} className={styles.lensEdgeGroup}>
                    <path
                      d={edge.pathD}
                      className={
                        isAdjacentToActive
                          ? styles.sequenceFlowPathActive
                          : styles.sequenceFlowPath
                      }
                      markerEnd={
                        isAdjacentToActive
                          ? "url(#sequence-active-arrow)"
                          : "url(#sequence-flow-arrow)"
                      }
                    />
                    {/* Step number badge */}
                    <g transform={`translate(${edge.labelPosition.x}, ${edge.labelPosition.y})`}>
                      <circle r="9" className={styles.sequenceStepBadge} />
                      <text className={styles.sequenceStepText}>
                        {String(edge.stepNumber).padStart(2, "0")}
                      </text>
                    </g>
                  </g>
                );
              })}

              {/* 3. Milestone Nodes & Context Nodes */}
              {Array.from(nodePositions.entries()).map(([id, pos]) => {
                const isWaypoint = pos.isWaypoint;
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
                    {/* Active / Candidate Halo */}
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
                        fill: isWaypoint
                          ? isActive
                            ? "rgba(212, 175, 55, 0.22)"
                            : "rgba(10, 30, 35, 0.92)"
                          : isActive
                          ? "rgba(212, 175, 55, 0.22)"
                          : "rgba(20, 20, 35, 0.88)",
                        stroke: isActive
                          ? "var(--gold)"
                          : isCandidateActive
                          ? "#d7a6ff"
                          : isWaypoint
                          ? "var(--aqua)"
                          : "rgba(255, 255, 255, 0.3)",
                        strokeWidth: isActive || isCandidateActive ? 2 : 1.2,
                        strokeDasharray: !isWaypoint ? "4 3" : undefined,
                      }}
                    />

                    {/* Origin / Destination Tag */}
                    {pos.isOrigin ? (
                      <g transform={`translate(${pos.x}, ${topY - 8})`}>
                        <rect x="-24" y="-7" width="48" height="14" rx="7" fill="var(--aqua)" />
                        <text
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill="#000"
                          fontSize="8"
                          fontWeight="800"
                        >
                          起点 START
                        </text>
                      </g>
                    ) : pos.isDestination ? (
                      <g transform={`translate(${pos.x}, ${topY - 8})`}>
                        <rect x="-24" y="-7" width="48" height="14" rx="7" fill="var(--gold)" />
                        <text
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill="#000"
                          fontSize="8"
                          fontWeight="800"
                        >
                          終点 GOAL
                        </text>
                      </g>
                    ) : pos.isWaypoint && pos.stepIndex ? (
                      <g transform={`translate(${leftX + 10}, ${pos.y})`}>
                        <circle
                          r="7"
                          fill="rgba(0, 220, 200, 0.2)"
                          stroke="var(--aqua)"
                          strokeWidth="1"
                        />
                        <text
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill="var(--aqua)"
                          fontSize="7.5"
                          fontWeight="700"
                        >
                          {pos.stepIndex}
                        </text>
                      </g>
                    ) : null}

                    {/* Icon + Label */}
                    <text
                      x={pos.isWaypoint && !pos.isOrigin && !pos.isDestination ? pos.x + 4 : pos.x}
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

                    {/* Visited / Spot indicator on right */}
                    {isWaypoint && hasSpots ? (
                      <circle
                        cx={leftX + nodeWidth - 9}
                        cy={pos.y}
                        r="3.5"
                        fill={isVisited ? "var(--aqua)" : "rgba(255, 255, 255, 0.3)"}
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
              🎯 地点・要素詳細
            </button>
            <button
              type="button"
              className={styles.lensInspectorTabBtn}
              data-active={inspectorTab === "overview"}
              onClick={() => setInspectorTab("overview")}
            >
              📖 全体行程 ({waypoints.length})
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
                  {activeWaypoint ? (
                    <span style={{ fontSize: "11px", color: "var(--aqua)", marginLeft: "auto", fontWeight: 600 }}>
                      Step {waypoints.findIndex((w) => w.id === activeWaypoint.id) + 1} / {waypoints.length}
                    </span>
                  ) : null}
                </div>

                {activeNode.description ? (
                  <p style={{ margin: "4px 0 8px", fontSize: "12px", lineHeight: "1.5", color: "var(--ink)" }}>
                    {activeNode.description}
                  </p>
                ) : null}

                {/* Exploration question for this waypoint */}
                {activeWaypoint?.question ? (
                  <div className={styles.routeQuestionCallout} style={{ margin: "8px 0" }}>
                    <strong>探索の問い:</strong> {activeWaypoint.question}
                    {activeWaypoint.reason ? <small>（{activeWaypoint.reason}）</small> : null}
                  </div>
                ) : null}

                {/* Connected Kami / Figures */}
                {connectedContextEntities.length > 0 ? (
                  <div style={{ fontSize: "11px", margin: "6px 0" }}>
                    <span style={{ color: "var(--aqua)", fontWeight: 600 }}>関連神格・人物：</span>
                    {connectedContextEntities.map((entity) => (
                      <button
                        key={entity.id}
                        type="button"
                        onClick={() => selectNode(entity.id)}
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
                        {entity.label}
                      </button>
                    ))}
                  </div>
                ) : null}

                {/* Spot Connection */}
                {(() => {
                  const link = explorationLinks.get(activeNodeId);
                  if (!link || link.spotIds.length === 0) return null;
                  return (
                    <div className={styles.factionSpotBox}>
                      <span className={styles.factionSpotTitle}>探索スポットとの接続</span>
                      <div className={styles.factionSpotList}>
                        {link.spotIds.map((sId) => {
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
                  );
                })()}

                {/* Candidate exploration indicator */}
                {isCandidateSelected && selectedSuggestion ? (
                  <div className={styles.candidateFocusNotice}>
                    <strong>候補地探索と一致: {selectedSuggestion.title}</strong>
                    <p>{selectedSuggestion.reason}</p>
                  </div>
                ) : null}

                {/* Cross-Topic Portals (ADR-0022) */}
                {(() => {
                  const entity = packEntityById.get(activeNodeId);
                  const portals = resolveCrossTopicPortals(
                    {
                      id: activeNodeId,
                      label: activeNode.label,
                      aliases: entity?.aliases ?? activeNode.aliases ?? [],
                    },
                    { currentTopicId: topic.id },
                  );
                  if (portals.length === 0) return null;
                  return (
                    <div style={{ marginTop: 10, marginBottom: 12 }}>
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
                            onClick={() => onSelectPortal?.(p.lensId, p.topicId, activeNodeId)}
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

            {inspectorTab === "overview" ? (
              <div className={styles.routeSequence}>
                <div className={styles.routeSectionTitle}>
                  <span>01</span>
                  <strong>{primaryConnection?.label ?? "行程・回廊の順序"}</strong>
                  <small>全{waypoints.length}地点</small>
                </div>
                <ol>
                  {waypoints.map((wp, index) => {
                    const link = explorationLinks.get(wp.id);
                    const isVisited =
                      (link?.observedSpotIds.length ?? 0) > 0 || (link?.spotIds.length ?? 0) > 0;
                    const isCandidateActive = matchedSuggestionNodeId === wp.id;
                    const isActive = activeNodeId === wp.id;

                    return (
                      <li key={wp.id}>
                        <button
                          type="button"
                          data-waypoint-id={wp.id}
                          data-active={isActive}
                          data-candidate-active={isCandidateActive}
                          onClick={() => {
                            selectNode(wp.id);
                          }}
                        >
                          <span>{String(index + 1).padStart(2, "0")}</span>
                          <strong style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span
                              style={{
                                display: "inline-block",
                                width: 6,
                                height: 6,
                                borderRadius: "50%",
                                background: isVisited ? "var(--aqua)" : "rgba(255,255,255,0.25)",
                              }}
                            />
                            {wp.label}
                          </strong>
                          {isCandidateActive ? (
                            <span
                              style={{
                                color: "#d7a6ff",
                                fontSize: "0.75rem",
                                marginLeft: "auto",
                                fontWeight: 600,
                              }}
                            >
                              ⚑ MAP選択中
                            </span>
                          ) : (
                            <small style={{ marginLeft: "auto" }}>
                              {isVisited ? "訪問済" : "未訪問"}
                            </small>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ol>
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
