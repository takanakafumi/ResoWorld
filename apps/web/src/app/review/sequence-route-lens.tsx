"use client";

import { useEffect, useMemo, useState, useRef } from "react";

import { buildLensExplorationLinksByIdentity } from "@/domain/lens-packs/exploration-links";
import { projectLensPreset } from "@/domain/lens-packs/projection";
import { resolveLensEntityForSpot } from "@/domain/lens-packs/preset-selection";
import { lensEntityNamesMatch } from "@/domain/lens-packs/entity-identity";
import { resolveCrossTopicPortals } from "@/domain/lens-packs/cross-topic-portals";
import { matchLensNodeForCandidate, matchCandidateForLensNode, matchLensNodeForSpot, resolveSpotForLensNode } from "@/domain/lenses/candidate-matching";
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
  const listContainerRef = useRef<HTMLOListElement>(null);

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

  const activeNodeId = useMemo(() => {
    if (internalSelectedNodeId && waypoints.some((w) => w.id === internalSelectedNodeId)) {
      return internalSelectedNodeId;
    }
    if (matchedSuggestionNodeId && waypoints.some((w) => w.id === matchedSuggestionNodeId)) {
      return matchedSuggestionNodeId;
    }
    if (selectedNodeId) {
      const direct = waypoints.find((w) => w.id === selectedNodeId);
      if (direct) return direct.id;
      const byName = waypoints.find((w) => {
        const entity = packEntityById.get(w.id);
        const aliases = entity?.aliases ?? [];
        return [w.label, ...aliases].some((name) => lensEntityNamesMatch(name, selectedNodeId));
      });
      if (byName) return byName.id;
    }
    if (spotEntity && waypoints.some((w) => w.id === spotEntity.id)) {
      return spotEntity.id;
    }
    return waypoints[0]?.id ?? "";
  }, [internalSelectedNodeId, matchedSuggestionNodeId, selectedNodeId, spotEntity, waypoints]);

  const activeWaypoint = waypoints.find((w) => w.id === activeNodeId);
  const activeNode = nodeById.get(activeNodeId) ?? packEntityById.get(activeNodeId);

  useEffect(() => {
    if (!activeNodeId || !listContainerRef.current) return;
    const targetEl = listContainerRef.current.querySelector<HTMLElement>(`[data-waypoint-id="${activeNodeId}"]`);
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [activeNodeId]);

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
    } else if (onSelectSuggestion) {
      if (node && suggestions.length > 0) {
        const candidate = matchCandidateForLensNode(node, suggestions);
        if (candidate) {
          onSelectSuggestion(candidate.id);
        }
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

        {/* Sleek Compact Context Bar (Prevents Vertical Scroll Pressure) */}
        <div className={styles.lensCompactContextBar}>
          <span className={styles.topicArchetypePill}>シーケンス・回廊型</span>
          <strong>{topic.label}</strong>
          <small>{waypoints.length}地点の行程</small>
        </div>

        {/* Compact Timeline Rail (Fits on screen at a glance!) */}
        <section className={styles.routeSequence} aria-label="回廊・行程の順序">
          <div className={styles.routeSectionTitle}>
            <span>01</span>
            <strong>{primaryConnection?.label ?? "行程・回廊の順序"}</strong>
            <small>全{waypoints.length}地点</small>
          </div>
          <ol ref={listContainerRef}>
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
                      setInternalSelectedNodeId(wp.id);
                      selectNode(wp.id);
                    }}
                  >
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <strong style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      {/* Subtle status dot (NO bulky text badge taking up lines!) */}
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
        </section>

        {/* Active Node Detail Inspector */}
        {activeWaypoint ? (
          <div className={styles.factionActiveDetail}>
            <div className={styles.factionActiveHeader}>
              <span className={styles.factionActiveKind}>
                {activeWaypoint.kind === "place" ? "行程拠点" : activeWaypoint.kind}
              </span>
              <strong className={styles.factionActiveTitle}>{activeWaypoint.label}</strong>
              <span style={{ fontSize: "11px", color: "var(--gold)", marginLeft: "auto" }}>
                Step {waypoints.findIndex((w) => w.id === activeWaypoint.id) + 1} / {waypoints.length}
              </span>
            </div>

            {activeWaypoint.description ? (
              <p className={styles.factionActiveDescription}>{activeWaypoint.description}</p>
            ) : null}

            {/* Exploration question for this waypoint */}
            {activeWaypoint.question ? (
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
                { id: activeWaypoint.id, label: activeWaypoint.label, aliases: entity?.aliases ?? [] },
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
                        onClick={() => onSelectPortal?.(p.lensId, p.topicId, activeWaypoint.id)}
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

            {/* Sources */}
            <LensSourceDetails pack={pack} assertions={selectedAssertions} />
          </div>
        ) : null}
      </div>
    </aside>
  );
}
