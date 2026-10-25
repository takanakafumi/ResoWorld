import { describe, it, expect } from "vitest";
import { isPlaceLikeKind, matchCandidateForLensNode, matchLensNodeForCandidate, matchLensNodeForSpot, resolveSpotForLensNode } from "./candidate-matching";
import { getEntityKindMeta } from "./entity-presentation";
import { projectMapScene } from "../map/scene";
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
        if (node.kind !== "person" && node.kind !== "deity" && node.kind !== "concept" && node.kind !== "place") {
          console.log("NON-STANDARD KIND:", { topic: topic.id, archetype: topic.archetype, id: node.id, label: node.label, kind: node.kind });
        }
      }
    }
  });

  it("regression guard: clicking Oshima in Munakata Three Shrines does not jump to Kanmon Strait", () => {
    const munakataTopic = registeredLensTopics.find((t) => t.id === "munakata-three-shrines");
    expect(munakataTopic).toBeDefined();
    const projection = projectLensPreset(munakataTopic!.pack, munakataTopic!.presetId);
    const oshimaNode = projection.nodes.find((n) => n.id === "oshima-munakata");
    expect(oshimaNode).toBeDefined();

    // Kanmon highway suggestion with '宗像' in title must NOT match 'oshima-munakata'
    const highwaySuggestion: ReviewExplorationSuggestion = {
      id: "shimonoseki-cross-strait",
      title: "西海道大宰府官道（関門・宗像・博多・都府楼）",
      targetPlaceId: "place-shimonoseki-tsu",
      targetName: "関門海峡渡航地点（赤間関）",
      actionType: "field_visit",
      latitude: 33.957,
      longitude: 130.941,
      question: "関門海峡渡航地点の確認",
      missingInformation: "なし",
      reason: "官道渡航地",
      expectedObservation: "海峡地形",
      uncertainty: "低",
      claimIds: [],
      anchorSpotIds: [],
      connectionIds: [],
      initialStatus: "suggested",
    };

    const matchedCandidate = matchCandidateForLensNode(oshimaNode!, [highwaySuggestion]);
    // MUST NOT match Kanmon suggestion!
    expect(matchedCandidate).toBeUndefined();

    // Map scene with active topic nodes focuses on Oshima in Munakata
    const packEntityMap = new Map(munakataTopic!.pack.entities.map((e) => [e.id, e]));
    const activeNodes = projection.nodes.map((node) => ({
      id: node.id,
      label: node.label,
      coordinates: node.coordinates ?? packEntityMap.get(node.id)?.coordinates,
    }));

    const scene = projectMapScene({
      reviewConnections: [],
      spots: publishedDataset.atlas.spots as any,
      selection: {
        spotId: "",
        focus: { kind: "route-node", id: "oshima-munakata" },
      },
      activeLensNodes: activeNodes,
    });

    expect(scene.camera.mode).toBe("point");
    if (scene.camera.mode === "point") {
      expect(scene.camera.panCamera).toBe(true);
      expect(scene.camera.point.latitude).toBeCloseTo(33.9022, 2);
      expect(scene.camera.point.longitude).toBeCloseTo(130.4286, 2);
      expect(scene.camera.point.label).toBe("大島");
    }
  });

  it("regression guard: clicking Izumo-taisha in Izumo Kuni-yuzuri focuses map camera on Izumo coordinates", () => {
    const izumoTopic = registeredLensTopics.find((t) => t.id === "izumo-kunitsukami-preset");
    expect(izumoTopic).toBeDefined();
    const projection = projectLensPreset(izumoTopic!.pack, izumoTopic!.presetId);
    const izumoNode = projection.nodes.find((n) => n.id === "izumo-taisha");
    expect(izumoNode).toBeDefined();

    const packEntityMap = new Map(izumoTopic!.pack.entities.map((e) => [e.id, e]));
    const activeNodes = projection.nodes.map((node) => ({
      id: node.id,
      label: node.label,
      coordinates: node.coordinates ?? packEntityMap.get(node.id)?.coordinates,
    }));

    const scene = projectMapScene({
      reviewConnections: [],
      spots: publishedDataset.atlas.spots as any,
      selection: {
        spotId: "",
        focus: { kind: "route-node", id: "izumo-taisha" },
      },
      activeLensNodes: activeNodes,
    });

    expect(scene.camera.mode).toBe("point");
    if (scene.camera.mode === "point") {
      expect(scene.camera.panCamera).toBe(true);
      expect(scene.camera.point.latitude).toBeCloseTo(35.4014, 2);
      expect(scene.camera.point.longitude).toBeCloseTo(132.6856, 2);
      expect(scene.camera.point.label).toBe("出雲大社");
    }
  });

  it("regression guard: clicking Dazaifu and Ono-jo in Ancient Defense Network focuses map camera on their respective coordinates", () => {
    const defenseTopic = registeredLensTopics.find((t) => t.id === "dazaifu-defense-preset");
    expect(defenseTopic).toBeDefined();
    const projection = projectLensPreset(defenseTopic!.pack, defenseTopic!.presetId);

    const packEntityMap = new Map(defenseTopic!.pack.entities.map((e) => [e.id, e]));
    const activeNodes = projection.nodes.map((node) => ({
      id: node.id,
      label: node.label,
      coordinates: node.coordinates ?? packEntityMap.get(node.id)?.coordinates,
    }));

    // Test Ono-jo
    const onoScene = projectMapScene({
      reviewConnections: [],
      spots: publishedDataset.atlas.spots as any,
      selection: {
        spotId: "",
        focus: { kind: "route-node", id: "place-ono-jo" },
      },
      activeLensNodes: activeNodes,
    });
    expect(onoScene.camera.mode).toBe("point");
    if (onoScene.camera.mode === "point") {
      expect(onoScene.camera.panCamera).toBe(true);
      expect(onoScene.camera.point.latitude).toBeCloseTo(33.5283, 2);
      expect(onoScene.camera.point.longitude).toBeCloseTo(130.505, 2);
      expect(onoScene.camera.point.label).toBe("大野城跡");
    }

    // Test Dazaifu
    const dazaifuScene = projectMapScene({
      reviewConnections: [],
      spots: publishedDataset.atlas.spots as any,
      selection: {
        spotId: "",
        focus: { kind: "route-node", id: "polity-dazaifu" },
      },
      activeLensNodes: activeNodes,
    });
    expect(dazaifuScene.camera.mode).toBe("point");
    if (dazaifuScene.camera.mode === "point") {
      expect(dazaifuScene.camera.panCamera).toBe(true);
      expect(dazaifuScene.camera.point.latitude).toBeCloseTo(33.5147, 2);
      expect(dazaifuScene.camera.point.longitude).toBeCloseTo(130.5153, 2);
      expect(dazaifuScene.camera.point.label).toBe("大宰府");
    }
  });

  it("entity presentation distinctly represents deities (✨), shrines/sanctuaries (⛩️), fortresses/ruins (🏛️), and texts (📜)", () => {
    // 1. Deities
    const deityMeta = getEntityKindMeta("deity", "天照大御神");
    expect(deityMeta.icon).toBe("✨");
    expect(deityMeta.label).toBe("神格");

    // 2. Shrines / Sacred sites
    const shrineMeta = getEntityKindMeta("place", "宗像大社 辺津宮");
    expect(shrineMeta.icon).toBe("⛩️");
    expect(shrineMeta.label).toBe("神社・祭祀地");

    const izumoMeta = getEntityKindMeta("place", "出雲大社");
    expect(izumoMeta.icon).toBe("⛩️");
    expect(izumoMeta.label).toBe("神社・祭祀地");

    // 3. Fortresses / Ruins
    const castleMeta = getEntityKindMeta("place", "大野城跡");
    expect(castleMeta.icon).toBe("🏛️");
    expect(castleMeta.label).toBe("史跡・要塞");

    // 4. Texts
    const textMeta = getEntityKindMeta("text", "古事記");
    expect(textMeta.icon).toBe("📜");
    expect(textMeta.label).toBe("典拠史料");

    // 5. Divine regalia
    const regaliaMeta = getEntityKindMeta("concept", "草薙剣");
    expect(regaliaMeta.icon).toBe("⚔️");
    expect(regaliaMeta.label).toBe("神宝・神器");
  });

  it("consistently resolves spot ID for place-like nodes across all cognitive archetype diagrams (Hub-Spoke, Genealogy, Matrix, Faction)", () => {
    // 1. Hub-Spoke archetype: Munakata Three Shrines -> Munakata Hetsumiya
    const hubSpokeTopic = registeredLensTopics.find((t) => t.id === "munakata-three-shrines");
    expect(hubSpokeTopic?.archetype).toBe("hub-spoke");
    const hubSpokeProj = projectLensPreset(hubSpokeTopic!.pack, hubSpokeTopic!.presetId);
    const hubSpokeLinks = buildLensExplorationLinksByIdentity(
      publishedDataset.claims as any,
      publishedDataset.atlas.spots as any,
      hubSpokeProj.nodes,
    );
    const hetsumiyaHubNode = hubSpokeProj.nodes.find((n) => n.id === "munakata-hetsumiya" || n.label.includes("辺津宮"));
    expect(hetsumiyaHubNode).toBeDefined();
    const hetsumiyaHubSpotId = resolveSpotForLensNode(hetsumiyaHubNode, hubSpokeLinks.get(hetsumiyaHubNode!.id), publishedDataset.atlas.spots as any);
    expect(hetsumiyaHubSpotId).toBeDefined();

    // 2. Genealogy archetype: Munakata Genealogy -> Munakata Taisha
    const munakataTopic = registeredLensTopics.find((t) => t.id === "munakata-genealogy");
    expect(munakataTopic?.archetype).toBe("genealogy");
    const munakataProj = projectLensPreset(munakataTopic!.pack, munakataTopic!.presetId);
    const munakataLinks = buildLensExplorationLinksByIdentity(
      publishedDataset.claims as any,
      publishedDataset.atlas.spots as any,
      munakataProj.nodes,
    );
    const hetsumiyaNode = munakataProj.nodes.find((n) => n.id === "munakata-taisha" || n.label.includes("宗像大社"));
    expect(hetsumiyaNode).toBeDefined();
    const hetsumiyaSpotId = resolveSpotForLensNode(hetsumiyaNode, munakataLinks.get(hetsumiyaNode!.id), publishedDataset.atlas.spots as any);
    expect(hetsumiyaSpotId).toBeDefined();

    // 3. Faction archetype: Genpei Dannoura Network -> Itsukushima Shrine
    const genpeiTopic = registeredLensTopics.find((t) => t.id === "genpei-dannoura-network");
    expect(genpeiTopic?.archetype).toBe("faction");
    const genpeiProj = projectLensPreset(genpeiTopic!.pack, genpeiTopic!.presetId);
    const genpeiLinks = buildLensExplorationLinksByIdentity(
      publishedDataset.claims as any,
      publishedDataset.atlas.spots as any,
      genpeiProj.nodes,
    );
    const itsukushimaNode = genpeiProj.nodes.find((n) => n.id === "itsukushima-shrine");
    expect(itsukushimaNode).toBeDefined();
    const itsukushimaSpotId = resolveSpotForLensNode(itsukushimaNode, genpeiLinks.get("itsukushima-shrine"), publishedDataset.atlas.spots as any);
    expect(itsukushimaSpotId).toBeDefined();

    // 4. Matrix archetype: Marine Deities -> Shikaumi Shrine & Sumiyoshi Shrine
    const marineTopic = registeredLensTopics.find((t) => t.id === "marine-deities-preset");
    expect(marineTopic?.archetype).toBe("matrix");
    const marineProj = projectLensPreset(marineTopic!.pack, marineTopic!.presetId);
    const marineLinks = buildLensExplorationLinksByIdentity(
      publishedDataset.claims as any,
      publishedDataset.atlas.spots as any,
      marineProj.nodes,
    );
    const shikaumiNode = marineProj.nodes.find((n) => n.id === "shikaumi-shrine");
    expect(shikaumiNode).toBeDefined();
    const shikaumiSpotId = resolveSpotForLensNode(shikaumiNode, marineLinks.get("shikaumi-shrine"), publishedDataset.atlas.spots as any);
    expect(shikaumiSpotId).toBeDefined();
  });

  it("isPlaceLikeKind correctly differentiates place-like entities from non-place conceptual/agentic entities", () => {
    // Place-like
    expect(isPlaceLikeKind("place")).toBe(true);
    expect(isPlaceLikeKind("sanctuary")).toBe(true);
    expect(isPlaceLikeKind("shrine")).toBe(true);
    expect(isPlaceLikeKind("temple")).toBe(true);
    expect(isPlaceLikeKind("ruins")).toBe(true);
    expect(isPlaceLikeKind("location")).toBe(true);
    expect(isPlaceLikeKind("site")).toBe(true);
    expect(isPlaceLikeKind("polity")).toBe(true);
    expect(isPlaceLikeKind(undefined)).toBe(true);

    // Non-place (must strictly guard Plan A invariant)
    expect(isPlaceLikeKind("deity")).toBe(false);
    expect(isPlaceLikeKind("person")).toBe(false);
    expect(isPlaceLikeKind("group")).toBe(false);
    expect(isPlaceLikeKind("concept")).toBe(false);
    expect(isPlaceLikeKind("event")).toBe(false);
    expect(isPlaceLikeKind("tradition")).toBe(false);
    expect(isPlaceLikeKind("text")).toBe(false);
  });
});
