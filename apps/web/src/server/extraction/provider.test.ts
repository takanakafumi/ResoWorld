import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  ollama: vi.fn(),
  openai: vi.fn(),
  codex: vi.fn(),
}));

vi.mock("./ollama", () => ({
  requestOllamaClaimExtraction: mocks.ollama,
}));

vi.mock("./openai", () => ({
  requestOpenAIClaimExtraction: mocks.openai,
}));

vi.mock("./codex", () => ({
  requestCodexClaimExtraction: mocks.codex,
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
    mocks.ollama.mockReset();
    mocks.openai.mockReset();
    mocks.codex.mockReset();
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
  it("merges exact cross-batch duplicates while retaining distinct evidence", async () => {
    mocks.ollama.mockImplementation(async (input: { passages: ImportedPassage[] }) => ({
      provider: "ollama",
      responseId: null,
      model: "qwen3.5:9b",
      attempts: 1,
      durationMs: 100,
      output: { claims: [extractedClaim(input.passages[0].id)] },
      usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 },
    }));

    const result = await requestClaimExtraction({
      provider: "ollama",
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
  it("routes the complete selection through bounded Codex CLI batches", async () => {
    mocks.codex.mockResolvedValue({
      provider: "codex",
      responseId: null,
      model: "gpt-5.6-sol",
      attempts: 1,
      durationMs: 100,
      output: { claims: [] },
      usage: { inputTokens: null, outputTokens: null, totalTokens: null },
    });
    const passages = Array.from({ length: 13 }, (_, index) => passage(index + 1));

    const result = await requestClaimExtraction({
      provider: "codex",
      model: "gpt-5.6-sol",
      documentTitle: "匿名記録",
      passages,
    });

    expect(mocks.codex.mock.calls.map((call) => call[0].passages)).toEqual([
      passages.slice(0, 8),
      passages.slice(8),
    ]);
    expect(mocks.ollama).not.toHaveBeenCalled();
    expect(mocks.openai).not.toHaveBeenCalled();
    expect(result.provider).toBe("codex");
  });
  it("batches a large Codex selection and aggregates completed outputs", async () => {
    mocks.codex.mockImplementation(async () => ({
      provider: "codex",
      responseId: null,
      model: "gpt-5.6-sol",
      attempts: 1,
      durationMs: 100,
      output: { claims: [] },
      usage: { inputTokens: null, outputTokens: null, totalTokens: null },
    }));
    const passages = Array.from({ length: 33 }, (_, index) => passage(index + 1));

    const result = await requestClaimExtraction({
      provider: "codex",
      model: "gpt-5.6-sol",
      documentTitle: "匿名記録",
      passages,
    });

    expect(mocks.codex.mock.calls.map((call) => call[0].passages.length)).toEqual([
      8, 8, 8, 8, 1,
    ]);
    expect(result).toMatchObject({
      provider: "codex",
      attempts: 5,
      durationMs: 500,
    });
  });
  it("reuses a completed Codex batch without invoking the model again", async () => {
    const passages = Array.from({ length: 2 }, (_, index) => passage(index + 1));
    const completed = {
      id: extractionBatchId(passages),
      passageIds: passages.map((item) => item.id),
      result: {
        provider: "codex" as const,
        responseId: null,
        model: "gpt-5.6-sol",
        attempts: 1,
        durationMs: 100,
        output: { claims: [] },
        usage: { inputTokens: null, outputTokens: null, totalTokens: null },
      },
    };

    const result = await requestClaimExtraction({
      provider: "codex",
      model: "gpt-5.6-sol",
      documentTitle: "匿名記録",
      passages,
      completedBatches: new Map([[completed.id, completed]]),
    });

    expect(mocks.codex).not.toHaveBeenCalled();
    expect(result.attempts).toBe(1);
  });
  it("splits only a failing Codex batch and checkpoints the successful halves", async () => {
    mocks.codex.mockImplementation(async (input: { passages: ImportedPassage[] }) => {
      if (input.passages.length > 2) throw new Error("batch too large");
      return {
        provider: "codex",
        responseId: null,
        model: "gpt-5.6-sol",
        attempts: 1,
        durationMs: 100,
        output: { claims: [] },
        usage: { inputTokens: null, outputTokens: null, totalTokens: null },
      };
    });
    const passages = Array.from({ length: 4 }, (_, index) => passage(index + 1));
    const completed: string[][] = [];

    const result = await requestClaimExtraction({
      provider: "codex",
      model: "gpt-5.6-sol",
      documentTitle: "匿名記録",
      passages,
      onBatchCompleted: async (batch) => {
        completed.push(batch.passageIds);
      },
    });

    expect(mocks.codex.mock.calls.map((call) => call[0].passages.length)).toEqual([
      4, 2, 2,
    ]);
    expect(completed).toEqual([
      ["passage-1", "passage-2"],
      ["passage-3", "passage-4"],
    ]);
    expect(result.attempts).toBe(2);
  });
  it("splits only a failing Ollama batch and checkpoints the successful halves", async () => {
    mocks.ollama.mockImplementation(async (input: { passages: ImportedPassage[] }) => {
      if (input.passages.length > 2) throw new Error("invalid structured output");
      return {
        provider: "ollama",
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
      provider: "ollama",
      model: "qwen3.5:9b",
      documentTitle: "匿名記録",
      passages,
      onBatchCompleted: async (batch) => {
        completed.push(batch.passageIds);
      },
    });

    expect(mocks.ollama.mock.calls.map((call) => call[0].passages.length)).toEqual([
      4, 2, 2,
    ]);
    expect(completed).toEqual([
      ["passage-1", "passage-2"],
      ["passage-3", "passage-4"],
    ]);
    expect(result.attempts).toBe(2);
  });
  it("identifies the single Ollama Passage that still fails after splitting", async () => {
    mocks.ollama.mockImplementation(async (input: { passages: ImportedPassage[] }) => {
      if (input.passages.some((item) => item.id === "passage-3")) {
        throw new Error("invalid structured output");
      }
      return {
        provider: "ollama",
        responseId: null,
        model: "qwen3.5:9b",
        attempts: 1,
        durationMs: 100,
        output: { claims: [] },
        usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 },
      };
    });

    const error = await requestClaimExtraction({
      provider: "ollama",
      model: "qwen3.5:9b",
      documentTitle: "匿名記録",
      passages: Array.from({ length: 4 }, (_, index) => passage(index + 1)),
    }).catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(PassageExtractionError);
    expect((error as PassageExtractionError).passageIds).toEqual(["passage-3"]);
  });
});
