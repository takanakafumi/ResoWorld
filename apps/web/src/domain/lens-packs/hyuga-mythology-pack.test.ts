import { describe, expect, it } from "vitest";
import { hyugaMythologyPack } from "./hyuga-mythology-pack";
import { projectLensMapPreset, projectLensPreset } from "./projection";

describe("hyugaMythologyPack", () => {
  it("conforms to knowledge pack schema and contains required sources and entities", () => {
    expect(hyugaMythologyPack.id).toBe("hyuga-mythology-network");
    expect(hyugaMythologyPack.sources.length).toBeGreaterThanOrEqual(7);
    expect(hyugaMythologyPack.entities.some((e) => e.id === "ninigi-no-mikoto")).toBe(true);
    expect(hyugaMythologyPack.entities.some((e) => e.id === "hoori-no-mikoto")).toBe(true);
    expect(hyugaMythologyPack.entities.some((e) => e.id === "ugayafukiaezu-no-mikoto")).toBe(true);
  });

  it("projects hyuga-mythology-preset relationship graph with descent and lineage nodes", () => {
    const projection = projectLensPreset(hyugaMythologyPack, "hyuga-mythology-preset");
    expect(projection.nodes.map((n) => n.id)).toEqual(
      expect.arrayContaining([
        "sazareishi-shrine",
        "takasu-shrine",
        "takachiho-shrine",
        "ninigi-no-mikoto",
        "hoori-no-mikoto",
        "ugayafukiaezu-no-mikoto",
      ])
    );
    expect(projection.edges.filter((e) => e.relationFamily === "genealogy").length).toBeGreaterThanOrEqual(3);
  });

  it("projects map connections with valid exploration questions and unvisited candidates", () => {
    const mapConnections = projectLensMapPreset(hyugaMythologyPack, "hyuga-mythology-preset");
    expect(mapConnections).toHaveLength(2);

    const mountainAxis = mapConnections.find((c) => c.id === "tenson-korin-mountain-axis");
    expect(mountainAxis).toBeDefined();
    expect(mountainAxis?.places.map((p) => p.id)).toEqual(
      expect.arrayContaining(["takachiho-shrine", "amanoyasu-kawara", "kirishima-jingu", "sazareishi-shrine"])
    );
    expect(mountainAxis?.explorationQuestions?.["takachiho-shrine"]).toMatchObject({
      question: expect.stringContaining("高千穂"),
      reason: expect.stringContaining("降臨"),
    });

    const coastCorridor = mapConnections.find((c) => c.id === "hyuga-coast-umisachi-yamasachi");
    expect(coastCorridor).toBeDefined();
    expect(coastCorridor?.places.map((p) => p.id)).toEqual(
      expect.arrayContaining(["aoshima-shrine", "udo-jingu", "miyazaki-jingu", "takasu-shrine"])
    );
    expect(coastCorridor?.explorationQuestions?.["udo-jingu"]).toMatchObject({
      question: expect.stringContaining("海食洞"),
      reason: expect.stringContaining("ウガヤフキアエズ"),
    });
  });
});
