import "server-only";

import {
  ExplorationResearchJsonSchema,
  ExplorationResearchOutputSchema,
  type ExplorationResearchBrief,
} from "@/domain/exploration/research";

const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
const DEFAULT_MODEL = "gpt-5.4-nano";

type WebSource = { title: string; url: string };

type OpenAIResearchResponse = {
  id?: string;
  status?: string;
  incomplete_details?: { reason?: string } | null;
  output?: Array<{
    type?: string;
    action?: {
      sources?: Array<{ title?: string; url?: string }>;
    };
    content?: Array<{
      type?: string;
      text?: string;
      refusal?: string;
      annotations?: Array<{ type?: string; title?: string; url?: string }>;
    }>;
  }>;
  usage?: {
    input_tokens?: number;
    output_tokens?: number;
    total_tokens?: number;
  } | null;
};

export class ExplorationResearchError extends Error {
  constructor(
    public readonly code:
      | "disabled"
      | "not_configured"
      | "api_error"
      | "incomplete"
      | "refused"
      | "invalid_output",
    message: string,
  ) {
    super(message);
    this.name = "ExplorationResearchError";
  }
}

function outputText(body: OpenAIResearchResponse) {
  for (const item of body.output ?? []) {
    for (const content of item.content ?? []) {
      if (content.type === "refusal") {
        throw new ExplorationResearchError(
          "refused",
          "The public-information research request was refused.",
        );
      }
      if (content.type === "output_text" && content.text) return content.text;
    }
  }
  throw new ExplorationResearchError(
    "invalid_output",
    "The research response did not contain structured output text.",
  );
}

function responseSources(body: OpenAIResearchResponse) {
  const byUrl = new Map<string, WebSource>();
  for (const item of body.output ?? []) {
    for (const source of item.action?.sources ?? []) {
      if (source.url) {
        byUrl.set(source.url, { title: source.title || source.url, url: source.url });
      }
    }
    for (const content of item.content ?? []) {
      for (const annotation of content.annotations ?? []) {
        if (annotation.type === "url_citation" && annotation.url) {
          byUrl.set(annotation.url, {
            title: annotation.title || annotation.url,
            url: annotation.url,
          });
        }
      }
    }
  }
  return byUrl;
}

function buildInput(brief: ExplorationResearchBrief) {
  return [
    "次の未解決の問いを検証するため、公開Web情報から次に調べる具体的な場所・資料を1〜4件探してください。",
    "現在の候補に固執せず、より検証力の高い代案を含めてください。sourceUrlsには検索で実際に確認したURLだけを入れてください。",
    "旅行記本文、個人情報、訪問履歴は提供されていません。推測で補わないでください。",
    "",
    JSON.stringify(brief, null, 2),
  ].join("\n");
}

export async function requestOpenAIExplorationResearch(input: {
  brief: ExplorationResearchBrief;
  apiKey?: string;
  enabled?: boolean;
  model?: string;
  fetchImpl?: typeof fetch;
}) {
  if (!input.enabled) {
    throw new ExplorationResearchError(
      "disabled",
      "OpenAI public-information research is disabled.",
    );
  }
  const apiKey = input.apiKey?.trim();
  if (!apiKey) {
    throw new ExplorationResearchError(
      "not_configured",
      "OPENAI_API_KEY is not configured.",
    );
  }

  const model = input.model?.trim() || DEFAULT_MODEL;
  const fetchImpl = input.fetchImpl ?? fetch;
  const response = await fetchImpl(OPENAI_RESPONSES_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      store: false,
      instructions:
        "あなたは旅行先の歴史・文化を検証するリサーチャーです。公開情報を検索し、出典で確認できる候補だけを簡潔な日本語で返してください。事実と推測を分け、不確実性を明記してください。",
      input: buildInput(input.brief),
      tools: [{ type: "web_search_preview", search_context_size: "medium" }],
      tool_choice: "auto",
      include: ["web_search_call.action.sources"],
      text: {
        verbosity: "low",
        format: {
          type: "json_schema",
          name: "resoworld_exploration_research",
          strict: true,
          schema: ExplorationResearchJsonSchema,
        },
      },
      max_output_tokens: 4_000,
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(120_000),
  });

  if (!response.ok) {
    throw new ExplorationResearchError(
      "api_error",
      `OpenAI API request failed with status ${response.status}.`,
    );
  }
  const body = (await response.json()) as OpenAIResearchResponse;
  if (body.status !== "completed") {
    throw new ExplorationResearchError(
      "incomplete",
      `The research response was not completed (${body.incomplete_details?.reason ?? body.status ?? "unknown"}).`,
    );
  }

  let output;
  try {
    output = ExplorationResearchOutputSchema.parse(JSON.parse(outputText(body)));
  } catch (error) {
    if (error instanceof ExplorationResearchError) throw error;
    throw new ExplorationResearchError(
      "invalid_output",
      "The research response did not satisfy the exploration schema.",
    );
  }

  const availableSources = responseSources(body);
  const candidates = output.candidates.map(({ sourceUrls, ...candidate }) => ({
    ...candidate,
    sources: sourceUrls
      .map((url) => availableSources.get(url))
      .filter((source): source is WebSource => Boolean(source)),
  }));
  if (candidates.some((candidate) => candidate.sources.length === 0)) {
    throw new ExplorationResearchError(
      "invalid_output",
      "A research candidate was not backed by a returned web source.",
    );
  }

  return {
    responseId: body.id ?? null,
    model,
    summary: output.summary,
    candidates,
    usage: {
      inputTokens: body.usage?.input_tokens ?? null,
      outputTokens: body.usage?.output_tokens ?? null,
      totalTokens: body.usage?.total_tokens ?? null,
    },
  };
}
