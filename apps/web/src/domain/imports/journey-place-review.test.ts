import { describe, expect, it } from "vitest";

import { JourneyPlaceReviewDraftSchema, assertJourneyPlaceReviewMatchesCandidate } from "./journey-place-review";
import type { JourneyImportCandidate } from "./journey-candidate";

const candidate: JourneyImportCandidate = {
  id: "journey-a",
  label: "探索A",
  documentIds: ["document-a"],
  claimIds: ["claim-a"],
  placeCandidates: [{ name: "地点A", roles: ["observed_place"], claimIds: ["claim-a"] }],
  entityTypes: [{ type: "Place", count: 1 }],
  lensDecision: "review_required",
};

const draft = {
  schemaVersion: "0.1.0" as const,
  status: "reviewed_place_classification" as const,
  journey: { id: "journey-a", label: "探索A" },
  documentIds: ["document-a"],
  places: [{ key: "地点a", name: "地点A", classification: "visited" as const, roles: ["observed_place" as const], claimIds: ["claim-a"] }],
};

describe("JourneyPlaceReviewDraft", () => {
  it("accepts a review that preserves the source candidate references", () => {
    expect(assertJourneyPlaceReviewMatchesCandidate(candidate, JourneyPlaceReviewDraftSchema.parse(draft))).toMatchObject(draft);
  });

  it("rejects a position candidate on a non-visited place", () => {
    const invalid = {
      ...draft,
      places: [{
        ...draft.places[0],
        classification: "mentioned",
        positionCandidate: {
          query: "地点A",
          status: "candidate",
          selected: {
            id: "a",
            provider: "nominatim",
            displayName: "地点A",
            latitude: 35,
            longitude: 135,
            category: "place",
            type: "locality",
            address: {},
            attribution: "OSM",
          },
        },
      }],
    };
    expect(JourneyPlaceReviewDraftSchema.safeParse(invalid).success).toBe(false);
  });

  it("rejects a visited place without a supporting Claim", () => {
    const invalid = {
      ...draft,
      places: [{ ...draft.places[0], claimIds: [] }],
    };
    expect(JourneyPlaceReviewDraftSchema.safeParse(invalid).success).toBe(false);
  });
});
