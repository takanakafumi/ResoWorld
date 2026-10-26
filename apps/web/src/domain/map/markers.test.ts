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
      kind: "訪問地点候補",
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
      kind: "訪問地点候補",
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
});
