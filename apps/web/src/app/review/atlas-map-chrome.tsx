"use client";

import type { CSSProperties } from "react";

import type { ArtifactOverlayId } from "@/domain/archaeology/artifact-overlay-types";
import type { ArtifactOverlayScene } from "@/domain/archaeology/artifact-projection";
import type { MapConnectionProjection } from "@/domain/map/connections";
import type { MapNatureFilter } from "@/domain/map/spot-presentation";

import { AtlasConnectionLayerControl } from "./atlas-connection-layer-control";
import type { ConnectionLayerVisibility } from "./use-connection-lines";
import type { PaleoThreshold } from "./use-paleo-layer";

export type AtlasMapChromeClassNames = {
  panelHeader: string;
  panelHeaderTitle: string;
  panelIndex: string;
  mapHeaderToolbar: string;
  connectionLayerButton: string;
  layerDotSuggestion: string;
  mapHeaderDivider: string;
  mapHeaderPaleoGroup: string;
  mapHeaderPaleoLabel: string;
  mapHeaderPaleoSelect: string;
  mapHeaderArtifactGroup: string;
  mapHeaderArtifactLabel: string;
  mapHeaderArtifactSelect: string;
  mapHeaderFilterGroup: string;
  mapHeaderFilterLabel: string;
  mapHeaderFilterSelect: string;
  mapFloatingCameraControls: string;
  mapFloatingSearchBtn: string;
  mapFloatingLocateBtn: string;
  mapFloatingCameraFit: string;
  mapFloatingAutoZoom: string;
  mapLegend: string;
};

type NatureCounts = {
  all: number;
  ancient_only: number;
  sacred_only: number;
  museums_only: number;
  candidates_only: number;
};

