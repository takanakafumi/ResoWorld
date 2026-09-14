import { describe, expect, it } from "vitest";

import { applyJourneyAtlasUpdateDraft, buildJourneyAtlasUpdateDraft, consolidateJourneysByDocumentIdentity } from "./journey-atlas-update";
import type { JourneyPlaceReviewDraft } from "./journey-place-review";

const selection = { query: "地点B", status: "candidate" as const, selected: { id: "n1", provider: "nominatim" as const, displayName: "地点B", latitude: 35, longitude: 135, category: "historic", type: "museum", address: { state: "地域B" }, attribution: "OSM" } };
const review: JourneyPlaceReviewDraft = {
  schemaVersion: "0.1.0", status: "reviewed_place_classification", journey: { id: "journey-a", label: "探索A" }, documentIds: ["document-a"],
  places: [
    { key: "a", name: "地点A", classification: "visited", roles: ["observed_place"], claimIds: ["claim-a"] },
    { key: "b", name: "地点B", classification: "visited", roles: ["observed_place"], claimIds: ["claim-b"], positionCandidate: selection },
    { key: "c", name: "古代国", classification: "historical_candidate", roles: ["subject_place"], claimIds: ["claim-c"] },
    { key: "d", name: "行けなかった史跡", classification: "wanted_unvisited", roles: ["intended_place"], claimIds: ["claim-d"], positionCandidate: { ...selection, query: "行けなかった史跡" } },
  ],
};

describe("buildJourneyAtlasUpdateDraft", () => {
  it("separates reused and candidate Spots from historical candidates", () => {
    const draft = buildJourneyAtlasUpdateDraft(review, [{ id: "spot-a", name: "地点A", region: "地域A", kind: "史跡", latitude: 34, longitude: 134, claimIds: [] }]);
    expect(draft.journey.reusedSpotUpdates).toEqual([{ spotId: "spot-a", addedClaimIds: ["claim-a"] }]);
    expect(draft.candidateSpots).toMatchObject([{ name: "地点B", region: "地域B", kind: "museum", positionStatus: "candidate" }]);
    expect(draft.historicalCandidates).toEqual([{ key: "c", name: "古代国", claimIds: ["claim-c"] }]);
    expect(draft.missedVisitCandidates).toMatchObject([{ name: "行けなかった史跡", targetKind: "missed_visit", latitude: 35, longitude: 135 }]);
  });

  it("prefers the reviewed place name over a generic map-provider type", () => {
    const namedReview = structuredClone(review);
    const place = namedReview.places.find(({ key }) => key === "b")!;
    place.name = "平塚川添遺跡公園体験学習館";
    place.positionCandidate!.selected.type = "park";
    place.positionCandidate!.selected.category = "leisure";

    const draft = buildJourneyAtlasUpdateDraft(namedReview, [{ id: "spot-a", name: "地点A", region: "地域A", kind: "史跡", latitude: 34, longitude: 134, claimIds: [] }]);

    expect(draft.candidateSpots[0].kind).toBe("博物館・歴史資料館");
  });

  it("adds Journey claims to reused Spots and keeps new Spots as candidates", () => {
    const atlas = { title: "Atlas", journeys: [], spots: [{ id: "spot-a", name: "地点A", region: "地域A", kind: "史跡", latitude: 34, longitude: 134, claimIds: ["claim-old"] }], connections: [], suggestions: [] };
    const draft = buildJourneyAtlasUpdateDraft(review, atlas.spots);
    const updated = applyJourneyAtlasUpdateDraft(atlas, draft);
    expect(updated.spots.find(({ id }) => id === "spot-a")?.claimIds).toEqual(["claim-old", "claim-a"]);
    expect(updated.spots.find(({ name }) => name === "地点B")?.positionStatus).toBe("candidate");
    expect(updated.journeys?.[0]).toMatchObject({ id: "journey-a", documentIds: ["document-a"], connectionIds: [] });
    expect(updated.journeys?.[0].unvisitedPlaces).toMatchObject([{ name: "行けなかった史跡", targetKind: "missed_visit" }]);
  });

  it("refuses a draft while a visited place has no reusable or selected position", () => {
    expect(() => buildJourneyAtlasUpdateDraft(review, [])).toThrow(/resolved/);
  });

  it("refuses to add a visited Spot without a supporting Claim", () => {
    const unsupported = {
      ...review,
      places: [{ ...review.places[1], claimIds: [] }],
    };
    expect(() => buildJourneyAtlasUpdateDraft(unsupported, [])).toThrow(/supporting Claim/);
  });

  it("refuses to add a visited Spot without a supporting Claim", () => {
    const unsupported = {
      ...review,
      places: [{ ...review.places[1], claimIds: [] }],
    };
    expect(() => buildJourneyAtlasUpdateDraft(unsupported, [])).toThrow(/supporting Claim/);
  });

  it("updates the existing Journey with the same documents while preserving its stable ID and connections", () => {
    const atlas = {
      title: "Atlas",
      journeys: [{ id: "stable-journey", label: "旧名称", documentIds: ["document-a"], spotIds: ["spot-a"], connectionIds: ["connection-a"] }],
      spots: [{ id: "spot-a", name: "地点A", region: "地域A", kind: "史跡", latitude: 34, longitude: 134, claimIds: [] }],
      connections: [], suggestions: [],
    };
    const draft = buildJourneyAtlasUpdateDraft(review, atlas.spots);
    const updated = applyJourneyAtlasUpdateDraft(atlas, draft);

    expect(updated.journeys).toHaveLength(1);
    expect(updated.journeys?.[0]).toMatchObject({ id: "stable-journey", label: "探索A", connectionIds: ["connection-a"] });
  });

  it("consolidates duplicate Journeys with identical documents without losing spots or connections", () => {
    const atlas = {
      title: "Atlas", spots: [], connections: [], suggestions: [],
      journeys: [
        { id: "stable-journey", label: "旧名称", documentIds: ["document-a"], spotIds: ["spot-a"], connectionIds: ["connection-a"] },
        { id: "draft-journey", label: "新名称", documentIds: ["document-a"], spotIds: ["spot-a", "spot-b"], connectionIds: [] },
      ],
    };
    const updated = consolidateJourneysByDocumentIdentity(atlas);

    expect(updated.journeys).toEqual([{ id: "stable-journey", label: "新名称", documentIds: ["document-a"], spotIds: ["spot-a", "spot-b"], connectionIds: ["connection-a"] }]);
  });
});
