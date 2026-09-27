"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { buildLensExplorationLinksByIdentity, hasLensExplorationContext } from "@/domain/lens-packs/exploration-links";
import { projectLensPreset } from "@/domain/lens-packs/projection";
import { resolveLensTopics, selectLensTopic, type ResolvedLensTopic } from "@/domain/lenses/topic-resolver";
import type { ReviewAtlasConnection, ReviewAtlasSpot, ReviewDataset } from "@/domain/review/types";

import styles from "./atlas.module.css";
import { LensSourceDetails } from "./lens-source-details";
import { LensTopicBar } from "./lens-topic-bar";
import { PackRelationshipLens } from "./pack-relationship-lens";

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
  claims,
  selectedSpotId,
  selectedTopicId = "",
  onSelectTopic,
  onSelectSpot,
}: {
  connection?: ReviewAtlasConnection;
  spots: ReviewAtlasSpot[];
  claims: ReviewDataset["claims"];
  selectedSpotId: string;
  selectedTopicId?: string;
  onSelectTopic?: (topicId: string) => void;
  onSelectSpot: (spotId: string) => void;
}) {
  const topics = useMemo(
    () => resolveLensTopics({ perspectiveId: "mythology", claims, spots, selectedSpotId, includeUnvisited: true }),
    [claims, spots, selectedSpotId],
  );

  const selectedTopic = selectLensTopic(topics, selectedTopicId);

  const handleSelectTopic = (topicId: string) => {
    onSelectTopic?.(topicId);
  };

  if (!selectedTopic) {
    return (
      <aside className={styles.genealogyPanel} aria-label="神と系譜レンズ">
        <div className={styles.panelHeader}>
          <div>
            <span className={styles.panelIndex}>LENS</span>
            <h2>神・系譜</h2>
          </div>
        </div>
        <div className={styles.lensEmptyTopic}>
          <strong>この探索範囲に対応する神話・系譜はまだありません</strong>
          <p>神・人物・系譜のKnowledgeへ接続されると、ここに関係図が現れます。</p>
        </div>
      </aside>
    );
  }

  return (
    <div className={styles.contextualLens}>
      <LensTopicBar
        topics={topics}
        selectedTopicId={selectedTopic.id}
        onSelectTopic={handleSelectTopic}
        lensLabel="神・系譜"
      />
      {selectedTopic.renderer === "mythology-genealogy" ? (
        <ResolvedMunakataGenealogy
          topic={selectedTopic}
          spots={spots}
          claims={claims}
          selectedSpotId={selectedSpotId}
          onSelectSpot={onSelectSpot}
        />
      ) : (
        <PackRelationshipLens
          lensLabel="神・系譜"
          topicId={selectedTopic.id}
          claims={claims}
          spots={spots}
          selectedSpotId={selectedSpotId}
          onSelectSpot={onSelectSpot}
        />
      )}
    </div>
  );
}

