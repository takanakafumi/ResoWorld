import { describe, expect, it } from "vitest";

import type {
  ReviewAtlasConnection,
  ReviewExplorationSuggestion,
} from "@/domain/review/types";

import { resolveLensContinuations } from "./lens-continuations";

function connection(id: string, facets: Array<[string, number]>): ReviewAtlasConnection {
  return {
    id,
    connectionKind: "interpretive",
    initialStatus: "confirmed",
    eyebrow: "TEST",
    title: id,
    summary: id,
    spotIds: ["a", "b"],
    claimIds: ["claim-a"],
    concepts: ["test"],
    facets: facets.map(([facetId, weight]) => ({ id: facetId, label: facetId, weight })),
    eras: [],
  };
}

function suggestion(id: string, connectionIds: string[]): ReviewExplorationSuggestion {
  return {
    id,
    title: id,
    targetName: id,
    actionType: "literature_research",
    latitude: 0,
    longitude: 0,
    question: id,
    missingInformation: id,
    reason: id,
    expectedObservation: id,
    uncertainty: id,
    claimIds: ["claim-a"],
    anchorSpotIds: ["a"],
    connectionIds,
    initialStatus: "suggested",
  };
}

describe("resolveLensContinuations", () => {
  it("returns only suggestions connected to the selected Lens facets", () => {
    const suggestions = [
      suggestion("religion-next", ["religion"]),
      suggestion("politics-next", ["politics"]),
      suggestion("unlinked-next", ["missing"]),
    ];
    const result = resolveLensContinuations({
      suggestions,
      connections: [
        connection("religion", [["belief", 5]]),
        connection("politics", [["politics", 4]]),
      ],
      facetIds: ["belief", "ritual"],
    });

    expect(result.map(({ id }) => id)).toEqual(["religion-next"]);
  });

  it("ranks stronger connections first and limits the result", () => {
    const result = resolveLensContinuations({
      suggestions: [
        suggestion("weak", ["weak"]),
        suggestion("strong", ["strong"]),
        suggestion("middle", ["middle"]),
      ],
      connections: [
        connection("weak", [["route", 1]]),
        connection("strong", [["route", 5]]),
        connection("middle", [["route", 3]]),
      ],
      facetIds: ["route"],
      limit: 2,
    });

    expect(result.map(({ id }) => id)).toEqual(["strong", "middle"]);
  });

  it("does not infer a continuation without a linked matching connection", () => {
    expect(resolveLensContinuations({
      suggestions: [suggestion("next", ["religion"])],
      connections: [connection("religion", [["belief", 5]])],
      facetIds: ["politics"],
    })).toEqual([]);
  });
});
