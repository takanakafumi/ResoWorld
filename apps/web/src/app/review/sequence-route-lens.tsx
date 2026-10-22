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
import { getEntityKindMeta } from "@/domain/lenses/entity-presentation";
import {
  getTopicStructuralThesis,
  getRouteTransitSegment,
} from "@/domain/lenses/relation-presentation";
import type { ResolvedLensTopic } from "@/domain/lenses/topic-resolver";
import type {
  ReviewAtlasConnection,
  ReviewAtlasSpot,
  ReviewDataset,
  ReviewExplorationSuggestion,
} from "@/domain/review/types";

import styles from "./atlas.module.css";
import { LensSourceDetails } from "./lens-source-details";

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
  const [selectedHypothesisId, setSelectedHypothesisId] = useState("");

  // 1. Resolve Primary Connection, Multi-Stage Connections & Hypothesis Forks
  const { primaryConnection, stages, hypothesisConnections } = useMemo(() => {
    const preset = pack.presets.find((p) => p.id === topic.presetId);
    const allConns = preset?.mapConnections ?? [];

    // Distinct linear routes vs hypothesis branches
    const lineConns = allConns.filter(
      (c) => c.displayMode !== "points" && !c.id.includes("hypothesis"),
    );
    const hypConns = allConns.filter(
      (c) => c.id.includes("hypothesis") || c.displayMode === "points",
    );

    let primary = allConns.find((c) => c.id === connection?.id);
    if (!primary) {
      primary =
        allConns.find((c) => c.id === "wajinden-source-route") ??
        lineConns[0] ??
        allConns[0];
    }

    return {
      primaryConnection: primary,
      stages: lineConns.length > 1 ? lineConns : (primary ? [primary] : []),
      hypothesisConnections: hypConns,
    };
  }, [pack.presets, topic.presetId, connection]);

  // 2. Ordered Waypoints along the Route Spine
  const waypoints = useMemo(() => {
    if (!primaryConnection) {
      const placeNodes = projection.nodes.filter((n) => n.kind === "place");
      return placeNodes.map((node) => ({
        id: node.id,
        label: node.label,
        polityLabel: undefined,
        description: node.description ?? "",
        question: undefined,
        reason: undefined,
        kind: node.kind,
      }));
    }

    // Collect all placeEntityIds across stages if multi-stage (e.g. Jinmu Conquest: 日下 -> 熊野 -> 橿原)
    const placeIds: string[] = [];
    const questions: Record<string, { question: string; reason?: string }> = {};

    stages.forEach((stage) => {
      stage.placeEntityIds.forEach((id) => {
        if (!placeIds.includes(id)) {
          placeIds.push(id);
        }
      });
      if (stage.explorationQuestions) {
        Object.assign(questions, stage.explorationQuestions);
      }
    });

    return placeIds.map((id) => {
      const node = nodeById.get(id) ?? packEntityById.get(id);
      const q = questions[id];
      const focusEntityId = primaryConnection.pointFocusEntityIds?.[id];
      const focusEntity = focusEntityId
        ? nodeById.get(focusEntityId) ?? packEntityById.get(focusEntityId)
        : undefined;

      let displayLabel = node?.label ?? id;
      let polityLabel: string | undefined = undefined;

      // If focusEntity exists and has a distinct polity label (e.g. "伊都国" for "糸島周辺"), bind prominently!
      if (focusEntity && focusEntity.label !== node?.label) {
        displayLabel = `${focusEntity.label}（${node?.label ?? id}）`;
        polityLabel = focusEntity.label;
      }

      return {
        id,
        focusEntityId,
        label: displayLabel,
        shortLabel: focusEntity?.label ?? node?.label ?? id,
        polityLabel,
        description: node?.description ?? focusEntity?.description ?? "",
        question: q?.question,
        reason: q?.reason,
        kind: focusEntity?.kind ?? node?.kind ?? "place",
      };
    });
  }, [primaryConnection, stages, nodeById, packEntityById, projection.nodes]);

  const waypointIdSet = useMemo(() => new Set(waypoints.map((w) => w.id)), [waypoints]);

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
    } else {
      setInternalSelectedNodeId("");
    }
  }, [selectedSuggestion?.id, selectedSpotId, selectedSpot, topic.id, explorationLinks, projection.nodes]);

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
    setInternalSelectedNodeId(nodeId);
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
          <span className={styles.topicArchetypePill}>シーケンス・路線図型</span>
          <strong>{topic.label}</strong>
          <small>{waypoints.length}拠点の行程</small>
        </div>

        {/* Structural Thesis Banner */}
        <div className={styles.lensStructuralThesisBanner}>
          <span className={styles.lensStructuralThesisIcon}>💡</span>
          <span className={styles.lensStructuralThesisText}>
            {getTopicStructuralThesis(topic)}
          </span>
        </div>

        {/* =========================================================================
            Vertical Transit Route Spine (路線図風・縦型インタラクティブタイムライン)
            - 100% Zero-overlap guarantee: elements flow naturally in CSS flexbox
            - Station cards with polity names (伊都国, 奴国) and modern geography (糸島)
            - Transit vector badges: 渡海千余里, 陸行五百里, etc.
           ========================================================================= */}
        <div className={styles.transitSpine} aria-label="行程路線図">
          {waypoints.map((wp, idx) => {
            const nextWp = waypoints[idx + 1];
            const transitSegment = nextWp ? getRouteTransitSegment(wp.id, nextWp.id) : undefined;
            const link = explorationLinks.get(wp.id);
            const isVisited =
              (link?.observedSpotIds.length ?? 0) > 0 || (link?.spotIds.length ?? 0) > 0;
            const isCandidateActive = matchedSuggestionNodeId === wp.id;
            const isActive = activeNodeId === wp.id;

            return (
              <div key={wp.id} className={styles.transitStationRow}>
                {/* Station Card Button */}
                <button
                  type="button"
                  className={styles.transitStationButton}
                  data-active={isActive}
                  data-candidate-active={isCandidateActive}
                  onClick={() => selectNode(wp.id)}
                >
                  {/* Step Number Circle */}
                  <div className={styles.transitStationBadge}>
                    {String(idx + 1).padStart(2, "0")}
                  </div>

                  <div className={styles.transitStationInfo}>
                    <div className={styles.transitStationHeader}>
                      <strong className={styles.transitStationTitle}>{wp.label}</strong>
                      {wp.polityLabel ? (
                        <span className={styles.transitStationTag}>史料国名</span>
                      ) : null}
                      {idx === 0 ? (
                        <span className={styles.transitStationTag} style={{ background: "rgba(52, 211, 153, 0.2)", color: "#34d399" }}>
                          起点 START
                        </span>
                      ) : idx === waypoints.length - 1 ? (
                        <span className={styles.transitStationTag} style={{ background: "rgba(251, 191, 36, 0.2)", color: "#fbbf24" }}>
                          {hypothesisConnections.length > 0 ? "共通幹・終点" : "終点 GOAL"}
                        </span>
                      ) : null}

                      {isCandidateActive ? (
                        <span style={{ color: "#d7a6ff", fontSize: "11px", fontWeight: 700, marginLeft: "auto" }}>
                          ⚑ MAP選択中
                        </span>
                      ) : (
                        <small style={{ color: isVisited ? "var(--aqua)" : "var(--muted)", marginLeft: "auto", fontSize: "10.5px" }}>
                          {isVisited ? "● 訪問済" : "○ 未訪問"}
                        </small>
                      )}
                    </div>

                    {wp.description ? (
                      <span className={styles.transitStationSubtitle}>
                        {wp.description}
                      </span>
                    ) : null}
                  </div>
                </button>

                {/* Transit Segment Vector Between Stations */}
                {nextWp ? (
                  <div className={styles.transitSegmentVector}>
                    <div className={styles.transitSegmentLine} />
                    <span className={styles.transitSegmentBadge}>
                      {transitSegment ?? "➔ 次の拠点へ"}
                    </span>
                  </div>
                ) : null}
              </div>
            );
          })}

          {/* =========================================================================
              Simultaneous Hypothesis Fork (不弥国からの仮説分岐を一目で対比表示)
              - 宇美（不弥国）以降の競合説をタップ切り替えではなく、両方同時に一目で提示！
              - 九州説（有明海・朝倉方面） vs 畿内説（大和・奈良盆地方面）
             ========================================================================= */}
          {hypothesisConnections.length > 0 ? (
            <div className={styles.transitForkSection} aria-label="不弥国からの史料解釈分岐">
              <div className={styles.transitForkHeader}>
                <span>🌿</span>
                <strong>不弥国（宇美）からの史料解釈分岐（競合仮説を一目で対比）</strong>
              </div>

              <div className={styles.transitForkGrid}>
                {hypothesisConnections.map((hyp) => {
                  const isKyushu = hyp.id.includes("kyushu");
                  const isKinai = hyp.id.includes("kinai");
                  const isToma = hyp.id.includes("toma");
                  const isSelected = selectedHypothesisId === hyp.id;

                  const hypType = isKyushu ? "kyushu" : isKinai ? "kinai" : "toma";
                  const icon = isKyushu ? "🌿" : isKinai ? "🏛️" : "❓";

                  return (
                    <button
                      key={hyp.id}
                      type="button"
                      className={styles.transitForkCard}
                      data-hypothesis={hypType}
                      data-active={isSelected}
                      onClick={() => {
                        setSelectedHypothesisId(hyp.id);
                        if (hyp.placeEntityIds && hyp.placeEntityIds.length > 0) {
                          const targetPlaceId = hyp.placeEntityIds[hyp.placeEntityIds.length - 1]!;
                          selectNode(targetPlaceId);
                        }
                      }}
                    >
                      <div className={styles.transitForkCardTitle}>
                        <span>{icon} {hyp.label}</span>
                        {isSelected ? (
                          <span style={{ fontSize: "11px", color: "var(--gold)" }}>✓ 選択表示中</span>
                        ) : null}
                      </div>
                      <p className={styles.transitForkCardDesc}>{hyp.description}</p>
                      <div className={styles.transitForkCardSpots}>
                        {isKyushu ? "📍 比定候補: 有明海沿岸・朝倉・筑後方面（短里放射モデル）" : null}
                        {isKinai ? "📍 比定候補: 奈良盆地・大和・纒向方面（東行長里モデル）" : null}
                        {isToma ? "📍 投馬国候補: 筑後八女 / 日向 / 備後鞆 / 出雲" : null}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>

        {/* =========================================================================
            Active Node Detail Inspector (地点詳細 & 典拠・史料)
           ========================================================================= */}
        {activeWaypoint && activeNode ? (
          <div className={styles.factionActiveDetail} style={{ marginTop: 14 }}>
            <div className={styles.factionActiveHeader}>
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
              <strong className={styles.factionActiveTitle}>{activeWaypoint.label}</strong>
              <span style={{ fontSize: "11px", color: "var(--gold)", marginLeft: "auto", fontWeight: 700 }}>
                {activeWaypoint.polityLabel ? `[${activeWaypoint.polityLabel}]` : ""}
              </span>
            </div>

            {activeNode.description ? (
              <p className={styles.factionActiveDescription}>{activeNode.description}</p>
            ) : null}

            {/* Exploration question for this waypoint */}
            {activeWaypoint.question ? (
              <div className={styles.routeQuestionCallout} style={{ margin: "10px 0" }}>
                <strong>探索の問い:</strong> {activeWaypoint.question}
                {activeWaypoint.reason ? <small>（{activeWaypoint.reason}）</small> : null}
              </div>
            ) : null}

            {/* Connected Kami / Historical Figures */}
            {connectedContextEntities.length > 0 ? (
              <div style={{ fontSize: "11.5px", margin: "8px 0", padding: "6px 10px", background: "rgba(255, 255, 255, 0.04)", borderRadius: 6 }}>
                <span style={{ color: "var(--aqua)", fontWeight: 700 }}>関連神格・人物：</span>
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
                      margin: "0 6px",
                      fontSize: "11.5px",
                    }}
                  >
                    {entity.label}
                  </button>
                ))}
              </div>
            ) : null}

            {/* Spot Connection Callout */}
            {(() => {
              const link = explorationLinks.get(activeWaypoint.id);
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
              const entity = packEntityById.get(activeWaypoint.id);
              const portals = resolveCrossTopicPortals(
                {
                  id: activeWaypoint.id,
                  label: activeWaypoint.label,
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
                        onClick={() => onSelectPortal?.(p.lensId, p.topicId, activeWaypoint.id)}
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

            {/* Sources / Citations */}
            <LensSourceDetails pack={pack} assertions={selectedAssertions} />
          </div>
        ) : null}
      </div>
    </aside>
  );
}
