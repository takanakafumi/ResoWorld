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
});
