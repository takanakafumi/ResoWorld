import { describe, expect, it } from "vitest";
import publishedDataset from "@/data/published-review-dataset.json";
import type { ReviewAtlasSpot, ReviewDataset } from "@/domain/review/types";
import { kunisakiSyncretismPack } from "./kunisaki-syncretism-pack";
import { buildLensExplorationLinksByIdentity } from "./exploration-links";
import { resolveEntityVisitState } from "./entity-visit-state";
import { projectLensPreset } from "./projection";

describe("Kunisaki & Usa Syncretism Pack (宇佐八幡と六郷満山の神仏習合・山岳修行網)", () => {
  const dataset = publishedDataset as unknown as ReviewDataset;
  const spots = (dataset.atlas?.spots ?? []) as ReviewAtlasSpot[];
  const claims = dataset.claims;

  it("validates pack metadata and radial hub-spoke topology", () => {
    expect(kunisakiSyncretismPack.id).toBe("kunisaki-usa-syncretism-network");
    expect(kunisakiSyncretismPack.status).toBe("active");
    expect(kunisakiSyncretismPack.presets.length).toBeGreaterThanOrEqual(1);
    expect(kunisakiSyncretismPack.presets[0].rootEntityIds?.[0]).toBe("usa-jingu");

    const projection = projectLensPreset(kunisakiSyncretismPack, "usa-rokugo-syncretism-preset");
    const nodeIds = new Set(projection.nodes.map((n) => n.id));
    expect(nodeIds.has("usa-jingu")).toBe(true);
    expect(nodeIds.has("futagoji")).toBe(true);
    expect(nodeIds.has("kumano-magaibutsu")).toBe(true);
    expect(nodeIds.has("fukiji")).toBe(true);
    expect(nodeIds.has("joshinin")).toBe(true);

    // Every edge radiates cleanly from center hub usa-jingu (avoids center-penetration warnings)
    for (const edge of projection.edges) {
      expect(edge.subjectId).toBe("usa-jingu");
    }

    // Plan A safety: non-place entities never bind to coordinates or primarySpotId
    for (const entity of kunisakiSyncretismPack.entities) {
      if (entity.kind !== "place") {
        expect(entity.coordinates).toBeUndefined();
        expect(entity.primarySpotId).toBeUndefined();
      }
    }
  });

  it("promotes Futagoji & Kumano Magaibutsu as visited while keeping Fukiji unvisited", () => {
    const projection = projectLensPreset(kunisakiSyncretismPack, "usa-rokugo-syncretism-preset");
    const links = buildLensExplorationLinksByIdentity(claims, spots, projection.nodes);

    for (const visitedId of ["usa-jingu", "futagoji", "kumano-magaibutsu", "joshinin"]) {
      const node = projection.nodes.find((n) => n.id === visitedId);
      expect(node).toBeDefined();
      const visitState = resolveEntityVisitState(node!, links.get(node!.id), spots);
      expect(visitState.isVisited, `${visitedId} must resolve as visited`).toBe(true);
    }

    const fukijiNode = projection.nodes.find((n) => n.id === "fukiji");
    expect(fukijiNode).toBeDefined();
    const fukijiVisit = resolveEntityVisitState(fukijiNode!, links.get(fukijiNode!.id), spots);
    expect(fukijiVisit.isVisited).toBe(false);
    expect(fukijiVisit.visitReason).toBe("unvisited");
  });
});
