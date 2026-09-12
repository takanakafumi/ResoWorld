import { describe, expect, it } from "vitest";

import { validDatasetFixture } from "@/domain/knowledge/fixtures";
import type { ReviewAtlas } from "@/domain/review/types";

import { materializeManualVisitNote, type ManualVisitNoteInput } from "./manual-visit-note";

const atlas: ReviewAtlas = {
  title: "Atlas",
  journeys: [{ id: "journey-a", label: "探索A", documentIds: ["document-demo-1"], spotIds: ["spot-a"], connectionIds: [] }],
  spots: [{ id: "spot-a", name: "旧宅", region: "萩", kind: "史跡", latitude: 34, longitude: 131, claimIds: [] }],
  connections: [],
  suggestions: [],
};
const input: ManualVisitNoteInput = {
  journeyId: "journey-a",
  spotId: "spot-a",
  note: "旧宅を訪問し、建物の配置を確認した。",
  documentId: "document-manual-a",
  claimId: "claim-manual-a",
  documentSha256: "a".repeat(64),
  relativePath: ".resoworld/manual-notes/document-manual-a.txt",
  createdAt: "2026-09-12T00:00:00.000Z",
};

describe("materializeManualVisitNote", () => {
  it("adds a private document and confirmed observation to the Spot and Journey", () => {
    const result = materializeManualVisitNote({ dataset: validDatasetFixture, atlas, input });
    expect(result.status).toBe("added");
    expect(result.dataset.documents.at(-1)).toMatchObject({ id: input.documentId, privacy: "private" });
    expect(result.dataset.claims.at(-1)).toMatchObject({ id: input.claimId, claimKind: "observation", originType: "user", reviewStatus: "confirmed" });
    expect(result.atlas.spots[0].claimIds).toContain(input.claimId);
    expect(result.atlas.journeys?.[0].documentIds).toContain(input.documentId);
  });

  it("is idempotent for the same note content", () => {
    const once = materializeManualVisitNote({ dataset: validDatasetFixture, atlas, input });
    const twice = materializeManualVisitNote({ dataset: once.dataset, atlas: once.atlas, input });
    expect(twice.status).toBe("unchanged");
    expect(twice.dataset.claims).toHaveLength(once.dataset.claims.length);
  });

  it("rejects unknown targets and empty notes", () => {
    expect(() => materializeManualVisitNote({ dataset: validDatasetFixture, atlas, input: { ...input, spotId: "missing" } })).toThrow(/Unknown Spot/);
    expect(() => materializeManualVisitNote({ dataset: validDatasetFixture, atlas, input: { ...input, note: " " } })).toThrow(/empty/);
  });
});
