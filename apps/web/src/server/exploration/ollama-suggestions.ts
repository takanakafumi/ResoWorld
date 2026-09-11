import {
  SuggestionDraftJsonSchema,
  SuggestionDraftOutputSchema,
  validateSuggestionDraftReferences,
  type buildJourneySuggestionContext,
} from "@/domain/exploration/suggestion-drafts";

const DEFAULT_BASE_URL = "http://127.0.0.1:11434";
const DEFAULT_MODEL = "qwen3.5:9b";
const ALLOWED_MODELS = new Set(["qwen3.5:9b", "gpt-oss:20b"]);

type JourneyContext = ReturnType<typeof buildJourneySuggestionContext>;

function localUrl(value?: string) {
  const url = new URL(value?.trim() || DEFAULT_BASE_URL);
  if (url.protocol !== "http:" || !["127.0.0.1", "localhost", "[::1]"].includes(url.hostname)) {
    throw new Error("Ollama suggestion generation requires a loopback HTTP URL.");
  }
  return url;
}

const READER_FIELDS = ["title", "targetName", "question", "missingInformation", "reason", "expectedObservation", "uncertainty"] as const;

function removeInternalIdsFromProse(value: unknown) {
  if (!value || typeof value !== "object") return value;
  const candidate = value as { suggestions?: Array<Record<string, unknown>> };
  for (const suggestion of candidate.suggestions ?? []) {
    for (const field of READER_FIELDS) {
      if (typeof suggestion[field] !== "string") continue;
      suggestion[field] = suggestion[field]
        .replace(/claim-[a-zA-Z0-9._-]+/g, "この記録")
        .replace(/spot-[a-zA-Z0-9._-]+/g, "この訪問地")
        .replace(/connection-[a-zA-Z0-9._-]+/g, "この接続")
        .replace(/itinerary-[a-zA-Z0-9._-]+/g, "訪問順")
        .replace(/\bclaims?\b/gi, "記録")
        .replace(/[（(](?:この記録|この訪問地|この接続|訪問順)(?:\s*[,、，]\s*(?:この記録|この訪問地|この接続|訪問順))*[）)]/g, "")
        .replace(/([\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}])\s+([\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}])/gu, "$1$2")
        .replace(/([\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}])\s+([\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}])/gu, "$1$2")
        .replace(/\s+([、。！？])/g, "$1")
        .trim();
    }
  }
  return value;
}

export async function requestOllamaSuggestionDraft(input: {
  context: JourneyContext;
  baseUrl?: string;
  model?: string;
  fetchImpl?: typeof fetch;
}) {
  const model = input.model?.trim() || DEFAULT_MODEL;
  if (!ALLOWED_MODELS.has(model)) throw new Error("Unsupported local suggestion model: " + model);
  const endpoint = new URL("/api/chat", localUrl(input.baseUrl));
  const requestBody = {
    model,
    stream: false,
    think: false,
    format: SuggestionDraftJsonSchema,
    messages: [{
      role: "system",
      content: [
        "あなたは旅行推薦ではなく、過去の探索を学際的に接続する候補編集者です。",
        "入力にあるClaim・Spot・Connectionだけを根拠に、1〜2件の候補を返してください。",
        "具体的な施設名から始めず、構造上の空白・解釈差・未確認点をquestionとして先に示してください。",
        "claimIds、anchorSpotIds、connectionIdsは入力中のIDを正確に使い、各1件以上必須です。",
        "重要: IDは対応する配列だけに書き、title、targetName、question、reason等の読者向け文章へ絶対に含めないでください。入力文の長い引用も避けてください。",
        "needs_reviewのClaimだけに依存する場合は、未確認であることをuncertaintyへ明記してください。",
        "根拠のない歴史的断定を避け、uncertaintyへ限界を書いてください。",
      ].join("\n"),
    }, {
      role: "user",
      content: JSON.stringify(input.context),
    }],
    options: { temperature: 0, num_ctx: 16_384, num_predict: 6_000 },
    keep_alive: "5m",
  };
  const fetchImpl = input.fetchImpl ?? fetch;
  let lastError: unknown;
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const response = await fetchImpl(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
        cache: "no-store",
        signal: AbortSignal.timeout(600_000),
      });
      if (!response.ok) throw new Error("Ollama returned HTTP " + response.status);
      const body = await response.json() as { done?: boolean; message?: { content?: string }; prompt_eval_count?: number; eval_count?: number };
      if (body.done !== true || !body.message?.content) throw new Error("Ollama returned an incomplete response.");
      const output = SuggestionDraftOutputSchema.parse(removeInternalIdsFromProse(JSON.parse(body.message.content)));
      validateSuggestionDraftReferences(output, input.context);
      return {
        provider: "ollama" as const,
        model,
        attempts: attempt,
        usage: { inputTokens: body.prompt_eval_count ?? null, outputTokens: body.eval_count ?? null },
        output,
      };
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Ollama suggestion generation failed.");
}
