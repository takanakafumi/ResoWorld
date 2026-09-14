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
    const passageIds = Array.from({ length: 501 }, (_, index) => `passage-${index}`);
    expect(() => ClaimExtractionRequestSchema.parse({ ...base, passageIds })).toThrow();
  });
  it("accepts Codex CLI only with its explicit consent value", () => {
    const request = {
      ...base,
      provider: "codex" as const,
      model: "gpt-5.6-sol" as const,
      consent: "send_selected_passages_via_codex_cli" as const,
      passageIds: ["passage-1"],
    };
    expect(ClaimExtractionRequestSchema.parse(request).provider).toBe("codex");
    expect(() =>
      ClaimExtractionRequestSchema.parse({
        ...request,
        consent: "process_selected_passages_locally",
      }),
    ).toThrow();
  });
});
