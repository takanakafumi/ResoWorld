import { describe, expect, it } from "vitest";

import { buildJourneyAtlasUpdateDraft } from "./journey-atlas-update";
import type { JourneyPlaceReviewDraft } from "./journey-place-review";

const selection = { query: "地点B", status: "candidate" as const, selected: { id: "n1", provider: "nominatim" as const, displayName: "地点B", latitude: 35, longitude: 135, category: "historic", type: "museum", address: { state: "地域B" }, attribution: "OSM" } };
const review: JourneyPlaceReviewDraft = {
  schemaVersion: "0.1.0", status: "reviewed_place_classification", journey: { id: "journey-a", label: "探索A" }, documentIds: ["document-a"],
  places: [
    { key: "a", name: "地点A", classification: "visited", roles: ["observed_place"], claimIds: ["claim-a"] },
    { key: "b", name: "地点B", classification: "visited", roles: ["observed_place"], claimIds: ["claim-b"], positionCandidate: selection },
    { key: "c", name: "古代国", classification: "historical_candidate", roles: ["subject_place"], claimIds: ["claim-c"] },
  ],
};

describe("buildJourneyAtlasUpdateDraft", () => {
  it("separates reused and candidate Spots from historical candidates", () => {
    const draft = buildJourneyAtlasUpdateDraft(review, [{ id: "spot-a", name: "地点A", region: "地域A", kind: "史跡", latitude: 34, longitude: 134, claimIds: [] }]);
    expect(draft.journey.reusedSpotIds).toEqual(["spot-a"]);
    expect(draft.candidateSpots).toMatchObject([{ name: "地点B", region: "地域B", kind: "museum", positionStatus: "candidate" }]);
    expect(draft.historicalCandidates).toEqual([{ key: "c", name: "古代国", claimIds: ["claim-c"] }]);
  });

  it("refuses a draft while a visited place has no reusable or selected position", () => {
    expect(() => buildJourneyAtlasUpdateDraft(review, [])).toThrow(/resolved/);
  });
});
