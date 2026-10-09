"use client";

import { useMemo, useState, type CSSProperties } from "react";
import type { ReviewDataset } from "@/domain/review/types";

import { AtlasConnectionDrawer } from "./atlas-connection-drawer";
import { AtlasJourneyBar } from "./atlas-journey-bar";
import { AtlasLensColumn } from "./atlas-lens-column";
import { EraSelector } from "./atlas-lenses";
import { AtlasMap } from "./atlas-map";
import { AtlasMapInspector } from "./atlas-map-inspector";
import { AtlasRecognitionBar } from "./atlas-recognition-bar";
import { AtlasSpotInspector } from "./atlas-spot-inspector";
import { AtlasTopbar } from "./atlas-topbar";
import { StratumLandscapeLens } from "./stratum-landscape-lens";
import { CHRONOLOGICAL_STRATA } from "@/domain/review/stratum-types";
import { SuggestionDrawer } from "./exploration-suggestions";
import { recognitionLensDefinitions, useAtlasWorkspace } from "./use-atlas-workspace";
import styles from "./atlas.module.css";

export function AtlasWorkspace({
  dataset,
  initialJourneyId,
  initialLensId,
}: {
  dataset: ReviewDataset;
  initialJourneyId?: string;
  initialLensId?: string;
}) {
  const ws = useAtlasWorkspace({ dataset, initialJourneyId, initialLensId });
  const [explorationMode, setExplorationMode] = useState<"lens" | "stratum">("lens");
  const [selectedStratumId, setSelectedStratumId] = useState<string>("stratum-nature-animism");

  const currentStratum = useMemo(() => {
    return (
      CHRONOLOGICAL_STRATA.find((s) => s.id === selectedStratumId) ??
      CHRONOLOGICAL_STRATA[0]
    );
  }, [selectedStratumId]);

  const stratumMatchingSpotIds = useMemo(() => {
    return ws.scopedAtlas.spots.filter(currentStratum.spotMatchers).map((s) => s.id);
  }, [ws.scopedAtlas.spots, currentStratum]);

  const effectiveHighlightedSpotIds = useMemo(() => {
    if (explorationMode === "stratum") {
      return stratumMatchingSpotIds;
    }
    return ws.highlightedSpotIds;
  }, [explorationMode, stratumMatchingSpotIds, ws.highlightedSpotIds]);

  const effectiveMapScene = useMemo(() => {
    if (explorationMode === "stratum") {
      // 地層モード時はLENSの接続線を非表示にし、純粋にその地層のスポット群の光で空間分布を見せる
      return {
        ...ws.mapScene,
        connections: [],
      };
    }
    return ws.mapScene;
  }, [explorationMode, ws.mapScene]);

  const handleSelectRecognitionLens = (lensId: string, topicId?: string, nodeId?: string) => {
    setExplorationMode("lens");
    ws.selectLensById(lensId, topicId, nodeId);
  };

  return (
    <main
      className={styles.page}
      data-mode={explorationMode}
      style={{
        "--connection-color":
          explorationMode === "stratum" ? "var(--gold)" : ws.connectionColor,
      } as CSSProperties}
    >
      <AtlasTopbar
        title={ws.atlas.title}
        visitedSpotCount={ws.displaySpots.length}
        connectionCount={ws.visibleConnections.length}
        suggestionCount={ws.scopedAtlas.suggestions.length}
        privacy={dataset.privacy}
      />

      <AtlasJourneyBar
        journeys={ws.atlas.journeys}
        selectedJourneyId={ws.selectedJourneyId}
        selectedJourney={ws.selectedJourney}
        mapVisitSpotCount={ws.mapVisitSpotIds.size}
        totalSpotCount={ws.atlas.spots.length}
        journeySpotCount={ws.journeySpotCount}
        onSelectJourney={ws.selectJourney}
      />

      <AtlasRecognitionBar
        availableLenses={ws.availableRecognitionLenses}
        selectedLensId={ws.selectedRecognitionLens}
        systemLensActive={ws.systemLensActive}
        lensLayout={ws.lensLayout}
        selectedJourneyLabel={ws.selectedJourney?.label}
        explorationMode={explorationMode}
        onSelectLens={ws.selectRecognitionLens}
        onSetLensLayout={ws.setLensLayout}
        onSelectMode={setExplorationMode}
      />

      <section
        className={`${styles.atlasGrid} ${
          ws.systemLensActive || explorationMode === "stratum" ? styles.atlasGridWithLens : ""
        } ${(ws.systemLensActive || explorationMode === "stratum") && ws.lensLayout === "balanced" ? styles.atlasGridLensBalanced : ""}`}
      >
        <section className={styles.mapPanel} aria-label="アトラス地図">
          <AtlasMap
            spots={ws.displaySpots}
            suggestions={ws.visibleSuggestions}
            suggestionsVisible={ws.suggestionsVisible}
            suggestionStatuses={ws.suggestionStatuses}
            onToggleSuggestionsVisible={(visible) => {
              ws.setSuggestionsVisible(visible);
              if (!visible && ws.selection.focus.kind === "suggestion") {
                ws.dispatchSelection({ type: "clear-focus", preserveCamera: true });
              }
            }}
            selectedSpotId={ws.selectedSpot?.id ?? ""}
            highlightedSpotIds={effectiveHighlightedSpotIds}
            scene={effectiveMapScene}
            selectedSuggestion={ws.activeSuggestion}
            recognitionLens={ws.selectedRecognitionLens}
            selectedJourneyId={ws.selectedJourneyId}
            selectedLensLabel={ws.selectedLensDefinition?.label}
            topicScope={ws.topicScope}
            onSelectLensEntity={(id) => ws.dispatchSelection({ type: "select-route-node", id })}
            onSelectRecognitionLens={handleSelectRecognitionLens}
            onClearMapConnection={() => ws.dispatchSelection({ type: "clear-pinned-connection" })}
            onSelectMapConnection={(connection) => {
              if (connection.origin === "exploration") {
                const atlasConnection = ws.scopedAtlas.connections.find((candidate) => candidate.id === connection.sourceId);
                if (atlasConnection) ws.selectConnection(atlasConnection);
              } else if (connection.origin === "knowledge-pack") {
                ws.dispatchSelection({ type: "select-knowledge-connection", id: connection.sourceId });
              } else {
                ws.selectSuggestion(connection.sourceId);
              }
            }}
            onSelectSpot={ws.selectSpot}
            onSelectSuggestion={ws.selectSuggestion}
            onClearFocus={() => ws.dispatchSelection({ type: "clear-focus" })}
          >
            {ws.selectedConnection && !ws.selectedSuggestion && ws.selectedRecognitionLens !== "route" ? (
              <EraSelector
                eras={ws.selectedConnection.eras}
                selectedEraId={ws.selectedEra?.id ?? ""}
                onSelect={(id) => ws.dispatchSelection({ type: "select-era", id })}
              />
            ) : null}

            {ws.systemLensActive && ws.spotInspectorOpen && ws.selectedSpot ? (
              <AtlasMapInspector
                selectedSpot={ws.selectedSpot}
                spotConnections={ws.spotConnections}
                selectedConnectionId={ws.selectedConnection?.id}
                onClose={() => {
                  ws.setSpotInspectorOpen(false);
                  ws.dispatchSelection({ type: "clear-focus", preserveCamera: true });
                }}
                onSelectConnection={ws.selectConnection}
                onReturnToOverview={() => {
                  ws.selectLensById("overview");
                }}
              />
            ) : null}
          </AtlasMap>
        </section>

        {explorationMode === "stratum" ? (
          <StratumLandscapeLens
            selectedStratumId={selectedStratumId}
            spots={ws.scopedAtlas.spots}
            selectedSpotId={ws.selectedSpot?.id ?? ""}
            onSelectStratum={setSelectedStratumId}
            onSelectSpot={(spotId) => ws.selectSpot(spotId, { panCamera: true })}
          />
        ) : ws.systemLensActive ? (
          <AtlasLensColumn
            selectedLensId={ws.selectedRecognitionLens}
            selectedConnection={ws.selectedConnection}
            spots={ws.scopedAtlas.spots}
            displaySpots={ws.displaySpots}
            claims={ws.scopedClaims}
            selectedSpotId={ws.selectedSpot?.id ?? ""}
            selectedRouteNodeId={ws.selectedRouteNodeId}
            selectedTopicId={ws.selectedLensTopicId}
            selectedSuggestion={ws.selectedSuggestion}
            lensContinuations={ws.lensContinuations}
            suggestionStatuses={ws.suggestionStatuses}
            onSelectTopic={ws.setSelectedLensTopicId}
            onSelectRouteNode={(id) => ws.dispatchSelection({ type: "select-route-node", id })}
            onSelectSpot={(spotId) => ws.selectSpot(spotId, { panCamera: true })}
            onSelectSuggestion={(suggestionId) => ws.selectSuggestion(suggestionId, { panCamera: true })}
          />
        ) : null}

        <AtlasSpotInspector
          systemLensActive={ws.systemLensActive}
          selectedSuggestion={ws.selectedSuggestion}
          selectedSuggestionSpots={ws.selectedSuggestionSpots}
          selectedSpot={ws.selectedSpot}
          selectedSpotClaims={ws.selectedSpotClaims}
          selectedSpotKnowledge={ws.selectedSpotKnowledge}
          selectedConnection={ws.selectedConnection}
          connectionColor={ws.connectionColor}
          spotConnections={ws.spotConnections}
          connectionStatuses={ws.connectionStatuses}
          includeRejectedConnections={ws.includeRejectedConnections}
          suggestions={ws.visibleSuggestions}
          suggestionStatuses={ws.suggestionStatuses}
          selectedJourneyId={ws.selectedJourneyId}
          onClearFocus={() => ws.dispatchSelection({ type: "clear-focus", preserveCamera: true })}
          onSelectSpot={ws.selectSpot}
          onSelectConnection={ws.selectConnection}
          onUpdatePositionStatus={ws.updatePositionStatus}
          onUpdateConnectionStatus={ws.updateConnectionStatus}
          onUpdateSuggestionStatus={ws.updateSuggestionStatus}
          onSelectRecognitionLens={handleSelectRecognitionLens}
          onToggleIncludeRejected={ws.setIncludeRejectedConnections}
          onSelectSuggestion={ws.selectSuggestion}
        />
      </section>

      {ws.selectedSuggestion ? (
        <SuggestionDrawer
          datasetId={dataset.datasetId}
          suggestion={ws.selectedSuggestion}
          anchorSpots={ws.selectedSuggestionSpots}
          claims={ws.selectedSuggestionClaims}
          connections={ws.selectedSuggestionConnections}
          status={ws.selectedSuggestionStatus}
          selectedJourneyId={ws.selectedJourneyId}
          onStatusChange={(status) => ws.updateSuggestionStatus(ws.selectedSuggestion!.id, status)}
          onClose={() => ws.dispatchSelection({ type: "clear-focus" })}
          onSelectAnchorSpot={ws.selectSpot}
          onSelectConnection={ws.selectSuggestionConnection}
          onSelectLens={handleSelectRecognitionLens}
        />
      ) : ws.selectedConnection ? (
        <AtlasConnectionDrawer
          connection={ws.selectedConnection}
          selectedEra={ws.selectedEra}
          connectedSpots={ws.connectedSpots}
          selectedClaims={ws.selectedClaims}
          onSelectSpot={ws.selectSpot}
        />
      ) : (
        <section className={styles.emptyState}>
          Atlas設定に2地点以上を結ぶテーマを追加すると、つながりが表示されます。
        </section>
      )}
    </main>
  );
}
