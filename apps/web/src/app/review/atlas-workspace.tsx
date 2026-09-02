"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";

import { ishinFiguresPack } from "@/domain/lens-packs/ishin-figures-pack";
import { projectLensMapPreset } from "@/domain/lens-packs/projection";
import { hasBakumatsuLensMaterial } from "@/domain/lenses/bakumatsu";
import { buildJourneySummaries } from "@/domain/review/journey-summary";
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
import { JourneyOverview } from "./journey-overview";
import { KnowledgeGenealogyLens } from "./knowledge-genealogy-lens";
import { ReligionLens } from "./religion-lens";
import { RouteLens } from "./route-lens";
import { AtlasMap } from "./atlas-map";
import { BakumatsuLens } from "./bakumatsu-lens";
import { IshinFiguresLens } from "./ishin-figures-lens";
import styles from "./atlas.module.css";


const lensMapConnectionsByRecognitionLens = {
  "restoration-figures": projectLensMapPreset(ishinFiguresPack, "ishin-network"),
};

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
  const [selectedJourneyId, setSelectedJourneyId] = useState("all");
  const journeyOverview = useMemo(() => buildJourneySummaries(dataset), [dataset]);
  const selectedJourney = atlas.journeys?.find((journey) => journey.id === selectedJourneyId);
  const scopedClaims = useMemo(() => {
    if (!selectedJourney) return dataset.claims;
    const documentIds = new Set(selectedJourney.documentIds);
    return dataset.claims.filter((claim) =>
      claim.evidence.some((evidence) => documentIds.has(evidence.passage.documentId)),
    );
  }, [dataset.claims, selectedJourney]);
  const journeyBySpotId = useMemo(() => {
    if (selectedJourneyId !== "all") return {};
    const colors = ["#68c7bd", "#d5b46d", "#d7a6ff", "#ef8f72"];
    return Object.fromEntries((atlas.journeys ?? []).flatMap((journey, index) =>
      journey.spotIds.map((spotId) => [spotId, { label: journey.label, color: colors[index % colors.length] }]),
    ));
  }, [atlas.journeys, selectedJourneyId]);
  const scopedAtlas = useMemo(() => {
    if (!selectedJourney) return atlas;
    const spotIds = new Set(selectedJourney.spotIds);
    const connectionIds = new Set(selectedJourney.connectionIds);
    return {
      ...atlas,
      spots: atlas.spots.filter((spot) => spotIds.has(spot.id)),
      connections: atlas.connections.filter((connection) => connectionIds.has(connection.id)),
      suggestions: atlas.suggestions.filter((suggestion) =>
        suggestion.anchorSpotIds.some((spotId) => spotIds.has(spotId)) ||
        suggestion.connectionIds.some((connectionId) => connectionIds.has(connectionId)),
      ),
    };
  }, [atlas, selectedJourney]);
  const { statuses: positionStatuses, updateStatus: updatePositionStatus } =
    usePositionStatuses(dataset.datasetId);
  const displaySpots = useMemo(
    () => scopedAtlas.spots.map((spot) => ({
      ...spot,
      positionStatus: positionStatuses[spot.id] ?? spot.positionStatus ?? "confirmed",
    })),
    [scopedAtlas.spots, positionStatuses],
  );
  const [selectedSpotId, setSelectedSpotId] = useState(
    scopedAtlas.spots[0]?.id ?? "",
  );
  const initialConnection =
    scopedAtlas.connections.find((connection) =>
      connection.spotIds.includes(scopedAtlas.spots[0]?.id ?? ""),
    ) ?? scopedAtlas.connections[0];
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
    () => new Map(scopedClaims.map((claim) => [claim.id, claim])),
    [scopedClaims],
  );
  const spotById = useMemo(
    () => new Map(displaySpots.map((spot) => [spot.id, spot])),
    [displaySpots],
  );
  const selectedSpot =
    spotById.get(selectedSpotId) ?? scopedAtlas.spots[0];
  const spotConnections = scopedAtlas.connections.filter((connection) =>
    connection.spotIds.includes(selectedSpot?.id ?? ""),
  );
  const selectedConnection =
    spotConnections.find(
      (connection) => connection.id === selectedConnectionId,
    ) ?? spotConnections[0] ?? scopedAtlas.connections[0];
  const selectedEra = selectedConnection?.eras.find(
    (era) => era.id === selectedEraId,
  ) ?? selectedConnection?.eras[0];
  const primaryFacet = dominantFacet(selectedConnection?.facets ?? []);
  const connectionColor = facetColor(primaryFacet?.id);
  const eraSpotIds = selectedEra?.spotIds ?? selectedConnection?.spotIds ?? [];
  const selectedSuggestion = scopedAtlas.suggestions.find(
    (suggestion) => suggestion.id === selectedSuggestionId,
  );
  const selectedSuggestionStatus = selectedSuggestion
    ? suggestionStatuses[selectedSuggestion.id] ?? selectedSuggestion.initialStatus
    : "suggested";
  const selectedSuggestionClaims = (selectedSuggestion?.claimIds ?? [])
    .map((id) => claimById.get(id))
    .filter((claim): claim is ReviewDataset["claims"][number] => Boolean(claim));
  const selectedSuggestionConnections = scopedAtlas.connections.filter((connection) =>
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

  const selectJourney = (journeyId: string) => {
    const journey = atlas.journeys?.find((candidate) => candidate.id === journeyId);
    setSelectedJourneyId(journey?.id ?? "all");
    setSelectedRecognitionLens("overview");
    setSelectedSuggestionId("");
    setSpotInspectorOpen(false);
    if (journey) {
      setSelectedSpotId(journey.spotIds[0] ?? "");
      setSelectedConnectionId(journey.connectionIds[0] ?? "");
    }
  };

  const selectSuggestion = (suggestionId: string) => {
    setSpotInspectorOpen(false);
    setSelectedSuggestionId(suggestionId);
  };

  const selectSpot = (spotId: string) => {
    setSelectedSuggestionId("");
    setSelectedSpotId(spotId);
    if (systemLensActive) setSpotInspectorOpen(true);
    const nextConnection = scopedAtlas.connections.find((connection) =>
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
      ? hasBakumatsuLensMaterial(scopedClaims)
      : lens.id === "chronology"
      ? scopedAtlas.connections.some((connection) => connection.eras.length > 1)
      : scopedAtlas.connections.some((connection) =>
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
    const ranked = scopedAtlas.connections
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
          <span>{scopedAtlas.spots.length} VISITED SPOTS</span>
          <span>{scopedAtlas.connections.length} CONNECTIONS</span>
          <span>{scopedAtlas.suggestions.length} NEXT</span>
          <span className={styles.localBadge}>{dataset.privacy === "local-only" ? "LOCAL DATASET" : dataset.privacy === "anonymized-demo" ? "DEMO DATASET" : "SYNC CAPABLE"}</span>
        </div>
      </header>

      {(atlas.journeys?.length ?? 0) > 0 ? <section className={styles.journeyBar}>
        <div><span>MY JOURNEYS</span><strong>探索範囲を選ぶ</strong></div>
        <nav aria-label="表示する探索範囲">
          <button type="button" data-active={selectedJourneyId === "all"} onClick={() => selectJourney("all")}>すべて<small>{atlas.spots.length}地点</small></button>
          {atlas.journeys?.map((journey) => <button type="button" key={journey.id} data-active={selectedJourneyId === journey.id} onClick={() => selectJourney(journey.id)}>{journey.label}<small>{journey.spotIds.length}地点</small></button>)}
        </nav>
        <p>{selectedJourney ? `${selectedJourney.label}にフォーカス中。レンズはこの探索の記録から選ばれます。` : "すべての探索を地図に重ねています。地域を選ぶと、その記憶へフォーカスします。"}</p>
      </section> : null}

      {selectedJourneyId === "all" ? <JourneyOverview summaries={journeyOverview.summaries} commonEntityTypes={journeyOverview.commonEntityTypes} onSelect={selectJourney} /> : null}

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
              journeyBySpotId={journeyBySpotId}
              suggestions={scopedAtlas.suggestions}
              selectedSpotId={selectedSpot?.id ?? ""}
              highlightedSpotIds={highlightedSpotIds}
              connection={
                selectedConnection
                  ? { ...selectedConnection, spotIds: eraSpotIds }
                  : undefined
              }
              selectedSuggestion={selectedSuggestion}
              recognitionLens={selectedRecognitionLens}
              lensMapConnections={lensMapConnectionsByRecognitionLens[selectedRecognitionLens as keyof typeof lensMapConnectionsByRecognitionLens] ?? []}
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
            spots={scopedAtlas.spots}
            claims={scopedClaims}
            selectedSpotId={selectedSpot?.id ?? ""}
            onSelectSpot={selectSpot}
          />
        ) : selectedRecognitionLens === "route" ? (
          <RouteLens
            spots={scopedAtlas.spots}
            selectedNodeId={selectedRouteNodeId}
            onSelectNode={setSelectedRouteNodeId}
            onSelectSpot={selectSpot}
          />
        ) : selectedRecognitionLens === "religion" ? (
          <ReligionLens
            claims={scopedClaims}
            spots={scopedAtlas.spots}
            selectedSpotId={selectedSpot?.id ?? ""}
            onSelectSpot={selectSpot}
          />
        ) : selectedRecognitionLens === "bakumatsu" ? (
          <BakumatsuLens
            claims={scopedClaims}
            spots={displaySpots}
            onSelectSpot={selectSpot}
          />
        ) : selectedRecognitionLens === "restoration-figures" ? (
          <IshinFiguresLens claims={scopedClaims} spots={displaySpots} selectedSpotId={selectedSpot?.id ?? ""} onSelectSpot={selectSpot} />
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
                suggestions={scopedAtlas.suggestions}
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
