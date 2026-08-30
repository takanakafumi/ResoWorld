import { describe, expect, it } from "vitest";

import {
  ClaimSchema,
  HistoricalTimeSchema,
  KnowledgeDatasetSchema,
} from "./schema";
import {
  DEMO_DOCUMENT_SHA256,
  validClaimFixture,
  validDatasetFixture,
} from "./fixtures";

describe("ClaimSchema", () => {
  it("accepts an anonymized Claim with evidence", () => {
    expect(ClaimSchema.parse(validClaimFixture)).toEqual(validClaimFixture);
  });

  it("rejects a Claim without evidence", () => {
    const result = ClaimSchema.safeParse({
      ...validClaimFixture,
      evidence: [],
    });

    expect(result.success).toBe(false);
  });

  it("keeps AI suggestions separate from archaeological evidence", () => {
    const result = ClaimSchema.parse({
      ...validClaimFixture,
      id: "claim-ai-suggestion",
      claimKind: "suggestion",
      originType: "ai",
      epistemic: {
        verification: "source-not-checked",
        modality: "suggestion",
      },
      evidence: [
        {
          ...validClaimFixture.evidence[0],
          sourceNature: "Archaeology",
          documentVoice: "ai-paraphrase-of-source",
        },
      ],
    });

    expect(result.claimKind).toBe("suggestion");
    expect(result.originType).toBe("ai");
    expect(result.evidence[0].sourceNature).toBe("Archaeology");
  });
});

describe("HistoricalTimeSchema", () => {
  it("accepts named and non-calendar time without forcing numeric years", () => {
    expect(
      HistoricalTimeSchema.parse({
        kind: "named",
        label: "神話上の時間",
        precision: "non-calendar",
      }),
    ).toEqual({
      kind: "named",
      label: "神話上の時間",
      precision: "non-calendar",
    });
  });

  it("rejects a calendar range whose end precedes its start", () => {
    const result = HistoricalTimeSchema.safeParse({
      kind: "calendar",
      startYear: 800,
      endYear: 700,
    });

    expect(result.success).toBe(false);
  });
});

describe("KnowledgeDatasetSchema", () => {
  it("keeps observation, documentation, and historical time separate", () => {
    const dataset = KnowledgeDatasetSchema.parse(validDatasetFixture);

    expect(dataset.documents[0].observedAt).toBe("2026-08-01");
    expect(dataset.documents[0].documentedAt).toBe("2026-08-02");
    expect(dataset.claims[0].historicalTime).toEqual({
      kind: "named",
      label: "古代",
      precision: "broad-period",
    });
  });

  it("rejects evidence that points to an unknown document", () => {
    const result = KnowledgeDatasetSchema.safeParse({
      ...validDatasetFixture,
      claims: [
        {
          ...validClaimFixture,
          evidence: [
            {
              ...validClaimFixture.evidence[0],
              passage: {
                ...validClaimFixture.evidence[0].passage,
                documentId: "missing-document",
              },
            },
          ],
        },
      ],
    });

    expect(result.success).toBe(false);
  });

  it("rejects evidence when the document hash has changed", () => {
    const result = KnowledgeDatasetSchema.safeParse({
      ...validDatasetFixture,
      claims: [
        {
          ...validClaimFixture,
          evidence: [
            {
              ...validClaimFixture.evidence[0],
              passage: {
                ...validClaimFixture.evidence[0].passage,
                documentSha256:
                  "2222222222222222222222222222222222222222222222222222222222222222",
              },
            },
          ],
        },
      ],
    });

    expect(result.success).toBe(false);
    expect(DEMO_DOCUMENT_SHA256).not.toContain("2");
  });

  it("rejects duplicate Claim IDs", () => {
    const result = KnowledgeDatasetSchema.safeParse({
      ...validDatasetFixture,
      claims: [validClaimFixture, validClaimFixture],
    });

    expect(result.success).toBe(false);
  });
});
