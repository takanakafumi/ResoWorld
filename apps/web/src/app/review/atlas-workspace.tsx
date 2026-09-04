"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useReducer, useState } from "react";

import { hasBakumatsuLensMaterial } from "@/domain/lenses/bakumatsu";
import { resolveSpotKnowledgeContexts } from "@/domain/lens-packs/spot-knowledge";
import { knowledgeMapConnectionsForGroup, registeredKnowledgeMapConnections } from "@/domain/map/registry";
import { projectMapScene } from "@/domain/map/scene";
import { reduceAtlasSelection } from "@/domain/map/selection";
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
import { PoliticsSocialLens } from "./politics-social-lens";
import styles from "./atlas.module.css";


type RecognitionLensDefinition = {
  id: string;
  label: string;
  facetIds: readonly string[];
  autoSelectConnection?: boolean;
  companionPanel?: boolean;
  focusMapConnectionId?: string;
  mapConnectionGroupId?: string;
};

const recognitionLensDefinitions: readonly RecognitionLensDefinition[] = [
  { id: "overview", label: "訪問マップ", facetIds: [] },
  { id: "mythology", label: "神・系譜", facetIds: ["myth"], autoSelectConnection: true, companionPanel: true },
  { id: "religion", label: "宗教", facetIds: ["belief", "ritual"], companionPanel: true },
  { id: "route", label: "ルート", facetIds: ["exchange"], companionPanel: true, mapConnectionGroupId: "wajinden-routes" },
  { id: "politics", label: "政治・社会", facetIds: ["politics", "military", "society"], companionPanel: true },
  { id: "bakumatsu", label: "幕末", facetIds: ["politics", "military", "society"], companionPanel: true },
  { id: "restoration-figures", label: "維新志士", facetIds: ["politics", "military", "society"], companionPanel: true, focusMapConnectionId: "takasugi-life-geography" },
  { id: "landscape", label: "地形・聖域", facetIds: ["landscape"], autoSelectConnection: true },
  { id: "chronology", label: "時代", facetIds: [], autoSelectConnection: true },
];

type PositionStatus = "candidate" | "confirmed" | "rejected";
type ConnectionStatus = ReviewAtlasConnection["initialStatus"];

const connectionKindLabels: Record<ReviewAtlasConnection["connectionKind"], string> = {
  documented: "資料で確認できる関係",
  comparative: "比較して見える共通点",
  interpretive: "解釈としての接続",
};

const connectionStatusLabels: Record<ConnectionStatus, string> = {
  suggested: "提案中",
  confirmed: "採用",
  rejected: "却下",
};

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

