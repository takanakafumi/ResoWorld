import { describe, expect, it } from "vitest";
import publishedDataset from "@/data/published-review-dataset.json";
import {
  findNearestGhostDotAtPoint,
  partitionUnifiedMarkers,
  projectGhostDotsToScreen,
} from "@/domain/map/ghost-dots";
import { projectMapMarkers, type TopicMapScope } from "@/domain/map/markers";
import type { ReviewAtlasSpot, ReviewDataset } from "@/domain/review/types";

describe("Non-DOM Ghost Dots Partition, Projection & Hit-Testing (Issue #54 Phase 3)", () => {
  const dataset = publishedDataset as unknown as ReviewDataset;
  const spots = (dataset.atlas?.spots ?? []) as ReviewAtlasSpot[];

  it("offloads non-active ghost markers to Canvas in LENS mode, reducing DOM markers drastically", () => {
    // Pick a realistic 10-spot LENS topic scope out of 200+ spots
    const topicSpotIds = new Set(spots.slice(0, 10).map((s) => s.id));
    const topicScope: TopicMapScope = {
      spotIds: topicSpotIds,
      suggestionIds: new Set<string>(),
    };

    const unified = projectMapMarkers({
      spots,
      suggestions: [],
      suggestionsVisible: false,
      suggestionStatuses: {},
      selectedSpotId: "",
      highlightedSpotIds: [],
      mapConnections: [],
      focusedViewport: false,
      topicScope,
      natureFilter: "all",
    });

    const { domMarkers, ghostDots } = partitionUnifiedMarkers(unified);
    const visibleDomMarkers = domMarkers.filter((m) => m.isVisible);

    // Topic-related spots remain rich DOM markers; ~190 off-topic ghost spots move to Canvas
    expect(visibleDomMarkers.length).toBe(10);
    expect(ghostDots.length).toBeGreaterThanOrEqual(150);
    expect(visibleDomMarkers.every((m) => !m.isGhost)).toBe(true);
  });

  it("promotes a clicked/selected ghost spot to a single active DOM marker while keeping all other ghosts on Canvas", () => {
    const topicSpotIds = new Set(spots.slice(0, 5).map((s) => s.id));
    const clickedGhostSpot = spots[10];
    expect(clickedGhostSpot).toBeDefined();

    const unified = projectMapMarkers({
      spots,
      suggestions: [],
      suggestionsVisible: false,
      suggestionStatuses: {},
      selectedSpotId: clickedGhostSpot.id,
      highlightedSpotIds: [],
      mapConnections: [],
      focusedViewport: false,
      topicScope: {
        spotIds: topicSpotIds,
        suggestionIds: new Set<string>(),
      },
      natureFilter: "all",
    });

    const { domMarkers, ghostDots } = partitionUnifiedMarkers(unified);
    expect(domMarkers.some((m) => m.id === clickedGhostSpot.id && m.isActive)).toBe(true);
    expect(ghostDots.some((d) => d.id === clickedGhostSpot.id)).toBe(false);
  });

  it("projects ghost dots with hover sync and selects the nearest dot within hit radius", () => {
    const projector = {
      project: ([lng, lat]: [number, number]) => ({
        x: (lng - 130) * 1000,
        y: (34 - lat) * 1000,
      }),
    };

    const dots = [
      { id: "spot-a", targetId: "spot-a", label: "地点A", longitude: 130.5, latitude: 33.5, color: "#5a6e72" },
      { id: "spot-b", targetId: "spot-b", label: "地点B", longitude: 130.51, latitude: 33.5, color: "#5a6e72" },
    ];

    const projected = projectGhostDotsToScreen(dots, projector, new Set(["地点B"]), null);
    expect(projected[0].isHovered).toBe(false);
    expect(projected[1].isHovered).toBe(true);

    // Hit near spot-a (500, 500)
    const hitA = findNearestGhostDotAtPoint(projected, { x: 503, y: 504 }, 14);
    expect(hitA?.id).toBe("spot-a");

    // Tie-breaker: closer to spot-b (510, 500) than spot-a (500, 500)
    const hitB = findNearestGhostDotAtPoint(projected, { x: 508, y: 500 }, 14);
    expect(hitB?.id).toBe("spot-b");

    // Outside hit radius -> null (falls through to map clear focus)
    const miss = findNearestGhostDotAtPoint(projected, { x: 600, y: 600 }, 14);
    expect(miss).toBeNull();
  });
});
