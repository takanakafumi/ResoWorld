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
    expect(mapConnections).toHaveLength(8);

    const lineagesAxis = mapConnections.find((c) => c.id === "marine-three-lineages-axis");
    expect(lineagesAxis).toBeDefined();
    expect(lineagesAxis?.displayMode).toBe("focus-only");
    expect(lineagesAxis?.places.map((p) => p.id)).toEqual(
      expect.arrayContaining([
        "munakata-hetsumiya",
        "shikaumi-shrine",
        "sumiyoshi-shrine-chikuzen",
        "miyajidake-shrine",
        "mekari-shrine",
      ])
    );
    expect(lineagesAxis?.explorationQuestions?.["shikaumi-shrine"]).toMatchObject({
      question: expect.stringContaining("志賀島"),
      reason: expect.stringContaining("阿曇氏"),
    });
    expect(lineagesAxis?.explorationQuestions?.["mekari-shrine"]).toMatchObject({
      question: expect.stringContaining("早鞆の瀬戸"),
      reason: expect.stringContaining("和布刈神事"),
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

    const marineTriad = mapConnections.find((c) => c.id === "conn-marine-three-sanctuaries-triad");
    expect(marineTriad).toBeDefined();
    expect(marineTriad?.displayMode).toBe("focus-only");
    expect(marineTriad?.places.map((p) => p.id)).toEqual(
      expect.arrayContaining([
        "shikaumi-shrine",
        "sumiyoshi-shrine-chikuzen",
        "sumiyoshi-taisha-osaka",
        "munakata-hetsumiya",
      ])
    );

    const inlandNetwork = mapConnections.find((c) => c.id === "conn-azumi-inland-waterway-network");
    expect(inlandNetwork).toBeDefined();
    expect(inlandNetwork?.displayMode).toBe("line");
    expect(inlandNetwork?.places.map((p) => p.id)).toEqual(
      expect.arrayContaining(["shikaumi-shrine", "mekari-shrine", "hotaka-shrine-azumino"])
    );

    const notsuRealm = mapConnections.find((c) => c.id === "conn-notsu-governance-realm");
    expect(notsuRealm).toBeDefined();
    expect(notsuRealm?.displayMode).toBe("hull");
    expect(notsuRealm?.places.map((p) => p.id)).toEqual(
      expect.arrayContaining(["shikaumi-shrine", "notsu-miyake-site", "sumiyoshi-shrine-chikuzen"])
    );

    const hakataTriad = mapConnections.find((c) => c.id === "conn-hakata-bay-maritime-triad");
    expect(hakataTriad).toBeDefined();
    expect(hakataTriad?.displayMode).toBe("line");
    expect(hakataTriad?.places.map((p) => p.id)).toEqual(
      expect.arrayContaining([
        "shikaumi-shrine",
        "sumiyoshi-shrine-chikuzen",
        "kashii-gu",
        "mishima-shrine",
        "hamao-shrine",
      ])
    );

    const kanmonStrait = mapConnections.find((c) => c.id === "conn-kanmon-hayatomo-strait");
    expect(kanmonStrait).toBeDefined();
    expect(kanmonStrait?.displayMode).toBe("line");
    expect(kanmonStrait?.places.map((p) => p.id)).toEqual(
      expect.arrayContaining([
        "togami-shrine",
        "koso-hachimangu",
        "mekari-shrine",
        "sumiyoshi-shrine-nagato",
        "iminomiya-shrine",
        "manju-kanju-islands",
      ])
    );
    expect(kanmonStrait?.explorationQuestions?.["manju-kanju-islands"]).toMatchObject({
      question: expect.stringContaining("潮盈珠・潮乾珠"),
      reason: expect.stringContaining("阿曇磯良"),
    });
  });
});
