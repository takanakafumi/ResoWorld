import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  ollama: vi.fn(),
  openai: vi.fn(),
}));

vi.mock("./ollama", () => ({
  requestOllamaClaimExtraction: mocks.ollama,
}));

vi.mock("./openai", () => ({
  requestOpenAIClaimExtraction: mocks.openai,
}));

import type { ImportedPassage } from "@/domain/imports/types";

import { requestClaimExtraction } from "./provider";

function passage(index: number): ImportedPassage {
  return {
    id: `passage-${index}`,
    documentId: "document-demo",
    startLine: index,
    endLine: index,
    sectionPath: [],
    text: "短文",
    sha256: String(index).padStart(64, "0"),
  };
}

describe("requestClaimExtraction provider", () => {
  beforeEach(() => {
    mocks.ollama.mockReset();
    mocks.openai.mockReset();
    mocks.ollama.mockImplementation(async (input: { passages: ImportedPassage[] }) => ({
      provider: "ollama",
      responseId: null,
      model: "qwen3.5:9b",
      attempts: 1,
      durationMs: 100,
      output: { claims: [] },
      usage: { inputTokens: input.passages.length, outputTokens: 2, totalTokens: input.passages.length + 2 },
    }));
  });

  it("batches local passages and aggregates usage without external calls", async () => {
    const result = await requestClaimExtraction({
      provider: "ollama",
      model: "qwen3.5:9b",
      documentTitle: "匿名記録",
      passages: Array.from({ length: 13 }, (_, index) => passage(index + 1)),
    });

    expect(mocks.ollama).toHaveBeenCalledTimes(2);
    expect(mocks.openai).not.toHaveBeenCalled();
    expect(mocks.ollama.mock.calls.map((call) => call[0].passages.length)).toEqual([
      12, 1,
    ]);
    expect(result).toMatchObject({
      provider: "ollama",
      attempts: 2,
      durationMs: 200,
      usage: { inputTokens: 13, outputTokens: 4, totalTokens: 17 },
    });
  });
});
