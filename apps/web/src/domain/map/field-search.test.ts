import { describe, expect, it } from "vitest";
import type { ReviewAtlasSpot, ReviewExplorationSuggestion } from "@/domain/review/types";
import {
  buildFieldSearchIndex,
  formatDistanceKm,
  haversineDistanceKm,
  searchFieldTargets,
} from "./field-search";

const SAMPLE_SPOTS: ReviewAtlasSpot[] = [
  {
    id: "spot-yoshinogari-site",
    name: "吉野ヶ里遺跡",
    region: "佐賀県 · 吉野ヶ里町",
    kind: "弥生環濠集落遺跡",
    latitude: 33.3270916,
    longitude: 130.3842637,
    claimIds: ["c1", "c2", "c3"],
    mapRole: "visited-place",
    positionStatus: "confirmed",
  },
  {
    id: "spot-yodohime-jinja",
    name: "與止日女神社",
    region: "佐賀県 · 佐賀市大和町",
    kind: "神社",
    latitude: 33.32627,
    longitude: 130.268321,
    claimIds: ["c4"],
    mapRole: "visited-place",
    positionStatus: "confirmed",
  },
  {
    id: "spot-munakata-hetsumiya",
    name: "宗像大社 辺津宮",
    region: "福岡県 · 宗像市",
    kind: "神社",
    latitude: 33.8313,
    longitude: 130.5141,
    claimIds: ["c5", "c6"],
    mapRole: "visited-place",
    positionStatus: "confirmed",
  },
  {
    id: "spot-area-context-only",
    name: "北部九州広域エリア",
    region: "九州",
    kind: "広域地域",
    latitude: 33.5,
    longitude: 130.4,
    claimIds: [],
    mapRole: "area-context",
    positionStatus: "confirmed",
  },
];

const SAMPLE_SUGGESTIONS: ReviewExplorationSuggestion[] = [
  {
    id: "next-saga-kyoseki-park",
    title: "肥前大和巨石パークを訪問する",
    targetName: "肥前大和巨石パーク",
    targetKind: "missed_visit",
    actionType: "field_visit",
    latitude: 33.337914,
    longitude: 130.262871,
    question: "川上信仰と磐座景観の関係は？",
    missingInformation: "未訪問",
    reason: "雨天のため見送り",
    expectedObservation: "巨石群と谷地形",
    uncertainty: "自然形成との区別",
    claimIds: ["c4"],
    anchorSpotIds: ["spot-yodohime-jinja"],
    connectionIds: [],
    lensId: "religion",
    topicId: "religion-concepts",
    initialStatus: "suggested",
  },
];

describe("field-search domain index and proximity ranking", () => {
  it("computes accurate Haversine distances and formats human-readable labels", () => {
    const dist = haversineDistanceKm(
      { latitude: 33.32627, longitude: 130.268321 }, // Yodohime
      { latitude: 33.337914, longitude: 130.262871 }, // Kyoseki Park (~1.39km)
    );
    expect(dist).toBeGreaterThan(1.2);
    expect(dist).toBeLessThan(1.6);

    expect(formatDistanceKm(0.02)).toBe("現地付近");
    expect(formatDistanceKm(0.354)).toBe("350m");
    expect(formatDistanceKm(1.39)).toBe("1.4km");
    expect(formatDistanceKm(24.7)).toBe("25km");
  });

  it("sorts nearby visited spots and frontier suggestions by proximity from origin when query is empty", () => {
    const index = buildFieldSearchIndex(SAMPLE_SPOTS, SAMPLE_SUGGESTIONS);
    // Excludes area-context spots strictly via mapRole
    expect(index.some((item) => item.id === "spot-area-context-only")).toBe(false);

    const originNearYodohime = { latitude: 33.3265, longitude: 130.268 };
    const results = searchFieldTargets(index, {
      query: "",
      filter: "all",
      origin: originNearYodohime,
    });

    expect(results.map((r) => r.id)).toEqual([
      "spot-yodohime-jinja",
      "next-saga-kyoseki-park",
      "spot-yoshinogari-site",
      "spot-munakata-hetsumiya",
    ]);
    expect(results[0]?.distanceKm).not.toBeNull();
    expect(results[0]!.distanceKm!).toBeLessThan(0.1);
  });

  it("supports multi-token keyword search, kind filtering, and relevance-first ranking", () => {
    const index = buildFieldSearchIndex(SAMPLE_SPOTS, SAMPLE_SUGGESTIONS);

    const sagaOnly = searchFieldTargets(index, {
      query: "佐賀 神社",
      filter: "visited",
      origin: { latitude: 33.327, longitude: 130.384 },
    });
    expect(sagaOnly.map((r) => r.id)).toEqual(["spot-yodohime-jinja"]);

    const suggestionOnly = searchFieldTargets(index, {
      query: "巨石",
      filter: "suggestion",
      origin: { latitude: 33.326, longitude: 130.268 },
    });
    expect(suggestionOnly.map((r) => r.id)).toEqual(["next-saga-kyoseki-park"]);
    expect(suggestionOnly[0]?.badge).toBe("次の探索候補");
  });
});
