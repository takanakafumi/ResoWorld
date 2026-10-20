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
  influenced: "感化・思想的影響",
  led: "主宰・指導",
  enshrined_at: "祭祀・鎮座",
  associated_with: "ゆかり・関連",
  born_at: "生誕地",
  buried_at: "墓所・奥津城",
  attested_in: "史料記載",
};

export function GenealogyTreeLens({
  lensLabel = "神・系譜",
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

  // Generational Tier Calculation
  const { tiers, branchEdges } = useMemo(() => {
    // 1. Identify genealogical / directional influence edges
    const genPredicates = new Set([
      "parent_of",
      "gives_birth_to",
      "child_of",
      "descendant_of",
      "educated",
      "influenced",
      "led",
      "succession",
    ]);

    const activeEdges = projection.edges.filter(
      (e) => genPredicates.has(e.predicate) || e.relationFamily === "genealogy",
    );

    // Incoming degrees for active nodes
    const inDegrees = new Map<string, number>();
    for (const node of projection.nodes) {
      inDegrees.set(node.id, 0);
    }
    for (const edge of activeEdges) {
      if (edge.predicate === "child_of" || edge.predicate === "descendant_of") {
        // child_of means subject is child, object is parent -> object is ancestor
        inDegrees.set(edge.subjectId, (inDegrees.get(edge.subjectId) ?? 0) + 1);
      } else {
        // parent_of / educated / gives_birth_to: subject is parent/mentor -> object is child
        inDegrees.set(edge.objectId, (inDegrees.get(edge.objectId) ?? 0) + 1);
      }
    }

    // Determine root nodes (inDegree === 0)
    const preset = pack.presets.find((p) => p.id === topic.presetId);
    const designatedRoots = new Set(preset?.rootEntityIds ?? []);

    const nodeTier = new Map<string, number>();
    const roots: string[] = [];

    for (const node of projection.nodes) {
      if ((inDegrees.get(node.id) ?? 0) === 0 || designatedRoots.has(node.id)) {
        roots.push(node.id);
        nodeTier.set(node.id, 0);
      }
    }

    // If no root found, pick the first node
    if (roots.length === 0 && projection.nodes.length > 0) {
      roots.push(projection.nodes[0]!.id);
      nodeTier.set(projection.nodes[0]!.id, 0);
    }

    // BFS forward propagation to calculate depth
    const queue = [...roots];
    while (queue.length > 0) {
      const currentId = queue.shift()!;
      const currentLevel = nodeTier.get(currentId) ?? 0;

      for (const edge of activeEdges) {
        let childId: string | null = null;
        if (edge.subjectId === currentId && edge.predicate !== "child_of" && edge.predicate !== "descendant_of") {
          childId = edge.objectId;
        } else if (edge.objectId === currentId && (edge.predicate === "child_of" || edge.predicate === "descendant_of")) {
          childId = edge.subjectId;
        }

        if (childId && projection.nodes.some((n) => n.id === childId)) {
          const existingLevel = nodeTier.get(childId);
          if (existingLevel === undefined || existingLevel < currentLevel + 1) {
            nodeTier.set(childId, currentLevel + 1);
            queue.push(childId);
          }
        }
      }
    }

    // For any unreached node, assign based on kind or level 0
    for (const node of projection.nodes) {
      if (!nodeTier.has(node.id)) {
        if (node.kind === "place" || node.kind === "text") {
          nodeTier.set(node.id, 99); // auxiliary
        } else {
          nodeTier.set(node.id, 0);
        }
      }
    }

    // Group nodes by tier
    const tierMap = new Map<number, LensNode[]>();
    for (const node of projection.nodes) {
      const tier = nodeTier.get(node.id) ?? 0;
      if (!tierMap.has(tier)) {
        tierMap.set(tier, []);
      }
      tierMap.get(tier)!.push(node);
    }

    const sortedTiers = Array.from(tierMap.entries())
      .sort(([a], [b]) => a - b)
      .map(([level, nodes]) => {
        let title = `第${level + 1}世代`;
        if (level === 0) title = "始祖・源流（第1層）";
        else if (level === 1) title = "直系・直門（第2層）";
        else if (level === 2) title = "展開・継承（第3層）";
        else if (level >= 99) title = "関連史跡・奉斎拠点";

        return {
          level,
          title,
          nodes,
        };
      });

    return {
      tiers: sortedTiers,
      branchEdges: activeEdges,
    };
  }, [projection.nodes, projection.edges, pack.presets, topic.presetId]);

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

  // Node ancestry / lineage context for active node
  const activeNodeLineage = useMemo(() => {
    if (!activeNode) return { parents: [], children: [], places: [] };

    const parents: Array<{ id: string; label: string; predicate: string }> = [];
    const children: Array<{ id: string; label: string; predicate: string }> = [];
    const places: Array<{ id: string; label: string; predicate: string }> = [];

    for (const edge of projection.edges) {
      if (edge.objectId === activeNode.id) {
        const subject = nodeById.get(edge.subjectId) ?? packEntityById.get(edge.subjectId);
        if (subject) {
          if (edge.predicate === "parent_of" || edge.predicate === "educated" || edge.predicate === "gives_birth_to") {
            parents.push({ id: subject.id, label: subject.label, predicate: edge.predicate });
          } else if (subject.kind === "place") {
            places.push({ id: subject.id, label: subject.label, predicate: edge.predicate });
          }
        }
      } else if (edge.subjectId === activeNode.id) {
        const object = nodeById.get(edge.objectId) ?? packEntityById.get(edge.objectId);
        if (object) {
          if (edge.predicate === "parent_of" || edge.predicate === "educated" || edge.predicate === "gives_birth_to") {
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
        {/* Context Header */}
        <div className={styles.lensContext}>
          <div className={styles.lensContextMeta}>
            <span className={styles.topicArchetypeBadge}>樹状・系譜型</span>
            <span className={styles.lensSubheaderTopic}>
              {topic.focusLabel} · {topic.label}
            </span>
          </div>
          <strong>{projection.title}</strong>
          <p>{projection.description}</p>
        </div>

        {/* Tree Generational Hierarchy */}
        <div className={styles.genealogyTree}>
          {tiers.map((tier) => (
            <section key={tier.level} className={styles.genealogyTier}>
              <div className={styles.genealogyTierHeader}>
                <span className={styles.genealogyTierBadge}>{tier.title}</span>
                <span className={styles.genealogyTierCount}>{tier.nodes.length}柱 / 員</span>
              </div>
              <div className={styles.genealogyTierNodes}>
                {tier.nodes.map((node) => {
                  const isActive = node.id === activeNodeId;
                  const link = explorationLinks.get(node.id);
                  const isVisited = (link?.observedSpotIds.length ?? 0) > 0 || (link?.spotIds.length ?? 0) > 0;
                  const isMapSelected = Boolean(
                    selectedSpot &&
                      (link?.spotIds.includes(selectedSpot.id) || spotEntity?.id === node.id),
                  );

                  return (
                    <button
                      key={node.id}
                      type="button"
                      className={styles.genealogyNodeCard}
                      data-active={isActive}
                      data-visited={isVisited}
                      data-map-selected={isMapSelected}
                      onClick={() => selectNode(node.id)}
                    >
                      <div className={styles.genealogyNodeHeader}>
                        <span className={styles.genealogyNodeLabel}>{node.label}</span>
                        <span className={styles.genealogyNodeKind}>
                          {kindLabels[node.kind] ?? node.kind}
                        </span>
                      </div>

                      {node.description ? (
                        <p className={styles.genealogyNodeDesc}>{node.description}</p>
                      ) : null}

                      <div className={styles.genealogyNodeHeader}>
                        <span
                          className={styles.spotStatusBadge}
                          data-visited={isVisited}
                          style={{ fontSize: "10px", padding: "1px 5px" }}
                        >
                          {isVisited ? "✓ 訪問済み" : "未訪問"}
                        </span>
                        {isMapSelected ? (
                          <span className={styles.mapIndicatorBadge} style={{ fontSize: "10px" }}>
                            ⚑ MAP選択
                          </span>
                        ) : null}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        {/* Lineage Branch Connections Summary */}
        {branchEdges.length > 0 ? (
          <div className={styles.genealogyBranchesSection}>
            <span className={styles.lensGroupHeader}>主要な系譜・継承関係</span>
            <div className={styles.genealogyBranchesList}>
              {branchEdges.slice(0, 6).map((edge) => {
                const sub = nodeById.get(edge.subjectId) ?? packEntityById.get(edge.subjectId);
                const obj = nodeById.get(edge.objectId) ?? packEntityById.get(edge.objectId);
                const label = predicateLabels[edge.predicate] ?? edge.predicate;

                return (
                  <div key={edge.id} className={styles.genealogyBranchItem}>
                    <span className={styles.genealogyBranchSubject}>
                      {sub?.label ?? edge.subjectId}
                    </span>
                    <span className={styles.genealogyBranchPredicate}>{label}</span>
                    <span className={styles.genealogyBranchObject}>
                      {obj?.label ?? edge.objectId}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

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
                <p>選択中の未訪問候補は、この系譜の構成要素として位置付けられています。</p>
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
