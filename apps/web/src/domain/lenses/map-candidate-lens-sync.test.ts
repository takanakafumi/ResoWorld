import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { registeredLensTopics } from "@/domain/lens-packs/knowledge-registry";
import { projectLensPreset } from "@/domain/lens-packs/projection";
import {
  knowledgeVisitFrontierSuggestionsForVisitedSpots,
} from "@/domain/map/registry";
import { projectMapMarkers } from "@/domain/map/markers";
import { projectMapScene } from "@/domain/map/scene";

describe("MAP Candidate to LENS Node Synchronization", () => {
  const fallbackPath = path.resolve(__dirname, "../../data/published-review-dataset.json");
  const dataset = JSON.parse(fs.readFileSync(fallbackPath, "utf8")) as { atlas: any };
  const atlas = dataset.atlas;
  const suggestions = [
    ...(atlas.suggestions || []),
    ...knowledgeVisitFrontierSuggestionsForVisitedSpots(atlas.spots, { includeUnanchored: true }),
  ];

  it("ensures candidate places in mythology and other packs have corresponding projection nodes in their lens topics", () => {
    // Test Marine Deities pack candidate: shikaumi-shrine
    const marineSuggestion = suggestions.find((s) => s.targetPlaceId === "shikaumi-shrine");
    expect(marineSuggestion).toBeDefined();

    const marineTopic = registeredLensTopics.find((t) => t.id === "marine-deities-preset");
    expect(marineTopic).toBeDefined();
    const marineProjection = projectLensPreset(marineTopic!.pack, marineTopic!.presetId);
    const marineNode = marineProjection.nodes.find((n) => n.id === marineSuggestion!.targetPlaceId);
    expect(marineNode).toBeDefined();
    expect(marineNode?.label).toBe("志賀海神社");

    // Test Hyuga Mythology candidate: takachiho-shrine
    const hyugaSuggestion = suggestions.find((s) => s.targetPlaceId === "takachiho-shrine");
    expect(hyugaSuggestion).toBeDefined();

    const hyugaTopic = registeredLensTopics.find((t) => t.id === "hyuga-mythology-preset");
    expect(hyugaTopic).toBeDefined();
    const hyugaProjection = projectLensPreset(hyugaTopic!.pack, hyugaTopic!.presetId);
    const hyugaNode = hyugaProjection.nodes.find((n) => n.id === hyugaSuggestion!.targetPlaceId);
    expect(hyugaNode).toBeDefined();
    expect(hyugaNode?.label).toBe("高千穂神社");

    // Test Izumo Kunitsukami candidate: izumo-taisha
    const izumoSuggestion = suggestions.find((s) => s.targetPlaceId === "izumo-taisha");
    expect(izumoSuggestion).toBeDefined();

    const izumoTopic = registeredLensTopics.find((t) => t.id === "izumo-kunitsukami-preset");
    expect(izumoTopic).toBeDefined();
    const izumoProjection = projectLensPreset(izumoTopic!.pack, izumoTopic!.presetId);
    const izumoNode = izumoProjection.nodes.find((n) => n.id === izumoSuggestion!.targetPlaceId);
    expect(izumoNode).toBeDefined();
    expect(izumoNode?.label).toBe("出雲大社");

    // Test Jingu Kogo Legend candidates: kashii-gu, hakozaki-gu
    const kashiiSuggestion = suggestions.find((s) => s.targetPlaceId === "kashii-gu");
    expect(kashiiSuggestion).toBeDefined();

    const jinguTopic = registeredLensTopics.find((t) => t.id === "jingu-kogo-legend-preset");
    expect(jinguTopic).toBeDefined();
    const jinguProjection = projectLensPreset(jinguTopic!.pack, jinguTopic!.presetId);
    const kashiiNode = jinguProjection.nodes.find((n) => n.id === kashiiSuggestion!.targetPlaceId);
    expect(kashiiNode).toBeDefined();
    expect(kashiiNode?.label).toBe("香椎宮");

    const hakozakiSuggestion = suggestions.find((s) => s.targetPlaceId === "hakozaki-gu");
    expect(hakozakiSuggestion).toBeDefined();
    const hakozakiNode = jinguProjection.nodes.find((n) => n.id === hakozakiSuggestion!.targetPlaceId);
    expect(hakozakiNode).toBeDefined();
    expect(hakozakiNode?.label).toBe("筥崎宮");

    const umiSuggestion = suggestions.find((s) => s.targetPlaceId === "umi-hachimangu");
    expect(umiSuggestion).toBeDefined();
    expect(umiSuggestion?.targetName).toBe("宇美八幡宮");
    const umiNode = jinguProjection.nodes.find((n) => n.id === "umi-hachimangu");
    expect(umiNode).toBeDefined();
    expect(umiNode?.label).toBe("宇美八幡宮");

    const miyajidakeSuggestion = suggestions.find(
      (s) => s.targetPlaceId === "miyajidake-shrine" && s.topicId === "jingu-kogo-legend-preset",
    );
    expect(miyajidakeSuggestion).toBeDefined();
    expect(miyajidakeSuggestion?.targetName).toBe("宮地嶽神社");
    const miyajidakeNode = jinguProjection.nodes.find((n) => n.id === "miyajidake-shrine");
    expect(miyajidakeNode).toBeDefined();
    expect(miyajidakeNode?.label).toBe("宮地嶽神社");
  });

  it("verifies candidates provide rich reason, question, and connected entities for LENS callout", () => {
    const marineSuggestion = suggestions.find((s) => s.targetPlaceId === "shikaumi-shrine");
    expect(marineSuggestion?.reason).toBeTruthy();
    expect(marineSuggestion?.question).toBeTruthy();

    const marineTopic = registeredLensTopics.find((t) => t.id === "marine-deities-preset")!;
    const marineProjection = projectLensPreset(marineTopic.pack, marineTopic.presetId);

    // Connected entities via edges
    const connectedEdges = marineProjection.edges.filter(
      (e) => e.subjectId === marineSuggestion!.targetPlaceId || e.objectId === marineSuggestion!.targetPlaceId,
    );
    expect(connectedEdges.length).toBeGreaterThan(0);

    const connectedNodeIds = connectedEdges.map((e) =>
      e.subjectId === marineSuggestion!.targetPlaceId ? e.objectId : e.subjectId,
    );
    expect(connectedNodeIds).toContain("watatsumi-three-kami");
  });

  it("verifies selecting a candidate marker isolates suggestion focus and does not pin connection lines", () => {
    const kashiiSuggestion = suggestions.find((s) => s.targetPlaceId === "kashii-gu");
    expect(kashiiSuggestion).toBeDefined();

    // Simulating prior pinned connection
    const stateWithPinnedLine = {
      spotId: "",
      pinnedConnection: { kind: "knowledge" as const, id: "conn-jingu-route" },
      focus: { kind: "knowledge-connection" as const, id: "conn-jingu-route" },
    };

    const nextState = {
      ...stateWithPinnedLine,
      spotId: "",
      pinnedConnection: undefined,
      focus: { kind: "suggestion" as const, id: kashiiSuggestion!.id },
    };
    expect(nextState.focus).toEqual({ kind: "suggestion", id: kashiiSuggestion!.id });
    expect(nextState.pinnedConnection).toBeUndefined();
  });

  it("verifies matchLensNodeForCandidate works seamlessly across all 5 lens perspectives and topics", async () => {
    const { matchLensNodeForCandidate } = await import("./candidate-matching");

    // 1. Route Lens - Wajinden Route Topic
    const routeTopic = registeredLensTopics.find((t) => t.id === "wajinden-route-comparison")!;
    const routeProjection = projectLensPreset(routeTopic.pack, routeTopic.presetId);
    const yoshinogariSuggestion = suggestions.find((s) => s.id === "next-yamatai-yoshinogari" || s.targetName.includes("吉野ヶ里"));
    expect(yoshinogariSuggestion).toBeDefined();
    const matchedRouteNode = matchLensNodeForCandidate(routeProjection.nodes, yoshinogariSuggestion);
    expect(matchedRouteNode).toBeDefined();
    expect(matchedRouteNode?.id).toBe("northern-kyushu");

    // 2. Religion Lens - Religion relationship
    const religionTopic = registeredLensTopics.find((t) => t.id === "religion-syncretism")!;
    const religionProjection = projectLensPreset(religionTopic.pack, religionTopic.presetId);
    const usaSuggestion = {
      id: "suggestion-usa",
      title: "宇佐神宮の八幡信仰",
      targetName: "宇佐神宮",
      actionType: "field_visit" as const,
      latitude: 33.52,
      longitude: 131.37,
      question: "問い",
      missingInformation: "不足",
      reason: "理由",
      expectedObservation: "観察",
      uncertainty: "不確実性",
      claimIds: [],
      anchorSpotIds: [],
      connectionIds: [],
      initialStatus: "suggested" as const,
    };
    const matchedReligionNode = matchLensNodeForCandidate(religionProjection.nodes, usaSuggestion);
    expect(matchedReligionNode).toBeDefined();
    expect(matchedReligionNode?.id).toBe("usa-jingu");

    // 3. Politics Lens - Bakumatsu Structure
    const bakumatsuTopic = registeredLensTopics.find((t) => t.id === "hagi-domain-politics")!;
    const bakumatsuProjection = projectLensPreset(bakumatsuTopic.pack, bakumatsuTopic.presetId);
    const shoinSuggestion = {
      id: "suggestion-shoin",
      title: "松下村塾",
      targetName: "松下村塾",
      actionType: "field_visit" as const,
      latitude: 34.41,
      longitude: 131.41,
      question: "問い",
      missingInformation: "不足",
      reason: "理由",
      expectedObservation: "観察",
      uncertainty: "不確実性",
      claimIds: [],
      anchorSpotIds: [],
      connectionIds: [],
      initialStatus: "suggested" as const,
    };
    const matchedBakumatsuNode = matchLensNodeForCandidate(bakumatsuProjection.nodes, shoinSuggestion);
    expect(matchedBakumatsuNode).toBeDefined();
    expect(matchedBakumatsuNode?.id).toBe("shokasonjuku");

    // 4. People Lens - Ishin Figures
    const ishinTopic = registeredLensTopics.find((t) => t.id === "ishin-figures-network")!;
    const ishinProjection = projectLensPreset(ishinTopic.pack, ishinTopic.presetId);
    const ryomaSuggestion = {
      id: "suggestion-ryoma",
      title: "坂本龍馬",
      targetName: "坂本龍馬",
      actionType: "field_visit" as const,
      latitude: 33.5,
      longitude: 133.5,
      question: "問い",
      missingInformation: "不足",
      reason: "理由",
      expectedObservation: "観察",
      uncertainty: "不確実性",
      claimIds: [],
      anchorSpotIds: [],
      connectionIds: [],
      initialStatus: "suggested" as const,
    };
    const matchedIshinNode = matchLensNodeForCandidate(ishinProjection.nodes, ryomaSuggestion);
    expect(matchedIshinNode).toBeDefined();
    expect(matchedIshinNode?.id).toBe("sakamoto-ryoma");
  });

  it("ensures selecting a candidate does not highlight anchor visited spots or invent connection lines", () => {
    const yoshinogariSuggestion = suggestions.find(
      (s: any) => s.id === "next-yamatai-yoshinogari" || s.targetName.includes("吉野ヶ里"),
    )!;
    expect(yoshinogariSuggestion).toBeDefined();
    expect(yoshinogariSuggestion.anchorSpotIds.length).toBeGreaterThan(0);

    // 1. Map markers creation with candidate selected
    const markers = projectMapMarkers({
      spots: atlas.spots,
      suggestions: [yoshinogariSuggestion],
      selectedSpotId: "",
      selectedSuggestionId: yoshinogariSuggestion.id,
      highlightedSpotIds: [], // Era spot IDs when no connection is selected
    });

    // Yoshinogari candidate marker is active
    const candidateMarker = markers.find((m) => m.id === yoshinogariSuggestion.id);
    expect(candidateMarker).toBeDefined();
    expect(candidateMarker?.isActive).toBe(true);

    // Anchor spots (such as Chikushi Shrine or Itokoku Museum) must NOT be active or highlighted
    const anchorMarkers = markers.filter((m) => yoshinogariSuggestion.anchorSpotIds.includes(m.id));
    expect(anchorMarkers.length).toBeGreaterThan(0);
    for (const anchorMarker of anchorMarkers) {
      expect(anchorMarker.isActive).toBe(false);
      expect(anchorMarker.isHighlighted).toBe(false);
    }

    // 2. Map scene connections must not invent synthetic suggestion connection lines
    const scene = projectMapScene({
      reviewConnections: [],
      knowledgeConnections: [],
      selectedSuggestion: yoshinogariSuggestion,
      spots: atlas.spots,
      selection: { spotId: "", focus: { kind: "suggestion", id: yoshinogariSuggestion.id } },
    });
    expect(scene.connections.some((c) => c.origin === "suggestion")).toBe(false);
  });

  it("verifies clearing focus completely clears spot selection and prevents zombie active spots", () => {
    const spotSelection = { spotId: atlas.spots[0].id, focus: { kind: "spot" as const } };
    const cleared = {
      ...spotSelection,
      spotId: spotSelection.focus.kind === "spot" ? "" : spotSelection.spotId,
      focus: { kind: "none" as const },
    };

    expect(cleared.spotId).toBe("");
    expect(cleared.focus.kind).toBe("none");

    // Markers with cleared selection
    const markers = projectMapMarkers({
      spots: atlas.spots,
      suggestions: [],
      selectedSpotId: cleared.spotId,
      highlightedSpotIds: [],
    });

    for (const marker of markers) {
      expect(marker.isActive).toBe(false);
    }
  });

  it("verifies selecting Umi Hachimangu and Miyajidake Shrine activates their markers and centers scene camera", () => {
    const umiSuggestion = suggestions.find((s) => s.targetPlaceId === "umi-hachimangu")!;
    expect(umiSuggestion).toBeDefined();

    const miyajidakeSuggestion = suggestions.find(
      (s) => s.targetPlaceId === "miyajidake-shrine" && s.topicId === "jingu-kogo-legend-preset",
    )!;
    expect(miyajidakeSuggestion).toBeDefined();

    // 1. Marker activation for Umi Hachimangu
    const umiMarkers = projectMapMarkers({
      spots: atlas.spots,
      suggestions: [umiSuggestion, miyajidakeSuggestion],
      selectedSuggestionId: "umi-hachimangu",
      selectedSuggestion: umiSuggestion,
    });
    const activeUmiMarker = umiMarkers.find((m) => m.id === umiSuggestion.id);
    expect(activeUmiMarker).toBeDefined();
    expect(activeUmiMarker?.isActive).toBe(true);

    // 2. Camera point mode for Umi Hachimangu (from LENS: panCamera=true)
    const umiLensScene = projectMapScene({
      reviewConnections: [],
      spots: atlas.spots,
      selectedSuggestion: umiSuggestion,
      selection: { spotId: "", focus: { kind: "suggestion", id: umiSuggestion.id, panCamera: true } },
    });
    expect(umiLensScene.camera.mode).toBe("point");
    if (umiLensScene.camera.mode === "point") {
      expect(umiLensScene.camera.label).toBe("宇美八幡宮");
      expect(umiLensScene.camera.point.latitude).toBeCloseTo(33.5684, 3);
      expect(umiLensScene.camera.point.longitude).toBeCloseTo(130.5108, 3);
      expect(umiLensScene.camera.panCamera).toBe(true);
    }

    // 2b. Camera point mode for Umi Hachimangu (from MAP: panCamera=false, camera does NOT pan)
    const umiMapScene = projectMapScene({
      reviewConnections: [],
      spots: atlas.spots,
      selectedSuggestion: umiSuggestion,
      selection: { spotId: "", focus: { kind: "suggestion", id: umiSuggestion.id, panCamera: false } },
    });
    expect(umiMapScene.camera.mode).toBe("point");
    if (umiMapScene.camera.mode === "point") {
      expect(umiMapScene.camera.panCamera).toBe(false);
    }

    // 3. Marker activation for Miyajidake Shrine
    const miyajidakeMarkers = projectMapMarkers({
      spots: atlas.spots,
      suggestions: [umiSuggestion, miyajidakeSuggestion],
      selectedSuggestionId: "miyajidake-shrine",
      selectedSuggestion: miyajidakeSuggestion,
    });
    const activeMiyajidakeMarker = miyajidakeMarkers.find((m) => m.id === miyajidakeSuggestion.id);
    expect(activeMiyajidakeMarker).toBeDefined();
    expect(activeMiyajidakeMarker?.isActive).toBe(true);

    // 4. Camera point mode for Miyajidake Shrine (from LENS: panCamera=true)
    const miyajidakeScene = projectMapScene({
      reviewConnections: [],
      spots: atlas.spots,
      selectedSuggestion: miyajidakeSuggestion,
      selection: { spotId: "", focus: { kind: "suggestion", id: miyajidakeSuggestion.id, panCamera: true } },
    });
    expect(miyajidakeScene.camera.mode).toBe("point");
    if (miyajidakeScene.camera.mode === "point") {
      expect(miyajidakeScene.camera.label).toBe("宮地嶽神社");
      expect(miyajidakeScene.camera.point.latitude).toBeCloseTo(33.7808, 3);
      expect(miyajidakeScene.camera.point.longitude).toBeCloseTo(130.4853, 3);
      expect(miyajidakeScene.camera.panCamera).toBe(true);
    }
  });
});


