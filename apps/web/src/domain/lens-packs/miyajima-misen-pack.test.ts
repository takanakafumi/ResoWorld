import { describe, expect, it } from "vitest";

import { projectLensPreset } from "./projection";
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
    expect(religion.edges.filter((edge) => edge.relationFamily === "enshrinement")).toHaveLength(4);
    expect(religion.edges.some((edge) => edge.predicate === "continued_from_ancient_times")).toBe(false);
    expect(religion.edges.some((edge) => edge.subjectId === "sankidaigongen" && edge.objectId === "omoto-shrine-miyajima")).toBe(false);
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
