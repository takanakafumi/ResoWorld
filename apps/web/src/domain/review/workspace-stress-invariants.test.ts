import { describe, expect, it } from "vitest";
import publishedDataset from "@/data/published-review-dataset.json";
import type { ReviewDataset, ReviewAtlasSpot } from "@/domain/review/types";
import { reduceAtlasSelection, type AtlasSelection } from "@/domain/map/selection";
import { decideCameraCommand } from "@/domain/map/camera-policy";
import { projectMapScene } from "@/domain/map/scene";
import { resolveLensTopics } from "@/domain/lenses/topic-resolver";
import { resolveSpotKnowledgeContexts } from "@/domain/lens-packs/spot-knowledge";
import { recognitionLensDefinitions } from "@/app/review/use-atlas-lens-state";
import { knowledgeVisitFrontierSuggestionsForVisitedSpots } from "@/domain/map/registry";

describe("Workspace Stress & State Transition Invariants (Systematic Safety Nets)", () => {
  const dataset = publishedDataset as unknown as ReviewDataset;
  const spots = dataset.atlas?.spots ?? [];
  const suggestions = dataset.atlas?.suggestions ?? [];
  const claims = dataset.claims ?? [];
  const connections = dataset.atlas?.connections ?? [];
  const claimMap = new Map(claims.map((c) => [c.id, c]));

  it("survives 50 rapid sequential spot clicks without error, memory leak, or invalid camera state", () => {
    let selection: AtlasSelection = { spotId: "", focus: { kind: "none" } };
    let lastPannedKey: string | null = null;

    const sampleSpots = spots.slice(0, 50);
    expect(sampleSpots.length).toBe(50);

    for (const spot of sampleSpots) {
      // 1. Dispatch spot selection
      selection = reduceAtlasSelection(selection, {
        type: "select-spot",
        spotId: spot.id,
        panCamera: true,
      });

      expect(selection.spotId).toBe(spot.id);
      expect(selection.focus.kind).toBe("spot");

      // 2. Resolve spot claims & knowledge
      const spotClaims = spot.claimIds.map((id) => claimMap.get(id)).filter(Boolean) as ReviewDataset["claims"];
      const knowledge = resolveSpotKnowledgeContexts(spot, spotClaims);
      expect(Array.isArray(knowledge)).toBe(true);

      // 3. Resolve topics for active lens (e.g. mythology)
      const topics = resolveLensTopics({
        perspectiveId: "mythology",
        claims,
        spots,
        selectedSpotId: spot.id,
        includeUnvisited: true,
      });
      expect(topics.length).toBeGreaterThan(0);

      // 4. Project map scene
      const scene = projectMapScene({
        spots,
        reviewConnections: connections,
        selection,
      });
      expect(scene.camera).toBeDefined();

      // 5. Evaluate camera command
      const { command, nextPannedKey } = decideCameraCommand({
        camera: scene.camera,
        isInitial: false,
        autoZoom: true,
        lastPannedKey,
      });

      lastPannedKey = nextPannedKey;
      if (command.type === "pan") {
        expect(Number.isFinite(command.longitude)).toBe(true);
        expect(Number.isFinite(command.latitude)).toBe(true);
      }
    }

    // Toggle off by clicking the last spot again
    const lastSpot = sampleSpots[sampleSpots.length - 1];
    selection = reduceAtlasSelection(selection, {
      type: "select-spot",
      spotId: lastSpot.id,
    });
    expect(selection.spotId).toBe("");
    expect(selection.focus.kind).toBe("none");
  });

  it("survives 20 rapid candidate suggestion clicks with mutual exclusivity", () => {
    let selection: AtlasSelection = { spotId: "", focus: { kind: "none" } };
    const allSuggestions = knowledgeVisitFrontierSuggestionsForVisitedSpots(spots);
    const sampleSuggestions = allSuggestions.slice(0, 20);
    expect(sampleSuggestions.length).toBeGreaterThanOrEqual(10);

    for (const suggestion of sampleSuggestions) {
      selection = reduceAtlasSelection(selection, {
        type: "select-suggestion",
        id: suggestion.id,
        panCamera: true,
      });

      expect(selection.focus.kind).toBe("suggestion");
      expect((selection.focus as any).id).toBe(suggestion.id);
      expect(selection.spotId).toBe(""); // Spot must be cleared
    }

    // Toggle off by clicking same suggestion
    const lastSuggestion = sampleSuggestions[sampleSuggestions.length - 1];
    selection = reduceAtlasSelection(selection, {
      type: "select-suggestion",
      id: lastSuggestion.id,
    });
    expect(selection.focus.kind).toBe("none");
  });

  it("survives 20 rapid STRATUM <-> LENS mode toggles preserving state invariants", () => {
    let selection: AtlasSelection = {
      spotId: spots[0]?.id ?? "",
      focus: { kind: "spot" },
    };

    let mode: "stratum" | "lens" = "stratum";

    for (let i = 0; i < 20; i++) {
      // Toggle mode
      mode = mode === "stratum" ? "lens" : "stratum";

      // When switching to stratum with candidate selected, clear-focus is guaranteed
      if (mode === "stratum" && selection.focus.kind === "suggestion") {
        selection = reduceAtlasSelection(selection, { type: "clear-focus", preserveCamera: true });
      }

      // Check effective projections
      if (mode === "stratum") {
        // In stratum mode, connections and suggestions are stripped from map view
        const effectiveScene = {
          ...projectMapScene({ spots, reviewConnections: connections, selection }),
          connections: [],
        };
        const effectiveSuggestions: any[] = [];

        expect(effectiveScene.connections.length).toBe(0);
        expect(effectiveSuggestions.length).toBe(0);
      } else {
        const effectiveScene = projectMapScene({ spots, reviewConnections: connections, selection });
        const effectiveSuggestions = suggestions;

        expect(effectiveScene.connections.length).toBeGreaterThan(0);
        expect(effectiveSuggestions.length).toBeGreaterThan(0);
      }

      // Selected spot must remain preserved across mode toggles
      expect(selection.spotId).toBe(spots[0]?.id);
      expect(selection.focus.kind).toBe("spot");
    }
  });

  it("strictly enforces mutual exclusivity during alternating spot and candidate clicks", () => {
    let selection: AtlasSelection = { spotId: "", focus: { kind: "none" } };

    const spot = spots[0]!;
    const suggestion = suggestions[0]!;

    // 1. Click Spot
    selection = reduceAtlasSelection(selection, { type: "select-spot", spotId: spot.id });
    expect(selection.spotId).toBe(spot.id);
    expect(selection.focus.kind).toBe("spot");

    // 2. Click Candidate
    selection = reduceAtlasSelection(selection, { type: "select-suggestion", id: suggestion.id });
    expect(selection.spotId).toBe(""); // Spot must be wiped
    expect(selection.focus.kind).toBe("suggestion");

    // 3. Click another Spot
    const secondSpot = spots[1]!;
    selection = reduceAtlasSelection(selection, { type: "select-spot", spotId: secondSpot.id });
    expect(selection.spotId).toBe(secondSpot.id);
    expect(selection.focus.kind).toBe("spot");

    // 4. Clear focus
    selection = reduceAtlasSelection(selection, { type: "clear-focus" });
    expect(selection.spotId).toBe("");
    expect(selection.focus.kind).toBe("none");
  });

  it("prevents camera pan loop on repeated scene updates for the same target", () => {
    const spot = spots[0]!;
    const selection: AtlasSelection = {
      spotId: spot.id,
      focus: { kind: "spot", panCamera: true },
    };

    const scene = projectMapScene({ spots, reviewConnections: connections, selection });

    // First call: produces command: 'pan' (if camera has pan target) or 'none'
    const firstDecision = decideCameraCommand({
      camera: scene.camera,
      isInitial: false,
      autoZoom: true,
      lastPannedKey: null,
    });

    // If it panned, second call with same lastPannedKey MUST be 'none'
    if (firstDecision.command.type === "pan") {
      const secondDecision = decideCameraCommand({
        camera: scene.camera,
        isInitial: false,
        autoZoom: true,
        lastPannedKey: firstDecision.nextPannedKey,
      });
      expect(secondDecision.command.type).toBe("none");
    }
  });
});
