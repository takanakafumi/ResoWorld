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
      { id: "spot-a", targetId: "spot-a", label: "地点A", longitude: 130.5, latitude: 33.5, color: "#5a6e72", variant: "ghost" as const },
      { id: "spot-b", targetId: "spot-b", label: "地点B", longitude: 130.51, latitude: 33.5, color: "#f0cf80", variant: "overview" as const },
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

  it("offloads unselected visited spots to category-colored Canvas dots at OVERVIEW wide zoom (Issue #55)", () => {
    const selectedSpot = spots[0];
    const unified = projectMapMarkers({
      spots,
      suggestions: [],
      suggestionsVisible: false,
      suggestionStatuses: {},
      selectedSpotId: selectedSpot.id,
      highlightedSpotIds: [],
      mapConnections: [],
      focusedViewport: false,
      topicScope: undefined,
      natureFilter: "all",
    });

    const { domMarkers, ghostDots } = partitionUnifiedMarkers(unified, {
      isOverviewMode: true,
      zoom: 7.5,
      bounds: { west: 128.5, south: 31.0, east: 136.0, north: 36.0 },
    });

    const visibleDom = domMarkers.filter((m) => m.isVisible);
    // Only the selected spot stays as a DOM marker; all other ~200 visited spots render on Canvas
    expect(visibleDom.map((m) => m.id)).toEqual([selectedSpot.id]);
    expect(ghostDots.length).toBeGreaterThanOrEqual(180);
    expect(ghostDots.every((d) => d.variant === "overview")).toBe(true);
  });

  it("promotes only in-viewport spots to rich DOM pills at OVERVIEW close zoom while culling off-screen spots (Issue #55)", () => {
    const unified = projectMapMarkers({
      spots,
      suggestions: [],
      suggestionsVisible: false,
      suggestionStatuses: {},
      selectedSpotId: "",
      highlightedSpotIds: [],
      mapConnections: [],
      focusedViewport: false,
      topicScope: undefined,
      natureFilter: "all",
    });

    // Tight viewport centered on Iizuka / Keisen (Chikuho area)
    const chikuhoBounds = {
      west: 130.60,
      south: 33.56,
      east: 130.72,
      north: 33.68,
    };

    const { domMarkers, ghostDots } = partitionUnifiedMarkers(unified, {
      isOverviewMode: true,
      zoom: 12.0,
      bounds: chikuhoBounds,
    });

    const visibleDomIds = domMarkers.filter((m) => m.isVisible).map((m) => m.id);
    // Chikuho spots inside the viewport bloom into rich DOM pills
    expect(visibleDomIds).toContain("spot-ozuka-kofun");
    expect(visibleDomIds).toContain("spot-daibu-hachimangu");
    expect(visibleDomIds).toContain("spot-gekko-jinja");
    expect(visibleDomIds).toContain("spot-iizuka-history-museum");
    // Off-screen spots (~180+ in other prefectures/regions) stay culled out of DOM!
    expect(visibleDomIds.length).toBeLessThan(35);
    expect(ghostDots.length).toBeGreaterThanOrEqual(150);
  });
});
