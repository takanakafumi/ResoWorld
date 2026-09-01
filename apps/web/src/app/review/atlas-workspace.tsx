"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";

import { hasBakumatsuLensMaterial } from "@/domain/lenses/bakumatsu";
import type {
  ReviewAtlas,
  ReviewAtlasConnection,
  ReviewDataset,
} from "@/domain/review/types";

import {
  dominantFacet,
  EraSelector,
  FacetCloud,
  facetColor,
} from "./atlas-lenses";
import {
  SuggestionDrawer,
  SuggestionPanel,
  SuggestionQueue,
  useSuggestionStatuses,
} from "./exploration-suggestions";
import { KnowledgeGenealogyLens } from "./knowledge-genealogy-lens";
import { ReligionLens } from "./religion-lens";
import { RouteLens } from "./route-lens";
import { AtlasMap } from "./atlas-map";
import { BakumatsuLens } from "./bakumatsu-lens";
import { IshinFiguresLens } from "./ishin-figures-lens";
import styles from "./atlas.module.css";


const recognitionLensDefinitions = [
  { id: "overview", label: "訪問マップ", facetIds: [] },
  { id: "mythology", label: "神・系譜", facetIds: ["myth"] },
  { id: "religion", label: "宗教", facetIds: ["belief", "ritual"] },
  { id: "route", label: "ルート", facetIds: ["exchange"] },
  { id: "politics", label: "政治・社会", facetIds: ["politics", "military", "society"] },
  { id: "bakumatsu", label: "幕末", facetIds: ["politics", "military", "society"] },
  { id: "restoration-figures", label: "維新志士", facetIds: ["politics", "military", "society"] },
  { id: "landscape", label: "地形・聖域", facetIds: ["landscape"] },
  { id: "chronology", label: "時代", facetIds: [] },
] as const;

type PositionStatus = "candidate" | "confirmed" | "rejected";

function usePositionStatuses(datasetId: string) {
  const storageKey = `resoworld-place-positions:${datasetId}`;
  const [statuses, setStatuses] = useState<Record<string, PositionStatus>>({});
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) setStatuses(JSON.parse(stored) as Record<string, PositionStatus>);
      } catch {
        // A damaged local preference must not block the review workspace.
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [storageKey]);
  const updateStatus = (spotId: string, status: PositionStatus) => {
    setStatuses((current) => {
      const next = { ...current, [spotId]: status };
      localStorage.setItem(storageKey, JSON.stringify(next));
      return next;
    });
  };
  return { statuses, updateStatus };
}

function makeFallbackAtlas(dataset: ReviewDataset): ReviewAtlas {
  return {
    title: `${dataset.documents.length}件の記録・位置未確認`,
    spots: [],
    connections: [],
    suggestions: [],
  };
}

function historicalTimeLabel(
  value: ReviewDataset["claims"][number]["historicalTime"],
) {
  if (!value) return "現地体験・問い";
  if (value.kind === "calendar") {
    return value.endYear
      ? `${value.startYear}–${value.endYear}年`
      : `${value.startYear}年`;
  }
  return value.label || "時代未確定";
}


const natureLabels: Record<string, string> = {
  Observation: "現地観察",
  HistoricalSource: "歴史史料",
  Archaeology: "考古学",
  Tradition: "伝承",
  UserHypothesis: "自分の仮説",
  Alternative: "異説",
  AISuggestion: "AIによる整理",
};

