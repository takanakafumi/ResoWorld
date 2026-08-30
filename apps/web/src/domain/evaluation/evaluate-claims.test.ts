import { describe, expect, it } from "vitest";

import { validClaimFixture } from "@/domain/knowledge/fixtures";

import { evaluateClaims } from "./evaluate-claims";

describe("evaluateClaims", () => {
  it("matches paraphrases that share their local evidence anchor", () => {
    const predicted = structuredClone(validClaimFixture);
    predicted.id = "claim-predicted-1";
    predicted.statement = "地点Aの地形と信仰テーマAの関係を検討した。";
    const report = evaluateClaims([validClaimFixture], [predicted]);

    expect(report.matchedCount).toBe(1);
    expect(report.recall).toBe(1);
    expect(report.precision).toBe(1);
  });

  it("treats a narrow Gold anchor contained by a wider Passage as overlapping", () => {
    const predicted = structuredClone(validClaimFixture);
    predicted.id = "claim-predicted-contained";
    predicted.evidence[0].passage.startLine = 1;
    predicted.evidence[0].passage.endLine = 100;
    predicted.statement = "異なる表現の抽出候補。";
    predicted.subject.name = "別の主語";
    predicted.object = { kind: "literal", value: "別の目的語" };
    const report = evaluateClaims([validClaimFixture], [predicted]);

    expect(report.matchedCount).toBe(1);
  });
  it("does not match similar prose anchored to another document", () => {
    const predicted = structuredClone(validClaimFixture);
    predicted.id = "claim-predicted-2";
    predicted.subject.name = "別地点";
    predicted.object = { kind: "literal", value: "別の内容" };
    predicted.evidence[0].passage.documentId = "document-other";
    const report = evaluateClaims([validClaimFixture], [predicted]);

    expect(report.matchedCount).toBe(0);
    expect(report.unmatchedGoldClaimIds).toEqual([validClaimFixture.id]);
  });

  it("classifies epistemic and provenance disagreements", () => {
    const predicted = structuredClone(validClaimFixture);
    predicted.id = "claim-predicted-3";
    predicted.claimKind = "assertion";
    predicted.originType = "ai";
    predicted.evidence[0].sourceNature = "AISuggestion";
    predicted.epistemic.modality = "asserted";
    const report = evaluateClaims([validClaimFixture], [predicted]);

    expect(report.disagreementCounts).toMatchObject({
      claimKind: 1,
      originType: 1,
      sourceNature: 1,
      modality: 1,
    });
  });
});
