import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ apply: vi.fn(), create: vi.fn() }));
vi.mock("@/server/review/manual-visit-note", () => ({ applyLocalManualVisitNote: mocks.apply, createLocalManualVisitCandidate: mocks.create }));

import { POST } from "./route";

describe("POST /api/manual-visit-notes", () => {
  beforeEach(() => { mocks.apply.mockReset(); mocks.create.mockReset(); });

  it("requires explicit consent and a useful note", async () => {
    const response = await POST(new Request("http://localhost/api/manual-visit-notes", { method: "POST", body: JSON.stringify({ mode: "existing", journeyId: "j", spotId: "s", note: "x" }) }));
    expect(response.status).toBe(400);
    expect(mocks.apply).not.toHaveBeenCalled();
  });

  it("saves a reviewed manual observation without invoking an LLM", async () => {
    mocks.apply.mockResolvedValue({ status: "added", documentId: "document-a", claimId: "claim-a", backupFiles: ["dataset.backup.json", "atlas.backup.json"] });
    const response = await POST(new Request("http://localhost/api/manual-visit-notes", { method: "POST", body: JSON.stringify({ mode: "existing", journeyId: "journey-a", spotId: "spot-a", note: "旧宅を訪問した。", consent: "save_manual_visit_evidence" }) }));
    expect(response.status).toBe(200);
    expect(mocks.apply).toHaveBeenCalledWith(expect.objectContaining({ journeyId: "journey-a", spotId: "spot-a" }));
    await expect(response.json()).resolves.toMatchObject({ ok: true, status: "added", claimId: "claim-a" });
  });

  it("creates a position-review candidate for a new place", async () => {
    mocks.create.mockResolvedValue({ status: "added", documentId: "document-b", claimId: "claim-b", candidateFile: "manual-b.journey-candidate.json" });
    const response = await POST(new Request("http://localhost/api/manual-visit-notes", { method: "POST", body: JSON.stringify({ mode: "new", journeyId: "journey-a", placeName: "新しい旧宅", note: "新しい旧宅を訪問した。", consent: "save_manual_visit_evidence" }) }));
    expect(response.status).toBe(200);
    expect(mocks.create).toHaveBeenCalledWith(expect.objectContaining({ journeyId: "journey-a", placeName: "新しい旧宅" }));
    await expect(response.json()).resolves.toMatchObject({ ok: true, candidateFile: "manual-b.journey-candidate.json" });
  });
});
