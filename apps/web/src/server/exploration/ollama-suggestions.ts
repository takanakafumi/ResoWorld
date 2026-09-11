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

function aliasContext(context: JourneyContext) {
  const claimAliases = new Map(context.claims.map((claim, index) => [claim.id, "C" + String(index + 1).padStart(3, "0")]));
  const spotAliases = new Map(context.spots.map((spot, index) => [spot.id, "S" + String(index + 1).padStart(3, "0")]));
  const connectionAliases = new Map(context.connections.map((connection, index) => [connection.id, "K" + String(index + 1).padStart(3, "0")]));
  const reverse = <T>(map: Map<T, string>) => new Map([...map].map(([id, alias]) => [alias, id]));
  return {
    context: {
      journey: context.journey,
      spots: context.spots.map((spot) => ({ ...spot, id: spotAliases.get(spot.id), claimIds: spot.claimIds.flatMap((id) => claimAliases.get(id) ?? []) })),
      claims: context.claims.map((claim) => ({ ...claim, id: claimAliases.get(claim.id) })),
      connections: context.connections.map((connection) => ({ ...connection, id: connectionAliases.get(connection.id), claimIds: connection.claimIds.flatMap((id) => claimAliases.get(id) ?? []), spotIds: connection.spotIds.flatMap((id) => spotAliases.get(id) ?? []) })),
    },
    claims: reverse(claimAliases),
    spots: reverse(spotAliases),
    connections: reverse(connectionAliases),
  };
}

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
        .replace(/\b[a-f0-9]{20}\b/gi, "この記録")
        .replace(/\bC\d{3}\b/g, "この記録")
        .replace(/\bS\d{3}\b/g, "この訪問地")
        .replace(/\bK\d{3}\b/g, "この接続")
        .replace(/\bclaims?\b/gi, "記録")
        .replace(/記録\s+この記録/g, "この記録")
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
  const aliased = aliasContext(input.context);
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
        "questionは一つの読み切れる疑問文にし、必ず「？」で終えてください。文を長さ上限の途中で切らないでください。",
        "入力には知識のConnectionだけが含まれます。訪問順や移動順を知識上の因果関係として扱わないでください。",
        "claimIds、anchorSpotIds、connectionIdsは入力中の短いID（C001、S001、K001形式）を正確に使い、各1件以上必須です。",
        "選ぶClaimとSpotは、選んだConnectionのclaimIdsとspotIdsに最低1件ずつ含まれるものにしてください。無関係なConnectionを件数合わせで使わないでください。",
        "重要: IDは対応する配列だけに書き、title、targetName、question、reason等の読者向け文章へ絶対に含めないでください。入力文の長い引用も避けてください。",
        "needs_reviewのClaimだけに依存する場合は、未確認であることをuncertaintyへ明記してください。",
        "根拠のない歴史的断定を避け、uncertaintyへ限界を書いてください。",
      ].join("\n"),
    }, {
      role: "user",
      content: JSON.stringify(aliased.context),
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
      const parsed = SuggestionDraftOutputSchema.parse(removeInternalIdsFromProse(JSON.parse(body.message.content)));
      const output = SuggestionDraftOutputSchema.parse({ suggestions: parsed.suggestions.map((suggestion) => ({
        ...suggestion,
        claimIds: suggestion.claimIds.map((id) => aliased.claims.get(id) ?? id),
        anchorSpotIds: suggestion.anchorSpotIds.map((id) => aliased.spots.get(id) ?? id),
        connectionIds: suggestion.connectionIds.map((id) => aliased.connections.get(id) ?? id),
      })) });
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
      if (attempt === 1) {
        requestBody.messages.push({
          role: "system",
          content: "前回の出力は保存前検証に失敗しました（" + (error instanceof Error ? error.message : "invalid output") + "）。各候補のclaimIdsとanchorSpotIdsを、選択したconnectionIds内のclaimIdsとspotIdsに最低1件ずつ一致させ、JSON全体を作り直してください。",
        });
      }
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Ollama suggestion generation failed.");
}
