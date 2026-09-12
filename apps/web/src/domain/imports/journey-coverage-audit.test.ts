import { describe, expect, it } from "vitest";

import { validClaimFixture } from "@/domain/knowledge/fixtures";
import type { ReviewDataset } from "@/domain/review/types";

import { auditJourneyCoverage } from "./journey-coverage-audit";

function dataset(): ReviewDataset {
  const claim = {
    ...validClaimFixture,
    id: "claim-toma",
    subject: { ...validClaimFixture.subject, id: "toma-state", name: "投馬国" },
    evidence: [{ ...validClaimFixture.evidence[0], passage: { ...validClaimFixture.evidence[0].passage, documentId: "doc-a" } }],
  };
  return {
    datasetId: "audit",
    privacy: "anonymized-demo",
    documents: [{ id: "doc-a", title: "旅" }],
    claims: [claim],
    atlas: {
      title: "Atlas",
      journeys: [{ id: "journey-a", label: "探索A", documentIds: ["doc-a"], spotIds: ["spot-a"], connectionIds: [] }],
      spots: [{ id: "spot-a", name: "投馬国候補", region: "九州", kind: "古代候補", latitude: 33, longitude: 130, claimIds: ["claim-toma"] }],
      connections: [],
      suggestions: [],
    },
  };
}

describe("auditJourneyCoverage", () => {
  it("reports resolved journey counts and applicable lenses", () => {
    const [audit] = auditJourneyCoverage(dataset());
    expect(audit).toMatchObject({ documentCount: 1, spotCount: 1, connectionCount: 0 });
    expect(audit.lensIds).toContain("route");
    expect(audit.issues).toEqual([]);
  });

  it("reports broken references without hiding valid journey data", () => {
    const input = dataset();
    input.atlas!.journeys![0].documentIds.push("doc-missing");
    input.atlas!.journeys![0].spotIds.push("spot-missing");
    input.atlas!.journeys![0].connectionIds.push("connection-missing");
    input.atlas!.spots[0].claimIds.push("claim-missing");

    const [audit] = auditJourneyCoverage(input);
    expect(audit.spotCount).toBe(1);
    expect(audit.issues.map((issue) => issue.code)).toEqual(expect.arrayContaining([
      "missing-document",
      "missing-spot",
      "missing-connection",
      "missing-claim",
    ]));
  });

  it("treats absent lens knowledge as information rather than an import error", () => {
    const input = dataset();
    input.claims[0].subject = { ...input.claims[0].subject, id: "unregistered", name: "未登録の関心" };
    const [audit] = auditJourneyCoverage(input);
    expect(audit.issues).toContainEqual(expect.objectContaining({ severity: "info", code: "no-lens-material" }));
    expect(audit.issues.some((issue) => issue.severity === "error")).toBe(false);
  });
});
