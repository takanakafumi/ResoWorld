import { describe, expect, it } from "vitest";

import { ishinFiguresPack } from "@/domain/lens-packs/ishin-figures-pack";
import { projectLensMapPreset } from "@/domain/lens-packs/projection";
import { wajindenRoutesPack } from "@/domain/lens-packs/seed-packs";
import type { ReviewAtlasConnection, ReviewAtlasSpot, ReviewExplorationSuggestion } from "@/domain/review/types";

import {
  projectKnowledgeMapConnections,
  projectReviewMapConnections,
  projectSuggestionMapConnection,
} from "./connections";

const spots: ReviewAtlasSpot[] = [
  { id: "a", name: "地点A", region: "地域", kind: "史跡", latitude: 1, longitude: 1, claimIds: ["claim-a"] },
  { id: "b", name: "地点B", region: "地域", kind: "史跡", latitude: 2, longitude: 2, claimIds: ["claim-b"] },
  { id: "c", name: "地点C", region: "地域", kind: "史跡", latitude: 3, longitude: 3, claimIds: ["claim-c"] },
];

function reviewConnection(id: string, spotIds: string[], eraSpotIds: string[]): ReviewAtlasConnection {
  return {
    id,
    connectionKind: "documented",
    eyebrow: "THREAD",
    title: `接続 ${id}`,
    summary: "根拠付きの旅行記接続",
    spotIds,
    claimIds: ["claim-a", "claim-b"],
    concepts: ["概念"],
    facets: [{ id: "history", label: "歴史", weight: 4 }],
    eras: [{ id: `${id}-era`, label: "選択時代", range: "時代", mapLabel: "時代地図", mapLayer: "modern", spotIds: eraSpotIds, claimIds: ["claim-a"] }],
  };
}

describe("map connection projections", () => {
  it("keeps every review connection visible and applies the era only to the selected line", () => {
    const projections = projectReviewMapConnections({
      connections: [reviewConnection("one", ["a", "b", "c"], ["a", "b"]), reviewConnection("two", ["b", "c"], ["b", "c"])],
      spots,
      selectedConnectionId: "one",
      selectedEraId: "one-era",
    });

    expect(projections).toHaveLength(2);
    expect(projections.find((connection) => connection.sourceId === "one")).toMatchObject({ id: "exploration:one", selected: true, layerLabel: "選択時代", claimIds: ["claim-a"] });
    expect(projections.find((connection) => connection.sourceId === "one")?.points.map((point) => point.id)).toEqual(["a", "b"]);
    expect(projections.find((connection) => connection.sourceId === "two")?.points.map((point) => point.id)).toEqual(["b", "c"]);
  });

  it("preserves Knowledge Pack provenance in the same map contract", () => {
    const knowledge = projectLensMapPreset(ishinFiguresPack, "ishin-network");
    const [connection] = projectKnowledgeMapConnections(knowledge, { selectedConnectionId: knowledge[0]?.id });

    expect(connection).toMatchObject({
      sourceId: knowledge[0]?.id,
      origin: "knowledge-pack",
      assertionIds: ["ishin-015", "ishin-016"],
      sourceIds: ["hagi-takasugi-birthplace", "shimonoseki-takasugi-grave"],
      confidences: ["high"],
      reviewStatus: "reviewed",
    });
  });

  it("selects a route connection by its focused Lens entity", () => {
    const routes = projectLensMapPreset(wajindenRoutesPack, "wajinden-comparison");
    const projected = projectKnowledgeMapConnections(routes, { selectedEntityId: "northern-kyushu" });

    expect(projected.find((connection) => connection.sourceId === "wajinden-kyushu-hypothesis")).toMatchObject({
      selected: true,
      appearance: { color: "#75d4ba", dashArray: [8, 8], legendLabel: "九州説" },
    });
    expect(projected.find((connection) => connection.sourceId === "wajinden-source-route")?.selected).toBe(false);
  });

  it("projects a suggestion through the same map contract", () => {
    const suggestion = {
      id: "next-a",
      title: "次の候補",
      targetName: "候補地",
      actionType: "field_visit",
      latitude: 4,
      longitude: 4,
      question: "問い",
      missingInformation: "不足",
      reason: "訪問記録から続くため",
      expectedObservation: "観察",
      uncertainty: "未確認",
      claimIds: ["claim-a"],
      anchorSpotIds: ["a"],
      connectionIds: ["one"],
      initialStatus: "suggested",
    } satisfies ReviewExplorationSuggestion;

    expect(projectSuggestionMapConnection(suggestion, spots)).toMatchObject({ id: "suggestion:next-a", sourceId: "next-a", origin: "suggestion", selected: true, claimIds: ["claim-a"] });
  });
});
