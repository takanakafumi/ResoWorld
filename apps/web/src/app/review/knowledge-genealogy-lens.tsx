"use client";

import { useMemo, useState } from "react";

import { projectLensPreset } from "@/domain/lens-packs/projection";
import { japaneseMythologyPack } from "@/domain/lens-packs/seed-packs";
import type { ReviewAtlasConnection, ReviewAtlasSpot } from "@/domain/review/types";

import styles from "./atlas.module.css";

const projection = projectLensPreset(japaneseMythologyPack, "munakata-connections");
const positions: Record<string, { x: number; y: number }> = {
  amaterasu: { x: 120, y: 62 },
  susanoo: { x: 440, y: 62 },
  ukei: { x: 280, y: 145 },
  "munakata-triad": { x: 280, y: 242 },
  "kojiki-text": { x: 92, y: 350 },
  "nihon-shoki-text": { x: 468, y: 350 },
  "munakata-taisha": { x: 280, y: 420 },
};
const kindLabels: Record<string, string> = {
  deity: "神",
  event: "神話上の出来事",
  group: "神群",
  place: "祭祀地",
  text: "史料",
};
const predicateLabels: Record<string, string> = {
  participates_in: "関与",
  gives_birth_to: "生成・出生",
  enshrined_at: "祭祀・鎮座",
  attested_in: "史料記載",
};

export function KnowledgeGenealogyLens({
  connection,
  spots,
  selectedSpotId,
  onSelectSpot,
}: {
  connection?: ReviewAtlasConnection;
  spots: ReviewAtlasSpot[];
  selectedSpotId: string;
  onSelectSpot: (spotId: string) => void;
}) {
  const munakataSpot = useMemo(
    () =>
      spots.find((spot) => connection?.spotIds.includes(spot.id) && spot.name.includes("宗像")) ??
      spots.find((spot) => connection?.spotIds.includes(spot.id)),
    [connection, spots],
  );
  const [selectedNodeId, setSelectedNodeId] = useState("munakata-triad");
  const selectedNode = projection.nodes.find((node) => node.id === selectedNodeId);
  const selectedEdges = projection.edges.filter(
    (edge) => edge.subjectId === selectedNodeId || edge.objectId === selectedNodeId,
  );
  const sourceTitles = Array.from(
    new Set(
      selectedEdges.flatMap((edge) =>
        edge.sourceIds.map(
          (sourceId) =>
            japaneseMythologyPack.sources.find((source) => source.id === sourceId)?.title ?? sourceId,
        ),
      ),
    ),
  );

  const selectNode = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    if (nodeId === "munakata-taisha" && munakataSpot) onSelectSpot(munakataSpot.id);
  };

  return (
    <aside className={styles.genealogyPanel} aria-label="神と系譜の再認識レンズ">
      <div className={styles.panelHeader}>
        <div><span className={styles.panelIndex}>LENS</span><h2>神・系譜</h2></div>
        <span>PACK {projection.packVersion} / DRAFT</span>
      </div>
      <div className={styles.genealogyBody}>
        <div className={styles.lensContext}>
          <span>選択中のつながり</span>
          <strong>{connection?.title ?? projection.title}</strong>
          <p>{projection.description}</p>
        </div>
        <svg className={styles.genealogyGraph} viewBox="0 0 560 485" role="img" aria-label="知識パックから投影した宗像三女神の関係図">
          {projection.edges.map((edge) => {
            const from = positions[edge.subjectId];
            const to = positions[edge.objectId];
            if (!from || !to) return null;
            const edgeClass = edge.relationFamily === "textual-attestation"
              ? styles.genealogyEdgeSource
              : edge.relationFamily === "enshrinement"
                ? styles.genealogyEdgeStrong
                : styles.genealogyEdge;
            return <path key={edge.id} d={`M${from.x} ${from.y + 30} C${from.x} ${(from.y + to.y) / 2} ${to.x} ${(from.y + to.y) / 2} ${to.x} ${to.y - 30}`} className={edgeClass} />;
          })}
          {projection.nodes.map((node) => {
            const position = positions[node.id];
            if (!position) return null;
            const visited = node.id === "munakata-taisha" && munakataSpot?.id === selectedSpotId;
            return (
              <g key={node.id} transform={`translate(${position.x} ${position.y})`} className={styles.genealogyNode} data-kind={node.kind === "text" ? "source" : node.kind} data-active={node.id === selectedNodeId} data-visited={visited} role="button" tabIndex={0} aria-label={`${node.label}を選択`} onClick={() => selectNode(node.id)} onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  selectNode(node.id);
                }
              }}>
                <rect x="-68" y="-30" width="136" height="60" rx="7" />
                <text y="-3" textAnchor="middle">{node.label}</text>
                <text y="16" textAnchor="middle" className={styles.genealogyNodeSub}>{node.aliases[0] ?? kindLabels[node.kind] ?? node.kind}</text>
              </g>
            );
          })}
        </svg>
        {selectedNode ? (
          <section className={styles.lensNodeDetail}>
            <div><span>{kindLabels[selectedNode.kind] ?? "選択中"}</span><strong>{selectedNode.label}</strong></div>
            <p>{selectedEdges.map((edge) => predicateLabels[edge.predicate] ?? edge.predicate).filter((label, index, labels) => labels.indexOf(label) === index).join("・")}の関係を表示しています。</p>
            <small>{sourceTitles.length ? `根拠候補: ${sourceTitles.join(" / ")}` : "参照情報はレビュー待ちです"}{selectedNode.id === "munakata-taisha" && munakataSpot ? ` · 地図の「${munakataSpot.name}」と連動` : ""}</small>
          </section>
        ) : null}
      </div>
    </aside>
  );
}
