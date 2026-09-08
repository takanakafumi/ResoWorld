import { describe, expect, it } from "vitest";

import { buildJourneyAtlasDiff } from "./journey-atlas-diff";
import type { JourneyPlaceReviewDraft } from "./journey-place-review";

const base: JourneyPlaceReviewDraft = {
  schemaVersion: "0.1.0",
  status: "reviewed_place_classification",
  journey: { id: "journey-a", label: "探索A" },
  documentIds: ["document-a"],
  places: [],
};

describe("buildJourneyAtlasDiff", () => {
  it("reuses one existing Spot and requires positions only for unmatched visits", () => {
    const draft: JourneyPlaceReviewDraft = { ...base, places: [
      { key: "a", name: "地点Ａ", classification: "visited", roles: ["observed_place"], claimIds: ["claim-a"] },
      { key: "b", name: "地点B", classification: "visited", roles: ["observed_place"], claimIds: ["claim-b"] },
      { key: "c", name: "古代国", classification: "historical_candidate", roles: ["subject_place"], claimIds: ["claim-c"] },
    ] };
    const diff = buildJourneyAtlasDiff(draft, [{ id: "spot-a", name: "地点A", region: "地域", kind: "史跡", latitude: 35, longitude: 135, claimIds: [] }]);
    expect(diff.reused.map(({ spot }) => spot.id)).toEqual(["spot-a"]);
    expect(diff.unresolved).toEqual([{ placeKey: "b", name: "地点B", reason: "missing_position" }]);
    expect(diff.ignoredCount).toBe(1);
  });
});
