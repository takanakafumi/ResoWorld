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
    expect(scene.viewportPoints).toHaveLength(3);
    expect(scene.camera).toMatchObject({ mode: "bounds", reason: "suggestion", label: "次の候補", maxZoom: 11, points: expect.arrayContaining([expect.objectContaining({ id: "next-a" })]) });
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

    expect(scene.connections.find((connection) => connection.sourceId === "wajinden-kinai-hypothesis")?.emphasized).toBe(true);
    expect(scene.focusPoint).toMatchObject({ id: "nara-basin", focusEntityId: "nara-basin" });
    expect(scene.camera).toMatchObject({ mode: "point", reason: "lens-node", label: "奈良盆地周辺", point: { id: "nara-basin" } });
    expect(scene.viewportPoints.map((point) => point.id)).toEqual(["umi", "nara-basin"]);
  });

  it("focuses Na on its Kasuga center candidate rather than central Hakata", () => {
    const routes = projectLensMapPreset(wajindenRoutesPack, "wajinden-comparison");
    const scene = projectMapScene({
      reviewConnections: [],
      knowledgeConnections: routes,
      spots: [],
      selection: { spotId: "", focus: { kind: "route-node", id: "na-state" } },
      viewportKnowledgeConnectionIds: routes.map((connection) => connection.id),
    });

    expect(scene.focusPoint).toMatchObject({ id: "kasuga-sugu-core", focusEntityId: "na-state" });
    expect(scene.camera).toMatchObject({ mode: "point", reason: "lens-node", label: "春日市・須玖遺跡群周辺" });
    expect(scene.viewportPoints.some((point) => point.id === "hakata-plain")).toBe(false);
  });

  it("fits all Toma candidates without inventing a connection route", () => {
    const routes = projectLensMapPreset(wajindenRoutesPack, "wajinden-comparison");
    const scene = projectMapScene({
      reviewConnections: [],
      knowledgeConnections: routes,
      spots: [],
      selection: { spotId: "", focus: { kind: "route-node", id: "toma-state" } },
      viewportKnowledgeConnectionIds: routes.map((connection) => connection.id),
    });

    expect(scene.camera).toMatchObject({
      mode: "bounds",
      reason: "connection",
      label: "投馬国の位置候補",
      points: expect.arrayContaining([
        expect.objectContaining({ id: "toma-chikugo" }),
        expect.objectContaining({ id: "toma-hyuga" }),
        expect.objectContaining({ id: "toma-tomonoura" }),
        expect.objectContaining({ id: "toma-izumo" }),
      ]),
    });
    expect(scene.connections.find((connection) => connection.sourceId === "toma-location-candidates")).toMatchObject({ displayMode: "points", selected: false, emphasized: true });
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
    expect(scene.camera).toMatchObject({ mode: "point", reason: "lens-node", point: { id: "ito-history-museum" } });
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
        pinnedConnection: { kind: "exploration", id: "review-a", eraId: "" },
        focus: { kind: "spot" },
      },
    });

    expect(scene.focusPoint).toMatchObject({ id: "b", latitude: 2, longitude: 2, kind: "visited" });
    expect(scene.connections.find((connection) => connection.sourceId === "review-a")?.selected).toBe(true);
    expect(scene.camera).toMatchObject({ mode: "point", reason: "spot", label: "地点B", point: { id: "b" } });
  });

  it("does not issue a new camera command when a spot is deselected", () => {
    const scene = projectMapScene({
      reviewConnections: [reviewConnection],
      spots,
      selection: { spotId: "", focus: { kind: "none", preserveCamera: true } },
    });

    expect(scene.camera).toEqual({ mode: "none", reason: "none", label: "現在の表示範囲" });
  });

  it("uses the selected connection range when no spot was directly clicked", () => {
    const scene = projectMapScene({
      reviewConnections: [reviewConnection],
      spots,
      selection: { spotId: "a", pinnedConnection: { kind: "exploration", id: "review-a", eraId: "" }, focus: { kind: "exploration-connection", id: "review-a", eraId: "" } },
    });

    expect(scene.camera).toMatchObject({
      mode: "bounds",
      reason: "connection",
      label: "旅行記の接続",
      maxZoom: 13,
      points: [expect.objectContaining({ id: "a" }), expect.objectContaining({ id: "b" })],
    });
  });
});
