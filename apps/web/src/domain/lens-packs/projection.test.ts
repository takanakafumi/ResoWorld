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
  });

  it("keeps religion history, syncretism, and concepts as separate projections", () => {
    const history = projectLensPreset(religionRelationsPack, "religion-history");
    const syncretism = projectLensPreset(religionRelationsPack, "religion-syncretism");
    const concepts = projectLensPreset(religionRelationsPack, "religion-concepts");

    expect(history.edges.every((edge) => edge.relationFamily !== "syncretism")).toBe(true);
    expect(syncretism.edges.every((edge) => edge.relationFamily === "syncretism")).toBe(true);
    expect(concepts.edges.every((edge) => edge.relationFamily !== "historical-context")).toBe(true);
    expect(syncretism.nodes.map((node) => node.id)).toEqual(
      expect.arrayContaining(["shinto", "buddhism", "shinbutsu-shugo", "shugendo"]),
    );
  });
});