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
        "totsuka-no-tsurugi",
        "yasakani-no-magatama",
        "munakata-triad",
        "five-male-deities",
        "oshihomimi",
        "munakata-taisha",
        "kojiki-text",
        "nihon-shoki-text",
      ]),
    );
    expect(projection.edges.some((edge) => edge.id === "myth-007")).toBe(true);
    expect(projection.edges.some((edge) => edge.id === "myth-ukei-007")).toBe(true);
    expect(projection.edges.some((edge) => edge.id === "myth-ukei-008")).toBe(true);
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

  it("projects archaic local shrines and their archaeological and ritual ties", () => {
    const localShrines = projectLensPreset(
      religionRelationsPack,
      "archaic-local-shrines",
    );

    expect(localShrines.nodes.map((node) => node.id)).toEqual(
      expect.arrayContaining([
        "takasu-shrine",
        "sazareishi-shrine",
        "okamoto-kumano-shrine",
        "religion-sugu-okamoto-site",
        "chikushi-shrine",
        "chikushi-kayu-ritual",
      ]),
    );
    expect(localShrines.edges.some((edge) => edge.id === "religion-034")).toBe(true);
    expect(localShrines.edges.some((edge) => edge.id === "religion-035")).toBe(true);
    expect(localShrines.edges.some((edge) => edge.id === "religion-036")).toBe(true);
  });
});
