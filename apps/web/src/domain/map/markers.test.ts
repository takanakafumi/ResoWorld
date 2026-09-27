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

  it("marks selected suggestion as active", () => {
    const markers = projectMapMarkers({
      spots: [],
      suggestions: [dummySuggestion],
      selectedSuggestionId: "sugg-1",
    });
    expect(markers[0].isActive).toBe(true);
  });
});
