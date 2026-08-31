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

vi.mock("@/server/exploration/codex-cli", () => ({
  CodexResearchError: class CodexResearchError extends Error {
    constructor(public readonly code: string, message: string) {
      super(message);
    }
  },
  requestCodexExplorationResearch: mocks.research,
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
  return new Request("http://localhost/api/codex-research", {
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
  consent: "run_codex_cli_research",
};

describe("POST /api/codex-research", () => {
  beforeEach(() => {
    mocks.loadDataset.mockReset();
    mocks.research.mockReset();
    mocks.loadDataset.mockResolvedValue({
      datasetId: "dataset-a",
      atlas: { suggestions: [suggestion] },
    });
    mocks.research.mockResolvedValue({
      summary: "調査結果",
      candidates: [],
      humanReview: ["出典を確認する"],
    });
  });

  it("requires the exact Codex CLI consent value", async () => {
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

  it("builds the prompt locally without Claims or visit IDs", async () => {
    const response = await POST(request(validRequest));
    expect(response.status).toBe(200);
    expect(mocks.research).toHaveBeenCalledOnce();
    const call = mocks.research.mock.calls[0][0];
    expect(call.prompt).toContain("何がつながるか？");
    expect(call.prompt).toContain("suggestion-a");
    expect(JSON.stringify(call)).not.toContain("private-claim");
    expect(JSON.stringify(call)).not.toContain("private-spot");
  });
});
