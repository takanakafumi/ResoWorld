import { describe, expect, it, vi } from "vitest";

import type { ReviewDataset } from "@/domain/review/types";
import { buildJourneySuggestionContext } from "@/domain/exploration/suggestion-drafts";
import { requestOllamaSuggestionDraft } from "./ollama-suggestions";

const dataset = {
  claims: [{
    id: "claim-1",
    statement: "訪問地Aと訪問地Bの解釈には差がある。",
    claimKind: "question",
    historicalTime: null,
    reviewStatus: "confirmed",
    evidence: [{ passage: { documentId: "document-1", text: "旅行記の非送信本文" } }],
  }],
  atlas: {
    journeys: [{ id: "journey-1", label: "旅1", documentIds: ["document-1"], spotIds: ["spot-1"], connectionIds: ["connection-1"] }],
    spots: [{ id: "spot-1", name: "訪問地A", region: "地域A", kind: "museum", claimIds: ["claim-1"] }],
    connections: [{ id: "connection-1", title: "解釈差", summary: "二つの見方を比べる。", claimIds: ["claim-1"], spotIds: ["spot-1"], concepts: ["解釈差"], facets: ["politics"] }],
  },
} as unknown as ReviewDataset;

const validOutput = {
  suggestions: [{
    title: "解釈差を確かめる",
    targetName: "訪問地Aの展示",
    actionType: "revisit",
    question: "二つの解釈は何を根拠に分かれるのか？",
    missingInformation: "展示が採用する史料と異説の扱い。",
    reason: "過去の問いを、史料の違いとして再確認できるため。",
    expectedObservation: "説明板の典拠と異説への言及。",
    uncertainty: "展示内容は更新されている可能性がある。",
    claimIds: ["claim-1"],
    anchorSpotIds: ["spot-1"],
    connectionIds: ["connection-1"],
    targetKind: "critical_revisit",
  }],
};

const validSelection = {
  suggestions: [{ actionType: "revisit", connectionId: "K001" }],
};

function ollamaResponse(output: unknown) {
  return new Response(JSON.stringify({ done: true, message: { content: JSON.stringify(output) }, prompt_eval_count: 10, eval_count: 20 }));
}

