"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { normalizeLensEntityName, lensEntityNamesMatch } from "@/domain/lens-packs/entity-identity";
import { buildLensExplorationLinksByIdentity } from "@/domain/lens-packs/exploration-links";
import { buildLensTimelineEntries } from "@/domain/lens-packs/assertion-presentation";
import { resolveCrossTopicPortals } from "@/domain/lens-packs/cross-topic-portals";
import { registeredLensTopics } from "@/domain/lens-packs/knowledge-registry";
import { projectLensPreset } from "@/domain/lens-packs/projection";
import type { LensKnowledgePack } from "@/domain/lens-packs/schema";
import type { ReviewAtlasSpot, ReviewDataset, ReviewExplorationSuggestion } from "@/domain/review/types";
import { matchLensNodeForCandidate, resolveSpotForLensNode } from "@/domain/lenses/candidate-matching";
import { getRelationMeta, getTopicStructuralThesis } from "@/domain/lenses/relation-presentation";

import styles from "./atlas.module.css";
import { LensSourceDetails } from "./lens-source-details";
import { useLensZoomPan, LensZoomControls } from "./use-lens-zoom-pan";
import { StructuralThesisBanner } from "./structural-thesis-banner";

const kindLabels: Record<string, string> = { person: "人物", place: "場所", polity: "政治体", group: "集団", concept: "概念", tradition: "信仰・伝統", deity: "神" };
const relationLabels: Record<string, string> = { association: "関係", "historical-context": "歴史的背景", identification: "比定・仮説", influence: "影響", enshrinement: "祭祀", syncretism: "習合" };

