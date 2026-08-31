"use client";

import { useMemo, useState } from "react";

import type {
  ReviewAtlasConnection,
  ReviewAtlasSpot,
} from "@/domain/review/types";

import styles from "./atlas.module.css";

type LensNode = {
  id: string;
  label: string;
  sublabel: string;
  x: number;
  y: number;
  kind: "deity" | "group" | "place" | "source";
  note: string;
};

const baseNodes: LensNode[] = [
  {
    id: "amaterasu",
    label: "アマテラス",
    sublabel: "天照大御神",
    x: 150,
    y: 88,
    kind: "deity",
    note: "宗像三女神の出現を語る系譜の一方。史料ごとの記述差を残して読みます。",
  },
  {
    id: "susanoo",
    label: "スサノオ",
    sublabel: "須佐之男命",
    x: 410,
    y: 88,
    kind: "deity",
    note: "誓約（うけい）の物語を通じて宗像三女神へつながります。",
  },
  {
    id: "munakata-triad",
    label: "宗像三女神",
    sublabel: "三柱の海上守護神",
    x: 280,
    y: 242,
    kind: "group",
    note: "複数の神・史料・祭祀の場所が交差する中心として表示しています。",
  },
  {
    id: "munakata-place",
    label: "宗像大社",
    sublabel: "訪問地点へ移動",
    x: 280,
    y: 405,
    kind: "place",
    note: "訪問記録と神話的な系譜を接続する地理上の入口です。",
  },
  {
    id: "kojiki",
    label: "古事記",
    sublabel: "史料",
    x: 92,
    y: 350,
    kind: "source",
    note: "関係を確認する参照史料。訪問記録とは分けて管理します。",
  },
  {
    id: "nihon-shoki",
    label: "日本書紀",
    sublabel: "史料",
    x: 468,
    y: 350,
    kind: "source",
    note: "異なる本文・伝承を比較する参照史料。解釈を一つに固定しません。",
  },
];

export function GenealogyLens({
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
      spots.find(
        (spot) =>
          connection?.spotIds.includes(spot.id) && spot.name.includes("宗像"),
      ) ?? spots.find((spot) => connection?.spotIds.includes(spot.id)),
    [connection, spots],
  );
  const [selectedNodeId, setSelectedNodeId] = useState("munakata-triad");
  const selectedNode =
    baseNodes.find((node) => node.id === selectedNodeId) ?? baseNodes[2];

  const selectNode = (node: LensNode) => {
    setSelectedNodeId(node.id);
    if (node.kind === "place" && munakataSpot) onSelectSpot(munakataSpot.id);
  };

  return (
    <aside className={styles.genealogyPanel} aria-label="神と系譜の再認識レンズ">
      <div className={styles.panelHeader}>
        <div>
          <span className={styles.panelIndex}>LENS</span>
          <h2>神・系譜</h2>
        </div>
        <span>REFERENCE / REVIEW NEEDED</span>
      </div>

      <div className={styles.genealogyBody}>
        <div className={styles.lensContext}>
          <span>選択中のつながり</span>
          <strong>{connection?.title ?? "神話のつながり"}</strong>
          <p>地図上の訪問地点を、神・史料・祭祀の関係として読み直します。</p>
        </div>

        <svg
          className={styles.genealogyGraph}
          viewBox="0 0 560 485"
          role="img"
          aria-label="アマテラスとスサノオ、宗像三女神、宗像大社、古事記、日本書紀の関係図"
        >
          <path d="M150 118 C150 175 220 178 250 211" className={styles.genealogyEdge} />
          <path d="M410 118 C410 175 340 178 310 211" className={styles.genealogyEdge} />
          <path d="M280 278 L280 370" className={styles.genealogyEdgeStrong} />
          <path d="M122 350 C180 340 205 292 246 266" className={styles.genealogyEdgeSource} />
          <path d="M438 350 C380 340 355 292 314 266" className={styles.genealogyEdgeSource} />
          <text x="280" y="170" textAnchor="middle" className={styles.genealogyRelation}>誓約（うけい）</text>
          <text x="280" y="331" textAnchor="middle" className={styles.genealogyRelation}>祭祀・鎮座</text>
          {baseNodes.map((node) => {
            const active = node.id === selectedNode.id;
            const visited = node.kind === "place" && munakataSpot?.id === selectedSpotId;
            return (
              <g
                key={node.id}
                transform={`translate(${node.x} ${node.y})`}
                className={styles.genealogyNode}
                data-kind={node.kind}
                data-active={active}
                data-visited={visited}
                role="button"
                tabIndex={0}
                aria-label={`${node.label}を選択`}
                onClick={() => selectNode(node)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    selectNode(node);
                  }
                }}
              >
                <rect x="-68" y="-30" width="136" height="60" rx="7" />
                <text y="-3" textAnchor="middle">{node.label}</text>
                <text y="16" textAnchor="middle" className={styles.genealogyNodeSub}>{node.sublabel}</text>
              </g>
            );
          })}
        </svg>

        <section className={styles.lensNodeDetail}>
          <div>
            <span>{selectedNode.kind === "source" ? "参照史料" : "選択中"}</span>
            <strong>{selectedNode.label}</strong>
          </div>
          <p>{selectedNode.note}</p>
          {selectedNode.kind === "place" && munakataSpot ? (
            <small>地図の「{munakataSpot.name}」と連動</small>
          ) : null}
        </section>
      </div>
    </aside>
  );
}
