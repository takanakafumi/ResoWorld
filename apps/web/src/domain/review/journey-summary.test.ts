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
        connections: [{ id: "connection-a", connectionKind: "comparative" as const, initialStatus: "confirmed" as const, eyebrow: "A", title: "A", summary: "A", spotIds: ["spot-a", "spot-b"], claimIds: [validClaimFixture.id], concepts: ["祭祀"], facets: [{ id: "ritual", label: "祭祀", weight: 5 }], eras: [] }],
        suggestions: [],
      },
    };

    const result = buildJourneySummaries(dataset);
    expect(result.summaries[0]).toMatchObject({
      label: "探索A",
      claimCount: 1,
      spotCount: 1,
      connectionCount: 1,
      dominantFacets: [{ id: "ritual", label: "祭祀", weight: 5 }],
      leadConnection: { id: "connection-a", title: "A", claimCount: 1 },
    });
    expect(result.summaries[1].leadConnection).toBeUndefined();
    expect(result.commonEntityTypes).toEqual(["Place"]);
  });

  it("prefers a confirmed representative connection over a suggested one", () => {
    const dataset = {
      datasetId: "dataset-a",
      privacy: "local-only" as const,
      documents: [{ id: validClaimFixture.evidence[0].passage.documentId, title: "探索A" }],
      claims: [validClaimFixture],
      atlas: {
        title: "比較",
        journeys: [{ id: "a", label: "探索A", documentIds: [validClaimFixture.evidence[0].passage.documentId], spotIds: [], connectionIds: ["suggested", "confirmed"] }],
        spots: [],
        connections: [
          { id: "suggested", connectionKind: "interpretive" as const, initialStatus: "suggested" as const, eyebrow: "候補", title: "根拠の多い候補", summary: "候補", spotIds: [], claimIds: ["a", "b", "c"], concepts: [], facets: [], eras: [] },
          { id: "confirmed", connectionKind: "documented" as const, initialStatus: "confirmed" as const, eyebrow: "確認", title: "確認済みの接続", summary: "確認済み", spotIds: [], claimIds: ["a"], concepts: [], facets: [], eras: [] },
        ],
        suggestions: [],
      },
    };

    expect(buildJourneySummaries(dataset).summaries[0].leadConnection?.id).toBe("confirmed");
  });
});
