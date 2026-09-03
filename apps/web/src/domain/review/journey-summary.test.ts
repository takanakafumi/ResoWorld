import { describe, expect, it } from "vitest";

import { validClaimFixture } from "@/domain/knowledge/fixtures";

import { buildJourneySummaries } from "./journey-summary";

describe("buildJourneySummaries", () => {
  it("summarizes journeys without asserting a historical relation", () => {
    const secondClaim = {
      ...validClaimFixture,
      id: "claim-b",
      subject: { ...validClaimFixture.subject, type: "Place" as const },
      evidence: [{ ...validClaimFixture.evidence[0], passage: { ...validClaimFixture.evidence[0].passage, documentId: "doc-b" } }],
    };
    const dataset = {
      datasetId: "dataset-a",
      privacy: "local-only" as const,
      documents: [{ id: validClaimFixture.evidence[0].passage.documentId, title: "探索A" }, { id: "doc-b", title: "探索B" }],
      claims: [{ ...validClaimFixture, subject: { ...validClaimFixture.subject, type: "Place" as const } }, secondClaim],
      atlas: {
        title: "比較",
        journeys: [
          { id: "a", label: "探索A", documentIds: [validClaimFixture.evidence[0].passage.documentId], spotIds: ["spot-a"], connectionIds: ["connection-a"] },
          { id: "b", label: "探索B", documentIds: ["doc-b"], spotIds: ["spot-b"], connectionIds: [] },
        ],
        spots: [],
        connections: [{ id: "connection-a", connectionKind: "comparative" as const, eyebrow: "A", title: "A", summary: "A", spotIds: ["spot-a", "spot-b"], claimIds: [validClaimFixture.id], concepts: ["祭祀"], facets: [{ id: "ritual", label: "祭祀", weight: 5 }], eras: [] }],
        suggestions: [],
      },
    };

    const result = buildJourneySummaries(dataset);
    expect(result.summaries[0]).toMatchObject({ label: "探索A", claimCount: 1, spotCount: 1, dominantFacets: [{ id: "ritual", label: "祭祀", weight: 5 }] });
    expect(result.commonEntityTypes).toEqual(["Place"]);
  });
});
