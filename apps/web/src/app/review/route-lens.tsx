"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { buildLensExplorationLinksByIdentity } from "@/domain/lens-packs/exploration-links";
import { projectLensPreset } from "@/domain/lens-packs/projection";
import { resolveLensEntityForSpot } from "@/domain/lens-packs/preset-selection";
import { resolveLensTopics, selectLensTopic, type ResolvedLensTopic } from "@/domain/lenses/topic-resolver";
import type { ReviewAtlasConnection, ReviewAtlasSpot, ReviewDataset } from "@/domain/review/types";

import styles from "./atlas.module.css";
import { LensSourceDetails } from "./lens-source-details";
import { LensTopicBar } from "./lens-topic-bar";
import { PackRelationshipLens } from "./pack-relationship-lens";

const routeIds = [
  "guya-korea",
  "tsushima-state",
  "iki-state",
  "matsuro-state",
  "ito-state",
  "na-state",
  "fumi-state",
  "toma-state",
];

export function RouteLens({
  claims,
  spots,
  selectedSpotId,
  selectedNodeId,
  selectedTopicId = "",
  onSelectTopic,
  onSelectNode,
  onSelectSpot,
  connection,
}: {
  claims: ReviewDataset["claims"];
  spots: ReviewAtlasSpot[];
  selectedSpotId: string;
  selectedNodeId: string;
  selectedTopicId?: string;
  onSelectTopic?: (topicId: string) => void;
  onSelectNode: (nodeId: string) => void;
  onSelectSpot: (spotId: string) => void;
  connection?: ReviewAtlasConnection;
}) {
  const topics = useMemo(
    () => resolveLensTopics({ perspectiveId: "route", claims, spots, selectedSpotId, includeUnvisited: true }),
    [claims, spots, selectedSpotId],
  );
  const selectedTopic = selectLensTopic(topics, selectedTopicId);

  const handleSelectTopic = (topicId: string) => {
    onSelectTopic?.(topicId);
  };

  if (!selectedTopic) {
    return (
      <aside className={styles.genealogyPanel} aria-label="ルートレンズ">
        <div className={styles.panelHeader}>
          <div><span className={styles.panelIndex}>LENS</span><h2>ルート</h2></div>
        </div>
        <div className={styles.lensEmptyTopic}>
          <strong>この探索範囲に対応するルートはまだありません</strong>
          <p>経路や移動に関するKnowledgeへ接続されると、ここにルートが現れます。</p>
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
        lensLabel="ルート"
      />
      {selectedTopic.renderer === "wajinden-route" ? (
        <WajindenRouteTopic
          key={selectedTopic.id}
          selectedTopic={selectedTopic}
          claims={claims}
          spots={spots}
          selectedSpotId={selectedSpotId}
          selectedNodeId={selectedNodeId}
          onSelectNode={onSelectNode}
          onSelectSpot={onSelectSpot}
          connection={connection}
        />
      ) : (
        <PackRelationshipLens
          lensLabel="ルート"
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

function WajindenRouteTopic({ selectedTopic, claims, spots, selectedSpotId, selectedNodeId, onSelectNode, onSelectSpot, connection }: {
  selectedTopic: ResolvedLensTopic;
  claims: ReviewDataset["claims"];
  spots: ReviewAtlasSpot[];
  selectedSpotId: string;
  selectedNodeId: string;
  onSelectNode: (nodeId: string) => void;
  onSelectSpot: (spotId: string) => void;
  connection?: ReviewAtlasConnection;
}) {
  const pack = selectedTopic.pack;
  const projection = useMemo(() => projectLensPreset(pack, selectedTopic.presetId), [pack, selectedTopic.presetId]);
  const nodeById = useMemo(() => new Map(projection.nodes.map((node) => [node.id, node])), [projection.nodes]);
  const explorationLinks = useMemo(
    () => buildLensExplorationLinksByIdentity(claims, spots, projection.nodes),
    [claims, projection.nodes, spots],
  );
  const selectedSpot = spots.find((spot) => spot.id === selectedSpotId);
  const spotEntity = useMemo(
    () => resolveLensEntityForSpot(pack, selectedTopic.presetId, selectedSpot),
    [pack, selectedSpot, selectedTopic.presetId],
  );
  const activeNodeId = selectedNodeId === "route-overview" ? spotEntity?.id ?? selectedNodeId : selectedNodeId;
  const visitedNodes = projection.nodes.filter((node) =>
    explorationLinks.get(node.id)?.spotIds.includes(selectedSpotId),
  );
  const identifications = projection.edges.filter((edge) => edge.relationFamily === "identification");
  const tomaCandidates = identifications
    .filter((edge) => edge.subjectId === "toma-state" && edge.hypothesisGroupId === "toma-location")
    .map((edge) => nodeById.get(edge.objectId))
    .filter((node): node is NonNullable<typeof node> => Boolean(node));
  const selectNode = (nodeId: string) => {
    const link = explorationLinks.get(nodeId);
    const spotId = link?.observedSpotIds[0] ?? link?.spotIds[0];
    if (spotId) onSelectSpot(spotId);
    onSelectNode(nodeId);
  };
  const selectedNode = nodeById.get(activeNodeId);
  const selectedRelations = projection.edges.filter((edge) => edge.subjectId === activeNodeId || edge.objectId === activeNodeId);
  const selectedLink = explorationLinks.get(activeNodeId);

  return (
    <aside className={styles.genealogyPanel} aria-label="魏志倭人伝ルートの再認識レンズ">
      <div className={styles.panelHeader}>
        <div><span className={styles.panelIndex}>LENS</span><h2>ルート</h2></div>
        <span>PACK {projection.packVersion} / DRAFT</span>
      </div>
      <div className={`${styles.genealogyBody} ${styles.routeLensBody}`}>
        {connection ? (
          <section className={styles.lensSelectedConnection} aria-label="選択中の探索接続">
            <span>この探索で選択中の接続</span>
            <strong>{connection.title}</strong>
            <p>{connection.summary}</p>
            <small>{connection.spotIds.length}地点 · {connection.claimIds.length}件の根拠</small>
          </section>
        ) : null}
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
          <div className={styles.routeSectionTitle}><span>02</span><strong>投馬国の位置候補</strong><small>経路を確定しない</small></div>
          <div>
            {tomaCandidates.map((candidate) => (
              <button type="button" key={candidate.id} data-viewpoint="toma" data-active={activeNodeId === candidate.id} onClick={() => selectNode(candidate.id)}>
                <span>候補</span><strong>{candidate.label}</strong><small>代表的な比定説の一つ</small>
              </button>
            ))}
          </div>
        </section>

        <section className={styles.routeHypotheses}>
          <div className={styles.routeSectionTitle}><span>03</span><strong>邪馬台国の位置</strong><small>競合する比定説</small></div>
          <div>
            <button type="button" data-viewpoint="kyushu" data-active={activeNodeId === "northern-kyushu"} onClick={() => selectNode("northern-kyushu")}><span>九州説</span><strong>北部九州の候補地域</strong><small>不弥国以後の行程解釈が分岐</small></button>
            <button type="button" data-viewpoint="kinai" data-active={activeNodeId === "nara-basin"} onClick={() => selectNode("nara-basin")}><span>畿内説</span><strong>奈良盆地周辺</strong><small>距離・方角の解釈が分岐</small></button>
          </div>
        </section>

        {visitedNodes.length > 0 ? (
          <section className={styles.routeVisitContext}>
            <div className={styles.routeSectionTitle}><span>04</span><strong>この訪問地から見る</strong><small>旅行記＋外部Knowledge</small></div>
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
          <LensSourceDetails pack={pack} assertions={selectedRelations} />
        </section>
      </div>
    </aside>
  );
}
