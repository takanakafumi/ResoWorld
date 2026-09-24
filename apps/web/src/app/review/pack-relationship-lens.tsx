"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { buildLensExplorationLinksByIdentity } from "@/domain/lens-packs/exploration-links";
import { buildLensTimelineEntries } from "@/domain/lens-packs/assertion-presentation";
import { registeredLensTopics } from "@/domain/lens-packs/knowledge-registry";
import { projectLensPreset } from "@/domain/lens-packs/projection";
import type { LensKnowledgePack } from "@/domain/lens-packs/schema";
import type { ReviewAtlasSpot, ReviewDataset } from "@/domain/review/types";

import styles from "./atlas.module.css";
import { LensSourceDetails } from "./lens-source-details";

const kindLabels: Record<string, string> = { person: "人物", place: "場所", polity: "政治体", group: "集団", concept: "概念", tradition: "信仰・伝統", deity: "神" };
const relationLabels: Record<string, string> = { association: "関係", "historical-context": "歴史的背景", identification: "比定・仮説", influence: "影響", enshrinement: "祭祀", syncretism: "習合" };

export function PackRelationshipLens({ lensLabel = "政治・社会", topicId, claims, spots, selectedSpotId, onSelectSpot }: { lensLabel?: string; topicId: string; claims: ReviewDataset["claims"]; spots: ReviewAtlasSpot[]; selectedSpotId: string; onSelectSpot: (spotId: string) => void }) {
  const topic = registeredLensTopics.find((candidate) => candidate.id === topicId);
  if (!topic) return null;
  const projection = projectLensPreset(topic.pack, topic.presetId);
  return <ProjectedRelationshipLens key={topic.id} lensLabel={lensLabel} topicLabel={topic.label} pack={topic.pack} projection={projection} claims={claims} spots={spots} selectedSpotId={selectedSpotId} onSelectSpot={onSelectSpot} />;
}

