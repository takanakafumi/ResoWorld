"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { buildLensExplorationLinksByIdentity } from "@/domain/lens-packs/exploration-links";
import { ishinFiguresPack } from "@/domain/lens-packs/ishin-figures-pack";
import { projectLensPreset } from "@/domain/lens-packs/projection";
import type { ReviewAtlasSpot, ReviewDataset } from "@/domain/review/types";

import styles from "./atlas.module.css";
import { LensSourceDetails } from "./lens-source-details";

const projection = projectLensPreset(ishinFiguresPack, "ishin-network");
const positions: Record<string, { x: number; y: number }> = {
  meirinkan: { x: 80, y: 80 },
  "yoshida-shoin": { x: 220, y: 80 },
  shokasonjuku: { x: 360, y: 80 },
  "takasugi-shinsaku": { x: 515, y: 80 },
  "choshu-domain": { x: 120, y: 245 },
  "kido-takayoshi": { x: 285, y: 245 },
  shimonoseki: { x: 515, y: 245 },
  "sakamoto-ryoma": { x: 420, y: 365 },
  "satcho-alliance": { x: 285, y: 365 },
  "saigo-takamori": { x: 145, y: 455 },
  "satsuma-domain": { x: 50, y: 455 },
  "tosa-domain": { x: 570, y: 455 },
};
const kindLabels: Record<string, string> = {
  person: "人物",
  polity: "藩",
  event: "交渉・事件",
  place: "場所",
};
const relationLabels: Record<string, string> = {
  association: "所属・連絡・仲介",
  influence: "教育・影響",
  "historical-context": "盟約への関与",
};

export function IshinFiguresLens({
  spots,
  claims,
  selectedSpotId,
  onSelectSpot,
}: {
  spots: ReviewAtlasSpot[];
  claims: ReviewDataset["claims"];
  selectedSpotId: string;
  onSelectSpot: (spotId: string) => void;
}) {
  const [selectedNodeId, setSelectedNodeId] = useState("kido-takayoshi");
  const explorationLinks = useMemo(
    () => buildLensExplorationLinksByIdentity(claims, spots, projection.nodes),
    [claims, spots],
  );
  const selectedNode = projection.nodes.find((node) => node.id === selectedNodeId);
  const selectedEdges = projection.edges.filter(
    (edge) => edge.subjectId === selectedNodeId || edge.objectId === selectedNodeId,
  );
  const selectedLink = selectedNode ? explorationLinks.get(selectedNode.id) : undefined;

  const selectNode = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    const link = explorationLinks.get(nodeId);
    const linkedSpotId = link?.observedSpotIds[0] ?? link?.spotIds[0];
    if (linkedSpotId) onSelectSpot(linkedSpotId);
  };

  return (
    <aside className={styles.genealogyPanel} aria-label="維新志士の人物関係レンズ">
      <div className={styles.panelHeader}>
        <div><span className={styles.panelIndex}>LENS</span><h2>維新志士</h2></div>
        <span>PACK {projection.packVersion} / {projection.status.toUpperCase()}</span>
      </div>
      <div className={`${styles.genealogyBody} ${styles.ishinLensBody}`}>
        <div className={styles.lensContext}>
          <span>萩から外へ伸びる人物網</span>
          <strong>{projection.title}</strong>
          <p>{projection.description}</p>
        </div>
        <svg className={`${styles.genealogyGraph} ${styles.ishinGraph}`} viewBox="0 0 640 520" role="img" aria-label="維新志士と藩・薩長同盟・下関の接続図">
          <text x="24" y="28" className={styles.bakumatsuLaneLabel}>萩の教育・長州</text>
          <text x="24" y="330" className={styles.bakumatsuLaneLabel}>藩を越える交渉・盟約</text>
          {projection.edges.map((edge) => {
            const from = positions[edge.subjectId];
            const to = positions[edge.objectId];
            if (!from || !to) return null;
            const connected = edge.subjectId === selectedNodeId || edge.objectId === selectedNodeId;
            return <g key={edge.id} className={styles.ishinEdge} data-family={edge.relationFamily} data-connected={connected}>
              <path d={`M${from.x} ${from.y + 26} C${from.x} ${(from.y + to.y) / 2} ${to.x} ${(from.y + to.y) / 2} ${to.x} ${to.y - 26}`} />
              {connected ? <text x={(from.x + to.x) / 2} y={(from.y + to.y) / 2 - 6} textAnchor="middle">{relationLabels[edge.relationFamily]}</text> : null}
            </g>;
          })}
          {projection.nodes.map((node) => {
            const point = positions[node.id];
            if (!point) return null;
            const link = explorationLinks.get(node.id);
            const visited = (link?.observedSpotIds.length ?? 0) > 0;
            const selectedFromMap = link?.spotIds.includes(selectedSpotId) ?? false;
            return <g key={node.id} transform={`translate(${point.x} ${point.y})`} className={styles.genealogyNode} data-kind={node.kind} data-active={node.id === selectedNodeId || selectedFromMap} data-visited={visited} role="button" tabIndex={0} aria-label={`${node.label}を選択`} onClick={() => selectNode(node.id)} onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                selectNode(node.id);
              }
            }}>
              <rect x="-57" y="-26" width="114" height="52" rx="7" />
              <text y="-2" textAnchor="middle">{node.label}</text>
              <text y="15" textAnchor="middle" className={styles.genealogyNodeSub}>{kindLabels[node.kind] ?? node.kind}</text>
            </g>;
          })}
        </svg>
        <div className={styles.ishinLegend}>
          <span data-family="influence">教育・影響</span><span data-family="association">所属・連絡・仲介</span><span data-family="historical-context">盟約への関与</span><span data-kind="visited">訪問から接続</span>
        </div>
        <section className={styles.lensNodeDetail}>
          <div><span>{selectedNode ? kindLabels[selectedNode.kind] ?? "選択中" : "選択中"}</span><strong>{selectedNode?.label ?? projection.title}</strong></div>
          <p>{selectedEdges.length ? selectedEdges.map((edge) => relationLabels[edge.relationFamily]).filter((label, index, labels) => labels.indexOf(label) === index).join("・") + "の関係を表示しています。" : "人物網全体を表示しています。"}</p>
          {(selectedLink?.claimIds.length ?? 0) > 0 ? <ul className={styles.lensClaimList}>{selectedLink!.claimIds.slice(0, 4).map((claimId) => {
            const claim = claims.find((candidate) => candidate.id === claimId);
            return claim ? <li key={claimId}><Link href={`/review?view=graph&claim=${encodeURIComponent(claimId)}`}>{claim.statement}<span>自分の根拠を見る →</span></Link></li> : null;
          })}</ul> : null}
          <small>{(selectedLink?.claimIds.length ?? 0) > 0 ? `自分の探索 ${selectedLink!.claimIds.length}件と接続` : "外部Knowledge Packから広がる接続です"}</small>
          <LensSourceDetails pack={ishinFiguresPack} assertions={selectedEdges} />
        </section>
      </div>
    </aside>
  );
}
