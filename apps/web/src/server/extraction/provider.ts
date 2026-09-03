import "server-only";

import { createHash } from "node:crypto";

import type { ClaimExtractionOutput } from "@/domain/extraction/schema";
import type { ImportedPassage } from "@/domain/imports/types";
import type { ExtractedClaimCandidate } from "@/domain/extraction/schema";

import { requestCodexClaimExtraction } from "./codex";
import { requestOllamaClaimExtraction } from "./ollama";
import { requestOpenAIClaimExtraction } from "./openai";

export type ExtractionProvider = "ollama" | "openai" | "codex";
export type ExtractionBatchResult = {
  provider: "ollama" | "codex";
  responseId: null;
  model: string;
  attempts: number;
  durationMs: number;
  output: ClaimExtractionOutput;
  usage: {
    inputTokens: number | null;
    outputTokens: number | null;
    totalTokens: number | null;
  };
};

export type CompletedExtractionBatch = {
  id: string;
  passageIds: string[];
  result: ExtractionBatchResult;
};

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

export function extractionBatchId(passages: ImportedPassage[]) {
  return createHash("sha256")
    .update(passages.map((passage) => `${passage.id}:${passage.sha256}`).join("\n"))
    .digest("hex")
    .slice(0, 24);
}

function sumNullable(values: Array<number | null>) {
  return values.some((value) => value === null)
    ? null
    : values.reduce<number>((total, value) => total + (value ?? 0), 0);
}

function candidateIdentity(candidate: ExtractedClaimCandidate) {
  return JSON.stringify([
    candidate.statement,
    candidate.subject,
    candidate.predicate,
    candidate.object,
    candidate.claimKind,
    candidate.originType,
    candidate.epistemic,
    candidate.historicalTime,
    candidate.places,
  ]);
}

function mergeExactCandidateDuplicates(candidates: ExtractedClaimCandidate[]) {
  const byIdentity = new Map<string, ExtractedClaimCandidate>();
  for (const candidate of candidates) {
    const identity = candidateIdentity(candidate);
    const existing = byIdentity.get(identity);
    if (!existing) {
      byIdentity.set(identity, candidate);
      continue;
    }
    const evidenceByIdentity = new Map(
      existing.evidence.map((evidence) => [JSON.stringify(evidence), evidence]),
    );
    for (const evidence of candidate.evidence) {
      evidenceByIdentity.set(JSON.stringify(evidence), evidence);
    }
    byIdentity.set(identity, {
      ...existing,
      evidence: [...evidenceByIdentity.values()],
    });
  }
  return [...byIdentity.values()];
}

export async function requestClaimExtraction(input: {
  provider: ExtractionProvider;
  model: string;
  documentTitle: string;
  passages: ImportedPassage[];
  completedBatches?: Map<string, CompletedExtractionBatch>;
  onBatchCompleted?: (batch: CompletedExtractionBatch) => Promise<void>;
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
    const results: ExtractionBatchResult[] = [];
    const processCodexBatch = async (passages: ImportedPassage[]): Promise<void> => {
      const id = extractionBatchId(passages);
      const completed = input.completedBatches?.get(id);
      if (completed?.passageIds.join("\n") === passages.map((passage) => passage.id).join("\n")) {
        results.push(completed.result);
        return;
      }
      try {
        const result = await requestCodexClaimExtraction({
          executable: process.env.RESOWORLD_CODEX_CLI_PATH,
          model: input.model,
          documentTitle: input.documentTitle,
          passages,
        });
        if (input.onBatchCompleted) {
          await input.onBatchCompleted({ id, passageIds: passages.map((passage) => passage.id), result });
        }
        results.push(result);
      } catch (error) {
        if (passages.length === 1) throw error;
        const middle = Math.ceil(passages.length / 2);
        await processCodexBatch(passages.slice(0, middle));
        await processCodexBatch(passages.slice(middle));
      }
    };
    for (const passages of planExtractionBatches(input.passages, 8, 4_000)) {
      await processCodexBatch(passages);
    }
    return aggregateResults("codex", input.model, results);
  }
  const results: ExtractionBatchResult[] = [];
  const processOllamaBatch = async (passages: ImportedPassage[]): Promise<void> => {
    const id = extractionBatchId(passages);
    const completed = input.completedBatches?.get(id);
    if (completed?.passageIds.join("\n") === passages.map((passage) => passage.id).join("\n")) {
      results.push(completed.result);
      return;
    }
    try {
      const result = await requestOllamaClaimExtraction({
        baseUrl: process.env.RESOWORLD_OLLAMA_BASE_URL,
        model: input.model,
        documentTitle: input.documentTitle,
        passages,
      });
      if (input.onBatchCompleted) {
        await input.onBatchCompleted({ id, passageIds: passages.map((passage) => passage.id), result });
      }
      results.push(result);
    } catch (error) {
      if (passages.length === 1) throw error;
      const middle = Math.ceil(passages.length / 2);
      await processOllamaBatch(passages.slice(0, middle));
      await processOllamaBatch(passages.slice(middle));
    }
  };
  for (const passages of planExtractionBatches(input.passages)) {
    await processOllamaBatch(passages);
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
    output: {
      claims: mergeExactCandidateDuplicates(
        results.flatMap((result) => result.output.claims),
      ),
    },
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
