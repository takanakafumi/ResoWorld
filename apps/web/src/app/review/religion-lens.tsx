"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { buildLensExplorationLinksByIdentity } from "@/domain/lens-packs/exploration-links";
import { resolveLensPresetForSpot } from "@/domain/lens-packs/preset-selection";
import { projectLensPreset } from "@/domain/lens-packs/projection";
import { religionRelationsPack } from "@/domain/lens-packs/seed-packs";
import type { ReviewAtlasSpot, ReviewDataset } from "@/domain/review/types";

import styles from "./atlas.module.css";
import { LensSourceDetails } from "./lens-source-details";

type Point = { x: number; y: number };

const presets = religionRelationsPack.presets.map((preset, index) => ({
  id: preset.id,
  index: String(index + 1).padStart(2, "0"),
  shortLabel: preset.label,
  initialNodeId: preset.rootEntityIds[0],
}));

const positions: Record<string, Record<string, Point>> = {
  "religion-history": {
    "ancient-kami-rites": { x: 85, y: 105 },
    shinto: { x: 85, y: 285 },
    "ancient-indian-context": { x: 290, y: 105 },
    buddhism: { x: 230, y: 285 },
    "hindu-traditions": { x: 355, y: 285 },
    "abrahamic-traditions": { x: 515, y: 105 },
    judaism: { x: 445, y: 245 },
    christianity: { x: 515, y: 345 },
    islam: { x: 585, y: 245 },
  },
  "religion-syncretism": {
    "munakata-triad": { x: 75, y: 90 },
    "munakata-taisha": { x: 75, y: 200 },
    shinto: { x: 215, y: 75 },
    buddhism: { x: 435, y: 75 },
    "hachiman-belief": { x: 290, y: 185 },
    "usa-jingu": { x: 175, y: 305 },
    "shinbutsu-shugo": { x: 435, y: 205 },
    shugendo: { x: 565, y: 300 },
    "rokugo-manzan": { x: 430, y: 405 },
    "kunisaki-peninsula": { x: 625, y: 405 },
  },
  "religion-concepts": {
    "greco-roman": { x: 80, y: 100 },
    "hindu-traditions": { x: 220, y: 100 },
    brahman: { x: 355, y: 100 },
    polytheism: { x: 145, y: 240 },
    "nature-veneration": { x: 290, y: 355 },
    animism: { x: 145, y: 400 },
    monotheism: { x: 540, y: 220 },
    judaism: { x: 440, y: 365 },
    christianity: { x: 540, y: 365 },
    islam: { x: 640, y: 365 },
  },
  "regional-sacred-comparison": {
    "regional-sacred-landscapes": { x: 350, y: 70 },
    "munakata-taisha": { x: 105, y: 220 },
    "munakata-triad": { x: 105, y: 370 },
    "usa-jingu": { x: 350, y: 220 },
    "shinbutsu-shugo": { x: 350, y: 370 },
    "kunisaki-peninsula": { x: 595, y: 220 },
    "rokugo-manzan": { x: 595, y: 370 },
  },
};

const kindLabels: Record<string, string> = {
  concept: "比較概念",
  tradition: "宗教伝統",
  group: "関係グループ",
  place: "訪問地",
  event: "祭礼・行事",
};

const relationLabels: Record<string, string> = {
  "historical-context": "歴史的文脈",
  influence: "影響",
  syncretism: "習合・再構成",
  classification: "分析上の分類",
  "conceptual-comparison": "概念比較",
  association: "関連",
  ritual: "祭礼・行事",
};

