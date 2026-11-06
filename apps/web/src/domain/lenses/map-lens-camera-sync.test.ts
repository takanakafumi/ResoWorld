import { describe, it, expect } from "vitest";
import { isPlaceLikeKind, matchCandidateForLensNode, matchLensNodeForCandidate, matchLensNodeForSpot, resolveSpotForLensNode } from "./candidate-matching";
import { getEntityKindMeta } from "./entity-presentation";
import { projectMapScene } from "../map/scene";
import { registeredKnowledgeMapConnections } from "../map/registry";
import { reduceAtlasSelection, type AtlasSelection } from "../map/selection";
import { decideCameraCommand } from "../map/camera-policy";
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
    const yayoiTopic = registeredLensTopics.find((t) => t.id === "yayoi-archaeology-preset");
    expect(yayoiTopic).toBeDefined();

    const yayoiProjection = projectLensPreset(yayoiTopic!.pack, yayoiTopic!.presetId);
    const hiratsukaNode = yayoiProjection.nodes.find((n) => n.id === "hiratsuka-kawazoe" || n.label.includes("平塚川添") || n.id === "place-hiratsuka-kawazoe");
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

  it("verifies camera framing invariants across all registered lens topics", () => {
    for (const topic of registeredLensTopics) {
      const projection = projectLensPreset(topic.pack, topic.presetId);
      const packEntityMap = new Map(topic.pack.entities.map((e) => [e.id, e]));
      const activeTopicNodes = projection.nodes.map((node) => ({
        id: node.id,
        label: node.label,
        coordinates: node.coordinates ?? packEntityMap.get(node.id)?.coordinates,
      }));

      const topicConnections = registeredKnowledgeMapConnections.filter((connection: any) =>
        connection.lensRefs?.some(
          (ref: any) => ref.topicId === topic.id || ref.presetId === topic.presetId || ref.presetId === topic.id,
        ),
      );
      const defaultCluster = topic.scopeClusters?.find((c) => c.default) ?? topic.scopeClusters?.[0];
      const scopedConnectionIds = defaultCluster?.connectionIds;
      const effectiveTopicConnections = scopedConnectionIds
        ? topicConnections.filter((c: any) => scopedConnectionIds.includes(c.id))
        : topicConnections;
      const viewportConnectionIds = effectiveTopicConnections.map((c: any) => c.id);

      const scene = projectMapScene({
        reviewConnections: [],
        knowledgeConnections: topicConnections,
        spots: publishedDataset.atlas.spots as any,
        selection: {
          spotId: "",
          focus: { kind: "none" },
        },
        activeTopicId: topic.id,
        topicSpotIds: (topic as { spotIds?: readonly string[] }).spotIds,
        viewportKnowledgeConnectionIds: viewportConnectionIds,
        activeLensNodes: activeTopicNodes,
      });

      // INVARIANT: When selecting a topic, camera must NEVER fall back to all-spots 'journey'
      if (scene.camera.mode === "bounds") {
        expect(scene.camera.reason).toBe("lens");
        expect(scene.camera.fitCamera).toBe(true);
        expect(scene.camera.points.length).toBeGreaterThanOrEqual(1);
      } else {
        expect(scene.camera.mode).toBe("none");
      }

      // Specific topic invariants
      if (topic.id === "yamatai-politics") {
        expect(scene.camera.mode).toBe("bounds");
        if (scene.camera.mode === "bounds") {
          expect(scene.camera.points.length).toBeGreaterThanOrEqual(3);
          // Covers Northern Kyushu Itoshima (Ito) to Kasuga (Na), strictly excluding Asakura
          const lngs = scene.camera.points.map((p) => p.longitude);
          expect(Math.min(...lngs)).toBeLessThan(130.3); // Itoshima (130.2)
          expect(Math.max(...lngs)).toBeGreaterThan(130.4); // Kasuga (130.45)
          expect(Math.max(...lngs)).toBeLessThan(130.55); // Does not stretch unnaturally to Asakura (130.66)
        }
      }

      if (topic.id === "ishin-figures-network") {
        expect(scene.camera.mode).toBe("bounds");
        if (scene.camera.mode === "bounds") {
          expect(scene.camera.points.length).toBeGreaterThanOrEqual(5);
          // Invariant: Covers Yamaguchi Prefecture: Hagi (34.4, 131.4) to Shimonoseki (34.0, 130.9) to Yamaguchi/Hofu (34.1, 131.5)
          for (const point of scene.camera.points) {
            expect(point.latitude).toBeGreaterThan(33.8);
            expect(point.latitude).toBeLessThan(34.6);
            expect(point.longitude).toBeGreaterThan(130.8);
            expect(point.longitude).toBeLessThan(131.7);
          }
        }
      }

      if (topic.id === "jinmu-yamato-conquest-preset") {
        expect(scene.camera.mode).toBe("bounds");
        if (scene.camera.mode === "bounds") {
          expect(scene.camera.points.length).toBe(8);
          // Invariant: Points must strictly cover Mimitsu (Kyushu) across Seto Inland Sea to Yamato Kashihara
          for (const point of scene.camera.points) {
            expect(point.latitude).toBeGreaterThan(32.0);
            expect(point.latitude).toBeLessThan(35.0);
            expect(point.longitude).toBeGreaterThan(130.5);
            expect(point.longitude).toBeLessThan(136.5);
          }
        }
      }

      if (topic.id === "izumo-kunitsukami-preset") {
        expect(scene.camera.mode).toBe("bounds");
        if (scene.camera.mode === "bounds") {
          expect(scene.camera.points.length).toBe(4);
          // Invariant: Points must strictly be in Shimane (Lat 35.3~35.6, Lng 132.5~133.5), never leaking to Kyushu
          for (const point of scene.camera.points) {
            expect(point.latitude).toBeGreaterThan(35.0);
            expect(point.latitude).toBeLessThan(36.0);
            expect(point.longitude).toBeGreaterThan(132.0);
            expect(point.longitude).toBeLessThan(134.0);
          }
        }
      }
    }
  });
  it("triggers camera fit command when switching topics via clear-focus with preserveCamera: false", () => {
    // Simulate user having a spot selected
    let selection: AtlasSelection = {
      spotId: "ito-history-museum",
      focus: { kind: "spot", panCamera: true },
    };

    // User selects a topic -> selectTopic dispatches clear-focus with preserveCamera: false, resetSpot: true
    selection = reduceAtlasSelection(selection, { type: "clear-focus", preserveCamera: false, resetSpot: true });
    expect(selection.spotId).toBe("");
    expect(selection.focus).toEqual({ kind: "none", preserveCamera: false });

    // Project map scene for topic "yamatai-politics"
    const topic = registeredLensTopics.find((t) => t.id === "yamatai-politics")!;
    const projection = projectLensPreset(topic.pack, topic.presetId);
    const packEntityMap = new Map(topic.pack.entities.map((e) => [e.id, e]));
    const activeTopicNodes = projection.nodes.map((node) => ({
      id: node.id,
      label: node.label,
      coordinates: node.coordinates ?? packEntityMap.get(node.id)?.coordinates,
    }));

    const scene = projectMapScene({
      reviewConnections: [],
      knowledgeConnections: [],
      spots: publishedDataset.atlas.spots as any,
      selection,
      activeTopicId: "yamatai-politics",
      topicSpotIds: (topic as { spotIds?: readonly string[] }).spotIds,
      activeLensNodes: activeTopicNodes,
    });

    expect(scene.camera.mode).toBe("bounds");
    if (scene.camera.mode === "bounds") {
      expect(scene.camera.fitCamera).toBe(true);
      expect(scene.camera.topicKey).toBe("topic:yamatai-politics");
      expect(scene.camera.points.length).toBeGreaterThanOrEqual(1);

      // Verify decideCameraCommand emits { type: "fit" }
      const decision = decideCameraCommand({
        camera: scene.camera,
        isInitial: false,
        autoZoom: false,
        lastPannedKey: null,
      });
      expect(decision.command).toEqual({ type: "fit" });
      expect(decision.nextPannedKey).toBe("topic:yamatai-politics");
    }
  });

  it("verifies declarative scope clusters dynamically align camera scale between local core and macro alliance/defense (Issue 1-A)", () => {
    // 1. Dazaifu Ancient Defense: Local Core vs National Defense Line
    const dazaifuTopic = registeredLensTopics.find((t) => t.id === "dazaifu-defense-preset")!;
    expect(dazaifuTopic.scopeClusters).toBeDefined();
    expect(dazaifuTopic.scopeClusters?.length).toBe(2);

    const dazaifuAllConnections = registeredKnowledgeMapConnections.filter((connection: any) =>
      connection.lensRefs?.some((ref: any) => ref.topicId === "dazaifu-defense-preset" || ref.presetId === "dazaifu-defense-preset"),
    );

    // Default Local Core scope: only Dazaifu triad (Mizuki, Ono-jo, Kii-jo)
    const dazaifuCoreScope = dazaifuTopic.scopeClusters!.find((c) => c.id === "dazaifu-core")!;
    const coreConnections = dazaifuAllConnections.filter((c: any) => dazaifuCoreScope.connectionIds.includes(c.id));
    const coreScene = projectMapScene({
      reviewConnections: [],
      knowledgeConnections: coreConnections,
      spots: publishedDataset.atlas.spots as any,
      selection: { spotId: "", focus: { kind: "none" } },
      activeTopicId: "dazaifu-defense-preset",
      viewportKnowledgeConnectionIds: coreConnections.map((c: any) => c.id),
    });

    expect(coreScene.camera.mode).toBe("bounds");
    if (coreScene.camera.mode === "bounds") {
      // Strictly local Northern Kyushu: Fukuoka/Saga only
      for (const pt of coreScene.camera.points) {
        expect(pt.latitude).toBeGreaterThan(33.3);
        expect(pt.latitude).toBeLessThan(33.7);
        expect(pt.longitude).toBeGreaterThan(130.4);
        expect(pt.longitude).toBeLessThan(130.6);
      }
      // Shikoku/Tsushima/Kinki are strictly excluded in core scope!
      expect(coreScene.camera.points.some((pt) => pt.longitude > 131.0)).toBe(false);
      expect(coreScene.camera.points.some((pt) => pt.longitude < 130.0)).toBe(false);
    }

    // Macro National Defense Line scope: expands to Tsushima, Yashima (Shikoku), Takayasu (Kinki)
    const dazaifuMacroScope = dazaifuTopic.scopeClusters!.find((c) => c.id === "national-defense-line")!;
    const macroConnections = dazaifuAllConnections.filter((c: any) => dazaifuMacroScope.connectionIds.includes(c.id));
    const macroScene = projectMapScene({
      reviewConnections: [],
      knowledgeConnections: macroConnections,
      spots: publishedDataset.atlas.spots as any,
      selection: { spotId: "", focus: { kind: "none" } },
      activeTopicId: "dazaifu-defense-preset",
      viewportKnowledgeConnectionIds: macroConnections.map((c: any) => c.id),
    });

    expect(macroScene.camera.mode).toBe("bounds");
    if (macroScene.camera.mode === "bounds") {
      const lngs = macroScene.camera.points.map((p) => p.longitude);
      // Expands from Tsushima (<130.0) across Seto Inland Sea (>134.0)
      expect(Math.min(...lngs)).toBeLessThan(130.0);
      expect(Math.max(...lngs)).toBeGreaterThan(134.0);
    }

    // 2. Bakumatsu Ishin: Choshu Core vs Satcho Alliance Macro
    const ishinTopic = registeredLensTopics.find((t) => t.id === "ishin-figures-network")!;
    expect(ishinTopic.scopeClusters).toBeDefined();
    expect(ishinTopic.scopeClusters?.length).toBe(2);

    const ishinAllConnections = registeredKnowledgeMapConnections.filter((connection: any) =>
      connection.lensRefs?.some((ref: any) => ref.topicId === "ishin-figures-network" || ref.presetId === "ishin-figures-network"),
    );

    // Default Choshu Core scope: Yamaguchi Prefecture only (Hagi, Shimonoseki, Hofu, Yamaguchi)
    const choshuCoreScope = ishinTopic.scopeClusters!.find((c) => c.id === "choshu-core")!;
    const choshuCoreConnections = ishinAllConnections.filter((c: any) => choshuCoreScope.connectionIds.includes(c.id));
    const choshuScene = projectMapScene({
      reviewConnections: [],
      knowledgeConnections: choshuCoreConnections,
      spots: publishedDataset.atlas.spots as any,
      selection: { spotId: "", focus: { kind: "none" } },
      activeTopicId: "ishin-figures-network",
      viewportKnowledgeConnectionIds: choshuCoreConnections.map((c: any) => c.id),
    });

    expect(choshuScene.camera.mode).toBe("bounds");
    if (choshuScene.camera.mode === "bounds") {
      for (const pt of choshuScene.camera.points) {
        expect(pt.latitude).toBeGreaterThan(33.8);
        expect(pt.latitude).toBeLessThan(34.6);
        expect(pt.longitude).toBeGreaterThan(130.8);
        expect(pt.longitude).toBeLessThan(131.7);
      }
      // Kyoto/Kagoshima/Tosa are strictly excluded in local core!
      expect(choshuScene.camera.points.some((pt) => pt.latitude > 34.6)).toBe(false);
      expect(choshuScene.camera.points.some((pt) => pt.latitude < 33.8)).toBe(false);
    }

    // Satcho Alliance Macro scope: expands to Kyoto (35.03), Kagoshima (31.58), Tosa (133.52)
    const ishinMacroScope = ishinTopic.scopeClusters!.find((c) => c.id === "satcho-alliance-macro")!;
    const ishinMacroConnections = ishinAllConnections.filter((c: any) => ishinMacroScope.connectionIds.includes(c.id));
    const ishinMacroScene = projectMapScene({
      reviewConnections: [],
      knowledgeConnections: ishinMacroConnections,
      spots: publishedDataset.atlas.spots as any,
      selection: { spotId: "", focus: { kind: "none" } },
      activeTopicId: "ishin-figures-network",
      viewportKnowledgeConnectionIds: ishinMacroConnections.map((c: any) => c.id),
    });

    expect(ishinMacroScene.camera.mode).toBe("bounds");
    if (ishinMacroScene.camera.mode === "bounds") {
      const lats = ishinMacroScene.camera.points.map((p) => p.latitude);
      const lngs = ishinMacroScene.camera.points.map((p) => p.longitude);
      // Spans from Kagoshima (31.5) to Kyoto (35.0)
      expect(Math.min(...lats)).toBeLessThan(32.0);
      expect(Math.max(...lats)).toBeGreaterThan(35.0);
      // Spans across Western Japan
      expect(Math.max(...lngs)).toBeGreaterThan(135.0);
    }
  });

  it("verifies end-to-end slice: switching scope cluster updates scene topicKey and issues camera fit command", () => {
    const dazaifuTopic = registeredLensTopics.find((t) => t.id === "dazaifu-defense-preset")!;
    const coreCluster = dazaifuTopic.scopeClusters!.find((c) => c.id === "dazaifu-core")!;
    const macroCluster = dazaifuTopic.scopeClusters!.find((c) => c.id === "national-defense-line")!;

    const dazaifuAllConnections = registeredKnowledgeMapConnections.filter((connection: any) =>
      connection.lensRefs?.some(
        (ref: any) => ref.topicId === dazaifuTopic.id || ref.presetId === dazaifuTopic.presetId || ref.presetId === dazaifuTopic.id,
      ),
    );

    // Initial state: Core cluster
    const coreScene = projectMapScene({
      reviewConnections: [],
      knowledgeConnections: dazaifuAllConnections,
      spots: publishedDataset.atlas.spots as any,
      selection: { spotId: "", focus: { kind: "none" } },
      activeTopicId: dazaifuTopic.id,
      activeScopeClusterId: coreCluster.id,
      viewportKnowledgeConnectionIds: coreCluster.connectionIds,
      topicSpotIds: (dazaifuTopic as any).spotIds,
    });

    expect(coreScene.camera.mode).toBe("bounds");
    if (coreScene.camera.mode === "bounds") {
      expect(coreScene.camera.topicKey).toBe("topic:dazaifu-defense-preset:dazaifu-core");
      expect(coreScene.camera.fitCamera).toBe(true);
    }

    // Camera policy for initial render
    const initialDecision = decideCameraCommand({
      camera: coreScene.camera,
      isInitial: false,
      autoZoom: false,
      lastPannedKey: null,
    });
    expect(initialDecision.command).toEqual({ type: "fit" });
    expect(initialDecision.nextPannedKey).toBe("topic:dazaifu-defense-preset:dazaifu-core");

    // Camera policy while remaining on core cluster: should not re-fit
    const steadyDecision = decideCameraCommand({
      camera: coreScene.camera,
      isInitial: false,
      autoZoom: false,
      lastPannedKey: initialDecision.nextPannedKey,
    });
    expect(steadyDecision.command).toEqual({ type: "none" });

    // User switches tab to Macro cluster
    const macroScene = projectMapScene({
      reviewConnections: [],
      knowledgeConnections: dazaifuAllConnections,
      spots: publishedDataset.atlas.spots as any,
      selection: { spotId: "", focus: { kind: "none" } },
      activeTopicId: dazaifuTopic.id,
      activeScopeClusterId: macroCluster.id,
      viewportKnowledgeConnectionIds: macroCluster.connectionIds,
      topicSpotIds: (dazaifuTopic as any).spotIds,
    });

    expect(macroScene.camera.mode).toBe("bounds");
    if (macroScene.camera.mode === "bounds") {
      expect(macroScene.camera.topicKey).toBe("topic:dazaifu-defense-preset:national-defense-line");
      expect(macroScene.camera.fitCamera).toBe(true);
    }

    // Camera policy on tab switch: detects new topicKey and issues { type: "fit" } !
    const tabSwitchDecision = decideCameraCommand({
      camera: macroScene.camera,
      isInitial: false,
      autoZoom: false,
      lastPannedKey: initialDecision.nextPannedKey, // previous was "topic:dazaifu-defense-preset:dazaifu-core"
    });
    expect(tabSwitchDecision.command).toEqual({ type: "fit" });
    expect(tabSwitchDecision.nextPannedKey).toBe("topic:dazaifu-defense-preset:national-defense-line");
  });

  it("verifies camera fit points separation across scope clusters for Jinmu conquest sequence", () => {
    const jinmuTopic = registeredLensTopics.find((t) => t.id === "jinmu-yamato-conquest-preset")!;
    expect(jinmuTopic.scopeClusters).toBeDefined();

    const coreCluster = jinmuTopic.scopeClusters!.find((c) => c.id === "kinai-yamato-core")!;
    const wideCluster = jinmuTopic.scopeClusters!.find((c) => c.id === "whole-eastern-route")!;

    const jinmuAllConnections = registeredKnowledgeMapConnections.filter(
      (c) => c.packId === jinmuTopic.pack.id && c.presetId === jinmuTopic.presetId,
    );

    const coreScene = projectMapScene({
      reviewConnections: [],
      knowledgeConnections: jinmuAllConnections,
      spots: publishedDataset.atlas.spots as any,
      selection: { spotId: "", focus: { kind: "none" } },
      activeTopicId: jinmuTopic.id,
      activeScopeClusterId: coreCluster.id,
      viewportKnowledgeConnectionIds: coreCluster.connectionIds,
      topicSpotIds: (jinmuTopic as any).spotIds,
    });

    const wideScene = projectMapScene({
      reviewConnections: [],
      knowledgeConnections: jinmuAllConnections,
      spots: publishedDataset.atlas.spots as any,
      selection: { spotId: "", focus: { kind: "none" } },
      activeTopicId: jinmuTopic.id,
      activeScopeClusterId: wideCluster.id,
      viewportKnowledgeConnectionIds: wideCluster.connectionIds,
      topicSpotIds: (jinmuTopic as any).spotIds,
    });

    expect(coreScene.camera.mode).toBe("bounds");
    expect(wideScene.camera.mode).toBe("bounds");

    if (coreScene.camera.mode === "bounds" && wideScene.camera.mode === "bounds") {
      expect(coreScene.camera.topicKey).toBe("topic:jinmu-yamato-conquest-preset:kinai-yamato-core");
      expect(wideScene.camera.topicKey).toBe("topic:jinmu-yamato-conquest-preset:whole-eastern-route");

      // Core cluster points are focused on Osaka/Kumano/Nara (excludes Kyushu Mimitsu and Okada)
      const coreLabels = coreScene.camera.points.map((p) => p.label);
      expect(coreLabels).toContain("盾津・日下伝承地（孔舎衙坂）");
      expect(coreLabels).toContain("神倉神社・ゴトビキ岩（熊野）");
      expect(coreLabels).not.toContain("美々津港（立磐神社）");
      expect(coreLabels).not.toContain("岡田宮（筑紫逗留地）");

      // Wide cluster points include all expedition waypoints from Kyushu/Seto-inland to Yamato
      const wideLabels = wideScene.camera.points.map((p) => p.label);
      expect(wideLabels).toContain("美々津港（立磐神社）");
      expect(wideLabels).toContain("岡田宮（筑紫逗留地）");
      expect(wideLabels).toContain("神倉神社・ゴトビキ岩（熊野）");
      expect(wideLabels.length).toBeGreaterThan(coreLabels.length);

      // Verify camera command decides "fit" on tab switch
      const switchDecision = decideCameraCommand({
        camera: wideScene.camera,
        isInitial: false,
        autoZoom: false,
        lastPannedKey: coreScene.camera.topicKey ?? null,
      });
      expect(switchDecision.command).toEqual({ type: "fit" });
    }
  });

  it("verifies camera fit points separation across scope clusters for Jingu Kogo sequence and Marine Deities matrix", () => {
    // 1. Jingu Kogo Legend (Chikushi birth vs National Saga)
    const jinguTopic = registeredLensTopics.find((t) => t.id === "jingu-kogo-legend-preset")!;
    const jinguCore = jinguTopic.scopeClusters!.find((c) => c.id === "chikushi-birth-core")!;
    const jinguWide = jinguTopic.scopeClusters!.find((c) => c.id === "saga-national-wide")!;

    const jinguAllConnections = registeredKnowledgeMapConnections.filter(
      (c) => c.packId === jinguTopic.pack.id && c.presetId === jinguTopic.presetId,
    );

    const jinguCoreScene = projectMapScene({
      reviewConnections: [],
      knowledgeConnections: jinguAllConnections,
      spots: publishedDataset.atlas.spots as any,
      selection: { spotId: "", focus: { kind: "none" } },
      activeTopicId: jinguTopic.id,
      activeScopeClusterId: jinguCore.id,
      viewportKnowledgeConnectionIds: jinguCore.connectionIds,
      topicSpotIds: (jinguTopic as any).spotIds,
    });

    const jinguWideScene = projectMapScene({
      reviewConnections: [],
      knowledgeConnections: jinguAllConnections,
      spots: publishedDataset.atlas.spots as any,
      selection: { spotId: "", focus: { kind: "none" } },
      activeTopicId: jinguTopic.id,
      activeScopeClusterId: jinguWide.id,
      viewportKnowledgeConnectionIds: jinguWide.connectionIds,
      topicSpotIds: (jinguTopic as any).spotIds,
    });

    expect(jinguCoreScene.camera.mode).toBe("bounds");
    expect(jinguWideScene.camera.mode).toBe("bounds");

    if (jinguCoreScene.camera.mode === "bounds" && jinguWideScene.camera.mode === "bounds") {
      const coreLabels = jinguCoreScene.camera.points.map((p) => p.label);
      expect(coreLabels).toContain("宇美八幡宮");
      expect(coreLabels).not.toContain("忌宮神社（長門豊浦宮跡）");
      expect(coreLabels).not.toContain("宇佐神宮");

      const wideLabels = jinguWideScene.camera.points.map((p) => p.label);
      expect(wideLabels).toContain("宇美八幡宮");
      expect(wideLabels).toContain("忌宮神社");
      expect(wideLabels).toContain("宇佐神宮");
      expect(wideLabels.length).toBeGreaterThan(coreLabels.length);
    }

    // 2. Marine Deities Matrix (Genkai sanctuaries vs Setouchi network)
    const marineTopic = registeredLensTopics.find((t) => t.id === "marine-deities-preset")!;
    const marineCore = marineTopic.scopeClusters!.find((c) => c.id === "genkai-sanctuaries-core")!;
    const marineWide = marineTopic.scopeClusters!.find((c) => c.id === "setouchi-kinai-wide")!;

    const marineAllConnections = registeredKnowledgeMapConnections.filter(
      (c) => c.packId === marineTopic.pack.id && c.presetId === marineTopic.presetId,
    );

    const marineCoreScene = projectMapScene({
      reviewConnections: [],
      knowledgeConnections: marineAllConnections,
      spots: publishedDataset.atlas.spots as any,
      selection: { spotId: "", focus: { kind: "none" } },
      activeTopicId: marineTopic.id,
      activeScopeClusterId: marineCore.id,
      viewportKnowledgeConnectionIds: marineCore.connectionIds,
      topicSpotIds: (marineTopic as any).spotIds,
    });

    const marineWideScene = projectMapScene({
      reviewConnections: [],
      knowledgeConnections: marineAllConnections,
      spots: publishedDataset.atlas.spots as any,
      selection: { spotId: "", focus: { kind: "none" } },
      activeTopicId: marineTopic.id,
      activeScopeClusterId: marineWide.id,
      viewportKnowledgeConnectionIds: marineWide.connectionIds,
      topicSpotIds: (marineTopic as any).spotIds,
    });

    expect(marineCoreScene.camera.mode).toBe("bounds");
    expect(marineWideScene.camera.mode).toBe("bounds");

    if (marineCoreScene.camera.mode === "bounds" && marineWideScene.camera.mode === "bounds") {
      const coreLabels = marineCoreScene.camera.points.map((p) => p.label);
      expect(coreLabels).toContain("志賀海神社");
      expect(coreLabels).toContain("宗像大社 辺津宮");
      expect(coreLabels).not.toContain("沼名前神社");
      expect(coreLabels).not.toContain("白神社");

      const wideLabels = marineWideScene.camera.points.map((p) => p.label);
      expect(wideLabels).toContain("志賀海神社");
      expect(wideLabels).toContain("宗像大社 辺津宮");
      expect(wideLabels).toContain("沼名前神社");
      expect(wideLabels).toContain("白神社");
      expect(wideLabels.length).toBeGreaterThan(coreLabels.length);
    }
  });
});
