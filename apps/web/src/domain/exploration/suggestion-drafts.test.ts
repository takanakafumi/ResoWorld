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
    journeys: [{ id: "journey-a", label: "A", documentIds: ["doc-a"], spotIds: ["spot-a"], connectionIds: ["connection-a", "itinerary-a", "rejected-a"] }],
    spots: [{ id: "spot-a", name: "A", region: "R", kind: "K", latitude: 0, longitude: 0, claimIds: ["claim-a"] }],
    connections: [{
      id: "connection-a", title: "A", summary: "A", claimIds: ["claim-a"], spotIds: ["spot-a"],
      connectionKind: "interpretive", initialStatus: "suggested", concepts: ["C"], facets: [{ id: "route", label: "route", weight: 5 }],
    }, {
      id: "itinerary-a", title: "訪問順", summary: "移動順", claimIds: ["claim-a"], spotIds: ["spot-a"],
      connectionKind: "itinerary", initialStatus: "confirmed", concepts: ["訪問順"], facets: [],
    }, {
      id: "rejected-a", title: "却下済み", summary: "却下", claimIds: ["claim-a"], spotIds: ["spot-a"],
      connectionKind: "interpretive", initialStatus: "rejected", concepts: ["却下"], facets: [],
    }],
    suggestions: [],
  },
} as never;

describe("Journey suggestion drafts", () => {
  it("builds a quote-free context scoped to one Journey", () => {
    const context = buildJourneySuggestionContext(dataset, "journey-a");
    expect(context.claims.map(({ id }) => id)).toEqual(["claim-a"]);
    expect(context.connections.map(({ id }) => id)).toEqual(["connection-a"]);
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

  it("rejects valid Journey IDs that do not ground the selected Connection", () => {
    const context = buildJourneySuggestionContext(dataset, "journey-a");
    const disconnected = structuredClone(context);
    disconnected.connections[0].claimIds = ["claim-b"];
    expect(() => validateSuggestionDraftReferences({ suggestions: [{
      title: "T", targetName: "N", actionType: "literature_research", question: "何が接続する？",
      missingInformation: "M", reason: "R", expectedObservation: "O", uncertainty: "U",
      claimIds: ["claim-a"], anchorSpotIds: ["spot-a"], connectionIds: ["connection-a"],
    }] }, disconnected)).toThrow("no Claim shared");
  });

  it("rejects internal editorial language in reader-facing prose", () => {
    const context = buildJourneySuggestionContext(dataset, "journey-a");
    expect(() => validateSuggestionDraftReferences({ suggestions: [{
      title: "T", targetName: "N", actionType: "literature_research", question: "構造上の空白は何か？",
      missingInformation: "M", reason: "R", expectedObservation: "O", uncertainty: "U",
      claimIds: ["claim-a"], anchorSpotIds: ["spot-a"], connectionIds: ["connection-a"],
    }] }, context)).toThrow("internal editorial language");
  });

  it("rejects vague placeholders in reader-facing prose", () => {
    const context = buildJourneySuggestionContext(dataset, "journey-a");
    expect(() => validateSuggestionDraftReferences({ suggestions: [{
      title: "T", targetName: "N", actionType: "literature_research", question: "この記録から何が分かる？",
      missingInformation: "M", reason: "R", expectedObservation: "O", uncertainty: "U",
      claimIds: ["claim-a"], anchorSpotIds: ["spot-a"], connectionIds: ["connection-a"],
    }] }, context)).toThrow("internal editorial language");
  });

  it("rejects empty-value placeholders in required explanations", () => {
    const context = buildJourneySuggestionContext(dataset, "journey-a");
    expect(() => validateSuggestionDraftReferences({ suggestions: [{
      title: "解釈を比べる", targetName: "N", actionType: "literature_research", question: "何が異なる？",
      missingInformation: "none", reason: "R", expectedObservation: "O", uncertainty: "U",
      claimIds: ["claim-a"], anchorSpotIds: ["spot-a"], connectionIds: ["connection-a"],
    }] }, context)).toThrow("placeholder for missingInformation");
  });

  it("rejects a question duplicated as its title", () => {
    const context = buildJourneySuggestionContext(dataset, "journey-a");
    expect(() => validateSuggestionDraftReferences({ suggestions: [{
      title: "何が異なる？", targetName: "N", actionType: "literature_research", question: "何が異なる？",
      missingInformation: "M", reason: "R", expectedObservation: "O", uncertainty: "U",
      claimIds: ["claim-a"], anchorSpotIds: ["spot-a"], connectionIds: ["connection-a"],
    }] }, context)).toThrow("uses its question as the title");
  });

  it("rejects generic prose that does not identify missing evidence", () => {
    const context = buildJourneySuggestionContext(dataset, "journey-a");
    expect(() => validateSuggestionDraftReferences({ suggestions: [{
      title: "解釈を比べる", targetName: "展示", actionType: "literature_research", question: "何が異なる？",
      missingInformation: "理解をさらに深める情報。", reason: "関心を広げられるため。", expectedObservation: "展示の説明を比較できる。", uncertainty: "展示解釈は更新される可能性がある。",
      claimIds: ["claim-a"], anchorSpotIds: ["spot-a"], connectionIds: ["connection-a"],
    }] }, context)).toThrow("concrete missing evidence");
  });
});
