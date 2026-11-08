import { describe, expect, it } from "vitest";
import type { MapConnectionProjection } from "@/domain/map/connections";
import {
  filterConnectionsByVisibility,
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
    // selected overrides origin style with glowing white
    const selectedStyle = resolveConnectionAppearance(sampleConnections[0], true);
    expect(selectedStyle.lineStyle.stroke).toBe("#ffffff");

    // route category receives emerald green
    const routeStyle = resolveConnectionAppearance(sampleConnections[1], false);
    expect(routeStyle.lineStyle.stroke).toBe("#10b981");

    // mythology category receives amber/gold
    const mythologyStyle = resolveConnectionAppearance(sampleConnections[2], false);
    expect(mythologyStyle.lineStyle.stroke).toBe("#f59e0b");
    expect(mythologyStyle.lineStyle.strokeDasharray).toBe("8 6");
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
});