export function ReligionLens({ claims, spots, selectedSpotId, onSelectSpot }: { claims: ReviewDataset["claims"]; spots: ReviewAtlasSpot[]; selectedSpotId: string; onSelectSpot: (spotId: string) => void }) {
  const selectedSpot = spots.find((spot) => spot.id === selectedSpotId);
  const automaticSelection = useMemo(
    () => resolveLensPresetForSpot(religionRelationsPack, selectedSpot),
    [selectedSpot],
  );
  const [manualSelection, setManualSelection] = useState({ spotId: selectedSpotId, presetId: "", nodeId: "" });
  const currentManualSelection = manualSelection.spotId === selectedSpotId ? manualSelection : undefined;
  const presetId = currentManualSelection?.presetId || automaticSelection?.presetId || "religion-syncretism";
  const projection = useMemo(() => projectLensPreset(religionRelationsPack, presetId), [presetId]);
  const selectedNodeId = currentManualSelection?.nodeId || automaticSelection?.entityId || projection.nodes[0]?.id || "";
  const nodePositions = useMemo(() => {
    const automatic = Object.fromEntries(projection.nodes.map((node, index) => [
      node.id,
      { x: 120 + (index % 3) * 240, y: 90 + Math.floor(index / 3) * 145 },
    ]));
    return { ...automatic, ...(positions[presetId] ?? {}) };
  }, [presetId, projection.nodes]);
  const nodeById = useMemo(() => new Map(projection.nodes.map((node) => [node.id, node])), [projection.nodes]);
  const explorationLinks = useMemo(() => buildLensExplorationLinksByIdentity(claims, spots, projection.nodes), [claims, projection.nodes, spots]);
  const selectedNode = nodeById.get(selectedNodeId);
  const selectedEdges = projection.edges.filter(
    (edge) => edge.subjectId === selectedNodeId || edge.objectId === selectedNodeId,
  );
  const selectPreset = (nextPreset: (typeof presets)[number]) => {
    setManualSelection({ spotId: selectedSpotId, presetId: nextPreset.id, nodeId: nextPreset.initialNodeId });
  };

  return (
    <aside className={styles.genealogyPanel} aria-label="宗教の関係を見直すレンズ">
      <div className={styles.panelHeader}>
        <div><span className={styles.panelIndex}>LENS</span><h2>宗教</h2></div>
        <span>PACK {projection.packVersion} / DRAFT</span>
      </div>
      <div className={`${styles.genealogyBody} ${styles.religionLensBody}`}>
        <div className={styles.lensContext}>
          <span>関係の意味を分けて見る</span>
          <strong>{projection.title}</strong>
          <p>{projection.description}</p>
        </div>

        <nav className={styles.religionPresetTabs} aria-label="宗教関係の表示モード">
          {presets.map((preset) => (
            <button key={preset.id} type="button" data-active={preset.id === presetId} onClick={() => selectPreset(preset)}>
              <span>{preset.index}</span><strong>{preset.shortLabel}</strong>
            </button>
          ))}
        </nav>

        <svg className={`${styles.genealogyGraph} ${styles.religionGraph}`} viewBox="0 0 720 470" role="img" aria-label={`${projection.title}の関係図`}>
          {projection.edges.map((edge) => {
            const from = nodePositions[edge.subjectId];
            const to = nodePositions[edge.objectId];
            if (!from || !to) return null;
            const connected = edge.subjectId === selectedNodeId || edge.objectId === selectedNodeId;
            return (
              <g key={edge.id} className={styles.religionEdge} data-family={edge.relationFamily} data-connected={connected}>
                <path d={`M${from.x} ${from.y + 27} C${from.x} ${(from.y + to.y) / 2} ${to.x} ${(from.y + to.y) / 2} ${to.x} ${to.y - 27}`} />
                {connected ? <text x={(from.x + to.x) / 2} y={(from.y + to.y) / 2 - 6} textAnchor="middle">{relationLabels[edge.relationFamily] ?? edge.predicate}</text> : null}
              </g>
            );
          })}
          {projection.nodes.map((node) => {
            const position = nodePositions[node.id];
            if (!position) return null;
            return (
              <g key={node.id} transform={`translate(${position.x} ${position.y})`} className={styles.genealogyNode} data-kind={node.kind} data-active={node.id === selectedNodeId || (explorationLinks.get(node.id)?.spotIds.includes(selectedSpotId) ?? false)} data-visited={(explorationLinks.get(node.id)?.observedSpotIds.length ?? 0) > 0} data-connected={(explorationLinks.get(node.id)?.spotIds.length ?? 0) > 0} role="button" tabIndex={0} aria-label={`${node.label}を選択`} onClick={() => { setManualSelection({ spotId: selectedSpotId, presetId, nodeId: node.id }); const link = explorationLinks.get(node.id); const spotId = link?.observedSpotIds[0] ?? link?.spotIds[0]; if (spotId) onSelectSpot(spotId); }} onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setManualSelection({ spotId: selectedSpotId, presetId, nodeId: node.id });
                  const link = explorationLinks.get(node.id); const spotId = link?.observedSpotIds[0] ?? link?.spotIds[0];
                  if (spotId) onSelectSpot(spotId);
                }
              }}>
                <rect x="-66" y="-27" width="132" height="54" rx="7" />
                <text y="-2" textAnchor="middle">{node.label}</text>
                <text y="16" textAnchor="middle" className={styles.genealogyNodeSub}>{kindLabels[node.kind] ?? node.kind}</text>
              </g>
            );
          })}
        </svg>

        <div className={styles.religionLegend}>
          <span data-family="historical-context">歴史</span>
          <span data-family="syncretism">習合</span>
          <span data-family="classification">分類</span>
          <span data-family="conceptual-comparison">概念比較</span>
          <span data-family="ritual">祭礼</span>
        </div>

        <section className={styles.lensNodeDetail}>
          <div><span>{selectedNode ? kindLabels[selectedNode.kind] ?? "選択中" : "選択中"}</span><strong>{selectedNode?.label ?? projection.title}</strong></div>
          <p>{selectedEdges.length ? selectedEdges.map((edge) => relationLabels[edge.relationFamily] ?? edge.predicate).filter((label, index, labels) => labels.indexOf(label) === index).join("・") + "として接続しています。" : "この表示では独立した比較基点です。"}</p>
          {selectedNode && (explorationLinks.get(selectedNode.id)?.claimIds.length ?? 0) > 0 ? <ul className={styles.lensClaimList}>{explorationLinks.get(selectedNode.id)!.claimIds.slice(0, 3).map((claimId) => <li key={claimId}><Link href={"/review?view=graph&claim=" + encodeURIComponent(claimId)}>{claims.find((claim) => claim.id === claimId)?.statement}<span>根拠を見る →</span></Link></li>)}</ul> : null}
          <small>関係の種類を切り替えても同じ系譜とは見なしません</small>
          <LensSourceDetails pack={religionRelationsPack} assertions={selectedEdges} />
        </section>
      </div>
    </aside>
  );
}
