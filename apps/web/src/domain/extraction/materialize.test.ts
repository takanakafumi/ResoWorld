import { describe, expect, it } from "vitest";

import type { ImportedPassage } from "@/domain/imports/types";

import { materializeExtractedClaims } from "./materialize";

const documentSha256 = "a".repeat(64);
const passage: ImportedPassage = {
  id: "passage-demo-1",
  documentId: "document-demo-1",
  startLine: 4,
  endLine: 5,
  sectionPath: ["地点A"],
  text: "地点Aでは石組みを観察した。信仰との関係は仮説に留まる。",
  sha256: "b".repeat(64),
};

const output = {
  claims: [
    {
      statement: "地点Aの石組みと信仰の関係は仮説である。",
      subject: { name: "地点Aの石組み", type: "Artifact" as const },
      predicate: "may_relate_to",
      object: {
        kind: "entity" as const,
        entity: { name: "信仰", type: "Belief" as const },
      },
      claimKind: "hypothesis" as const,
      originType: "user" as const,
      epistemic: {
        verification: "unverified" as const,
        modality: "hypothetical" as const,
      },
      historicalTime: null,
      places: [
        { name: "地点A", role: "observed_place" as const },
      ],
      evidence: [
        {
          passageId: passage.id,
          role: "supports" as const,
          sourceNature: "UserHypothesis" as const,
          documentVoice: "user-narrator" as const,
          sourceTitle: null,
          sourceUrl: null,
          note: null,
        },
      ],
    },
  ],
};

describe("materializeExtractedClaims", () => {
  it("uses the local passage as the immutable evidence anchor", () => {
    const [claim] = materializeExtractedClaims({
      output,
      passages: [passage],
      documentSha256,
      createdAt: "2026-08-30T00:00:00.000Z",
    });

    expect(claim.reviewStatus).toBe("suggested");
    expect(claim.evidence[0].passage).toEqual({
      documentId: passage.documentId,
      documentSha256,
      startLine: 4,
      endLine: 5,
      quote: passage.text,
      passageSha256: passage.sha256,
    });
  });

  it("rejects evidence that refers to a passage outside the request", () => {
    const changed = structuredClone(output);
    changed.claims[0].evidence[0].passageId = "passage-invented";

    expect(() =>
      materializeExtractedClaims({
        output: changed,
        passages: [passage],
        documentSha256,
        createdAt: "2026-08-30T00:00:00.000Z",
      }),
    ).toThrow("Unknown evidence passage");
  });
});
