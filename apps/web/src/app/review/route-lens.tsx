"use client";

import { useMemo } from "react";

import { projectLensPreset } from "@/domain/lens-packs/projection";
import { wajindenRoutesPack } from "@/domain/lens-packs/seed-packs";
import type { ReviewAtlasSpot } from "@/domain/review/types";

import styles from "./atlas.module.css";

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
  spots,
  selectedNodeId,
  onSelectNode,
  onSelectSpot,
}: {
  spots: ReviewAtlasSpot[];
  selectedNodeId: string;
  onSelectNode: (nodeId: string) => void;
  onSelectSpot: (spotId: string) => void;
}) {
  const nodeById = useMemo(() => new Map(projection.nodes.map((node) => [node.id, node])), []);
  const identifications = projection.edges.filter((edge) => edge.relationFamily === "identification");
  const matchedSpot = (label: string) => spots.find((spot) => spot.name.includes(label) || spot.region.includes(label));
  const selectNode = (nodeId: string) => {
    onSelectNode(nodeId);
    const node = nodeById.get(nodeId);
    if (!node) return;
    const spot = matchedSpot(node.label.replace(/周辺|の候補地域/g, ""));
    if (spot) onSelectSpot(spot.id);
  };
  const selectedNode = nodeById.get(selectedNodeId);
  const selectedRelations = projection.edges.filter((edge) => edge.subjectId === selectedNodeId || edge.objectId === selectedNodeId);

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
                  <button type="button" data-active={selectedNodeId === nodeId} onClick={() => selectNode(nodeId)}>
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
            <button type="button" data-viewpoint="kyushu" data-active={selectedNodeId === "northern-kyushu"} onClick={() => selectNode("northern-kyushu")}><span>九州説</span><strong>北部九州の候補地域</strong><small>不弥国以後の行程解釈が分岐</small></button>
            <button type="button" data-viewpoint="kinai" data-active={selectedNodeId === "nara-basin"} onClick={() => selectNode("nara-basin")}><span>畿内説</span><strong>奈良盆地周辺</strong><small>距離・方角の解釈が分岐</small></button>
          </div>
        </section>

        <section className={styles.lensNodeDetail}>
          <div><span>選択中</span><strong>{selectedNode?.label ?? "ルート全体"}</strong></div>
          <p>{selectedNode ? `${selectedRelations.length}件の経路・比定関係。` : "史料上の経路と競合する比定説を概観中。"}史料記述と学説を同じ確定線にしません。</p>
          <small>{selectedNode ? (matchedSpot(selectedNode.label) ? "地図上の訪問地点と連動できます" : "現在の訪問記録には直接一致する地点がありません") : "地図または右側の項目から地点・学説を選択できます"}</small>
        </section>
      </div>
    </aside>
  );
}
