import { describe, expect, it } from "vitest";

import { validClaimFixture } from "@/domain/knowledge/fixtures";

import { orderClaimsForReview, reviewPriorityScore } from "./priority";

describe("review priority", () => {
  it("prioritizes unresolved user questions over AI assertions", () => {
    const aiAssertion = {
      ...validClaimFixture,
      id: "ai-assertion",
      originType: "ai" as const,
      claimKind: "assertion" as const,
    };
    const userQuestion = {
      ...validClaimFixture,
      id: "user-question",
      originType: "user" as const,
      claimKind: "question" as const,
    };

    expect(orderClaimsForReview([aiAssertion, userQuestion], {})).toEqual([
      userQuestion,
      aiAssertion,
    ]);
  });

  it("moves resolved Claims behind unresolved Claims without discarding them", () => {
    const resolved = { ...validClaimFixture, id: "resolved" };
    const unresolved = {
      ...validClaimFixture,
      id: "unresolved",
      reviewStatus: "suggested" as const,
    };
    const ordered = orderClaimsForReview(
      [resolved, unresolved],
      { resolved: "confirmed" },
    );

    expect(ordered).toEqual([unresolved, resolved]);
    expect(ordered).toHaveLength(2);
  });

  it("gives locatable and time-bound Claims an explainable boost", () => {
    const plain = { ...validClaimFixture, places: [], historicalTime: null };
    const connected = {
      ...plain,
      places: validClaimFixture.places,
      historicalTime: validClaimFixture.historicalTime,
    };

    expect(reviewPriorityScore(connected)).toBeGreaterThan(
      reviewPriorityScore(plain),
    );
  });
});
