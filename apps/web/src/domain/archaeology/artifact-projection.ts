import {
  ARCHAEOLOGICAL_OVERLAYS,
  AVAILABLE_ARTIFACT_OVERLAYS,
} from "./artifact-data";
import type {
  ArchaeologicalSite,
  ArtifactOverlayDefinition,
  ArtifactOverlayId,
} from "./artifact-overlay-types";

export type ArtifactMarkerShapeType = "circle" | "diamond" | "hexagon";

export interface ArtifactMarkerProjection {
  id: string;
  siteId: string;
  name: string;
  rubi: string;
  latitude: number;
  longitude: number;
  prefecture: string;
  municipality: string;
  periodLabel: string;
  siteTypeLabel: string;
  burialStructure?: string;
  burialStructureLabel?: string;
  designation?: string;
  provenanceRegion?: string;
  provenanceTypeLabel?: string;
  originSiteId?: string;
  originSiteName?: string;
  isOriginSite: boolean;
  isFocusedOrigin: boolean;
  shapeType: ArtifactMarkerShapeType;
  originKindLabel: string; // "原産地・採掘坑" | "製作工房" | "出土遺跡"
  diamondPoints: string;
  hexagonPoints: string;
  totalCount: number;
  primaryUnit: string;
  badgeText: string; // 例: "33面", "358本"
  pixelRadius: number; // 14 ~ 38px
  accentColor: string;
  isSelected: boolean;
  site: ArchaeologicalSite;
}

export interface ArtifactSupplyChainTrajectory {
  from: {
    latitude: number;
    longitude: number;
    name: string;
  };
  to: {
    latitude: number;
    longitude: number;
    name: string;
  };
  distributionRoute?: string;
}

export interface ArtifactOverlayScene {
  overlayId: ArtifactOverlayId;
  definition: ArtifactOverlayDefinition | null;
  markers: ArtifactMarkerProjection[];
  selectedSite: ArchaeologicalSite | null;
  focusedSelectedMarker: ArtifactMarkerProjection | null;
  focusedOriginMarker: ArtifactMarkerProjection | null;
  originTrajectory: ArtifactSupplyChainTrajectory | null;
  legend: Array<{
    color: string;
    label: string;
    description: string;
  }>;
}

/**
 * 出土数量・スケールに応じた地図上のピクセル半径を計算
 */
export function calculateBubbleRadius(scale: number, totalCount: number): number {
  if (totalCount >= 100) return 38; // 荒神谷（358本）など特大
  switch (scale) {
    case 5:
      return 32; // 30面〜50面クラス（黒塚33面、椿井36面、加茂岩倉39個等）
    case 4:
      return 26; // 10〜20面クラス（備前車塚11面、吉野ヶ里等）
    case 3:
      return 21; // 5〜10面クラス（石塚山7面、雪野山5面等）
    case 2:
      return 17; // 2〜4面クラス
    case 1:
    default:
      return 13; // 1面クラス
  }
}

/**
 * 鉱山・原産地用のダイヤモンド結晶幾何（菱形 polygon points）
 */
export function calculateDiamondPoints(radius: number): string {
  const r = Math.round(radius * 1.18);
  return `0,${-r} ${r},0 0,${r} ${-r},0`;
}

/**
 * 工房用のヘキサゴン幾何（六角形 polygon points）
 */
export function calculateHexagonPoints(radius: number): string {
  const r = Math.round(radius * 1.08);
  const points: string[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3 - Math.PI / 6;
    const x = Math.round(r * Math.cos(angle));
    const y = Math.round(r * Math.sin(angle));
    points.push(`${x},${y}`);
  }
  return points.join(" ");
}

/**
 * 遺物オーバーレイの投影（Projection）
 * Reactコンポーネント外で $O(1)$ で算出可能な純粋関数
 */
