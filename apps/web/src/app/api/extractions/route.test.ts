import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  preview: vi.fn(),
  extract: vi.fn(),
}));

vi.mock("@/server/imports/local-files", () => ({
  LocalImportError: class LocalImportError extends Error {
    constructor(public readonly code: string, message: string) {
      super(message);
    }
  },
  previewLocalImport: mocks.preview,
}));

vi.mock("@/server/extraction/openai", () => ({
  ClaimExtractionError: class ClaimExtractionError extends Error {
    constructor(public readonly code: string, message: string) {
      super(message);
    }
  },
  requestClaimExtraction: mocks.extract,
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
  consent: "send_selected_passages_to_openai",
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
      responseId: "resp_demo",
      model: "gpt-5.6-sol",
      attempts: 1,
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

  it("requires the exact external-send consent value", async () => {
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
      expect.objectContaining({ passages: [passage] }),
    );
    expect(body.extraction.claims[0].reviewStatus).toBe("suggested");
    expect(body.extraction.claims[0].evidence[0].passage.quote).toBe(
      passage.text,
    );
  });
});

