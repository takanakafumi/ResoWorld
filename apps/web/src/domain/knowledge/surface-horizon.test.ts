import { describe, expect, it } from "vitest";
import publishedDataset from "@/data/published-review-dataset.json";
import type { ReviewAtlasSpot, ReviewDataset } from "@/domain/review/types";
import {
  CHRONOLOGICAL_STRATA,
  buildClaimsByIdMap,
  getSpotStratumDetailReport,
  resolveNonStratumReason,
} from "@/domain/review/stratum-types";
import {
  SURFACE_CONTRAST_PAIRS,
  SURFACE_HORIZON_META,
  SURFACE_HORIZON_ORDER,
  SURFACE_HORIZON_SPOT_PROFILES,
  buildSurfaceHorizonIndex,
  resolveSpotSurfaceHorizon,
} from "./surface-horizon";

describe("Surface Horizon (4象限・表層動態 / Issue #44)", () => {
  const dataset = publishedDataset as unknown as ReviewDataset;
  const spots = dataset.atlas?.spots ?? [];
  const claimsById = buildClaimsByIdMap(dataset.claims);
  const index = buildSurfaceHorizonIndex(spots, { claimsById });

  it("keeps CHRONOLOGICAL_STRATA strictly at 5 historical layers (no L6 / no sub-layers)", () => {
    expect(CHRONOLOGICAL_STRATA).toHaveLength(5);
    expect(SURFACE_HORIZON_ORDER).toHaveLength(4);
    for (const kind of SURFACE_HORIZON_ORDER) {
      expect(SURFACE_HORIZON_META[kind].label).toBeTruthy();
      expect(SURFACE_HORIZON_META[kind].subtitle).toBeTruthy();
    }
  });

  it("excludes museum_archive facilities from the 4 Surface Horizon quadrants (Handling A)", () => {
    expect(index.museumArchiveSpots.length).toBeGreaterThanOrEqual(5);
    for (const spot of index.museumArchiveSpots) {
      const resolution = index.bySpotId.get(spot.id);
      expect(resolution?.status).toBe("excluded");
      if (resolution?.status === "excluded") {
        expect(resolution.exclusionReason).toBe("museum_archive");
      }
      expect(resolveNonStratumReason(spot)).toBe("museum_archive");
    }

    // Spot-check key museums remain excluded while Genbaku Dome (open-air heritage monument) is included
    const hiroshimaPeaceMuseum = spots.find((s) => s.name === "広島平和記念資料館");
    const itokokuMuseum = spots.find((s) => s.name === "伊都国歴史博物館");
    const genbakuDome = spots.find((s) => s.id === "spot-import-726e7d67");
    expect(hiroshimaPeaceMuseum).toBeDefined();
    expect(itokokuMuseum).toBeDefined();
    expect(genbakuDome).toBeDefined();

    expect(index.bySpotId.get(hiroshimaPeaceMuseum!.id)?.status).toBe("excluded");
    expect(index.bySpotId.get(itokokuMuseum!.id)?.status).toBe("excluded");

    const genbakuRes = index.bySpotId.get(genbakuDome!.id);
    expect(genbakuRes?.status).toBe("resolved");
    if (genbakuRes?.status === "resolved") {
      expect(genbakuRes.kind).toBe("tourism_world_heritage");
    }
  });

  it("classifies representative sites across all 4 Surface Horizon quadrants cleanly using field_observation and formationModel", () => {
    const spotResByName = (name: string) => {
      const found = spots.find((s) => s.name === name);
      expect(found, `Expected dataset spot "${name}"`).toBeDefined();
      return index.bySpotId.get(found!.id);
    };

    const expectations: Array<{ name: string; expectedKind: string }> = [
      { name: "厳島神社", expectedKind: "tourism_world_heritage" },
      { name: "原爆ドーム", expectedKind: "tourism_world_heritage" },
      { name: "唐戸市場", expectedKind: "tourism_world_heritage" },
      { name: "御山神社", expectedKind: "quiet_living_tradition" },
      { name: "萩", expectedKind: "quiet_living_tradition" },
      { name: "筑紫神社", expectedKind: "quiet_living_tradition" },
      { name: "長門湯本", expectedKind: "urban_regeneration_experiment" },
      { name: "白神社", expectedKind: "urban_regeneration_experiment" },
      { name: "福山城", expectedKind: "urban_regeneration_experiment" },
      { name: "宝満神宮寺・根本山 宝満堂", expectedKind: "conception_modern_creation" },
    ];

    for (const { name, expectedKind } of expectations) {
      const res = spotResByName(name);
      expect(res?.status, `Spot "${name}" should be resolved`).toBe("resolved");
      if (res?.status === "resolved") {
        expect(res.kind).toBe(expectedKind);
        // Every embedded observationClaim strictly belongs to field_observation (orthogonality)
        expect(res.observationClaims.every((c) => c.temporalScope === "field_observation")).toBe(true);
      }
    }

    // All 4 quadrants contain at least one dataset spot
    for (const kind of SURFACE_HORIZON_ORDER) {
      expect((index.byKind.get(kind) ?? []).length).toBeGreaterThanOrEqual(1);
    }
  });

  it("validates all contrast pairs resolve to real spots with transparent caveats and no museum_archive leakage", () => {
    expect(SURFACE_CONTRAST_PAIRS.length).toBeGreaterThanOrEqual(4);
    expect(SURFACE_HORIZON_SPOT_PROFILES.length).toBeGreaterThanOrEqual(8);

    for (const resolvedPair of index.contrastPairs) {
      expect(resolvedPair.leftSpot, `Missing left spot: ${resolvedPair.pair.leftSpotName}`).toBeDefined();
      expect(resolvedPair.rightSpot, `Missing right spot: ${resolvedPair.pair.rightSpotName}`).toBeDefined();
      expect(resolvedPair.pair.contrastSummary.trim().length).toBeGreaterThan(10);
      expect(resolvedPair.pair.caveatNote.trim().length).toBeGreaterThan(10);

      expect(resolvedPair.leftResolution?.status).toBe("resolved");
      expect(resolvedPair.rightResolution?.status).toBe("resolved");
      if (resolvedPair.leftResolution?.status === "resolved") {
        expect(resolvedPair.leftResolution.kind).toBe(resolvedPair.pair.leftKind);
      }
      if (resolvedPair.rightResolution?.status === "resolved") {
        expect(resolvedPair.rightResolution.kind).toBe(resolvedPair.pair.rightKind);
      }
    }
  });

  it("keeps STRATUM layer matchedCount completely orthogonal from Surface Horizon field_observation counts", () => {
    // 弥山・厳島神社と宝満神宮寺の地層マッチ数（L1〜L5）は Surface Horizon の状態によって変化しない
    const homan = spots.find((s) => s.id === "spot-homan-shinguji")!;
    const homanStratum = getSpotStratumDetailReport(homan, CHRONOLOGICAL_STRATA, { claimsById });
    expect(homanStratum.matchedCount).toBe(0);

    const homanSurface = resolveSpotSurfaceHorizon(homan, { claimsById });
    expect(homanSurface.status).toBe("resolved");
    if (homanSurface.status === "resolved") {
      expect(homanSurface.kind).toBe("conception_modern_creation");
    }

    // Pure transit utility without cultural observations stays excluded
    const syntheticStation: ReviewAtlasSpot = {
      id: "spot-test-station",
      name: "テスト駅",
      region: "福岡",
      kind: "station",
      latitude: 33.5,
      longitude: 130.4,
      claimIds: [],
      mapRole: "visited-place",
    };
    const stationRes = resolveSpotSurfaceHorizon(syntheticStation, { claimsById });
    expect(stationRes.status).toBe("excluded");
    if (stationRes.status === "excluded") {
      expect(stationRes.exclusionReason).toBe("transit_utility");
    }
  });
});
