"use client";

import { useEffect, useMemo, useState, useRef } from "react";

import { buildLensExplorationLinksByIdentity } from "@/domain/lens-packs/exploration-links";
import { projectLensPreset } from "@/domain/lens-packs/projection";
import { resolveLensEntityForSpot } from "@/domain/lens-packs/preset-selection";
import { matchLensNodeForCandidate, matchCandidateForLensNode, matchLensNodeForSpot, resolveSpotForLensNode } from "@/domain/lenses/candidate-matching";
import { getEntityKindMeta } from "@/domain/lenses/entity-presentation";
import type { ResolvedLensTopic } from "@/domain/lenses/topic-resolver";
import type { LensKnowledgePack } from "@/domain/lens-packs/schema";
import type {
  ReviewAtlasSpot,
  ReviewDataset,
  ReviewExplorationSuggestion,
} from "@/domain/review/types";

import styles from "./atlas.module.css";
import { LensSourceDetails } from "./lens-source-details";

type LensNode = LensKnowledgePack["entities"][number];



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
  const matrixContainerRef = useRef<HTMLDivElement>(null);

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
    } else {
      setInternalSelectedNodeId("");
    }
  }, [selectedSuggestion?.id, selectedSpotId, selectedSpot, topic.id, explorationLinks, projection.nodes]);



  // Matrix Columns Construction
  const { columns, contrastNote } = useMemo(() => {
    const preset = pack.presets.find((p) => p.id === topic.presetId);

    // If preset has structured mapConnections (>= 2), use them as the primary semantic dimensions/corridors
    if (preset?.mapConnections && preset.mapConnections.length >= 2) {
      const cols = preset.mapConnections.map((conn) => {
        const placeSet = new Set(conn.placeEntityIds);
        const contextSet = new Set(conn.contextEntityIds ?? []);

        // Anchor entity
        const anchorId = conn.anchorEntityId ?? conn.placeEntityIds[0];
        const anchor = anchorId ? (nodeById.get(anchorId) ?? packEntityById.get(anchorId)) : undefined;

        // Collect all nodes belonging to this corridor
        const memberNodes: LensNode[] = [];
        const seenMemberIds = new Set<string>();

        for (const node of projection.nodes) {
          if (placeSet.has(node.id) || contextSet.has(node.id)) {
            if (!seenMemberIds.has(node.id)) {
              seenMemberIds.add(node.id);
              memberNodes.push(node);
            }
          }
        }

        const deities = memberNodes.filter((n) => n.kind === "deity");
        const places = memberNodes.filter((n) => n.kind === "place" && n.id !== anchor?.id);
        const figures = memberNodes.filter((n) => n.kind === "person");
        const concepts = memberNodes.filter(
          (n) => n.kind !== "deity" && n.kind !== "place" && n.kind !== "person",
        );

        return {
          id: conn.id,
          title: conn.label,
          subtitle: conn.description ?? "",
          color: conn.appearance?.color,
          legendLabel: conn.appearance?.legendLabel ?? conn.label,
          anchor,
          deities,
          places,
          figures,
          concepts,
        };
      });

      return { columns: cols, contrastNote: preset.description ?? topic.description ?? "" };
    }

    // Fallback: Anchor-based column clustering
    const rootIds = preset?.rootEntityIds ?? [];

    let columnAnchors = projection.nodes.filter(
      (n) => n.kind === "group" || n.kind === "polity" || n.kind === "concept",
    );

    if (columnAnchors.length === 0 && rootIds.length >= 2) {
      columnAnchors = rootIds
        .map((id) => nodeById.get(id) ?? packEntityById.get(id))
        .filter((n): n is LensNode => Boolean(n));
    }

    if (columnAnchors.length === 0) {
      const majorPlaces = projection.nodes.filter((n) => n.kind === "place").slice(0, 3);
      if (majorPlaces.length >= 2) {
        columnAnchors = majorPlaces;
      } else {
        columnAnchors = projection.nodes.slice(0, 3);
      }
    }

    const cols = columnAnchors.map((anchor) => {
      const connectedNodeIds = new Set<string>();
      for (const edge of projection.edges) {
        if (edge.subjectId === anchor.id && edge.objectId !== anchor.id) {
          connectedNodeIds.add(edge.objectId);
        } else if (edge.objectId === anchor.id && edge.subjectId !== anchor.id) {
          connectedNodeIds.add(edge.subjectId);
        }
      }

      const connectedNodes: LensNode[] = [];
      for (const id of connectedNodeIds) {
        const node = nodeById.get(id) ?? packEntityById.get(id);
        if (node && !columnAnchors.some((a) => a.id === node.id)) {
          connectedNodes.push(node);
        }
      }

      const deities = connectedNodes.filter((n) => n.kind === "deity");
      const places = connectedNodes.filter((n) => n.kind === "place");
      const figures = connectedNodes.filter((n) => n.kind === "person");
      const concepts = connectedNodes.filter(
        (n) => n.kind === "concept" || n.kind === "event" || n.kind === "tradition" || n.kind === "polity" || n.kind === "group",
      );

      const anchorMeta = getEntityKindMeta(anchor.kind);
      return {
        id: anchor.id,
        title: anchor.label,
        subtitle: anchor.description ?? `${anchorMeta.icon} ${anchorMeta.label}`,
        color: anchorMeta.color,
        legendLabel: anchor.label,
        anchor,
        deities,
        places,
        figures,
        concepts,
      };
    });

    return { columns: cols, contrastNote: preset?.description ?? topic.description ?? "" };
  }, [projection.nodes, projection.edges, pack.presets, topic.description, topic.presetId, nodeById, packEntityById]);

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

  useEffect(() => {
    if (!activeNodeId || !matrixContainerRef.current) return;
    const targetEl = matrixContainerRef.current.querySelector<HTMLElement>(`[data-matrix-id="${activeNodeId}"]`);
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
    }
  }, [activeNodeId]);
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

  const selectNode = (nodeId: string) => {
    setInternalSelectedNodeId(nodeId);
    onSelectNode?.(nodeId);
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
          <span className={styles.topicArchetypePill}>仮説対比・マトリクス型</span>
          <strong>{projection.title}</strong>
          <small>{columns.length}系統の並列対比</small>
        </div>

        {/* Synthesis Contrast Note */}
        {contrastNote ? (
          <div className={styles.matrixContrastCallout} style={{ padding: "8px 12px", margin: "0 0 10px" }}>
            <strong>対比・構造分析の要諦:</strong> {contrastNote}
          </div>
        ) : null}

        {/* Compact Comparison Columns */}
        <div className={styles.comparisonMatrix}>
          <div className={styles.matrixGrid}>
            {columns.map((col) => {
              const anchorNode = col.anchor;
              const isAnchorActive = anchorNode?.id === activeNodeId;
              const anchorLink = anchorNode ? explorationLinks.get(anchorNode.id) : undefined;
              const isAnchorVisited =
                (anchorLink?.observedSpotIds.length ?? 0) > 0 || (anchorLink?.spotIds.length ?? 0) > 0;
              const anchorMeta = anchorNode ? getEntityKindMeta(anchorNode.kind) : undefined;

              return (
                <div
                  key={col.id}
                  className={styles.matrixColumn}
                  style={col.color ? { borderTop: `3px solid ${col.color}` } : undefined}
                >
                  {/* Column Header */}
                  <div
                    className={styles.matrixColumnHeader}
                    style={{
                      cursor: anchorNode ? "pointer" : "default",
                      padding: "8px 10px",
                      background: isAnchorActive ? "rgba(104, 199, 189, 0.15)" : undefined,
                    }}
                    onClick={() => anchorNode && selectNode(anchorNode.id)}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 4 }}>
                      <span className={styles.matrixColumnTitle} style={{ fontSize: "12px", fontWeight: 700 }}>
                        <span
                          style={{
                            display: "inline-block",
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            background: isAnchorVisited ? "var(--aqua)" : (col.color ?? "rgba(255,255,255,0.25)"),
                            marginRight: 5,
                          }}
                        />
                        {col.title}
                      </span>
                      {anchorNode && anchorMeta ? (
                        <span className={styles.entityKindBadge} data-kind={anchorNode.kind}>
                          {anchorMeta.icon} {anchorNode.label}
                        </span>
                      ) : null}
                    </div>
                    {col.subtitle ? (
                      <span className={styles.matrixColumnSubtitle} style={{ fontSize: "10px", marginTop: 2, display: "block" }}>
                        {col.subtitle}
                      </span>
                    ) : null}
                  </div>

                  {/* Column Body / Dimensions */}
                  <div className={styles.matrixColumnBody} style={{ padding: "8px", gap: "8px" }}>
                    {/* Dimension: Deities */}
                    {col.deities.length > 0 ? (
                      <div className={styles.matrixDimensionGroup}>
                        <span className={styles.matrixDimensionLabel}>⛩️ 奉斎神格 ({col.deities.length})</span>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          {col.deities.map((deity) => {
                            const meta = getEntityKindMeta(deity.kind);
                            const isActive = deity.id === activeNodeId;
                            const dLink = explorationLinks.get(deity.id);
                            const isDVisited =
                              (dLink?.observedSpotIds.length ?? 0) > 0 || (dLink?.spotIds.length ?? 0) > 0;
                            const isCandActive = matchedSuggestionNodeId === deity.id;
                            return (
                              <button
                                key={deity.id}
                                type="button"
                                className={styles.matrixCellItem}
                                data-matrix-id={deity.id}
                                data-active={isActive}
                                data-candidate-active={isCandActive}
                                style={{
                                  padding: "4px 8px",
                                  fontSize: "11px",
                                  display: "flex",
                                  flexDirection: "row",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  gap: 6,
                                  borderLeft: `3px solid ${meta.color}`,
                                  width: "100%",
                                  textAlign: "left",
                                }}
                                onClick={() => selectNode(deity.id)}
                              >
                                <div style={{ display: "flex", alignItems: "center", gap: 5, overflow: "hidden" }}>
                                  <span style={{ fontSize: "12px", lineHeight: 1 }}>{meta.icon}</span>
                                  <span
                                    style={{
                                      display: "inline-block",
                                      width: 5,
                                      height: 5,
                                      borderRadius: "50%",
                                      flexShrink: 0,
                                      background: isDVisited ? "var(--aqua)" : "rgba(255,255,255,0.25)",
                                    }}
                                  />
                                  <strong style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{deity.label}</strong>
                                </div>
                                <span className={styles.entityKindBadge} data-kind={deity.kind}>
                                  {meta.label}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}

                    {/* Dimension: Places / Shrines */}
                    {col.places.length > 0 ? (
                      <div className={styles.matrixDimensionGroup}>
                        <span className={styles.matrixDimensionLabel}>📍 主要拠点・史跡 ({col.places.length})</span>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          {col.places.map((place) => {
                            const meta = getEntityKindMeta(place.kind);
                            const isActive = place.id === activeNodeId;
                            const pLink = explorationLinks.get(place.id);
                            const isPVisited =
                              (pLink?.observedSpotIds.length ?? 0) > 0 || (pLink?.spotIds.length ?? 0) > 0;
                            const isCandActive = matchedSuggestionNodeId === place.id;

                            return (
                              <button
                                key={place.id}
                                type="button"
                                className={styles.matrixCellItem}
                                data-matrix-id={place.id}
                                data-active={isActive}
                                data-candidate-active={isCandActive}
                                style={{
                                  padding: "4px 8px",
                                  fontSize: "11px",
                                  display: "flex",
                                  flexDirection: "row",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  gap: 6,
                                  borderLeft: `3px solid ${meta.color}`,
                                  width: "100%",
                                  textAlign: "left",
                                }}
                                onClick={() => selectNode(place.id)}
                              >
                                <div style={{ display: "flex", alignItems: "center", gap: 5, overflow: "hidden" }}>
                                  <span style={{ fontSize: "12px", lineHeight: 1 }}>{meta.icon}</span>
                                  <span
                                    style={{
                                      display: "inline-block",
                                      width: 5,
                                      height: 5,
                                      borderRadius: "50%",
                                      flexShrink: 0,
                                      background: isPVisited ? "var(--aqua)" : "rgba(255,255,255,0.25)",
                                    }}
                                  />
                                  <strong style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{place.label}</strong>
                                </div>
                                <span className={styles.entityKindBadge} data-kind={place.kind}>
                                  {meta.label}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}

                    {/* Dimension: Figures */}
                    {col.figures.length > 0 ? (
                      <div className={styles.matrixDimensionGroup}>
                        <span className={styles.matrixDimensionLabel}>👤 関連首長・人物 ({col.figures.length})</span>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          {col.figures.map((fig) => {
                            const meta = getEntityKindMeta(fig.kind);
                            const isActive = fig.id === activeNodeId;
                            const fLink = explorationLinks.get(fig.id);
                            const isFVisited =
                              (fLink?.observedSpotIds.length ?? 0) > 0 || (fLink?.spotIds.length ?? 0) > 0;
                            const isCandActive = matchedSuggestionNodeId === fig.id;

                            return (
                              <button
                                key={fig.id}
                                type="button"
                                className={styles.matrixCellItem}
                                data-matrix-id={fig.id}
                                data-active={isActive}
                                data-candidate-active={isCandActive}
                                style={{
                                  padding: "4px 8px",
                                  fontSize: "11px",
                                  display: "flex",
                                  flexDirection: "row",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  gap: 6,
                                  borderLeft: `3px solid ${meta.color}`,
                                  width: "100%",
                                  textAlign: "left",
                                }}
                                onClick={() => selectNode(fig.id)}
                              >
                                <div style={{ display: "flex", alignItems: "center", gap: 5, overflow: "hidden" }}>
                                  <span style={{ fontSize: "12px", lineHeight: 1 }}>{meta.icon}</span>
                                  <span
                                    style={{
                                      display: "inline-block",
                                      width: 5,
                                      height: 5,
                                      borderRadius: "50%",
                                      flexShrink: 0,
                                      background: isFVisited ? "var(--aqua)" : "rgba(255,255,255,0.25)",
                                    }}
                                  />
                                  <strong style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{fig.label}</strong>
                                </div>
                                <span className={styles.entityKindBadge} data-kind={fig.kind}>
                                  {meta.label}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}

                    {/* Dimension: Concepts */}
                    {col.concepts.length > 0 ? (
                      <div className={styles.matrixDimensionGroup}>
                        <span className={styles.matrixDimensionLabel}>💡 制度・概念・信仰 ({col.concepts.length})</span>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          {col.concepts.map((concept) => {
                            const meta = getEntityKindMeta(concept.kind);
                            const isActive = concept.id === activeNodeId;
                            const cLink = explorationLinks.get(concept.id);
                            const isCVisited =
                              (cLink?.observedSpotIds.length ?? 0) > 0 || (cLink?.spotIds.length ?? 0) > 0;
                            const isCandActive = matchedSuggestionNodeId === concept.id;

                            return (
                              <button
                                key={concept.id}
                                type="button"
                                className={styles.matrixCellItem}
                                data-matrix-id={concept.id}
                                data-active={isActive}
                                data-candidate-active={isCandActive}
                                style={{
                                  padding: "4px 8px",
                                  fontSize: "11px",
                                  display: "flex",
                                  flexDirection: "row",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  gap: 6,
                                  borderLeft: `3px solid ${meta.color}`,
                                  width: "100%",
                                  textAlign: "left",
                                }}
                                onClick={() => selectNode(concept.id)}
                              >
                                <div style={{ display: "flex", alignItems: "center", gap: 5, overflow: "hidden" }}>
                                  <span style={{ fontSize: "12px", lineHeight: 1 }}>{meta.icon}</span>
                                  <span
                                    style={{
                                      display: "inline-block",
                                      width: 5,
                                      height: 5,
                                      borderRadius: "50%",
                                      flexShrink: 0,
                                      background: isCVisited ? "var(--aqua)" : "rgba(255,255,255,0.25)",
                                    }}
                                  />
                                  <strong style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{concept.label}</strong>
                                </div>
                                <span className={styles.entityKindBadge} data-kind={concept.kind}>
                                  {meta.label}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Active Node Detail Inspector */}
        {activeNode ? (
          <div className={styles.factionActiveDetail} style={{ marginTop: 12 }}>
            <div className={styles.factionActiveHeader}>
              <span className={styles.entityKindBadge} data-kind={activeNode.kind}>
                {getEntityKindMeta(activeNode.kind).icon} {getEntityKindMeta(activeNode.kind).label}
              </span>
              <strong className={styles.factionActiveTitle}>{activeNode.label}</strong>
              {activeNode.aliases && activeNode.aliases.length > 0 ? (
                <small className={styles.factionActiveAliases}>
                  別名: {activeNode.aliases.join(" / ")}
                </small>
              ) : null}
            </div>

            {activeNode.description ? (
              <p className={styles.factionActiveDescription}>{activeNode.description}</p>
            ) : null}

            {/* Spot Connection Callout */}
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
          </div>
        ) : null}

        {/* Source Citations */}
        <LensSourceDetails pack={pack} assertions={selectedAssertions} />
      </div>
    </aside>
  );
}