export function AtlasMapHeaderToolbar({
  classes,
  connectionVisibility,
  onChangeConnectionVisibility,
  connectionCounts,
  selectedLensLabel,
  isStratumMode,
  suggestionCount,
  suggestionsVisible,
  onToggleSuggestions,
  paleoVisible,
  paleoThreshold,
  onChangePaleo,
  activeArtifactOverlay,
  onChangeArtifactOverlay,
  natureFilter,
  natureCounts,
  onChangeNatureFilter,
}: {
  classes: AtlasMapChromeClassNames;
  connectionVisibility: ConnectionLayerVisibility;
  onChangeConnectionVisibility: (next: ConnectionLayerVisibility) => void;
  connectionCounts: { itinerary: number; lens: number };
  selectedLensLabel?: string;
  isStratumMode: boolean;
  suggestionCount: number;
  suggestionsVisible: boolean;
  onToggleSuggestions: (visible: boolean) => void;
  paleoVisible: boolean;
  paleoThreshold: PaleoThreshold;
  onChangePaleo: (visible: boolean, threshold?: PaleoThreshold) => void;
  activeArtifactOverlay: ArtifactOverlayId;
  onChangeArtifactOverlay: (overlayId: ArtifactOverlayId) => void;
  natureFilter: MapNatureFilter;
  natureCounts: NatureCounts;
  onChangeNatureFilter: (filter: MapNatureFilter) => void;
}) {
  const isArtifactOverlayActive = activeArtifactOverlay !== "none";

  return (
    <div className={classes.panelHeader}>
      <div className={classes.panelHeaderTitle}>
        <span className={classes.panelIndex}>MAP</span>
        <h1>訪問スポット</h1>
      </div>
      <div className={classes.mapHeaderToolbar} aria-label="地図ツールバー">
        <AtlasConnectionLayerControl
          visibility={connectionVisibility}
          onChange={onChangeConnectionVisibility}
          itineraryCount={connectionCounts.itinerary}
          lensCount={connectionCounts.lens}
          selectedLensLabel={selectedLensLabel}
          isStratumMode={isStratumMode}
        />

        {suggestionCount > 0 ? (
          <button
            type="button"
            className={classes.connectionLayerButton}
            data-variant="suggestion"
            data-active={suggestionsVisible}
            onClick={() => onToggleSuggestions(!suggestionsVisible)}
            title="探索候補ピンの表示・非表示を切り替えます"
          >
            <span className={classes.layerDotSuggestion}>⚑</span>
            <span>探索候補</span>
            <small>{suggestionCount}</small>
          </button>
        ) : null}

        <span className={classes.mapHeaderDivider} />

        <div className={classes.mapHeaderPaleoGroup} data-active={paleoVisible}>
          <label className={classes.mapHeaderPaleoLabel} htmlFor="paleo-threshold-select">
            <span aria-hidden="true">🌊</span>
            <span>古地形:</span>
          </label>
          <select
            id="paleo-threshold-select"
            aria-label="古地形（仮想海水準）"
            className={classes.mapHeaderPaleoSelect}
            value={paleoVisible ? String(paleoThreshold) : "off"}
            onChange={(event) => {
              const val = event.target.value;
              if (val === "off") {
                onChangePaleo(false);
              } else {
                onChangePaleo(true, Number(val) as PaleoThreshold);
              }
            }}
            title="仮想海抜を上げて縄文・弥生期の古地形や沿岸ラインを比較表示します"
          >
            <option value="off">オフ (現代水準)</option>
            <option value="3">+3m (弥生海進 / 沿岸低地)</option>
            <option value="5">+5m (縄文海進 / 湾入)</option>
            <option value="10">+10m</option>
            <option value="15">+15m</option>
            <option value="20">+20m</option>
            <option value="30">+30m</option>
          </select>
        </div>

        <div className={classes.mapHeaderArtifactGroup} data-active={isArtifactOverlayActive}>
          <label className={classes.mapHeaderArtifactLabel} htmlFor="artifact-overlay-select">
            <span aria-hidden="true">🏺</span>
            <span>出土品:</span>
          </label>
          <select
            id="artifact-overlay-select"
            aria-label="出土遺物・物質文化分布"
            className={classes.mapHeaderArtifactSelect}
            value={activeArtifactOverlay}
            onChange={(event) => onChangeArtifactOverlay(event.target.value as ArtifactOverlayId)}
            title="三角縁神獣鏡や弥生青銅器（銅矛・銅鐸・銅剣）の出土分布・数量バブルを地図にオーバーレイ表示します"
          >
            <option value="none">オフ</option>
            <option value="sankakubuchi-mirrors">🪞 三角縁神獣鏡（面数バブル）</option>
            <option value="yayoi-bronze-weapons-bells">🔔⚔️ 弥生青銅器（銅矛・銅鐸・銅剣）</option>
            <option value="jade-and-jasper">💎 翡翠・碧玉（威信財と超遠隔交易）</option>
            <option value="cinnabar-red-pigments">🔴 赤の塗料（水銀朱・辰砂 vs ベンガラ）</option>
            <option value="kofun-typology">🏯 古墳の類型（前方後円・四隅突出等）</option>
          </select>
        </div>

        <div className={classes.mapHeaderFilterGroup} data-active={natureFilter !== "all"}>
          <label className={classes.mapHeaderFilterLabel} htmlFor="nature-filter-select">
            <span aria-hidden="true">🏛️</span>
            <span>地層/性格:</span>
          </label>
          <select
            id="nature-filter-select"
            aria-label="スポットの歴史的性格・地層フィルタ"
            className={classes.mapHeaderFilterSelect}
            value={natureFilter}
            onChange={(event) => onChangeNatureFilter(event.target.value as MapNatureFilter)}
            title="古層聖域、現代宗教景観、資料館などの性格でスポットを絞り込みます"
          >
            <option value="all">すべて ({natureCounts.all})</option>
            <option value="ancient_only">古層・古代遺跡のみ ({natureCounts.ancient_only})</option>
            <option value="sacred_only">聖域景観 ({natureCounts.sacred_only})</option>
            <option value="museums_only">資料館・展示施設 ({natureCounts.museums_only})</option>
            {natureCounts.candidates_only > 0 ? (
              <option value="candidates_only">未訪問候補地 ({natureCounts.candidates_only})</option>
            ) : null}
          </select>
        </div>
      </div>
    </div>
  );
}

