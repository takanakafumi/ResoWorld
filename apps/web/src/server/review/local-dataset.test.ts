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
      transportPolicy: {
        storage: "hybrid",
        analysis: "server",
        contextScope: "selected-records",
        providerIds: ["test-provider"],
      },
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
            connectionKind: "documented",
            initialStatus: "confirmed",
            eyebrow: "TEST CONNECTION",
            title: "地点を横断する",
            summary: "匿名の接続テーマ",
            spotIds: ["spot-a", "spot-b"],
            claimIds: [validClaimFixture.id],
            concepts: ["祭祀"],
            facets: [
              { id: "ritual", label: "祭祀", weight: 5 },
            ],
            eras: [
              {
                id: "ancient",
                label: "古代",
                range: "4〜8世紀",
                mapLabel: "古代の祭祀圏",
                mapLayer: "maritime",
                spotIds: ["spot-a", "spot-b"],
                claimIds: [validClaimFixture.id],
              },
            ],
          },
        ],
        suggestions: [
          {
            id: "next-a",
            title: "次の確認",
            targetName: "地点C",
            actionType: "field_visit",
            latitude: 33.7,
            longitude: 131.4,
            question: "何がつながるか",
            missingInformation: "現地観察",
            reason: "Claimを検証するため",
            expectedObservation: "案内と遺構を確認する",
            uncertainty: "現地で確認できない可能性",
            claimIds: [validClaimFixture.id],
            anchorSpotIds: ["spot-a"],
            connectionIds: ["connection-a"],
            initialStatus: "suggested",
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

    expect(dataset.transportPolicy).toEqual({
      storage: "hybrid",
      analysis: "server",
      contextScope: "selected-records",
      providerIds: ["test-provider"],
    });
    expect(dataset.claims).toHaveLength(1);
    expect(dataset.claims[0].reviewStatus).toBe("needs_review");
    expect(dataset.documents[0]).toEqual({
      id: validClaimFixture.evidence[0].passage.documentId,
      title: "匿名記録",
    });
    expect(dataset.documents[0]).not.toHaveProperty("path");
    expect(dataset.atlas?.spots).toHaveLength(2);
    expect(dataset.atlas?.spots.every((spot) => spot.positionStatus === "confirmed")).toBe(true);
    expect(dataset.atlas?.suggestions).toHaveLength(1);
    expect(dataset.atlas?.connections[0].claimIds).toEqual([
      validClaimFixture.id,
    ]);
  });

  it("accepts a Suggestion that references a Knowledge Pack connection projected from visited spots", async () => {
    const root = await mkdtemp(join(tmpdir(), "resoworld-pack-connection-"));
    await writeValidDataset(root);
    await writeFile(join(root, "atlas.json"), JSON.stringify({
      title: "萩",
      spots: [
        { id: "spot-meirinkan", name: "明倫館", region: "萩", kind: "史跡", latitude: 34.4095497, longitude: 131.3991098, claimIds: [validClaimFixture.id] },
        { id: "spot-shokasonjuku", name: "松下村塾", region: "萩", kind: "史跡", latitude: 34.412172, longitude: 131.417347, claimIds: [validClaimFixture.id] },
      ],
      connections: [],
      suggestions: [{
        id: "suggestion-pack", title: "教育拠点", targetName: "萩", actionType: "literature_research",
        latitude: 34.415, longitude: 131.4, question: "教育拠点はどうつながるか？", missingInformation: "史料の比較。",
        reason: "教育史を確認するため。", expectedObservation: "展示説明の比較。", uncertainty: "史料解釈には差がある。",
        claimIds: [validClaimFixture.id], anchorSpotIds: ["spot-meirinkan"], connectionIds: ["hagi-education-geography"], initialStatus: "suggested",
      }],
    }), "utf8");

    const dataset = await loadLocalReviewDataset({ enabled: true, rootPath: root, relativePath: "dataset.json", atlasRelativePath: "atlas.json", initialStatus: null });

    expect(dataset.atlas?.suggestions[0].connectionIds).toEqual(["hagi-education-geography"]);
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
        suggestions: [],
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

  it("rejects a Journey that references an unknown Atlas record", async () => {
    const root = await mkdtemp(join(tmpdir(), "resoworld-journey-invalid-"));
    await writeValidDataset(root);
    await writeFile(
      join(root, "atlas.json"),
      JSON.stringify({
        title: "Invalid Journey",
        journeys: [{ id: "journey-a", label: "探索A", documentIds: [validClaimFixture.evidence[0].passage.documentId], spotIds: ["unknown-spot"], connectionIds: [] }],
        spots: [{ id: "spot-a", name: "地点A", region: "地域A", kind: "史跡", latitude: 33.5, longitude: 131.2, claimIds: [validClaimFixture.id] }],
        connections: [],
        suggestions: [],
      }),
    );

    await expect(loadLocalReviewDataset({
      enabled: true,
      rootPath: root,
      relativePath: "dataset.json",
      atlasRelativePath: "atlas.json",
      initialStatus: null,
    })).rejects.toMatchObject({ code: "invalid_atlas" });
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
