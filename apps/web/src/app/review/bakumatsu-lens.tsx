"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { hagiBakumatsuPack } from "@/domain/lens-packs/bakumatsu-pack";
import { buildLensExplorationLinksByIdentity } from "@/domain/lens-packs/exploration-links";
import { projectLensPreset } from "@/domain/lens-packs/projection";
import { buildBakumatsuThreads } from "@/domain/lenses/bakumatsu";
import { matchLensNodeForCandidate } from "@/domain/lenses/candidate-matching";
import type { ReviewAtlasSpot, ReviewDataset, ReviewExplorationSuggestion } from "@/domain/review/types";

import styles from "./atlas.module.css";
import { LensSourceDetails } from "./lens-source-details";

const projection = projectLensPreset(hagiBakumatsuPack, "bakumatsu-structure");
const positions: Record<string, { x: number; y: number }> = {
  meirinkan: { x: 85, y: 70 }, "yoshida-shoin": { x: 245, y: 70 }, shokasonjuku: { x: 405, y: 70 }, "takasugi-shinsaku": { x: 565, y: 70 },
  "coastal-defense": { x: 75, y: 270 }, "hagi-domain": { x: 205, y: 270 }, "western-knowledge": { x: 335, y: 270 },
  "hagi-reverberatory-furnace": { x: 465, y: 220 }, "ebisugahana-shipyard": { x: 465, y: 330 }, "kido-takayoshi": { x: 335, y: 385 }, "hagi-modernization": { x: 625, y: 270 },
};
const kindLabels: Record<string, string> = { person: "人物", place: "場所", polity: "藩", concept: "背景・概念" };
const relationLabels: Record<string, string> = { association: "所属・関与", influence: "影響・学習", "historical-context": "歴史的背景" };

