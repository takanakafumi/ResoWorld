import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import type { ExplorationResearchBrief } from "@/domain/exploration/research";

import {
  ExplorationResearchError,
  requestOpenAIExplorationResearch,
} from "./openai-web-research";

const brief: ExplorationResearchBrief = {
  targetName: "候補A",
  actionType: "field_visit",
  question: "地域の伝承と政治的境界は関係したか？",
  missingInformation: "一次資料と比較対象が不足している。",
  expectedObservation: "現地解説と公開史料の一致点を確認する。",
};

function apiResponse(sourceUrl = "https://example.org/source") {
  return new Response(
    JSON.stringify({
      id: "resp_research",
      status: "completed",
      output: [
        {
          type: "web_search_call",
          action: {
            sources: [{ title: "Public source", url: sourceUrl }],
          },
        },
        {
          type: "message",
          content: [
            {
              type: "output_text",
              text: JSON.stringify({
                summary: "比較できる公開情報が見つかった。",
                candidates: [
                  {
                    targetName: "資料館B",
                    actionType: "field_visit",
                    reason: "境界史料を公開している。",
                    expectedObservation: "展示中の絵図を比較する。",
                    uncertainty: "展示替えの可能性がある。",
                    sourceUrls: ["https://example.org/source"],
                  },
                ],
              }),
            },
          ],
        },
      ],
      usage: { input_tokens: 20, output_tokens: 30, total_tokens: 50 },
    }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
}

describe("requestOpenAIExplorationResearch", () => {
  it("never calls the network unless the feature and key are configured", async () => {
    const fetchImpl = vi.fn();
    await expect(
      requestOpenAIExplorationResearch({ brief, enabled: false, fetchImpl }),
    ).rejects.toMatchObject({ code: "disabled" });
    await expect(
      requestOpenAIExplorationResearch({
        brief,
        enabled: true,
        apiKey: "",
        fetchImpl,
      }),
    ).rejects.toMatchObject({ code: "not_configured" });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("uses store=false, web search, and only the minimized brief", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(apiResponse());
    const result = await requestOpenAIExplorationResearch({
      brief,
      enabled: true,
      apiKey: "test-key",
      fetchImpl,
    });

    const requestBody = JSON.parse(
      String((fetchImpl.mock.calls[0][1] as RequestInit).body),
    );
    expect(requestBody.store).toBe(false);
    expect(requestBody.model).toBe("gpt-5.4-nano");
    expect(requestBody.tools).toEqual([
      { type: "web_search_preview", search_context_size: "medium" },
    ]);
    expect(requestBody.include).toEqual(["web_search_call.action.sources"]);
    expect(requestBody.input).toContain(brief.question);
    expect(requestBody.input).not.toContain("passage");
    expect(requestBody.input).not.toContain("claimIds");
    expect(result.candidates[0].sources).toEqual([
      { title: "Public source", url: "https://example.org/source" },
    ]);
  });

  it("rejects candidates whose source URL was not returned by web search", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(apiResponse("https://example.org/different"));
    await expect(
      requestOpenAIExplorationResearch({
        brief,
        enabled: true,
        apiKey: "test-key",
        fetchImpl,
      }),
    ).rejects.toBeInstanceOf(ExplorationResearchError);
  });
});
