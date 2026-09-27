import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  lmstudio: vi.fn(),
}));

vi.mock("./lmstudio", () => ({
  requestLMStudioClaimExtraction: mocks.lmstudio,
}));

import type { ImportedPassage } from "@/domain/imports/types";

import {
  extractionBatchId,
  planExtractionBatches,
  requestClaimExtraction,
} from "./provider";
import { PassageExtractionError } from "./errors";

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

function extractedClaim(passageId: string) {
  return {
    statement: "対象は地域の信仰と関係すると説明されている。",
    subject: { name: "対象", type: "Place" as const },
    predicate: "relates_to",
    object: {
      kind: "entity" as const,
      entity: { name: "地域の信仰", type: "Belief" as const },
    },
    claimKind: "assertion" as const,
    originType: "ai" as const,
    epistemic: { verification: "unverified" as const, modality: "qualified" as const },
    historicalTime: null,
    places: [],
    evidence: [{
      passageId,
      role: "supports" as const,
      sourceNature: "AISuggestion" as const,
      documentVoice: "ai-narrator" as const,
      sourceTitle: null,
      sourceUrl: null,
      note: null,
    }],
  };
}

describe("requestClaimExtraction provider", () => {
  beforeEach(() => {
    mocks.lmstudio.mockReset();
    mocks.lmstudio.mockImplementation(async (input: { passages: ImportedPassage[] }) => ({
      provider: "lmstudio",
      responseId: null,
      model: "qwen/qwen3-14b",
      attempts: 1,
      durationMs: 100,
      output: { claims: [] },
      usage: { inputTokens: input.passages.length, outputTokens: 2, totalTokens: input.passages.length + 2 },
    }));
  });
  it("plans deterministic character-bounded batches without splitting passages", () => {
    const passages = Array.from({ length: 5 }, (_, index) => ({
      ...passage(index + 1),
      text: "あ".repeat(700),
    }));

    expect(
      planExtractionBatches(passages, 12, 2_000).map((batch) =>
        batch.map((item) => item.id),
      ),
    ).toEqual([
      ["passage-1", "passage-2"],
      ["passage-3", "passage-4"],
      ["passage-5"],
    ]);
  });

  it("batches LM Studio passages and aggregates usage locally", async () => {
    mocks.lmstudio.mockImplementation(async (input: { passages: ImportedPassage[] }) => ({
      provider: "lmstudio",
      responseId: null,
      model: "qwen/qwen3-14b",
      attempts: 1,
      durationMs: 150,
      output: { claims: [] },
      usage: { inputTokens: input.passages.length, outputTokens: 2, totalTokens: input.passages.length + 2 },
    }));

    const result = await requestClaimExtraction({
      provider: "lmstudio",
      model: "qwen/qwen3-14b",
      documentTitle: "匿名記録",
      passages: Array.from({ length: 13 }, (_, index) => passage(index + 1)),
    });

    expect(mocks.lmstudio).toHaveBeenCalledTimes(2);
    expect(result).toMatchObject({
      provider: "lmstudio",
      attempts: 2,
      durationMs: 300,
      usage: { inputTokens: 13, outputTokens: 4, totalTokens: 17 },
    });
  });

  it("merges exact cross-batch duplicates while retaining distinct evidence", async () => {
    mocks.lmstudio.mockImplementation(async (input: { passages: ImportedPassage[] }) => ({
      provider: "lmstudio",
      responseId: null,
      model: "qwen3.5:9b",
      attempts: 1,
      durationMs: 100,
      output: { claims: [extractedClaim(input.passages[0].id)] },
      usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 },
    }));

    const result = await requestClaimExtraction({
      provider: "lmstudio",
      model: "qwen3.5:9b",
      documentTitle: "匿名記録",
      passages: Array.from({ length: 13 }, (_, index) => passage(index + 1)),
    });

    expect(result.output.claims).toHaveLength(1);
    expect(result.output.claims[0].evidence.map((item) => item.passageId)).toEqual([
      "passage-1",
      "passage-13",
    ]);
  });
  it("splits only a failing Ollama batch and checkpoints the successful halves", async () => {
    mocks.lmstudio.mockImplementation(async (input: { passages: ImportedPassage[] }) => {
      if (input.passages.length > 2) throw new Error("invalid structured output");
      return {
        provider: "lmstudio",
        responseId: null,
        model: "qwen3.5:9b",
        attempts: 1,
        durationMs: 100,
        output: { claims: [] },
        usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 },
      };
    });
    const passages = Array.from({ length: 4 }, (_, index) => passage(index + 1));
    const completed: string[][] = [];

    const result = await requestClaimExtraction({
      provider: "lmstudio",
      model: "qwen3.5:9b",
      documentTitle: "匿名記録",
      passages,
      onBatchCompleted: async (batch) => {
        completed.push(batch.passageIds);
      },
    });

    expect(mocks.lmstudio.mock.calls.map((call) => call[0].passages.length)).toEqual([
      4, 2, 2,
    ]);
    expect(completed).toEqual([
      ["passage-1", "passage-2"],
      ["passage-3", "passage-4"],
    ]);
    expect(result.attempts).toBe(2);
  });
  it("identifies the single Ollama Passage that still fails after splitting", async () => {
    mocks.lmstudio.mockImplementation(async (input: { passages: ImportedPassage[] }) => {
      if (input.passages.some((item) => item.id === "passage-3")) {
        throw new Error("invalid structured output");
      }
      return {
        provider: "lmstudio",
        responseId: null,
        model: "qwen3.5:9b",
        attempts: 1,
        durationMs: 100,
        output: { claims: [] },
        usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 },
      };
    });

    const error = await requestClaimExtraction({
      provider: "lmstudio",
      model: "qwen3.5:9b",
      documentTitle: "匿名記録",
      passages: Array.from({ length: 4 }, (_, index) => passage(index + 1)),
    }).catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(PassageExtractionError);
    expect((error as PassageExtractionError).passageIds).toEqual(["passage-3"]);
  });
});
