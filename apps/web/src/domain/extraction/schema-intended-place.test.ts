import { describe, expect, it } from "vitest";

import { ExtractedClaimCandidateSchema } from "./schema";

function candidate(documentVoice: "user-narrator" | "ai-narrator", originType: "user" | "ai") {
  return {
    statement: "候補地へ行きたかったが訪問できなかった。",
    subject: { name: "候補地", type: "Place" }, predicate: "was_not_visited",
    object: { kind: "literal", value: true }, claimKind: "observation", originType,
    epistemic: { verification: "personal-evidence", modality: "asserted" }, historicalTime: null,
    places: [{ name: "候補地", role: "intended_place" }],
    evidence: [{ passageId: "passage-1", role: "supports", sourceNature: originType === "user" ? "Observation" : "AISuggestion", documentVoice, sourceTitle: null, sourceUrl: null, note: null }],
  };
}

describe("intended_place extraction boundary", () => {
  it("accepts an explicit user-authored missed visit", () => {
    expect(ExtractedClaimCandidateSchema.safeParse(candidate("user-narrator", "user")).success).toBe(true);
  });

  it("rejects an AI narrator's next-place recommendation as user intent", () => {
    const result = ExtractedClaimCandidateSchema.safeParse(candidate("ai-narrator", "ai"));
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0].message).toContain("direct user-authored");
  });
});
