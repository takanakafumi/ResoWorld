import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ apply: vi.fn() }));
vi.mock("@/server/review/manual-visit-note", () => ({ applyLocalManualVisitNote: mocks.apply }));

import { POST } from "./route";

describe("POST /api/manual-visit-notes", () => {
  beforeEach(() => mocks.apply.mockReset());

  it("requires explicit consent and a useful note", async () => {
    const response = await POST(new Request("http://localhost/api/manual-visit-notes", { method: "POST", body: JSON.stringify({ journeyId: "j", spotId: "s", note: "x" }) }));
    expect(response.status).toBe(400);
    expect(mocks.apply).not.toHaveBeenCalled();
  });

  it("saves a reviewed manual observation without invoking an LLM", async () => {
    mocks.apply.mockResolvedValue({ status: "added", documentId: "document-a", claimId: "claim-a", backupFiles: ["dataset.backup.json", "atlas.backup.json"] });
    const response = await POST(new Request("http://localhost/api/manual-visit-notes", { method: "POST", body: JSON.stringify({ journeyId: "journey-a", spotId: "spot-a", note: "旧宅を訪問した。", consent: "save_manual_visit_evidence" }) }));
    expect(response.status).toBe(200);
    expect(mocks.apply).toHaveBeenCalledWith(expect.objectContaining({ journeyId: "journey-a", spotId: "spot-a" }));
    await expect(response.json()).resolves.toMatchObject({ ok: true, status: "added", claimId: "claim-a" });
  });
});
