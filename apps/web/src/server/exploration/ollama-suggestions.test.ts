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
  }],
};

function ollamaResponse(output: unknown) {
  return new Response(JSON.stringify({ done: true, message: { content: JSON.stringify(output) }, prompt_eval_count: 10, eval_count: 20 }));
}

describe("requestOllamaSuggestionDraft", () => {
  it("accepts a structured response grounded in the Journey IDs", async () => {
    let sentBody = "";
    const fetchImpl: typeof fetch = vi.fn(async (_input, init) => {
      sentBody = String(init?.body ?? "");
      return ollamaResponse(validOutput);
    });
    const context = buildJourneySuggestionContext(dataset, "journey-1");

    const result = await requestOllamaSuggestionDraft({ context, fetchImpl });

    expect(result.output).toEqual(validOutput);
    const body = JSON.parse(sentBody);
    expect(body.messages[1].content).not.toContain("旅行記の非送信本文");
    expect(body.messages[1].content).toContain("訪問地Aと訪問地Bの解釈には差がある。");
  });

  it("rejects unknown references after the bounded retry", async () => {
    const invalid = structuredClone(validOutput);
    invalid.suggestions[0].claimIds = ["claim-unknown"];
    const fetchImpl = vi.fn(async () => ollamaResponse(invalid));

    await expect(requestOllamaSuggestionDraft({
      context: buildJourneySuggestionContext(dataset, "journey-1"),
      fetchImpl,
    })).rejects.toThrow("unknown claimIds");
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it("removes internal IDs from reader-facing prose before validation", async () => {
    const noisy = structuredClone(validOutput);
    noisy.suggestions[0].question = "入力内の claim（claim-1, claim-2）は何を意味するのか？";
    const fetchImpl = vi.fn(async () => ollamaResponse(noisy));

    const result = await requestOllamaSuggestionDraft({
      context: buildJourneySuggestionContext(dataset, "journey-1"),
      fetchImpl,
    });

    expect(result.output.suggestions[0].question).toBe("入力内の記録は何を意味するのか？");
  });

  it("keeps the sentence grammatical when an internal ID was used as its subject", async () => {
    const noisy = structuredClone(validOutput);
    noisy.suggestions[0].question = "claim-1 は何を意味するのか？";
    const fetchImpl = vi.fn(async () => ollamaResponse(noisy));

    const result = await requestOllamaSuggestionDraft({
      context: buildJourneySuggestionContext(dataset, "journey-1"),
      fetchImpl,
    });

    expect(result.output.suggestions[0].question).toBe("この記録は何を意味するのか？");
  });

  it("removes a bare hash copied from a Claim ID", async () => {
    const noisy = structuredClone(validOutput);
    noisy.suggestions[0].reason = "記録 6006f254550ec1856533 が示す未確認点を調べるため。";
    const fetchImpl = vi.fn(async () => ollamaResponse(noisy));

    const result = await requestOllamaSuggestionDraft({ context: buildJourneySuggestionContext(dataset, "journey-1"), fetchImpl });

    expect(result.output.suggestions[0].reason).toBe("この記録が示す未確認点を調べるため。");
  });

  it("refuses non-loopback Ollama endpoints", async () => {
    await expect(requestOllamaSuggestionDraft({
      context: buildJourneySuggestionContext(dataset, "journey-1"),
      baseUrl: "https://example.com",
    })).rejects.toThrow("loopback");
  });
});
