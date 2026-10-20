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

type LensNode = LensKnowledgePack["entities"][number];

const kindLabels: Record<string, string> = {
  deity: "神格",
  person: "人物",
  group: "氏族・集団",
  polity: "国・勢力圏",
  place: "拠点・史跡",
  concept: "仮説・概念",
  event: "歴史的契機",
  text: "典拠史料",
};

export function ComparisonMatrixLens({
  lensLabel = "比較・対比",
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
  useEffect(() => {
    setInternalSelectedNodeId("");
  }, [selectedSuggestion?.id, selectedSpotId, topic.id]);

  // Matrix Columns Construction
  const { columns, contrastNote } = useMemo(() => {
    // 1. Identify anchor nodes for columns (e.g., groups, polities, or preset roots)
    const preset = pack.presets.find((p) => p.id === topic.presetId);
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
      // Fallback: pick top places or deities as columns
      const majorPlaces = projection.nodes.filter((n) => n.kind === "place").slice(0, 3);
      if (majorPlaces.length >= 2) {
        columnAnchors = majorPlaces;
      } else {
        columnAnchors = projection.nodes.slice(0, 3);
      }
    }

    // For each anchor, determine its related nodes across dimensions
    const cols = columnAnchors.map((anchor) => {
      // Find connected nodes
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
        (n) => n.kind === "concept" || n.kind === "event" || n.kind === "tradition",
      );

      return {
        anchor,
        deities,
        places,
        figures,
        concepts,
      };
    });

    // Generate contrast synthesis note
    let note = "";
    if (topic.id.includes("marine")) {
      note =
        "海人族三系統の並列対比：玄界灘・朝鮮半島外交を担った宗像氏、博多湾を本拠に航海・軍事を支えた阿曇氏、そして難波津・瀬戸内海内海航路を掌握した住吉・津守氏の地域分担と国家祭祀構造が浮き彫りになります。";
    } else if (topic.id.includes("asakura") || topic.id.includes("yamatai")) {
      note =
        "朝倉と大和の対照：筑前朝倉の多重環濠（平塚川添遺跡）および三輪・長谷など類似地名群と、大和盆地の初期王権拠点との空間・年代的関係を、伝承と考古学事実を分けて対比します。";
    } else if (topic.id.includes("yayoi")) {
      note =
        "弥生首長層拠点の構造対照：吉野ヶ里（佐賀平野・有明海内海拠点）、平塚川添（筑後川中流域・多重環濠）、伊都国・奴国（玄界灘対外貿易拠点）の防衛形態と王墓・副葬品ネットワークの比較です。";
    }

    return { columns: cols, contrastNote: note };
  }, [projection.nodes, projection.edges, pack.presets, topic.id, topic.presetId, nodeById, packEntityById]);

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

  const selectNode = (nodeId: string) => {
    setInternalSelectedNodeId(nodeId);
    onSelectNode?.(nodeId);
    const link = explorationLinks.get(nodeId);
    const linkedSpotId = link?.observedSpotIds[0] ?? link?.spotIds[0];
    if (linkedSpotId) {
      onSelectSpot(linkedSpotId);
    } else if (onSelectSuggestion) {
      onSelectSuggestion(nodeId);
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
        {/* Context Header */}
        <div className={styles.lensContext}>
          <div className={styles.lensContextMeta}>
            <span className={styles.topicArchetypeBadge}>仮説対比・マトリクス型</span>
            <span className={styles.lensSubheaderTopic}>
              {topic.focusLabel} · {topic.label}
            </span>
          </div>
          <strong>{projection.title}</strong>
          <p>{projection.description}</p>
        </div>

        {/* Synthesis Contrast Note */}
        {contrastNote ? (
          <div className={styles.matrixContrastCallout}>
            <strong>対比・構造分析の要諦</strong>
            <p>{contrastNote}</p>
          </div>
        ) : null}

        {/* Comparative Columns Grid */}
        <div className={styles.comparisonMatrix}>
          <div className={styles.matrixGrid}>
            {columns.map((col) => {
              const isAnchorActive = col.anchor.id === activeNodeId;
              const anchorLink = explorationLinks.get(col.anchor.id);
              const isAnchorVisited = (anchorLink?.observedSpotIds.length ?? 0) > 0 || (anchorLink?.spotIds.length ?? 0) > 0;

              return (
                <div key={col.anchor.id} className={styles.matrixColumn}>
                  {/* Column Header */}
                  <div
                    className={styles.matrixColumnHeader}
                    style={{
                      cursor: "pointer",
                      background: isAnchorActive ? "rgba(104, 199, 189, 0.15)" : undefined,
                    }}
                    onClick={() => selectNode(col.anchor.id)}
                  >
                    <span className={styles.matrixColumnTitle}>
                      {col.anchor.label}
                      {isAnchorVisited ? (
                        <span
                          className={styles.spotStatusBadge}
                          data-visited={true}
                          style={{ fontSize: "10px", padding: "1px 5px" }}
                        >
                          ✓ 訪問済
                        </span>
                      ) : null}
                    </span>
                    <span className={styles.matrixColumnSubtitle}>
                      {kindLabels[col.anchor.kind] ?? col.anchor.kind}
                      {col.anchor.description ? ` · ${col.anchor.description}` : ""}
                    </span>
                  </div>

                  {/* Column Body / Dimensions */}
                  <div className={styles.matrixColumnBody}>
                    {/* Dimension: Deities */}
                    {col.deities.length > 0 ? (
                      <div className={styles.matrixDimensionGroup}>
                        <span className={styles.matrixDimensionLabel}>奉斎神格 / 神統</span>
                        {col.deities.map((deity) => {
                          const isActive = deity.id === activeNodeId;
                          return (
                            <button
                              key={deity.id}
                              type="button"
                              className={styles.matrixCellItem}
                              data-active={isActive}
                              onClick={() => selectNode(deity.id)}
                            >
                              <strong>{deity.label}</strong>
                              {deity.description ? <small>{deity.description}</small> : null}
                            </button>
                          );
                        })}
                      </div>
                    ) : null}

                    {/* Dimension: Places / Shrines */}
                    {col.places.length > 0 ? (
                      <div className={styles.matrixDimensionGroup}>
                        <span className={styles.matrixDimensionLabel}>主要拠点・祭祀地</span>
                        {col.places.map((place) => {
                          const isActive = place.id === activeNodeId;
                          const pLink = explorationLinks.get(place.id);
                          const isVisited = (pLink?.observedSpotIds.length ?? 0) > 0 || (pLink?.spotIds.length ?? 0) > 0;

                          return (
                            <button
                              key={place.id}
                              type="button"
                              className={styles.matrixCellItem}
                              data-active={isActive}
                              onClick={() => selectNode(place.id)}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                }}
                              >
                                <strong>{place.label}</strong>
                                <span
                                  className={styles.spotStatusBadge}
                                  data-visited={isVisited}
                                  style={{ fontSize: "9px", padding: "1px 4px" }}
                                >
                                  {isVisited ? "✓ 訪問済" : "未訪"}
                                </span>
                              </div>
                              {place.description ? <small>{place.description}</small> : null}
                            </button>
                          );
                        })}
                      </div>
                    ) : null}

                    {/* Dimension: Figures */}
                    {col.figures.length > 0 ? (
                      <div className={styles.matrixDimensionGroup}>
                        <span className={styles.matrixDimensionLabel}>関連首長・人物</span>
                        {col.figures.map((fig) => {
                          const isActive = fig.id === activeNodeId;
                          return (
                            <button
                              key={fig.id}
                              type="button"
                              className={styles.matrixCellItem}
                              data-active={isActive}
                              onClick={() => selectNode(fig.id)}
                            >
                              <strong>{fig.label}</strong>
                              {fig.description ? <small>{fig.description}</small> : null}
                            </button>
                          );
                        })}
                      </div>
                    ) : null}

                    {/* Dimension: Concepts / Historical Context */}
                    {col.concepts.length > 0 ? (
                      <div className={styles.matrixDimensionGroup}>
                        <span className={styles.matrixDimensionLabel}>仮説・制度・特徴</span>
                        {col.concepts.map((concept) => {
                          const isActive = concept.id === activeNodeId;
                          return (
                            <button
                              key={concept.id}
                              type="button"
                              className={styles.matrixCellItem}
                              data-active={isActive}
                              onClick={() => selectNode(concept.id)}
                            >
                              <strong>{concept.label}</strong>
                              {concept.description ? <small>{concept.description}</small> : null}
                            </button>
                          );
                        })}
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
          <div className={styles.factionActiveDetail}>
            <div className={styles.factionActiveHeader}>
              <span className={styles.factionActiveKind}>
                {kindLabels[activeNode.kind] ?? activeNode.kind}
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
