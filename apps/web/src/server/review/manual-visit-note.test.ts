import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { validDatasetFixture } from "@/domain/knowledge/fixtures";
import type { ReviewAtlas } from "@/domain/review/types";

import { applyLocalManualVisitNote, createLocalManualVisitCandidate } from "./manual-visit-note";

describe("applyLocalManualVisitNote", () => {
  it("backs up and updates the note, Dataset, and Atlas together", async () => {
    const root = await mkdtemp(join(tmpdir(), "resoworld-note-"));
    const atlas: ReviewAtlas = {
      title: "Atlas",
      journeys: [{ id: "journey-a", label: "探索A", documentIds: ["document-demo-1"], spotIds: ["spot-a"], connectionIds: [] }],
      spots: [{ id: "spot-a", name: "旧宅", region: "萩", kind: "史跡", latitude: 34, longitude: 131, claimIds: [] }],
      connections: [], suggestions: [],
    };
    await writeFile(join(root, "dataset.json"), JSON.stringify(validDatasetFixture), "utf8");
    await writeFile(join(root, "atlas.json"), JSON.stringify(atlas), "utf8");
    const config = { enabled: true, rootPath: root, relativePath: "dataset.json", atlasRelativePath: "atlas.json", initialStatus: null };

    const result = await applyLocalManualVisitNote({ journeyId: "journey-a", spotId: "spot-a", note: "旧宅を訪問した。", config });
    const savedDataset = JSON.parse(await readFile(join(root, "dataset.json"), "utf8"));
    const savedAtlas = JSON.parse(await readFile(join(root, "atlas.json"), "utf8"));
    expect(result.status).toBe("added");
    expect(result.backupFiles).toHaveLength(2);
    expect(savedDataset.claims.at(-1).id).toBe(result.claimId);
    expect(savedAtlas.spots[0].claimIds).toContain(result.claimId);
    expect(await readFile(join(root, savedDataset.documents.at(-1).path), "utf8")).toBe("旧宅を訪問した。\n");
  });
});

describe("createLocalManualVisitCandidate", () => {
  it("stores evidence and emits a candidate without changing the Atlas", async () => {
    const root = await mkdtemp(join(tmpdir(), "resoworld-new-place-"));
    const atlas: ReviewAtlas = {
      title: "Atlas",
      journeys: [{ id: "journey-a", label: "探索A", documentIds: ["document-demo-1"], spotIds: ["spot-a"], connectionIds: [] }],
      spots: [{ id: "spot-a", name: "既存地点", region: "萩", kind: "史跡", latitude: 34, longitude: 131, claimIds: ["claim-demo-1"] }],
      connections: [], suggestions: [],
    };
    await writeFile(join(root, "dataset.json"), JSON.stringify(validDatasetFixture), "utf8");
    await writeFile(join(root, "atlas.json"), JSON.stringify(atlas), "utf8");
    const config = { enabled: true, rootPath: root, relativePath: "dataset.json", atlasRelativePath: "atlas.json", initialStatus: null };

    const result = await createLocalManualVisitCandidate({ journeyId: "journey-a", placeName: "新しい旧宅", note: "新しい旧宅を訪問した。", config });
    const savedDataset = JSON.parse(await readFile(join(root, "dataset.json"), "utf8"));
    const savedCandidate = JSON.parse(await readFile(join(root, result.candidateFile), "utf8"));
    const savedAtlas = JSON.parse(await readFile(join(root, "atlas.json"), "utf8"));
    expect(savedDataset.claims.at(-1).subject.name).toBe("新しい旧宅");
    expect(savedCandidate.placeCandidates[0].name).toBe("新しい旧宅");
    expect(savedCandidate.id).toBe("journey-a");
    expect(savedAtlas).toEqual(atlas);
  });
});
