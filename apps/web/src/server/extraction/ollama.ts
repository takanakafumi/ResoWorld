import "server-only";

import { ClaimExtractionOutputSchema } from "@/domain/extraction/schema";
import {
  buildExtractionInput,
  CLAIM_EXTRACTION_INSTRUCTIONS,
  ClaimExtractionJsonSchema,
} from "@/domain/extraction/prompt";
import type { ImportedPassage } from "@/domain/imports/types";
import { ZodError } from "zod";

import { ClaimExtractionError } from "./errors";

const DEFAULT_BASE_URL = "http://127.0.0.1:11434";
const DEFAULT_MODEL = "qwen3.5:9b";
const MAX_ATTEMPTS = 2;

export const LOCAL_EXTRACTION_MODELS = ["gpt-oss:20b", "qwen3.5:9b"] as const;
export type LocalExtractionModel = (typeof LOCAL_EXTRACTION_MODELS)[number];

type OllamaResponseBody = {
  message?: { content?: string; thinking?: string };
  done?: boolean;
  error?: string;
  total_duration?: number;
  prompt_eval_count?: number;
  eval_count?: number;
};

function resolveLoopbackBaseUrl(value: string | undefined) {
  let url: URL;
  try {
    url = new URL(value?.trim() || DEFAULT_BASE_URL);
  } catch {
    throw new ClaimExtractionError(
      "not_configured",
      "RESOWORLD_OLLAMA_BASE_URL is not a valid URL.",
    );
  }
  const loopbackHosts = new Set(["127.0.0.1", "localhost", "[::1]"]);
  if (url.protocol !== "http:" || !loopbackHosts.has(url.hostname)) {
    throw new ClaimExtractionError(
      "not_configured",
      "Ollama must use a local loopback HTTP address.",
    );
  }
  return url;
}

function resolveModel(value: string | undefined): LocalExtractionModel {
  const model = value?.trim() || DEFAULT_MODEL;
  if (!LOCAL_EXTRACTION_MODELS.includes(model as LocalExtractionModel)) {
    throw new ClaimExtractionError(
      "not_configured",
      `Unsupported local extraction model: ${model}.`,
    );
  }
  return model as LocalExtractionModel;
}

function shouldRetryStatus(status: number) {
  return status === 408 || status === 409 || status === 429 || status >= 500;
}

function schemaWithPassageAliases(aliases: string[]) {
  const schema = structuredClone(ClaimExtractionJsonSchema) as Record<string, unknown>;
  const visit = (value: unknown) => {
    if (!value || typeof value !== "object") return;
    const record = value as Record<string, unknown>;
    const properties = record.properties as Record<string, unknown> | undefined;
    if (properties?.passageId) {
      properties.passageId = { type: "string", enum: aliases };
    }
    Object.values(record).forEach(visit);
  };
  visit(schema);
  return schema;
}
export async function requestOllamaClaimExtraction(input: {
  baseUrl?: string;
  documentTitle: string;
  passages: ImportedPassage[];
  model?: string;
  fetchImpl?: typeof fetch;
  maxAttempts?: 1 | 2;
}) {
  const baseUrl = resolveLoopbackBaseUrl(input.baseUrl);
  const model = resolveModel(input.model);
  const fetchImpl = input.fetchImpl ?? fetch;
  const maxAttempts = input.maxAttempts ?? MAX_ATTEMPTS;
  const passageByAlias = new Map(
    input.passages.map((passage, index) => [`P${String(index + 1).padStart(3, "0")}`, passage]),
  );
  const aliasedPassages = input.passages.map((passage, index) => ({
    ...passage,
    id: `P${String(index + 1).padStart(3, "0")}`,
  }));
  const endpoint = new URL("/api/chat", baseUrl);
  const requestSchema = schemaWithPassageAliases([...passageByAlias.keys()]);
  const schemaText = JSON.stringify(requestSchema);
  const requestBody = {
    model,
    stream: false,
    think: false,
    messages: [
      {
        role: "system",
        content: `${CLAIM_EXTRACTION_INSTRUCTIONS}\n- evidence.passageIdは入力のPから始まるIDを正確に使い、主張の直接根拠となるPassageを選ぶ。\n\nJSON Schema:\n${schemaText}`,
      },
      {
        role: "user",
        content: buildExtractionInput(input.documentTitle, aliasedPassages),
      },
    ],
    format: requestSchema,
    options: {
      temperature: 0,
      num_ctx: 32_768,
      num_predict: 4_000,
    },
    keep_alive: "5m",
  };

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const startedAt = Date.now();
    try {
      const response = await fetchImpl(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
        cache: "no-store",
        signal: AbortSignal.timeout(600_000),
      });
      if (!response.ok) {
        const error = new ClaimExtractionError(
          response.status >= 500 ? "unavailable" : "api_error",
          `Ollama request failed with status ${response.status}.`,
        );
        if (shouldRetryStatus(response.status) && attempt < maxAttempts) continue;
        throw error;
      }

      const body = (await response.json()) as OllamaResponseBody;
      if (body.done !== true || !body.message?.content) {
        if (attempt < maxAttempts) continue;
        throw new ClaimExtractionError(
          "incomplete",
          body.error || "Ollama did not return a completed message.",
        );
      }
      try {
        const output = ClaimExtractionOutputSchema.parse(
          JSON.parse(body.message.content),
        );
        const restoredOutput = {
          claims: output.claims.map((claim) => ({
            ...claim,
            evidence: claim.evidence.map((item) => {
              const passage = passageByAlias.get(item.passageId);
              if (!passage) {
                throw new ClaimExtractionError(
                  "invalid_output",
                  `The local model referenced an unknown Passage alias: ${item.passageId}.`,
                );
              }
              return { ...item, passageId: passage.id };
            }),
          })),
        };
        const inputTokens = body.prompt_eval_count ?? null;
        const outputTokens = body.eval_count ?? null;
        return {
          provider: "ollama" as const,
          responseId: null,
          model,
          attempts: attempt,
          durationMs:
            body.total_duration === undefined
              ? Date.now() - startedAt
              : Math.round(body.total_duration / 1_000_000),
          output: restoredOutput,
          usage: {
            inputTokens,
            outputTokens,
            totalTokens:
              inputTokens === null || outputTokens === null
                ? null
                : inputTokens + outputTokens,
          },
        };
      } catch (error) {
        if (error instanceof ClaimExtractionError) throw error;
        if (attempt < maxAttempts) continue;
        const details =
          error instanceof ZodError
            ? error.issues
                .slice(0, 3)
                .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
                .join("; ")
            : "invalid JSON";
        throw new ClaimExtractionError(
          "invalid_output",
          `The local model output did not satisfy the Claim extraction schema (${details}).`,
        );
      }
    } catch (error) {
      if (error instanceof ClaimExtractionError) throw error;
      if (attempt < maxAttempts) continue;
      throw new ClaimExtractionError(
        "unavailable",
        "The local Ollama service could not be reached.",
      );
    }
  }

  throw new ClaimExtractionError("api_error", "Local extraction failed.");
}