export function projectArtifactOverlay(
  overlayId: ArtifactOverlayId,
  selectedSiteId: string | null = null,
): ArtifactOverlayScene {
  const definition: ArtifactOverlayDefinition | null =
    (ARCHAEOLOGICAL_OVERLAYS as Record<string, ArtifactOverlayDefinition | null>)[overlayId] ?? null;

  if (!definition) {
    return {
      overlayId,
      definition: null,
      markers: [],
      selectedSite: null,
      focusedSelectedMarker: null,
      focusedOriginMarker: null,
      originTrajectory: null,
      legend: [],
    };
  }

  const selectedSite = definition.sites.find((s: ArchaeologicalSite) => s.id === selectedSiteId) ?? null;
  const targetOriginSiteId = selectedSite?.provenance?.originSiteId;

  const markers: ArtifactMarkerProjection[] = definition.sites.map((site: ArchaeologicalSite) => {
    const isSelected = site.id === selectedSiteId;
    const pType = site.provenance?.type;
    const isPrimarySource = pType === "primary-source";
    const isWorkshop = pType === "production-workshop";
    const isOriginSite = isPrimarySource || isWorkshop;
    const isFocusedOrigin = Boolean(targetOriginSiteId && site.id === targetOriginSiteId && site.id !== selectedSiteId);
    const pixelRadius = calculateBubbleRadius(site.bubbleRadiusScale, site.totalCount);
    const badgeText = `${site.totalCount}${site.primaryUnit}`;

    const shapeType: ArtifactMarkerShapeType = isPrimarySource
      ? "diamond"
      : isWorkshop
        ? "hexagon"
        : "circle";

    const originKindLabel = isPrimarySource
      ? "原産地・採掘坑"
      : isWorkshop
        ? "製作工房・鋳造地"
        : "出土遺跡・古墳";

    const diamondPoints = calculateDiamondPoints(pixelRadius);
    const hexagonPoints = calculateHexagonPoints(pixelRadius);

    return {
      id: `artifact-marker-${site.id}`,
      siteId: site.id,
      name: site.name,
      rubi: site.rubi,
      latitude: site.coordinates.latitude,
      longitude: site.coordinates.longitude,
      prefecture: site.prefecture,
      municipality: site.municipality,
      periodLabel: site.periodLabel,
      siteTypeLabel: site.siteTypeLabel,
      burialStructure: site.burialStructure,
      burialStructureLabel: site.burialStructureLabel,
      designation: site.designation,
      provenanceRegion: site.provenance?.sourceRegion,
      provenanceTypeLabel: site.provenance?.typeLabel,
      originSiteId: site.provenance?.originSiteId,
      originSiteName: site.provenance?.originSiteName,
      isOriginSite,
      isFocusedOrigin,
      shapeType,
      originKindLabel,
      diamondPoints,
      hexagonPoints,
      totalCount: site.totalCount,
      primaryUnit: site.primaryUnit,
      badgeText,
      pixelRadius,
      accentColor: site.accentColor,
      isSelected,
      site,
    };
  });

  const focusedSelectedMarker = markers.find((m) => m.isSelected) ?? null;
  const focusedOriginMarker = markers.find((m) => m.isFocusedOrigin) ?? null;

  let originTrajectory: ArtifactSupplyChainTrajectory | null = null;
  if (focusedSelectedMarker && selectedSite?.provenance) {
    const p = selectedSite.provenance;
    if (focusedOriginMarker) {
      originTrajectory = {
        from: {
          latitude: focusedOriginMarker.latitude,
          longitude: focusedOriginMarker.longitude,
          name: focusedOriginMarker.name,
        },
        to: {
          latitude: focusedSelectedMarker.latitude,
          longitude: focusedSelectedMarker.longitude,
          name: focusedSelectedMarker.name,
        },
        distributionRoute: p.distributionRoute,
      };
    } else if (p.originCoordinates) {
      originTrajectory = {
        from: {
          latitude: p.originCoordinates.latitude,
          longitude: p.originCoordinates.longitude,
          name: p.originSiteName ?? p.sourceRegion,
        },
        to: {
          latitude: focusedSelectedMarker.latitude,
          longitude: focusedSelectedMarker.longitude,
          name: focusedSelectedMarker.name,
        },
        distributionRoute: p.distributionRoute,
      };
    }
  }

  // 凡例に産地・工房の識別シンボルを統合
  const hasPrimarySource = markers.some((m) => m.shapeType === "diamond");
  const hasWorkshop = markers.some((m) => m.shapeType === "hexagon");

  const extendedLegend = [...definition.legend];
  if (hasPrimarySource) {
    extendedLegend.push({
      color: "#fef08a",
      label: "◇ 原産地・採掘坑（原料供給元）",
      description: "糸魚川ヒスイ原産地、若杉山辰砂採掘坑、出雲花仙山など",
    });
  }
  if (hasWorkshop) {
    extendedLegend.push({
      color: "#38bdf8",
      label: "⬡ 製作工房（鋳造・玉作）",
      description: "須玖岡本工房、近畿中枢銅鐸工房など",
    });
  }

  return {
    overlayId,
    definition,
    markers,
    selectedSite,
    focusedSelectedMarker,
    focusedOriginMarker,
    originTrajectory,
    legend: extendedLegend,
  };
}

export function getAvailableArtifactOverlays(): ArtifactOverlayDefinition[] {
  return AVAILABLE_ARTIFACT_OVERLAYS;
}
