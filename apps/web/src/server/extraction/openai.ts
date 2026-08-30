import "server-only";

import { ClaimExtractionOutputSchema } from "@/domain/extraction/schema";
import {
  buildExtractionInput,
  CLAIM_EXTRACTION_INSTRUCTIONS,
  ClaimExtractionJsonSchema,
} from "@/domain/extraction/prompt";
import type { ImportedPassage } from "@/domain/imports/types";

const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
const DEFAULT_MODEL = "gpt-5.6-sol";
const MAX_ATTEMPTS = 2;

export class ClaimExtractionError extends Error {
  constructor(
    public readonly code:
      | "not_configured"
      | "api_error"
      | "incomplete"
      | "refused"
      | "invalid_output",
    message: string,
  ) {
    super(message);
    this.name = "ClaimExtractionError";
  }
}

type OpenAIResponseBody = {
  id?: string;
  status?: string;
  error?: { message?: string } | null;
  incomplete_details?: { reason?: string } | null;
  output?: Array<{
    type?: string;
    content?: Array<{
      type?: string;
      text?: string;
      refusal?: string;
    }>;
  }>;
  usage?: {
    input_tokens?: number;
    output_tokens?: number;
    total_tokens?: number;
  } | null;
};

export type ClaimExtractionApiResult = {
  responseId: string | null;
  model: string;
  attempts: number;
  output: ReturnType<typeof ClaimExtractionOutputSchema.parse>;
  usage: {
    inputTokens: number | null;
    outputTokens: number | null;
    totalTokens: number | null;
  };
};

function textFromResponse(body: OpenAIResponseBody) {
  for (const item of body.output ?? []) {
    for (const content of item.content ?? []) {
      if (content.type === "refusal") {
        throw new ClaimExtractionError(
          "refused",
          "The extraction request was refused and was not retried.",
        );
      }
      if (content.type === "output_text" && content.text) {
        return content.text;
      }
    }
  }
  throw new ClaimExtractionError(
    "invalid_output",
    "The model response did not contain structured output text.",
  );
}

function shouldRetryStatus(status: number) {
  return status === 408 || status === 409 || status === 429 || status >= 500;
}

export async function requestClaimExtraction(input: {
  apiKey: string | undefined;
  documentTitle: string;
  passages: ImportedPassage[];
  model?: string;
  fetchImpl?: typeof fetch;
}): Promise<ClaimExtractionApiResult> {
  const apiKey = input.apiKey?.trim();
  if (!apiKey) {
    throw new ClaimExtractionError(
      "not_configured",
      "OPENAI_API_KEY is not configured.",
    );
  }

  const model = input.model?.trim() || DEFAULT_MODEL;
  const fetchImpl = input.fetchImpl ?? fetch;
  const requestBody = {
    model,
    store: false,
    reasoning: { effort: "medium" },
    instructions: CLAIM_EXTRACTION_INSTRUCTIONS,
    input: buildExtractionInput(input.documentTitle, input.passages),
    text: {
      verbosity: "low",
      format: {
        type: "json_schema",
        name: "resoworld_claim_extraction",
        strict: true,
        schema: ClaimExtractionJsonSchema,
      },
    },
    max_output_tokens: 16_000,
  };

  let lastError: unknown = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetchImpl(OPENAI_RESPONSES_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
        cache: "no-store",
        signal: AbortSignal.timeout(180_000),
      });

      if (!response.ok) {
        const retryable = shouldRetryStatus(response.status);
        const error = new ClaimExtractionError(
          "api_error",
          `OpenAI API request failed with status ${response.status}.`,
        );
        if (retryable && attempt < MAX_ATTEMPTS) {
          lastError = error;
          continue;
        }
        throw error;
      }

      const body = (await response.json()) as OpenAIResponseBody;
      if (body.status !== "completed") {
        throw new ClaimExtractionError(
          "incomplete",
          `The model response was not completed (${body.incomplete_details?.reason ?? body.status ?? "unknown"}).`,
        );
      }

      try {
        const output = ClaimExtractionOutputSchema.parse(
          JSON.parse(textFromResponse(body)),
        );
        return {
          responseId: body.id ?? null,
          model,
          attempts: attempt,
          output,
          usage: {
            inputTokens: body.usage?.input_tokens ?? null,
            outputTokens: body.usage?.output_tokens ?? null,
            totalTokens: body.usage?.total_tokens ?? null,
          },
        };
      } catch (error) {
        if (error instanceof ClaimExtractionError && error.code === "refused") {
          throw error;
        }
        const invalidOutputError = new ClaimExtractionError(
          "invalid_output",
          "The model output did not satisfy the Claim extraction schema.",
        );
        if (attempt < MAX_ATTEMPTS) {
          lastError = invalidOutputError;
          continue;
        }
        throw invalidOutputError;
      }
    } catch (error) {
      if (error instanceof ClaimExtractionError) throw error;
      lastError = error;
      if (attempt >= MAX_ATTEMPTS) {
        throw new ClaimExtractionError(
          "api_error",
          "OpenAI API request could not be completed.",
        );
      }
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new ClaimExtractionError("api_error", "Extraction failed.");
}
