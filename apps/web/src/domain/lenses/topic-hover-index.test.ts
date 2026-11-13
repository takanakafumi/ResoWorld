import { describe, expect, it } from "vitest";
import publishedDataset from "@/data/published-review-dataset.json";
import { marineDeitiesPack } from "@/domain/lens-packs/marine-deities-pack";
import { buildLensExplorationLinksByIdentity } from "@/domain/lens-packs/exploration-links";
import { projectLensPreset } from "@/domain/lens-packs/projection";
import { knowledgeVisitFrontierSuggestionsForVisitedSpots } from "@/domain/map/registry";
import type { ReviewAtlasSpot, ReviewDataset } from "@/domain/review/types";
import { buildTopicHoverIndex } from "./topic-hover-index";

const dataset = publishedDataset as unknown as ReviewDataset;
const spots = (dataset.atlas?.spots ?? []) as ReviewAtlasSpot[];
const suggestions = [
  ...(dataset.atlas?.suggestions ?? []),
  ...knowledgeVisitFrontierSuggestionsForVisitedSpots(spots, { includeUnanchored: true }),
];

describe("buildTopicHoverIndex (O(1) Bidirectional Hover Index)", () => {
  it("builds 1-to-1 bidirectional lookup between visited place nodes and Atlas spots", () => {
    const projection = projectLensPreset(marineDeitiesPack, "marine-deities-preset");
    const links = buildLensExplorationLinksByIdentity(dataset.claims, spots, projection.nodes);
    const index = buildTopicHoverIndex({
      pack: marineDeitiesPack,
      presetId: "marine-deities-preset",
      spots,
      suggestions,
      explorationLinks: links,
    });

    const shikaumiSpotIds = index.nodeToSpotIds.get("shikaumi-shrine") ?? [];
    expect(shikaumiSpotIds).toHaveLength(1);
    const shikaumiSpotId = shikaumiSpotIds[0]!;
    expect(index.spotToNodeIds.get(shikaumiSpotId)).toContain("shikaumi-shrine");

    const hetsumiyaSpotIds = index.nodeToSpotIds.get("munakata-hetsumiya") ?? [];
    expect(hetsumiyaSpotIds).toHaveLength(1);
    expect(index.spotToNodeIds.get(hetsumiyaSpotIds[0]!)).toContain("munakata-hetsumiya");
  });

  it("resolves deity/clan nodes to connected visited shrine spots without polluting spotToNodeIds (Plan A)", () => {
    const projection = projectLensPreset(marineDeitiesPack, "marine-deities-preset");
    const links = buildLensExplorationLinksByIdentity(dataset.claims, spots, projection.nodes);
    const index = buildTopicHoverIndex({
      pack: marineDeitiesPack,
      presetId: "marine-deities-preset",
      spots,
      suggestions,
      explorationLinks: links,
    });

    const watatsumiSpots = index.nodeToSpotIds.get("watatsumi-three-kami") ?? [];
    const shikaumiSpotId = index.nodeToSpotIds.get("shikaumi-shrine")?.[0];
    expect(shikaumiSpotId).toBeDefined();
    expect(watatsumiSpots).toContain(shikaumiSpotId);

    // Reverse lookup from a spot pin should stay focused on place nodes, not pollute with non-place deity groups
    const reverseNodes = index.spotToNodeIds.get(shikaumiSpotId!) ?? [];
    expect(reverseNodes).toContain("shikaumi-shrine");
    expect(reverseNodes).not.toContain("watatsumi-three-kami");
  });

  it("resolves unvisited candidate nodes bidirectionally via suggestion IDs", () => {
    const projection = projectLensPreset(marineDeitiesPack, "marine-deities-preset");
    const links = buildLensExplorationLinksByIdentity(dataset.claims, spots, projection.nodes);
    const index = buildTopicHoverIndex({
      pack: marineDeitiesPack,
      presetId: "marine-deities-preset",
      spots,
      suggestions,
      explorationLinks: links,
    });

    const manjuSuggestionKeys = index.nodeToSuggestionIds.get("manju-kanju-islands") ?? [];
    expect(manjuSuggestionKeys.length).toBeGreaterThan(0);
    for (const key of manjuSuggestionKeys) {
      expect(index.suggestionToNodeIds.get(key)).toContain("manju-kanju-islands");
    }
  });
});
