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
  useEffect(() => {
    setInternalSelectedNodeId("");
  }, [selectedSuggestion?.id, selectedSpotId, topic.id]);

  // Topology: Hub and Spokes Calculation
  const { hubCore, rings, spokes } = useMemo(() => {
    const preset = pack.presets.find((p) => p.id === topic.presetId);
    const designatedRootId = preset?.rootEntityIds?.[0];

    // Degree calculation for fallback
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
      // Find node with highest degree
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

    const ringList: Array<{
      level: number;
      title: string;
      description: string;
      nodes: LensNode[];
    }> = [];

    if (ring1Nodes.length > 0) {
      ringList.push({
        level: 1,
        title: "第1同心環：直結中枢・近接聖域",
        description: "中枢拠点と直結し、一次的な防衛・祭祀・管理を担う直接ネットワーク",
        nodes: ring1Nodes,
      });
    }

    if (ring2Nodes.length > 0) {
      ringList.push({
        level: 2,
        title: "第2同心環：外縁拠点・広域回廊網",
        description: "中枢から同心円状に広がる諸国分祀・広域防衛城郭・地方展開網",
        nodes: ring2Nodes,
      });
    }

    // Spokes radiating from core or inner ring
    const spokeList = projection.edges
      .filter((e) => e.subjectId === coreId || e.objectId === coreId)
      .map((edge) => {
        const targetId = edge.subjectId === coreId ? edge.objectId : edge.subjectId;
        const target = nodeById.get(targetId) ?? packEntityById.get(targetId);
        const relLabel = relationLabels[edge.predicate] ?? edge.predicate;

        return {
          id: edge.id,
          coreId,
          coreLabel: coreNode?.label ?? coreId,
          targetId,
          targetLabel: target?.label ?? targetId,
          relation: relLabel,
        };
      });

    return {
      hubCore: coreNode,
      rings: ringList,
      spokes: spokeList,
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

  const isCoreActive = hubCore ? hubCore.id === activeNodeId : false;
  const coreLink = hubCore ? explorationLinks.get(hubCore.id) : undefined;
  const isCoreVisited = (coreLink?.observedSpotIds.length ?? 0) > 0 || (coreLink?.spotIds.length ?? 0) > 0;

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
            <span className={styles.topicArchetypeBadge}>中心・外縁型</span>
            <span className={styles.lensSubheaderTopic}>
              {topic.focusLabel} · {topic.label}
            </span>
          </div>
          <strong>{projection.title}</strong>
          <p>{projection.description}</p>
        </div>

        {/* Central Hub Core Card */}
        {hubCore ? (
          <div
            className={styles.hubCoreSection}
            data-active={isCoreActive}
            onClick={() => selectNode(hubCore.id)}
          >
            <div className={styles.hubCoreHeader}>
              <span className={styles.hubCoreBadge}>🎯 中枢・本源核</span>
              <span
                className={styles.spotStatusBadge}
                data-visited={isCoreVisited}
                style={{ fontSize: "10px", padding: "1px 6px" }}
              >
                {isCoreVisited ? "✓ 訪問済み" : "未訪フロンティア"}
              </span>
            </div>
            <div className={styles.hubCoreTitle}>
              {hubCore.label}
              <span
                style={{
                  fontSize: "11px",
                  marginLeft: "8px",
                  color: "var(--gold)",
                  fontWeight: 500,
                }}
              >
                （{kindLabels[hubCore.kind] ?? hubCore.kind}）
              </span>
            </div>
            {hubCore.description ? (
              <p className={styles.hubCoreDescription}>{hubCore.description}</p>
            ) : null}
          </div>
        ) : null}

        {/* Concentric Spoke Rings */}
        <div className={styles.hubRingsContainer}>
          {rings.map((ring) => (
            <section key={ring.level} className={styles.hubRingTier}>
              <div className={styles.hubRingHeader}>
                <span className={styles.hubRingBadge}>{ring.title}</span>
                <span className={styles.hubRingCount}>{ring.nodes.length}拠点</span>
              </div>
              <p style={{ margin: "0 0 10px", fontSize: "11px", color: "var(--muted)" }}>
                {ring.description}
              </p>
              <div className={styles.hubNodesGrid}>
                {ring.nodes.map((node) => {
                  const isActive = node.id === activeNodeId;
                  const link = explorationLinks.get(node.id);
                  const isVisited =
                    (link?.observedSpotIds.length ?? 0) > 0 || (link?.spotIds.length ?? 0) > 0;
                  const isMapSelected = Boolean(
                    selectedSpot &&
                      (link?.spotIds.includes(selectedSpot.id) || spotEntity?.id === node.id),
                  );

                  return (
                    <button
                      key={node.id}
                      type="button"
                      className={styles.hubNodeCard}
                      data-active={isActive}
                      data-visited={isVisited}
                      data-map-selected={isMapSelected}
                      onClick={() => selectNode(node.id)}
                    >
                      <div className={styles.hubNodeHeader}>
                        <span className={styles.hubNodeLabel}>{node.label}</span>
                        <span className={styles.hubNodeKind}>
                          {kindLabels[node.kind] ?? node.kind}
                        </span>
                      </div>

                      {node.description ? (
                        <p className={styles.hubNodeDesc}>{node.description}</p>
                      ) : null}

                      <div className={styles.hubNodeHeader}>
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

        {/* Radial Spokes Connection Summary */}
        {spokes.length > 0 ? (
          <div className={styles.spokeConnectionsList}>
            <span className={styles.lensGroupHeader}>中枢からの放射・求心接続（Spokes）</span>
            {spokes.slice(0, 6).map((spoke) => (
              <div key={spoke.id} className={styles.spokeConnectionItem}>
                <span className={styles.spokeCoreLabel}>{spoke.coreLabel}</span>
                <span className={styles.spokeRelationBadge}>{spoke.relation}</span>
                <span className={styles.spokeTargetLabel}>{spoke.targetLabel}</span>
              </div>
            ))}
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
              {activeNode.id === hubCore?.id ? (
                <span
                  style={{
                    fontSize: "11px",
                    color: "var(--gold)",
                    fontWeight: 700,
                    marginLeft: "auto",
                  }}
                >
                  🎯 トポロジー中核
                </span>
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
                <p>選択中の未訪問候補は、この中心・外縁トポロジーの構成拠点です。</p>
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
