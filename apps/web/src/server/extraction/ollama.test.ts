import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import type { ImportedPassage } from "@/domain/imports/types";

import { requestOllamaClaimExtraction } from "./ollama";

const passage: ImportedPassage = {
  id: "passage-demo-1",
  documentId: "document-demo-1",
  startLine: 1,
  endLine: 1,
  sectionPath: [],
  text: "地点Aを観察した。",
  sha256: "a".repeat(64),
};

function ollamaResponse(content: string) {
  return new Response(
    JSON.stringify({
      done: true,
      message: { role: "assistant", content },
      total_duration: 1_500_000_000,
      prompt_eval_count: 10,
      eval_count: 20,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
}

describe("requestOllamaClaimExtraction", () => {
  it("only accepts a local loopback Ollama address", async () => {
    const fetchImpl = vi.fn();
    await expect(
      requestOllamaClaimExtraction({
        baseUrl: "https://example.com",
        documentTitle: "匿名記録",
        passages: [passage],
        fetchImpl,
      }),
    ).rejects.toMatchObject({ code: "not_configured" });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("uses JSON Schema, temperature zero, and only selected passages", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(ollamaResponse('{"claims":[]}'));
    const result = await requestOllamaClaimExtraction({
      documentTitle: "匿名記録",
      passages: [passage],
      fetchImpl,
    });

    const url = fetchImpl.mock.calls[0][0] as URL;
    const init = fetchImpl.mock.calls[0][1] as RequestInit;
    const body = JSON.parse(String(init.body));
    expect(url.href).toBe("http://127.0.0.1:11434/api/chat");
    expect(body.model).toBe("qwen3.5:9b");
    expect(body.stream).toBe(false);
    expect(body.format.type).toBe("object");
    expect(JSON.stringify(body.format)).toContain('"enum":["P001"]');
    expect(body.options).toEqual({
      temperature: 0,
      num_ctx: 32_768,
      num_predict: 4_000,
    });
    expect(body.messages[1].content).toContain('"passageId": "P001"');
    expect(body.messages[1].content).not.toContain(passage.id);
    expect(result.provider).toBe("ollama");
    expect(result.durationMs).toBe(1500);
    expect(result.usage.totalTokens).toBe(30);
  });

  it("rejects an unsupported local model before connecting", async () => {
    const fetchImpl = vi.fn();
    await expect(
      requestOllamaClaimExtraction({
        model: "unknown:latest",
        documentTitle: "匿名記録",
        passages: [passage],
        fetchImpl,
      }),
    ).rejects.toMatchObject({ code: "not_configured" });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("retries invalid structured output once", async () => {
    const fetchImpl = vi
      .fn()
      .mockImplementation(() =>
        Promise.resolve(
          ollamaResponse('{"claims":[{"statement":"broken"}]}'),
        ),
      );
    await expect(
      requestOllamaClaimExtraction({
        documentTitle: "匿名記録",
        passages: [passage],
        fetchImpl,
      }),
    ).rejects.toMatchObject({ code: "invalid_output" });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });
});