function useConnectionStatuses(datasetId: string) {
  const storageKey = `resoworld-connections:${datasetId}`;
  const [statuses, setStatuses] = useState<Record<string, ConnectionStatus>>({});
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) setStatuses(JSON.parse(stored) as Record<string, ConnectionStatus>);
      } catch {
        // A damaged local preference must not block the Atlas.
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [storageKey]);
  const updateStatus = (connectionId: string, status: ConnectionStatus) => {
    setStatuses((current) => {
      const next = { ...current, [connectionId]: status };
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
  const [includeRejectedConnections, setIncludeRejectedConnections] = useState(false);
  const { statuses: connectionStatuses, updateStatus: updateConnectionStatus } =
    useConnectionStatuses(dataset.datasetId);
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
  const visibleConnections = useMemo(
    () => scopedAtlas.connections
      .map((connection) => ({
        ...connection,
        initialStatus: connectionStatuses[connection.id] ?? connection.initialStatus,
      }))
      .filter((connection) =>
        includeRejectedConnections || connection.initialStatus !== "rejected"
      ),
    [connectionStatuses, includeRejectedConnections, scopedAtlas.connections],
  );
  const { statuses: positionStatuses, updateStatus: updatePositionStatus } =
    usePositionStatuses(dataset.datasetId);
  const displaySpots = useMemo(
    () => scopedAtlas.spots.map((spot) => ({
      ...spot,
      positionStatus: positionStatuses[spot.id] ?? spot.positionStatus ?? "confirmed",
    })),
    [scopedAtlas.spots, positionStatuses],
  );
  const [selection, dispatchSelection] = useReducer(reduceAtlasSelection, {
    spotId: scopedAtlas.spots[0]?.id ?? "",
    focus: { kind: "none" },
  });
  const [selectedRecognitionLens, setSelectedRecognitionLens] =
    useState<string>("overview");
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
  const selectedSpot = spotById.get(selection.spotId) ?? scopedAtlas.spots[0];
  const selectedSpotClaims = (selectedSpot?.claimIds ?? [])
    .map((id) => claimById.get(id))
    .filter((claim): claim is ReviewDataset["claims"][number] => Boolean(claim));
  const selectedSpotKnowledge = useMemo(
    () => selectedSpot ? resolveSpotKnowledgeContexts(selectedSpot) : [],
    [selectedSpot],
  );
  const spotConnections = visibleConnections.filter((connection) =>
    connection.spotIds.includes(selectedSpot?.id ?? ""),
  );
  const focusedExploration = selection.focus.kind === "exploration-connection"
    ? selection.focus
    : undefined;
  const selectedConnection = focusedExploration
    ? visibleConnections.find((connection) => connection.id === focusedExploration.id)
    : undefined;
  const selectedEra = selectedConnection?.eras.find(
    (era) => era.id === focusedExploration?.eraId,
  );
  const primaryFacet = dominantFacet(selectedConnection?.facets ?? []);
  const connectionColor = facetColor(primaryFacet?.id);
  const eraSpotIds = selectedEra?.spotIds ?? selectedConnection?.spotIds ?? [];
  const focusedSuggestionId = selection.focus.kind === "suggestion"
    ? selection.focus.id
    : "";
  const selectedSuggestion = focusedSuggestionId
    ? scopedAtlas.suggestions.find((suggestion) => suggestion.id === focusedSuggestionId)
    : undefined;
  const selectedRouteNodeId = selection.focus.kind === "route-node"
    ? selection.focus.id
    : "route-overview";
  const selectedSuggestionStatus = selectedSuggestion
    ? suggestionStatuses[selectedSuggestion.id] ?? selectedSuggestion.initialStatus
    : "suggested";
  const selectedSuggestionClaims = (selectedSuggestion?.claimIds ?? [])
    .map((id) => claimById.get(id))
    .filter((claim): claim is ReviewDataset["claims"][number] => Boolean(claim));
  const selectedSuggestionConnections = visibleConnections.filter((connection) =>
    selectedSuggestion?.connectionIds.includes(connection.id),
  );
  const selectedSuggestionSpots = (selectedSuggestion?.anchorSpotIds ?? [])
    .map((id) => spotById.get(id))
    .filter((spot): spot is NonNullable<typeof spot> => Boolean(spot));
  const highlightedSpotIds = selectedSuggestion?.anchorSpotIds ?? eraSpotIds;
  const selectedLensDefinition = recognitionLensDefinitions.find(
    (lens) => lens.id === selectedRecognitionLens,
  );
  const selectedLensMapConnections = knowledgeMapConnectionsForGroup(
    selectedLensDefinition?.mapConnectionGroupId,
  );
  const mapScene = projectMapScene({
    reviewConnections: visibleConnections,
    knowledgeConnections: [...registeredKnowledgeMapConnections, ...selectedLensMapConnections],
    selectedSuggestion,
    spots: displaySpots,
    selection,
    viewportKnowledgeConnectionIds: selectedLensMapConnections.map((connection) => connection.id),
  });

  const selectedClaimIds = new Set(
    selectedEra?.claimIds ?? selectedConnection?.claimIds ?? [],
  );
  const selectedClaims = [...selectedClaimIds]
    .map((id) => claimById.get(id))
    .filter((claim): claim is ReviewDataset["claims"][number] => Boolean(claim));

  const connectedSpots = eraSpotIds
    .map((id) => spotById.get(id))
    .filter((spot): spot is NonNullable<typeof spot> => Boolean(spot));
  const systemLensActive = selectedLensDefinition?.companionPanel ?? false;

  const selectJourney = (journeyId: string) => {
    const journey = atlas.journeys?.find((candidate) => candidate.id === journeyId);
    setSelectedJourneyId(journey?.id ?? "all");
    setSelectedRecognitionLens("overview");
    setSpotInspectorOpen(false);
    if (journey) {
      const connection = atlas.connections.find((candidate) => candidate.id === journey.connectionIds[0]);
      dispatchSelection({
        type: "reset",
        spotId: journey.spotIds[0] ?? "",
        focus: connection
          ? { kind: "exploration-connection", id: connection.id, eraId: connection.eras[0]?.id ?? "" }
          : { kind: "none" },
      });
    } else {
      dispatchSelection({ type: "reset", spotId: atlas.spots[0]?.id ?? "" });
    }
  };

  const selectSuggestion = (suggestionId: string) => {
    setSpotInspectorOpen(false);
    dispatchSelection({ type: "select-suggestion", id: suggestionId });
  };

  const selectSpot = (spotId: string) => {
    if (systemLensActive) setSpotInspectorOpen(true);
    const nextConnection = visibleConnections.find((connection) =>
      connection.spotIds.includes(spotId),
    );
    dispatchSelection({
      type: "select-spot",
      spotId,
      connectionId: nextConnection?.id,
      eraId: nextConnection?.eras[0]?.id,
    });
  };

  const selectConnection = (connection: ReviewAtlasConnection) => {
    dispatchSelection({
      type: "select-exploration-connection",
      id: connection.id,
      eraId: connection.eras[0]?.id ?? "",
      spotId: connection.spotIds.includes(selectedSpot?.id ?? "")
        ? selectedSpot?.id
        : connection.spotIds[0],
    });
  };
  const availableRecognitionLenses = recognitionLensDefinitions.filter((lens) =>
    lens.id === "overview"
      ? true
      : lens.id === "bakumatsu" || lens.id === "restoration-figures"
      ? hasBakumatsuLensMaterial(scopedClaims)
      : lens.id === "chronology"
      ? visibleConnections.some((connection) => connection.eras.length > 1)
      : visibleConnections.some((connection) =>
          connection.facets.some((facet) => lens.facetIds.includes(facet.id as never)),
        ),
  );

  const selectRecognitionLens = (
    lens: (typeof recognitionLensDefinitions)[number],
  ) => {
    setSpotInspectorOpen(false);
    dispatchSelection({ type: "clear-focus" });
    if (lens.id === "overview") {
      setSelectedRecognitionLens("overview");
      return;
    }
    if (lens.focusMapConnectionId) {
      dispatchSelection({ type: "select-knowledge-connection", id: lens.focusMapConnectionId });
      setSelectedRecognitionLens(lens.id);
      return;
    }
    if (!lens.autoSelectConnection) {
      setSelectedRecognitionLens(lens.id);
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
            <span>全接続を薄く表示 / 選択中・LENS対象を強調</span>
          </div>

          <div className={styles.mapCanvas}>
            <AtlasMap
              spots={displaySpots}
              journeyBySpotId={journeyBySpotId}
              suggestions={scopedAtlas.suggestions}
              selectedSpotId={selectedSpot?.id ?? ""}
              highlightedSpotIds={highlightedSpotIds}
              scene={mapScene}
              selectedSuggestion={selectedSuggestion}
              recognitionLens={selectedRecognitionLens}
              onSelectLensEntity={(id) => dispatchSelection({ type: "select-route-node", id })}
              onSelectMapConnection={(connection) => {
                if (connection.origin === "exploration") {
                  const atlasConnection = scopedAtlas.connections.find((candidate) => candidate.id === connection.sourceId);
                  if (atlasConnection) selectConnection(atlasConnection);
                } else if (connection.origin === "knowledge-pack") {
                  dispatchSelection({ type: "select-knowledge-connection", id: connection.sourceId });
                } else {
                  selectSuggestion(connection.sourceId);
                }
              }}
              onSelectSpot={selectSpot}
              onSelectSuggestion={selectSuggestion}
            />

            {selectedConnection && !selectedSuggestion && selectedRecognitionLens !== "route" ? (
              <EraSelector
                eras={selectedConnection.eras}
                selectedEraId={selectedEra?.id ?? ""}
                onSelect={(id) => dispatchSelection({ type: "select-era", id })}
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
                      <span>{connectionKindLabels[connection.connectionKind]}</span>
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
            claims={scopedClaims}
            spots={scopedAtlas.spots}
            selectedSpotId={selectedSpot?.id ?? ""}
            selectedNodeId={selectedRouteNodeId}
            onSelectNode={(id) => dispatchSelection({ type: "select-route-node", id })}
            onSelectSpot={selectSpot}
          />
        ) : selectedRecognitionLens === "religion" ? (
          <ReligionLens
            claims={scopedClaims}
            spots={scopedAtlas.spots}
            selectedSpotId={selectedSpot?.id ?? ""}
            onSelectSpot={selectSpot}
          />
        ) : selectedRecognitionLens === "politics" ? (
          <PoliticsSocialLens
            claims={scopedClaims}
            spots={scopedAtlas.spots}
            selectedSpotId={selectedSpot?.id ?? ""}
            onSelectSpot={selectSpot}
          />
        ) : selectedRecognitionLens === "bakumatsu" ? (
          <BakumatsuLens
            claims={scopedClaims}
            spots={displaySpots}
            selectedSpotId={selectedSpot?.id ?? ""}
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
              onBack={() => dispatchSelection({ type: "clear-focus" })}
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

              <section className={styles.spotRecords}>
                <div>
                  <span className={styles.microLabel}>MY RECORDS / この場所で得た記録</span>
                  <strong>{selectedSpotClaims.length}件</strong>
                </div>
                {selectedSpotClaims.length > 0 ? (
                  <ul>
                    {selectedSpotClaims.slice(0, 6).map((claim) => (
                      <li key={claim.id}>
                        <Link href={`/review?view=graph&claim=${encodeURIComponent(claim.id)}`}>
                          <span>{claim.statement}</span>
                          <small>根拠を見る →</small>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>この地点に結び付く旅行記Claimはまだ整理されていません。</p>
                )}
                {selectedSpotClaims.length > 6 ? (
                  <small>ほか{selectedSpotClaims.length - 6}件はEvidence Graphで確認できます。</small>
                ) : null}
              </section>

              {selectedSpotKnowledge.length > 0 ? (
                <section className={styles.spotKnowledge}>
                  <div className={styles.spotKnowledgeHeader}>
                    <span className={styles.microLabel}>SURROUNDING KNOWLEDGE / 外部情報で補う</span>
                    <strong>{selectedSpotKnowledge.reduce((count, context) => count + context.relations.length, 0)}件</strong>
                  </div>
                  {selectedSpotKnowledge.map((context) => (
                    <article key={context.id}>
                      <div><span>{context.packLabel}</span><strong>{context.entityLabel}</strong></div>
                      <ul>
                        {context.relations.slice(0, 3).map((relation) => (
                          <li key={relation.id}>
                            <strong>{relation.relatedEntityLabel}</strong>
                            <p>{relation.note ?? `${relation.relationLabel}として登録された関係です。`}</p>
                          </li>
                        ))}
                      </ul>
                      <footer>
                        <button type="button" onClick={() => setSelectedRecognitionLens(context.lensId)}>対応するレンズで見る</button>
                        {context.sources.filter((source) => source.url).slice(0, 2).map((source) => (
                          <a key={source.id} href={source.url} target="_blank" rel="noreferrer">{source.publisher ?? "出典"} ↗</a>
                        ))}
                      </footer>
                    </article>
                  ))}
                </section>
              ) : null}

              {selectedConnection ? (
                <section className={styles.meaningLens}>
                  <div>
                    <span className={styles.microLabel}>MEANING LENS / 接続の主成分</span>
                    <strong style={{ color: connectionColor }}>
                      {primaryFacet?.label} が中心
                    </strong>
                  </div>
                  <FacetCloud facets={selectedConnection.facets} />
                  <div className={styles.suggestionActions}>
                    <button type="button" data-active={(connectionStatuses[selectedConnection.id] ?? selectedConnection.initialStatus) === "confirmed"} onClick={() => updateConnectionStatus(selectedConnection.id, "confirmed")}>接続を採用</button>
                    <button type="button" data-active={(connectionStatuses[selectedConnection.id] ?? selectedConnection.initialStatus) === "suggested"} onClick={() => updateConnectionStatus(selectedConnection.id, "suggested")}>保留</button>
                    <button type="button" data-active={(connectionStatuses[selectedConnection.id] ?? selectedConnection.initialStatus) === "rejected"} onClick={() => updateConnectionStatus(selectedConnection.id, "rejected")}>却下</button>
                  </div>
                </section>
              ) : null}

              <div className={styles.connectionList}>
                <span className={styles.microLabel}>つながりを選ぶ</span>
                <label className={styles.connectionReviewToggle}>
                  <input type="checkbox" checked={includeRejectedConnections} onChange={(event) => setIncludeRejectedConnections(event.target.checked)} />
                  却下も表示
                </label>
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
                    <span>{connectionKindLabels[connection.connectionKind]}</span>
                    <span>{connectionStatusLabels[connectionStatuses[connection.id] ?? connection.initialStatus]}</span>
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
