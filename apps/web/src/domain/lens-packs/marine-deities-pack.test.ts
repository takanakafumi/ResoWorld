import { describe, expect, it } from "vitest";
import { marineDeitiesPack } from "./marine-deities-pack";
import { projectLensMapPreset, projectLensPreset } from "./projection";

describe("marineDeitiesPack", () => {
  it("conforms to knowledge pack schema and contains required sources and entities", () => {
    expect(marineDeitiesPack.id).toBe("marine-deities-network");
    expect(marineDeitiesPack.sources.length).toBeGreaterThanOrEqual(6);
    expect(marineDeitiesPack.entities.some((e) => e.id === "watatsumi-three-kami")).toBe(true);
    expect(marineDeitiesPack.entities.some((e) => e.id === "sumiyoshi-three-kami")).toBe(true);
    expect(marineDeitiesPack.entities.some((e) => e.id === "munakata-triad")).toBe(true);
  });

  it("projects marine-deities-preset relationship graph with deities and shrine nodes", () => {
    const projection = projectLensPreset(marineDeitiesPack, "marine-deities-preset");
    expect(projection.nodes.map((n) => n.id)).toEqual(
      expect.arrayContaining([
        "munakata-hetsumiya",
        "shikaumi-shrine",
        "sumiyoshi-shrine-chikuzen",
        "watatsumi-three-kami",
        "sumiyoshi-three-kami",
        "munakata-triad",
      ])
    );
    expect(projection.edges.filter((e) => e.relationFamily === "enshrinement").length).toBeGreaterThanOrEqual(4);
  });

  it("projects map connections with valid exploration questions and unvisited candidates", () => {
    const mapConnections = projectLensMapPreset(marineDeitiesPack, "marine-deities-preset");
    expect(mapConnections).toHaveLength(3);

    const lineagesAxis = mapConnections.find((c) => c.id === "marine-three-lineages-axis");
    expect(lineagesAxis).toBeDefined();
    expect(lineagesAxis?.places.map((p) => p.id)).toEqual(
      expect.arrayContaining(["munakata-hetsumiya", "shikaumi-shrine", "sumiyoshi-shrine-chikuzen", "miyajidake-shrine"])
    );
    expect(lineagesAxis?.explorationQuestions?.["shikaumi-shrine"]).toMatchObject({
      question: expect.stringContaining("志賀島"),
      reason: expect.stringContaining("阿曇氏"),
    });

    const palacesLine = mapConnections.find((c) => c.id === "munakata-three-palaces-line");
    expect(palacesLine).toBeDefined();
    expect(palacesLine?.places.map((p) => p.id)).toEqual(
      expect.arrayContaining(["munakata-hetsumiya", "munakata-nakatsumiya", "munakata-okitsumiya", "sakurainoura-futamigaura"])
    );
    expect(palacesLine?.explorationQuestions?.["munakata-okitsumiya"]).toMatchObject({
      question: expect.stringContaining("海の正倉院"),
      reason: expect.stringContaining("古代祭祀遺物"),
    });

    const setouchiLine = mapConnections.find((c) => c.id === "setouchi-maritime-rites-line");
    expect(setouchiLine).toBeDefined();
    expect(setouchiLine?.places.map((p) => p.id)).toEqual(
      expect.arrayContaining(["numakuma-shrine", "shirakami-shrine"])
    );
    expect(setouchiLine?.explorationQuestions?.["numakuma-shrine"]).toMatchObject({
      question: expect.stringContaining("潮待ち"),
      reason: expect.stringContaining("海神"),
    });
  });
});
