import { describe, expect, it } from "vitest";

import { ClaimExtractionRequestSchema } from "./schema";

const base = {
  file: "second-trip.txt",
  documentSha256: "a".repeat(64),
  provider: "ollama" as const,
  model: "qwen3.5:9b" as const,
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
    const passageIds = Array.from({ length: 201 }, (_, index) => `passage-${index}`);
    expect(() => ClaimExtractionRequestSchema.parse({ ...base, passageIds })).toThrow();
  });
});
