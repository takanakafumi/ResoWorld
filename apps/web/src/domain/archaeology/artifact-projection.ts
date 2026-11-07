import {
  ARCHAEOLOGICAL_OVERLAYS,
  AVAILABLE_ARTIFACT_OVERLAYS,
} from "./artifact-data";
import type {
  ArchaeologicalSite,
  ArtifactOverlayDefinition,
  ArtifactOverlayId,
} from "./artifact-overlay-types";

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
  totalCount: number;
  primaryUnit: string;
  badgeText: string; // 例: "33面", "358本"
  pixelRadius: number; // 14 ~ 38px
  accentColor: string;
  isSelected: boolean;
  site: ArchaeologicalSite;
}

export interface ArtifactOverlayScene {
  overlayId: ArtifactOverlayId;
  definition: ArtifactOverlayDefinition | null;
  markers: ArtifactMarkerProjection[];
  selectedSite: ArchaeologicalSite | null;
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
      legend: [],
    };
  }

  const markers: ArtifactMarkerProjection[] = definition.sites.map((site: ArchaeologicalSite) => {
    const isSelected = site.id === selectedSiteId;
    const pixelRadius = calculateBubbleRadius(site.bubbleRadiusScale, site.totalCount);
    const badgeText = `${site.totalCount}${site.primaryUnit}`;

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
      totalCount: site.totalCount,
      primaryUnit: site.primaryUnit,
      badgeText,
      pixelRadius,
      accentColor: site.accentColor,
      isSelected,
      site,
    };
  });

  const selectedSite = definition.sites.find((s: ArchaeologicalSite) => s.id === selectedSiteId) ?? null;

  return {
    overlayId,
    definition,
    markers,
    selectedSite,
    legend: definition.legend,
  };
}

export function getAvailableArtifactOverlays(): ArtifactOverlayDefinition[] {
  return AVAILABLE_ARTIFACT_OVERLAYS;
}
