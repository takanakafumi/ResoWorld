import { describe, expect, it } from "vitest";

import type { JourneyRegistrationDraft } from "./journey-candidate";
import { materializeJourneyRegistration } from "./materialize-journey";
import type { ReviewAtlas } from "@/domain/review/types";
import { validClaimFixture } from "@/domain/knowledge/fixtures";

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

  it("proposes only connections directly backed by one shared Claim", () => {
    const sharedClaim = { ...validClaimFixture, id: "claim-a", statement: "二つの場所を同じ記録が結ぶ。", historicalTime: null };
    const thematicDraft: JourneyRegistrationDraft = {
      ...draft,
      connectionDecision: "review_thematic_connection",
      placeCandidates: [
        draft.placeCandidates[0],
        { name: "第二遺跡", entityId: "entity-place-c", roles: ["observed_place"], claimIds: ["claim-a"] },
      ],
      placeResolutions: {
        ...draft.placeResolutions,
        "entity-place-c": {
          query: "第二遺跡",
          status: "candidate",
          selected: { id: "node:2", provider: "nominatim", displayName: "第二遺跡", latitude: 34, longitude: 131, category: "historic", type: "archaeological_site", address: { province: "福岡県" }, attribution: "© OpenStreetMap contributors" },
        },
      },
    };

    const result = materializeJourneyRegistration(atlas, thematicDraft, [sharedClaim]);

    expect(result.connections).toEqual([
      expect.objectContaining({
        id: "connection-evidence-claim-a",
        initialStatus: "suggested",
        spotIds: ["spot-entity-place-a", "spot-entity-place-c"],
        claimIds: ["claim-a"],
        summary: "二つの場所を同じ記録が結ぶ。",
        eras: [],
      }),
    ]);
    expect(result.journeys?.[0].connectionIds).toEqual(["connection-evidence-claim-a"]);
  });
});
