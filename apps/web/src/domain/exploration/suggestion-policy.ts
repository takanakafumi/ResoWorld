import type { ReviewExplorationSuggestion } from "@/domain/review/types";

export function isCurrentSuggestion(suggestion: ReviewExplorationSuggestion) {
  return suggestion.actionType === "field_visit" &&
    (suggestion.targetKind === "missed_visit" || suggestion.targetKind === "knowledge_unvisited");
}

export function currentSuggestions(suggestions: ReviewExplorationSuggestion[]) {
  return suggestions.filter(isCurrentSuggestion);
}
