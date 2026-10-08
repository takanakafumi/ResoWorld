"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { normalizeLensEntityName } from "@/domain/lens-packs/entity-identity";
import { buildLensExplorationLinksByIdentity } from "@/domain/lens-packs/exploration-links";
import { buildLensTimelineEntries } from "@/domain/lens-packs/assertion-presentation";
import { registeredLensTopics } from "@/domain/lens-packs/knowledge-registry";
import { projectLensPreset } from "@/domain/lens-packs/projection";
import type { LensKnowledgePack } from "@/domain/lens-packs/schema";
import type { ReviewAtlasSpot, ReviewDataset, ReviewExplorationSuggestion } from "@/domain/review/types";
import { matchLensNodeForCandidate } from "@/domain/lenses/candidate-matching";

import styles from "./atlas.module.css";
import { LensSourceDetails } from "./lens-source-details";

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
  onSelectSpot,
  onSelectNode,
  onSelectSuggestion,
}: {
  lensLabel?: string;
  topicId: string;
  claims: ReviewDataset["claims"];
  spots: ReviewAtlasSpot[];
  selectedSpotId: string;
  selectedNodeId?: string;
  selectedSuggestion?: ReviewExplorationSuggestion;
  onSelectSpot: (spotId: string) => void;
  onSelectNode?: (nodeId: string) => void;
  onSelectSuggestion?: (suggestionId: string) => void;
}) {
  const topic = registeredLensTopics.find((candidate) => candidate.id === topicId);
  if (!topic) return null;
  const projection = projectLensPreset(topic.pack, topic.presetId);
  return (
    <ProjectedRelationshipLens
      key={topic.id}
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
      onSelectSpot={onSelectSpot}
      onSelectNode={onSelectNode}
      onSelectSuggestion={onSelectSuggestion}
    />
  );
}

function ProjectedRelationshipLens({
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
  onSelectSpot,
  onSelectNode,
  onSelectSuggestion,
}: {
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
  onSelectSpot: (spotId: string) => void;
  onSelectNode?: (nodeId: string) => void;
  onSelectSuggestion?: (suggestionId: string) => void;
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

  // Zoom & Pan state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0, hasMoved: false });
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInternalSelectedNodeId("");
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, [selectedSuggestion?.id, selectedSpotId, projection.title]);

  const activeNodeId = useMemo(() => {
    if (internalSelectedNodeId && projection.nodes.some((n) => n.id === internalSelectedNodeId)) {
      return internalSelectedNodeId;
    }
    if (matchedSuggestionNodeId) {
      return matchedSuggestionNodeId;
    }
    if (selectedNodeId && projection.nodes.some((n) => n.id === selectedNodeId)) {
      return selectedNodeId;
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

  const handleZoom = useCallback((delta: number) => {
    setZoom((prev) => Math.min(3, Math.max(0.5, Number((prev + delta).toFixed(2)))));
  }, []);

  const handleResetZoom = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  // Native wheel listener on viewport to prevent page scroll and zoom smoothly
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 0.12 : -0.12;
      setZoom((prev) => Math.min(3.5, Math.max(0.4, Number((prev + zoomFactor).toFixed(2)))));
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
    };
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    // Only primary button
    if (e.button !== 0) return;
    setIsPanning(true);
    panStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      panX: pan.x,
      panY: pan.y,
      hasMoved: false,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPanning) return;
    const dx = e.clientX - panStartRef.current.x;
    const dy = e.clientY - panStartRef.current.y;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      panStartRef.current.hasMoved = true;
    }
    setPan({
      x: panStartRef.current.panX + dx,
      y: panStartRef.current.panY + dy,
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isPanning) {
      setIsPanning(false);
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // pointer capture release fallback
      }
    }
  };

  const selectNode = (nodeId: string) => {
    // If dragging took place, don't trigger node selection click
    if (panStartRef.current.hasMoved) return;

    setInternalSelectedNodeId(nodeId);
    onSelectNode?.(nodeId);
    const link = links.get(nodeId);
    let spotId = link?.observedSpotIds[0] ?? link?.spotIds[0];

    // If this node does not directly link to a spot, traverse adjacent edges (BFS)
    // to find connected spots (e.g. Munakata Taisha connected from Tagorihime or Triad)
    if (!spotId) {
      const visited = new Set<string>([nodeId]);
      const queue = [nodeId];
      while (queue.length > 0 && !spotId) {
        const curr = queue.shift()!;
        const neighbors = projection.edges
          .filter((edge) => edge.subjectId === curr || edge.objectId === curr)
          .map((edge) => (edge.subjectId === curr ? edge.objectId : edge.subjectId))
          .filter((nId) => !visited.has(nId));

        for (const nId of neighbors) {
          visited.add(nId);
          const nLink = links.get(nId);
          const found = nLink?.observedSpotIds[0] ?? nLink?.spotIds[0];
          if (found) {
            spotId = found;
            break;
          }
          queue.push(nId);
        }
      }
    }

    if (spotId) {
      onSelectSpot(spotId);
    } else if (onSelectSuggestion) {
      onSelectSuggestion(nodeId);
    }
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
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          style={{ cursor: isPanning ? "grabbing" : "grab" }}
        >
          <div className={styles.lensZoomControls} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => handleZoom(-0.15)}
              aria-label="縮小"
              title="縮小 (マウスホイール手前)"
            >
              −
            </button>
            <span title="現在の倍率">{Math.round(zoom * 100)}%</span>
            <button
              type="button"
              onClick={() => handleZoom(0.15)}
              aria-label="拡大"
              title="拡大 (マウスホイール奥)"
            >
              +
            </button>
            <button
              type="button"
              onClick={handleResetZoom}
              aria-label="リセット"
              title="等倍にリセット"
            >
              ⟲
            </button>
          </div>

          <span className={styles.lensZoomHint}>
            マウスホイールで拡縮 / ドラッグで移動
          </span>

          <svg
            className={`${styles.genealogyGraph} ${styles.bakumatsuGraph} ${styles.lensGraphSvg}`}
            viewBox={"0 0 720 " + graphHeight}
            role="img"
            aria-label={projection.title + "の関係図"}
          >
            <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`} style={{ transformOrigin: "360px 180px" }}>
              {projection.edges.map((edge) => {
                const from = positions.get(edge.subjectId);
                const to = positions.get(edge.objectId);
                if (!from || !to) return null;
                const connected = edge.subjectId === activeNodeId || edge.objectId === activeNodeId;
                const curve = "M" + (from.x + 56) + " " + from.y + " C" + ((from.x + to.x) / 2) + " " + from.y + " " + ((from.x + to.x) / 2) + " " + to.y + " " + (to.x - 56) + " " + to.y;
                return (
                  <g key={edge.id} className={styles.bakumatsuEdge} data-family={edge.relationFamily} data-connected={connected}>
                    <path d={curve} />
                    {connected ? (
                      <text x={(from.x + to.x) / 2} y={(from.y + to.y) / 2 - 7} textAnchor="middle">
                        {relationLabels[edge.relationFamily] ?? "関係"}
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
                    onClick={() => selectNode(node.id)}
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