export function AtlasMapFloatingCameraControls({
  classes,
  fieldSearchOpen,
  locatingStatus,
  autoCameraZoom,
  onToggleFieldSearch,
  onLocateCurrentPosition,
  onFitCamera,
  onToggleAutoCameraZoom,
}: {
  classes: AtlasMapChromeClassNames;
  fieldSearchOpen: boolean;
  locatingStatus: "idle" | "locating" | "located" | "error";
  autoCameraZoom: boolean;
  onToggleFieldSearch: () => void;
  onLocateCurrentPosition: () => void;
  onFitCamera: () => void;
  onToggleAutoCameraZoom: (enabled: boolean) => void;
}) {
  return (
    <div className={classes.mapFloatingCameraControls}>
      <button
        type="button"
        className={classes.mapFloatingSearchBtn}
        data-active={fieldSearchOpen}
        aria-expanded={fieldSearchOpen}
        aria-label="スポット・周辺を検索"
        onClick={onToggleFieldSearch}
        title="スポット名で検索、または現在地・地図中心の周辺スポットを近い順に表示します"
      >
        <span aria-hidden="true">🔍</span>
        <span>探す</span>
      </button>
      <button
        type="button"
        className={classes.mapFloatingLocateBtn}
        data-status={locatingStatus}
        disabled={locatingStatus === "locating"}
        onClick={onLocateCurrentPosition}
        title="スマホ・端末のGPS現在地へカメラを移動します"
      >
        <span aria-hidden="true">◎</span>
        <span>
          {locatingStatus === "locating"
            ? "取得中…"
            : locatingStatus === "located"
              ? "現在地"
              : "現在地へ"}
        </span>
      </button>
      <button
        type="button"
        className={classes.mapFloatingCameraFit}
        onClick={onFitCamera}
        title="現在のトピックまたは選択地点にカメラを合わせる"
      >
        <span aria-hidden="true">⛶</span> 全体を表示
      </button>
      <label
        className={classes.mapFloatingAutoZoom}
        data-active={autoCameraZoom}
        title="地点やトピック選択時にカメラを自動でズーム追従させるか切り替えます（OFF時は手動操作・現在の縮尺を維持）"
      >
        <input
          type="checkbox"
          checked={autoCameraZoom}
          onChange={(event) => onToggleAutoCameraZoom(event.target.checked)}
        />
        <span>自動ズーム</span>
      </label>
    </div>
  );
}

export function AtlasMapLegend({
  classes,
  paleoVisible,
  paleoThreshold,
  isArtifactOverlayActive,
  artifactLegendScene,
  activeAreaZoneCount,
  hasAreaConnections,
  mapConnections,
}: {
  classes: AtlasMapChromeClassNames;
  paleoVisible: boolean;
  paleoThreshold: PaleoThreshold;
  isArtifactOverlayActive: boolean;
  artifactLegendScene: ArtifactOverlayScene;
  activeAreaZoneCount: number;
  hasAreaConnections: boolean;
  mapConnections: readonly MapConnectionProjection[];
}) {
  return (
    <div className={classes.mapLegend} aria-label="地図の地点状態">
      {paleoVisible ? <span><i data-kind="paleo-water" />仮想水域（+{paleoThreshold}m）</span> : null}
      {isArtifactOverlayActive && artifactLegendScene.legend.length > 0 ? (
        <>
          <span style={{ borderLeft: "1px solid rgba(255,255,255,0.2)", paddingLeft: "8px", color: "#c084fc", fontWeight: 600 }}>
            {artifactLegendScene.definition?.icon} {artifactLegendScene.definition?.shortLabel}:
          </span>
          {artifactLegendScene.legend.map((item) => (
            <span key={item.label} title={item.description}>
              <i style={{ "--legend-color": item.color } as CSSProperties}>●</i>
              {item.label}
            </span>
          ))}
        </>
      ) : null}
      <span><i data-kind="selected" />選択中</span>
      <span><i data-category="ancient" style={{ "--legend-color": "#f0cf80" } as CSSProperties}>古</i>古層継承</span>
      <span><i data-category="tradition" style={{ "--legend-color": "#e2a866" } as CSSProperties}>伝</i>古層伝承地</span>
      <span><i data-category="modern" style={{ "--legend-color": "#b388ff" } as CSSProperties}>新</i>現代宗教</span>
      <span><i data-category="museum" style={{ "--legend-color": "#4fc3f7" } as CSSProperties}>館</i>学術展示</span>
      <span><i data-category="candidate" style={{ "--legend-color": "#ffb74d", borderStyle: "dashed" } as CSSProperties}>候</i>未訪問候補</span>
      {activeAreaZoneCount > 0 ? (
        <span><i data-kind="area-zone" />広域エリア</span>
      ) : null}
      {hasAreaConnections ? (
        <span><i data-kind="hull" />勢力圏・領域</span>
      ) : null}
      {mapConnections.some((c) => c.displayMode === "focus-only") ? (
        <span><i data-kind="focus-aura" />比較地点</span>
      ) : null}
    </div>
  );
}
