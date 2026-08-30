import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { validClaimFixture } from "@/domain/knowledge/fixtures";

import { loadLocalReviewDataset } from "./local-dataset";

async function writeValidDataset(root: string) {
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
}

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

  it("loads a dataset and local Atlas without exposing private document paths", async () => {
    const root = await mkdtemp(join(tmpdir(), "resoworld-review-"));
    await writeValidDataset(root);
    await writeFile(
      join(root, "atlas.json"),
      JSON.stringify({
        title: "匿名ルート",
        spots: [
          {
            id: "spot-a",
            name: "地点A",
            region: "地域A",
            kind: "史跡",
            latitude: 33.5,
            longitude: 131.2,
            claimIds: [validClaimFixture.id],
          },
          {
            id: "spot-b",
            name: "地点B",
            region: "地域B",
            kind: "寺社",
            latitude: 33.6,
            longitude: 131.3,
            claimIds: [validClaimFixture.id],
          },
        ],
        connections: [
          {
            id: "connection-a",
            eyebrow: "TEST CONNECTION",
            title: "地点を横断する",
            summary: "匿名の接続テーマ",
            spotIds: ["spot-a", "spot-b"],
            claimIds: [validClaimFixture.id],
            concepts: ["祭祀"],
          },
        ],
      }),
    );

    const dataset = await loadLocalReviewDataset({
      enabled: true,
      rootPath: root,
      relativePath: "dataset.json",
      atlasRelativePath: "atlas.json",
      initialStatus: "needs_review",
    });

    expect(dataset.claims).toHaveLength(1);
    expect(dataset.claims[0].reviewStatus).toBe("needs_review");
    expect(dataset.documents[0]).toEqual({
      id: validClaimFixture.evidence[0].passage.documentId,
      title: "匿名記録",
    });
    expect(dataset.documents[0]).not.toHaveProperty("path");
    expect(dataset.atlas?.spots).toHaveLength(2);
    expect(dataset.atlas?.connections[0].claimIds).toEqual([
      validClaimFixture.id,
    ]);
  });

  it("rejects an Atlas that references an unknown Claim", async () => {
    const root = await mkdtemp(join(tmpdir(), "resoworld-atlas-invalid-"));
    await writeValidDataset(root);
    await writeFile(
      join(root, "atlas.json"),
      JSON.stringify({
        title: "Invalid",
        spots: [
          {
            id: "spot-a",
            name: "地点A",
            region: "地域A",
            kind: "史跡",
            latitude: 33.5,
            longitude: 131.2,
            claimIds: ["unknown-claim"],
          },
        ],
        connections: [],
      }),
    );

    await expect(
      loadLocalReviewDataset({
        enabled: true,
        rootPath: root,
        relativePath: "dataset.json",
        atlasRelativePath: "atlas.json",
        initialStatus: null,
      }),
    ).rejects.toMatchObject({ code: "invalid_atlas" });
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
