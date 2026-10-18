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
import {
  CHRONOLOGICAL_STRATA,
  getSpotStratumMemberships,
  type SpotStratumMembership,
} from "@/domain/review/stratum-types";
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
  const [mobileTab, setMobileTab] = useState<"map" | "lens" | "spot">("map");

  const spotStratumMemberships = useMemo<Map<string, SpotStratumMembership>>(() => {
    return getSpotStratumMemberships(ws.scopedAtlas.spots, CHRONOLOGICAL_STRATA);
  }, [ws.scopedAtlas.spots]);

  const stratumCountBySpotId = useMemo<ReadonlyMap<string, number>>(() => {
    const map = new Map<string, number>();
    for (const [spotId, membership] of spotStratumMemberships) {
      if (membership.strataCount >= 2) {
        map.set(spotId, membership.strataCount);
      }
    }
    return map;
  }, [spotStratumMemberships]);

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

  const effectiveSuggestions = useMemo(() => {
    if (explorationMode === "stratum") {
      // 地層モードではLENSの探索候補地ピンを完全非表示にし、自己の足跡の地層分布観察に純化する
      return [];
    }
    return ws.visibleSuggestions;
  }, [explorationMode, ws.visibleSuggestions]);

  const handleSelectRecognitionLens = (lensId: string, topicId?: string, nodeId?: string) => {
    setExplorationMode("lens");
    ws.selectLensById(lensId, topicId, nodeId);
  };

  const handleSelectMode = (mode: "lens" | "stratum") => {
    if (mode === "stratum" && ws.selection.focus.kind === "suggestion") {
      ws.dispatchSelection({ type: "clear-focus", preserveCamera: true });
    }
    setExplorationMode(mode);
  };

  const activeMobileTargetName =
    ws.selectedSuggestion?.targetName ?? ws.selectedSpot?.name ?? "未選択";

  return (
    <main
      className={styles.page}
      data-mode={explorationMode}
      data-mobile-tab={mobileTab}
      style={{
        "--connection-color":
          explorationMode === "stratum" ? "var(--gold)" : ws.connectionColor,
      } as CSSProperties}
    >
      <AtlasTopbar
        title={ws.atlas.title}
        visitedSpotCount={ws.displaySpots.length}
        connectionCount={ws.visibleConnections.length}
        suggestionCount={explorationMode === "stratum" ? 0 : ws.scopedAtlas.suggestions.length}
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
        onSelectMode={handleSelectMode}
      />

      <section
        className={`${styles.atlasGrid} ${
          ws.systemLensActive || explorationMode === "stratum" ? styles.atlasGridWithLens : ""
        } ${(ws.systemLensActive || explorationMode === "stratum") && ws.lensLayout === "balanced" ? styles.atlasGridLensBalanced : ""}`}
      >
        <section className={styles.mapPanel} aria-label="アトラス地図">
          <AtlasMap
            spots={ws.displaySpots}
            suggestions={effectiveSuggestions}
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
            selectedSuggestion={explorationMode === "stratum" ? undefined : ws.activeSuggestion}
            recognitionLens={ws.selectedRecognitionLens}
            selectedJourneyId={ws.selectedJourneyId}
            selectedLensLabel={ws.selectedLensDefinition?.label}
            topicScope={explorationMode === "stratum" ? null : ws.topicScope}
            stratumCountBySpotId={explorationMode === "stratum" ? stratumCountBySpotId : undefined}
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

          {/* スマホ用：地図直下の選択中地点・候補クイックバー */}
          <div className={styles.mobileSelectionCard} aria-label="選択中の地点クイック情報">
            {ws.selectedSuggestion && explorationMode !== "stratum" ? (
              <>
                <div className={styles.mobileSelectionMeta}>
                  <span className={styles.mobileSelectionBadge} data-kind="suggestion">
                    未訪問候補
                  </span>
                  <strong>{ws.selectedSuggestion.targetName}</strong>
                  <small>{ws.selectedSuggestion.title}</small>
                </div>
                <div className={styles.mobileSelectionActions}>
                  <button
                    type="button"
                    className={styles.mobileSelectionPrimaryBtn}
                    onClick={() => setMobileTab("spot")}
                  >
                    📍 候補詳細・7項目を見る
                  </button>
                  <button
                    type="button"
                    className={styles.mobileSelectionSecondaryBtn}
                    onClick={() => setMobileTab("lens")}
                  >
                    🔍 レンズ図
                  </button>
                </div>
              </>
            ) : ws.selectedSpot ? (
              <>
                <div className={styles.mobileSelectionMeta}>
                  <span className={styles.mobileSelectionBadge}>
                    {ws.selectedSpot.region} · {ws.selectedSpot.kind}
                  </span>
                  <strong>{ws.selectedSpot.name}</strong>
                  <small>
                    {ws.selectedSpotClaims[0]?.statement ??
                      `訪問記録 ${ws.selectedSpotClaims.length}件 · 接続テーマ ${ws.spotConnections.length}件`}
                  </small>
                </div>
                <div className={styles.mobileSelectionActions}>
                  <button
                    type="button"
                    className={styles.mobileSelectionPrimaryBtn}
                    onClick={() => setMobileTab("spot")}
                  >
                    📍 地点詳細・7項目を見る
                  </button>
                  <button
                    type="button"
                    className={styles.mobileSelectionSecondaryBtn}
                    onClick={() => {
                      if (!ws.systemLensActive && explorationMode !== "stratum") {
                        setExplorationMode("stratum");
                      }
                      setMobileTab("lens");
                    }}
                  >
                    {explorationMode === "stratum" ? "📜 地層断面" : "🔍 レンズ分析"}
                  </button>
                </div>
              </>
            ) : (
              <p className={styles.mobileSelectionEmpty}>
                地図上のピンをタップすると、ここに地点の概要と詳細ボタンが表示されます。
              </p>
            )}
          </div>
        </section>

        {explorationMode === "stratum" ? (
          <StratumLandscapeLens
            selectedStratumId={selectedStratumId}
            spots={ws.scopedAtlas.spots}
            selectedSpotId={ws.selectedSpot?.id ?? ""}
            stratumMemberships={spotStratumMemberships}
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
        ) : (
          <aside className={styles.mobileLensLauncher} aria-label="レンズ・地層モード選択">
            <div className={styles.mobileLensLauncherCard}>
              <span>MOBILE EXPLORATION · 視点を選択</span>
              <h2>知識レンズまたは時代地層を選択</h2>
              <p>
                現在は「全体俯瞰」モードです。テーマ別の関係図で見直すか、5層の垂直地層断面・聖地7項目で比較するかを選んでください。
              </p>
              <button
                type="button"
                className={styles.mobileLensLauncherStratumBtn}
                onClick={() => handleSelectMode("stratum")}
              >
                <strong>📜 祭祀景観の地層断面 (STRATUM) を開く</strong>
                <small>全5層の時代断面・15大聖地の7項目分解・地域6観点・史料A/B/C比較</small>
              </button>
              <div className={styles.mobileLensLauncherGrid}>
                {ws.availableRecognitionLenses
                  .filter((l) => l.id !== "overview")
                  .map((lens) => (
                    <button
                      key={lens.id}
                      type="button"
                      onClick={() => ws.selectRecognitionLens(lens)}
                    >
                      🔍 {lens.label}レンズで見る
                    </button>
                  ))}
              </div>
            </div>
          </aside>
        )}

        <AtlasSpotInspector
          systemLensActive={ws.systemLensActive || explorationMode === "stratum"}
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
          suggestions={effectiveSuggestions}
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

      {ws.selectedSuggestion && explorationMode !== "stratum" ? (
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

      {/* スマホ専用：画面下部の3タブ固定ナビゲーション */}
      <nav className={styles.mobileBottomNav} aria-label="スマホ表示切替ナビゲーション">
        <button
          type="button"
          data-active={mobileTab === "map" ? "true" : undefined}
          onClick={() => setMobileTab("map")}
        >
          <span className={styles.mobileNavIcon}>🗺️</span>
          <strong>地図</strong>
          <small>{ws.displaySpots.length}地点</small>
        </button>
        <button
          type="button"
          data-active={mobileTab === "lens" ? "true" : undefined}
          onClick={() => {
            if (!ws.systemLensActive && explorationMode !== "stratum") {
              setExplorationMode("stratum");
            }
            setMobileTab("lens");
          }}
        >
          <span className={styles.mobileNavIcon}>
            {explorationMode === "stratum" ? "📜" : "🔍"}
          </span>
          <strong>{explorationMode === "stratum" ? "地層・7項目" : "知識レンズ"}</strong>
          <small>
            {explorationMode === "stratum"
              ? `第${currentStratum.order}層`
              : ws.selectedLensDefinition?.label ?? "地層/レンズ"}
          </small>
        </button>
        <button
          type="button"
          data-active={mobileTab === "spot" ? "true" : undefined}
          onClick={() => setMobileTab("spot")}
        >
          <span className={styles.mobileNavIcon}>📍</span>
          <strong>地点・根拠</strong>
          <small>{activeMobileTargetName}</small>
        </button>
      </nav>
    </main>
  );
}
