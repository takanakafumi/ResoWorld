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

const DEFAULT_BASE_URL = "http://127.0.0.1:1234";
const DEFAULT_MODEL = "qwen/qwen3-14b";
const MAX_ATTEMPTS = 2;

export const LOCAL_LMSTUDIO_MODELS = [
  "qwen/qwen3-14b",
  "deepseek-r1-distill-qwen-14b",
  "qwen/qwen2.5-coder-14b",
  "mistralai/devstral-small-2507",
] as const;
export type LocalLMStudioModel = (typeof LOCAL_LMSTUDIO_MODELS)[number];

type LMStudioResponseBody = {
  id?: string;
  choices?: Array<{
    index?: number;
    message?: {
      role?: string;
      content?: string;
    };
    finish_reason?: string;
  }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
  error?: {
    message?: string;
    type?: string;
    code?: string;
  };
};

function resolveLoopbackBaseUrl(value: string | undefined) {
  let url: URL;
  try {
    url = new URL(value?.trim() || DEFAULT_BASE_URL);
  } catch {
    throw new ClaimExtractionError(
      "not_configured",
      "RESOWORLD_LMSTUDIO_BASE_URL is not a valid URL.",
    );
  }
  const loopbackHosts = new Set(["127.0.0.1", "localhost", "[::1]"]);
  if (url.protocol !== "http:" || !loopbackHosts.has(url.hostname)) {
    throw new ClaimExtractionError(
      "not_configured",
      "LM Studio must use a local loopback HTTP address.",
    );
  }
  return url;
}

function resolveModel(value: string | undefined): string {
  const model = value?.trim() || DEFAULT_MODEL;
  return model;
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

function stripMarkdownJson(text: string): string {
  const trimmed = text.trim();
  const match = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return match ? match[1].trim() : trimmed;
}

export async function requestLMStudioClaimExtraction(input: {
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
  const endpoint = new URL("/v1/chat/completions", baseUrl);
  const requestSchema = schemaWithPassageAliases([...passageByAlias.keys()]);
  const schemaText = JSON.stringify(requestSchema);
  const requestBody = {
    model,
    stream: false,
    temperature: 0.1,
    max_tokens: 4096,
    messages: [
      {
        role: "system",
        content: `${CLAIM_EXTRACTION_INSTRUCTIONS}\n- evidence.passageIdは入力のPから始まるIDを正確に使い、主張の直接根拠となるPassageを選ぶ。\n\n必ずJSON形式（{"claims": [...]}）で出力してください。Markdownのコードブロックなどで囲まず、プレーンなJSONテキストのみを出力してください。\n\nJSON Schema:\n${schemaText}`,
      },
      {
        role: "user",
        content: buildExtractionInput(input.documentTitle, aliasedPassages),
      },
    ],
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
          `LM Studio request failed with status ${response.status}.`,
        );
        if (shouldRetryStatus(response.status) && attempt < maxAttempts) continue;
        throw error;
      }

      const body = (await response.json()) as LMStudioResponseBody;
      const rawContent = body.choices?.[0]?.message?.content;
      if (!rawContent) {
        if (attempt < maxAttempts) continue;
        throw new ClaimExtractionError(
          "incomplete",
          body.error?.message || "LM Studio did not return message content.",
        );
      }
      try {
        const cleaned = stripMarkdownJson(rawContent);
        const output = ClaimExtractionOutputSchema.parse(JSON.parse(cleaned));
        const restoredOutput = {
          claims: output.claims.map((claim) => ({
            ...claim,
            evidence: claim.evidence.map((item) => {
              const passage = passageByAlias.get(item.passageId);
              if (!passage) {
                throw new ClaimExtractionError(
                  "invalid_output",
                  `LM Studio returned unknown passage ${item.passageId}.`,
                );
              }
              return {
                ...item,
                passageId: passage.id,
              };
            }),
          })),
        };
        return {
          provider: "lmstudio" as const,
          responseId: null,
          model,
          attempts: attempt,
          durationMs: Date.now() - startedAt,
          output: restoredOutput,
          usage: {
            inputTokens: body.usage?.prompt_tokens ?? null,
            outputTokens: body.usage?.completion_tokens ?? null,
            totalTokens: body.usage?.total_tokens ?? null,
          },
        };
      } catch (error) {
        if (attempt < maxAttempts) continue;
        if (error instanceof ZodError) {
          throw new ClaimExtractionError(
            "invalid_output",
            `LM Studio returned structured JSON that does not match ClaimExtractionOutputSchema: ${error.issues.map((i) => i.message).join("; ")}`,
          );
        }
        if (error instanceof SyntaxError) {
          throw new ClaimExtractionError(
            "invalid_output",
            `LM Studio returned non-JSON text: ${error.message}`,
          );
        }
        throw error;
      }
    } catch (error) {
      if (error instanceof ClaimExtractionError) {
        if (
          attempt < maxAttempts &&
          (error.code === "unavailable" ||
            error.code === "incomplete" ||
            error.code === "invalid_output")
        ) {
          continue;
        }
        throw error;
      }
      if (attempt < maxAttempts) continue;
      throw new ClaimExtractionError(
        "unavailable",
        error instanceof Error ? error.message : "Unable to reach LM Studio.",
      );
    }
  }

  throw new ClaimExtractionError("unavailable", "LM Studio extraction failed after retries.");
}
