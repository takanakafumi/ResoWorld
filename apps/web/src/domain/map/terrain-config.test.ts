import { describe, expect, it } from "vitest";
import publishedDataset from "@/data/published-review-dataset.json";
import {
  DEFAULT_TERRAIN_DEM_ENCODING,
  DEFAULT_TERRAIN_DEM_URL,
  INITIAL_TERRAIN_STATE,
  KUNISAKI_TERRAIN_SPIKE_VIEW,
  TERRAIN_DEM_SOURCE_ID,
  isTerrainSourceError,
  reduceTerrainState,
  resolveTerrainDemConfig,
} from "./terrain-config";

describe("Terrain DEM Config & FSM (Issue #13: 2D / 3D Terrain Spike)", () => {
  it("resolves replaceable Raster DEM provider defaults and supports env overrides", () => {
    const defaults = resolveTerrainDemConfig({});
    expect(defaults.sourceId).toBe(TERRAIN_DEM_SOURCE_ID);
    expect(defaults.tileUrl).toBe(DEFAULT_TERRAIN_DEM_URL);
    expect(defaults.encoding).toBe(DEFAULT_TERRAIN_DEM_ENCODING);
    expect(defaults.attribution).toContain("AWS Open Data");

    const custom = resolveTerrainDemConfig({
      NEXT_PUBLIC_TERRAIN_DEM_URL: "https://example.com/dem/{z}/{x}/{y}.png",
      NEXT_PUBLIC_TERRAIN_DEM_ENCODING: "mapbox",
      NEXT_PUBLIC_TERRAIN_DEM_ATTRIBUTION: "© Custom DEM",
    });
    expect(custom.tileUrl).toBe("https://example.com/dem/{z}/{x}/{y}.png");
    expect(custom.encoding).toBe("mapbox");
    expect(custom.attribution).toBe("© Custom DEM");
    expect(custom.providerLabel).toBe("カスタム Raster DEM");

    const invalidEncoding = resolveTerrainDemConfig({
      NEXT_PUBLIC_TERRAIN_DEM_ENCODING: "unsupported-format",
    });
    expect(invalidEncoding.encoding).toBe("terrarium");
  });

  it("enforces legal state transitions for 2D -> 3D loading -> active -> fallback -> 2D", () => {
    expect(INITIAL_TERRAIN_STATE.mode).toBe("2d");

    const loading = reduceTerrainState(INITIAL_TERRAIN_STATE, { type: "enable_3d" });
    expect(loading.mode).toBe("3d-terrain");
    if (loading.mode === "3d-terrain") {
      expect(loading.status).toBe("loading");
      expect(loading.loadDurationMs).toBeNull();
    }

    const active = reduceTerrainState(loading, { type: "dem_loaded", loadDurationMs: 248.7 });
    expect(active.mode).toBe("3d-terrain");
    if (active.mode === "3d-terrain") {
      expect(active.status).toBe("active");
      expect(active.loadDurationMs).toBe(249);
    }

    const exaggerated = reduceTerrainState(active, { type: "set_exaggeration", exaggeration: 2.2 });
    expect(exaggerated.exaggeration).toBe(2.2);
    expect(exaggerated.mode).toBe("3d-terrain");

    const fallback = reduceTerrainState(exaggerated, {
      type: "dem_failed",
      reason: "DEM tile HTTP 503",
    });
    expect(fallback.mode).toBe("2d-fallback");
    if (fallback.mode === "2d-fallback") {
      expect(fallback.fallbackReason).toContain("503");
      expect(fallback.exaggeration).toBe(2.2);
    }

    const dismissed = reduceTerrainState(fallback, { type: "dismiss_fallback" });
    expect(dismissed.mode).toBe("2d");
    expect(dismissed.exaggeration).toBe(2.2);

    // Retry from fallback enters loading again
    const retried = reduceTerrainState(fallback, { type: "enable_3d" });
    expect(retried.mode).toBe("3d-terrain");
    if (retried.mode === "3d-terrain") {
      expect(retried.status).toBe("loading");
    }

    const backTo2d = reduceTerrainState(retried, { type: "disable_3d" });
    expect(backTo2d.mode).toBe("2d");
  });

  it("ignores dem_loaded and dem_failed when not in 3d-terrain mode", () => {
    expect(reduceTerrainState(INITIAL_TERRAIN_STATE, { type: "dem_loaded", loadDurationMs: 100 })).toEqual(
      INITIAL_TERRAIN_STATE,
    );
    expect(reduceTerrainState(INITIAL_TERRAIN_STATE, { type: "dem_failed", reason: "err" })).toEqual(
      INITIAL_TERRAIN_STATE,
    );
  });

  it("distinguishes Raster DEM tile errors from OpenStreetMap basemap errors", () => {
    const config = resolveTerrainDemConfig({});

    expect(isTerrainSourceError({ sourceId: TERRAIN_DEM_SOURCE_ID }, config)).toBe(true);
    expect(
      isTerrainSourceError(
        { error: { message: "Failed to fetch https://s3.amazonaws.com/elevation-tiles-prod/terrarium/11/1772/820.png" } },
        config,
      ),
    ).toBe(true);
    expect(
      isTerrainSourceError(
        { sourceId: "basemap", error: { message: "OpenStreetMap tile timeout" } },
        config,
      ),
    ).toBe(false);
  });

  it("anchors the Kunisaki 3D spike view around real visited Usa/Kunisaki mountain-sanctuary spots", () => {
    const spots = publishedDataset.atlas.spots;
    const matched = KUNISAKI_TERRAIN_SPIKE_VIEW.spotIds.map((id) =>
      spots.find((s) => s.id === id),
    );
    for (const spot of matched) {
      expect(spot).toBeDefined();
      const [centerLng, centerLat] = KUNISAKI_TERRAIN_SPIKE_VIEW.center;
      const distKm = Math.hypot((spot!.latitude - centerLat) * 111, (spot!.longitude - centerLng) * 91);
      expect(distKm).toBeLessThan(20);
    }
    expect(KUNISAKI_TERRAIN_SPIKE_VIEW.pitch).toBeGreaterThan(30);
    expect(KUNISAKI_TERRAIN_SPIKE_VIEW.pitch).toBeLessThanOrEqual(KUNISAKI_TERRAIN_SPIKE_VIEW.maxPitch);
  });
});
