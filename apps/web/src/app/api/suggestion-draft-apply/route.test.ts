import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  loadDraft: vi.fn(), loadDataset: vi.fn(), buildContext: vi.fn(), validate: vi.fn(), applySelection: vi.fn(), saveAtlas: vi.fn(),
}));

vi.mock("@/server/exploration/local-suggestion-drafts", () => ({ loadLocalSuggestionDraft: mocks.loadDraft }));
vi.mock("@/server/review/local-dataset", () => ({ loadLocalReviewDataset: mocks.loadDataset }));
vi.mock("@/server/imports/local-journey-candidates", () => ({ applyLocalJourneyAtlas: mocks.saveAtlas }));
vi.mock("@/domain/exploration/suggestion-drafts", () => ({
  buildJourneySuggestionContext: mocks.buildContext,
  validateSuggestionDraftReferences: mocks.validate,
  applySuggestionDraftSelection: mocks.applySelection,
}));

import { POST } from "./route";

describe("POST /api/suggestion-draft-apply", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.loadDraft.mockResolvedValue({ journeyId: "journey-a", suggestions: [{ title: "draft" }] });
    mocks.loadDataset.mockResolvedValue({ atlas: { suggestions: [] } });
    mocks.buildContext.mockReturnValue({ journey: { id: "journey-a" } });
    mocks.applySelection.mockReturnValue({ atlas: { suggestions: [{ id: "suggestion-a" }] }, added: [{ id: "suggestion-a" }] });
    mocks.saveAtlas.mockResolvedValue({ atlasFile: "atlas.json", backupFile: "backup.json" });
  });

  it("reloads, validates and applies only the selected indexes", async () => {
    const response = await POST(new Request("http://localhost/api/suggestion-draft-apply", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ draftFile: "journey-a.ollama.json", selectedIndexes: [0], consent: "apply_reviewed_suggestion_drafts" }) }));

    expect(response.status).toBe(200);
    expect(mocks.loadDraft).toHaveBeenCalledWith("journey-a.ollama.json");
    expect(mocks.validate).toHaveBeenCalledOnce();
    expect(mocks.applySelection).toHaveBeenCalledWith(expect.objectContaining({ selectedIndexes: [0] }));
    expect(mocks.saveAtlas).toHaveBeenCalledWith("suggestion-journey-a.json", expect.anything());
    await expect(response.json()).resolves.toMatchObject({ ok: true, added: 1 });
  });

  it("rejects an empty selection before reading local files", async () => {
    const response = await POST(new Request("http://localhost/api/suggestion-draft-apply", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ draftFile: "journey-a.ollama.json", selectedIndexes: [], consent: "apply_reviewed_suggestion_drafts" }) }));

    expect(response.status).toBe(400);
    expect(mocks.loadDraft).not.toHaveBeenCalled();
  });
});
