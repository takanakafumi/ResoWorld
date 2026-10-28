import { describe, expect, it } from "vitest";

import { projectMapMarkers } from "./markers";
import type { ReviewAtlasSpot, ReviewExplorationSuggestion } from "../review/types";

describe("projectMapMarkers", () => {
  const dummySpot: ReviewAtlasSpot = {
    id: "spot-1",
    name: "太宰府天満宮",
    kind: "神社",
    region: "筑前",
    latitude: 33.52,
    longitude: 130.53,
    claimIds: [],
  };

  const dummySuggestion: ReviewExplorationSuggestion = {
    id: "sugg-1",
    targetName: "吉野ヶ里遺跡",
    actionType: "field_visit",
    latitude: 33.32,
    longitude: 130.38,
    title: "弥生時代の集落構造",
    reason: "古代国家形成の比較",
    question: "環濠集落の特徴は？",
    expectedObservation: "主祭殿と物見やぐら",
    missingInformation: "最新発掘成果",
    uncertainty: "邪馬台国論争",
    anchorSpotIds: ["spot-1"],
    claimIds: [],
    connectionIds: [],
    initialStatus: "suggested",
  };

  it("projects spots as visited markers", () => {
    const markers = projectMapMarkers({
      spots: [dummySpot],
      suggestions: [],
      selectedSpotId: "spot-1",
    });

    expect(markers).toHaveLength(1);
    expect(markers[0]).toMatchObject({
      id: "spot-1",
      kind: "visited",
      label: "太宰府天満宮",
      isActive: true,
      isVisible: true,
    });
  });

  it("handles suggestions visibility toggle", () => {
    const visibleMarkers = projectMapMarkers({
      spots: [],
      suggestions: [dummySuggestion],
      suggestionsVisible: true,
    });
    expect(visibleMarkers[0].isVisible).toBe(true);

    const hiddenMarkers = projectMapMarkers({
      spots: [],
      suggestions: [dummySuggestion],
      suggestionsVisible: false,
    });
    expect(hiddenMarkers[0].isVisible).toBe(false);
  });

  it("marks selected suggestion as active by id, targetPlaceId, or targetName", () => {
    const suggestionWithPlace = {
      ...dummySuggestion,
      id: "frontier:test-network:place-xyz",
      targetPlaceId: "place-xyz",
      targetName: "特定候補地",
    };

    // By ID
    const byId = projectMapMarkers({
      spots: [],
      suggestions: [suggestionWithPlace],
      selectedSuggestionId: "frontier:test-network:place-xyz",
    });
    expect(byId[0].isActive).toBe(true);

    // By targetPlaceId (e.g. from Lens node click)
    const byPlaceId = projectMapMarkers({
      spots: [],
      suggestions: [suggestionWithPlace],
      selectedSuggestionId: "place-xyz",
    });
    expect(byPlaceId[0].isActive).toBe(true);

    // By targetName
    const byName = projectMapMarkers({
      spots: [],
      suggestions: [suggestionWithPlace],
      selectedSuggestionId: "特定候補地",
    });
    expect(byName[0].isActive).toBe(true);
  });

  it("unifies unvisited reference points from connections into candidate markers (kind: suggestion)", () => {
    const markers = projectMapMarkers({
      spots: [dummySpot],
      suggestions: [],
      mapConnections: [
        {
          id: "conn-1",
          sourceId: "conn-1",
          title: "古代交通線",
          summary: "古代官道の接続",
          displayMode: "line",
          origin: "knowledge-pack",
          connectionKind: "knowledge",
          selected: false,
          emphasized: true,
          points: [
            { id: "spot-1", label: "太宰府天満宮", latitude: 33.52, longitude: 130.53, kind: "visited" },
            { id: "ref-1", label: "赤間関（関門海峡）", latitude: 33.95, longitude: 130.94, kind: "reference" },
          ],
          claimIds: [],
          assertionIds: [],
          sourceIds: [],
          confidences: [],
          relationFamilies: [],
          reviewStatus: "reviewed",
          lensRefs: [],
        },
      ],
    });

    const candidates = markers.filter((m) => m.kind === "suggestion");
    const references = markers.filter((m) => m.kind === "reference");

    expect(references).toHaveLength(0);
    expect(candidates).toHaveLength(1);
    expect(candidates[0]).toMatchObject({
      label: "赤間関（関門海峡）",
      kind: "suggestion",
      icon: "⚑",
      color: "#d7a6ff",
      eyebrow: "次の候補",
      isVisible: true,
    });
    expect(candidates[0].referenceConnections).toHaveLength(1);
    expect(candidates[0].referenceConnections?.[0].id).toBe("conn-1");
  });

  it("attaches matching referenceConnections to existing suggestions", () => {
    const markers = projectMapMarkers({
      spots: [dummySpot],
      suggestions: [dummySuggestion],
      mapConnections: [
        {
          id: "conn-yoshinogari",
          sourceId: "conn-yoshinogari",
          title: "弥生拠点接続",
          summary: "吉野ヶ里との接続",
          displayMode: "line",
          origin: "knowledge-pack",
          connectionKind: "knowledge",
          selected: false,
          emphasized: true,
          points: [
            { id: "spot-1", label: "太宰府天満宮", latitude: 33.52, longitude: 130.53, kind: "visited" },
            { id: "sugg-1", label: "吉野ヶ里遺跡", latitude: 33.32, longitude: 130.38, kind: "suggested" },
          ],
          claimIds: [],
          assertionIds: [],
          sourceIds: [],
          confidences: [],
          relationFamilies: [],
          reviewStatus: "reviewed",
          lensRefs: [],
        },
      ],
    });

    const yoshinoMarker = markers.find((m) => m.id === "sugg-1");
    expect(yoshinoMarker).toBeDefined();
    expect(yoshinoMarker?.referenceConnections).toHaveLength(1);
    expect(yoshinoMarker?.referenceConnections?.[0].id).toBe("conn-yoshinogari");
  });

  it("reflects accepted suggestion status as an exploration plan", () => {
    const markers = projectMapMarkers({
      spots: [dummySpot],
      suggestions: [dummySuggestion],
      suggestionStatuses: {
        "sugg-1": "accepted",
      },
    });

    const candidate = markers.find((m) => m.id === "sugg-1");
    expect(candidate).toBeDefined();
    expect(candidate).toMatchObject({
      status: "accepted",
      eyebrow: "探索計画",
      color: "#ffd166",
      title: "吉野ヶ里遺跡 · 探索計画（関心あり）",
    });
  });

  it("projects candidate frontier spots with candidate styling (Issue #36)", () => {
    const candidateSpot: ReviewAtlasSpot = {
      id: "spot-candidate-ae-kanga",
      name: "阿恵官衙遺跡（国史跡）",
      region: "粕屋・須恵",
      kind: "古代官衙遺跡",
      latitude: 33.6152,
      longitude: 130.4708,
      claimIds: [],
      mapRole: "candidate-place",
      positionStatus: "candidate",
    };

    const markers = projectMapMarkers({
      spots: [dummySpot, candidateSpot],
      suggestions: [],
    });

    const candidateMarker = markers.find((m) => m.id === "spot-candidate-ae-kanga");
    expect(candidateMarker).toBeDefined();
    expect(candidateMarker?.isCandidate).toBe(true);
    expect(candidateMarker?.epistemicNature).toBe("candidate_frontier");
    expect(candidateMarker?.eyebrow).toBe("候補");
    expect(candidateMarker?.icon).toBe("⚑");
    expect(candidateMarker?.color).toBe("#ffb74d");
  });

  it("filters markers by active natureFilter correctly (Issue #36)", () => {
    const ancientSpot: ReviewAtlasSpot = {
      id: "spot-ancient",
      name: "宗像大社 辺津宮",
      kind: "神社・祭祀",
      region: "宗像",
      latitude: 33.83,
      longitude: 130.51,
      claimIds: [],
    };

    const modernReligiousSpot: ReviewAtlasSpot = {
      id: "spot-modern-rel",
      name: "宝満神宮寺・根本山 宝満堂",
      kind: "寺院・宗教施設・現代宗教景観（構想先行型）",
      region: "須恵",
      latitude: 33.59,
      longitude: 130.52,
      claimIds: [],
    };

    const museumSpot: ReviewAtlasSpot = {
      id: "spot-museum",
      name: "須恵町立歴史民俗資料館",
      kind: "博物館・民俗資料館・窯業生活文化",
      region: "須恵",
      latitude: 33.59,
      longitude: 130.50,
      claimIds: [],
    };

    const candidateSpot: ReviewAtlasSpot = {
      id: "spot-candidate-sueki",
      name: "須恵器窯跡群（須恵町窯跡群）",
      kind: "古代窯跡群・遺跡",
      region: "須恵",
      latitude: 33.59,
      longitude: 130.51,
      claimIds: [],
      mapRole: "candidate-place",
      positionStatus: "candidate",
    };

    const allSpots = [ancientSpot, modernReligiousSpot, museumSpot, candidateSpot];

    // 1. ancient_only filter
    const ancientMarkers = projectMapMarkers({
      spots: allSpots,
      suggestions: [],
      natureFilter: "ancient_only",
    });
    expect(ancientMarkers.find((m) => m.id === "spot-ancient")?.isVisible).toBe(true);
    expect(ancientMarkers.find((m) => m.id === "spot-modern-rel")?.isVisible).toBe(false);
    expect(ancientMarkers.find((m) => m.id === "spot-museum")?.isVisible).toBe(false);
    expect(ancientMarkers.find((m) => m.id === "spot-candidate-sueki")?.isVisible).toBe(false);

    // 2. sacred_only filter
    const sacredMarkers = projectMapMarkers({
      spots: allSpots,
      suggestions: [],
      natureFilter: "sacred_only",
    });
    expect(sacredMarkers.find((m) => m.id === "spot-ancient")?.isVisible).toBe(true);
    expect(sacredMarkers.find((m) => m.id === "spot-modern-rel")?.isVisible).toBe(true);
    expect(sacredMarkers.find((m) => m.id === "spot-museum")?.isVisible).toBe(false);

    // 3. museums_only filter
    const museumMarkers = projectMapMarkers({
      spots: allSpots,
      suggestions: [],
      natureFilter: "museums_only",
    });
    expect(museumMarkers.find((m) => m.id === "spot-museum")?.isVisible).toBe(true);
    expect(museumMarkers.find((m) => m.id === "spot-ancient")?.isVisible).toBe(false);
    expect(museumMarkers.find((m) => m.id === "spot-modern-rel")?.isVisible).toBe(false);

    // 4. candidates_only filter
    const candidateMarkers = projectMapMarkers({
      spots: allSpots,
      suggestions: [],
      natureFilter: "candidates_only",
    });
    expect(candidateMarkers.find((m) => m.id === "spot-candidate-sueki")?.isVisible).toBe(true);
    expect(candidateMarkers.find((m) => m.id === "spot-ancient")?.isVisible).toBe(false);
    expect(candidateMarkers.find((m) => m.id === "spot-museum")?.isVisible).toBe(false);
  });

  it("assigns '広域' eyebrow and area styling to area representative spots without burning visit numbers (Issue #39)", () => {
    const areaSpot: ReviewAtlasSpot = {
      id: "spot-area-hagi",
      name: "萩",
      kind: "地域・行政区域",
      region: "山口県 · 萩市",
      latitude: 34.4081,
      longitude: 131.3991,
      claimIds: [],
      mapRole: "visited-place",
    };
    const regularSpot1: ReviewAtlasSpot = {
      id: "spot-1",
      name: "松下村塾",
      kind: "史跡",
      region: "山口県 · 萩市",
      latitude: 34.41,
      longitude: 131.41,
      claimIds: [],
      mapRole: "visited-place",
    };
    const regularSpot2: ReviewAtlasSpot = {
      id: "spot-2",
      name: "萩城跡",
      kind: "史跡",
      region: "山口県 · 萩市",
      latitude: 34.415,
      longitude: 131.38,
      claimIds: [],
      mapRole: "visited-place",
    };

    const markers = projectMapMarkers({
      spots: [areaSpot, regularSpot1, regularSpot2],
      suggestions: [],
    });

    const areaMarker = markers.find((m) => m.id === "spot-area-hagi");
    const m1 = markers.find((m) => m.id === "spot-1");
    const m2 = markers.find((m) => m.id === "spot-2");

    expect(areaMarker?.eyebrow).toBe("広域");
    expect(areaMarker?.icon).toBe("域");
    expect(areaMarker?.color).toBe("#9575cd");
    expect(areaMarker?.category).toBe("area");

    // Regular spots should have consecutive numbers (01, 02) without skipping for area spot
    expect(m1?.eyebrow).toBe("01");
    expect(m2?.eyebrow).toBe("02");
  });

  it("projects Munakata three palaces candidate spots (Okinoshima & Oshima) as candidate frontiers (Issue #40)", () => {
    const okinoshima: ReviewAtlasSpot = {
      id: "spot-candidate-munakata-okitsumiya",
      name: "宗像大社 沖津宮（沖ノ島）",
      region: "福岡県 · 宗像市",
      kind: "神社・古代島嶼祭祀遺跡",
      latitude: 34.2447,
      longitude: 130.1039,
      claimIds: ["MZ-002", "MZ-004"],
      mapRole: "candidate-place",
      positionStatus: "confirmed",
    };
    const nakatsumiya: ReviewAtlasSpot = {
      id: "spot-candidate-munakata-nakatsumiya",
      name: "宗像大社 中津宮（大島）",
      region: "福岡県 · 宗像市",
      kind: "神社・祭祀",
      latitude: 33.8967,
      longitude: 130.4285,
      claimIds: ["MZ-002"],
      mapRole: "candidate-place",
      positionStatus: "confirmed",
    };
    const hetsumiya: ReviewAtlasSpot = {
      id: "munakata-taisha",
      name: "宗像大社 辺津宮",
      region: "宗像",
      kind: "神社・祭祀",
      latitude: 33.831,
      longitude: 130.514,
      claimIds: ["MZ-002"],
      mapRole: "visited-place",
      positionStatus: "confirmed",
    };

    const markers = projectMapMarkers({
      spots: [hetsumiya, nakatsumiya, okinoshima],
      suggestions: [],
    });

    const mHetsu = markers.find((m) => m.id === "munakata-taisha");
    const mNakatsu = markers.find((m) => m.id === "spot-candidate-munakata-nakatsumiya");
    const mOkitsu = markers.find((m) => m.id === "spot-candidate-munakata-okitsumiya");

    // Hetsumiya is visited place with visit order
    expect(mHetsu?.isCandidate).toBe(false);
    expect(mHetsu?.eyebrow).toBe("01");
    expect(mHetsu?.icon).toBe("社");

    // Nakatsumiya and Okitsumiya are candidate frontiers
    expect(mNakatsu?.isCandidate).toBe(true);
    expect(mNakatsu?.eyebrow).toBe("候補");
    expect(mNakatsu?.icon).toBe("⚑");
    expect(mNakatsu?.epistemicNature).toBe("candidate_frontier");

    expect(mOkitsu?.isCandidate).toBe(true);
    expect(mOkitsu?.eyebrow).toBe("候補");
    expect(mOkitsu?.icon).toBe("⚑");
    expect(mOkitsu?.epistemicNature).toBe("candidate_frontier");
  });
});
