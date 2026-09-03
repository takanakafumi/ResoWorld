import type { Claim } from "@/domain/knowledge/schema";

import type { ReviewStatus } from "./types";

const kindWeight: Record<Claim["claimKind"], number> = {
  question: 40,
  hypothesis: 35,
  suggestion: 35,
  synthesis: 30,
  observation: 20,
  assertion: 10,
};

export function reviewPriorityScore(
  claim: Claim,
  status: ReviewStatus = claim.reviewStatus,
) {
  const unresolved = status === "suggested" || status === "needs_review";
  return (
    (unresolved ? 100 : 0) +
    (claim.originType === "user" ? 50 : 0) +
    kindWeight[claim.claimKind] +
    (claim.places.length > 0 ? 15 : 0) +
    (claim.historicalTime ? 10 : 0) +
    Math.min(claim.evidence.length, 5)
  );
}

export function orderClaimsForReview(
  claims: Claim[],
  statuses: Record<string, ReviewStatus>,
) {
  return claims
    .map((claim, index) => ({
      claim,
      index,
      score: reviewPriorityScore(claim, statuses[claim.id] ?? claim.reviewStatus),
    }))
    .sort((left, right) => right.score - left.score || left.index - right.index)
    .map(({ claim }) => claim);
}
