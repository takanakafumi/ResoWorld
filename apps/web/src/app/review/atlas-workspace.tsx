"use client";

import { useCallback, useEffect, useMemo, useState, useTransition, type CSSProperties } from "react";
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
  buildClaimsByIdMap,
  getSpotStratumMemberships,
  type SpotStratumMembership,
  type StratumResolutionContext,
} from "@/domain/review/stratum-types";
import { SuggestionDrawer } from "./exploration-suggestions";
import { recognitionLensDefinitions, useAtlasWorkspace, type RecognitionLensDefinition } from "./use-atlas-workspace";
import styles from "./atlas.module.css";

const lensNameMap: Record<string, string> = {
  mythology: "神話",
  route: "ルート",
  religion: "宗教",
  politics: "政治・社会",
  people: "人物",
};

export function AtlasWorkspace({
  dataset,
  initialJourneyId,
  initialLensId,
  initialMode,
}: {
  dataset: ReviewDataset;
  initialJourneyId?: string;
  initialLensId?: string;
  initialMode?: "lens" | "stratum";
}) {
  const ws = useAtlasWorkspace({ dataset, initialJourneyId, initialLensId });
  const [explorationMode, setExplorationMode] = useState<"lens" | "stratum">(() => {
    if (initialMode) return initialMode;
    if (initialLensId && initialLensId !== "overview") return "lens";
    return "stratum";
  });
  const [selectedStratumIds, setSelectedStratumIds] = useState<string[]>(() =>
    CHRONOLOGICAL_STRATA.map((s) => s.id),
  );
  const [mobileTab, setMobileTab] = useState<"map" | "lens" | "spot">("map");
  const [optimisticMobileTab, setOptimisticMobileTab] = useState<"map" | "lens" | "spot" | null>(null);
  const activeMobileTab = optimisticMobileTab ?? mobileTab;

  useEffect(() => {
    if (optimisticMobileTab && optimisticMobileTab === mobileTab) {
      setOptimisticMobileTab(null);
    }
  }, [mobileTab, optimisticMobileTab]);

  useEffect(() => {
    // Enable CSS :active pseudo-classes immediately on iOS Safari / WebKit touch devices
    const touchHandler = () => {};
    window.addEventListener("touchstart", touchHandler, { passive: true });
    return () => {
      window.removeEventListener("touchstart", touchHandler);
    };
  }, []);

  const claimsById = useMemo(() => buildClaimsByIdMap(dataset.claims), [dataset.claims]);
  const stratumContext = useMemo<StratumResolutionContext>(() => {
    return {
      claimsById,
      connections: ws.scopedAtlas.connections,
    };
  }, [claimsById, ws.scopedAtlas.connections]);

  const selectedStrata = useMemo(() => {
    const matched = CHRONOLOGICAL_STRATA.filter((s) => selectedStratumIds.includes(s.id));
    return matched.length > 0 ? matched : CHRONOLOGICAL_STRATA;
  }, [selectedStratumIds]);

  const spotStratumMemberships = useMemo<Map<string, SpotStratumMembership>>(() => {
    return getSpotStratumMemberships(ws.scopedAtlas.spots, selectedStrata, stratumContext);
  }, [ws.scopedAtlas.spots, selectedStrata, stratumContext]);

  const stratumCountBySpotId = useMemo<ReadonlyMap<string, number>>(() => {
    const map = new Map<string, number>();
    for (const [spotId, membership] of spotStratumMemberships) {
      if (membership.strataCount >= 1) {
        map.set(spotId, membership.strataCount);
      }
    }
    return map;
  }, [spotStratumMemberships]);

  const stratumMatchingSpotIds = useMemo(() => {
    // 複数層（全5層など）の重畳表示時はラベルの重なりを防ぐため丸ピン＋層数バッジ＋光輪表示とし、
    // 1層のみ単独選択したときだけ該当スポットの社名ラベルを一斉展開する
    if (selectedStrata.length !== 1) {
      return [];
    }
    return ws.scopedAtlas.spots
      .filter((spot) => (spotStratumMemberships.get(spot.id)?.strataCount ?? 0) >= 1)
      .map((s) => s.id);
  }, [ws.scopedAtlas.spots, spotStratumMemberships, selectedStrata.length]);

  const [, startTransition] = useTransition();

  const handleToggleStratum = useCallback((stratumId: string) => {
    startTransition(() => {
      setSelectedStratumIds((prev) => {
        const exists = prev.includes(stratumId);
        if (exists) {
          const next = prev.filter((id) => id !== stratumId);
          // 最後の1層をOFFにした場合は0層（空白）にせず全5層表示へ戻す
          return next.length > 0 ? next : CHRONOLOGICAL_STRATA.map((s) => s.id);
        }
        return [...prev, stratumId];
      });
    });
  }, []);

  const handleSelectOnlyStratum = useCallback((stratumId: string) => {
    startTransition(() => {
      setSelectedStratumIds((prev) => {
        if (prev.length === 1 && prev[0] === stratumId) {
          return CHRONOLOGICAL_STRATA.map((s) => s.id);
        }
        return [stratumId];
      });
    });
  }, []);

  const handleSelectAllStrata = useCallback(() => {
    startTransition(() => {
      setSelectedStratumIds(CHRONOLOGICAL_STRATA.map((s) => s.id));
    });
  }, []);

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

  const handleSelectRecognitionLens = useCallback((lensId: string, topicId?: string, nodeId?: string) => {
    startTransition(() => {
      setExplorationMode("lens");
      ws.selectLensById(lensId, topicId, nodeId);
    });
  }, [ws.selectLensById]);

  const handleSelectMode = useCallback((mode: "lens" | "stratum") => {
    if (mode === "stratum" && ws.selection.focus.kind === "suggestion") {
      ws.dispatchSelection({ type: "clear-focus", preserveCamera: true });
    }
    startTransition(() => {
      setExplorationMode(mode);
    });
  }, [ws.selection.focus.kind, ws.dispatchSelection]);

  const handleToggleSuggestionsVisible = useCallback((visible: boolean) => {
    ws.setSuggestionsVisible(visible);
    if (!visible && ws.selection.focus.kind === "suggestion") {
      ws.dispatchSelection({ type: "clear-focus", preserveCamera: true });
    }
  }, [ws.setSuggestionsVisible, ws.selection.focus.kind, ws.dispatchSelection]);

  const handleSelectLensEntity = useCallback((id: string) => {
    ws.dispatchSelection({ type: "select-route-node", id });
  }, [ws.dispatchSelection]);

  const handleClearMapConnection = useCallback(() => {
    ws.dispatchSelection({ type: "clear-pinned-connection" });
  }, [ws.dispatchSelection]);

  const handleSelectMapConnection = useCallback((connection: any) => {
    if (connection.origin === "exploration") {
      const atlasConnection = ws.scopedAtlas.connections.find((candidate) => candidate.id === connection.sourceId);
      if (atlasConnection) ws.selectConnection(atlasConnection);
    } else if (connection.origin === "knowledge-pack") {
      ws.dispatchSelection({ type: "select-knowledge-connection", id: connection.sourceId });
    } else {
      ws.selectSuggestion(connection.sourceId);
    }
  }, [ws.scopedAtlas.connections, ws.selectConnection, ws.dispatchSelection, ws.selectSuggestion]);

  const handleClearFocus = useCallback(() => {
    ws.dispatchSelection({ type: "clear-focus" });
  }, [ws.dispatchSelection]);

  const handleSelectRouteNode = useCallback((id: string) => {
    ws.dispatchSelection({ type: "select-route-node", id });
  }, [ws.dispatchSelection]);

  const handleClearSpot = useCallback(() => {
    ws.dispatchSelection({ type: "clear-focus", preserveCamera: true });
  }, [ws.dispatchSelection]);

  const handleSelectLens = useCallback((lens: RecognitionLensDefinition) => {
    startTransition(() => {
      setExplorationMode("lens");
      ws.selectRecognitionLens(lens);
    });
  }, [ws.selectRecognitionLens]);

  const handleSelectLensTopic = useCallback((topicId: string) => {
    startTransition(() => {
      ws.setSelectedLensTopicId(topicId);
    });
  }, [ws.setSelectedLensTopicId]);

  const handleSelectMobileTab = useCallback(
    (tab: "map" | "lens" | "spot") => {
      setOptimisticMobileTab(tab);
      setMobileTab(tab);
      if (tab === "lens" && !ws.systemLensActive && explorationMode !== "stratum") {
        setExplorationMode("stratum");
      }
    },
    [ws.systemLensActive, explorationMode],
  );

  const handleSelectSpotWithCamera = useCallback((spotId: string) => {
    ws.selectSpot(spotId, { panCamera: true });
  }, [ws.selectSpot]);

  const handleSelectSuggestionWithCamera = useCallback((suggestionId: string) => {
    ws.selectSuggestion(suggestionId, { panCamera: true });
  }, [ws.selectSuggestion]);

  const activeMobileTargetName =
    ws.selectedSuggestion?.targetName ?? ws.selectedSpot?.name ?? "未選択";

  return (
    <main
      className={styles.page}
      data-mode={explorationMode}
      data-mobile-tab={activeMobileTab}
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
        onSelectLens={handleSelectLens}
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
            onToggleSuggestionsVisible={handleToggleSuggestionsVisible}
            selectedSpotId={ws.selectedSpot?.id ?? ""}
            highlightedSpotIds={effectiveHighlightedSpotIds}
            scene={effectiveMapScene}
            selectedSuggestion={explorationMode === "stratum" ? undefined : ws.activeSuggestion}
            recognitionLens={ws.selectedRecognitionLens}
            selectedJourneyId={ws.selectedJourneyId}
            selectedLensLabel={ws.selectedLensDefinition?.label}
            topicScope={explorationMode === "stratum" ? null : ws.topicScope}
            stratumCountBySpotId={explorationMode === "stratum" ? stratumCountBySpotId : undefined}
            onSelectLensEntity={handleSelectLensEntity}
            onSelectRecognitionLens={handleSelectRecognitionLens}
            onClearMapConnection={handleClearMapConnection}
            onSelectMapConnection={handleSelectMapConnection}
            onSelectSpot={ws.selectSpot}
            onSelectSuggestion={ws.selectSuggestion}
            onClearFocus={handleClearFocus}
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
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                    <span className={styles.mobileSelectionBadge} data-kind="suggestion">
                      未訪問候補
                    </span>
                    {ws.selectedSuggestion.lensId ? (
                      <span
                        className={styles.mobileSelectionBadge}
                        style={{
                          background: "rgba(215, 166, 255, 0.14)",
                          borderColor: "rgba(215, 166, 255, 0.4)",
                          color: "#d7a6ff",
                        }}
                      >
                        {lensNameMap[ws.selectedSuggestion.lensId] ?? ws.selectedSuggestion.lensId}
                      </span>
                    ) : null}
                    {ws.selectedSuggestionSpots[0] ? (
                      <span
                        className={styles.mobileSelectionBadge}
                        style={{
                          background: "rgba(213, 180, 109, 0.14)",
                          borderColor: "rgba(213, 180, 109, 0.4)",
                          color: "#f0cf80",
                        }}
                      >
                        📍 {ws.selectedSuggestionSpots[0].name}から接続
                      </span>
                    ) : null}
                  </div>
                  <strong>{ws.selectedSuggestion.targetName}</strong>
                  <div className={styles.mobileSelectionReasonBox}>
                    <span className={styles.mobileSelectionReasonTag}>💡 推薦理由:</span>
                    <p>{ws.selectedSuggestion.reason || ws.selectedSuggestion.title}</p>
                  </div>
                </div>
                <div className={styles.mobileSelectionActions}>
                  <button
                    type="button"
                    className={styles.mobileSelectionPrimaryBtn}
                    onClick={() => handleSelectMobileTab("spot")}
                  >
                    📍 候補詳細・7項目を見る
                  </button>
                  <button
                    type="button"
                    className={styles.mobileSelectionSecondaryBtn}
                    onClick={() => handleSelectMobileTab("lens")}
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
                    onClick={() => handleSelectMobileTab("spot")}
                  >
                    📍 地点詳細・7項目を見る
                  </button>
                  <button
                    type="button"
                    className={styles.mobileSelectionSecondaryBtn}
                    onClick={() => handleSelectMobileTab("lens")}
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
            selectedStratumIds={selectedStratumIds}
            spots={ws.scopedAtlas.spots}
            selectedSpotId={ws.selectedSpot?.id ?? ""}
            selectedSpotClaims={ws.selectedSpotClaims}
            stratumMemberships={spotStratumMemberships}
            stratumContext={stratumContext}
            onToggleStratum={handleToggleStratum}
            onSelectOnlyStratum={handleSelectOnlyStratum}
            onSelectAllStrata={handleSelectAllStrata}
            onSelectSpot={handleSelectSpotWithCamera}
            onClearSpot={handleClearSpot}
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
            suggestions={ws.allSuggestions}
            lensContinuations={ws.lensContinuations}
            suggestionStatuses={ws.suggestionStatuses}
            onSelectTopic={handleSelectLensTopic}
            onSelectRouteNode={handleSelectRouteNode}
            onSelectSpot={handleSelectSpotWithCamera}
            onSelectSuggestion={handleSelectSuggestionWithCamera}
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
                      onClick={() => handleSelectLens(lens)}
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
          stratumContext={stratumContext}
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
          data-active={activeMobileTab === "map" ? "true" : undefined}
          onClick={() => handleSelectMobileTab("map")}
        >
          <span className={styles.mobileNavIcon}>🗺️</span>
          <strong>地図</strong>
          <small>{ws.displaySpots.length}地点</small>
        </button>
        <button
          type="button"
          data-active={activeMobileTab === "lens" ? "true" : undefined}
          onClick={() => handleSelectMobileTab("lens")}
        >
          <span className={styles.mobileNavIcon}>
            {explorationMode === "stratum" ? "📜" : "🔍"}
          </span>
          <strong>{explorationMode === "stratum" ? "地層・7項目" : "知識レンズ"}</strong>
          <small>
            {explorationMode === "stratum"
              ? selectedStrata.length === CHRONOLOGICAL_STRATA.length
                ? "全5層重畳"
                : selectedStrata.length === 1
                  ? `第${selectedStrata[0].order}層`
                  : `${selectedStrata.length}層重畳`
              : ws.selectedLensDefinition?.label ?? "地層/レンズ"}
          </small>
        </button>
        <button
          type="button"
          data-active={activeMobileTab === "spot" ? "true" : undefined}
          onClick={() => handleSelectMobileTab("spot")}
        >
          <span className={styles.mobileNavIcon}>📍</span>
          <strong>地点・根拠</strong>
          <small>{activeMobileTargetName}</small>
        </button>
      </nav>
    </main>
  );
}
