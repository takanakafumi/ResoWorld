import { describe, expect, it } from "vitest";

import { ClaimExtractionRequestSchema } from "./schema";

const base = {
  file: "second-trip.txt",
  documentSha256: "a".repeat(64),
  provider: "lmstudio" as const,
  model: "qwen/qwen3-14b" as const,
  consent: "process_selected_passages_locally" as const,
};

describe("ClaimExtractionRequestSchema", () => {
  it("accepts a small document split into more than 80 passages", () => {
    const passageIds = Array.from({ length: 105 }, (_, index) => `passage-${index}`);
    expect(
      ClaimExtractionRequestSchema.parse({ ...base, passageIds }).passageIds,
    ).toHaveLength(105);
  });

  it("still caps pathological passage counts", () => {
    const passageIds = Array.from({ length: 501 }, (_, index) => `passage-${index}`);
    expect(() => ClaimExtractionRequestSchema.parse({ ...base, passageIds })).toThrow();
  });

  it("accepts LM Studio request with process_selected_passages_locally", () => {
    const request = {
      ...base,
      provider: "lmstudio" as const,
      model: "qwen/qwen3-14b",
      consent: "process_selected_passages_locally" as const,
      passageIds: ["passage-1"],
    };
    expect(ClaimExtractionRequestSchema.parse(request).provider).toBe("lmstudio");
  });
});
