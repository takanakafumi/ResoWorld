import { describe, expect, it } from "vitest";

import type { ReviewExplorationSuggestion } from "@/domain/review/types";
import { currentSuggestions } from "./suggestion-policy";

function suggestion(id: string, actionType: ReviewExplorationSuggestion["actionType"], targetKind?: ReviewExplorationSuggestion["targetKind"]) {
  return { id, actionType, targetKind } as ReviewExplorationSuggestion;
}

describe("currentSuggestions", () => {
  it("hides legacy routine revisits but preserves current candidates and research", () => {
    const result = currentSuggestions([
      suggestion("old-revisit", "revisit"), suggestion("old-research", "literature_research"),
      suggestion("missed", "field_visit", "missed_visit"), suggestion("knowledge", "field_visit", "knowledge_unvisited"),
      suggestion("critical", "revisit", "critical_revisit"),
    ]);
    expect(result.map(({ id }) => id)).toEqual(["old-research", "missed", "knowledge", "critical"]);
  });
});