function ResolvedMunakataGenealogy({
  topic,
  spots,
  claims,
  selectedSpotId,
  onSelectSpot,
}: {
  topic: ResolvedLensTopic;
  spots: ReviewAtlasSpot[];
  claims: ReviewDataset["claims"];
  selectedSpotId: string;
  onSelectSpot: (spotId: string) => void;
}) {
  const projection = useMemo(() => projectLensPreset(topic.pack, topic.presetId), [topic.pack, topic.presetId]);
  const [selectedNodeId, setSelectedNodeId] = useState("munakata-triad");
  const explorationLinks = useMemo(
    () => buildLensExplorationLinksByIdentity(claims, spots, projection.nodes),
    [claims, spots, projection.nodes],
  );
  const selectedNode = projection.nodes.find((node) => node.id === selectedNodeId);
  const selectedEdges = projection.edges.filter(
    (edge) => edge.subjectId === selectedNodeId || edge.objectId === selectedNodeId,
  );
  const selectNode = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    const link = explorationLinks.get(nodeId);
    const linkedSpotId = link?.observedSpotIds[0] ?? link?.spotIds[0];
    if (linkedSpotId) onSelectSpot(linkedSpotId);
  };

  const selectedLink = explorationLinks.get(selectedNodeId);

  return (
    <aside className={styles.genealogyPanel} aria-label="神と系譜レンズ">
      <div className={styles.panelHeader}>
        <div>
          <span className={styles.panelIndex}>LENS</span>
          <h2>神・系譜</h2>
        </div>
        <span>PACK {projection.packVersion} / {projection.status.toUpperCase()}</span>
      </div>

      <div className={styles.genealogyBody}>
        <div className={styles.lensContext}>
          <span>外部知識 × 自分の探索</span>
          <strong>{projection.title}</strong>
          <p>{projection.description}</p>
        </div>

        <svg className={styles.genealogyGraph} viewBox="0 0 600 500" role="img" aria-label="宗像三女神の神話系譜図">
          {projection.edges.map((edge) => {
            const from = positions[edge.subjectId];
            const to = positions[edge.objectId];
            if (!from || !to) return null;
            const connected = edge.subjectId === selectedNodeId || edge.objectId === selectedNodeId;
            return (
              <g key={edge.id} className={styles.genealogyEdge} data-connected={connected}>
                <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} />
                {connected ? (
                  <text x={(from.x + to.x) / 2} y={(from.y + to.y) / 2 - 4} textAnchor="middle">
                    {predicateLabels[edge.predicate] ?? edge.predicate}
                  </text>
                ) : null}
              </g>
            );
          })}

          {projection.nodes.map((node) => {
            const position = positions[node.id];
            if (!position) return null;
            const connected = node.id === selectedNodeId;
            const link = explorationLinks.get(node.id);
            const observed = Boolean(link && link.observedSpotIds.length > 0);
            return (
              <g
                key={node.id}
                className={styles.genealogyNode}
                data-kind={node.kind}
                data-connected={connected}
                data-observed={observed}
                transform={`translate(${position.x}, ${position.y})`}
                onClick={() => selectNode(node.id)}
              >
                <circle r={connected ? 22 : 18} />
                <text y={4} textAnchor="middle">{node.label.slice(0, 4)}</text>
                <text y={32} textAnchor="middle" className={styles.genealogyNodeKind}>
                  {kindLabels[node.kind]}
                </text>
              </g>
            );
          })}
        </svg>

        <section className={styles.genealogyDetails} aria-label="神話ノード詳細">
          <div className={styles.genealogyDetailsHeader}>
            <span className={styles.genealogyDetailsBadge}>{selectedNode ? kindLabels[selectedNode.kind] : ""}</span>
            <h3>{selectedNode?.label}</h3>
          </div>
          <p>{selectedNode?.description}</p>

          <div className={styles.genealogyRelations}>
            <h4>関係する神・史料</h4>
            <ul>
              {selectedEdges.map((edge) => {
                const otherId = edge.subjectId === selectedNodeId ? edge.objectId : edge.subjectId;
                const other = projection.nodes.find((candidate) => candidate.id === otherId);
                return (
                  <li key={edge.id}>
                    <button type="button" onClick={() => selectNode(otherId)}>
                      <span>{predicateLabels[edge.predicate] ?? edge.predicate}</span>
                      <strong>{other?.label}</strong>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className={styles.genealogyExplorationLink}>
            <h4>探索との対応</h4>
            {selectedLink && (selectedLink.claimIds.length > 0 || selectedLink.spotIds.length > 0) ? (
              <div>
                <p>
                  この神話要素は、あなたの探索にある
                  <strong>{selectedLink.spotIds.length}地点</strong>・
                  <strong>{selectedLink.claimIds.length}件の記録</strong>
                  に対応づけられています。
                </p>
                {selectedLink.observedSpotIds[0] ? (
                  <button
                    type="button"
                    className={styles.genealogySpotAction}
                    onClick={() => onSelectSpot(selectedLink.observedSpotIds[0])}
                  >
                    この地点の観察を見る
                  </button>
                ) : null}
              </div>
            ) : (
              <p className={styles.genealogyNoLink}>
                まだこの神話要素に直接結びつく訪問地はありません。
              </p>
            )}
          </div>

          <LensSourceDetails pack={topic.pack} assertions={topic.pack.assertions} />
        </section>
      </div>
    </aside>
  );
}
