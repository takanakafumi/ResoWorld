import { describe, expect, it } from "vitest";

import { projectLensMapPreset, projectLensPreset } from "./projection";
import { miyajimaMisenSacredLandscapePack } from "./miyajima-misen-pack";

describe("miyajimaMisenSacredLandscapePack", () => {
  it("separates present enshrinement from unverified ancient continuity", () => {
    const religion = projectLensPreset(miyajimaMisenSacredLandscapePack, "miyajima-sacred-relations");

    expect(religion.nodes.map((node) => node.id)).toEqual(expect.arrayContaining([
      "miyajima-island",
      "mt-misen",
      "itsukushima-shrine",
      "daishoin-miyajima",
      "ichikishimahime",
      "sankidaigongen",
    ]));
    expect(religion.edges.filter((edge) => edge.relationFamily === "enshrinement")).toHaveLength(11);
    expect(religion.edges.some((edge) => edge.predicate === "continued_from_ancient_times")).toBe(false);
    expect(religion.edges.some((edge) => edge.subjectId === "sankidaigongen" && edge.objectId === "omoto-shrine-miyajima")).toBe(false);
  });

  it("projects reviewed island shrines as current points without implying an ancient route", () => {
    const religion = projectLensPreset(miyajimaMisenSacredLandscapePack, "miyajima-sacred-relations");
    const mapConnections = projectLensMapPreset(miyajimaMisenSacredLandscapePack, "miyajima-sacred-relations");

    expect(religion.nodes.map((node) => node.id)).toEqual(expect.arrayContaining([
      "miyama-shrine-miyajima",
      "takimiya-shrine-miyajima",
      "awashima-shrine-miyajima",
      "sano-shrine-miyajima",
    ]));
    expect(religion.edges.filter((edge) => edge.predicate === "auxiliary_shrine_of")).toHaveLength(4);
    expect(mapConnections).toContainEqual(expect.objectContaining({
      id: "miyajima-auxiliary-shrines",
      displayMode: "points",
      assertions: expect.arrayContaining([
        expect.objectContaining({ id: "miyajima-013" }),
        expect.objectContaining({ id: "miyajima-014" }),
        expect.objectContaining({ id: "miyajima-015" }),
        expect.objectContaining({ id: "miyajima-016" }),
      ]),
    }));
  });

  it("keeps current access paths distinct from experienced and historical paths", () => {
    const route = projectLensPreset(miyajimaMisenSacredLandscapePack, "miyajima-current-paths");
    const routeEdges = route.edges.filter((edge) => edge.relationFamily === "route");

    expect(routeEdges.map((edge) => [edge.subjectId, edge.objectId])).toEqual(expect.arrayContaining([
      ["omoto-shrine-miyajima", "mt-misen"],
      ["daishoin-miyajima", "mt-misen"],
    ]));
    expect(routeEdges.every((edge) => edge.predicate === "current_route_to")).toBe(true);
    expect(routeEdges.every((edge) => edge.sourceIds.includes("hatsukaichi-misen-map"))).toBe(true);

    const mapConnections = projectLensMapPreset(miyajimaMisenSacredLandscapePack, "miyajima-current-paths");
    expect(mapConnections.map((c) => c.id)).toEqual(["omoto-misen-route", "daishoin-misen-route"]);
    expect(mapConnections.every((c) => c.places.every((p) => p.coordinates !== undefined))).toBe(true);
  });

  it("projects shrine history separately from current enshrinement", () => {
    const history = projectLensPreset(miyajimaMisenSacredLandscapePack, "miyajima-shrine-history");

    expect(history.edges).toHaveLength(7);
    expect(history.edges.every((edge) => edge.relationFamily === "historical-context")).toBe(true);
    expect(history.edges.map((edge) => edge.id)).toEqual(expect.arrayContaining([
      "miyajima-024",
      "miyajima-025",
      "miyajima-026",
      "miyajima-027",
      "miyajima-028",
      "miyajima-029",
      "miyajima-030",
    ]));
    expect(history.nodes.map((node) => node.id)).toEqual(expect.arrayContaining([
      "takakura-visit-takimiya-1180",
      "awashima-relocation-after-meiji",
      "hie-sanno-enshrinement-miyajima",
    ]));
    expect(history.edges.some((edge) => edge.relationFamily === "enshrinement")).toBe(false);
  });

  it("contains only external references and no copied exploration observations", () => {
    expect(miyajimaMisenSacredLandscapePack.sources.every((source) => source.kind !== "user-input")).toBe(true);
    expect(miyajimaMisenSacredLandscapePack.assertions.every((assertion) => assertion.nature !== "user-model")).toBe(true);
  });

  it("projects political patronage without treating it as ancient ritual continuity", () => {
    const politics = projectLensPreset(miyajimaMisenSacredLandscapePack, "miyajima-patronage-and-space");

    expect(politics.nodes.map((node) => node.id)).toEqual(expect.arrayContaining([
      "miyajima-island",
      "itsukushima-shrine",
      "taira-no-kiyomori",
      "twelfth-century-shrine-composition",
    ]));
    expect(politics.edges).toContainEqual(expect.objectContaining({
      id: "miyajima-011",
      relationFamily: "historical-context",
      reviewStatus: "reviewed",
    }));
    expect(politics.nodes.some((node) => node.kind === "deity")).toBe(false);
  });
});
