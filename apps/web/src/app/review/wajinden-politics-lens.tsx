"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { buildLensExplorationLinksByIdentity } from "@/domain/lens-packs/exploration-links";
import { projectLensPreset } from "@/domain/lens-packs/projection";
import { wajindenRoutesPack } from "@/domain/lens-packs/seed-packs";
import type { ReviewAtlasSpot, ReviewDataset } from "@/domain/review/types";

import styles from "./atlas.module.css";
import { LensSourceDetails } from "./lens-source-details";

const projection = projectLensPreset(wajindenRoutesPack, "wajinden-politics");
const positions: Record<string, { x: number; y: number }> = {
  "wa-polities": { x: 95, y: 90 },
  himiko: { x: 275, y: 90 },
  "yamatai-state": { x: 455, y: 90 },
  "kunu-state": { x: 625, y: 90 },
  ittaisotsu: { x: 95, y: 300 },
  "ito-state": { x: 275, y: 300 },
  nashime: { x: 455, y: 300 },
  wei: { x: 625, y: 300 },
};

const kindLabels: Record<string, string> = {
  person: "人物",
  polity: "国・政治体",
  group: "集団・役職",
};

const predicateLabels: Record<string, string> = {
  established_as_ruler: "共立",
  ruled: "女王",
  dispatched: "遣使",
  visited_as_envoy: "外交使節",
  conferred_title_on: "称号授与",
  stationed_in: "設置",
  oversaw: "検察",
  opposed: "対立",
};

export function WajindenPoliticsLens({
  claims,
  spots,
  selectedSpotId,
  onSelectSpot,
}: {
  claims: ReviewDataset["claims"];
  spots: ReviewAtlasSpot[];
  selectedSpotId: string;
  onSelectSpot: (spotId: string) => void;
}) {
  const [selectedNodeId, setSelectedNodeId] = useState("himiko");
  const explorationLinks = useMemo(
    () => buildLensExplorationLinksByIdentity(claims, spots, projection.nodes),
    [claims, spots],
  );
  const selectedNode = projection.nodes.find((node) => node.id === selectedNodeId);
  const selectedEdges = projection.edges.filter(
    (edge) => edge.subjectId === selectedNodeId || edge.objectId === selectedNodeId,
  );
  const selectedLink = explorationLinks.get(selectedNodeId);
  const selectNode = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    const link = explorationLinks.get(nodeId);
    const spotId = link?.observedSpotIds[0] ?? link?.spotIds[0];
    if (spotId) onSelectSpot(spotId);
  };

  return (
    <aside className={styles.genealogyPanel} aria-label="邪馬台国の政治・社会関係レンズ">
      <div className={styles.panelHeader}>
        <div><span className={styles.panelIndex}>LENS</span><h2>政治・社会</h2></div>
        <span>PACK {projection.packVersion} / {projection.status.toUpperCase()}</span>
      </div>
      <div className={`${styles.genealogyBody} ${styles.bakumatsuLensBody}`}>
        <div className={styles.lensContext}>
          <span>魏志倭人伝 × 自分の探索</span>
          <strong>{projection.title}</strong>
          <p>{projection.description} 史料記述と、その後の所在地説は同じ確定線にしません。</p>
        </div>

        <svg className={`${styles.genealogyGraph} ${styles.bakumatsuGraph} ${styles.wajindenPoliticsGraph}`} viewBox="0 0 720 390" role="img" aria-label="卑弥呼をめぐる統治と外交の関係図">
          <text x="28" y="28" className={styles.bakumatsuLaneLabel}>統治・対立</text>
          <text x="28" y="238" className={styles.bakumatsuLaneLabel}>制度・外交</text>
          {projection.edges.map((edge) => {
            const from = positions[edge.subjectId];
            const to = positions[edge.objectId];
            if (!from || !to) return null;
            const connected = edge.subjectId === selectedNodeId || edge.objectId === selectedNodeId;
            return (
              <g key={edge.id} className={styles.bakumatsuEdge} data-family={edge.relationFamily} data-connected={connected}>
                <path d={`M${from.x + 56} ${from.y} C${(from.x + to.x) / 2} ${from.y} ${(from.x + to.x) / 2} ${to.y} ${to.x - 56} ${to.y}`} />
                {connected ? <text x={(from.x + to.x) / 2} y={(from.y + to.y) / 2 - 8} textAnchor="middle">{predicateLabels[edge.predicate] ?? "関係"}</text> : null}
              </g>
            );
          })}
          {projection.nodes.map((node) => {
            const point = positions[node.id];
            if (!point) return null;
            const link = explorationLinks.get(node.id);
            const selectedFromMap = link?.spotIds.includes(selectedSpotId) ?? false;
            return (
              <g key={node.id} transform={`translate(${point.x} ${point.y})`} className={styles.genealogyNode} data-kind={node.kind} data-active={node.id === selectedNodeId || selectedFromMap} data-visited={(link?.observedSpotIds.length ?? 0) > 0} data-connected={(link?.spotIds.length ?? 0) > 0} role="button" tabIndex={0} onClick={() => selectNode(node.id)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); selectNode(node.id); } }}>
                <rect x="-58" y="-26" width="116" height="52" rx="7" />
                <text y="-2" textAnchor="middle">{node.label}</text>
                <text y="15" textAnchor="middle" className={styles.genealogyNodeSub}>{kindLabels[node.kind] ?? node.kind}</text>
              </g>
            );
          })}
        </svg>

        <section className={styles.lensNodeDetail} aria-label="選択した邪馬台国政治構造の説明">
          <div><span>{selectedNode ? kindLabels[selectedNode.kind] ?? "史料上の要素" : "史料上の要素"}</span><strong>{selectedNode?.label ?? projection.title}</strong></div>
          <p>{selectedEdges.length > 0 ? selectedEdges.map((edge) => predicateLabels[edge.predicate] ?? "関係").filter((label, index, labels) => labels.indexOf(label) === index).join("・") + "として記されています。" : "政治関係を概観しています。"}</p>
          {(selectedLink?.claimIds.length ?? 0) > 0 ? (
            <ul className={styles.lensClaimList}>
              {selectedLink!.claimIds.slice(0, 3).map((claimId) => {
                const claim = claims.find((candidate) => candidate.id === claimId);
                return claim ? <li key={claimId}><Link href={`/review?view=graph&claim=${encodeURIComponent(claimId)}`}>{claim.statement}<span>自分の根拠を見る →</span></Link></li> : null;
              })}
            </ul>
          ) : null}
          <small>{(selectedLink?.claimIds.length ?? 0) > 0 ? `自分の探索 ${selectedLink!.claimIds.length}件と接続` : "外部Knowledge Packから補完した接続です"}</small>
          <LensSourceDetails pack={wajindenRoutesPack} assertions={selectedEdges} />
        </section>
      </div>
    </aside>
  );
}
