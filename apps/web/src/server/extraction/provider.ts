import "server-only";

import type { ImportedPassage } from "@/domain/imports/types";
import type { ExtractedClaimCandidate } from "@/domain/extraction/schema";

import { requestCodexClaimExtraction } from "./codex";
import { requestOllamaClaimExtraction } from "./ollama";
import { requestOpenAIClaimExtraction } from "./openai";

export type ExtractionProvider = "ollama" | "openai" | "codex";

export function planExtractionBatches(
  passages: ImportedPassage[],
  maximumPassages = 12,
  maximumCharacters = 2_000,
) {
  const batches: ImportedPassage[][] = [];
  let current: ImportedPassage[] = [];
  let characters = 0;
  for (const passage of passages) {
    if (
      current.length > 0 &&
      (current.length >= maximumPassages ||
        characters + passage.text.length > maximumCharacters)
    ) {
      batches.push(current);
      current = [];
      characters = 0;
    }
    current.push(passage);
    characters += passage.text.length;
  }
  if (current.length > 0) batches.push(current);
  return batches;
}

function sumNullable(values: Array<number | null>) {
  return values.some((value) => value === null)
    ? null
    : values.reduce<number>((total, value) => total + (value ?? 0), 0);
}

export async function requestClaimExtraction(input: {
  provider: ExtractionProvider;
  model: string;
  documentTitle: string;
  passages: ImportedPassage[];
}) {
  if (input.provider === "openai") {
    return requestOpenAIClaimExtraction({
      apiKey: process.env.OPENAI_API_KEY,
      model: input.model,
      documentTitle: input.documentTitle,
      passages: input.passages,
    });
  }

  if (input.provider === "codex") {
    const results = [];
    for (const passages of planExtractionBatches(input.passages, 16, 12_000)) {
      results.push(
        await requestCodexClaimExtraction({
          executable: process.env.RESOWORLD_CODEX_CLI_PATH,
          model: input.model,
          documentTitle: input.documentTitle,
          passages,
        }),
      );
    }
    return aggregateResults("codex", input.model, results);
  }
  const results = [];
  for (const passages of planExtractionBatches(input.passages)) {
    results.push(
      await requestOllamaClaimExtraction({
        baseUrl: process.env.RESOWORLD_OLLAMA_BASE_URL,
        model: input.model,
        documentTitle: input.documentTitle,
        passages,
      }),
    );
  }
  return aggregateResults("ollama", input.model, results);
}

function aggregateResults(
  provider: "ollama" | "codex",
  model: string,
  results: Array<{
    attempts: number;
    durationMs: number;
    output: { claims: ExtractedClaimCandidate[] };
    usage: {
      inputTokens: number | null;
      outputTokens: number | null;
    };
  }>,
) {
  const inputTokens = sumNullable(results.map((result) => result.usage.inputTokens));
  const outputTokens = sumNullable(results.map((result) => result.usage.outputTokens));
  return {
    provider,
    responseId: null,
    model,
    attempts: results.reduce((total, result) => total + result.attempts, 0),
    durationMs: results.reduce((total, result) => total + result.durationMs, 0),
    output: { claims: results.flatMap((result) => result.output.claims) },
    usage: {
      inputTokens,
      outputTokens,
      totalTokens:
        inputTokens === null || outputTokens === null
          ? null
          : inputTokens + outputTokens,
    },
  };
}