export function BakumatsuLens({
  claims,
  spots,
  selectedSpotId,
  selectedNodeId: requestedNodeId = "",
  selectedSuggestion,
  onSelectSpot,
  onSelectNode,
  onSelectSuggestion,
}: {
  claims: ReviewDataset["claims"];
  spots: ReviewAtlasSpot[];
  selectedSpotId: string;
  selectedNodeId?: string;
  selectedSuggestion?: ReviewExplorationSuggestion;
  onSelectSpot: (spotId: string) => void;
  onSelectNode?: (nodeId: string) => void;
  onSelectSuggestion?: (suggestionId: string) => void;
}) {
  const threads = useMemo(() => buildBakumatsuThreads(claims), [claims]);
  const explorationLinks = useMemo(
    () => buildLensExplorationLinksByIdentity(claims, spots, projection.nodes),
    [claims, spots],
  );

  const matchedCandidate = useMemo(
    () => matchLensNodeForCandidate(projection.nodes, selectedSuggestion),
    [selectedSuggestion],
  );
  const matchedSuggestionNodeId = matchedCandidate?.id;

  const [internalSelectedNodeId, setInternalSelectedNodeId] = useState("");

  useEffect(() => {
    setInternalSelectedNodeId("");
  }, [selectedSuggestion?.id, selectedSpotId]);

  const activeNodeId = useMemo(() => {
    if (internalSelectedNodeId && projection.nodes.some((n) => n.id === internalSelectedNodeId)) {
      return internalSelectedNodeId;
    }
    if (matchedSuggestionNodeId) {
      return matchedSuggestionNodeId;
    }
    if (requestedNodeId && projection.nodes.some((n) => n.id === requestedNodeId)) {
      return requestedNodeId;
    }
    return "hagi-modernization";
  }, [internalSelectedNodeId, matchedSuggestionNodeId, requestedNodeId]);

  const [selectedThreadId, setSelectedThreadId] = useState(threads[0]?.id ?? "education");
  const selectedThread = threads.find((thread) => thread.id === selectedThreadId) ?? threads[0];
  const selectedNode = projection.nodes.find((node) => node.id === activeNodeId);
  const selectedLink = selectedNode ? explorationLinks.get(selectedNode.id) : undefined;
  const selectedEdges = projection.edges.filter((edge) => edge.subjectId === activeNodeId || edge.objectId === activeNodeId);
  const selectedThreadClaimIds = new Set(selectedThread?.claimIds ?? []);
  const linkedSpots = spots.filter((spot) => spot.claimIds.some((claimId) => selectedThreadClaimIds.has(claimId)));
  const linkedClaims = (selectedThread?.claimIds ?? []).map((id) => claims.find((claim) => claim.id === id)).filter((claim): claim is ReviewDataset["claims"][number] => Boolean(claim));
  
  const selectNode = (nodeId: string) => {
    setInternalSelectedNodeId(nodeId);
    onSelectNode?.(nodeId);
    const link = explorationLinks.get(nodeId);
    const linkedSpotId = link?.observedSpotIds[0] ?? link?.spotIds[0];
    if (linkedSpotId) onSelectSpot(linkedSpotId);
  };

  return <aside className={styles.genealogyPanel} aria-label="幕末の再認識レンズ">
    <div className={styles.panelHeader}><div><span className={styles.panelIndex}>LENS</span><h2>幕末</h2></div><span>PACK {projection.packVersion} / {projection.status.toUpperCase()}</span></div>
    <div className={`${styles.genealogyBody} ${styles.bakumatsuLensBody}`}>
      <div className={styles.lensContext}><span>外部知識 × 自分の探索</span><strong>{projection.title}</strong><p>{projection.description}</p></div>
      <svg className={`${styles.genealogyGraph} ${styles.bakumatsuGraph}`} viewBox="0 0 720 455" role="img" aria-label="萩の幕末における人材形成と近代化の関係図">
        <text x="28" y="24" className={styles.bakumatsuLaneLabel}>人材形成</text><text x="28" y="205" className={styles.bakumatsuLaneLabel}>海防・技術・近代化</text>
        {projection.edges.map((edge) => { const from=positions[edge.subjectId]; const to=positions[edge.objectId]; if(!from||!to)return null; const connected=edge.subjectId===activeNodeId||edge.objectId===activeNodeId; return <g key={edge.id} className={styles.bakumatsuEdge} data-family={edge.relationFamily} data-connected={connected}><path d={`M${from.x+56} ${from.y} C${(from.x+to.x)/2} ${from.y} ${(from.x+to.x)/2} ${to.y} ${to.x-56} ${to.y}`} />{connected?<text x={(from.x+to.x)/2} y={(from.y+to.y)/2-7} textAnchor="middle">{relationLabels[edge.relationFamily]}</text>:null}</g>; })}
        {projection.nodes.map((node) => {
          const point=positions[node.id];
          if(!point)return null;
          const link=explorationLinks.get(node.id);
          const visited=(link?.observedSpotIds.length??0)>0;
          const connected=(link?.spotIds.length??0)>0;
          const selectedFromMap=link?.spotIds.includes(selectedSpotId)??false;
          const isCandidate=node.id===matchedSuggestionNodeId;
          return <g key={node.id} transform={`translate(${point.x} ${point.y})`} className={styles.genealogyNode} data-kind={node.kind} data-active={node.id===activeNodeId||selectedFromMap} data-visited={visited} data-connected={connected} data-candidate-active={isCandidate} role="button" tabIndex={0} onClick={()=>selectNode(node.id)} onKeyDown={(event)=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();selectNode(node.id);}}}><rect x="-58" y="-26" width="116" height="52" rx="7" data-candidate-active={isCandidate}/><text y="-2" textAnchor="middle">{node.label}</text><text y="15" textAnchor="middle" className={styles.genealogyNodeSub}>{kindLabels[node.kind]??node.kind}</text></g>;
        })}
      </svg>
      <section className={styles.lensNodeDetail} aria-label="選択した幕末構造の説明">
        {selectedSuggestion ? (
          <div className={styles.lensCandidateCallout}>
            <div className={styles.lensCandidateCalloutHeader}>
              <span>⚑ MAP選択中の候補地</span>
              <strong>{selectedSuggestion.title}</strong>
            </div>
            <p>{selectedSuggestion.reason}</p>
            {selectedSuggestion.question ? (
              <small>問い: {selectedSuggestion.question}</small>
            ) : null}
          </div>
        ) : null}

        <div>
          <span>{selectedNode?kindLabels[selectedNode.kind]??"外部知識":"外部知識"}</span>
          {selectedNode?.id === matchedSuggestionNodeId ? (
            <span className={styles.lensCandidateBadge}>⚑ MAP選択中</span>
          ) : null}
          <strong>{selectedNode?.label??projection.title}</strong>
        </div>
        <p>{selectedEdges.length?selectedEdges.map((edge)=>relationLabels[edge.relationFamily]).filter((label,index,labels)=>labels.indexOf(label)===index).join("・")+"として接続しています。":"二つの流れを横断して見ています。"}</p>{(selectedLink?.claimIds.length??0)>0?<ul className={styles.lensClaimList}>{selectedLink!.claimIds.slice(0,3).map((claimId)=>{const claim=claims.find((candidate)=>candidate.id===claimId);return claim?<li key={claimId}><Link href={`/review?view=graph&claim=${encodeURIComponent(claimId)}`}>{claim.statement}<span>自分の根拠を見る →</span></Link></li>:null;})}</ul>:null}<small>{(selectedLink?.claimIds.length??0)>0?`自分の探索 ${selectedLink!.claimIds.length}件と接続`:`外部Knowledge Packから広がる接続です`}</small><LensSourceDetails pack={hagiBakumatsuPack} assertions={selectedEdges}/>
      </section>
      <nav className={styles.bakumatsuThreads} aria-label="自分の探索から見た幕末テーマ">{threads.map((thread)=><button key={thread.id} type="button" data-active={thread.id===selectedThread?.id} onClick={()=>setSelectedThreadId(thread.id)}><span>{thread.index}</span><strong>{thread.label}</strong><small>{thread.claimIds.length} MY CLAIMS</small></button>)}</nav>
      {selectedThread?<section className={styles.bakumatsuDetail}><div><span>MY EXPLORATION / {selectedThread.index}</span><h3>{selectedThread.label}</h3></div><p>{selectedThread.description}</p><div className={styles.bakumatsuPlaces}>{linkedSpots.map((spot)=><button type="button" key={spot.id} onClick={()=>onSelectSpot(spot.id)}>{spot.name}<small>地図へ →</small></button>)}</div><ul className={styles.lensClaimList}>{linkedClaims.slice(0,4).map((claim)=><li key={claim.id}><Link href={`/review?view=graph&claim=${encodeURIComponent(claim.id)}`}>{claim.statement}<span>自分の根拠を見る →</span></Link></li>)}</ul></section>:null}
    </div>
  </aside>;
}
