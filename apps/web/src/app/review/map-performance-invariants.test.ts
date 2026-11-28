import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import type { MapConnectionProjection } from "@/domain/map/connections";
import { hasVisibleAreaConnections } from "./use-connection-lines";
import { buildHistoricalLabelSignature } from "./use-historical-overlay";

describe("Map Pan/Zoom Performance Invariants (Issue #53 Phase 1+2)", () => {
  it("isolates per-frame pan/zoom projection hooks out of AtlasMap into encapsulated overlay components", () => {
    const atlasMapSrc = fs.readFileSync(path.resolve(__dirname, "atlas-map.tsx"), "utf-8");

    expect(atlasMapSrc).not.toContain("useConnectionLines(");
    expect(atlasMapSrc).not.toContain("useHistoricalOverlay(");
    expect(atlasMapSrc).not.toContain("useArtifactOverlay(");

    // Ensure movestart/moveend direct DOM data-moving throttling & hover suppression exist
    expect(atlasMapSrc).toContain('setAttribute("data-moving", "true")');
    expect(atlasMapSrc).toContain('removeAttribute("data-moving")');
    expect(atlasMapSrc).toContain("isMapMovingRef.current");

    const cssSrc = fs.readFileSync(path.resolve(__dirname, "atlas.module.css"), "utf-8");
    expect(cssSrc).toContain('.mapLibreShell[data-moving="true"]');
  });

  it("ensures useAreaZoneOverlay only binds render + resize (no redundant move/zoom redraws)", () => {
    const areaOverlaySrc = fs.readFileSync(
      path.resolve(__dirname, "use-area-zone-overlay.ts"),
      "utf-8",
    );
    expect(areaOverlaySrc).toContain('map.on("render", draw)');
    expect(areaOverlaySrc).toContain('map.on("resize", draw)');
    expect(areaOverlaySrc).not.toContain('map.on("move", draw)');
    expect(areaOverlaySrc).not.toContain('map.on("zoom", draw)');
  });

  it("ensures useArtifactOverlay memoizes projectArtifactOverlay to prevent listener teardown cascades", () => {
    const artifactHookSrc = fs.readFileSync(
      path.resolve(__dirname, "use-artifact-overlay.ts"),
      "utf-8",
    );
    expect(artifactHookSrc).toMatch(/useMemo\(\s*\(\)\s*=>\s*projectArtifactOverlay/);
  });

  it("produces stable signatures for historical overlay labels so pan frames never recreate label DOM", () => {
    const frameA = [
      {
        id: "lbl-mizuki",
        label: "水城大土塁",
        sublabel: "664年",
        category: "barrier" as const,
        color: "#ef4444",
        longitude: 130.4995,
        latitude: 33.5108,
      },
    ];
    const frameB = frameA.map((item) => ({ ...item }));
    expect(buildHistoricalLabelSignature(frameA)).toBe(buildHistoricalLabelSignature(frameB));

    const zoomedInFrame = [
      ...frameB,
      {
        id: "lbl-west-kando",
        label: "西門官道",
        sublabel: undefined,
        category: "route-primary" as const,
        color: "#38bdf8",
        longitude: 130.435,
        latitude: 33.554,
      },
    ];
    expect(buildHistoricalLabelSignature(zoomedInFrame)).not.toBe(
      buildHistoricalLabelSignature(frameA),
    );
  });

  it("computes hull/perimeter legend presence statically via hasVisibleAreaConnections", () => {
    const hullConn = {
      id: "conn-hull",
      sourceId: "conn-hull",
      origin: "knowledge-pack",
      connectionKind: "knowledge",
      lensId: "people",
      displayMode: "hull",
      title: "Test Hull",
      summary: "",
      selected: false,
      emphasized: false,
      points: [
        { id: "a", label: "A", longitude: 130.4, latitude: 33.5 },
        { id: "b", label: "B", longitude: 130.5, latitude: 33.6 },
        { id: "c", label: "C", longitude: 130.6, latitude: 33.5 },
      ],
      claimIds: [],
      assertionIds: [],
      sourceIds: [],
      reviewStatus: "reviewed",
    } as unknown as MapConnectionProjection;

    expect(
      hasVisibleAreaConnections([hullConn], { itinerary: false, lens: true }, "people"),
    ).toBe(true);
    expect(
      hasVisibleAreaConnections([hullConn], { itinerary: false, lens: true }, "overview"),
    ).toBe(false);
    expect(
      hasVisibleAreaConnections([hullConn], { itinerary: false, lens: false }, "people"),
    ).toBe(false);
  });
});
