import { describe, it, expect } from "vitest";
import { resolveEntityVisitState } from "./entity-visit-state";
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
});
