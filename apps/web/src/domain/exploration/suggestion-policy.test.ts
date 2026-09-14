import { describe, expect, it } from "vitest";

import type { ReviewExplorationSuggestion } from "@/domain/review/types";
import { currentSuggestions, evaluateVisitCandidate } from "./suggestion-policy";

function suggestion(id: string, actionType: ReviewExplorationSuggestion["actionType"], targetKind?: ReviewExplorationSuggestion["targetKind"]): ReviewExplorationSuggestion {
  return {
    id,
    title: "Next comparison site",
    targetName: "Unvisited place",
    targetPlaceId: `place-${id}`,
    actionType,
    targetKind,
    latitude: 35,
    longitude: 135,
    question: "What can be compared on site?",
    missingInformation: "The contents of the local sources.",
    reason: "To test the connection with a visited place.",
    expectedObservation: "Compare the exhibition and remains.",
    uncertainty: "The interpretation may change.",
    claimIds: ["claim-a"],
    anchorSpotIds: ["spot-a"],
    connectionIds: ["connection-a"],
    initialStatus: "suggested",
  };
}

describe("currentSuggestions", () => {
  it("shows only grounded unvisited field-visit candidates and prioritizes missed visits", () => {
    const result = currentSuggestions([
      suggestion("old-revisit", "revisit"), suggestion("old-research", "literature_research"),
      suggestion("knowledge", "field_visit", "knowledge_unvisited"), suggestion("missed", "field_visit", "missed_visit"),
      suggestion("critical", "revisit", "critical_revisit"),
    ]);
    expect(result.map(({ id }) => id)).toEqual(["missed", "knowledge"]);
  });

  it("keeps incomplete ideas out of NEXT until they pass the adoption gate", () => {
    const incomplete = suggestion("idea", "field_visit", "knowledge_unvisited");
    incomplete.targetPlaceId = undefined;
    incomplete.connectionIds = [];
    incomplete.expectedObservation = "";
    expect(evaluateVisitCandidate(incomplete)).toEqual({
      accepted: false,
      reasons: ["missing-target-place", "missing-grounding", "missing-visit-purpose"],
    });
    expect(currentSuggestions([incomplete])).toEqual([]);
  });

  it("rejects a candidate with an invalid position", () => {
    const invalid = suggestion("invalid-position", "field_visit", "missed_visit");
    invalid.latitude = Number.NaN;
    expect(evaluateVisitCandidate(invalid)).toEqual({ accepted: false, reasons: ["invalid-position"] });
  });
});
