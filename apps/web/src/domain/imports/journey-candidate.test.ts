import { describe, expect, it } from "vitest";

import { validClaimFixture } from "@/domain/knowledge/fixtures";

import { buildJourneyImportCandidate, buildJourneyRegistrationDraft, journeyPlaceCandidateKey } from "./journey-candidate";

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
      lensDecision: "reuse_existing",
    });

    expect(draft).toMatchObject({ schemaVersion: "0.1.0", status: "reviewed_candidate", mode: "new", lensDecision: "reuse_existing" });
    expect(draft.placeCandidates[0]).not.toHaveProperty("latitude");
  });});
