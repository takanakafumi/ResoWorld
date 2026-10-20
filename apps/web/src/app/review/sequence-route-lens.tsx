"use client";

import { useEffect, useMemo, useState } from "react";

import { buildLensExplorationLinksByIdentity } from "@/domain/lens-packs/exploration-links";
import { projectLensPreset } from "@/domain/lens-packs/projection";
import { resolveLensEntityForSpot } from "@/domain/lens-packs/preset-selection";
import { matchLensNodeForCandidate } from "@/domain/lenses/candidate-matching";
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
  onSelectSpot,
  onSelectNode,
  onSelectSuggestion,
  connection,
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
  connection?: ReviewAtlasConnection;
}) {
  const pack = topic.pack;
  const preset = pack.presets.find((p) => p.id === topic.presetId);
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
  useEffect(() => {
    setInternalSelectedNodeId("");
  }, [selectedSuggestion?.id, selectedSpotId, topic.id]);

  // Primary map connection defining the waypoints
  const primaryConnection = preset?.mapConnections?.[0];
  const explorationQuestions = primaryConnection?.explorationQuestions ?? {};

  // Ordered list of waypoints
  const waypoints = useMemo(() => {
    if (primaryConnection?.placeEntityIds && primaryConnection.placeEntityIds.length > 0) {
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
    // Fallback: collect place nodes from projection
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
    if (selectedNodeId && waypoints.some((w) => w.id === selectedNodeId)) {
      return selectedNodeId;
    }
    if (spotEntity && waypoints.some((w) => w.id === spotEntity.id)) {
      return spotEntity.id;
    }
    return waypoints[0]?.id ?? "";
  }, [internalSelectedNodeId, matchedSuggestionNodeId, selectedNodeId, spotEntity, waypoints]);

  const activeWaypoint = waypoints.find((w) => w.id === activeNodeId);
  const activeNode = nodeById.get(activeNodeId) ?? packEntityById.get(activeNodeId);

  // Relevant assertions touching activeNode
  const selectedEdges = projection.edges.filter(
    (edge) => edge.subjectId === activeNodeId || edge.objectId === activeNodeId,
  );
  const selectedAssertions = useMemo(() => {
    const edgeIds = new Set(selectedEdges.map((e) => e.id));
    return pack.assertions.filter((a) => edgeIds.has(a.id));
  }, [selectedEdges, pack.assertions]);

  // Context entities (persons, deities) connected to this active waypoint
  const connectedContextEntities = useMemo(() => {
    const neighborIds = selectedEdges.map((e) => (e.subjectId === activeNodeId ? e.objectId : e.subjectId));
    return projection.nodes.filter(
      (n) => neighborIds.includes(n.id) && (n.kind === "person" || n.kind === "deity"),
    );
  }, [selectedEdges, activeNodeId, projection.nodes]);

  const selectNode = (nodeId: string) => {
    const link = explorationLinks.get(nodeId);
    const spotId = link?.observedSpotIds[0] ?? link?.spotIds[0];
    if (spotId) {
      onSelectSpot(spotId);
    } else if (onSelectSuggestion) {
      onSelectSuggestion(nodeId);
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
          <span className={styles.panelIndex}>LENS</span>
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

        <div className={styles.lensContext}>
          <span>{topic.focusLabel} · {topic.archetypeLabel}</span>
          <strong>{topic.label}</strong>
          <p>{topic.description}</p>
        </div>

        <section className={styles.routeSequence} aria-label="回廊・行程の順序">
          <div className={styles.routeSectionTitle}>
            <span>01</span>
            <strong>{primaryConnection?.label ?? "行程・回廊の順序"}</strong>
            <small>全{waypoints.length}地点</small>
          </div>
          <ol>
            {waypoints.map((wp, index) => {
              const link = explorationLinks.get(wp.id);
              const isVisited = (link?.observedSpotIds.length ?? 0) > 0 || (link?.spotIds.length ?? 0) > 0;
              const isCandidateActive = matchedSuggestionNodeId === wp.id;
              const isActive = activeNodeId === wp.id;

              return (
                <li key={wp.id}>
                  <button
                    type="button"
                    data-active={isActive}
                    data-candidate-active={isCandidateActive}
                    onClick={() => {
                      setInternalSelectedNodeId(wp.id);
                      selectNode(wp.id);
                    }}
                  >
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <strong>
                      {wp.label}
                      {isVisited ? (
                        <span style={{ color: "var(--aqua)", fontSize: "0.75rem", marginLeft: 6, fontWeight: 600 }}>
                          ✓ 訪問済み
                        </span>
                      ) : null}
                      {isCandidateActive ? (
                        <span style={{ color: "#d7a6ff", fontSize: "0.75rem", marginLeft: 6, fontWeight: 600 }}>
                          ⚑ MAP選択中
                        </span>
                      ) : null}
                    </strong>
                    <small>{wp.reason || wp.description || "ゆかりの聖地"}</small>
                  </button>
                </li>
              );
            })}
          </ol>
        </section>

        {activeWaypoint ? (
          <section className={styles.lensNodeDetail} style={{ marginTop: 16 }} aria-label="選択地点の詳細">
            <div>
              <span>地点詳細 · {activeWaypoint.kind === "place" ? "史跡・神社" : "知識要素"}</span>
              <strong>{activeWaypoint.label}</strong>
            </div>

            {isCandidateSelected && selectedSuggestion ? (
              <div className={styles.lensCandidateCallout}>
                <div className={styles.lensCandidateHeader}>
                  <span className={styles.lensCandidateBadge}>⚑ MAP探索候補と連動中</span>
                  <strong className={styles.lensCandidateTarget}>{selectedSuggestion.targetName}</strong>
                </div>
                <div className={styles.lensCandidateBody}>
                  <p className={styles.lensCandidateReason}>
                    <span className={styles.lensCandidateLabel}>この回廊での位置づけ：</span>
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

            {activeWaypoint.question ? (
              <div
                style={{
                  marginTop: 10,
                  padding: "10px 12px",
                  background: "rgba(213, 180, 109, 0.08)",
                  borderLeft: "3px solid var(--gold)",
                  borderRadius: "0 6px 6px 0",
                }}
              >
                <div style={{ color: "var(--gold)", fontSize: "0.75rem", fontWeight: 600, marginBottom: 4 }}>
                  探索の問い（探究テーマ）
                </div>
                <p style={{ margin: 0, fontSize: "0.85rem", lineHeight: 1.6, color: "var(--ink)" }}>
                  {activeWaypoint.question}
                </p>
                {activeWaypoint.reason ? (
                  <p style={{ margin: "6px 0 0", fontSize: "0.75rem", lineHeight: 1.5, color: "var(--muted)" }}>
                    {activeWaypoint.reason}
                  </p>
                ) : null}
              </div>
            ) : null}

            {activeNode?.description ? (
              <p style={{ marginTop: 10, lineHeight: 1.65, fontSize: "0.85rem" }}>{activeNode.description}</p>
            ) : null}

            {connectedContextEntities.length > 0 ? (
              <div className={styles.lensConnectedEntities} style={{ marginTop: 12 }}>
                <span className={styles.microLabel}>ゆかりの神・人物：</span>
                <div className={styles.lensConnectedEntityList}>
                  {connectedContextEntities.map((entity) => (
                    <button
                      key={entity.id}
                      type="button"
                      className={styles.lensConnectedEntityButton}
                      onClick={() => selectNode(entity.id)}
                    >
                      {entity.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <LensSourceDetails pack={pack} assertions={selectedAssertions} />
          </section>
        ) : null}
      </div>
    </aside>
  );
}