function ProjectedRelationshipLens({ lensLabel, topicLabel, pack, projection, claims, spots, selectedSpotId, onSelectSpot }: { lensLabel: string; topicLabel: string; pack: LensKnowledgePack; projection: ReturnType<typeof projectLensPreset>; claims: ReviewDataset["claims"]; spots: ReviewAtlasSpot[]; selectedSpotId: string; onSelectSpot: (spotId: string) => void }) {
  const columns = Math.min(4, Math.max(1, Math.ceil(Math.sqrt(projection.nodes.length))));
  const rows = Math.ceil(projection.nodes.length / columns);
  const graphHeight = Math.max(250, rows * 125 + 70);
  const positions = useMemo(() => new Map(projection.nodes.map((node, index) => [
    node.id,
    { x: 90 + (index % columns) * (540 / Math.max(1, columns - 1)), y: 75 + Math.floor(index / columns) * 125 },
  ])), [columns, projection.nodes]);
  const links = useMemo(() => buildLensExplorationLinksByIdentity(claims, spots, projection.nodes), [claims, spots, projection.nodes]);
  const [selectedNodeId, setSelectedNodeId] = useState(projection.nodes[0]?.id ?? "");
  const selectedNode = projection.nodes.find((node) => node.id === selectedNodeId);
  const selectedEdges = projection.edges.filter((edge) => edge.subjectId === selectedNodeId || edge.objectId === selectedNodeId);
  const selectedLink = links.get(selectedNodeId);
  const timelineEntries = projection.lensType === "timeline"
    ? buildLensTimelineEntries(projection.edges, projection.nodes)
    : [];
  const selectNode = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    const link = links.get(nodeId);
    const spotId = link?.observedSpotIds[0] ?? link?.spotIds[0];
    if (spotId) onSelectSpot(spotId);
  };

  return <aside className={styles.genealogyPanel} aria-label={topicLabel + "レンズ"}>
    <div className={styles.panelHeader}><div><span className={styles.panelIndex}>LENS</span><h2>{lensLabel}</h2></div><span>PACK {projection.packVersion} / {projection.status.toUpperCase()}</span></div>
    <div className={styles.genealogyBody + " " + styles.bakumatsuLensBody}>
      <div className={styles.lensContext}><span>外部知識 × 自分の探索</span><strong>{projection.title}</strong><p>{projection.description}</p></div>
      {timelineEntries.length > 0 ? <ol className={styles.lensTimeline} aria-label={projection.title + "の時系列"}>
        {timelineEntries.map((entry) => <li key={entry.assertionIds.join("-")}>
          <span>{entry.timeLabel}</span>
          <strong>{entry.labels.join("・")}</strong>
          <small>{entry.evidenceLabels.join("・")}</small>
        </li>)}
      </ol> : null}
      <svg className={styles.genealogyGraph + " " + styles.bakumatsuGraph} viewBox={"0 0 720 " + graphHeight} role="img" aria-label={projection.title + "の関係図"}>
        {projection.edges.map((edge) => {
          const from = positions.get(edge.subjectId);
          const to = positions.get(edge.objectId);
          if (!from || !to) return null;
          const connected = edge.subjectId === selectedNodeId || edge.objectId === selectedNodeId;
          const curve = "M" + (from.x + 56) + " " + from.y + " C" + ((from.x + to.x) / 2) + " " + from.y + " " + ((from.x + to.x) / 2) + " " + to.y + " " + (to.x - 56) + " " + to.y;
          return <g key={edge.id} className={styles.bakumatsuEdge} data-family={edge.relationFamily} data-connected={connected}><path d={curve} />{connected ? <text x={(from.x + to.x) / 2} y={(from.y + to.y) / 2 - 7} textAnchor="middle">{relationLabels[edge.relationFamily] ?? "関係"}</text> : null}</g>;
        })}
        {projection.nodes.map((node) => {
          const point = positions.get(node.id);
          if (!point) return null;
          const link = links.get(node.id);
          const selectedFromMap = link?.spotIds.includes(selectedSpotId) ?? false;
          return <g key={node.id} transform={"translate(" + point.x + " " + point.y + ")"} className={styles.genealogyNode} data-kind={node.kind} data-active={node.id === selectedNodeId || selectedFromMap} data-visited={(link?.observedSpotIds.length ?? 0) > 0} data-connected={(link?.spotIds.length ?? 0) > 0} role="button" tabIndex={0} onClick={() => selectNode(node.id)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); selectNode(node.id); } }}><rect x="-58" y="-26" width="116" height="52" rx="7" /><text y="-2" textAnchor="middle">{node.label}</text><text y="15" textAnchor="middle" className={styles.genealogyNodeSub}>{kindLabels[node.kind] ?? node.kind}</text></g>;
        })}
      </svg>
      <section className={styles.lensNodeDetail} aria-label="選択した関係の説明">
        <div><span>{selectedNode ? kindLabels[selectedNode.kind] ?? "知識要素" : "知識要素"}</span><strong>{selectedNode?.label ?? projection.title}</strong></div>
        <p>{selectedEdges.length > 0 ? selectedEdges.map((edge) => relationLabels[edge.relationFamily] ?? "関係").filter((label, index, labels) => labels.indexOf(label) === index).join("・") + "として接続しています。" : "テーマ全体の関係を表示しています。"}</p>
        {(selectedLink?.claimIds.length ?? 0) > 0 ? <ul className={styles.lensClaimList}>{selectedLink!.claimIds.slice(0, 3).map((claimId) => { const claim = claims.find((candidate) => candidate.id === claimId); return claim ? <li key={claimId}><Link href={"/review?view=graph&claim=" + encodeURIComponent(claimId)}>{claim.statement}<span>自分の根拠を見る →</span></Link></li> : null; })}</ul> : null}
        <small>{(selectedLink?.claimIds.length ?? 0) > 0 ? "自分の探索 " + selectedLink!.claimIds.length + "件と接続" : "外部Knowledge Packから補完した接続です"}</small>
        <LensSourceDetails pack={pack} assertions={selectedEdges} />
      </section>
    </div>
  </aside>;
}
