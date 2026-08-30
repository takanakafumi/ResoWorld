import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import type { ImportedPassage } from "@/domain/imports/types";

import { ClaimExtractionError, requestClaimExtraction } from "./openai";

const passage: ImportedPassage = {
  id: "passage-demo-1",
  documentId: "document-demo-1",
  startLine: 1,
  endLine: 1,
  sectionPath: [],
  text: "地点Aを観察した。",
  sha256: "a".repeat(64),
};

function apiResponse(text: string) {
  return new Response(
    JSON.stringify({
      id: "resp_demo",
      status: "completed",
      output: [
        {
          type: "message",
          content: [{ type: "output_text", text }],
        },
      ],
      usage: { input_tokens: 10, output_tokens: 20, total_tokens: 30 },
    }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
}

describe("requestClaimExtraction", () => {
  it("never calls the network without a configured key", async () => {
    const fetchImpl = vi.fn();
    await expect(
      requestClaimExtraction({
        apiKey: undefined,
        documentTitle: "匿名記録",
        passages: [passage],
        fetchImpl,
      }),
    ).rejects.toMatchObject({ code: "not_configured" });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("uses store=false and only serializes the selected passages", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(apiResponse('{"claims":[]}'));
    const result = await requestClaimExtraction({
      apiKey: "test-key",
      documentTitle: "匿名記録",
      passages: [passage],
      fetchImpl,
    });

    const init = fetchImpl.mock.calls[0][1] as RequestInit;
    const body = JSON.parse(String(init.body));
    expect(body.store).toBe(false);
    expect(body.model).toBe("gpt-5.6-sol");
    expect(body.reasoning).toEqual({ effort: "medium" });
    expect(body.input).toContain(passage.id);
    expect(result.output.claims).toEqual([]);
  });

  it("rejects invalid output after one bounded retry", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(apiResponse('{"claims":[{"statement":"broken"}]}'));

    await expect(
      requestClaimExtraction({
        apiKey: "test-key",
        documentTitle: "匿名記録",
        passages: [passage],
        fetchImpl,
      }),
    ).rejects.toBeInstanceOf(ClaimExtractionError);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it("does not retry a refusal", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          id: "resp_refusal",
          status: "completed",
          output: [
            {
              type: "message",
              content: [{ type: "refusal", refusal: "cannot comply" }],
            },
          ],
        }),
        { status: 200 },
      ),
    );

    await expect(
      requestClaimExtraction({
        apiKey: "test-key",
        documentTitle: "匿名記録",
        passages: [passage],
        fetchImpl,
      }),
    ).rejects.toMatchObject({ code: "refused" });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });
});

