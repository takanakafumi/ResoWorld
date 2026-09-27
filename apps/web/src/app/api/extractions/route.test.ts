import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  preview: vi.fn(),
  extract: vi.fn(),
  loadCheckpoint: vi.fn(),
  saveCheckpoint: vi.fn(),
}));

vi.mock("@/server/imports/local-files", () => ({
  LocalImportError: class LocalImportError extends Error {
    constructor(public readonly code: string, message: string) {
      super(message);
    }
  },
  previewLocalImport: mocks.preview,
}));

vi.mock("@/server/extraction/errors", () => ({
  ClaimExtractionError: class ClaimExtractionError extends Error {
    constructor(public readonly code: string, message: string) {
      super(message);
    }
  },
}));

vi.mock("@/server/extraction/provider", () => ({
  requestClaimExtraction: mocks.extract,
}));

vi.mock("@/server/extraction/checkpoint", () => ({
  loadExtractionCheckpoint: mocks.loadCheckpoint,
  saveExtractionCheckpoint: mocks.saveCheckpoint,
}));

import { POST } from "./route";

const documentSha256 = "a".repeat(64);
const passage = {
  id: "passage-demo-1",
  documentId: "document-demo-1",
  startLine: 2,
  endLine: 2,
  sectionPath: ["地点A"],
  text: "地点Aを観察した。",
  sha256: "b".repeat(64),
};
const validRequest = {
  file: "anonymous.txt",
  documentSha256,
  passageIds: [passage.id],
  provider: "lmstudio",
  model: "qwen/qwen3-14b",
  consent: "process_selected_passages_locally",
};

function request(body: unknown) {
  return new Request("http://localhost/api/extractions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/extractions", () => {
  beforeEach(() => {
    mocks.preview.mockReset();
    mocks.extract.mockReset();
    mocks.loadCheckpoint.mockReset();
    mocks.saveCheckpoint.mockReset();
    mocks.loadCheckpoint.mockResolvedValue(new Map());
    mocks.saveCheckpoint.mockResolvedValue(undefined);
    mocks.preview.mockResolvedValue({
      id: "document-demo-1",
      title: "匿名記録",
      relativePath: "anonymous.txt",
      sha256: documentSha256,
      lineCount: 2,
      byteLength: 30,
      passages: [passage],
      changedFromExpectedHash: false,
    });
    mocks.extract.mockResolvedValue({
      provider: "lmstudio",
      responseId: "resp_demo",
      model: "gpt-oss:20b",
      attempts: 1,
      durationMs: 1500,
      usage: { inputTokens: 10, outputTokens: 20, totalTokens: 30 },
      output: {
        claims: [
          {
            statement: "地点Aを観察した。",
            subject: { name: "地点A", type: "Place" },
            predicate: "was_observed",
            object: { kind: "literal", value: true },
            claimKind: "observation",
            originType: "user",
            epistemic: {
              verification: "personal-evidence",
              modality: "asserted",
            },
            historicalTime: null,
            places: [{ name: "地点A", role: "observed_place" }],
            evidence: [
              {
                passageId: passage.id,
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
      },
    });
  });

  it("requires the provider-specific consent value", async () => {
    const response = await POST(request({ ...validRequest, consent: true }));
    expect(response.status).toBe(400);
    expect(mocks.preview).not.toHaveBeenCalled();
    expect(mocks.extract).not.toHaveBeenCalled();
  });

  it("rejects duplicate Passage IDs before reading or sending", async () => {
    const response = await POST(
      request({ ...validRequest, passageIds: [passage.id, passage.id] }),
    );
    expect(response.status).toBe(400);
    expect(mocks.preview).not.toHaveBeenCalled();
    expect(mocks.extract).not.toHaveBeenCalled();
  });

  it("stops when the document changed after preview", async () => {
    mocks.preview.mockResolvedValueOnce({
      ...(await mocks.preview()),
      changedFromExpectedHash: true,
    });
    mocks.preview.mockClear();

    const response = await POST(request(validRequest));
    expect(response.status).toBe(409);
    expect(mocks.extract).not.toHaveBeenCalled();
  });

  it("sends only the selected, locally resolved Passage", async () => {
    const response = await POST(request(validRequest));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(mocks.extract).toHaveBeenCalledWith(
      expect.objectContaining({
        provider: "lmstudio",
        model: "qwen/qwen3-14b",
        passages: [passage],
      }),
    );
    expect(body.extraction.claims[0].reviewStatus).toBe("suggested");
    expect(body.extraction.claims[0].evidence[0].passage.quote).toBe(
      passage.text,
    );
  });

  it("persists a completed local batch through the checkpoint boundary", async () => {
    const response = await POST(request(validRequest));
    expect(response.status).toBe(200);
    const extractionInput = mocks.extract.mock.calls[0][0];
    const batch = {
      id: "batch-a",
      passageIds: [passage.id],
      result: {
        provider: "lmstudio",
        responseId: null,
        model: "qwen/qwen3-14b",
        attempts: 1,
        durationMs: 100,
        output: { claims: [] },
        usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 },
      },
    };

    await extractionInput.onBatchCompleted(batch);

    expect(mocks.saveCheckpoint).toHaveBeenCalledWith(
      expect.objectContaining({
        documentSha256,
        provider: "lmstudio",
        model: "qwen/qwen3-14b",
        batches: expect.any(Map),
      }),
    );
  });
});
