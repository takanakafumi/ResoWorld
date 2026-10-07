"use client";

import { useState, type CSSProperties } from "react";
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
import { ChronologyDrawer } from "./chronology-drawer";
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
  const [isChronologyOpen, setIsChronologyOpen] = useState(false);

  return (
    <main
      className={styles.page}
      style={{ "--connection-color": ws.connectionColor } as CSSProperties}
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
        isChronologyOpen={isChronologyOpen}
        onSelectLens={ws.selectRecognitionLens}
        onSetLensLayout={ws.setLensLayout}
        onToggleChronology={() => setIsChronologyOpen((prev) => !prev)}
      />

      <section
        className={`${styles.atlasGrid} ${
          ws.systemLensActive ? styles.atlasGridWithLens : ""
        } ${ws.systemLensActive && ws.lensLayout === "balanced" ? styles.atlasGridLensBalanced : ""}`}
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
            highlightedSpotIds={ws.highlightedSpotIds}
            scene={ws.mapScene}
            selectedSuggestion={ws.activeSuggestion}
            recognitionLens={ws.selectedRecognitionLens}
            selectedJourneyId={ws.selectedJourneyId}
            selectedLensLabel={ws.selectedLensDefinition?.label}
            topicScope={ws.topicScope}
            onSelectLensEntity={(id) => ws.dispatchSelection({ type: "select-route-node", id })}
            onSelectRecognitionLens={(lensId, topicId, nodeId) => {
              ws.selectLensById(lensId, topicId, nodeId);
            }}
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

        {ws.systemLensActive ? (
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
          onSelectRecognitionLens={(lensId, topicId, nodeId) => ws.selectLensById(lensId, topicId, nodeId)}
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
          onSelectLens={(lensId, topicId, nodeId) => ws.selectLensById(lensId, topicId, nodeId)}
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

      <ChronologyDrawer
        isOpen={isChronologyOpen}
        spots={ws.scopedAtlas.spots}
        onClose={() => setIsChronologyOpen(false)}
        onSelectSpot={(spotId) => ws.selectSpot(spotId, { panCamera: true })}
      />
    </main>
  );
}
