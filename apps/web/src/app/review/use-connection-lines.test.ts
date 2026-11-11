import { describe, expect, it } from "vitest";
import type { MapConnectionProjection } from "@/domain/map/connections";
import {
  filterConnectionsByVisibility,
  isConnectionDimmed,
  projectConnectionGeometry,
  projectConnectionSegments,
  resolveConnectionAppearance,
  type MapProjector,
} from "./use-connection-lines";

describe("use-connection-lines helpers", () => {
  const sampleConnections: MapConnectionProjection[] = [
    {
      id: "itinerary-1",
      sourceId: "itinerary-1",
      connectionKind: "itinerary",
      origin: "exploration",
      title: "訪問順ルート",
      summary: "スポットAからスポットBへ",
      points: [
        { id: "spot-a", label: "スポットA", longitude: 130.0, latitude: 33.0, kind: "visited" },
        { id: "spot-b", label: "スポットB", longitude: 130.1, latitude: 33.1, kind: "visited" },
      ],
      lensRefs: [],
      claimIds: [],
      assertionIds: [],
      sourceIds: [],
      relationFamilies: [],
      confidences: [],
      displayMode: "line",
      reviewStatus: "reviewed",
      selected: false,
      emphasized: false,
    },
    {
      id: "exploration-1",
      sourceId: "exploration-1",
      connectionKind: "comparative",
      origin: "exploration",
      title: "テーマ比較",
      summary: "スポットAとスポットCの比較",
      points: [
        { id: "spot-a", label: "スポットA", longitude: 130.0, latitude: 33.0, kind: "visited" },
        { id: "spot-c", label: "スポットC", longitude: 130.2, latitude: 33.2, kind: "visited" },
      ],
      lensRefs: [{ lensId: "route", packId: "wajinden-routes", presetId: "wajinden-comparison" }],
      claimIds: [],
      assertionIds: [],
      sourceIds: [],
      relationFamilies: [],
      confidences: [],
      displayMode: "line",
      reviewStatus: "reviewed",
      selected: false,
      emphasized: false,
    },
    {
      id: "knowledge-radial-1",
      sourceId: "knowledge-radial-1",
      connectionKind: "knowledge",
      origin: "knowledge-pack",
      title: "厳島神社と末社群",
      summary: "厳島神社本社から御山神社などへの神域接続",
      points: [
        { id: "itsukushima", label: "厳島神社", longitude: 132.319, latitude: 34.295, kind: "visited" },
        { id: "misen-miyama", label: "御山神社", longitude: 132.325, latitude: 34.279, kind: "visited" },
        { id: "kiyomori-jinja", label: "清盛神社", longitude: 132.316, latitude: 34.300, kind: "visited" },
      ],
      lensRefs: [{ lensId: "mythology", packId: "miyajima-sacred", presetId: "sacred-landscape" }],
      claimIds: [],
      assertionIds: [],
      sourceIds: [],
      relationFamilies: [],
      confidences: [],
      displayMode: "points",
      reviewStatus: "reviewed",
      selected: false,
      emphasized: false,
    },
  ];

  it("filters connections according to visibility flags", () => {
    // Both enabled
    const all = filterConnectionsByVisibility(sampleConnections, {
      itinerary: true,
      lens: true,
    });
    expect(all).toHaveLength(3);

    // Disable itinerary
    const noItinerary = filterConnectionsByVisibility(sampleConnections, {
      itinerary: false,
      lens: true,
    });
    expect(noItinerary.map((c) => c.id)).toEqual(["exploration-1", "knowledge-radial-1"]);

    // Disable lens connections
    const noLens = filterConnectionsByVisibility(sampleConnections, {
      itinerary: true,
      lens: false,
    });
    expect(noLens.map((c) => c.id)).toEqual(["itinerary-1"]);
  });

  it("creates radial segments from anchor point for displayMode: points", () => {
    const projector: MapProjector = {
      project: ([lng, lat]) => ({ x: Math.round(lng * 10), y: Math.round(lat * 10) }),
      getContainer: () => ({ clientWidth: 1000, clientHeight: 800 }),
    };

    const radialConnection = sampleConnections[2];
    const segments = projectConnectionSegments(radialConnection, projector);

    // 1 anchor + 2 targets = 2 radial segments
    expect(segments).toHaveLength(2);
    expect(segments[0].id).toBe("knowledge-radial-1:radial-1");
    expect(segments[1].id).toBe("knowledge-radial-1:radial-2");
    expect(segments[0].points).toBe("1323,343 1323,343");
    expect(segments[1].points).toBe("1323,343 1323,343");
  });

  it("does not generate line segments for displayMode: focus-only", () => {
    const projector: MapProjector = {
      project: ([lng, lat]) => ({ x: Math.round(lng * 10), y: Math.round(lat * 10) }),
      getContainer: () => ({ clientWidth: 1000, clientHeight: 800 }),
    };

    const focusOnlyConnection: MapConnectionProjection = {
      ...sampleConnections[0],
      id: "focus-only-test",
      displayMode: "focus-only",
    };
    const segments = projectConnectionSegments(focusOnlyConnection, projector);
    expect(segments).toEqual([]);
  });

  it("resolves line appearance appropriately with category colors", () => {
    // selected overrides origin style with glowing white but preserves none when solid
    const selectedStyle = resolveConnectionAppearance(sampleConnections[0], true);
    expect(selectedStyle.lineStyle.stroke).toBe("#ffffff");
    expect(selectedStyle.lineStyle.strokeDasharray).toBe("10 6"); // itinerary preserves dash pattern!

    // solid connection becomes none on selection
    const solidConnection: MapConnectionProjection = {
      ...sampleConnections[1],
      appearance: { color: "#10b981" },
    };
    const selectedSolid = resolveConnectionAppearance(solidConnection, true);
    expect(selectedSolid.lineStyle.stroke).toBe("#ffffff");
    expect(selectedSolid.lineStyle.strokeDasharray).toBe("none");

    // route category receives emerald green
    const routeStyle = resolveConnectionAppearance(sampleConnections[1], false);
    expect(routeStyle.lineStyle.stroke).toBe("#10b981");

    // mythology category receives amber/gold
    const mythologyStyle = resolveConnectionAppearance(sampleConnections[2], false);
    expect(mythologyStyle.lineStyle.stroke).toBe("#f59e0b");
    expect(mythologyStyle.lineStyle.strokeDasharray).toBe("8 6");
  });

  it("enforces ADR-0027 spatial relational primitives (hypothesis dash, supply chain, alliance mesh)", () => {
    // 1. Hypothesis route connection preserves dashed line when selected
    const hypothesisRoute: MapConnectionProjection = {
      ...sampleConnections[1],
      id: "wajinden-kyushu-hypothesis",
      epistemicRole: "hypothesis_continuation",
      appearance: { color: "#75d4ba", dashArray: [8, 8], legendLabel: "九州説" },
    };
    const unselectedHyp = resolveConnectionAppearance(hypothesisRoute, false);
    expect(unselectedHyp.lineStyle.stroke).toBe("#75d4ba");
    expect(unselectedHyp.lineStyle.strokeDasharray).toBe("8 8");

    const selectedHyp = resolveConnectionAppearance(hypothesisRoute, true);
    expect(selectedHyp.lineStyle.stroke).toBe("#ffffff");
    expect(selectedHyp.lineStyle.strokeDasharray).toBe("8 8"); // Dash preserved!
    expect(selectedHyp.haloStyle.stroke).toBe("#75d4ba");

    // 2. Supply chain 4-item discrete connections with chain dash pattern [12, 4, 3, 4] (ADR-0027)
    const items = [
      { id: "prehistoric-supply-chain-jade", color: "#34d399", label: "ヒスイ流通チェーン" },
      { id: "prehistoric-supply-chain-cinnabar", color: "#f87171", label: "水銀朱流通チェーン" },
      { id: "prehistoric-supply-chain-iron", color: "#94a3b8", label: "鉄資源流通チェーン" },
      { id: "prehistoric-supply-chain-jasper", color: "#38bdf8", label: "碧玉流通チェーン" },
    ];

    for (const item of items) {
      const supplyChain: MapConnectionProjection = {
        ...sampleConnections[1],
        id: item.id,
        appearance: { color: item.color, dashArray: [12, 4, 3, 4], legendLabel: item.label },
      };
      const unselected = resolveConnectionAppearance(supplyChain, false);
      expect(unselected.lineStyle.stroke).toBe(item.color);
      expect(unselected.lineStyle.strokeDasharray).toBe("12 4 3 4");

      const selected = resolveConnectionAppearance(supplyChain, true);
      expect(selected.lineStyle.stroke).toBe("#ffffff");
      expect(selected.lineStyle.strokeDasharray).toBe("12 4 3 4"); // Chain pattern preserved!
      expect(selected.haloStyle.stroke).toBe(item.color);
    }

    // 3. Alliance federation mesh with violet glow
    const allianceMesh: MapConnectionProjection = {
      ...sampleConnections[1],
      id: "sankakubuchi-alliance-corridor",
      appearance: { color: "#c084fc", dashArray: [8, 4], legendLabel: "同笵鏡首長同盟" },
    };
    const resolvedAlliance = resolveConnectionAppearance(allianceMesh, false);
    expect(resolvedAlliance.lineStyle.stroke).toBe("#c084fc");
    expect(resolvedAlliance.lineStyle.strokeDasharray).toBe("8 4");
    expect(resolvedAlliance.haloStyle.stroke).toBe("#c084fc");
  });

  it("projects convex hull polygon and suppresses segments for displayMode: hull", () => {
    const projector: MapProjector = {
      project: ([lng, lat]) => ({ x: Math.round(lng * 100), y: Math.round(lat * 100) }),
      getContainer: () => ({ clientWidth: 1000, clientHeight: 800 }),
    };

    const hullConnection: MapConnectionProjection = {
      ...sampleConnections[0],
      id: "hull-test",
      displayMode: "hull",
      points: [
        { id: "p1", label: "点1", longitude: 130.0, latitude: 33.0, kind: "visited" },
        { id: "p2", label: "点2", longitude: 130.5, latitude: 33.0, kind: "visited" },
        { id: "p3", label: "点3", longitude: 130.2, latitude: 33.4, kind: "visited" },
        { id: "p4", label: "内部点", longitude: 130.2, latitude: 33.1, kind: "visited" },
      ],
    };

    const segments = projectConnectionSegments(hullConnection, projector);
    expect(segments).toEqual([]);

    const geom = projectConnectionGeometry(hullConnection, projector);
    expect(geom.segments).toEqual([]);
    expect(geom.hullPoints).toBeDefined();
    expect(geom.hullPoints?.split(" ")).toHaveLength(3);
  });

  it("projects perimeter closed polygon for displayMode: perimeter", () => {
    const projector: MapProjector = {
      project: ([lng, lat]) => ({ x: Math.round(lng * 100), y: Math.round(lat * 100) }),
      getContainer: () => ({ clientWidth: 1000, clientHeight: 800 }),
    };

    const perimeterConnection: MapConnectionProjection = {
      ...sampleConnections[0],
      id: "perimeter-test",
      displayMode: "perimeter",
      points: [
        { id: "p1", label: "城郭1", longitude: 130.0, latitude: 33.0, kind: "visited" },
        { id: "p2", label: "城郭2", longitude: 130.5, latitude: 33.0, kind: "visited" },
        { id: "p3", label: "城郭3", longitude: 130.2, latitude: 33.4, kind: "visited" },
      ],
    };

    const geom = projectConnectionGeometry(perimeterConnection, projector);
    expect(geom.segments).toEqual([]);
    expect(geom.perimeterPoints).toBeDefined();
    expect(geom.perimeterPoints?.split(" ")).toHaveLength(3);
  });

  describe("isConnectionDimmed (ADR-0025 Visual Projection)", () => {
    const connection: MapConnectionProjection = {
      ...sampleConnections[0],
      id: "dim-test",
      points: [
        { id: "place-1", label: "地点1", longitude: 130.0, latitude: 33.0, kind: "visited", spotId: "spot-101" },
        { id: "place-2", label: "地点2", longitude: 130.5, latitude: 33.0, kind: "reference" },
      ],
    };

    it("returns false when highlightedSpotIds is empty or undefined", () => {
      expect(isConnectionDimmed(connection, undefined)).toBe(false);
      expect(isConnectionDimmed(connection, [])).toBe(false);
    });

    it("returns false when a point matches by id", () => {
      expect(isConnectionDimmed(connection, ["place-2"])).toBe(false);
    });

    it("returns false when a point matches by spotId", () => {
      expect(isConnectionDimmed(connection, ["spot-101"])).toBe(false);
    });

    it("returns true when no points match highlightedSpotIds", () => {
      expect(isConnectionDimmed(connection, ["unrelated-spot-1", "unrelated-spot-2"])).toBe(true);
    });
  });
});
