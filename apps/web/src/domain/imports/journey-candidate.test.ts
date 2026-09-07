import { describe, expect, it } from "vitest";

import { validClaimFixture } from "@/domain/knowledge/fixtures";

import { buildJourneyImportCandidate, buildJourneyRegistrationDraft, combineJourneyImportCandidates, journeyPlaceCandidateKey } from "./journey-candidate";

describe("buildJourneyImportCandidate", () => {
  it("aggregates place candidates but leaves Journey and LENS adoption for review", () => {
    const document = {
      id: validClaimFixture.evidence[0].passage.documentId,
      title: "新しい探索",
      relativePath: "new.txt",
      sha256: validClaimFixture.evidence[0].passage.documentSha256,
      lineCount: 3,
      byteLength: 20,
      passages: [],
    };
    const claim = {
      ...validClaimFixture,
      places: [
        { name: "地点A", role: "observed_place" as const },
        { name: "地点A", role: "evidence_place" as const },
      ],
    };

    const candidate = buildJourneyImportCandidate(document, [claim]);
    expect(candidate).toMatchObject({
      label: "新しい探索",
      documentIds: [document.id],
      claimIds: [claim.id],
      lensDecision: "review_required",
    });
    expect(candidate.placeCandidates).toEqual([{
      name: "地点A",
      entityId: undefined,
      roles: ["observed_place", "evidence_place"],
      claimIds: [claim.id],
    }]);
  });

  it("builds a reviewed registration draft without coordinates or automatic adoption", () => {
    const candidate = buildJourneyImportCandidate({
      id: validClaimFixture.evidence[0].passage.documentId,
      title: "新しい探索",
      relativePath: "new.txt",
      sha256: validClaimFixture.evidence[0].passage.documentSha256,
      lineCount: 3,
      byteLength: 20,
      passages: [],
    }, [{ ...validClaimFixture, places: [{ name: "地点A", role: "observed_place" }] }]);
    const draft = buildJourneyRegistrationDraft(candidate, {
      mode: "new",
      targetJourney: { id: candidate.id, label: candidate.label },
      includedPlaceKeys: candidate.placeCandidates.map(journeyPlaceCandidateKey),
      placeResolutions: {
        "地点a": {
          query: "地点A",
          status: "candidate",
          selected: {
            id: "node:1",
            provider: "nominatim",
            displayName: "地点A, 日本",
            latitude: 35,
            longitude: 135,
            category: "place",
            type: "locality",
            address: { country: "日本" },
            attribution: "© OpenStreetMap contributors",
          },
        },
      },
      connectionDecision: "no_connection",
      lensDecision: "reuse_existing",
    });

    expect(draft).toMatchObject({ schemaVersion: "0.2.0", status: "reviewed_candidate", mode: "new", connectionDecision: "no_connection", lensDecision: "reuse_existing" });
    expect(draft.placeCandidates[0]).not.toHaveProperty("latitude");
    expect(draft.placeResolutions["地点a"]).toMatchObject({ status: "candidate", selected: { latitude: 35, longitude: 135 } });
  });

  it("combines multiple documents into one Journey candidate without duplicating places", () => {
    const first = buildJourneyImportCandidate({
      id: "document-a", title: "探索A", relativePath: "a.txt", sha256: "a".repeat(64), lineCount: 1, byteLength: 1, passages: [],
    }, [{ ...validClaimFixture, id: "claim-a", evidence: validClaimFixture.evidence.map((evidence) => ({ ...evidence, passage: { ...evidence.passage, documentId: "document-a", documentSha256: "a".repeat(64) } })), places: [{ name: "地点A", role: "observed_place" }] }]);
    const second = buildJourneyImportCandidate({
      id: "document-b", title: "探索B", relativePath: "b.txt", sha256: "b".repeat(64), lineCount: 1, byteLength: 1, passages: [],
    }, [{ ...validClaimFixture, id: "claim-b", evidence: validClaimFixture.evidence.map((evidence) => ({ ...evidence, passage: { ...evidence.passage, documentId: "document-b", documentSha256: "b".repeat(64) } })), places: [{ name: "地点A", role: "evidence_place" }] }]);

    const combined = combineJourneyImportCandidates([first, second], { id: "journey-yamatai", label: "邪馬台国探索" });
    expect(combined.documentIds).toEqual(["document-a", "document-b"]);
    expect(combined.claimIds).toEqual(["claim-a", "claim-b"]);
    expect(combined.placeCandidates).toEqual([{ name: "地点A", entityId: undefined, roles: ["observed_place", "evidence_place"], claimIds: ["claim-a", "claim-b"] }]);
    expect(combined.lensDecision).toBe("review_required");
  });
});
