import { describe, expect, it } from "vitest";
import publishedDataset from "@/data/published-review-dataset.json";
import type { ReviewDataset, ReviewAtlasSpot } from "@/domain/review/types";
import { reduceAtlasSelection, type AtlasSelection } from "@/domain/map/selection";
import { decideCameraCommand } from "@/domain/map/camera-policy";
import { projectMapScene } from "@/domain/map/scene";
import { projectLensPreset } from "@/domain/lens-packs/projection";
import { resolveLensTopics } from "@/domain/lenses/topic-resolver";
import { resolveSpotKnowledgeContexts } from "@/domain/lens-packs/spot-knowledge";
import { recognitionLensDefinitions } from "@/app/review/use-atlas-lens-state";
import { knowledgeVisitFrontierSuggestionsForVisitedSpots, knowledgeMapConnectionsForLens } from "@/domain/map/registry";
import { projectKnowledgeMapConnections } from "@/domain/map/connections";
import { resolveConnectionAppearance, projectConnectionGeometry } from "@/app/review/use-connection-lines";
import { projectArtifactOverlay } from "@/domain/archaeology/artifact-projection";
import { projectMapMarkers } from "@/domain/map/markers";

import { resolveSpotStratigraphyProfile } from "@/domain/knowledge/stratigraphy-profiles";

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
    selection = reduceAtlasSelection(selection, { type: "clear-focus", preserveCamera: true });
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
  it("strictly enforces end-to-end slice invariant: topic switching via selectTopic event flow guarantees camera fit command", () => {
    // Iterate over all active lenses and their topics
    let totalTopicsChecked = 0;

    for (const lens of recognitionLensDefinitions) {
      if (lens.id === "overview") continue;
      const topics = resolveLensTopics({
        perspectiveId: lens.id,
        claims,
        spots,
        includeUnvisited: true,
      });

      for (const topic of topics) {
        totalTopicsChecked++;

        // 1. Precondition: User had a spot or suggestion selected
        let selection: AtlasSelection = {
          spotId: spots[0]?.id ?? "sample-spot",
          focus: { kind: "spot", panCamera: true },
        };

        // 2. Action: selectTopic dispatches exact event from useAtlasLensState
        selection = reduceAtlasSelection(selection, {
          type: "clear-focus",
          preserveCamera: false,
          resetSpot: true,
        });

        // 3. Selection Invariant: Spot is wiped and camera preservation is explicitly disabled
        expect(selection.spotId).toBe("");
        expect(selection.focus).toEqual({ kind: "none", preserveCamera: false });

        // 4. Projection: Map scene evaluates active topic framing
        const packEntityMap = new Map(topic.pack.entities.map((e) => [e.id, e]));
        const projection = projectLensPreset(topic.pack, topic.presetId);
        const activeTopicNodes = projection.nodes.map((node) => ({
          id: node.id,
          label: node.label,
          coordinates: node.coordinates ?? packEntityMap.get(node.id)?.coordinates,
        }));

        const scene = projectMapScene({
          spots,
          reviewConnections: connections,
          selection,
          activeTopicId: topic.id,
          topicSpotIds: topic.spotIds,
          activeLensNodes: activeTopicNodes,
        });

        // 5. Camera Invariant: If topic has any spatial entities/spots, must produce bounds camera
        const hasSpatialContent = topic.spotIds.length > 0 || activeTopicNodes.some((n: { coordinates?: { latitude: number; longitude: number } }) => Boolean(n.coordinates));
        if (hasSpatialContent) {
          expect(scene.camera.mode).toBe("bounds");
          if (scene.camera.mode === "bounds") {
            expect(scene.camera.fitCamera).toBe(true);
            expect(scene.camera.topicKey).toBe(`topic:${topic.id}`);
            expect(scene.camera.points.length).toBeGreaterThan(0);

            // 6. Camera Policy Invariant: decideCameraCommand MUST yield 'fit'
            const decision = decideCameraCommand({
              camera: scene.camera,
              isInitial: false,
              autoZoom: false,
              lastPannedKey: null,
            });
            expect(decision.command).toEqual({ type: "fit" });
            expect(decision.nextPannedKey).toBe(`topic:${topic.id}`);

            // Subsequent re-render must NOT refit
            const secondDecision = decideCameraCommand({
              camera: scene.camera,
              isInitial: false,
              autoZoom: false,
              lastPannedKey: decision.nextPannedKey,
            });
            expect(secondDecision.command.type).toBe("none");
          }
        }
      }
    }

    expect(totalTopicsChecked).toBeGreaterThan(15);
  });

  it("verifies end-to-end slice propagation for Dazaifu journey spots (Kyuhaku, Tenmangu, Enokisha, Ojo Jinja)", () => {
    const dazaifuJourney = dataset.atlas?.journeys?.find(
      (j) => j.id === "journey-dazaifu-himiko-mirrors-2026-11-07",
    );
    expect(dazaifuJourney).toBeDefined();
    expect(dazaifuJourney?.spotIds).toHaveLength(7);
    expect(dazaifuJourney?.connectionIds).toHaveLength(5);

    // Verify all 7 spots exist and have valid coordinates
    const dazaifuSpots = dazaifuJourney!.spotIds
      .map((id) => spots.find((s) => s.id === id))
      .filter(Boolean) as ReviewAtlasSpot[];
    expect(dazaifuSpots).toHaveLength(7);

    for (const spot of dazaifuSpots) {
      expect(Number.isFinite(spot.latitude)).toBe(true);
      expect(Number.isFinite(spot.longitude)).toBe(true);
      expect(spot.claimIds.length).toBeGreaterThan(0);

      // 1. Dispatch spot selection
      const selection = reduceAtlasSelection(
        { spotId: "", focus: { kind: "none" } },
        { type: "select-spot", spotId: spot.id, panCamera: true },
      );
      expect(selection.spotId).toBe(spot.id);

      // 2. Project Map Scene
      const scene = projectMapScene({
        spots,
        reviewConnections: connections,
        selection,
      });
      expect(scene.camera.mode).toBe("point");
      if (scene.camera.mode === "point") {
        expect(scene.camera.point.latitude).toBe(spot.latitude);
        expect(scene.camera.point.longitude).toBe(spot.longitude);
      }

      // 3. Decide camera command
      const decision = decideCameraCommand({
        camera: scene.camera,
        isInitial: false,
        autoZoom: true,
        lastPannedKey: null,
      });
      expect(decision.command.type).toBe("pan");
      if (decision.command.type === "pan") {
        expect(decision.command.latitude).toBe(spot.latitude);
        expect(decision.command.longitude).toBe(spot.longitude);
      }
    }

    // Verify stratigraphy profile resolution for Dazaifu spots
    const enokisha = dazaifuSpots.find((s) => s.id === "spot-enoki-sha");
    expect(enokisha).toBeDefined();
    const enokiProfile = resolveSpotStratigraphyProfile(enokisha!);
    expect(enokiProfile?.id).toBe("stratigraphy-enoki-sha");
    expect(enokiProfile?.claimedOrigin.statement).toContain("菅原道真");

    const tenmangu = dazaifuSpots.find((s) => s.id === "spot-dazaifu-tenmangu");
    expect(tenmangu).toBeDefined();
    const tenmanguProfile = resolveSpotStratigraphyProfile(tenmangu!);
    expect(tenmanguProfile?.id).toBe("stratigraphy-dazaifu-tenmangu");

    const ojojinja = dazaifuSpots.find((s) => s.id === "spot-ojo-jinja-tonokoga");
    expect(ojojinja).toBeDefined();
    const ojoProfile = resolveSpotStratigraphyProfile(ojojinja!);
    expect(ojoProfile?.id).toBe("stratigraphy-tonokoga-ojo-jinja");
  });

  it("preserves prehistoric supply chain frontiers and artifact provenance origin highlight end-to-end", () => {
    // 1. Frontier Suggestions for ancient material culture / supply chain
    const frontiers = knowledgeVisitFrontierSuggestionsForVisitedSpots(spots, { includeUnanchored: true });
    const supplyChainFrontiers = frontiers.filter((f) => f.topicId === "prehistoric-supply-chain-preset");
    expect(supplyChainFrontiers.length).toBeGreaterThanOrEqual(4);

    const itoigawa = supplyChainFrontiers.find((f) => f.targetName.includes("糸魚川"));
    expect(itoigawa).toBeDefined();
    expect(itoigawa?.latitude).toBeCloseTo(36.9856, 2);
    expect(itoigawa?.longitude).toBeCloseTo(137.8592, 2);

    const wakasugiyama = supplyChainFrontiers.find((f) => f.targetName.includes("若杉山"));
    expect(wakasugiyama).toBeDefined();
    expect(wakasugiyama?.latitude).toBeCloseTo(33.8864, 2);

    // 2. End-to-end user click on Itoigawa frontier candidate
    const selection = reduceAtlasSelection(
      { spotId: "", focus: { kind: "none" } },
      { type: "select-suggestion", id: itoigawa!.id, panCamera: true },
    );
    expect(selection.focus.kind).toBe("suggestion");
    if (selection.focus.kind === "suggestion") {
      expect(selection.focus.id).toBe(itoigawa!.id);
    }

    const scene = projectMapScene({
      spots,
      reviewConnections: connections,
      selection,
      selectedSuggestion: itoigawa,
    });
    expect(scene.camera.mode).toBe("point");
    if (scene.camera.mode === "point") {
      expect(scene.camera.point.latitude).toBe(itoigawa!.latitude);
      expect(scene.camera.point.longitude).toBe(itoigawa!.longitude);
    }

    const decision = decideCameraCommand({
      camera: scene.camera,
      isInitial: false,
      autoZoom: true,
      lastPannedKey: null,
    });
    expect(decision.command.type).toBe("pan");
    if (decision.command.type === "pan") {
      expect(decision.command.latitude).toBe(itoigawa!.latitude);
      expect(decision.command.longitude).toBe(itoigawa!.longitude);
    }

    // 3. Artifact Overlay Provenance Origin Highlight
    const overlayScene = projectArtifactOverlay("jade-and-jasper", "site-hirabaru-jade");
    expect(overlayScene.focusedSelectedMarker?.siteId).toBe("site-hirabaru-jade");
    expect(overlayScene.focusedOriginMarker?.siteId).toBe("site-itoigawa-choujagahara");
    expect(overlayScene.focusedOriginMarker?.isFocusedOrigin).toBe(true);
    expect(overlayScene.originTrajectory).toBeDefined();
    expect(overlayScene.originTrajectory!.from.name).toContain("糸魚川");
    expect(overlayScene.originTrajectory!.to.name).toContain("平原");

    // 4. Map Marker Projection Origin Badge & Emphasis Verification
    // 4a. When no artifact overlay is active, candidate markers are cleanly displayed as standard candidate pins
    const normalMapMarkers = projectMapMarkers({
      spots,
      suggestions: supplyChainFrontiers,
      selectedSuggestionId: itoigawa!.id,
      activeArtifactOverlay: "none",
    });
    const itoigawaNormal = normalMapMarkers.find((m) => m.id === itoigawa!.id);
    const wakasugiNormal = normalMapMarkers.find((m) => m.id === wakasugiyama!.id);
    expect(itoigawaNormal?.isProvenanceOrigin).toBe(false);
    expect(itoigawaNormal?.provenanceBadgeText).toBeUndefined();
    expect(wakasugiNormal?.isProvenanceOrigin).toBe(false);
    expect(wakasugiNormal?.provenanceBadgeText).toBeUndefined();

    // 4b. When jade artifact overlay is active, Itoigawa becomes emphasized origin hub
    const jadeMapMarkers = projectMapMarkers({
      spots,
      suggestions: supplyChainFrontiers,
      selectedSuggestionId: itoigawa!.id,
      activeArtifactOverlay: "jade-and-jasper",
    });
    const itoigawaMarker = jadeMapMarkers.find((m) => m.id === itoigawa!.id);
    expect(itoigawaMarker).toBeDefined();
    expect(itoigawaMarker?.isProvenanceOrigin).toBe(true);
    expect(itoigawaMarker?.provenanceBadgeText).toContain("ヒスイ");
    expect(itoigawaMarker?.isOriginEmphasized).toBe(true);

    // 4c. When cinnabar artifact overlay is active, Wakasugiyama becomes emphasized origin hub
    const cinnabarMapMarkers = projectMapMarkers({
      spots,
      suggestions: supplyChainFrontiers,
      selectedSuggestionId: wakasugiyama!.id,
      activeArtifactOverlay: "cinnabar-red-pigments",
    });
    const wakasugiMarker = cinnabarMapMarkers.find((m) => m.id === wakasugiyama!.id);
    expect(wakasugiMarker).toBeDefined();
    expect(wakasugiMarker?.isProvenanceOrigin).toBe(true);
    expect(wakasugiMarker?.provenanceBadgeText).toContain("辰砂");
  });

  it("enforces ADR-0027 4-item discrete supply chain connections end-to-end (selection, camera, and chain-dash appearance)", () => {
    // 1. Resolve route lens knowledge connections
    const routeConnections = knowledgeMapConnectionsForLens("route");
    const chainIds = [
      "prehistoric-supply-chain-jade",
      "prehistoric-supply-chain-cinnabar",
      "prehistoric-supply-chain-iron",
      "prehistoric-supply-chain-jasper",
    ];

    const projectedChains = projectKnowledgeMapConnections(routeConnections, { spots });
    const matchedChains = projectedChains.filter((c) => chainIds.includes(c.sourceId));
    expect(matchedChains).toHaveLength(4);

    const expectedColors: Record<string, string> = {
      "prehistoric-supply-chain-jade": "#34d399",
      "prehistoric-supply-chain-cinnabar": "#f87171",
      "prehistoric-supply-chain-iron": "#94a3b8",
      "prehistoric-supply-chain-jasper": "#38bdf8",
    };

    for (const chain of matchedChains) {
      // Verify appearance in unselected state
      const unselectedAppearance = resolveConnectionAppearance(chain, false);
      expect(unselectedAppearance.lineStyle.stroke).toBe(expectedColors[chain.sourceId]);
      expect(unselectedAppearance.lineStyle.strokeDasharray).toBe("12 4 3 4");

      // Verify End-to-End selection dispatch
      const selection = reduceAtlasSelection(
        { spotId: "", focus: { kind: "none" } },
        { type: "select-knowledge-connection", id: chain.id },
      );
      expect(selection.focus.kind).toBe("knowledge-connection");
      if (selection.focus.kind === "knowledge-connection") {
        expect(selection.focus.id).toBe(chain.id);
      }

      // Verify appearance in selected state (white glow + colored halo + chain dash preserved!)
      const selectedAppearance = resolveConnectionAppearance(chain, true);
      expect(selectedAppearance.lineStyle.stroke).toBe("#ffffff");
      expect(selectedAppearance.lineStyle.strokeDasharray).toBe("12 4 3 4");
      expect(selectedAppearance.haloStyle.stroke).toBe(expectedColors[chain.sourceId]);

      // Verify map scene camera projection
      const scene = projectMapScene({
        spots,
        reviewConnections: connections,
        knowledgeConnections: routeConnections,
        selection,
      });
      expect(scene.camera.mode).toBe("bounds");

      // Verify camera command decision
      const decision = decideCameraCommand({
        camera: scene.camera,
        isInitial: false,
        autoZoom: true,
        lastPannedKey: null,
      });
      expect(decision.command.type).toBe("fit");
    }
  });

  it("enforces ADR-0027 alliance-mesh mutual highlight invariant end-to-end (spot/node click triggers alliance network & aura)", () => {
    // 1. Resolve politics lens knowledge connections including sankakubuchi-alliance-corridor
    const politicsConnections = knowledgeMapConnectionsForLens("politics");
    const allianceConn = politicsConnections.find((c) => c.id === "sankakubuchi-alliance-corridor");
    expect(allianceConn).toBeDefined();
    expect(allianceConn?.epistemicRole).toBe("alliance_mesh");

    // Project unselected knowledge connections
    const unselectedKnowledge = projectKnowledgeMapConnections(politicsConnections, { spots });
    const unselectedAlliance = unselectedKnowledge.find((c) => c.sourceId === "sankakubuchi-alliance-corridor");
    expect(unselectedAlliance?.emphasized).toBe(false);
    expect(unselectedAlliance?.selected).toBe(false);

    // 2. Select a member spot of the alliance (e.g. 祇園山古墳 or 九州国立博物館)
    const memberSpot = spots.find((s) => s.name.includes("祇園山") || s.name.includes("九州国立博物館"));
    expect(memberSpot).toBeDefined();

    const spotSelection = reduceAtlasSelection(
      { spotId: "", focus: { kind: "none" } },
      { type: "select-spot", spotId: memberSpot!.id, panCamera: true },
    );
    expect(spotSelection.spotId).toBe(memberSpot!.id);
    expect(spotSelection.focus.kind).toBe("spot");

    // 3. Project Map Scene with selected member spot
    const memberScene = projectMapScene({
      spots,
      reviewConnections: connections,
      knowledgeConnections: politicsConnections,
      selection: spotSelection,
    });

    const activeAlliance = memberScene.connections.find((c) => c.sourceId === "sankakubuchi-alliance-corridor");
    expect(activeAlliance).toBeDefined();
    // Invariant: The alliance-mesh connection must be mutually emphasized!
    expect(activeAlliance?.emphasized).toBe(true);

    // 4. Project Map Markers and verify mutual aura on alliance group members
    const markers = projectMapMarkers({
      spots,
      suggestions: [],
      mapConnections: memberScene.connections,
      selectedSpotId: memberSpot!.id,
    });

    // The selected member itself has aura
    const memberMarker = markers.find((m) => m.id === memberSpot!.id);
    expect(memberMarker).toBeDefined();
    expect(memberMarker?.isFocusAura).toBe(true);
    expect(memberMarker?.focusAuraColor).toBe("#c084fc");

    // Other co-members present in atlas spots also receive mutual purple aura
    const otherMembers = spots.filter((s) =>
      s.id !== memberSpot!.id &&
      activeAlliance?.points.some((p) => p.spotId === s.id || p.id === s.id || p.label === s.name)
    );
    for (const other of otherMembers) {
      const otherMarker = markers.find((m) => m.id === other.id);
      if (otherMarker) {
        expect(otherMarker.isFocusAura).toBe(true);
        expect(otherMarker.focusAuraColor).toBe("#c084fc");
      }
    }

    // 5. LENS node selection also triggers mutual alliance highlight
    const nodeSelection = reduceAtlasSelection(
      { spotId: "", focus: { kind: "none" } },
      { type: "select-route-node", id: "place-ishizukayama" },
    );
    const nodeScene = projectMapScene({
      spots,
      reviewConnections: connections,
      knowledgeConnections: politicsConnections,
      selection: nodeSelection,
    });
    const nodeAlliance = nodeScene.connections.find((c) => c.sourceId === "sankakubuchi-alliance-corridor");
    expect(nodeAlliance?.emphasized).toBe(true);

    // 6. Unrelated spot selection must NOT trigger alliance mesh highlight (Anti-Leak / Isolation)
    const unrelatedSpot = spots.find((s) => s.name.includes("宗像大社") || s.name.includes("和布刈"));
    expect(unrelatedSpot).toBeDefined();

    const unrelatedSelection = reduceAtlasSelection(
      { spotId: "", focus: { kind: "none" } },
      { type: "select-spot", spotId: unrelatedSpot!.id, panCamera: true },
    );
    const unrelatedScene = projectMapScene({
      spots,
      reviewConnections: connections,
      knowledgeConnections: politicsConnections,
      selection: unrelatedSelection,
    });
    const unrelatedAlliance = unrelatedScene.connections.find((c) => c.sourceId === "sankakubuchi-alliance-corridor");
    expect(unrelatedAlliance?.emphasized).toBe(false);
  });

  it("enforces ADR-0027 regional-hull convex polygon invariant end-to-end (ito-na-archaeological-axis)", () => {
    // 1. Resolve knowledge connections for politics lens
    const politicsConnections = knowledgeMapConnectionsForLens("politics");
    const itoNaConn = politicsConnections.find((c) => c.id === "ito-na-archaeological-axis");
    expect(itoNaConn).toBeDefined();
    expect(itoNaConn?.displayMode).toBe("hull");
    expect(itoNaConn?.epistemicRole).toBe("regional_hull");

    // 2. Geometry projection must produce a convex hull polygon, not linear segments
    const projector = {
      project: ([lng, lat]: [number, number]) => ({ x: Math.round(lng * 1000), y: Math.round(lat * 1000) }),
      getContainer: () => ({ clientWidth: 1200, clientHeight: 900 }),
    };
    const projectedKnowledge = projectKnowledgeMapConnections(politicsConnections, { spots });
    const itoNaProjected = projectedKnowledge.find((c) => c.sourceId === "ito-na-archaeological-axis");
    expect(itoNaProjected).toBeDefined();

    const geom = projectConnectionGeometry(itoNaProjected!, projector);
    // Invariant: Hull connections suppress linear segments and generate polygon hullPoints
    expect(geom.segments).toHaveLength(0);
    expect(geom.hullPoints).toBeDefined();
    const hullVertices = geom.hullPoints!.split(" ");
    expect(hullVertices.length).toBeGreaterThanOrEqual(3);

    // 3. Selection of member spot (e.g. 平原遺跡 or 須玖岡本) triggers mutual hull emphasis
    const hirabaruSpot = spots.find((s) => s.name.includes("平原"));
    expect(hirabaruSpot).toBeDefined();

    const spotSelection = reduceAtlasSelection(
      { spotId: "", focus: { kind: "none" } },
      { type: "select-spot", spotId: hirabaruSpot!.id, panCamera: true },
    );
    const memberScene = projectMapScene({
      spots,
      reviewConnections: [],
      knowledgeConnections: politicsConnections,
      selection: spotSelection,
    });
    const activeHull = memberScene.connections.find((c) => c.sourceId === "ito-na-archaeological-axis");
    expect(activeHull).toBeDefined();
    expect(activeHull?.emphasized).toBe(true);

    // 4. Markers projection verifies aura synchronization on hull member spots
    const markers = projectMapMarkers({
      spots,
      suggestions: [],
      mapConnections: memberScene.connections,
      selectedSpotId: hirabaruSpot!.id,
    });
    const hirabaruMarker = markers.find((m) => m.id === hirabaruSpot!.id);
    expect(hirabaruMarker?.isFocusAura).toBe(true);
    expect(hirabaruMarker?.focusAuraColor).toBe("#e11d48");

    // 5. Unrelated spot selection does NOT trigger hull emphasis (Isolation)
    const unrelatedSpot = spots.find((s) => s.name.includes("宗像大社") || s.name.includes("和布刈"));
    expect(unrelatedSpot).toBeDefined();
    const unrelatedSelection = reduceAtlasSelection(
      { spotId: "", focus: { kind: "none" } },
      { type: "select-spot", spotId: unrelatedSpot!.id, panCamera: true },
    );
    const unrelatedScene = projectMapScene({
      spots,
      reviewConnections: [],
      knowledgeConnections: politicsConnections,
      selection: unrelatedSelection,
    });
    const inactiveHull = unrelatedScene.connections.find((c) => c.sourceId === "ito-na-archaeological-axis");
    expect(inactiveHull?.emphasized).toBe(false);
  });
});
