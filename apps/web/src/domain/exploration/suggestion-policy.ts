import type { ReviewExplorationSuggestion } from "@/domain/review/types";

export function isCurrentSuggestion(suggestion: ReviewExplorationSuggestion) {
  if (suggestion.targetKind) return true;
  return suggestion.actionType === "literature_research";
}

export function currentSuggestions(suggestions: ReviewExplorationSuggestion[]) {
  return suggestions.filter(isCurrentSuggestion);
}