export function PackRelationshipLens({
  lensLabel = "政治・社会",
  topicId,
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
  topicId: string;
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
  const topic = registeredLensTopics.find((candidate) => candidate.id === topicId);
  if (!topic) return null;
  const projection = projectLensPreset(topic.pack, topic.presetId);
  return (
    <ProjectedRelationshipLens
      key={topic.id}
      topicId={topic.id}
      lensLabel={lensLabel}
      topicLabel={topic.label}
      topicDescription={topic.description}
      pack={topic.pack}
      projection={projection}
      claims={claims}
      spots={spots}
      selectedSpotId={selectedSpotId}
      selectedNodeId={selectedNodeId}
      selectedSuggestion={selectedSuggestion}
      suggestions={suggestions}
      onSelectSpot={onSelectSpot}
      onSelectNode={onSelectNode}
      onSelectSuggestion={onSelectSuggestion}
      onSelectPortal={onSelectPortal}
    />
  );
}

function ProjectedRelationshipLens({
  topicId,
  lensLabel,
  topicLabel,
  topicDescription,
  pack,
  projection,
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
  topicId: string;
  lensLabel: string;
  topicLabel: string;
  topicDescription?: string;
  pack: LensKnowledgePack;
  projection: ReturnType<typeof projectLensPreset>;
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
  const columns = Math.min(4, Math.max(1, Math.ceil(Math.sqrt(projection.nodes.length))));
  const rows = Math.ceil(projection.nodes.length / columns);
  const graphHeight = Math.max(250, rows * 125 + 70);
  const positions = useMemo(() => new Map(projection.nodes.map((node, index) => [
    node.id,
    { x: 90 + (index % columns) * (540 / Math.max(1, columns - 1)), y: 75 + Math.floor(index / columns) * 125 },
  ])), [columns, projection.nodes]);
  const links = useMemo(() => buildLensExplorationLinksByIdentity(claims, spots, projection.nodes), [claims, spots, projection.nodes]);

  const matchedSuggestionNodeId = useMemo(() => {
    return matchLensNodeForCandidate(projection.nodes, selectedSuggestion)?.id;
  }, [selectedSuggestion, projection.nodes]);

  const [internalSelectedNodeId, setInternalSelectedNodeId] = useState("");

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
    if (selectedSpotId) {
      for (const [nodeId, link] of links.entries()) {
        if (link.spotIds.includes(selectedSpotId)) {
          matchedId = nodeId;
          break;
        }
      }
    } else if (selectedSuggestion) {
      const matched = matchLensNodeForCandidate(projection.nodes, selectedSuggestion);
      if (matched) matchedId = matched.id;
    }

    if (matchedId) {
      setInternalSelectedNodeId(matchedId);
      const pos = positions.get(matchedId);
      if (pos) {
        centerOn(pos.x, pos.y);
      }
    } else {
      setInternalSelectedNodeId("");
    }
  }, [selectedSuggestion?.id, selectedSpotId, projection.title, centerOn, links, positions, projection.nodes]);

  const activeNodeId = useMemo(() => {
    if (internalSelectedNodeId && projection.nodes.some((n) => n.id === internalSelectedNodeId)) {
      return internalSelectedNodeId;
    }
    if (matchedSuggestionNodeId) {
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
    return projection.nodes[0]?.id ?? "";
  }, [internalSelectedNodeId, matchedSuggestionNodeId, selectedNodeId, projection.nodes]);

  const isCandidateSelected = Boolean(
    selectedSuggestion && matchedSuggestionNodeId && activeNodeId === matchedSuggestionNodeId
  );

  const selectedNode = projection.nodes.find((node) => node.id === activeNodeId);
  const selectedEdges = projection.edges.filter((edge) => edge.subjectId === activeNodeId || edge.objectId === activeNodeId);
  const connectedEntities = useMemo(() => {
    if (!activeNodeId) return [];
    const neighborIds = selectedEdges.map((edge) => edge.subjectId === activeNodeId ? edge.objectId : edge.subjectId);
    return projection.nodes.filter((node) => neighborIds.includes(node.id));
  }, [activeNodeId, selectedEdges, projection.nodes]);

  const selectedLink = links.get(activeNodeId);
  const timelineEntries = projection.lensType === "timeline"
    ? buildLensTimelineEntries(projection.edges, projection.nodes)
    : [];

  const nodeById = useMemo(() => new Map(projection.nodes.map((node) => [node.id, node])), [projection.nodes]);

  const selectNode = (nodeId: string) => {
    if (isClickSuppressed()) return;

    setInternalSelectedNodeId(nodeId);
    const node = nodeById.get(nodeId);
    const link = links.get(nodeId);
    const spotId = resolveSpotForLensNode(node, link, spots);

    if (spotId) {
      onSelectSpot(spotId);
      return;
    }
    if (onSelectSuggestion) {
      onSelectSuggestion(nodeId);
      return;
    }
    onSelectNode?.(nodeId);
  };

  return (
    <aside className={styles.genealogyPanel} aria-label={topicLabel + "レンズ"}>
      <div className={styles.panelHeader}>
        <div><span className={styles.panelIndex}>LENS</span><h2>{lensLabel}</h2></div>
        <span>PACK {projection.packVersion} / {projection.status.toUpperCase()}</span>
      </div>
      <div className={styles.genealogyBody + " " + styles.bakumatsuLensBody}>
        <div className={styles.lensContext}>
          <span>外部知識 × 自分の探索</span>
          <strong>{topicLabel || projection.title}</strong>
          <p>{topicDescription || projection.description}</p>
        </div>

        {/* Structural Thesis Banner: Instantly conveys the mental model at a single glance */}
        <StructuralThesisBanner
          topic={{ id: topicId, label: topicLabel, description: topicDescription }}
        />
        {timelineEntries.length > 0 ? (
          <ol className={styles.lensTimeline} aria-label={projection.title + "の時系列"}>
            {timelineEntries.map((entry) => (
              <li key={entry.assertionIds.join("-")}>
                <span>{entry.timeLabel}</span>
                <strong>{entry.labels.join("・")}</strong>
                <small>{entry.evidenceLabels.join("・")}</small>
              </li>
            ))}
          </ol>
        ) : null}

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
            className={`${styles.genealogyGraph} ${styles.bakumatsuGraph} ${styles.lensGraphSvg}`}
            viewBox={"0 0 720 " + graphHeight}
            role="img"
            aria-label={projection.title + "の関係図"}
          >
            <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`} style={{ transition: isCentering ? "transform 0.42s cubic-bezier(0.2, 0.9, 0.3, 1)" : "none" }}>
              {projection.edges.map((edge) => {
                const from = positions.get(edge.subjectId);
                const to = positions.get(edge.objectId);
                if (!from || !to) return null;
                const connected = edge.subjectId === activeNodeId || edge.objectId === activeNodeId;
                const relMeta = getRelationMeta(edge.predicate, edge.relationFamily);
                const curve = "M" + (from.x + 56) + " " + from.y + " C" + ((from.x + to.x) / 2) + " " + from.y + " " + ((from.x + to.x) / 2) + " " + to.y + " " + (to.x - 56) + " " + to.y;
                return (
                  <g key={edge.id} className={styles.bakumatsuEdge} data-family={edge.relationFamily} data-connected={connected}>
                    <path
                      d={curve}
                      style={{
                        stroke: connected ? "var(--gold)" : relMeta.color,
                        strokeWidth: connected ? 2.4 : 1.4,
                        opacity: connected ? 1 : 0.45,
                        strokeDasharray: relMeta.strokeDasharray,
                      }}
                    />
                    {connected ? (
                      <text x={(from.x + to.x) / 2} y={(from.y + to.y) / 2 - 7} textAnchor="middle" fill="var(--gold)">
                        {relationLabels[edge.relationFamily] ?? relMeta.label}
                      </text>
                    ) : null}
                  </g>
                );
              })}
              {projection.nodes.map((node) => {
                const point = positions.get(node.id);
                if (!point) return null;
                const link = links.get(node.id);
                const selectedFromMap = link?.spotIds.includes(selectedSpotId) ?? false;
                const isCandidateActive = isCandidateSelected && node.id === activeNodeId;
                return (
                  <g
                    key={node.id}
                    transform={"translate(" + point.x + " " + point.y + ")"}
                    className={styles.genealogyNode}
                    data-kind={node.kind}
                    data-active={node.id === activeNodeId || selectedFromMap}
                    data-candidate-active={isCandidateActive ? "true" : undefined}
                    data-visited={(link?.observedSpotIds.length ?? 0) > 0}
                    data-connected={(link?.spotIds.length ?? 0) > 0}
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      selectNode(node.id);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        selectNode(node.id);
                      }
                    }}
                  >
                    <rect x="-58" y="-26" width="116" height="52" rx="7" />
                    {isCandidateActive ? (
                      <g transform="translate(0, -32)">
                        <rect x="-44" y="-10" width="88" height="18" rx="9" className={styles.candidateBadgeRect} />
                        <text y="2" textAnchor="middle" className={styles.candidateBadgeText}>⚑ MAP選択中</text>
                      </g>
                    ) : null}
                    <text y="-2" textAnchor="middle">{node.label}</text>
                    <text y="15" textAnchor="middle" className={styles.genealogyNodeSub}>{kindLabels[node.kind] ?? node.kind}</text>
                  </g>
                );
              })}
            </g>
          </svg>
        </div>
        <section className={styles.lensNodeDetail} aria-label="選択した関係の説明">
          <div>
            <span>{selectedNode ? kindLabels[selectedNode.kind] ?? "知識要素" : "知識要素"}</span>
            <strong>{selectedNode?.label ?? projection.title}</strong>
          </div>

          {isCandidateSelected && selectedSuggestion ? (
            <div className={styles.lensCandidateCallout}>
              <div className={styles.lensCandidateHeader}>
                <span className={styles.lensCandidateBadge}>⚑ MAP探索候補と連動中</span>
                <strong className={styles.lensCandidateTarget}>{selectedSuggestion.targetName}</strong>
              </div>
              <div className={styles.lensCandidateBody}>
                <p className={styles.lensCandidateReason}>
                  <span className={styles.lensCandidateLabel}>このLENSでの位置づけ・候補理由：</span>
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

          <p>
            {selectedEdges.length > 0
              ? selectedEdges.map((edge) => relationLabels[edge.relationFamily] ?? "関係").filter((label, index, labels) => labels.indexOf(label) === index).join("・") + "として接続しています。"
              : "テーマ全体の関係を表示しています。"}
          </p>

          {connectedEntities.length > 0 ? (
            <div className={styles.lensConnectedEntities}>
              <span className={styles.microLabel}>このLENSでの接続先：</span>
              <div className={styles.lensConnectedEntityList}>
                {connectedEntities.map((entity) => (
                  <button
                    key={entity.id}
                    type="button"
                    className={styles.lensConnectedEntityButton}
                    onClick={() => selectNode(entity.id)}
                  >
                    {entity.label} <small>({kindLabels[entity.kind] ?? entity.kind})</small>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {/* Cross-Topic Portals (ADR-0022) */}
          {selectedNode ? (() => {
            const portals = resolveCrossTopicPortals(
              { id: selectedNode.id, label: selectedNode.label, aliases: selectedNode.aliases },
              { currentTopicId: topicId },
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
                      onClick={() => onSelectPortal?.(p.lensId, p.topicId, selectedNode.id)}
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
          })() : null}

          {(selectedLink?.claimIds.length ?? 0) > 0 ? (
            <ul className={styles.lensClaimList}>
              {selectedLink!.claimIds.slice(0, 3).map((claimId) => {
                const claim = claims.find((candidate) => candidate.id === claimId);
                return claim ? (
                  <li key={claimId}>
                    <Link href={"/review?view=graph&claim=" + encodeURIComponent(claimId)}>
                      {claim.statement}<span>自分の根拠を見る →</span>
                    </Link>
                  </li>
                ) : null;
              })}
            </ul>
          ) : null}
          <small>
            {(selectedLink?.claimIds.length ?? 0) > 0
              ? "自分の探索 " + selectedLink!.claimIds.length + "件と接続"
              : "外部Knowledge Packから補完した接続です"}
          </small>
          <LensSourceDetails pack={pack} assertions={selectedEdges} />
        </section>
      </div>
    </aside>
  );
}
