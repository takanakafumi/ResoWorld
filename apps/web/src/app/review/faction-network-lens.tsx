"use client";

import { useEffect, useMemo, useState, useRef } from "react";

import { buildLensExplorationLinksByIdentity } from "@/domain/lens-packs/exploration-links";
import { projectLensPreset } from "@/domain/lens-packs/projection";
import { resolveLensEntityForSpot } from "@/domain/lens-packs/preset-selection";
import { lensEntityNamesMatch } from "@/domain/lens-packs/entity-identity";
import { resolveCrossTopicPortals } from "@/domain/lens-packs/cross-topic-portals";
import { matchLensNodeForCandidate, matchCandidateForLensNode, matchLensNodeForSpot, resolveSpotForLensNode } from "@/domain/lenses/candidate-matching";
import { getEntityKindMeta } from "@/domain/lenses/entity-presentation";
import type { ResolvedLensTopic } from "@/domain/lenses/topic-resolver";
import type { LensKnowledgePack } from "@/domain/lens-packs/schema";
import type {
  ReviewAtlasSpot,
  ReviewDataset,
  ReviewExplorationSuggestion,
} from "@/domain/review/types";

type LensNode = LensKnowledgePack["entities"][number];

import styles from "./atlas.module.css";
import { LensSourceDetails } from "./lens-source-details";

type DynamicCategory = {
  label: string;
  color: string;
  bg: string;
  icon: string;
};

function categorizePredicate(predicate: string): DynamicCategory {
  switch (predicate) {
    case "opposed":
    case "confronted":
    case "conflicted":
      return { label: "対立・交戦", color: "#f87171", bg: "rgba(248, 113, 113, 0.15)", icon: "⚔️" };
    case "allied_with":
    case "participated_in":
    case "mediated_and_attested":
    case "communicated_with":
      return { label: "同盟・連携", color: "var(--aqua)", bg: "rgba(104, 199, 189, 0.15)", icon: "🤝" };
    case "dispatched":
    case "visited_as_envoy":
    case "conferred_title_on":
      return { label: "外交・使節", color: "var(--gold)", bg: "rgba(213, 180, 109, 0.15)", icon: "📜" };
    case "ruled":
    case "oversaw":
    case "stationed_in":
    case "represented":
      return { label: "統治・検察", color: "#c084fc", bg: "rgba(192, 132, 252, 0.15)", icon: "⚖️" };
    case "patronized":
    case "funded":
    case "established":
    case "established_as_ruler":
      return { label: "庇護・共立", color: "#38bdf8", bg: "rgba(56, 189, 248, 0.15)", icon: "🏛️" };
    case "enshrined_at":
    case "yielded":
    case "negotiated_with":
      return { label: "祭祀・幽政", color: "#f472b6", bg: "rgba(244, 114, 182, 0.15)", icon: "⛩️" };
    default:
      return { label: "関連・影響", color: "var(--muted)", bg: "rgba(255, 255, 255, 0.08)", icon: "🔗" };
  }
}

