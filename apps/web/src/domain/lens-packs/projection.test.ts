import { describe, expect, it } from "vitest";

import { projectLensPreset } from "./projection";
import {
  japaneseMythologyPack,
  religionRelationsPack,
  wajindenRoutesPack,
} from "./seed-packs";

describe("projectLensPreset", () => {
  it("expands the Munakata lens from semantic pack data", () => {
    const projection = projectLensPreset(
      japaneseMythologyPack,
      "munakata-connections",
    );

    expect(projection.nodes.map((node) => node.id)).toEqual(
      expect.arrayContaining([
        "amaterasu",
        "susanoo",
        "ukei",
        "munakata-triad",
        "munakata-taisha",
        "kojiki-text",
        "nihon-shoki-text",
      ]),
    );
    expect(projection.edges.some((edge) => edge.id === "myth-007")).toBe(true);
  });

  it("keeps both Yamatai location hypotheses in one route projection", () => {
    const projection = projectLensPreset(
      wajindenRoutesPack,
      "wajinden-comparison",
    );
    const locations = projection.edges.filter(
      (edge) => edge.hypothesisGroupId === "yamatai-location",
    );

    expect(locations).toHaveLength(2);
    expect(locations.map((edge) => edge.objectId)).toEqual(
      expect.arrayContaining(["northern-kyushu", "nara-basin"]),
    );
    expect(projection.nodes.map((node) => node.id)).toEqual(
      expect.arrayContaining(["toma-state", "ito-history-museum", "mikumo-minamishoji-site", "sugu-okamoto-site", "koshoji-kofun"]),
    );
    expect(projection.nodes.some((node) => node.id === "himiko")).toBe(false);
  });

  it("projects Wajinden politics without mixing in location hypotheses", () => {
    const projection = projectLensPreset(wajindenRoutesPack, "wajinden-politics");

    expect(projection.nodes.map((node) => node.id)).toEqual(
      expect.arrayContaining(["himiko", "yamatai-state", "wei", "ito-state", "ittaisotsu", "kunu-state"]),
    );
    expect(projection.edges.map((edge) => edge.id)).toEqual(
      expect.arrayContaining(["politics-001", "politics-005", "politics-006", "politics-008"]),
    );
    expect(projection.edges.some((edge) => edge.hypothesisGroupId === "yamatai-location")).toBe(false);
    expect(projection.nodes.some((node) => node.id === "northern-kyushu" || node.id === "nara-basin")).toBe(false);
  });

  it("keeps religion history, syncretism, and concepts as separate projections", () => {
    const history = projectLensPreset(religionRelationsPack, "religion-history");
    const syncretism = projectLensPreset(religionRelationsPack, "religion-syncretism");
    const concepts = projectLensPreset(religionRelationsPack, "religion-concepts");

    expect(history.edges.every((edge) => edge.relationFamily !== "syncretism")).toBe(true);
    expect(syncretism.edges.every((edge) => ["syncretism", "enshrinement", "association"].includes(edge.relationFamily))).toBe(true);
    expect(concepts.edges.every((edge) => edge.relationFamily !== "historical-context")).toBe(true);
    expect(syncretism.nodes.map((node) => node.id)).toEqual(
      expect.arrayContaining(["shinto", "buddhism", "shinbutsu-shugo", "shugendo"]),
    );
  });

  it("compares regional sacred spaces including Setouchi and Kyushu without asserting a direct historical chain", () => {
    const comparison = projectLensPreset(
      religionRelationsPack,
      "regional-sacred-comparison",
    );

    expect(comparison.nodes.map((node) => node.id)).toEqual(
      expect.arrayContaining([
        "regional-sacred-landscapes",
        "munakata-taisha",
        "usa-jingu",
        "kunisaki-peninsula",
        "rokugo-manzan",
        "numakuma-shrine",
        "maritime-watatsumi",
        "shirakami-shrine",
        "archaic-reef-ritual",
      ]),
    );
    expect(
      comparison.edges
        .filter((edge) => edge.subjectId === "regional-sacred-landscapes")
        .every(
          (edge) =>
            edge.relationFamily === "conceptual-comparison" &&
            edge.reviewStatus === "draft",
        ),
    ).toBe(true);
    expect(comparison.edges.some((edge) => edge.id === "religion-030")).toBe(true);
    expect(comparison.edges.some((edge) => edge.id === "religion-037")).toBe(true);
    expect(comparison.edges.some((edge) => edge.id === "religion-038")).toBe(true);
    expect(comparison.edges.some((edge) => edge.id === "religion-039")).toBe(true);
    expect(comparison.edges.some((edge) => edge.id === "religion-040")).toBe(true);
  });
});
