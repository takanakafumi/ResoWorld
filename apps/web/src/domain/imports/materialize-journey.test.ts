import { describe, expect, it } from "vitest";

import type { JourneyRegistrationDraft } from "./journey-candidate";
import { materializeJourneyRegistration } from "./materialize-journey";
import type { ReviewAtlas } from "@/domain/review/types";

const atlas: ReviewAtlas = { title: "Atlas", journeys: [], spots: [], connections: [], suggestions: [] };
const draft: JourneyRegistrationDraft = {
  schemaVersion: "0.2.0",
  status: "reviewed_candidate",
  mode: "new",
  targetJourney: { id: "journey-new", label: "新しい探索" },
  documentIds: ["document-new"],
  claimIds: ["claim-a", "claim-unresolved"],
  placeCandidates: [
    { name: "王墓遺跡", entityId: "entity-place-a", roles: ["observed_place"], claimIds: ["claim-a"] },
    { name: "未解決地", entityId: "entity-place-b", roles: ["observed_place"], claimIds: ["claim-unresolved"] },
  ],
  placeResolutions: {
    "entity-place-a": {
      query: "王墓遺跡",
      status: "candidate",
      selected: { id: "node:1", provider: "nominatim", displayName: "王墓遺跡", latitude: 33, longitude: 130, category: "historic", type: "archaeological_site", address: { province: "福岡県", city: "糸島市" }, attribution: "© OpenStreetMap contributors" },
    },
  },
  connectionDecision: "no_connection",
  lensDecision: "reuse_existing",
};

describe("materializeJourneyRegistration", () => {
  it("adds only reviewed place resolutions as candidate spots", () => {
    const result = materializeJourneyRegistration(atlas, draft);

    expect(result.spots).toEqual([expect.objectContaining({ id: "spot-entity-place-a", name: "王墓遺跡", kind: "遺跡・古墳", region: "福岡県 · 糸島市", positionStatus: "candidate", claimIds: ["claim-a"] })]);
    expect(result.journeys).toEqual([expect.objectContaining({ id: "journey-new", documentIds: ["document-new"], spotIds: ["spot-entity-place-a"], connectionIds: [] })]);
  });

  it("merges the same entity into an existing spot and journey", () => {
    const result = materializeJourneyRegistration({ ...atlas, spots: [{ id: "spot-entity-place-a", name: "王墓遺跡", kind: "遺跡・古墳", region: "福岡県 · 糸島市", latitude: 33, longitude: 130, claimIds: ["claim-old"], positionStatus: "confirmed" }], journeys: [{ id: "journey-new", label: "新しい探索", documentIds: ["document-old"], spotIds: ["spot-entity-place-a"], connectionIds: ["connection-old"] }] }, draft);

    expect(result.spots[0]).toMatchObject({ positionStatus: "confirmed", claimIds: ["claim-old", "claim-a"] });
    expect(result.journeys?.[0]).toMatchObject({ documentIds: ["document-old", "document-new"], spotIds: ["spot-entity-place-a"], connectionIds: ["connection-old"] });
  });
});
