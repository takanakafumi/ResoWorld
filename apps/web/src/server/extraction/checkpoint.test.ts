import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import type { CompletedExtractionBatch } from "./provider";
import {
  loadExtractionCheckpoint,
  saveExtractionCheckpoint,
} from "./checkpoint";

let root = "";
const previousEnabled = process.env.RESOWORLD_LOCAL_IMPORT_ENABLED;
const previousRoot = process.env.RESOWORLD_IMPORT_DIR;

beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), "resoworld-checkpoint-test-"));
  process.env.RESOWORLD_LOCAL_IMPORT_ENABLED = "true";
  process.env.RESOWORLD_IMPORT_DIR = root;
});

afterEach(async () => {
  process.env.RESOWORLD_LOCAL_IMPORT_ENABLED = previousEnabled;
  process.env.RESOWORLD_IMPORT_DIR = previousRoot;
  await rm(root, { recursive: true, force: true });
});

describe("extraction checkpoints", () => {
  it("persists completed batches outside the repository and reloads matching work", async () => {
    const batch: CompletedExtractionBatch = {
      id: "batch-a",
      passageIds: ["passage-1"],
      result: {
        provider: "codex",
        responseId: null,
        model: "gpt-5.6-sol",
        attempts: 1,
        durationMs: 100,
        output: { claims: [] },
        usage: { inputTokens: null, outputTokens: null, totalTokens: null },
      },
    };
    const batches = new Map([[batch.id, batch]]);

    await saveExtractionCheckpoint({
      documentSha256: "a".repeat(64),
      provider: "codex",
      model: "gpt-5.6-sol",
      batches,
    });

    const loaded = await loadExtractionCheckpoint({
      documentSha256: "a".repeat(64),
      provider: "codex",
      model: "gpt-5.6-sol",
    });
    const otherModel = await loadExtractionCheckpoint({
      documentSha256: "a".repeat(64),
      provider: "codex",
      model: "another-model",
    });

    expect(loaded.get("batch-a")).toEqual(batch);
    expect(otherModel.size).toBe(0);
  });
});
