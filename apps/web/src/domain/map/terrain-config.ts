export type TerrainDemEncoding = "terrarium" | "mapbox";

export type TerrainExaggeration = 1 | 1.5 | 2.2;

export const TERRAIN_EXAGGERATION_OPTIONS: readonly {
  value: TerrainExaggeration;
  label: string;
  description: string;
}[] = [
  { value: 1, label: "1.0×", description: "実寸標高（自然な起伏）" },
  { value: 1.5, label: "1.5×", description: "標準強調（国東の開析谷・山宮を読みやすく表示）" },
  { value: 2.2, label: "2.2×", description: "強強調（遠景から尾根・谷筋を把握）" },
];

export const TERRAIN_DEM_SOURCE_ID = "terrain-dem";
export const TERRAIN_RELIEF_HILLSHADE_LAYER_ID = "terrain-relief-hillshade";
export const TERRAIN_FALLBACK_HILLSHADE_LAYER_ID = "terrain-fallback-hillshade";

export const DEFAULT_TERRAIN_DEM_URL =
  "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png";
export const DEFAULT_TERRAIN_DEM_ENCODING: TerrainDemEncoding = "terrarium";
export const DEFAULT_TERRAIN_DEM_ATTRIBUTION =
  '<a href="https://registry.opendata.aws/terrain-tiles/" target="_blank" rel="noreferrer">Terrain: AWS Open Data (Mapzen / SRTM)</a>';
export const DEFAULT_TERRAIN_DEM_PROVIDER_LABEL = "AWS Open Data (Terrarium / SRTM)";

export type TerrainDemConfig = {
  sourceId: string;
  tileUrl: string;
  encoding: TerrainDemEncoding;
  tileSize: 256 | 512;
  maxzoom: number;
  attribution: string;
  providerLabel: string;
};

export function resolveTerrainDemConfig(
  env: Record<string, string | undefined> = typeof process !== "undefined" ? process.env : {},
): TerrainDemConfig {
  const tileUrl = env.NEXT_PUBLIC_TERRAIN_DEM_URL?.trim() || DEFAULT_TERRAIN_DEM_URL;
  const rawEncoding = env.NEXT_PUBLIC_TERRAIN_DEM_ENCODING?.trim().toLowerCase();
  const encoding: TerrainDemEncoding =
    rawEncoding === "mapbox" ? "mapbox" : DEFAULT_TERRAIN_DEM_ENCODING;
  const attribution =
    env.NEXT_PUBLIC_TERRAIN_DEM_ATTRIBUTION?.trim() || DEFAULT_TERRAIN_DEM_ATTRIBUTION;
  const providerLabel =
    env.NEXT_PUBLIC_TERRAIN_DEM_URL?.trim()
      ? "カスタム Raster DEM"
      : DEFAULT_TERRAIN_DEM_PROVIDER_LABEL;

  return {
    sourceId: TERRAIN_DEM_SOURCE_ID,
    tileUrl,
    encoding,
    tileSize: 256,
    maxzoom: 15,
    attribution,
    providerLabel,
  };
}

/**
 * Issue #13: 国東半島・六郷満山・宇佐御許山の垂直構造と放射状開析谷を
 * 2D / 3D Terrain で比較検証するための標準カメラ視点。
 */
export const KUNISAKI_TERRAIN_SPIKE_VIEW = {
  label: "国東・六郷満山（3D検証視点）",
  description: "宇佐神宮（里宮）〜御許山（標高647m）〜熊野磨崖仏〜両子寺（両子山721m）の起伏を俯瞰",
  center: [131.495, 33.532] as [number, number],
  zoom: 11.0,
  pitch: 56,
  bearing: -16,
  defaultPitchOnEnable: 52,
  defaultBearingOnEnable: -12,
  maxPitch: 75,
  spotIds: [
    "usa-jingu",
    "omoto-jinja",
    "kumano-magaibutsu",
    "futagoji",
    "oita-history-museum",
  ] as const,
} as const;

/**
 * 2D / 3D Terrain 表示の単一有限状態機械（原則 ⑦: Make Illegal States Unrepresentable）。
 */
export type TerrainState =
  | {
      mode: "2d";
      exaggeration: TerrainExaggeration;
      loadDurationMs: null;
      fallbackReason: null;
    }
  | {
      mode: "3d-terrain";
      status: "loading" | "active";
      exaggeration: TerrainExaggeration;
      loadDurationMs: number | null;
      fallbackReason: null;
    }
  | {
      mode: "2d-fallback";
      exaggeration: TerrainExaggeration;
      loadDurationMs: null;
      fallbackReason: string;
    };

export type TerrainAction =
  | { type: "enable_3d" }
  | { type: "dem_loaded"; loadDurationMs: number }
  | { type: "dem_failed"; reason: string }
  | { type: "disable_3d" }
  | { type: "set_exaggeration"; exaggeration: TerrainExaggeration }
  | { type: "dismiss_fallback" };

export const INITIAL_TERRAIN_STATE: TerrainState = {
  mode: "2d",
  exaggeration: 1.5,
  loadDurationMs: null,
  fallbackReason: null,
};

export function reduceTerrainState(state: TerrainState, action: TerrainAction): TerrainState {
  switch (action.type) {
    case "enable_3d":
      if (state.mode === "3d-terrain") return state;
      return {
        mode: "3d-terrain",
        status: "loading",
        exaggeration: state.exaggeration,
        loadDurationMs: null,
        fallbackReason: null,
      };
    case "dem_loaded":
      if (state.mode !== "3d-terrain") return state;
      return {
        ...state,
        status: "active",
        loadDurationMs: Math.max(0, Math.round(action.loadDurationMs)),
      };
    case "dem_failed":
      if (state.mode !== "3d-terrain") return state;
      return {
        mode: "2d-fallback",
        exaggeration: state.exaggeration,
        loadDurationMs: null,
        fallbackReason: action.reason.trim() || "標高タイルの読み込みに失敗したため、2D陰影表示へ切り替えました。",
      };
    case "disable_3d":
      return {
        mode: "2d",
        exaggeration: state.exaggeration,
        loadDurationMs: null,
        fallbackReason: null,
      };
    case "set_exaggeration":
      return {
        ...state,
        exaggeration: action.exaggeration,
      };
    case "dismiss_fallback":
      if (state.mode !== "2d-fallback") return state;
      return {
        mode: "2d",
        exaggeration: state.exaggeration,
        loadDurationMs: null,
        fallbackReason: null,
      };
  }
}

/**
 * MapLibre の error イベントが Raster DEM ソース由来かどうかを判定する。
 * 通常の OpenStreetMap 背景タイルエラーとは厳密に分離する。
 */
export function isTerrainSourceError(
  event: { sourceId?: string; error?: { message?: string } | null },
  config: Pick<TerrainDemConfig, "sourceId" | "tileUrl">,
): boolean {
  if (event.sourceId === config.sourceId) return true;
  const message = String(event.error?.message ?? "").toLowerCase();
  if (!message) return false;
  if (message.includes("openstreetmap") || message.includes("basemap")) return false;

  const tileHost = (() => {
    try {
      return new URL(config.tileUrl.replace(/\{[zxy]\}/g, "0")).hostname.toLowerCase();
    } catch {
      return "";
    }
  })();

  if (tileHost && message.includes(tileHost)) return true;
  return (
    message.includes(config.sourceId.toLowerCase()) ||
    message.includes("elevation-tiles-prod") ||
    message.includes("terrarium") ||
    message.includes("raster-dem")
  );
}
