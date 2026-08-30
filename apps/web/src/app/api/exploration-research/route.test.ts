import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  loadDataset: vi.fn(),
  research: vi.fn(),
}));

vi.mock("@/server/review/local-dataset", () => ({
  LocalReviewDatasetError: class LocalReviewDatasetError extends Error {
    constructor(public readonly code: string, message: string) {
      super(message);
    }
  },
  loadLocalReviewDataset: mocks.loadDataset,
}));

vi.mock("@/server/exploration/openai-web-research", () => ({
  ExplorationResearchError: class ExplorationResearchError extends Error {
    constructor(public readonly code: string, message: string) {
      super(message);
    }
  },
  requestOpenAIExplorationResearch: mocks.research,
}));

import { POST } from "./route";

const suggestion = {
  id: "suggestion-a",
  targetName: "候補A",
  actionType: "field_visit",
  question: "何がつながるか？",
  missingInformation: "比較資料",
  expectedObservation: "現地解説",
  claimIds: ["private-claim"],
  anchorSpotIds: ["private-spot"],
};

function request(body: unknown, origin?: string) {
  return new Request("http://localhost/api/exploration-research", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(origin ? { Origin: origin } : {}),
    },
    body: JSON.stringify(body),
  });
}

const validRequest = {
  datasetId: "dataset-a",
  suggestionId: "suggestion-a",
  consent: "send_minimized_research_brief_to_openai",
};

describe("POST /api/exploration-research", () => {
  beforeEach(() => {
    mocks.loadDataset.mockReset();
    mocks.research.mockReset();
    mocks.loadDataset.mockResolvedValue({
      datasetId: "dataset-a",
      atlas: { suggestions: [suggestion] },
    });
    mocks.research.mockResolvedValue({
      responseId: "resp_a",
      model: "gpt-5.4-nano",
      summary: "調査結果",
      candidates: [],
      usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 },
    });
  });

  it("requires the exact external-provider consent value", async () => {
    const response = await POST(request({ ...validRequest, consent: true }));
    expect(response.status).toBe(400);
    expect(mocks.loadDataset).not.toHaveBeenCalled();
    expect(mocks.research).not.toHaveBeenCalled();
  });

  it("rejects cross-origin requests before loading private data", async () => {
    const response = await POST(request(validRequest, "https://example.com"));
    expect(response.status).toBe(403);
    expect(mocks.loadDataset).not.toHaveBeenCalled();
  });

  it("resolves the suggestion locally and sends no Claims or visit IDs", async () => {
    const response = await POST(request(validRequest));
    expect(response.status).toBe(200);
    expect(mocks.research).toHaveBeenCalledWith(
      expect.objectContaining({
        brief: {
          targetName: "候補A",
          actionType: "field_visit",
          question: "何がつながるか？",
          missingInformation: "比較資料",
          expectedObservation: "現地解説",
        },
      }),
    );
    const serializedCall = JSON.stringify(mocks.research.mock.calls[0][0]);
    expect(serializedCall).not.toContain("private-claim");
    expect(serializedCall).not.toContain("private-spot");
  });
});
