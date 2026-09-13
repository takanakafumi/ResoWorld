import {
  SuggestionDraftOutputSchema,
  validateSuggestionDraftReferences,
  type buildJourneySuggestionContext,
} from "@/domain/exploration/suggestion-drafts";
import { z } from "zod";

const DEFAULT_BASE_URL = "http://127.0.0.1:11434";
const DEFAULT_MODEL = "qwen3.5:9b";
const ALLOWED_MODELS = new Set(["qwen3.5:9b", "gpt-oss:20b"]);

type JourneyContext = ReturnType<typeof buildJourneySuggestionContext>;

const ActionTypeSchema = z.enum(["field_visit", "literature_research", "revisit"]);
const GroundingSelectionSchema = z.object({ suggestions: z.array(z.object({
  actionType: ActionTypeSchema,
  targetPlaceId: z.string().nullable().optional(),
  claimIds: z.array(z.string()).min(1).max(6),
  anchorSpotIds: z.array(z.string()).min(1).max(4),
  connectionIds: z.array(z.string()).min(1).max(3),
})).min(1).max(2) });
const ReaderProseItemSchema = z.object({
  title: z.string().trim().min(4).max(240).describe("A short Japanese noun phrase, not a question."),
  targetName: z.string().trim().min(2).max(160).describe("A specific Japanese name for the subject to explore."),
  question: z.string().trim().min(8).max(240).describe("A direct, natural Japanese question about the supplied evidence."),
  missingInformation: z.string().trim().min(8).max(160).describe("One concise Japanese sentence naming specific missing evidence. Never use none, unknown, or 不明."),
  reason: z.string().trim().min(8).max(180).describe("One concise Japanese sentence explaining why this follows the user's past interest."),
  expectedObservation: z.string().trim().min(8).max(160).describe("One concise Japanese sentence naming evidence or a comparison the user could observe."),
  uncertainty: z.string().trim().min(8).max(160).describe("One concise Japanese sentence stating a concrete limitation. Never use needs_review."),
});
const ReaderProseSchema = z.object({ suggestions: z.array(ReaderProseItemSchema).min(1).max(2) });
const ReaderProseJsonSchema = z.toJSONSchema(ReaderProseSchema, { target: "draft-7", unrepresentable: "throw" });
const GroundingSelectionJsonSchema = z.toJSONSchema(GroundingSelectionSchema, { target: "draft-7", unrepresentable: "throw" });

