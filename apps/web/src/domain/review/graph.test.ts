import { describe, expect, it } from "vitest";

import { validClaimFixture } from "@/domain/knowledge/fixtures";

import { buildEvidenceGraph } from "./graph";

describe("buildEvidenceGraph", () => {
  it("creates every Relation from a Claim with Evidence", () => {
    const graph = buildEvidenceGraph({
      claims: [validClaimFixture],
      statuses: {},
      selectedClaimId: validClaimFixture.id,
      includeRejected: false,
    });

    expect(graph.edges).toHaveLength(1);
    expect(graph.edges[0].claimId).toBe(validClaimFixture.id);
    expect(validClaimFixture.evidence.length).toBeGreaterThan(0);
  });

  it("excludes rejected Claims from the normal graph", () => {
    const graph = buildEvidenceGraph({
      claims: [validClaimFixture],
      statuses: { [validClaimFixture.id]: "rejected" },
      selectedClaimId: validClaimFixture.id,
      includeRejected: false,
    });

    expect(graph.edges).toEqual([]);
    expect(graph.nodes).toEqual([]);
  });

  it("can include rejected Claims for review", () => {
    const graph = buildEvidenceGraph({
      claims: [validClaimFixture],
      statuses: { [validClaimFixture.id]: "rejected" },
      selectedClaimId: validClaimFixture.id,
      includeRejected: true,
    });

    expect(graph.edges[0].status).toBe("rejected");
  });
});
