import { describe, it, expect } from "vitest";
import { formatEntityVisitBadge, resolveEntityVisitState } from "./entity-visit-state";
import type { ReviewAtlasSpot } from "@/domain/review/types";

describe("Entity Visit State SSOT (resolveEntityVisitState)", () => {
  const dummySpots: ReviewAtlasSpot[] = [
    {
      id: "spot-kashii-gu",
      name: "香椎宮（香椎廟）",
      region: "福岡",
      kind: "神社",
      latitude: 33.66,
      longitude: 130.45,
      claimIds: ["claim-1"],
      mapRole: "visited-place",
      positionStatus: "confirmed",
    },
    {
      id: "spot-unvisited-target",
      name: "未訪問の遺跡",
      region: "福岡",
      kind: "遺跡",
      latitude: 33.5,
      longitude: 130.5,
      claimIds: [],
      mapRole: "candidate-place",
      positionStatus: "candidate",
    },
  ];

  it("resolves visited state from observedSpotIds", () => {
    const result = resolveEntityVisitState(
      { id: "node-1", label: "香椎宮" },
      { claimIds: ["claim-1"], spotIds: ["spot-kashii-gu"], observedSpotIds: ["spot-kashii-gu"] },
      dummySpots,
    );
    expect(result.isVisited).toBe(true);
    expect(result.visitReason).toBe("observed");
    expect(result.primarySpotId).toBe("spot-kashii-gu");
  });

  it("resolves visited state from spotIds fallback", () => {
    const result = resolveEntityVisitState(
      { id: "node-1", label: "香椎宮" },
      { claimIds: ["claim-1"], spotIds: ["spot-kashii-gu"], observedSpotIds: [] },
      dummySpots,
    );
    expect(result.isVisited).toBe(true);
    expect(result.visitReason).toBe("spot_connected");
    expect(result.primarySpotId).toBe("spot-kashii-gu");
  });

  it("resolves visited state from direct spot name match even without link", () => {
    const result = resolveEntityVisitState(
      { id: "kashii-gu", label: "香椎宮", aliases: ["香椎宮", "橿日宮"], kind: "place" },
      undefined,
      dummySpots,
    );
    expect(result.isVisited).toBe(true);
    expect(result.visitReason).toBe("direct_match");
    expect(result.primarySpotId).toBe("spot-kashii-gu");
  });

  it("returns unvisited for candidate-place spots", () => {
    const result = resolveEntityVisitState(
      { id: "node-unvisited", label: "未訪問の遺跡", kind: "place" },
      undefined,
      dummySpots,
    );
    expect(result.isVisited).toBe(false);
    expect(result.visitReason).toBe("unvisited");
  });

  it("returns unvisited if spotIds only contains unvisited candidate spots", () => {
    const result = resolveEntityVisitState(
      { id: "node-unvisited", label: "未訪問の遺跡", kind: "place" },
      { claimIds: ["claim-x"], spotIds: ["spot-unvisited-target"], observedSpotIds: [] },
      dummySpots,
    );
    expect(result.isVisited).toBe(false);
    expect(result.visitReason).toBe("unvisited");
  });

  it("blocks false-positive visit promotion when an unvisited concrete place only co-occurs in another spot or museum Claim", () => {
    const spots: ReviewAtlasSpot[] = [
      {
        id: "spot-onojo-history-museum",
        name: "大野城市歴史資料展示室",
        region: "福岡",
        kind: "資料館",
        latitude: 33.536,
        longitude: 130.479,
        claimIds: ["claim-fukuoka-004"],
        mapRole: "visited-place",
        positionStatus: "confirmed",
      },
      {
        id: "munakata-taisha",
        name: "宗像大社 辺津宮",
        region: "福岡",
        kind: "神社",
        latitude: 33.831,
        longitude: 130.514,
        claimIds: ["MZ-002", "MZ-003"],
        mapRole: "visited-place",
        positionStatus: "confirmed",
      },
    ];

    const ushikubiResult = resolveEntityVisitState(
      {
        id: "ushikubi-kilns",
        label: "牛頸須恵器窯跡群",
        aliases: ["牛頸窯跡群"],
        kind: "place",
        coordinates: { latitude: 33.498, longitude: 130.485 },
      },
      {
        claimIds: ["claim-fukuoka-004"],
        spotIds: ["spot-onojo-history-museum"],
        observedSpotIds: [],
      },
      spots,
    );
    expect(ushikubiResult.isVisited).toBe(false);
    expect(ushikubiResult.visitReason).toBe("unvisited");

    const nakatsumiyaResult = resolveEntityVisitState(
      {
        id: "munakata-nakatsumiya",
        label: "宗像大社 中津宮",
        aliases: ["中津宮", "大島（中津宮）"],
        kind: "place",
        coordinates: { latitude: 33.9004, longitude: 130.4328 },
      },
      {
        claimIds: ["MZ-002", "MZ-003"],
        spotIds: ["munakata-taisha"],
        observedSpotIds: ["munakata-taisha"],
      },
      spots,
    );
    expect(nakatsumiyaResult.isVisited).toBe(false);
    expect(nakatsumiyaResult.visitReason).toBe("unvisited");
  });

  it("allows non-place entities (e.g., polity) to connect via related museum or site spots", () => {
    const spots: ReviewAtlasSpot[] = [
      {
        id: "spot-nakoku-history-museum",
        name: "奴国の丘歴史資料館",
        region: "福岡",
        kind: "資料館",
        latitude: 33.532,
        longitude: 130.453,
        claimIds: ["claim-na-1"],
        mapRole: "visited-place",
        positionStatus: "confirmed",
      },
    ];

    const polityResult = resolveEntityVisitState(
      { id: "na-state", label: "奴国", kind: "polity" },
      { claimIds: ["claim-na-1"], spotIds: ["spot-nakoku-history-museum"], observedSpotIds: [] },
      spots,
    );
    expect(polityResult.isVisited).toBe(true);
    expect(polityResult.visitReason).toBe("spot_connected");
    expect(polityResult.primarySpotId).toBe("spot-nakoku-history-museum");
  });

  it("rolls up spatialGranularity='area' entities strictly by geometry (radiusKm, bounds, memberSpotIds) with zero homonym collisions", () => {
    const spots: ReviewAtlasSpot[] = [
      {
        id: "spot-iwatoyama",
        name: "岩戸山古墳",
        region: "福岡県八女市",
        kind: "古墳",
        latitude: 33.226,
        longitude: 130.556,
        claimIds: ["claim-yame-1"],
        mapRole: "visited-place",
        positionStatus: "confirmed",
      },
      {
        id: "spot-kurume-kora",
        name: "高良大社",
        region: "福岡県久留米市",
        kind: "神社",
        latitude: 33.301,
        longitude: 130.566,
        claimIds: ["claim-kurume-1"],
        mapRole: "visited-place",
        positionStatus: "confirmed",
      },
      {
        id: "spot-yame-admin",
        name: "八女市",
        region: "福岡県八女市",
        kind: "地域・行政区域",
        latitude: 33.21,
        longitude: 130.55,
        claimIds: [],
        mapRole: "visited-place",
        positionStatus: "confirmed",
      },
      {
        id: "spot-asakura-legacy",
        name: "平塚川添遺跡",
        region: "福岡県",
        kind: "遺跡",
        latitude: 33.395,
        longitude: 130.654,
        claimIds: ["claim-asakura-1"],
        mapRole: "visited-place",
        positionStatus: "confirmed",
      },
      {
        // Homonym trap: "大和" in Fukuoka (Yanagawa Yamato-machi) must NEVER match Nara Basin!
        id: "spot-fukuoka-yamato-homonym",
        name: "大和町史跡",
        region: "福岡県柳川市大和町",
        kind: "史跡",
        latitude: 33.14,
        longitude: 130.42,
        claimIds: [],
        mapRole: "visited-place",
        positionStatus: "confirmed",
      },
      {
        // Homonym trap: "朝倉" in Kochi must NEVER match Fukuoka Asakura!
        id: "spot-kochi-asakura-homonym",
        name: "朝倉神社（土佐）",
        region: "高知県高知市朝倉",
        kind: "神社",
        latitude: 33.55,
        longitude: 133.49,
        claimIds: [],
        mapRole: "visited-place",
        positionStatus: "confirmed",
      },
      {
        id: "spot-nara-candidate",
        name: "纒向遺跡",
        region: "奈良県桜井市",
        kind: "遺跡",
        latitude: 34.544,
        longitude: 135.841,
        claimIds: [],
        mapRole: "candidate-place",
        positionStatus: "candidate",
      },
    ];

    // 1. radiusKm rollup excludes admin spot when concrete spots exist
    const chikugoResult = resolveEntityVisitState(
      {
        id: "toma-chikugo",
        label: "筑後・八女周辺",
        kind: "place",
        coordinates: { latitude: 33.21, longitude: 130.56 },
        spatialGranularity: "area",
        areaScope: { radiusKm: 16 },
      },
      undefined,
      spots,
    );
    expect(chikugoResult.granularity).toBe("area");
    expect(chikugoResult.isVisited).toBe(true);
    expect(chikugoResult.visitReason).toBe("area_explored");
    if (chikugoResult.granularity === "area") {
      expect(chikugoResult.hasFootprint).toBe(true);
      // Yanagawa Yamato-machi is physically in Chikugo (14.9km), while admin spot-yame-admin is excluded
      expect(chikugoResult.areaVisitedSpotCount).toBe(3);
      expect(chikugoResult.areaVisitedSpotIds).toEqual([
        "spot-iwatoyama",
        "spot-kurume-kora",
        "spot-fukuoka-yamato-homonym",
      ]);
      expect(chikugoResult.primarySpotId).toBe("spot-iwatoyama");
    }

    // 2. radiusKm captures legacy generic-region spots AND rejects distant homonyms (Kochi Asakura)
    const asakuraResult = resolveEntityVisitState(
      {
        id: "asakura-region",
        label: "朝倉地域",
        kind: "place",
        coordinates: { latitude: 33.414, longitude: 130.665 },
        spatialGranularity: "area",
        areaScope: { radiusKm: 9 },
      },
      undefined,
      spots,
    );
    expect(asakuraResult.granularity).toBe("area");
    expect(asakuraResult.isVisited).toBe(true);
    expect(asakuraResult.visitReason).toBe("area_explored");
    if (asakuraResult.granularity === "area") {
      expect(asakuraResult.areaVisitedSpotCount).toBe(1);
      expect(asakuraResult.areaVisitedSpotIds).toEqual(["spot-asakura-legacy"]);
    }

    // 3. bounds + memberSpotIds explicit rollup
    const explicitResult = resolveEntityVisitState(
      {
        id: "custom-area",
        label: "カスタム地域",
        kind: "place",
        spatialGranularity: "area",
        areaScope: { memberSpotIds: ["spot-kurume-kora"] },
      },
      undefined,
      spots,
    );
    expect(explicitResult.granularity).toBe("area");
    expect(explicitResult.isVisited).toBe(true);
    if (explicitResult.granularity === "area") {
      expect(explicitResult.areaVisitedSpotCount).toBe(1);
    }

    // 4. Nara Basin rejects both candidate-place spots AND Fukuoka Yamato-machi homonym!
    const naraResult = resolveEntityVisitState(
      {
        id: "nara-basin",
        label: "奈良盆地周辺",
        kind: "place",
        coordinates: { latitude: 34.68, longitude: 135.8 },
        spatialGranularity: "area",
        areaScope: { radiusKm: 22 },
      },
      undefined,
      spots,
    );
    expect(naraResult.granularity).toBe("area");
    expect(naraResult.isVisited).toBe(false);
    expect(naraResult.visitReason).toBe("unexplored_area");
    if (naraResult.granularity === "area") {
      expect(naraResult.hasFootprint).toBe(false);
      expect(naraResult.areaVisitedSpotCount).toBe(0);
      expect(naraResult.areaVisitedSpotIds).toEqual([]);
    }
  });

  it("formats orthogonal visit badges from Tagged Union resolution", () => {
    expect(
      formatEntityVisitBadge({
        granularity: "area",
        isVisited: true,
        hasFootprint: true,
        visitReason: "area_explored",
        areaVisitedSpotCount: 5,
        areaVisitedSpotIds: ["a", "b", "c", "d", "e"],
      }),
    ).toBe("◎ 地域踏査済 (5地点)");
    expect(
      formatEntityVisitBadge({
        granularity: "area",
        isVisited: false,
        hasFootprint: false,
        visitReason: "unexplored_area",
        areaVisitedSpotCount: 0,
        areaVisitedSpotIds: [],
      }),
    ).toBe("◇ 比定エリア");
    expect(
      formatEntityVisitBadge({
        granularity: "site",
        isVisited: true,
        visitReason: "observed",
      }),
    ).toBe("● 訪問済");
    expect(
      formatEntityVisitBadge({
        granularity: "site",
        isVisited: false,
        visitReason: "unvisited",
      }),
    ).toBe("○ 未訪問");
  });
});