export function AtlasWorkspace({ dataset }: { dataset: ReviewDataset }) {
  const atlas = useMemo(
    () => dataset.atlas ?? makeFallbackAtlas(dataset),
    [dataset],
  );
  const { statuses: positionStatuses, updateStatus: updatePositionStatus } =
    usePositionStatuses(dataset.datasetId);
  const displaySpots = useMemo(
    () => atlas.spots.map((spot) => ({
      ...spot,
      positionStatus: positionStatuses[spot.id] ?? spot.positionStatus ?? "confirmed",
    })),
    [atlas.spots, positionStatuses],
  );
  const [selectedSpotId, setSelectedSpotId] = useState(
    atlas.spots[0]?.id ?? "",
  );
  const initialConnection =
    atlas.connections.find((connection) =>
      connection.spotIds.includes(atlas.spots[0]?.id ?? ""),
    ) ?? atlas.connections[0];
  const [selectedConnectionId, setSelectedConnectionId] = useState(
    initialConnection?.id ?? "",
  );
  const [selectedEraId, setSelectedEraId] = useState(
    initialConnection?.eras[0]?.id ?? "",
  );
  const [selectedSuggestionId, setSelectedSuggestionId] = useState("");
  const [selectedRecognitionLens, setSelectedRecognitionLens] =
    useState<string>("overview");
  const [selectedRouteNodeId, setSelectedRouteNodeId] = useState("route-overview");
  const [spotInspectorOpen, setSpotInspectorOpen] = useState(false);
  const { statuses: suggestionStatuses, updateStatus: updateSuggestionStatus } =
    useSuggestionStatuses(dataset.datasetId);

  const claimById = useMemo(
    () => new Map(dataset.claims.map((claim) => [claim.id, claim])),
    [dataset.claims],
  );
  const spotById = useMemo(
    () => new Map(displaySpots.map((spot) => [spot.id, spot])),
    [displaySpots],
  );
  const selectedSpot =
    spotById.get(selectedSpotId) ?? atlas.spots[0];
  const spotConnections = atlas.connections.filter((connection) =>
    connection.spotIds.includes(selectedSpot?.id ?? ""),
  );
  const selectedConnection =
    spotConnections.find(
      (connection) => connection.id === selectedConnectionId,
    ) ?? spotConnections[0] ?? atlas.connections[0];
  const selectedEra = selectedConnection?.eras.find(
    (era) => era.id === selectedEraId,
  ) ?? selectedConnection?.eras[0];
  const primaryFacet = dominantFacet(selectedConnection?.facets ?? []);
  const connectionColor = facetColor(primaryFacet?.id);
  const eraSpotIds = selectedEra?.spotIds ?? selectedConnection?.spotIds ?? [];
  const selectedSuggestion = atlas.suggestions.find(
    (suggestion) => suggestion.id === selectedSuggestionId,
  );
  const selectedSuggestionStatus = selectedSuggestion
    ? suggestionStatuses[selectedSuggestion.id] ?? selectedSuggestion.initialStatus
    : "suggested";
  const selectedSuggestionClaims = (selectedSuggestion?.claimIds ?? [])
    .map((id) => claimById.get(id))
    .filter((claim): claim is ReviewDataset["claims"][number] => Boolean(claim));
  const selectedSuggestionConnections = atlas.connections.filter((connection) =>
    selectedSuggestion?.connectionIds.includes(connection.id),
  );
  const selectedSuggestionSpots = (selectedSuggestion?.anchorSpotIds ?? [])
    .map((id) => spotById.get(id))
    .filter((spot): spot is NonNullable<typeof spot> => Boolean(spot));
  const highlightedSpotIds = selectedSuggestion?.anchorSpotIds ?? eraSpotIds;

  const selectedClaimIds = new Set(
    selectedEra?.claimIds ?? selectedConnection?.claimIds ?? [],
  );
  const selectedClaims = [...selectedClaimIds]
    .map((id) => claimById.get(id))
    .filter((claim): claim is ReviewDataset["claims"][number] => Boolean(claim));

  const connectedSpots = eraSpotIds
    .map((id) => spotById.get(id))
    .filter((spot): spot is NonNullable<typeof spot> => Boolean(spot));
  const systemLensActive = ["mythology", "religion", "route", "bakumatsu", "restoration-figures"].includes(
    selectedRecognitionLens,
  );

  const selectSuggestion = (suggestionId: string) => {
    setSpotInspectorOpen(false);
    setSelectedSuggestionId(suggestionId);
  };

  const selectSpot = (spotId: string) => {
    setSelectedSuggestionId("");
    setSelectedSpotId(spotId);
    if (systemLensActive) setSpotInspectorOpen(true);
    const nextConnection = atlas.connections.find((connection) =>
      connection.spotIds.includes(spotId),
    );
    if (nextConnection) {
      setSelectedConnectionId(nextConnection.id);
      setSelectedEraId(nextConnection.eras[0]?.id ?? "");
    }
  };

  const selectConnection = (connection: ReviewAtlasConnection) => {
    setSelectedSuggestionId("");
    setSelectedConnectionId(connection.id);
    setSelectedEraId(connection.eras[0]?.id ?? "");
    if (!connection.spotIds.includes(selectedSpot?.id ?? "")) {
      setSelectedSpotId(connection.spotIds[0]);
    }
  };
  const availableRecognitionLenses = recognitionLensDefinitions.filter((lens) =>
    lens.id === "overview"
      ? true
      : lens.id === "bakumatsu" || lens.id === "restoration-figures"
      ? hasBakumatsuLensMaterial(dataset.claims)
      : lens.id === "chronology"
      ? atlas.connections.some((connection) => connection.eras.length > 1)
      : atlas.connections.some((connection) =>
          connection.facets.some((facet) => lens.facetIds.includes(facet.id as never)),
        ),
  );

  const selectRecognitionLens = (
    lens: (typeof recognitionLensDefinitions)[number],
  ) => {
    setSpotInspectorOpen(false);
    if (lens.id === "overview") {
      setSelectedRecognitionLens("overview");
      return;
    }
    const ranked = atlas.connections
      .map((connection) => ({
        connection,
        score:
          lens.id === "chronology"
            ? connection.eras.length
            : connection.facets.reduce(
                (total, facet) =>
                  total +
                  (lens.facetIds.includes(facet.id as never) ? facet.weight : 0),
                0,
              ),
      }))
      .sort((a, b) => b.score - a.score);
    if (ranked[0]?.score) selectConnection(ranked[0].connection);
    setSelectedRecognitionLens(lens.id);
  };

  return (
    <main
      className={styles.page}
      style={{ "--connection-color": connectionColor } as CSSProperties}
    >
      <header className={styles.topbar}>
        <Link href="/" className={styles.brand} aria-label="ResoWorld home">
          <span aria-hidden="true">◉</span>
          <span>RESOWORLD</span>
        </Link>
        <div className={styles.titleBlock}>
          <span>TRAVEL CONNECTION ATLAS</span>
          <strong>{atlas.title}</strong>
        </div>
        <div className={styles.topMeta}>
          <Link href="/review?view=graph" className={styles.viewLink}>関係図で検証</Link>
          <span>{atlas.spots.length} VISITED SPOTS</span>
          <span>{atlas.connections.length} CONNECTIONS</span>
          <span>{atlas.suggestions.length} NEXT</span>
          <span className={styles.localBadge}>{dataset.privacy === "local-only" ? "LOCAL DATASET" : dataset.privacy === "anonymized-demo" ? "DEMO DATASET" : "SYNC CAPABLE"}</span>
        </div>
      </header>

      <section className={styles.recognitionBar}>
        <div className={styles.recognitionBarTitle}>
          <span>WORLD LENSES</span>
          <strong>世界を再認識する</strong>
        </div>
        <nav aria-label="探索を見直すレンズ">
          {availableRecognitionLenses.map((lens) => (
            <button
              type="button"
              key={lens.id}
              data-active={selectedRecognitionLens === lens.id}
              onClick={() => selectRecognitionLens(lens)}
            >
              {lens.label}
            </button>
          ))}
        </nav>
        <p>同じ訪問を、別の体系から見る</p>
      </section>

      <section
        className={`${styles.atlasGrid} ${
          systemLensActive ? styles.atlasGridWithLens : ""
        }`}
      >
        <section className={styles.mapPanel}>
          <div className={styles.panelHeader}>
            <div>
              <span className={styles.panelIndex}>MAP</span>
              <h1>訪問スポット</h1>
            </div>
            <span>GEOGRAPHIC POSITION / LENS OVERLAY</span>
          </div>

          <div className={styles.mapCanvas}>
            <AtlasMap
              spots={displaySpots}
              suggestions={atlas.suggestions}
              selectedSpotId={selectedSpot?.id ?? ""}
              highlightedSpotIds={highlightedSpotIds}
              connection={
                selectedConnection
                  ? { ...selectedConnection, spotIds: eraSpotIds }
                  : undefined
              }
              selectedSuggestion={selectedSuggestion}
              recognitionLens={selectedRecognitionLens}
              selectedLensEntityId={selectedRouteNodeId}
              onSelectLensEntity={setSelectedRouteNodeId}
              onSelectSpot={selectSpot}
              onSelectSuggestion={selectSuggestion}
            />

            {selectedConnection && !selectedSuggestion && selectedRecognitionLens !== "route" ? (
              <EraSelector
                eras={selectedConnection.eras}
                selectedEraId={selectedEra?.id ?? ""}
                onSelect={setSelectedEraId}
              />
            ) : null}

            {systemLensActive && spotInspectorOpen && selectedSpot ? (
              <aside className={styles.mapSpotInspector} aria-label="選択した訪問地点の情報">
                <div className={styles.mapSpotInspectorHeader}>
                  <span>VISITED SPOT</span>
                  <button type="button" onClick={() => setSpotInspectorOpen(false)} aria-label="地点情報を閉じる">×</button>
                </div>
                <p>{selectedSpot.kind} · {selectedSpot.region}</p>
                <h3>{selectedSpot.name}</h3>
                <div className={styles.mapSpotInspectorConnections}>
                  <span>この地点からつながるテーマ</span>
                  {spotConnections.map((connection) => (
                    <button
                      type="button"
                      key={connection.id}
                      data-active={connection.id === selectedConnection?.id}
                      onClick={() => selectConnection(connection)}
                    >
                      <strong>{connection.title}</strong>
                      <small>{connection.spotIds.length}地点 · {connection.claimIds.length}件の根拠</small>
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  className={styles.mapSpotInspectorOverview}
                  onClick={() => {
                    setSelectedRecognitionLens("overview");
                    setSpotInspectorOpen(false);
                  }}
                >
                  訪問マップで詳しく見る
                </button>
              </aside>
            ) : null}
          </div>
        </section>

        {selectedRecognitionLens === "mythology" ? (
          <KnowledgeGenealogyLens
            connection={selectedConnection}
            spots={atlas.spots}
            claims={dataset.claims}
            selectedSpotId={selectedSpot?.id ?? ""}
            onSelectSpot={selectSpot}
          />
        ) : selectedRecognitionLens === "route" ? (
          <RouteLens
            spots={atlas.spots}
            selectedNodeId={selectedRouteNodeId}
            onSelectNode={setSelectedRouteNodeId}
            onSelectSpot={selectSpot}
          />
        ) : selectedRecognitionLens === "religion" ? (
          <ReligionLens
            claims={dataset.claims}
            spots={atlas.spots}
            selectedSpotId={selectedSpot?.id ?? ""}
            onSelectSpot={selectSpot}
          />
        ) : selectedRecognitionLens === "bakumatsu" ? (
          <BakumatsuLens
            claims={dataset.claims}
            spots={displaySpots}
            onSelectSpot={selectSpot}
          />
        ) : selectedRecognitionLens === "restoration-figures" ? (
          <IshinFiguresLens claims={dataset.claims} spots={displaySpots} selectedSpotId={selectedSpot?.id ?? ""} onSelectSpot={selectSpot} />
        ) : null}

        <aside
          className={`${styles.spotPanel} ${
            systemLensActive ? styles.spotPanelHidden : ""
          }`}
        >
          <div className={styles.panelHeader}>
            <div>
              <span className={styles.panelIndex}>SPOT</span>
              <h2>{selectedSuggestion ? "次の探索候補" : "ここから何につながる？"}</h2>
            </div>
          </div>

          {selectedSuggestion ? (
            <SuggestionPanel
              suggestion={selectedSuggestion}
              anchorSpots={selectedSuggestionSpots}
              status={selectedSuggestionStatus}
              onStatusChange={(status) => updateSuggestionStatus(selectedSuggestion.id, status)}
              onBack={() => setSelectedSuggestionId("")}
              onSelectAnchorSpot={selectSpot}
            />
          ) : selectedSpot ? (
            <div className={styles.spotBody}>
              <p className={styles.spotKind}>{selectedSpot.kind} · {selectedSpot.region}</p>
              <h2>{selectedSpot.name}</h2>
              <p className={styles.spotLead}>
                この場所で得た記録を起点に、別の時代・場所・概念へ線を伸ばします。
              </p>
              <section className={styles.positionReview} data-status={selectedSpot.positionStatus ?? "confirmed"}>
                <div>
                  <span>MAP POSITION</span>
                  <strong>
                    {selectedSpot.positionStatus === "candidate"
                      ? "この位置は候補です"
                      : selectedSpot.positionStatus === "rejected"
                        ? "この位置は除外中です"
                        : "この位置を確認済み"}
                  </strong>
                </div>
                <div>
                  <button type="button" data-active={selectedSpot.positionStatus === "confirmed"} onClick={() => updatePositionStatus(selectedSpot.id, "confirmed")}>位置を採用</button>
                  <button type="button" data-active={selectedSpot.positionStatus === "rejected"} onClick={() => updatePositionStatus(selectedSpot.id, "rejected")}>除外</button>
                </div>
              </section>

              {selectedConnection ? (
                <section className={styles.meaningLens}>
                  <div>
                    <span className={styles.microLabel}>MEANING LENS / 接続の主成分</span>
                    <strong style={{ color: connectionColor }}>
                      {primaryFacet?.label} が中心
                    </strong>
                  </div>
                  <FacetCloud facets={selectedConnection.facets} />
                </section>
              ) : null}

              <div className={styles.connectionList}>
                <span className={styles.microLabel}>つながりを選ぶ</span>
                {spotConnections.map((connection) => (
                  <button
                    type="button"
                    key={connection.id}
                    data-active={connection.id === selectedConnection?.id}
                    style={{ "--item-color": facetColor(dominantFacet(connection.facets)?.id) } as CSSProperties}
                    onClick={() => selectConnection(connection)}
                  >
                    <span>{connection.eyebrow}</span>
                    <strong>{connection.title}</strong>
                    <small>{connection.spotIds.length}地点 · {connection.claimIds.length}件の根拠</small>
                  </button>
                ))}
              </div>

              <SuggestionQueue
                suggestions={atlas.suggestions}
                statuses={suggestionStatuses}
                onSelect={selectSuggestion}
              />
            </div>
          ) : null}
        </aside>
      </section>

      {selectedSuggestion ? (
        <SuggestionDrawer
          datasetId={dataset.datasetId}
          suggestion={selectedSuggestion}
          anchorSpots={selectedSuggestionSpots}
          claims={selectedSuggestionClaims}
          connections={selectedSuggestionConnections}
          status={selectedSuggestionStatus}
          onStatusChange={(status) => updateSuggestionStatus(selectedSuggestion.id, status)}
          onSelectAnchorSpot={selectSpot}
          onSelectConnection={selectConnection}
        />
      ) : selectedConnection ? (
        <section className={styles.connectionDrawer}>
          <div className={styles.connectionStory}>
            <p>{selectedConnection.eyebrow}</p>
            <div className={styles.primaryForce}>
              <span>PRIMARY FORCE</span>
              <strong>{primaryFacet?.label}</strong>
              <small>{primaryFacet?.weight} / 5</small>
            </div>
            <h2>{selectedConnection.title}</h2>
            <p>{selectedConnection.summary}</p>
            <FacetCloud facets={selectedConnection.facets} compact />
          </div>

          <div className={styles.connectionFacts}>
            <section>
              <span className={styles.factIcon}>◷</span>
              <div>
                <h3>選択中の時代レイヤー</h3>
                <div className={styles.eraFact}>
                  <strong>{selectedEra?.label}</strong>
                  <span>{selectedEra?.range}</span>
                  <small>{selectedEra?.mapLabel}</small>
                </div>
              </div>
            </section>
            <section>
              <span className={styles.factIcon}>⌖</span>
              <div>
                <h3>つながる場所</h3>
                <div className={styles.chips}>
                  {connectedSpots.map((spot) => (
                    <button type="button" key={spot.id} onClick={() => selectSpot(spot.id)}>
                      {spot.name}
                    </button>
                  ))}
                </div>
              </div>
            </section>
            <section>
              <span className={styles.factIcon}>◎</span>
              <div>
                <h3>つながる概念</h3>
                <div className={styles.chips}>
                  {selectedConnection.concepts.map((concept) => <span key={concept}>{concept}</span>)}
                </div>
              </div>
            </section>
          </div>

          <details className={styles.evidenceStrip}>
            <summary className={styles.evidenceHeading}>
              <span>WHY CONNECTED? / {selectedClaims.length} CLAIMS</span>
              <strong>なぜ、そう言えるのか</strong>
            </summary>
            <div className={styles.evidenceCards}>
              {selectedClaims.slice(0, 6).map((claim) => (
                <article key={claim.id}>
                  <div>
                    <span>{natureLabels[claim.evidence[0]?.sourceNature] ?? "記録"}</span>
                    <span>{historicalTimeLabel(claim.historicalTime)}</span>
                  </div>
                  <p>{claim.statement}</p>
                  <blockquote>{claim.evidence[0]?.passage.quote}</blockquote>
                </article>
              ))}
            </div>
          </details>
        </section>
      ) : (
        <section className={styles.emptyState}>
          Atlas設定に2地点以上を結ぶテーマを追加すると、つながりが表示されます。
        </section>
      )}
    </main>
  );
}
