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
  influenced: "思想的影響",
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

  // Tree Generational Calculations & 2D Layout
  const { nodePositions, treeConnectorEdges } = useMemo(() => {
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

    const inDegrees = new Map<string, number>();
    for (const node of projection.nodes) {
      inDegrees.set(node.id, 0);
    }
    for (const edge of activeEdges) {
      if (edge.predicate === "child_of" || edge.predicate === "descendant_of") {
        inDegrees.set(edge.subjectId, (inDegrees.get(edge.subjectId) ?? 0) + 1);
      } else {
        inDegrees.set(edge.objectId, (inDegrees.get(edge.objectId) ?? 0) + 1);
      }
    }

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

    if (roots.length === 0 && projection.nodes.length > 0) {
      roots.push(projection.nodes[0]!.id);
      nodeTier.set(projection.nodes[0]!.id, 0);
    }

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

    // Layout positions in SVG (viewBox: 0 0 640 380)
    const yLevels: Record<number, number> = {
      0: 55,
      1: 155,
      2: 255,
      3: 340,
    };

    const positions = new Map<string, { x: number; y: number; width: number; level: number }>();

    for (const [level, nodes] of tierMap.entries()) {
      const y = yLevels[level] ?? (60 + level * 95);
      const n = nodes.length;
      const spacing = Math.min(160, 580 / Math.max(n, 1));
      const startX = 320 - ((n - 1) * spacing) / 2;

      nodes.forEach((node, idx) => {
        const x = startX + idx * spacing;
        positions.set(node.id, { x, y, width: Math.min(135, spacing - 10), level });
      });
    }

    // Branch connectors
    const connectors = activeEdges
      .map((edge) => {
        let parentId = edge.subjectId;
        let childId = edge.objectId;
        if (edge.predicate === "child_of" || edge.predicate === "descendant_of") {
          parentId = edge.objectId;
          childId = edge.subjectId;
        }

        const parentPos = positions.get(parentId);
        const childPos = positions.get(childId);
        if (!parentPos || !childPos) return null;

        const label = predicateLabels[edge.predicate] ?? edge.predicate;

        return {
          id: edge.id,
          parentId,
          childId,
          from: parentPos,
          to: childPos,
          label,
        };
      })
      .filter((c): c is NonNullable<typeof c> => Boolean(c));

    return {
      nodePositions: positions,
      treeConnectorEdges: connectors,
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
        {/* Collapsible Context Header */}
        <details className={styles.lensContextDetails}>
          <summary className={styles.lensContextSummary}>
            <span className={styles.topicArchetypePill}>樹状・系譜型</span>
            <strong>{projection.title}</strong>
            <span className={styles.lensContextHint}>解説 ▾</span>
          </summary>
          <p className={styles.lensContextBody}>{projection.description}</p>
        </details>

        {/* Interactive Visual SVG Genealogy Tree Diagram */}
        <svg
          className={styles.visualSvgCanvas}
          viewBox="0 0 640 380"
          role="img"
          aria-label={`${projection.title} 樹状・系譜図`}
        >
          {/* Tree Generation Level Dividers (Subtle background guides) */}
          <line x1={20} y1={105} x2={620} y2={105} stroke="rgba(255,255,255,0.04)" strokeDasharray="2 4" />
          <line x1={20} y1={205} x2={620} y2={205} stroke="rgba(255,255,255,0.04)" strokeDasharray="2 4" />
          <line x1={20} y1={300} x2={620} y2={300} stroke="rgba(255,255,255,0.04)" strokeDasharray="2 4" />

          <text x={30} y={45} fill="var(--gold)" fontSize="10" opacity="0.6" fontWeight="600">
            始祖・源流（第1層）
          </text>
          <text x={30} y={145} fill="var(--aqua)" fontSize="10" opacity="0.6" fontWeight="600">
            直系・直門（第2層）
          </text>
          <text x={30} y={245} fill="var(--muted)" fontSize="10" opacity="0.6" fontWeight="600">
            展開・継承（第3層）
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
            const labelText = node.label.length > 7 ? `${node.label.slice(0, 6)}…` : node.label;

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

                {/* Node Label */}
                <text x={4} y={1} className={styles.topologyNodeText}>
                  {labelText}
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
        </svg>

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
