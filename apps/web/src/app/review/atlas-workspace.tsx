"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useReducer, useState } from "react";

import { resolveLensTopics } from "@/domain/lenses/topic-resolver";
import type { LensPerspectiveId } from "@/domain/lens-packs/knowledge-registry";
import { resolveSpotKnowledgeContexts } from "@/domain/lens-packs/spot-knowledge";
import { resolveLensContinuations } from "@/domain/exploration/lens-continuations";
import { currentSuggestions } from "@/domain/exploration/suggestion-policy";
import { isMapVisitSpot } from "@/domain/map/spot-presentation";
import { knowledgeMapConnectionsForGroup, knowledgeMapConnectionsForLens, knowledgeMapConnectionsForVisitedSpots, knowledgeSuggestionConnectionsForVisitedSpots } from "@/domain/map/registry";
import { projectMapScene } from "@/domain/map/scene";
import { reduceAtlasSelection } from "@/domain/map/selection";
import { orderSpotsByJourney } from "@/domain/review/journeys";
import type {
  ReviewAtlas,
  ReviewAtlasConnection,
  ReviewDataset,
} from "@/domain/review/types";

import {
  dominantFacet,
  EraSelector,
  facetColor,
} from "./atlas-lenses";
import { AtlasTopbar } from "./atlas-topbar";
import { AtlasJourneyBar } from "./atlas-journey-bar";
import { AtlasRecognitionBar } from "./atlas-recognition-bar";
import { AtlasSpotInspector } from "./atlas-spot-inspector";
import { AtlasConnectionDrawer } from "./atlas-connection-drawer";
import {
  SuggestionDrawer,
  LensContinuationQueue,
  SuggestionQueue,
  useSuggestionStatuses,
} from "./exploration-suggestions";
import { KnowledgeGenealogyLens } from "./knowledge-genealogy-lens";
import { ReligionLens } from "./religion-lens";
import { RouteLens } from "./route-lens";
import { AtlasMap } from "./atlas-map";
import { PeopleNetworkLens } from "./people-network-lens";
import { PoliticsSocialLens } from "./politics-social-lens";
import styles from "./atlas.module.css";


type RecognitionLensDefinition = {
  id: "overview" | LensPerspectiveId;
  label: string;
  facetIds: readonly string[];
  companionPanel?: boolean;
  focusMapConnectionId?: string;
  mapConnectionGroupId?: string;
};

const recognitionLensDefinitions: readonly RecognitionLensDefinition[] = [
  { id: "overview", label: "標準（全体俯瞰）", facetIds: [] },
  { id: "mythology", label: "神・系譜", facetIds: ["myth"], companionPanel: true },
  { id: "religion", label: "宗教", facetIds: ["belief", "ritual"], companionPanel: true },
  { id: "route", label: "ルート", facetIds: ["route", "exchange"], companionPanel: true, mapConnectionGroupId: "wajinden-routes" },
  { id: "politics", label: "政治・社会", facetIds: ["politics", "military", "society"], companionPanel: true },
  { id: "people", label: "人物", facetIds: ["people", "figure", "individual"], companionPanel: true },
];

type PositionStatus = "candidate" | "confirmed" | "rejected";
type ConnectionStatus = ReviewAtlasConnection["initialStatus"];