describe("requestOllamaSuggestionDraft", () => {
  it("accepts a structured response grounded in the Journey IDs", async () => {
    const sentBodies: string[] = [];
    const fetchImpl: typeof fetch = vi.fn(async (_input, init) => {
      sentBodies.push(String(init?.body ?? ""));
      return ollamaResponse(sentBodies.length === 1 ? validSelection : validOutput);
    });
    const context = buildJourneySuggestionContext(dataset, "journey-1");

    const result = await requestOllamaSuggestionDraft({ context, fetchImpl });

    expect(result.output).toEqual(validOutput);
    const groundingBody = JSON.parse(sentBodies[0]);
    const proseBody = JSON.parse(sentBodies[1]);
    expect(groundingBody.messages[1].content).not.toContain("旅行記の非送信本文");
    expect(groundingBody.messages[1].content).toContain("C001");
    expect(groundingBody.messages[1].content).not.toContain("claim-1");
    expect(groundingBody.messages[0].content).toContain("行けなかった理由");
    expect(proseBody.messages[1].content).toContain("訪問地Aと訪問地Bの解釈には差がある。");
    expect(proseBody.messages[1].content).not.toContain("C001");
    expect(proseBody.think).toBe(false);
  });

  it("derives Claims and Spots from the selected Connection", async () => {
    const context = buildJourneySuggestionContext(dataset, "journey-1");
    context.claims.push({ ...context.claims[0], id: "claim-2", statement: "別の接続に属する問い。" });
    context.spots.push({ ...context.spots[0], id: "spot-2", name: "訪問地B", claimIds: ["claim-2"] });
    context.connections.push({
      ...context.connections[0],
      id: "connection-2",
      title: "別の接続",
      claimIds: ["claim-2"],
      spotIds: ["spot-2"],
    });
    const selection = { suggestions: [{ actionType: "literature_research", connectionId: "K002" }] };
    const fetchImpl: typeof fetch = vi.fn()
      .mockResolvedValueOnce(ollamaResponse(selection))
      .mockResolvedValueOnce(ollamaResponse(validOutput));

    const result = await requestOllamaSuggestionDraft({ context, fetchImpl });

    expect(result.output.suggestions[0]).toMatchObject({
      claimIds: ["claim-2"],
      anchorSpotIds: ["spot-2"],
      connectionIds: ["connection-2"],
    });
  });

  it("grounds a field visit in an unvisited Knowledge target and uses its coordinates", async () => {
    const context = buildJourneySuggestionContext(dataset, "journey-1");
    context.frontierPlaces.push({
      placeId: "place-next", label: "未訪問の史跡", latitude: 35.5, longitude: 133.25,
      connectionId: "connection-1", connectionTitle: "解釈差", anchorSpotIds: ["spot-1"],
      connectionSummary: "訪問済み地点から未訪問地へつながる。",
      claimIds: ["claim-1"], relationFamilies: ["historical"], reviewStatus: "reviewed",
      targetKind: "knowledge_unvisited",
    });
    const selection = { suggestions: [{ actionType: "field_visit", targetPlaceId: "P001", connectionId: "K001" }] };
    const prose = structuredClone(validOutput);
    prose.suggestions[0] = { ...prose.suggestions[0], targetName: "モデルが付けた別名", actionType: "field_visit" };
    const sentBodies: string[] = [];
    const fetchImpl: typeof fetch = vi.fn(async (_input, init) => {
      sentBodies.push(String(init?.body ?? ""));
      return ollamaResponse(sentBodies.length === 1 ? selection : prose);
    });

    const result = await requestOllamaSuggestionDraft({ context, fetchImpl });

    expect(result.output.suggestions[0]).toMatchObject({
      targetName: "未訪問の史跡", targetPlaceId: "place-next", targetKind: "knowledge_unvisited",
      targetLatitude: 35.5, targetLongitude: 133.25,
    });
    expect(JSON.parse(sentBodies[0]).messages[1].content).toContain("P001");
    expect(JSON.parse(sentBodies[0]).messages[1].content).not.toContain("place-next");
  });

  it("prefers substantive Knowledge frontiers over unrelated missed visits", async () => {
    const context = buildJourneySuggestionContext(dataset, "journey-1");
    context.frontierPlaces.push(
      { placeId: "knowledge-next", label: "知識候補", latitude: 35, longitude: 133, connectionId: "connection-1", connectionTitle: "解釈差", connectionSummary: "知識接続。", anchorSpotIds: ["spot-1"], claimIds: ["claim-1"], relationFamilies: ["historical"], reviewStatus: "reviewed", targetKind: "knowledge_unvisited" },
      { placeId: "missed-next", label: "行けなかった場所", latitude: 36, longitude: 134, connectionId: "connection-1", connectionTitle: "解釈差", connectionSummary: "旅行記の未訪問意図。", anchorSpotIds: ["spot-1"], claimIds: ["claim-1"], relationFamilies: ["missed-visit"], reviewStatus: "reviewed", targetKind: "missed_visit" },
    );
    let firstBody = "";
    const selection = { suggestions: [{ actionType: "field_visit", targetPlaceId: "P001", connectionId: "K001" }] };
    const prose = structuredClone(validOutput);
    prose.suggestions[0].actionType = "field_visit";
    const fetchImpl: typeof fetch = vi.fn(async (_input, init) => {
      if (!firstBody) { firstBody = String(init?.body ?? ""); return ollamaResponse(selection); }
      return ollamaResponse(prose);
    });

    const result = await requestOllamaSuggestionDraft({ context, fetchImpl });

    expect(firstBody).toContain("知識候補");
    expect(firstBody).not.toContain("行けなかった場所");
    expect(result.output.suggestions[0]).toMatchObject({ targetPlaceId: "knowledge-next", targetKind: "knowledge_unvisited", targetName: "知識候補" });
  });

  it("uses a missed visit as a fallback without another Knowledge connection", async () => {
    const context = buildJourneySuggestionContext(dataset, "journey-1");
    context.connections[0].facets = [{ id: "missed-visit", label: "未訪問", weight: 5 }];
    context.frontierPlaces.push({
      placeId: "missed-next", label: "行けなかった場所", latitude: 36, longitude: 134,
      connectionId: "connection-1", connectionTitle: "未訪問", connectionSummary: "旅行記の未訪問意図。",
      anchorSpotIds: ["spot-1"], claimIds: ["claim-1"], relationFamilies: ["missed-visit"],
      reviewStatus: "reviewed", targetKind: "missed_visit",
    });
    const selection = { suggestions: [{ actionType: "field_visit", targetPlaceId: "P001", connectionId: "K001" }] };
    const prose = structuredClone(validOutput);
    prose.suggestions[0].actionType = "field_visit";
    const fetchImpl: typeof fetch = vi.fn()
      .mockResolvedValueOnce(ollamaResponse(selection))
      .mockResolvedValueOnce(ollamaResponse(prose));

    const result = await requestOllamaSuggestionDraft({ context, fetchImpl });

    expect(result.output.suggestions[0]).toMatchObject({
      targetPlaceId: "missed-next",
      targetKind: "missed_visit",
      targetName: "行けなかった場所",
    });
  });

  it("allows literature research when a frontier place exists", async () => {
    const context = buildJourneySuggestionContext(dataset, "journey-1");
    context.frontierPlaces.push({
      placeId: "missed-next", label: "行けなかった場所", latitude: 36, longitude: 134,
      connectionId: "connection-1", connectionTitle: "解釈差", connectionSummary: "旅行記の未訪問意図。",
      anchorSpotIds: ["spot-1"], claimIds: ["claim-1"], relationFamilies: ["missed-visit"],
      reviewStatus: "reviewed", targetKind: "missed_visit",
    });
    const selection = { suggestions: [{ actionType: "literature_research", connectionId: "K001" }] };
    const fetchImpl: typeof fetch = vi.fn()
      .mockResolvedValueOnce(ollamaResponse(selection))
      .mockResolvedValueOnce(ollamaResponse(validOutput));

    const result = await requestOllamaSuggestionDraft({ context, fetchImpl });

    expect(result.output.suggestions[0]).toMatchObject({
      actionType: "literature_research",
      targetKind: "research",
    });
    expect(result.output.suggestions[0]).not.toHaveProperty("targetPlaceId");
  });

  it("normalizes a field visit without a target place to literature research", async () => {
    const context = buildJourneySuggestionContext(dataset, "journey-1");
    const selection = { suggestions: [{ actionType: "field_visit", connectionId: "K001" }] };
    const fetchImpl: typeof fetch = vi.fn()
      .mockResolvedValueOnce(ollamaResponse(selection))
      .mockResolvedValueOnce(ollamaResponse(validOutput));

    const result = await requestOllamaSuggestionDraft({ context, fetchImpl });

    expect(result.output.suggestions[0]).toMatchObject({
      actionType: "literature_research",
      targetKind: "research",
    });
  });

  it("drops a fabricated target place and falls back to literature research", async () => {
    const context = buildJourneySuggestionContext(dataset, "journey-1");
    const selection = { suggestions: [{ actionType: "field_visit", targetPlaceId: "P999", connectionId: "K001" }] };
    let requestCount = 0;
    const fetchImpl: typeof fetch = vi.fn(async () =>
      ollamaResponse(requestCount++ === 0 ? selection : validOutput),
    );

    const result = await requestOllamaSuggestionDraft({ context, fetchImpl });

    expect(result.output.suggestions[0]).toMatchObject({
      actionType: "literature_research",
      targetKind: "research",
    });
    expect(result.output.suggestions[0]).not.toHaveProperty("targetPlaceId");
  });

  it("enables thinking for gpt-oss structured output", async () => {
    let sentBody = "";
    let requestCount = 0;
    const fetchImpl: typeof fetch = vi.fn(async (_input, init) => {
      sentBody = String(init?.body ?? "");
      return ollamaResponse(requestCount++ === 0 ? validSelection : validOutput);
    });

    await requestOllamaSuggestionDraft({
      context: buildJourneySuggestionContext(dataset, "journey-1"),
      model: "gpt-oss:20b",
      fetchImpl,
    });

    expect(JSON.parse(sentBody).think).toBe(true);
  });

  it("rejects unknown references after the bounded retry", async () => {
    const invalid = { suggestions: [{ actionType: "revisit", connectionId: "K999" }] };
    const fetchImpl = vi.fn(async () => ollamaResponse(invalid));

    await expect(requestOllamaSuggestionDraft({
      context: buildJourneySuggestionContext(dataset, "journey-1"),
      fetchImpl,
    })).rejects.toThrow("unknown connectionId");
    expect(fetchImpl).toHaveBeenCalledTimes(3);
  });

  it("regenerates reader-facing prose that exposed internal IDs", async () => {
    const noisy = structuredClone(validOutput);
    noisy.suggestions[0].question = "入力内の claim（claim-1, claim-2）は何を意味するのか？";
    const fetchImpl = vi.fn()
      .mockResolvedValueOnce(ollamaResponse(validSelection))
      .mockResolvedValueOnce(ollamaResponse(noisy))
      .mockResolvedValueOnce(ollamaResponse(validOutput));

    const result = await requestOllamaSuggestionDraft({
      context: buildJourneySuggestionContext(dataset, "journey-1"),
      fetchImpl,
    });

    expect(result.output.suggestions[0].question).toBe(validOutput.suggestions[0].question);
    expect(fetchImpl).toHaveBeenCalledTimes(3);
  });

  it("regenerates prose when replacing an internal ID leaves a vague subject", async () => {
    const noisy = structuredClone(validOutput);
    noisy.suggestions[0].question = "claim-1 は何を意味するのか？";
    const fetchImpl = vi.fn()
      .mockResolvedValueOnce(ollamaResponse(validSelection))
      .mockResolvedValueOnce(ollamaResponse(noisy))
      .mockResolvedValueOnce(ollamaResponse(validOutput));

    const result = await requestOllamaSuggestionDraft({
      context: buildJourneySuggestionContext(dataset, "journey-1"),
      fetchImpl,
    });

    expect(result.output.suggestions[0].question).toBe(validOutput.suggestions[0].question);
    expect(fetchImpl).toHaveBeenCalledTimes(3);
  });

  it("regenerates prose when replacing a bare hash leaves a vague subject", async () => {
    const noisy = structuredClone(validOutput);
    noisy.suggestions[0].reason = "記録 6006f254550ec1856533 が示す未確認点を調べるため。";
    const fetchImpl = vi.fn()
      .mockResolvedValueOnce(ollamaResponse(validSelection))
      .mockResolvedValueOnce(ollamaResponse(noisy))
      .mockResolvedValueOnce(ollamaResponse(validOutput));

    const result = await requestOllamaSuggestionDraft({ context: buildJourneySuggestionContext(dataset, "journey-1"), fetchImpl });

    expect(result.output.suggestions[0].reason).toBe(validOutput.suggestions[0].reason);
    expect(fetchImpl).toHaveBeenCalledTimes(3);
  });

  it("normalizes a missing question mark without spending a retry", async () => {
    const unpunctuated = structuredClone(validOutput);
    unpunctuated.suggestions[0].question = "訪問地の関係をどう読み解けるか";
    let requestCount = 0;
    const fetchImpl = vi.fn(async () => ollamaResponse(requestCount++ === 0 ? validSelection : unpunctuated));

    const result = await requestOllamaSuggestionDraft({ context: buildJourneySuggestionContext(dataset, "journey-1"), fetchImpl });

    expect(result.output.suggestions[0].question).toBe("訪問地の関係をどう読み解けるか？");
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it("removes a trailing structured-output fragment from prose", async () => {
    const noisy = structuredClone(validOutput);
    noisy.suggestions[0].uncertainty = "展示解釈は更新される可能性があります。}]}";
    let requestCount = 0;
    const fetchImpl = vi.fn(async () => ollamaResponse(requestCount++ === 0 ? validSelection : noisy));

    const result = await requestOllamaSuggestionDraft({ context: buildJourneySuggestionContext(dataset, "journey-1"), fetchImpl });

    expect(result.output.suggestions[0].uncertainty).toBe("展示解釈は更新される可能性があります。");
  });

  it("refuses non-loopback Ollama endpoints", async () => {
    await expect(requestOllamaSuggestionDraft({
      context: buildJourneySuggestionContext(dataset, "journey-1"),
      baseUrl: "https://example.com",
    })).rejects.toThrow("loopback");
  });
});
