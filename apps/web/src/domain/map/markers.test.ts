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
});
