import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import type { ImportedPassage } from "@/domain/imports/types";

import { requestLMStudioClaimExtraction } from "./lmstudio";

const passage: ImportedPassage = {
  id: "passage-demo-1",
  documentId: "document-demo-1",
  startLine: 1,
  endLine: 1,
  sectionPath: [],
  text: "地点Aを観察した。",
  sha256: "a".repeat(64),
};

function lmStudioResponse(content: string) {
  return new Response(
    JSON.stringify({
      id: "chatcmpl-test",
      choices: [
        {
          index: 0,
          message: { role: "assistant", content },
          finish_reason: "stop",
        },
      ],
      usage: {
        prompt_tokens: 15,
        completion_tokens: 25,
        total_tokens: 40,
      },
    }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
}

describe("requestLMStudioClaimExtraction", () => {
  it("only accepts a local loopback LM Studio address", async () => {
    const fetchImpl = vi.fn();
    await expect(
      requestLMStudioClaimExtraction({
        baseUrl: "https://example.com",
        documentTitle: "匿名記録",
        passages: [passage],
        fetchImpl,
      }),
    ).rejects.toMatchObject({ code: "not_configured" });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("posts to /v1/chat/completions with default qwen/qwen3-14b model and parses claims", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(lmStudioResponse('{"claims":[]}'));
    const result = await requestLMStudioClaimExtraction({
      documentTitle: "匿名記録",
      passages: [passage],
      fetchImpl,
    });

    const url = fetchImpl.mock.calls[0][0] as URL;
    const init = fetchImpl.mock.calls[0][1] as RequestInit;
    const body = JSON.parse(String(init.body));
    expect(url.href).toBe("http://127.0.0.1:1234/v1/chat/completions");
    expect(body.model).toBe("qwen/qwen3-14b");
    expect(body.stream).toBe(false);
    expect(result.provider).toBe("lmstudio");
    expect(result.output.claims).toEqual([]);
    expect(result.usage.totalTokens).toBe(40);
  });

  it("handles markdown json wrapper from local LLM", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(lmStudioResponse('```json\n{"claims":[]}\n```'));
    const result = await requestLMStudioClaimExtraction({
      documentTitle: "匿名記録",
      passages: [passage],
      fetchImpl,
    });

    expect(result.output.claims).toEqual([]);
  });

  it("restores passage aliases back to real IDs", async () => {
    const claimJson = JSON.stringify({
      claims: [
        {
          statement: "地点Aは古代祭祀の痕跡を持つ。",
          subject: { name: "地点A", type: "Place" },
          predicate: "has_ritual_trace",
          object: { kind: "literal", value: true },
          claimKind: "observation",
          originType: "user",
          epistemic: { verification: "personal-evidence", modality: "asserted" },
          historicalTime: null,
          places: [
            {
              role: "intended_place",
              name: "地点A",
            },
          ],
          evidence: [
            {
              passageId: "P001",
              role: "supports",
              sourceNature: "Observation",
              documentVoice: "user-narrator",
              sourceTitle: null,
              sourceUrl: null,
              note: null,
            },
          ],
        },
      ],
    });

    const fetchImpl = vi.fn().mockResolvedValue(lmStudioResponse(claimJson));
    const result = await requestLMStudioClaimExtraction({
      documentTitle: "匿名記録",
      passages: [passage],
      fetchImpl,
    });

    expect(result.output.claims[0].evidence[0].passageId).toBe("passage-demo-1");
  });
});
