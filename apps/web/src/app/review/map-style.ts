import type { StyleSpecification } from "maplibre-gl";

const tileUrl = process.env.NEXT_PUBLIC_MAP_TILE_URL ?? "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const tileAttribution = process.env.NEXT_PUBLIC_MAP_TILE_ATTRIBUTION ?? "© OpenStreetMap contributors";

const JAPAN_PALEO_BOUNDS: [[number, number], [number, number], [number, number], [number, number]] = [
  [120.9375, 46.07323062540835],
  [154.6875, 46.07323062540835],
  [154.6875, 19.31114335506464],
  [120.9375, 19.31114335506464],
];

const PALEO_WATER_LEVELS = [3, 5, 10, 15, 20, 30] as const;

export function getAssetPath(path: string): string {
  const envBasePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  if (envBasePath) {
    return `${envBasePath.replace(/\/$/, "")}${path}`;
  }
  if (typeof window !== "undefined" && window.location.pathname.startsWith("/ResoWorld")) {
    return `/ResoWorld${path}`;
  }
  return path;
}

export function buildAtlasMapStyle(): StyleSpecification {
  const paleoSources: StyleSpecification["sources"] = {};
  const paleoLayers: StyleSpecification["layers"] = [];

  for (const level of PALEO_WATER_LEVELS) {
    const sourceId = `paleo-water-${level}`;
    paleoSources[sourceId] = {
      type: "image",
      url: getAssetPath(`/maps/paleo/japan-sea-level-${level}m.png?v=japan-levels-1`),
      coordinates: JAPAN_PALEO_BOUNDS,
    };
    paleoLayers.push({
      id: `${sourceId}-fill`,
      type: "raster",
      source: sourceId,
      layout: { visibility: "none" },
      paint: { "raster-opacity": 0.9, "raster-resampling": "nearest" },
    });
  }

  return {
    version: 8,
    sources: {
      basemap: {
        type: "raster",
        tiles: [tileUrl],
        tileSize: 256,
        attribution: tileAttribution,
      },
      hillshade: {
        type: "raster",
        tiles: ["https://cyberjapandata.gsi.go.jp/xyz/hillshademap/{z}/{x}/{y}.png"],
        tileSize: 256,
        attribution: '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">地理院タイル</a>',
      },
      ...paleoSources,
    },
    layers: [
      {
        id: "basemap",
        type: "raster",
        source: "basemap",
        paint: {
          "raster-saturation": -0.75,
          "raster-brightness-max": 0.62,
          "raster-contrast": 0.22,
        },
      },
      {
        id: "paleo-hillshade",
        type: "raster",
        source: "hillshade",
        layout: { visibility: "none" },
        paint: { "raster-opacity": 0.32, "raster-contrast": 0.2 },
      },
      ...paleoLayers,
    ],
  };
}
