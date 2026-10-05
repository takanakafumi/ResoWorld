import { describe, expect, it } from "vitest";
import { izumoKunitsukamiPack } from "./izumo-kunitsukami-pack";
import { projectLensMapPreset, projectLensPreset } from "./projection";

describe("izumoKunitsukamiPack", () => {
  it("conforms to knowledge pack schema and contains required sources and entities", () => {
    expect(izumoKunitsukamiPack.id).toBe("izumo-kunitsukami-network");
    expect(izumoKunitsukamiPack.sources.length).toBeGreaterThanOrEqual(7);
    expect(izumoKunitsukamiPack.entities.some((e) => e.id === "ookuninushi")).toBe(true);
    expect(izumoKunitsukamiPack.entities.some((e) => e.id === "kotoshironushi")).toBe(true);
    expect(izumoKunitsukamiPack.entities.some((e) => e.id === "oomononushi")).toBe(true);
  });

  it("projects izumo-kunitsukami-preset relationship graph with Kunitsukami nodes", () => {
    const projection = projectLensPreset(izumoKunitsukamiPack, "izumo-kunitsukami-preset");
    expect(projection.nodes.map((n) => n.id)).toEqual(
      expect.arrayContaining([
        "onamuchi-shrine",
        "minagi-hayashida",
        "izumo-taisha",
        "ookuninushi",
        "kotoshironushi",
        "oomononushi",
      ])
    );
    expect(projection.edges.filter((e) => e.relationFamily === "enshrinement").length).toBeGreaterThanOrEqual(4);
  });

  it("projects map connections with valid exploration questions and unvisited candidates", () => {
    const mapConnections = projectLensMapPreset(izumoKunitsukamiPack, "izumo-kunitsukami-preset");
    expect(mapConnections).toHaveLength(2);

    const izumoAxis = mapConnections.find((c) => c.id === "izumo-core-kuniyuzuri-line");
    expect(izumoAxis).toBeDefined();
    expect(izumoAxis?.places.map((p) => p.id)).toEqual(
      expect.arrayContaining(["izumo-taisha", "inasa-no-hama", "miho-shrine", "kamosu-shrine"])
    );
    expect(izumoAxis?.explorationQuestions?.["izumo-taisha"]).toMatchObject({
      question: expect.stringContaining("幽"),
      reason: expect.stringContaining("天日隅宮"),
    });

    const westernCorridor = mapConnections.find((c) => c.id === "kunitsukami-western-network");
    expect(westernCorridor).toBeDefined();
    expect(westernCorridor?.places.map((p) => p.id)).toEqual(
      expect.arrayContaining(["onamuchi-shrine", "minagi-hayashida", "itsukushima-shrine", "oomiwa-shrine", "izumo-taisha"])
    );
    expect(westernCorridor?.explorationQuestions?.["oomiwa-shrine"]).toMatchObject({
      question: expect.stringContaining("三輪山"),
      reason: expect.stringContaining("和魂"),
    });
  });
});
