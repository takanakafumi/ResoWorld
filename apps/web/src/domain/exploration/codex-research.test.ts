import { describe, expect, it } from "vitest";

import {
  CodexResearchOutputSchema,
  CodexResearchRequestSchema,
} from "./codex-research";

describe("Codex research schemas", () => {
  it("keeps URL validation in Zod without unsupported JSON Schema formats", async () => {
    const { CodexResearchJsonSchema } = await import("./codex-research");
    const serialized = JSON.stringify(CodexResearchJsonSchema);
    expect(serialized).not.toContain('"format":"uri"');
  });

  it("accepts sourced candidates that require human review", () => {
    expect(
      CodexResearchOutputSchema.parse({
        summary: "候補を比較した。",
        candidates: [
          {
            targetName: "資料館",
            actionType: "field_visit",
            reason: "比較展示がある。",
            expectedObservation: "展示解説を確認する。",
            uncertainty: "常設展示かは未確認。",
            sources: [{ title: "公式サイト", url: "https://example.com" }],
          },
        ],
        humanReview: ["展示内容を公式情報で再確認する。"],
      }).candidates,
    ).toHaveLength(1);
  });

  it("rejects missing consent and unsourced candidates", () => {
    expect(() =>
      CodexResearchRequestSchema.parse({
        datasetId: "a",
        suggestionId: "b",
      }),
    ).toThrow();
    expect(() =>
      CodexResearchOutputSchema.parse({
        summary: "候補",
        candidates: [],
        humanReview: ["確認"],
      }),
    ).toThrow();
  });
});