function aliasContext(context: JourneyContext) {
  const claimAliases = new Map(context.claims.map((claim, index) => [claim.id, "C" + String(index + 1).padStart(3, "0")]));
  const spotAliases = new Map(context.spots.map((spot, index) => [spot.id, "S" + String(index + 1).padStart(3, "0")]));
  const connectionAliases = new Map(context.connections.map((connection, index) => [connection.id, "K" + String(index + 1).padStart(3, "0")]));
  const placeAliases = new Map(context.frontierPlaces.map((place, index) => [place.placeId, "P" + String(index + 1).padStart(3, "0")]));
  const reverse = <T>(map: Map<T, string>) => new Map([...map].map(([id, alias]) => [alias, id]));
  return {
    context: {
      journey: context.journey,
      spots: context.spots.map((spot) => ({ ...spot, id: spotAliases.get(spot.id), claimIds: spot.claimIds.flatMap((id) => claimAliases.get(id) ?? []) })),
      claims: context.claims.map((claim) => ({ ...claim, id: claimAliases.get(claim.id) })),
      connections: context.connections.map((connection) => ({ ...connection, id: connectionAliases.get(connection.id), claimIds: connection.claimIds.flatMap((id) => claimAliases.get(id) ?? []), spotIds: connection.spotIds.flatMap((id) => spotAliases.get(id) ?? []) })),
      frontierPlaces: context.frontierPlaces.map((place) => ({ ...place, placeId: placeAliases.get(place.placeId), connectionId: connectionAliases.get(place.connectionId), claimIds: place.claimIds.flatMap((id) => claimAliases.get(id) ?? []), anchorSpotIds: place.anchorSpotIds.flatMap((id) => spotAliases.get(id) ?? []) })),
    },
    claims: reverse(claimAliases),
    spots: reverse(spotAliases),
    connections: reverse(connectionAliases),
    places: reverse(placeAliases),
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
        .replace(/\bP\d{3}\b/g, "この候補地")
        .replace(/\bclaims?\b/gi, "記録")
        .replace(/記録\s+この記録/g, "この記録")
        .replace(/[（(](?:この記録|この訪問地|この接続|訪問順)(?:\s*[,、，]\s*(?:この記録|この訪問地|この接続|訪問順))*[）)]/g, "")
        .replace(/([\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}])\s+([\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}])/gu, "$1$2")
        .replace(/([\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}])\s+([\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}])/gu, "$1$2")
        .replace(/\s+([、。！？])/g, "$1")
        .replace(/\s*[\]}]+$/g, "")
        .trim();
    }
    if (typeof suggestion.question === "string" && !/[？?]$/.test(suggestion.question)) {
      suggestion.question += "？";
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
  const fetchImpl = input.fetchImpl ?? fetch;
  const usage = { inputTokens: 0, outputTokens: 0 };
  let maxAttempts = 1;
  const requestStructured = async <T>(schema: z.ZodType<T>, format: object, messages: Array<{ role: string; content: string }>, validate?: (value: T) => void) => {
    let lastError: unknown;
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      try {
        const response = await fetchImpl(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
          model, stream: false, think: model === "gpt-oss:20b", format, messages,
          options: { temperature: 0, num_ctx: 16_384, num_predict: 4_000 }, keep_alive: "5m",
        }), cache: "no-store", signal: AbortSignal.timeout(600_000) });
        if (!response.ok) throw new Error("Ollama returned HTTP " + response.status);
        const body = await response.json() as { done?: boolean; message?: { content?: string }; prompt_eval_count?: number; eval_count?: number };
        if (body.done !== true || !body.message?.content) throw new Error("Ollama returned an incomplete response.");
        const value = schema.parse(JSON.parse(body.message.content));
        validate?.(value);
        usage.inputTokens += body.prompt_eval_count ?? 0;
        usage.outputTokens += body.eval_count ?? 0;
        maxAttempts = Math.max(maxAttempts, attempt);
        return value;
      } catch (error) {
        lastError = error;
        if (attempt < 3) messages.push({ role: "system", content: "前回は検証に失敗しました（" + (error instanceof Error ? error.message : "invalid output") + "）。スキーマと指示を守ってJSON全体を作り直してください。" });
      }
    }
    throw lastError instanceof Error ? lastError : new Error("Ollama structured generation failed.");
  };

  const selection = await requestStructured(GroundingSelectionSchema, GroundingSelectionJsonSchema, [{ role: "system", content: [
    "過去の探索から次に深掘りする根拠を1〜2件選んでください。文章は作らずIDとactionTypeだけを返してください。",
    "訪問順を因果関係にせず、各候補のClaimとSpotは選んだConnectionと最低1件ずつ共有してください。",
    "frontierPlacesは、訪問済み地点から知識接続で到達できる未訪問地です。field_visitでは必ずtargetPlaceIdにPで始まる候補を1件選び、その候補が示すConnection・Claim・Spotを使ってください。",
    "優先順位は、未訪問のfrontierPlaces、資料調査、重大な見落としを確認する再訪です。通常の補完や見直しだけを理由にrevisitを選ばないでください。",
  ].join("\n") }, { role: "user", content: JSON.stringify(aliased.context) }], (value) => {
    const restored = { suggestions: value.suggestions.map((item, index) => ({
      title: "候補" + (index + 1), targetName: "探索対象", question: "何を確かめられるか？", missingInformation: "確認すべき史料や展示情報。",
      reason: "既存の知識接続を深掘りできるため。", expectedObservation: "展示説明を比較できる情報。", uncertainty: "史料解釈には追加確認が必要。", ...item,
      claimIds: item.claimIds.map((id) => aliased.claims.get(id) ?? id), anchorSpotIds: item.anchorSpotIds.map((id) => aliased.spots.get(id) ?? id), connectionIds: item.connectionIds.map((id) => aliased.connections.get(id) ?? id),
      targetPlaceId: item.targetPlaceId ? aliased.places.get(item.targetPlaceId) ?? item.targetPlaceId : undefined,
    })) };
    for (const suggestion of restored.suggestions) {
      if (suggestion.actionType === "field_visit" && !suggestion.targetPlaceId) throw new Error("field_visit requires a frontier targetPlaceId");
      if (!suggestion.targetPlaceId) continue;
      const frontier = input.context.frontierPlaces.find(({ placeId }) => placeId === suggestion.targetPlaceId);
      if (!frontier) throw new Error("unknown frontier targetPlaceId");
      if (!suggestion.connectionIds.includes(frontier.connectionId)) throw new Error("targetPlaceId must use its Knowledge Connection");
      if (!suggestion.anchorSpotIds.some((id) => frontier.anchorSpotIds.includes(id))) throw new Error("targetPlaceId must share an anchor Spot");
    }
    validateSuggestionDraftReferences(SuggestionDraftOutputSchema.parse(restored), input.context);
  });
  const restoredSelection = selection.suggestions.map((item) => {
    const targetPlaceId = item.targetPlaceId ? aliased.places.get(item.targetPlaceId) ?? item.targetPlaceId : undefined;
    const frontier = input.context.frontierPlaces.find(({ placeId }) => placeId === targetPlaceId);
    return ({ ...item,
    claimIds: item.claimIds.map((id) => aliased.claims.get(id) ?? id), anchorSpotIds: item.anchorSpotIds.map((id) => aliased.spots.get(id) ?? id), connectionIds: item.connectionIds.map((id) => aliased.connections.get(id) ?? id),
    ...(frontier ? { targetPlaceId, targetLatitude: frontier.latitude, targetLongitude: frontier.longitude } : {}),
    targetKind: frontier?.targetKind ?? (item.actionType === "revisit" ? "critical_revisit" as const : item.actionType === "literature_research" ? "research" as const : undefined),
  }); });
  const proseContext = restoredSelection.map((item) => ({ actionType: item.actionType,
    targetPlace: item.targetPlaceId ? input.context.frontierPlaces.find(({ placeId }) => placeId === item.targetPlaceId) : undefined,
    spots: input.context.spots.filter(({ id }) => item.anchorSpotIds.includes(id)).map(({ name, region, kind }) => ({ name, region, kind })),
    claims: input.context.claims.filter(({ id }) => item.claimIds.includes(id)).map(({ statement, claimKind, reviewStatus }) => ({ statement, claimKind, reviewStatus })),
    connections: input.context.connections.filter(({ id }) => item.connectionIds.includes(id)).map(({ title, summary, concepts }) => ({ title, summary, concepts })),
  }));
  const prose = await requestStructured(ReaderProseSchema, ReaderProseJsonSchema, [{ role: "system", content: [
    "You edit a user's past travel exploration into interdisciplinary follow-up questions. This is not a generic travel recommendation.",
    "For field_visit, describe why the supplied unvisited targetPlace matters to the user's existing knowledge connection. For revisit, the reason must identify a major omission that could change the interpretation; do not recommend routine review.",
    "Return one reader-facing suggestion for each input item, in the same order. Write every field in natural Japanese.",
    "Use a short noun phrase for title. Write question as a direct question ending in ？. Do not duplicate the question as the title.",
    "Write each explanation field as exactly one concise, complete Japanese sentence. Every sentence must end with Japanese punctuation.",
    "missingInformation must name missing evidence such as a source, date, excavation record, exhibit, origin, route, or comparison. expectedObservation must name something observable such as an artifact, panel, document, ruin, terrain, position, or comparison. uncertainty must name a source limitation, interpretation, tradition, dating, identification theory, preservation state, or regional difference.",
    "Never output none, null, unknown, needs_review, 不明, なし, 詳細情報を追加, or generic claims about gaining insight.",
    "Address the user directly where needed. Never mention 旅行者 or AIナレーター.",
    "There are no internal IDs in the input. Avoid unsupported historical claims and state the concrete limitation in uncertainty.",
  ].join("\n") }, { role: "user", content: JSON.stringify(proseContext) }], (value) => {
    removeInternalIdsFromProse(value);
    if (value.suggestions.length !== restoredSelection.length) throw new Error("Reader prose count does not match grounding selection count.");
    const combined = SuggestionDraftOutputSchema.parse({ suggestions: value.suggestions.map((item, index) => ({ ...item, ...restoredSelection[index] })) });
    validateSuggestionDraftReferences(combined, input.context);
  });
  const cleaned = ReaderProseSchema.parse(removeInternalIdsFromProse(prose));
  const output = SuggestionDraftOutputSchema.parse({ suggestions: cleaned.suggestions.map((item, index) => {
    const selectionItem = restoredSelection[index];
    const frontier = selectionItem.targetPlaceId ? input.context.frontierPlaces.find(({ placeId }) => placeId === selectionItem.targetPlaceId) : undefined;
    return { ...item, ...(frontier ? { targetName: frontier.label } : {}), ...selectionItem };
  }) });
  validateSuggestionDraftReferences(output, input.context);
  return { provider: "ollama" as const, model, attempts: maxAttempts, usage: { inputTokens: usage.inputTokens || null, outputTokens: usage.outputTokens || null }, output };
}
