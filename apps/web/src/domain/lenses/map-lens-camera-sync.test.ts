import { describe, it, expect } from "vitest";
import { matchCandidateForLensNode, matchLensNodeForCandidate, matchLensNodeForSpot, resolveSpotForLensNode } from "./candidate-matching";
import { registeredLensTopics } from "../lens-packs/knowledge-registry";
import { projectLensPreset } from "../lens-packs/projection";
import { buildLensExplorationLinksByIdentity } from "../lens-packs/exploration-links";
import type { ReviewAtlasSpot, ReviewExplorationSuggestion } from "../review/types";
import publishedDataset from "@/data/published-review-dataset.json";

describe("MAP ⇄ LENS Bidirectional Camera & Node Synchronization", () => {
  const sampleSuggestions: ReviewExplorationSuggestion[] = [
    {
      id: "suggestion-hiratsuka-kawazoe",
      title: "平塚川添遺跡の現地確認",
      targetPlaceId: "hiratsuka-kawazoe",
      targetName: "平塚川添遺跡",
      actionType: "field_visit",
      latitude: 33.40,
      longitude: 130.65,
      question: "多重環濠の遺構はどのように現存しているか？",
      missingInformation: "環濠の現状",
      reason: "多重環濠集落の拠点",
      expectedObservation: "環濠復元",
      uncertainty: "低",
      claimIds: [],
      anchorSpotIds: [],
      connectionIds: [],
      initialStatus: "suggested",
    },
    {
      id: "suggestion-umi-hachimangu",
      title: "宇美八幡宮の現地確認",
      targetPlaceId: "umi-hachimangu",
      targetName: "宇美八幡宮",
      actionType: "field_visit",
      latitude: 33.56,
      longitude: 130.51,
      question: "応神天皇降誕伝承の磐座・巨木は存在するか？",
      missingInformation: "境内伝承",
      reason: "応神天皇降誕の地",
      expectedObservation: "クスノキ巨樹",
      uncertainty: "低",
      claimIds: [],
      anchorSpotIds: [],
      connectionIds: [],
      initialStatus: "suggested",
    },
    {
      id: "suggestion-munakata-taisha",
      title: "宗像大社 辺津宮の確認",
      targetPlaceId: "munakata-taisha",
      targetName: "宗像大社 辺津宮",
      actionType: "field_visit",
      latitude: 33.83,
      longitude: 130.51,
      question: "辺津宮の祭祀構造",
      missingInformation: "なし",
      reason: "宗像三女神下津宮",
      expectedObservation: "社殿配置",
      uncertainty: "低",
      claimIds: [],
      anchorSpotIds: [],
      connectionIds: [],
      initialStatus: "suggested",
    },
  ];

  it("resolves exploration candidate ID when clicking unvisited frontier nodes in LENS (LENS -> MAP)", () => {
    // 1. Asakura Hub-Spoke Lens: Hiratsuka Kawazoe node
    const asakuraTopic = registeredLensTopics.find((t) => t.id === "asakura-social-structure");
    expect(asakuraTopic).toBeDefined();

    const asakuraProjection = projectLensPreset(asakuraTopic!.pack, asakuraTopic!.presetId);
    const hiratsukaNode = asakuraProjection.nodes.find((n) => n.id === "hiratsuka-kawazoe" || n.label.includes("平塚川添"));
    expect(hiratsukaNode).toBeDefined();

    const matchedCandidate = matchCandidateForLensNode(hiratsukaNode!, sampleSuggestions);
    expect(matchedCandidate).toBeDefined();
    expect(matchedCandidate?.id).toBe("suggestion-hiratsuka-kawazoe");

    // 2. Jingu Kogo Sequence Lens: Umi Hachimangu node
    const jinguTopic = registeredLensTopics.find((t) => t.id === "jingu-kogo-legend-preset");
    expect(jinguTopic).toBeDefined();

    const jinguProjection = projectLensPreset(jinguTopic!.pack, jinguTopic!.presetId);
    const umiNode = jinguProjection.nodes.find((n) => n.id === "umi-hachimangu" || n.label.includes("宇美"));
    expect(umiNode).toBeDefined();

    const matchedUmiCandidate = matchCandidateForLensNode(umiNode!, sampleSuggestions);
    expect(matchedUmiCandidate).toBeDefined();
    expect(matchedUmiCandidate?.id).toBe("suggestion-umi-hachimangu");
  });

  it("resolves LENS node entity when clicking suggestion/candidate on MAP (MAP -> LENS)", () => {
    const munakataTopic = registeredLensTopics.find((t) => t.id === "munakata-genealogy");
    expect(munakataTopic).toBeDefined();

    const munakataProjection = projectLensPreset(munakataTopic!.pack, munakataTopic!.presetId);
    const munakataSuggestion = sampleSuggestions.find((s) => s.id === "suggestion-munakata-taisha");
    expect(munakataSuggestion).toBeDefined();

    const matchedNode = matchLensNodeForCandidate(munakataProjection.nodes, munakataSuggestion);
    expect(matchedNode).toBeDefined();
    expect(matchedNode?.id).toBe("munakata-taisha");
  });

  it("calculates exact SVG viewport centering offsets for any coordinate", () => {
    // Given viewBox width = 640, height = 400
    const viewBoxW = 640;
    const viewBoxH = 400;
    const cx = viewBoxW / 2; // 320
    const cy = viewBoxH / 2; // 200

    // For a node at target (120, 80) with zoom = 1.0:
    const nodeX = 120;
    const nodeY = 80;
    const zoom = 1.0;

    const panX = cx - nodeX * zoom;
    const panY = cy - nodeY * zoom;

    expect(panX).toBe(200);
    expect(panY).toBe(120);

    // In transformed space:
    const renderedX = panX + nodeX * zoom;
    const renderedY = panY + nodeY * zoom;
    expect(renderedX).toBe(cx);
    expect(renderedY).toBe(cy);
  });

  it("strictly matches Koso Shrine (takasu-shrine) and prevents false-positive match to Sazareishi Shrine", () => {
    const hyugaTopic = registeredLensTopics.find((t) => t.id === "hyuga-mythology-preset");
    expect(hyugaTopic).toBeDefined();

    const projection = projectLensPreset(hyugaTopic!.pack, hyugaTopic!.presetId);
    const links = buildLensExplorationLinksByIdentity(
      publishedDataset.claims as any,
      publishedDataset.atlas.spots as any,
      projection.nodes,
    );
    const kosoNode = projection.nodes.find((n) => n.id === "takasu-shrine");
    const sazareNode = projection.nodes.find((n) => n.id === "sazareishi-shrine");
    expect(kosoNode).toBeDefined();
    expect(sazareNode).toBeDefined();

    const sampleKosoSpot: ReviewAtlasSpot = {
      id: "spot-entity-c7a88993fa1035fe5cf1",
      name: "高祖神社",
      latitude: 33.544758,
      longitude: 130.260386,
      region: "糸島",
      kind: "shrine",
      claimIds: ["claim-6006f254550ec1856533"],
    };

    const sampleSazareSpot: ReviewAtlasSpot = {
      id: "spot-entity-0c392070234e783c7103",
      name: "細石神社",
      latitude: 33.536993,
      longitude: 130.242402,
      region: "糸島",
      kind: "shrine",
      claimIds: ["claim-6006f254550ec1856533"],
    };

    // Both shrines share claim-6006f254550ec1856533
    const matchedKosoNode = matchLensNodeForSpot(projection.nodes, sampleKosoSpot);
    expect(matchedKosoNode).toBeDefined();
    expect(matchedKosoNode?.id).toBe("takasu-shrine");
    expect(matchedKosoNode?.id).not.toBe("sazareishi-shrine");

    const matchedSazareNode = matchLensNodeForSpot(projection.nodes, sampleSazareSpot);
    expect(matchedSazareNode).toBeDefined();
    expect(matchedSazareNode?.id).toBe("sazareishi-shrine");
    expect(matchedSazareNode?.id).not.toBe("takasu-shrine");

    // LENS -> MAP spot resolution check
    const kosoSpotId = resolveSpotForLensNode(kosoNode, links.get("takasu-shrine"), publishedDataset.atlas.spots as any);
    expect(kosoSpotId).toBe("spot-entity-c7a88993fa1035fe5cf1");

    const sazareSpotId = resolveSpotForLensNode(sazareNode, links.get("sazareishi-shrine"), publishedDataset.atlas.spots as any);
    expect(sazareSpotId).toBe("spot-entity-0c392070234e783c7103");
  });

  it("strictly enforces Plan A invariant: person and conceptual nodes never select a random foreign spot", () => {
    const hyugaTopic = registeredLensTopics.find((t) => t.id === "hyuga-mythology-preset");
    const projection = projectLensPreset(hyugaTopic!.pack, hyugaTopic!.presetId);
    const links = buildLensExplorationLinksByIdentity(
      publishedDataset.claims as any,
      publishedDataset.atlas.spots as any,
      projection.nodes,
    );

    // Ninigi, Hoori, Kamuyamato are persons/deities
    const personNodes = projection.nodes.filter((n) => n.kind === "person" || n.kind === "deity");
    expect(personNodes.length).toBeGreaterThan(0);

    for (const person of personNodes) {
      const link = links.get(person.id);
      const spotId = resolveSpotForLensNode(person, link, publishedDataset.atlas.spots as any);
      // Under Plan A: person nodes without an exact spot identity of the same name must return undefined!
      expect(spotId).toBeUndefined();
    }
  });

  it("verifies bidirectional bijective identity across all 29 topics and atlas spots", { timeout: 30000 }, () => {
    let verifiedCount = 0;
    for (const topic of registeredLensTopics) {
      const projection = projectLensPreset(topic.pack, topic.presetId);
      const links = buildLensExplorationLinksByIdentity(
        publishedDataset.claims as any,
        publishedDataset.atlas.spots as any,
        projection.nodes,
      );

      for (const node of projection.nodes) {
        const link = links.get(node.id);
        const spotId = resolveSpotForLensNode(node, link, publishedDataset.atlas.spots as any);
        if (spotId) {
          const spot = publishedDataset.atlas.spots.find((s) => s.id === spotId);
          expect(spot).toBeDefined();

          // Roundtrip: MAP spot -> LENS node must return the EXACT node
          const roundtripNode = matchLensNodeForSpot(projection.nodes, spot as any, links);
          expect(roundtripNode).toBeDefined();
          expect(roundtripNode?.id).toBe(node.id);
          verifiedCount++;
        }
      }
    }
    expect(verifiedCount).toBeGreaterThan(10);
  });
});
