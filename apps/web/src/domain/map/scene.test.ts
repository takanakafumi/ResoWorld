import { describe, expect, it } from "vitest";

import { ishinFiguresPack } from "@/domain/lens-packs/ishin-figures-pack";
import { projectLensMapPreset } from "@/domain/lens-packs/projection";
import { wajindenRoutesPack } from "@/domain/lens-packs/seed-packs";
import type { ReviewAtlasConnection, ReviewAtlasSpot, ReviewExplorationSuggestion } from "@/domain/review/types";

import { projectMapScene } from "./scene";

const spots: ReviewAtlasSpot[] = [
  { id: "a", name: "地点A", region: "地域", kind: "史跡", latitude: 1, longitude: 1, claimIds: ["claim-a"] },
  { id: "b", name: "地点B", region: "地域", kind: "史跡", latitude: 2, longitude: 2, claimIds: ["claim-b"] },
];

const reviewConnection: ReviewAtlasConnection = {
  id: "review-a",
  connectionKind: "interpretive",
  initialStatus: "suggested",
  eyebrow: "THREAD",
  title: "旅行記の接続",
  summary: "旅行記から得た接続",
  spotIds: ["a", "b"],
  claimIds: ["claim-a"],
  concepts: [],
  facets: [],
  eras: [],
};

const suggestion: ReviewExplorationSuggestion = {
  id: "next-a",
  title: "次の候補",
  targetName: "候補地",
  actionType: "field_visit",
  latitude: 3,
  longitude: 3,
  question: "問い",
  missingInformation: "不足",
  reason: "探索を続けるため",
  expectedObservation: "観察",
  uncertainty: "未確認",
  claimIds: ["claim-a"],
  anchorSpotIds: ["a"],
  connectionIds: ["review-a"],
  initialStatus: "suggested",
};

describe("map scene projection", () => {
  it("composes review, knowledge, suggestion, and a focused viewport without renderer branching", () => {
    const knowledge = projectLensMapPreset(ishinFiguresPack, "ishin-network");
    const scene = projectMapScene({
      reviewConnections: [reviewConnection],
      knowledgeConnections: knowledge,
      selectedSuggestion: suggestion,
      spots,
      selection: { spotId: "a", focus: { kind: "suggestion", id: suggestion.id } },
      viewportKnowledgeConnectionIds: ["takasugi-life-geography"],
    });

    expect(scene.connections.map((connection) => connection.origin)).toEqual([
      "exploration",
      "knowledge-pack",
      "suggestion",
    ]);
    expect(new Set(scene.connections.map((connection) => connection.id)).size).toBe(3);
    expect(scene.viewportPoints).toHaveLength(2);
    expect(scene.diagnostics).toEqual([]);
  });

  it("derives the focused route point from the selected Lens entity", () => {
    const routes = projectLensMapPreset(wajindenRoutesPack, "wajinden-comparison");
    const scene = projectMapScene({
      reviewConnections: [],
      knowledgeConnections: routes,
      spots: [],
      selection: { spotId: "", focus: { kind: "route-node", id: "nara-basin" } },
      viewportKnowledgeConnectionIds: routes.map((connection) => connection.id),
    });

    expect(scene.connections.find((connection) => connection.sourceId === "wajinden-kinai-hypothesis")?.selected).toBe(true);
    expect(scene.focusPoint).toMatchObject({ id: "nara-basin", focusEntityId: "nara-basin" });
    expect(scene.viewportPoints.map((point) => point.id)).toEqual(["umi", "nara-basin"]);
  });

  it("keeps an archaeological selection on its local Knowledge connection", () => {
    const routes = projectLensMapPreset(wajindenRoutesPack, "wajinden-comparison");
    const scene = projectMapScene({
      reviewConnections: [],
      knowledgeConnections: routes,
      spots,
      selection: { spotId: "a", focus: { kind: "route-node", id: "ito-history-museum" } },
      viewportKnowledgeConnectionIds: routes.map((connection) => connection.id),
    });

    expect(scene.viewportPoints.map((point) => point.id)).toEqual([
      "ito-history-museum",
      "mikumo-minamishoji-site",
      "mikumo-ihara-site",
      "hirabaru-site",
    ]);
    expect(scene.viewportPoints.some((point) => point.id === "nara-basin" || point.id === "gimhae")).toBe(false);
    expect(scene.focusPoint).toMatchObject({ id: "ito-history-museum" });
  });

  it("reports a connection that cannot be projected instead of silently hiding it", () => {
    const scene = projectMapScene({
      reviewConnections: [{ ...reviewConnection, id: "broken", spotIds: ["a"] }],
      spots,
      selection: { spotId: "a", focus: { kind: "none" } },
    });

    expect(scene.connections).toEqual([]);
    expect(scene.diagnostics).toMatchObject([
      { code: "insufficient-points", connectionId: "broken" },
    ]);
  });

  it("focuses the exact visited spot even when its connection spans other places", () => {
    const scene = projectMapScene({
      reviewConnections: [reviewConnection],
      spots,
      selection: {
        spotId: "b",
        focus: { kind: "exploration-connection", id: "review-a", eraId: "", focusSpot: true },
      },
    });

    expect(scene.focusPoint).toMatchObject({ id: "b", latitude: 2, longitude: 2, kind: "visited" });
  });
});