const connectionKindLabels: Record<ReviewAtlasConnection["connectionKind"], string> = {
  documented: "資料で確認できる関係",
  comparative: "比較して見える共通点",
  interpretive: "解釈としての接続",
  itinerary: "旅行記に残る訪問順",
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

export function AtlasWorkspace({ dataset, initialJourneyId, initialLensId }: { dataset: ReviewDataset; initialJourneyId?: string; initialLensId?: string }) {
  const atlas = useMemo(() => {
    const source = dataset.atlas ?? makeFallbackAtlas(dataset);
    return { ...source, suggestions: currentSuggestions(source.suggestions) };
  }, [dataset]);
  const [selectedJourneyId, setSelectedJourneyId] = useState(() =>
    atlas.journeys?.some(({ id }) => id === initialJourneyId) ? initialJourneyId! : "all",
  );
  const [includeRejectedConnections, setIncludeRejectedConnections] = useState(false);
  const { statuses: connectionStatuses, updateStatus: updateConnectionStatus } =
    useConnectionStatuses(dataset.datasetId);
  const selectedJourney = atlas.journeys?.find((journey) => journey.id === selectedJourneyId);
  const scopedClaims = useMemo(() => {
    if (!selectedJourney) return dataset.claims;
    const documentIds = new Set(selectedJourney.documentIds);
    return dataset.claims.filter((claim) =>
      claim.evidence.some((evidence) => documentIds.has(evidence.passage.documentId)),
    );
  }, [dataset.claims, selectedJourney]);
  const mapVisitSpotIds = useMemo(
    () => new Set(atlas.spots.filter(isMapVisitSpot).map(({ id }) => id)),
    [atlas.spots],
  );
  const journeySpotCount = (spotIds: string[]) => spotIds.filter((id) => mapVisitSpotIds.has(id)).length;
  const scopedAtlas = useMemo(() => {
    if (!selectedJourney) return atlas;
    const spotIds = new Set(selectedJourney.spotIds);
    const connectionIds = new Set(selectedJourney.connectionIds);
    return {
      ...atlas,
      spots: orderSpotsByJourney(atlas.spots, selectedJourney.spotIds),
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
        (includeRejectedConnections || connection.initialStatus !== "rejected")
      ),
    [connectionStatuses, includeRejectedConnections, scopedAtlas.connections],
  );
  const { statuses: positionStatuses, updateStatus: updatePositionStatus } =
    usePositionStatuses(dataset.datasetId);
  const displaySpots = useMemo(
    () => scopedAtlas.spots
      .filter(isMapVisitSpot)
      .map((spot) => ({
        ...spot,
        positionStatus: positionStatuses[spot.id] ?? spot.positionStatus ?? "confirmed",
      })),
    [scopedAtlas.spots, positionStatuses],
  );
  const [selection, dispatchSelection] = useReducer(reduceAtlasSelection, {
    spotId: "",
    focus: { kind: "none" },
  });
  const [selectedRecognitionLens, setSelectedRecognitionLens] =
    useState<string>(() => recognitionLensDefinitions.some(({ id }) => id === initialLensId) ? initialLensId! : "overview");
  const [selectedLensTopicId, setSelectedLensTopicId] = useState("");
  const [lensLayout, setLensLayout] = useState<"balanced" | "focus">("focus");
  const [spotInspectorOpen, setSpotInspectorOpen] = useState(false);
  const { statuses: suggestionStatuses, updateStatus: updateSuggestionStatus } =
    useSuggestionStatuses(dataset.datasetId);
  const [suggestionsVisible, setSuggestionsVisible] = useState(true);

  const claimById = useMemo(
    () => new Map(scopedClaims.map((claim) => [claim.id, claim])),
    [scopedClaims],
  );
  const spotById = useMemo(
    () => new Map(displaySpots.map((spot) => [spot.id, spot])),
    [displaySpots],
  );
  const selectedSpot = spotById.get(selection.spotId);
  const selectedSpotClaims = (selectedSpot?.claimIds ?? [])
    .map((id) => claimById.get(id))
    .filter((claim): claim is ReviewDataset["claims"][number] => Boolean(claim));
  const selectedSpotKnowledge = useMemo(
    () => selectedSpot ? resolveSpotKnowledgeContexts(selectedSpot, selectedSpotClaims) : [],
    [selectedSpot, selectedSpotClaims],
  );
  const spotConnections = visibleConnections.filter((connection) =>
    connection.spotIds.includes(selectedSpot?.id ?? ""),
  );
  const pinnedExploration = selection.pinnedConnection?.kind === "exploration"
    ? selection.pinnedConnection
    : undefined;
  const selectedConnection = pinnedExploration
    ? visibleConnections.find((connection) => connection.id === pinnedExploration.id)
    : undefined;
  const selectedEra = selectedConnection?.eras.find(
    (era) => era.id === pinnedExploration?.eraId,
  );  const primaryFacet = dominantFacet(selectedConnection?.facets ?? []);
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
  const suggestionKnowledgeConnections = knowledgeSuggestionConnectionsForVisitedSpots(displaySpots);
  const suggestionConnectionCatalog = [...visibleConnections, ...suggestionKnowledgeConnections];
  const selectedSuggestionConnections = suggestionConnectionCatalog.filter((connection) =>
    selectedSuggestion?.connectionIds.includes(connection.id),
  );
  const selectedSuggestionSpots = (selectedSuggestion?.anchorSpotIds ?? [])
    .map((id) => spotById.get(id))
    .filter((spot): spot is NonNullable<typeof spot> => Boolean(spot));
  const activeSuggestion = suggestionsVisible ? selectedSuggestion : undefined;
  const highlightedSpotIds = activeSuggestion?.anchorSpotIds ?? eraSpotIds;
  const selectedLensDefinition = recognitionLensDefinitions.find(
    (lens) => lens.id === selectedRecognitionLens,
  );
  const isOverview = selectedRecognitionLens === "overview";
  const activeConnections = isOverview
    ? visibleConnections.filter((connection) => connection.connectionKind === "itinerary")
    : visibleConnections.filter((connection) => {
        if (connection.connectionKind === "itinerary") return true;
        const targetFacets = selectedLensDefinition?.facetIds ?? [];
        if (targetFacets.length === 0) return true;
        return connection.facets.some((f) => targetFacets.includes(f.id));
      });
  const selectedLensMapConnections = isOverview
    ? []
    : knowledgeMapConnectionsForGroup(selectedLensDefinition?.mapConnectionGroupId);
  const baseLensMapConnections = isOverview
    ? []
    : knowledgeMapConnectionsForLens(selectedRecognitionLens, displaySpots);
  const visibleKnowledgeMapConnections = isOverview
    ? []
    : [...new Map(
        [...baseLensMapConnections, ...selectedLensMapConnections]
          .map((connection) => [connection.id, connection]),
      ).values()];
  const viewportKnowledgeConnectionIds = isOverview
    ? []
    : [...new Set([...baseLensMapConnections, ...selectedLensMapConnections].map((connection) => connection.id))];
  const mapScene = projectMapScene({
    reviewConnections: activeConnections,
    knowledgeConnections: visibleKnowledgeMapConnections,
    selectedSuggestion: activeSuggestion,
    spots: displaySpots,
    selection,
    viewportKnowledgeConnectionIds,
  });
  useEffect(() => {
    if (selection.pinnedConnection && !mapScene.connections.some((connection) => connection.selected)) {
      dispatchSelection({ type: "clear-pinned-connection" });
    }
  }, [mapScene.connections, selection.pinnedConnection]);

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
  const lensContinuations = systemLensActive
    ? resolveLensContinuations({
        suggestions: scopedAtlas.suggestions,
        connections: suggestionConnectionCatalog,
        facetIds: selectedLensDefinition?.facetIds ?? [],
      })
    : [];

  const selectJourney = (journeyId: string) => {
    const journey = atlas.journeys?.find((candidate) => candidate.id === journeyId);
    setSelectedJourneyId(journey?.id ?? "all");
    setSelectedRecognitionLens("overview");
    setSpotInspectorOpen(false);
    if (journey) {
      dispatchSelection({
        type: "reset",
        spotId: "",
        focus: { kind: "none" },
      });
    } else {
      dispatchSelection({ type: "reset", spotId: "" });
    }
  };

  const selectSuggestion = (suggestionId: string) => {
    setSpotInspectorOpen(false);
    dispatchSelection({ type: "select-suggestion", id: suggestionId });
  };

  const selectSpot = (spotId: string) => {
    if (selectedSpot?.id === spotId) setSpotInspectorOpen(false);
    else if (systemLensActive) setSpotInspectorOpen(true);
    dispatchSelection({ type: "select-spot", spotId });
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
      : resolveLensTopics({ perspectiveId: lens.id, claims: scopedClaims, spots: scopedAtlas.spots }).length > 0,
  );

  const selectRecognitionLens = (
    lens: (typeof recognitionLensDefinitions)[number],
  ) => {
    setSelectedLensTopicId("");
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
    setSelectedRecognitionLens(lens.id);
  };
  const selectSuggestionConnection = (connection: ReviewAtlasConnection) => {
    if (visibleConnections.some(({ id }) => id === connection.id)) {
      selectConnection(connection);
      return;
    }
    dispatchSelection({ type: "select-knowledge-connection", id: connection.id });
  };

  return (
    <main
      className={styles.page}
      style={{ "--connection-color": connectionColor } as CSSProperties}
    >
      <AtlasTopbar
        title={atlas.title}
        visitedSpotCount={displaySpots.length}
        connectionCount={visibleConnections.length}
        suggestionCount={scopedAtlas.suggestions.length}
        privacy={dataset.privacy}
      />

      <AtlasJourneyBar
        journeys={atlas.journeys}
        selectedJourneyId={selectedJourneyId}
        selectedJourney={selectedJourney}
        mapVisitSpotCount={mapVisitSpotIds.size}
        totalSpotCount={atlas.spots.length}
        journeySpotCount={journeySpotCount}
        onSelectJourney={selectJourney}
      />

      <AtlasRecognitionBar
        availableLenses={availableRecognitionLenses}
        selectedLensId={selectedRecognitionLens}
        systemLensActive={systemLensActive}
        lensLayout={lensLayout}
        selectedJourneyLabel={selectedJourney?.label}
        onSelectLens={selectRecognitionLens}
        onSetLensLayout={setLensLayout}
      />

      <section
        className={`${styles.atlasGrid} ${
          systemLensActive ? styles.atlasGridWithLens : ""
        } ${systemLensActive && lensLayout === "balanced" ? styles.atlasGridLensBalanced : ""}`}
      >
        <section className={styles.mapPanel} aria-label="アトラス地図">
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
              suggestions={scopedAtlas.suggestions}
              suggestionsVisible={suggestionsVisible}
              onToggleSuggestionsVisible={(visible) => {
                setSuggestionsVisible(visible);
                if (!visible && selection.focus.kind === "suggestion") {
                  dispatchSelection({ type: "clear-focus", preserveCamera: true });
                }
              }}
              selectedSpotId={selectedSpot?.id ?? ""}
              highlightedSpotIds={highlightedSpotIds}
              scene={mapScene}
              selectedSuggestion={activeSuggestion}
              recognitionLens={selectedRecognitionLens}
              selectedJourneyId={selectedJourneyId}
              selectedLensLabel={selectedLensDefinition?.label}
              onSelectLensEntity={(id) => dispatchSelection({ type: "select-route-node", id })}
              onSelectRecognitionLens={(lensId, topicId) => {
                const lens = recognitionLensDefinitions.find(({ id }) => id === lensId);
                if (lens) {
                  selectRecognitionLens(lens);
                  setSelectedLensTopicId(topicId ?? "");
                }
              }}
              onClearMapConnection={() => dispatchSelection({ type: "clear-pinned-connection" })}
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
              onClearFocus={() => dispatchSelection({ type: "clear-focus" })}
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
                  標準（全体俯瞰）に戻る
                </button>
              </aside>
            ) : null}
          </div>
        </section>

        {systemLensActive ? (
          <div className={styles.lensColumn}>
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
                connection={selectedConnection}
                claims={scopedClaims}
                spots={scopedAtlas.spots}
                selectedSpotId={selectedSpot?.id ?? ""}
                selectedNodeId={selectedRouteNodeId}
                selectedTopicId={selectedLensTopicId}
                onSelectNode={(id) => dispatchSelection({ type: "select-route-node", id })}
                onSelectSpot={selectSpot}
              />
            ) : selectedRecognitionLens === "religion" ? (
              <ReligionLens
                claims={scopedClaims}
                spots={scopedAtlas.spots}
                selectedSpotId={selectedSpot?.id ?? ""}
                selectedTopicId={selectedLensTopicId}
                onSelectSpot={selectSpot}
              />
            ) : selectedRecognitionLens === "politics" ? (
              <PoliticsSocialLens
                claims={scopedClaims}
                spots={scopedAtlas.spots}
                selectedSpotId={selectedSpot?.id ?? ""}
                selectedTopicId={selectedLensTopicId}
                onSelectSpot={selectSpot}
              />
            ) : selectedRecognitionLens === "people" ? (
              <PeopleNetworkLens
                claims={scopedClaims}
                spots={displaySpots}
                selectedSpotId={selectedSpot?.id ?? ""}
                onSelectSpot={selectSpot}
              />
            ) : null}
            <LensContinuationQueue
              suggestions={lensContinuations}
              statuses={suggestionStatuses}
              onSelect={selectSuggestion}
            />
          </div>
        ) : null}

        <AtlasSpotInspector
          systemLensActive={systemLensActive}
          selectedSuggestion={selectedSuggestion}
          selectedSuggestionSpots={selectedSuggestionSpots}
          selectedSpot={selectedSpot}
          selectedSpotClaims={selectedSpotClaims}
          selectedSpotKnowledge={selectedSpotKnowledge}
          selectedConnection={selectedConnection}
          connectionColor={connectionColor}
          spotConnections={spotConnections}
          connectionStatuses={connectionStatuses}
          includeRejectedConnections={includeRejectedConnections}
          suggestions={scopedAtlas.suggestions}
          suggestionStatuses={suggestionStatuses}
          onClearFocus={() => dispatchSelection({ type: "clear-focus", preserveCamera: true })}
          onSelectSpot={selectSpot}
          onSelectConnection={selectConnection}
          onUpdatePositionStatus={updatePositionStatus}
          onUpdateConnectionStatus={updateConnectionStatus}
          onSelectRecognitionLens={(lensId) => setSelectedRecognitionLens(lensId)}
          onToggleIncludeRejected={setIncludeRejectedConnections}
          onSelectSuggestion={selectSuggestion}
        />
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
          onClose={() => dispatchSelection({ type: "clear-focus" })}
          onSelectAnchorSpot={selectSpot}
          onSelectConnection={selectSuggestionConnection}
        />
      ) : selectedConnection ? (
        <AtlasConnectionDrawer
          connection={selectedConnection}
          selectedEra={selectedEra}
          connectedSpots={connectedSpots}
          selectedClaims={selectedClaims}
          onSelectSpot={selectSpot}
        />
      ) : (
        <section className={styles.emptyState}>
          Atlas設定に2地点以上を結ぶテーマを追加すると、つながりが表示されます。
        </section>
      )}
    </main>
  );
}
