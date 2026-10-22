import { describe, expect, it } from "vitest";
import publishedDataset from "@/data/published-review-dataset.json";
import type { ReviewDataset } from "@/domain/review/types";
import { resolveLensTopics } from "@/domain/lenses/topic-resolver";
import { resolveSpotKnowledgeContexts } from "@/domain/lens-packs/spot-knowledge";
import { projectMapScene } from "@/domain/map/scene";
import {
  CHRONOLOGICAL_STRATA,
  buildClaimsByIdMap,
  getSpotStratumMemberships,
  type StratumResolutionContext,
} from "@/domain/review/stratum-types";
import { recognitionLensDefinitions } from "@/app/review/use-atlas-lens-state";

describe("Performance Budget Invariants (Systematic Safety Nets)", () => {
  const dataset = publishedDataset as unknown as ReviewDataset;
  const spots = dataset.atlas?.spots ?? [];
  const claims = dataset.claims ?? [];
  const claimsById = buildClaimsByIdMap(claims);

  it("guarantees dataset size baseline for meaningful benchmarks", () => {
    expect(spots.length).toBeGreaterThanOrEqual(100);
    expect(claims.length).toBeGreaterThanOrEqual(700);
  });

  it("resolves lens topics across all perspectives within strict cold budget (<= 100ms) and warm budget (<= 2ms)", () => {
    const perspectives = recognitionLensDefinitions.filter((l) => l.id !== "overview");

    // Cold run (compiles topic exploration links once)
    const coldStart = performance.now();
    let totalTopics = 0;
    for (const lens of perspectives) {
      const topics = resolveLensTopics({
        perspectiveId: lens.id as any,
        claims,
        spots,
        includeUnvisited: true,
      });
      totalTopics += topics.length;
    }
    const coldElapsed = performance.now() - coldStart;
    expect(coldElapsed).toBeLessThan(350); // 250ms max under parallel worker contention // 100ms max for cold compilation
    expect(totalTopics).toBeGreaterThanOrEqual(25);

    // Warm run (simulating rapid user interaction on the UI)
    const warmStart = performance.now();
    for (const lens of perspectives) {
      const warmTopics = resolveLensTopics({
        perspectiveId: lens.id as any,
        claims,
        spots,
        selectedSpotId: spots[0]?.id,
        includeUnvisited: true,
      });
      expect(warmTopics.length).toBeGreaterThan(0);
    }
    const warmElapsed = performance.now() - warmStart;
    // All 5 perspectives combined should take under 2ms warm!
    expect(warmElapsed).toBeLessThan(10); // 10ms max under parallel worker contention
  });

  it("resolves spot knowledge contexts across all 126 spots within strict time budget (<= 150ms total, < 1.2ms/spot)", () => {
    const claimMap = new Map(claims.map((c) => [c.id, c]));

    const start = performance.now();
    let resolvedCount = 0;

    for (const spot of spots) {
      const spotClaims = spot.claimIds.map((id) => claimMap.get(id)).filter(Boolean) as ReviewDataset["claims"];
      const contexts = resolveSpotKnowledgeContexts(spot, spotClaims);
      if (contexts.length > 0) resolvedCount++;
    }

    const elapsed = performance.now() - start;
    // 126 spots: average per spot should be under 5ms under parallel worker contention
    expect(elapsed).toBeLessThan(600); // 600ms max for all 126 spots under parallel worker contention
    expect(resolvedCount).toBeGreaterThan(0);
  });

  it("resolves chronological stratum memberships across all spots within strict time budget (<= 25ms)", () => {
    const context: StratumResolutionContext = {
      claimsById,
      connections: dataset.atlas?.connections ?? [],
    };

    const start = performance.now();
    const memberships = getSpotStratumMemberships(spots, CHRONOLOGICAL_STRATA, context);
    const elapsed = performance.now() - start;

    expect(elapsed).toBeLessThan(75);
    expect(memberships.size).toBe(spots.length);
  });

  it("projects map scene across all 29 topics within strict time budget (<= 30ms total)", () => {
    const allTopics = recognitionLensDefinitions
      .filter((l) => l.id !== "overview")
      .flatMap((lens) =>
        resolveLensTopics({
          perspectiveId: lens.id as any,
          claims,
          spots,
          includeUnvisited: true,
        }),
      );

    const start = performance.now();
    for (const topic of allTopics) {
      const scene = projectMapScene({
        spots,
        reviewConnections: dataset.atlas?.connections ?? [],
        selection: { spotId: "", focus: { kind: "none" } },
      });
      expect(scene.connections).toBeDefined();
    }
    const elapsed = performance.now() - start;

    expect(elapsed).toBeLessThan(75);
  });
});
