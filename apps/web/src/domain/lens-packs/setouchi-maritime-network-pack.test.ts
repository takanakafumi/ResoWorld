import { describe, expect, it } from "vitest";
import publishedDataset from "@/data/published-review-dataset.json";
import { buildLensExplorationLinksByIdentity } from "./exploration-links";
import { resolveEntityVisitState } from "./entity-visit-state";
import { registeredLensTopics } from "./knowledge-registry";
import { projectLensPreset } from "./projection";
import { setouchiMaritimeNetworkPack } from "./setouchi-maritime-network-pack";
import { TOPIC_STRUCTURAL_GUIDES } from "@/domain/lenses/structural-guides";
import { calculateSequenceCorridorLayout } from "@/domain/lenses/layout/sequence-corridor-layout";
import { calculateMatrixComparisonLayout } from "@/domain/lenses/layout/matrix-comparison-layout";
import type { ReviewDataset } from "@/domain/review/types";

describe("Setouchi Maritime Network Knowledge Pack Invariants", () => {
  const dataset = publishedDataset as unknown as ReviewDataset;
  const spots = dataset.atlas!.spots;
  const claims = dataset.claims;
  const suggestions = dataset.atlas!.suggestions;

  it("registers both route (sequence) and politics (matrix) topics with structural guides", () => {
    const routeTopic = registeredLensTopics.find((t) => t.id === "setouchi-maritime-route-preset");
    const politicsTopic = registeredLensTopics.find((t) => t.id === "setouchi-polity-integration-preset");

    expect(routeTopic).toBeDefined();
    expect(routeTopic?.perspectiveId).toBe("route");
    expect(routeTopic?.archetype).toBe("sequence");
    expect(routeTopic?.scopeClusters?.length).toBeGreaterThanOrEqual(2);
    expect(TOPIC_STRUCTURAL_GUIDES["setouchi-maritime-route-preset"]).toBeDefined();

    expect(politicsTopic).toBeDefined();
    expect(politicsTopic?.perspectiveId).toBe("politics");
    expect(politicsTopic?.archetype).toBe("matrix");
    expect(politicsTopic?.scopeClusters?.length).toBeGreaterThanOrEqual(2);
    expect(TOPIC_STRUCTURAL_GUIDES["setouchi-polity-integration-preset"]).toBeDefined();
  });

  it("enforces Plan A invariant (no coordinates/primarySpotId on non-place entities) and excludes forbidden labels", () => {
    for (const entity of setouchiMaritimeNetworkPack.entities) {
      if (entity.kind !== "place") {
        expect(entity.coordinates, `Non-place ${entity.id} must not hold coordinates`).toBeUndefined();
        expect(entity.primarySpotId, `Non-place ${entity.id} must not hold primarySpotId`).toBeUndefined();
      }
      expect(entity.label.includes("赤間")).toBe(false);
      expect(entity.aliases.some((a) => a.includes("赤間"))).toBe(false);
      expect(entity.label.length).toBeLessThanOrEqual(24);
    }
  });

  it("separates 4-6c Buzen Kofun chieftains from 7c Goshogatani/Kokufu state facilities in politics matrix", () => {
    const preset = setouchiMaritimeNetworkPack.presets.find(
      (p) => p.id === "setouchi-polity-integration-preset",
    );
    expect(preset).toBeDefined();

    const kofunCol = preset?.mapConnections.find((c) => c.id === "matrix-buzen-kofun-chiefs");
    const stateCol = preset?.mapConnections.find((c) => c.id === "matrix-buzen-7c-state");
    expect(kofunCol).toBeDefined();
    expect(stateCol).toBeDefined();

    // Disjoint anchors and disjoint places between epochs
    expect(kofunCol?.anchorEntityId).toBe("buzen-kyoto-chieftains");
    expect(stateCol?.anchorEntityId).toBe("suonada-7c-militarization");
    const kofunPlaces = new Set(kofunCol?.placeEntityIds ?? []);
    for (const pid of stateCol?.placeEntityIds ?? []) {
      expect(kofunPlaces.has(pid)).toBe(false);
    }

    // All comparative matrix columns must use displayMode: "focus-only"
    for (const col of preset?.mapConnections ?? []) {
      expect(col.displayMode).toBe("focus-only");
    }
  });

  it("keeps sequence route stages non-chaining across scopeClusters and covers all projected nodes", () => {
    const preset = setouchiMaritimeNetworkPack.presets.find(
      (p) => p.id === "setouchi-maritime-route-preset",
    );
    expect(preset).toBeDefined();
    const west = preset?.mapConnections.find((c) => c.id === "setouchi-suonada-west-stage");
    const wide = preset?.mapConnections.find((c) => c.id === "setouchi-wide-corridor");
    expect(west).toBeDefined();
    expect(wide).toBeDefined();

    // Ensure wide corridor does not start with west stage's final stop (prevents accidental concatenation in sequence-route-lens)
    const westEnd = west!.placeEntityIds[west!.placeEntityIds.length - 1];
    expect(wide!.placeEntityIds[0]).not.toBe(westEnd);

    const routeProjection = projectLensPreset(setouchiMaritimeNetworkPack, "setouchi-maritime-route-preset");
    const waypointIds = new Set(wide!.placeEntityIds);
    const waypoints = wide!.placeEntityIds.map((id) => {
      const node = routeProjection.nodes.find((n) => n.id === id);
      return { id, label: node?.label ?? id, kind: node?.kind ?? "place" };
    });
    const seqLayout = calculateSequenceCorridorLayout(
      waypoints,
      routeProjection.nodes.filter((n) => !waypointIds.has(n.id)),
      routeProjection.edges,
    );
    expect(seqLayout.nodePositions.size).toBe(routeProjection.nodes.length);

    // Spatial overlay legend parity
    const overlay = preset!.spatialOverlay!;
    expect(overlay).toBeDefined();
    for (const feature of overlay.features) {
      if (feature.geometry.type === "LineString" || feature.geometry.type === "MultiLineString") {
        const match = overlay.legend?.some(
          (item) =>
            !item.isPolygon &&
            item.color.toLowerCase() === (feature.properties.color ?? "#38bdf8").toLowerCase() &&
            Boolean(item.dashed) === Boolean(feature.properties.dashed),
        );
        expect(match).toBe(true);
      }
    }
  });

  it("achieves 100% node coverage in comparative matrix layout", () => {
    const preset = setouchiMaritimeNetworkPack.presets.find(
      (p) => p.id === "setouchi-polity-integration-preset",
    )!;
    const projection = projectLensPreset(setouchiMaritimeNetworkPack, "setouchi-polity-integration-preset");
    const cols = preset.mapConnections.map((c) => ({
      id: c.id,
      title: c.label,
      subtitle: c.description,
      color: c.appearance?.color,
      anchorNodeId: c.anchorEntityId ?? c.placeEntityIds[0],
      memberNodeIds: [...c.placeEntityIds, ...(c.contextEntityIds ?? [])],
    }));

    const layout = calculateMatrixComparisonLayout(projection.nodes, projection.edges, cols);
    expect(layout.nodePositions.size).toBe(projection.nodes.length);
  });

  it("synchronizes visited maritime spots to LENS visited state and registers unique concrete suggestions", () => {
    const routeProjection = projectLensPreset(setouchiMaritimeNetworkPack, "setouchi-maritime-route-preset");
    const links = buildLensExplorationLinksByIdentity(claims, spots, routeProjection.nodes);

    for (const visitedId of [
      "shikaumi-shrine",
      "munakata-taisha",
      "kanmon-mekari-strait",
      "itsukushima-shrine",
      "tomonoura-port",
    ]) {
      const node = routeProjection.nodes.find((n) => n.id === visitedId);
      expect(node, `Node ${visitedId} should exist in route projection`).toBeDefined();
      const visitState = resolveEntityVisitState(node!, links.get(node!.id), spots);
      expect(visitState.isVisited, `Node ${visitedId} must evaluate as visited`).toBe(true);
    }

    const expectedConcreteSuggestionTargetIds = [
      "place-ishizukayama",
      "goshoyama-kofun",
      "goshogatani-kogoishi",
      "buzen-kokufu-park",
      "oyamazumi-shrine",
      "tsukuriyama-kofun-kibi",
      "sakuyama-kofun-soja",
      "kibitsu-shrine",
      "iwatoyama-kofun",
      "sumiyoshi-taisha-osaka",
    ];
    for (const targetPlaceId of expectedConcreteSuggestionTargetIds) {
      const matching = suggestions.filter((s) => s.targetPlaceId === targetPlaceId);
      expect(matching.length, `TargetPlaceId ${targetPlaceId} must have exactly 1 suggestion`).toBe(1);
    }
  });
});