export function FactionNetworkLens({
  lensLabel = "政治・社会",
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
  const factionContainerRef = useRef<HTMLDivElement>(null);

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



  // Faction / Bloc Clustering
  const { factions, connectors } = useMemo(() => {
    const preset = pack.presets.find((p) => p.id === topic.presetId);

    // If preset has structured mapConnections (>= 2), use them as strategic faction blocs / defense lines
    if (preset?.mapConnections && preset.mapConnections.length >= 2) {
      const assignedNodeIds = new Set<string>();
      const factionList: Array<{
        id: string;
        label: string;
        kind: string;
        description: string;
        color?: string;
        anchor?: LensNode;
        members: LensNode[];
      }> = [];

      for (const conn of preset.mapConnections) {
        const placeSet = new Set(conn.placeEntityIds);
        const contextSet = new Set(conn.contextEntityIds ?? []);

        const anchorId = conn.anchorEntityId ?? conn.placeEntityIds[0];
        const anchor = anchorId ? (nodeById.get(anchorId) ?? packEntityById.get(anchorId)) : undefined;

        // Find all nodes in this connection
        const members: LensNode[] = [];
        const seenMemberIds = new Set<string>();

        for (const node of projection.nodes) {
          if (placeSet.has(node.id) || contextSet.has(node.id)) {
            if (!seenMemberIds.has(node.id)) {
              seenMemberIds.add(node.id);
              members.push(node);
              assignedNodeIds.add(node.id);
            }
          }
        }

        factionList.push({
          id: conn.id,
          label: conn.label,
          kind: "polity",
          description: conn.description ?? "",
          color: conn.appearance?.color,
          anchor,
          members,
        });
      }

      // Nodes not assigned to a specific corridor act as connectors / overarching command nodes
      // (e.g. polity-yamato-court, polity-dazaifu, or central commands)
      const unassignedNodes = projection.nodes.filter((n) => !assignedNodeIds.has(n.id));

      return {
        factions: factionList,
        connectors: unassignedNodes,
      };
    }

    // Fallback: anchor-based clustering
    const polityOrGroupNodes = projection.nodes.filter(
      (n) => n.kind === "polity" || n.kind === "group",
    );

    let anchorNodes: LensNode[] = polityOrGroupNodes;
    if (anchorNodes.length === 0) {
      // Fallback: pick deities/persons with enshrinement or association
      anchorNodes = projection.nodes.filter((n) => n.kind === "deity" || n.kind === "person").slice(0, 3);
    }

    const assignedNodeIds = new Set<string>();
    const factionList: Array<{
      id: string;
      label: string;
      kind: string;
      description: string;
      color?: string;
      anchor?: LensNode;
      members: LensNode[];
    }> = [];

    for (const anchor of anchorNodes) {
      assignedNodeIds.add(anchor.id);
      // Find members connected to anchor
      const memberIds = new Set<string>();
      for (const edge of projection.edges) {
        if (edge.subjectId === anchor.id && edge.objectId !== anchor.id) {
          memberIds.add(edge.objectId);
        } else if (edge.objectId === anchor.id && edge.subjectId !== anchor.id) {
          memberIds.add(edge.subjectId);
        }
      }

      const members: LensNode[] = [];
      for (const id of memberIds) {
        const node = nodeById.get(id);
        if (node && !anchorNodes.some((a) => a.id === node.id)) {
          members.push(node);
          assignedNodeIds.add(node.id);
        }
      }

      const anchorMeta = getEntityKindMeta(anchor.kind, anchor);
      factionList.push({
        id: anchor.id,
        label: anchor.label,
        kind: anchor.kind,
        description: anchor.description ?? "",
        color: anchorMeta.color,
        anchor,
        members,
      });
    }

    // Connectors / Bridges: remaining nodes
    const unassignedNodes = projection.nodes.filter((n) => !assignedNodeIds.has(n.id));

    return {
      factions: factionList,
      connectors: unassignedNodes,
    };
  }, [projection.nodes, projection.edges, pack.presets, topic.presetId, nodeById, packEntityById]);

  // Dynamic Relations
  const dynamics = useMemo(() => {
    return projection.edges.map((edge) => {
      const subject = nodeById.get(edge.subjectId) ?? packEntityById.get(edge.subjectId);
      const object = nodeById.get(edge.objectId) ?? packEntityById.get(edge.objectId);
      const category = categorizePredicate(edge.predicate);

      return {
        id: edge.id,
        subjectId: edge.subjectId,
        subjectLabel: subject?.label ?? edge.subjectId,
        predicate: edge.predicate,
        objectId: edge.objectId,
        objectLabel: object?.label ?? edge.objectId,
        category,
        assertionId: edge.id,
      };
    });
  }, [projection.edges, nodeById, packEntityById]);

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
    return projection.nodes[0]?.id ?? "";
  }, [internalSelectedNodeId, matchedSuggestionNodeId, selectedNodeId, spotEntity, projection.nodes]);

  const activeNode = nodeById.get(activeNodeId) ?? packEntityById.get(activeNodeId);

  useEffect(() => {
    if (!activeNodeId || !factionContainerRef.current) return;
    const targetEl = factionContainerRef.current.querySelector<HTMLElement>(
      `[data-faction-node-id="${activeNodeId}"]`,
    );
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [activeNodeId]);

  // Assertions touching activeNode
  const selectedEdges = projection.edges.filter(
    (e) => e.subjectId === activeNodeId || e.objectId === activeNodeId,
  );
  const selectedAssertions = useMemo(() => {
    const edgeIds = new Set(selectedEdges.map((e) => e.id));
    return pack.assertions.filter((a) => edgeIds.has(a.id));
  }, [selectedEdges, pack.assertions]);

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
    <aside className={styles.genealogyPanel} aria-label={`${topic.label}の勢力・相関レンズ`}>
      <div className={styles.panelHeader}>
        <div>
          <span className={styles.panelIndex}>LENS</span>
          <h2>{lensLabel}</h2>
        </div>
        <span>PACK {pack.version} / FACTION</span>
      </div>

      <div className={`${styles.genealogyBody} ${styles.factionNetworkBody}`}>
        {/* Sleek Compact Context Bar (Prevents Vertical Scroll Pressure) */}
        <div className={styles.lensCompactContextBar}>
          <span className={styles.topicArchetypePill}>勢力・相関型</span>
          <strong>{topic.label}</strong>
          <small>{factions.length}陣営の勢力相関</small>
        </div>

        {/* 1. Faction Blocs */}
        <section aria-label="主要陣営・勢力ブロック">
          <div className={styles.factionSectionTitle}>
            <span>01</span>
            <strong>主要陣営・勢力ブロック</strong>
            <small>{factions.length}陣営</small>
          </div>
          <div ref={factionContainerRef} className={styles.factionGrid}>
            {factions.map((faction) => {
              const factionMeta = getEntityKindMeta(faction.kind);

              return (
                <div
                  key={faction.id}
                  className={styles.factionCard}
                  style={faction.color ? { borderTop: `3px solid ${faction.color}` } : undefined}
                >
                  <div className={styles.factionCardHeader}>
                    <strong>{faction.label}</strong>
                    <span className={styles.factionCardBadge}>
                      {faction.members.length}拠点・要素
                    </span>
                  </div>
                  <div className={styles.factionMemberList}>
                    {/* Anchor button if present */}
                    {faction.anchor ? (
                      <button
                        type="button"
                        data-faction-node-id={faction.anchor.id}
                        className={styles.factionMemberButton}
                        data-active={activeNodeId === faction.anchor.id}
                        style={{
                          borderLeft: `3px solid ${getEntityKindMeta(faction.anchor.kind, faction.anchor).color}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 6,
                          padding: "5px 8px",
                        }}
                        onClick={() => selectNode(faction.anchor!.id)}
                      >
                        <span style={{ display: "flex", alignItems: "center", gap: 5, overflow: "hidden" }}>
                          <span>★ {getEntityKindMeta(faction.anchor.kind, faction.anchor).icon}</span>
                          <strong style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {faction.anchor.label}
                          </strong>
                        </span>
                        <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                          {(explorationLinks.get(faction.anchor.id)?.spotIds.length ?? 0) > 0 ? (
                            <span style={{ color: "var(--aqua)", fontSize: "0.75rem", fontWeight: 700 }}>✓</span>
                          ) : null}
                          <span className={styles.entityKindBadge} data-kind={faction.anchor.kind}>
                            {getEntityKindMeta(faction.anchor.kind, faction.anchor).label}
                          </span>
                        </div>
                      </button>
                    ) : null}

                    {/* Member buttons */}
                    {faction.members
                      .filter((m) => !faction.anchor || m.id !== faction.anchor.id)
                      .map((member) => {
                        const meta = getEntityKindMeta(member.kind, member);
                        const isMemberActive = activeNodeId === member.id;
                        const memberLink = explorationLinks.get(member.id);
                        const isMemberVisited = (memberLink?.spotIds.length ?? 0) > 0;
                        const isCandActive = matchedSuggestionNodeId === member.id;

                        return (
                          <button
                            key={member.id}
                            type="button"
                            data-faction-node-id={member.id}
                            className={styles.factionMemberButton}
                            data-active={isMemberActive}
                            data-candidate-active={isCandActive}
                            style={{
                              borderLeft: `3px solid ${meta.color}`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              gap: 6,
                              padding: "5px 8px",
                            }}
                            onClick={() => selectNode(member.id)}
                          >
                            <span style={{ display: "flex", alignItems: "center", gap: 5, overflow: "hidden" }}>
                              <span style={{ lineHeight: 1 }}>{meta.icon}</span>
                              <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {member.label}
                              </span>
                            </span>
                            <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                              {isMemberVisited ? (
                                <span style={{ color: "var(--aqua)", fontSize: "0.75rem", fontWeight: 700 }}>✓</span>
                              ) : isCandActive ? (
                                <span style={{ color: "#d7a6ff", fontSize: "0.75rem", fontWeight: 700 }}>⚑</span>
                              ) : null}
                              <span className={styles.entityKindBadge} data-kind={member.kind}>
                                {meta.label}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 2. Connectors / Bridges */}
        {connectors.length > 0 ? (
          <section aria-label="仲介者・交渉拠点">
            <div className={styles.factionSectionTitle}>
              <span>02</span>
              <strong>仲介者・指揮中枢・共有空間</strong>
              <small>{connectors.length}拠点・要素</small>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {connectors.map((connector) => {
                const meta = getEntityKindMeta(connector.kind, connector);
                const isActive = activeNodeId === connector.id;
                const link = explorationLinks.get(connector.id);
                const isVisited = (link?.spotIds.length ?? 0) > 0;
                const isCandActive = matchedSuggestionNodeId === connector.id;

                return (
                  <button
                    key={connector.id}
                    type="button"
                    data-faction-node-id={connector.id}
                    className={styles.factionMemberButton}
                    data-active={isActive}
                    data-candidate-active={isCandActive}
                    style={{
                      borderLeft: `3px solid ${meta.color}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 6,
                      padding: "5px 8px",
                      flex: "1 1 180px",
                    }}
                    onClick={() => selectNode(connector.id)}
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: 5, overflow: "hidden" }}>
                      <span style={{ lineHeight: 1 }}>{meta.icon}</span>
                      <strong style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {connector.label}
                      </strong>
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                      {isVisited ? (
                        <span style={{ color: "var(--aqua)", fontSize: "0.75rem", fontWeight: 700 }}>✓</span>
                      ) : isCandActive ? (
                        <span style={{ color: "#d7a6ff", fontSize: "0.75rem", fontWeight: 700 }}>⚑</span>
                      ) : null}
                      <span className={styles.entityKindBadge} data-kind={connector.kind}>
                        {meta.label}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        ) : null}

        {/* 3. Dynamics / Inter-Faction Relations */}
        <section aria-label="陣営間の対立・提携・交渉軸">
          <div className={styles.factionSectionTitle}>
            <span>03</span>
            <strong>陣営間の対立・提携・交渉軸</strong>
            <small>{dynamics.length}関係</small>
          </div>
          <div className={styles.dynamicsList}>
            {dynamics.map((d) => {
              const isDynamicActive = activeNodeId === d.subjectId || activeNodeId === d.objectId;

              return (
                <div
                  key={d.id}
                  className={styles.dynamicCard}
                  style={isDynamicActive ? { borderColor: d.category.color, background: d.category.bg } : {}}
                  onClick={() => selectNode(d.subjectId)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      selectNode(d.subjectId);
                    }
                  }}
                >
                  <div className={styles.dynamicCardHeader}>
                    <span
                      className={styles.dynamicCardBadge}
                      style={{ color: d.category.color, background: d.category.bg }}
                    >
                      {d.category.icon} {d.category.label}
                    </span>
                    <strong style={{ color: "var(--ink)", fontSize: "12px" }}>
                      {d.subjectLabel} → {d.objectLabel}
                    </strong>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 4. Active Node Deep-Dive */}
        {activeNode ? (
          <section className={styles.lensNodeDetail} style={{ marginTop: 12 }} aria-label="選択要素の詳細">
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {(() => {
                const activeMeta = getEntityKindMeta(activeNode.kind, activeNode);
                return (
                  <span className={styles.entityKindBadge} data-kind={activeNode.kind} style={{ color: activeMeta.color, borderColor: activeMeta.border, backgroundColor: activeMeta.bg }}>
                    {activeMeta.icon} {activeMeta.label}
                  </span>
                );
              })()}
              <strong style={{ fontSize: "14px", color: "var(--gold)" }}>{activeNode.label}</strong>
            </div>

            {isCandidateSelected && selectedSuggestion ? (
              <div className={styles.lensCandidateCallout}>
                <div className={styles.lensCandidateHeader}>
                  <span className={styles.lensCandidateBadge}>⚑ MAP探索候補と連動中</span>
                  <strong className={styles.lensCandidateTarget}>{selectedSuggestion.targetName}</strong>
                </div>
                <div className={styles.lensCandidateBody}>
                  <p className={styles.lensCandidateReason}>
                    <span className={styles.lensCandidateLabel}>陣営での位置づけ：</span>
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

            {activeNode.description ? (
              <p style={{ marginTop: 8, lineHeight: 1.6, fontSize: "0.85rem" }}>{activeNode.description}</p>
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

            <LensSourceDetails pack={pack} assertions={selectedAssertions} />
          </section>
        ) : null}
      </div>
    </aside>
  );
}
