import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { validClaimFixture } from "@/domain/knowledge/fixtures";

import { loadLocalReviewDataset } from "./local-dataset";

describe("loadLocalReviewDataset", () => {
  it("never reads a dataset while local review is disabled", async () => {
    await expect(
      loadLocalReviewDataset({
        enabled: false,
        rootPath: null,
        relativePath: null,
        initialStatus: null,
      }),
    ).rejects.toMatchObject({ code: "disabled" });
  });

  it("loads a schema-valid dataset and removes private paths from client data", async () => {
    const root = await mkdtemp(join(tmpdir(), "resoworld-review-"));
    const documentSha256 = validClaimFixture.evidence[0].passage.documentSha256;
    await writeFile(
      join(root, "dataset.json"),
      JSON.stringify({
        schemaVersion: "0.2.0",
        datasetId: "dataset-demo",
        privacy: "local-only",
        documents: [
          {
            id: validClaimFixture.evidence[0].passage.documentId,
            title: "匿名記録",
            path: "private/anonymous.txt",
            sha256: documentSha256,
            authorType: "user-authored",
            privacy: "private",
            observedAt: null,
            documentedAt: null,
            dateStatus: "not-present-in-source",
          },
        ],
        sources: [],
        claims: [validClaimFixture],
      }),
    );

    const dataset = await loadLocalReviewDataset({
      enabled: true,
      rootPath: root,
      relativePath: "dataset.json",
      initialStatus: "needs_review",
    });

    expect(dataset.claims).toHaveLength(1);
    expect(dataset.claims[0].reviewStatus).toBe("needs_review");
    expect(dataset.documents[0]).toEqual({
      id: validClaimFixture.evidence[0].passage.documentId,
      title: "匿名記録",
    });
    expect(dataset.documents[0]).not.toHaveProperty("path");
  });

  it("rejects paths outside the configured root", async () => {
    const parent = await mkdtemp(join(tmpdir(), "resoworld-review-boundary-"));
    const root = join(parent, "root");
    await mkdir(root);
    await writeFile(join(parent, "outside.json"), "{}", "utf8");

    await expect(
      loadLocalReviewDataset({
        enabled: true,
        rootPath: root,
        relativePath: "../outside.json",
        initialStatus: null,
      }),
    ).rejects.toMatchObject({ code: "invalid_path" });
  });
});
