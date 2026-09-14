import type { ReviewExplorationSuggestion } from "@/domain/review/types";

export type CurrentVisitSuggestion = ReviewExplorationSuggestion & {
  actionType: "field_visit";
  targetPlaceId: string;
  targetKind: "missed_visit" | "knowledge_unvisited";
};

export type VisitCandidateRejectionReason =
  | "not-an-unvisited-field-visit"
  | "missing-target-place"
  | "missing-grounding"
  | "invalid-position"
  | "missing-visit-purpose";

export type VisitCandidateGateResult =
  | { accepted: true }
  | { accepted: false; reasons: VisitCandidateRejectionReason[] };

export function evaluateVisitCandidate(
  suggestion: ReviewExplorationSuggestion,
): VisitCandidateGateResult {
  const reasons: VisitCandidateRejectionReason[] = [];
  if (
    suggestion.actionType !== "field_visit" ||
    (suggestion.targetKind !== "missed_visit" && suggestion.targetKind !== "knowledge_unvisited")
  ) {
    reasons.push("not-an-unvisited-field-visit");
  }
  if (!suggestion.targetPlaceId?.trim()) reasons.push("missing-target-place");
  if (
    suggestion.claimIds.length === 0 ||
    suggestion.anchorSpotIds.length === 0 ||
    suggestion.connectionIds.length === 0
  ) {
    reasons.push("missing-grounding");
  }
  if (
    !Number.isFinite(suggestion.latitude) ||
    suggestion.latitude < -90 ||
    suggestion.latitude > 90 ||
    !Number.isFinite(suggestion.longitude) ||
    suggestion.longitude < -180 ||
    suggestion.longitude > 180
  ) {
    reasons.push("invalid-position");
  }
  if (
    !suggestion.question.trim() ||
    !suggestion.reason.trim() ||
    !suggestion.expectedObservation.trim()
  ) {
    reasons.push("missing-visit-purpose");
  }
  return reasons.length === 0 ? { accepted: true } : { accepted: false, reasons };
}

export function isCurrentSuggestion(
  suggestion: ReviewExplorationSuggestion,
): suggestion is CurrentVisitSuggestion {
  return evaluateVisitCandidate(suggestion).accepted;
}

export function currentSuggestions(suggestions: ReviewExplorationSuggestion[]) {
  return suggestions
    .filter(isCurrentSuggestion)
    .sort((left, right) => Number(right.targetKind === "missed_visit") - Number(left.targetKind === "missed_visit"));
}
