import { describe, expect, it } from "vitest";

import { buildJourneySuggestionContext, validateSuggestionDraftReferences } from "./suggestion-drafts";

const dataset = {
  datasetId: "test", privacy: "local-only", documents: [],
  claims: [{
    id: "claim-a", statement: "確認済み", claimKind: "question", reviewStatus: "confirmed",
    historicalTime: null, evidence: [{ passage: { documentId: "doc-a" } }],
  }, {
    id: "claim-b", statement: "別Journey", claimKind: "question", reviewStatus: "confirmed",
    historicalTime: null, evidence: [{ passage: { documentId: "doc-b" } }],
  }],
  atlas: {
    title: "Atlas",
    journeys: [{ id: "journey-a", label: "A", documentIds: ["doc-a"], spotIds: ["spot-a"], connectionIds: ["connection-a"] }],
    spots: [{ id: "spot-a", name: "A", region: "R", kind: "K", latitude: 0, longitude: 0, claimIds: ["claim-a"] }],
    connections: [{
      id: "connection-a", title: "A", summary: "A", claimIds: ["claim-a"], spotIds: ["spot-a"],
      concepts: ["C"], facets: [{ id: "route", label: "route", weight: 5 }],
    }],
    suggestions: [],
  },
} as never;

describe("Journey suggestion drafts", () => {
  it("builds a quote-free context scoped to one Journey", () => {
    const context = buildJourneySuggestionContext(dataset, "journey-a");
    expect(context.claims.map(({ id }) => id)).toEqual(["claim-a"]);
    expect(JSON.stringify(context)).not.toContain("passage");
  });

  it("rejects references outside the Journey context", () => {
    const context = buildJourneySuggestionContext(dataset, "journey-a");
    expect(() => validateSuggestionDraftReferences({ suggestions: [{
      title: "T", targetName: "N", actionType: "literature_research", question: "Q",
      missingInformation: "M", reason: "R", expectedObservation: "O", uncertainty: "U",
      claimIds: ["claim-b"], anchorSpotIds: ["spot-a"], connectionIds: ["connection-a"],
    }] }, context)).toThrow("unknown claimIds");
  });
});
