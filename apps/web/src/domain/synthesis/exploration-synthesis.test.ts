import { describe, expect, it } from "vitest";

import { buildExplorationSynthesisDigest } from "./exploration-synthesis";

describe("buildExplorationSynthesisDigest", () => {
  it("combines spots, claims, evidence natures, eras, and connections", () => {
    const digest = buildExplorationSynthesisDigest({
      datasetId: "dataset-a",
      privacy: "local-only",
      documents: [],
      claims: [{
        id: "claim-a",
        statement: "海上交通との接続を考えた。",
        claimKind: "question",
        reviewStatus: "suggested",
        historicalTime: { kind: "calendar", startYear: 200, endYear: 300 },
        evidence: [{ sourceNature: "Observation" }],
      }],
      atlas: {
        title: "Atlas",
        spots: [{
          id: "spot-a", name: "訪問地A", region: "九州", kind: "史跡",
          latitude: 0, longitude: 0, claimIds: ["claim-a"],
        }],
        connections: [{
          id: "connection-a", eyebrow: "THREAD", title: "海の道",
          summary: "訪問地を海上交通から見直す。", spotIds: ["spot-a"],
          claimIds: ["claim-a"], concepts: ["海上交通"],
          facets: [{ id: "route", label: "移動", weight: 5 }],
          eras: [{ id: "era-a", label: "古代", range: "3世紀", mapLabel: "古代",
            mapLayer: "maritime", spotIds: ["spot-a"], claimIds: ["claim-a"] }],
        }],
        suggestions: [],
      },
    } as never);

    expect(digest.spots[0].name).toBe("訪問地A");
    expect(digest.claims[0].spotNames).toEqual(["訪問地A"]);
    expect(digest.claims[0].historicalTime).toBe("200–300年");
    expect(digest.connections[0].concepts).toContain("海上交通");
  });
});
