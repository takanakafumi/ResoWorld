"use client";

import Link from "next/link";
import { useMemo } from "react";

import { buildLensExplorationLinksByIdentity, hasLensExplorationContext } from "@/domain/lens-packs/exploration-links";
import { projectLensPreset } from "@/domain/lens-packs/projection";
import { resolveLensEntityForSpot } from "@/domain/lens-packs/preset-selection";
import { wajindenRoutesPack } from "@/domain/lens-packs/seed-packs";
import type { ReviewAtlasSpot, ReviewDataset } from "@/domain/review/types";

import styles from "./atlas.module.css";
import { LensSourceDetails } from "./lens-source-details";

const projection = projectLensPreset(wajindenRoutesPack, "wajinden-comparison");
const routeIds = [
  "guya-korea",
  "tsushima-state",
  "iki-state",
  "matsuro-state",
  "ito-state",
  "na-state",
  "fumi-state",
];

export function RouteLens({
  claims,
  spots,
  selectedSpotId,
  selectedNodeId,
  onSelectNode,
  onSelectSpot,
}: {
  claims: ReviewDataset["claims"];
  spots: ReviewAtlasSpot[];
  selectedSpotId: string;
  selectedNodeId: string;
  onSelectNode: (nodeId: string) => void;
  onSelectSpot: (spotId: string) => void;
}) {
  const nodeById = useMemo(() => new Map(projection.nodes.map((node) => [node.id, node])), []);
  const explorationLinks = useMemo(
    () => buildLensExplorationLinksByIdentity(claims, spots, projection.nodes),
    [claims, spots],
  );
  const selectedSpot = spots.find((spot) => spot.id === selectedSpotId);
  const spotEntity = useMemo(
    () => resolveLensEntityForSpot(wajindenRoutesPack, "wajinden-comparison", selectedSpot),
    [selectedSpot],
  );
  const activeNodeId = selectedNodeId === "route-overview" ? spotEntity?.id ?? selectedNodeId : selectedNodeId;
  const visitedNodes = projection.nodes.filter((node) =>
    explorationLinks.get(node.id)?.spotIds.includes(selectedSpotId),
  );
  const identifications = projection.edges.filter((edge) => edge.relationFamily === "identification");
  const selectNode = (nodeId: string) => {
    const link = explorationLinks.get(nodeId);
    const spotId = link?.observedSpotIds[0] ?? link?.spotIds[0];
    if (spotId) onSelectSpot(spotId);
    onSelectNode(nodeId);
  };
  const selectedNode = nodeById.get(activeNodeId);
  const selectedRelations = projection.edges.filter((edge) => edge.subjectId === activeNodeId || edge.objectId === activeNodeId);
  const selectedLink = explorationLinks.get(activeNodeId);

  if (!hasLensExplorationContext(explorationLinks)) {
    return <aside className={styles.genealogyPanel} aria-label="ルートレンズ"><div className={styles.panelHeader}><div><span className={styles.panelIndex}>LENS</span><h2>ルート</h2></div></div><div className={styles.lensEmptyTopic}><strong>この探索範囲に対応するルートはまだありません</strong><p>現在の訪問やClaimはそのまま保持されています。経路や移動に関するKnowledgeへ接続されると、ここにルートが現れます。</p></div></aside>;
  }

  return (
    <aside className={styles.genealogyPanel} aria-label="魏志倭人伝ルートの再認識レンズ">
      <div className={styles.panelHeader}>
        <div><span className={styles.panelIndex}>LENS</span><h2>ルート</h2></div>
        <span>PACK {projection.packVersion} / DRAFT</span>
      </div>
      <div className={`${styles.genealogyBody} ${styles.routeLensBody}`}>
        <div className={styles.lensContext}>
          <span>魏志倭人伝</span>
          <strong>{projection.title}</strong>
          <p>史料上の記述順と、現代地名への比定、競合する所在地説を分けて表示します。</p>
        </div>

        <section className={styles.routeSequence} aria-label="史料上の主経路">
          <div className={styles.routeSectionTitle}><span>01</span><strong>史料上の記述順</strong><small>実線</small></div>
          <ol>
            {routeIds.map((nodeId, index) => {
              const node = nodeById.get(nodeId);
              if (!node) return null;
              const candidates = identifications.filter((edge) => edge.subjectId === nodeId).map((edge) => nodeById.get(edge.objectId)).filter(Boolean);
              return (
                <li key={nodeId}>
                  <button type="button" data-active={activeNodeId === nodeId} onClick={() => selectNode(nodeId)}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <strong>{node.label}</strong>
                    <small>{candidates.length ? candidates.map((item) => item?.label).join(" / ") : "現代比定を未登録"}</small>
                  </button>
                </li>
              );
            })}
          </ol>
        </section>

        <section className={styles.routeHypotheses}>
          <div className={styles.routeSectionTitle}><span>02</span><strong>邪馬台国の位置</strong><small>競合する比定説</small></div>
          <div>
            <button type="button" data-viewpoint="kyushu" data-active={activeNodeId === "northern-kyushu"} onClick={() => selectNode("northern-kyushu")}><span>九州説</span><strong>北部九州の候補地域</strong><small>不弥国以後の行程解釈が分岐</small></button>
            <button type="button" data-viewpoint="kinai" data-active={activeNodeId === "nara-basin"} onClick={() => selectNode("nara-basin")}><span>畿内説</span><strong>奈良盆地周辺</strong><small>距離・方角の解釈が分岐</small></button>
          </div>
        </section>

        {visitedNodes.length > 0 ? (
          <section className={styles.routeVisitContext}>
            <div className={styles.routeSectionTitle}><span>03</span><strong>この訪問地から見る</strong><small>旅行記＋外部Knowledge</small></div>
            <div>{visitedNodes.slice(0, 6).map((node) => (
              <button type="button" key={node.id} data-active={activeNodeId === node.id} onClick={() => selectNode(node.id)}>{node.label}</button>
            ))}</div>
          </section>
        ) : null}

        <section className={styles.lensNodeDetail}>
          <div><span>選択中</span><strong>{selectedNode?.label ?? "ルート全体"}</strong></div>
          <p>{selectedNode ? `${selectedRelations.length}件の経路・比定関係。` : "史料上の経路と競合する比定説を概観中。"}史料記述と学説を同じ確定線にしません。</p>
          {(selectedLink?.claimIds.length ?? 0) > 0 ? (
            <ul className={styles.lensClaimList}>
              {selectedLink!.claimIds.slice(0, 3).map((claimId) => {
                const claim = claims.find((candidate) => candidate.id === claimId);
                return claim ? (
                  <li key={claimId}>
                    <Link href={`/review?view=graph&claim=${encodeURIComponent(claimId)}`}>
                      {claim.statement}<span>自分の根拠を見る →</span>
                    </Link>
                  </li>
                ) : null;
              })}
            </ul>
          ) : null}
          <small>{selectedNode ? ((selectedLink?.spotIds.length ?? 0) > 0 ? "Entity接続を介して訪問地点と連動できます" : "現在の訪問記録には直接一致する地点がありません") : "地図または右側の項目から地点・学説を選択できます"}</small>
          <LensSourceDetails pack={wajindenRoutesPack} assertions={selectedRelations} />
        </section>
      </div>
    </aside>
  );
}
