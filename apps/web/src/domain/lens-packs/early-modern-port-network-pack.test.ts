import { describe, expect, it } from "vitest";
import publishedDataset from "@/data/published-review-dataset.json";
import type { ReviewAtlasSpot, ReviewDataset } from "@/domain/review/types";
import { earlyModernPortNetworkPack } from "./early-modern-port-network-pack";
import { buildLensExplorationLinksByIdentity } from "./exploration-links";
import { resolveEntityVisitState } from "./entity-visit-state";
import { projectLensPreset } from "./projection";

describe("Early Modern Port Network Pack (近世港湾都市の対外管理と都市神社アーカイブ)", () => {
  const dataset = publishedDataset as unknown as ReviewDataset;
  const spots = (dataset.atlas?.spots ?? []) as ReviewAtlasSpot[];
  const claims = dataset.claims;

  it("validates pack metadata and matrix preset", () => {
    expect(earlyModernPortNetworkPack.id).toBe("early-modern-port-network");
    expect(earlyModernPortNetworkPack.status).toBe("active");
    expect(earlyModernPortNetworkPack.presets.length).toBeGreaterThanOrEqual(1);
    const preset = earlyModernPortNetworkPack.presets[0];
    expect(preset.id).toBe("early-modern-port-network-preset");
    expect(preset.mapConnections.length).toBeGreaterThanOrEqual(2);
  });

  it("projects Nagasaki, Hirado, and Tomonoura entities and enforces Plan A on non-place entities", () => {
    const projection = projectLensPreset(earlyModernPortNetworkPack, "early-modern-port-network-preset");
    const nodeIds = new Set(projection.nodes.map((n) => n.id));

    expect(nodeIds.has("dejima-nagasaki")).toBe(true);
    expect(nodeIds.has("nagasaki-museum")).toBe(true);
    expect(nodeIds.has("suwa-shrine-nagasaki")).toBe(true);
    expect(nodeIds.has("matsumori-tenmangu")).toBe(true);
    expect(nodeIds.has("hirado-trading-post")).toBe(true);
    expect(nodeIds.has("tomonoura-port")).toBe(true);
    expect(nodeIds.has("tomonoura-museum")).toBe(true);

    // Plan A safety: non-place entities never bind to physical coordinates or primarySpotId
    for (const entity of earlyModernPortNetworkPack.entities) {
      if (entity.kind !== "place") {
        expect(entity.coordinates).toBeUndefined();
        expect(entity.primarySpotId).toBeUndefined();
      }
    }
  });

  it("promotes visited Nagasaki & Tomonoura spots while keeping Hirado unvisited", () => {
    const projection = projectLensPreset(earlyModernPortNetworkPack, "early-modern-port-network-preset");
    const links = buildLensExplorationLinksByIdentity(claims, spots, projection.nodes);

    for (const visitedId of [
      "dejima-nagasaki",
      "nagasaki-museum",
      "suwa-shrine-nagasaki",
      "matsumori-tenmangu",
      "tomonoura-port",
      "tomonoura-museum",
    ]) {
      const node = projection.nodes.find((n) => n.id === visitedId);
      expect(node).toBeDefined();
      const visitState = resolveEntityVisitState(node!, links.get(node!.id), spots);
      expect(visitState.isVisited, `${visitedId} must resolve as visited`).toBe(true);
    }

    const hiradoNode = projection.nodes.find((n) => n.id === "hirado-trading-post");
    expect(hiradoNode).toBeDefined();
    const hiradoVisit = resolveEntityVisitState(hiradoNode!, links.get(hiradoNode!.id), spots);
    expect(hiradoVisit.isVisited).toBe(false);
    expect(hiradoVisit.visitReason).toBe("unvisited");
  });
});
