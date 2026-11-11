import { describe, expect, it } from "vitest";
import publishedDataset from "@/data/published-review-dataset.json";
import { registeredLensTopics } from "@/domain/lens-packs/knowledge-registry";
import { projectLensPreset } from "@/domain/lens-packs/projection";
import { buildLensExplorationLinksByIdentity } from "@/domain/lens-packs/exploration-links";
import { resolveEntityVisitState } from "@/domain/lens-packs/entity-visit-state";
import {
  knowledgeVisitFrontierSuggestionsForVisitedSpots,
  placeMatchesSpot,
} from "@/domain/map/registry";
import { resolveSpotEpistemicNature } from "@/domain/map/spot-presentation";
import type { ReviewAtlasSpot, ReviewDataset } from "@/domain/review/types";

describe("Cross-Space Visit Invariants (Principle 14: Deterministic Binding & Promotion)", () => {
  const dataset = publishedDataset as unknown as ReviewDataset;
  const atlas = dataset.atlas!;
  const spots = atlas.spots as ReviewAtlasSpot[];
  const claims = dataset.claims;

  // 1. 特定の訪問済みスポット（香椎宮、博多住吉神社）のバインド＆昇格保証
  it("enforces deterministic promotion for Kashii-gu and Hakata Sumiyoshi Shrine across relevant lens topics", () => {
    const kashiiSpot = spots.find((s) => s.id === "spot-kashii-gu");
    const sumiyoshiSpot = spots.find((s) => s.id === "spot-sumiyoshi-hakata");

    expect(kashiiSpot, "Kashii-gu spot must exist in atlas").toBeDefined();
    expect(kashiiSpot?.mapRole).toBe("visited-place");

    expect(sumiyoshiSpot, "Hakata Sumiyoshi Shrine spot must exist in atlas").toBeDefined();
    expect(sumiyoshiSpot?.mapRole).toBe("visited-place");

    // 香椎宮に関連するトピック（jingu-kogo-legend-preset等）を検証
    const jinguTopic = registeredLensTopics.find((t) => t.id === "jingu-kogo-legend-preset");
    expect(jinguTopic).toBeDefined();

    const jinguProjection = projectLensPreset(jinguTopic!.pack, jinguTopic!.presetId);
    const jinguLinks = buildLensExplorationLinksByIdentity(claims, spots, jinguProjection.nodes);

    // 香椎宮ノード
    const kashiiNode = jinguProjection.nodes.find(
      (n) => n.id === "kashii-gu" || n.label.includes("香椎"),
    );
    expect(kashiiNode, "Kashii node must exist in Jingu Kogo preset").toBeDefined();

    const kashiiLink = jinguLinks.get(kashiiNode!.id);
    const kashiiVisitState = resolveEntityVisitState(kashiiNode!, kashiiLink, spots);

    expect(
      kashiiVisitState.isVisited,
      `Node "${kashiiNode!.label}" in topic "${jinguTopic!.id}" must be promoted to visited`,
    ).toBe(true);
    expect(kashiiVisitState.visitReason).toMatch(/^(observed|spot_connected|direct_match)$/);
    expect(
      kashiiVisitState.primarySpotId === "spot-kashii-gu" ||
        kashiiLink?.spotIds.includes("spot-kashii-gu") ||
        kashiiLink?.observedSpotIds.includes("spot-kashii-gu"),
    ).toBe(true);

    // 住吉神社に関連するトピック（marine-deities-preset等）を検証
    const marineTopic = registeredLensTopics.find((t) => t.id === "marine-deities-preset");
    expect(marineTopic).toBeDefined();

    const marineProjection = projectLensPreset(marineTopic!.pack, marineTopic!.presetId);
    const marineLinks = buildLensExplorationLinksByIdentity(claims, spots, marineProjection.nodes);

    const sumiyoshiNode = marineProjection.nodes.find(
      (n) => n.id === "sumiyoshi-jinja" || n.label.includes("住吉"),
    );
    expect(sumiyoshiNode, "Sumiyoshi node must exist in Marine Deities preset").toBeDefined();

    const sumiyoshiLink = marineLinks.get(sumiyoshiNode!.id);
    const sumiyoshiVisitState = resolveEntityVisitState(sumiyoshiNode!, sumiyoshiLink, spots);

    expect(
      sumiyoshiVisitState.isVisited,
      `Node "${sumiyoshiNode!.label}" in topic "${marineTopic!.id}" must be promoted to visited`,
    ).toBe(true);
    expect(sumiyoshiVisitState.visitReason).toMatch(/^(observed|spot_connected|direct_match)$/);
    expect(
      sumiyoshiVisitState.primarySpotId === "spot-sumiyoshi-hakata" ||
        sumiyoshiLink?.spotIds.includes("spot-sumiyoshi-hakata") ||
        sumiyoshiLink?.observedSpotIds.includes("spot-sumiyoshi-hakata"),
    ).toBe(true);

    // 御島神社・濱男神社（香椎潟海上祭祀）の訪問済み昇格保証
    const mishimaSpot = spots.find((s) => s.id === "spot-mishima-shrine");
    const hamaoSpot = spots.find((s) => s.id === "spot-hamao-shrine");

    expect(mishimaSpot, "Mishima Shrine spot must exist in atlas").toBeDefined();
    expect(mishimaSpot?.mapRole).toBe("visited-place");

    expect(hamaoSpot, "Hamao Shrine spot must exist in atlas").toBeDefined();
    expect(hamaoSpot?.mapRole).toBe("visited-place");

    const mishimaNode = marineProjection.nodes.find((n) => n.id === "mishima-shrine");
    expect(mishimaNode, "Mishima Shrine node must exist in Marine Deities preset").toBeDefined();
    const mishimaLink = marineLinks.get(mishimaNode!.id);
    const mishimaVisitState = resolveEntityVisitState(mishimaNode!, mishimaLink, spots);
    expect(mishimaVisitState.isVisited).toBe(true);
    expect(mishimaVisitState.visitReason).toMatch(/^(observed|spot_connected|direct_match)$/);

    const hamaoNode = marineProjection.nodes.find((n) => n.id === "hamao-shrine");
    expect(hamaoNode, "Hamao Shrine node must exist in Marine Deities preset").toBeDefined();
    const hamaoLink = marineLinks.get(hamaoNode!.id);
    const hamaoVisitState = resolveEntityVisitState(hamaoNode!, hamaoLink, spots);
    expect(hamaoVisitState.isVisited).toBe(true);
    expect(hamaoVisitState.visitReason).toMatch(/^(observed|spot_connected|direct_match)$/);

    // 那津官家比定地（博多冷泉津）は未訪問候補（candidate）であることの保証
    const notsuNode = marineProjection.nodes.find((n) => n.id === "notsu-miyake-site");
    expect(notsuNode, "Notsu Miyake node must exist in Marine Deities preset").toBeDefined();
    const notsuLink = marineLinks.get(notsuNode!.id);
    const notsuVisitState = resolveEntityVisitState(notsuNode!, notsuLink, spots);
    expect(notsuVisitState.isVisited).toBe(false);
    expect(notsuVisitState.visitReason).toBe("unvisited");
  });

  // 2. フロンティア候補に訪問済みスポットが滞留しない不変条件（Zero Stragglers in Frontier）
  it("ensures no visited spots linger in unvisited exploration frontier suggestions", () => {
    const liveSuggestions = knowledgeVisitFrontierSuggestionsForVisitedSpots(spots, {
      includeUnanchored: true,
    });

    const visitedSpots = spots.filter((s) => s.mapRole === "visited-place");
    expect(visitedSpots.length).toBeGreaterThan(0);

    for (const visited of visitedSpots) {
      // 訪問済みスポットのIDや名称に一致する未訪問候補提案が残っていてはならない
      const conflictingSuggestion = liveSuggestions.find(
        (s) =>
          s.targetPlaceId === visited.id ||
          Boolean(
            s.targetName &&
              placeMatchesSpot(
                {
                  id: s.targetPlaceId ?? "",
                  kind: "place",
                  label: s.targetName,
                  aliases: [s.targetName],
                },
                visited,
              ),
          ),
      );

      expect(
        conflictingSuggestion,
        `Visited spot "${visited.name}" (${visited.id}) must NOT remain in frontier suggestions as an unvisited candidate.`,
      ).toBeUndefined();
    }
  });

  // 3. 歴史的性格（Epistemic Nature）と訪問状態（Visit State）の直交性（Principle 10 & 16）
  it("enforces orthogonality: epistemicNature 'probable_ancient' does not degrade visited spots to unvisited", () => {
    // 伝承地（probable_ancient）であり、かつ訪問済み（visited-place）のスポットを検証
    const ancientVisitedSpot: ReviewAtlasSpot = {
      id: "mock-ancient-visited-spot",
      name: "古層伝承遺跡",
      latitude: 33.6,
      longitude: 130.4,
      mapRole: "visited-place",
      kind: "遺跡",
      region: "福岡",
      claimIds: ["mock-claim-1"],
      positionStatus: "confirmed",
    };

    expect(resolveSpotEpistemicNature(ancientVisitedSpot)).toBe("probable_ancient");

    const mockNode = {
      id: "mock-ancient-node",
      label: "古層伝承遺跡",
      kind: "place",
    };

    const mockLink = {
      spotIds: ["mock-ancient-visited-spot"],
      observedSpotIds: ["mock-ancient-visited-spot"],
      claimIds: ["mock-claim-1"],
    };

    const state = resolveEntityVisitState(mockNode, mockLink, [ancientVisitedSpot]);
    expect(state.isVisited).toBe(true);
    expect(state.visitReason).toBe("observed");
    expect(state.primarySpotId).toBe("mock-ancient-visited-spot");

    // 未訪問の場合は unvisited
    const ancientUnvisitedSpot: ReviewAtlasSpot = {
      ...ancientVisitedSpot,
      id: "mock-ancient-unvisited-spot",
      mapRole: "candidate-place",
      positionStatus: "candidate",
    };
    const unvisitedState = resolveEntityVisitState(
      mockNode,
      { spotIds: ["mock-ancient-unvisited-spot"], observedSpotIds: [], claimIds: [] },
      [ancientUnvisitedSpot],
    );
    expect(unvisitedState.isVisited).toBe(false);
    expect(unvisitedState.visitReason).toBe("unvisited");
  });

  // 4. 全29トピックにおける空間横断的一貫性（Comprehensive Invariant across All Topics）
  it("enforces cross-space visit consistency across all registered lens topics", () => {
    expect(registeredLensTopics.length).toBeGreaterThanOrEqual(27);

    for (const topic of registeredLensTopics) {
      const projection = projectLensPreset(topic.pack, topic.presetId);
      const links = buildLensExplorationLinksByIdentity(claims, spots, projection.nodes);

      for (const node of projection.nodes) {
        const link = links.get(node.id);
        const visitState = resolveEntityVisitState(node, link, spots);

        // link.observedSpotIds が存在する場合、あるいは link.spotIds の中に visited-place がある場合、
        // 必ず isVisited === true かつ visitReason が unvisited 以外であること
        const hasDirectObserved = (link?.observedSpotIds.length ?? 0) > 0;
        const hasVisitedMappedSpot = (link?.spotIds ?? []).some((id) =>
          spots.some((s) => s.id === id && s.mapRole === "visited-place"),
        );

        if (hasDirectObserved || hasVisitedMappedSpot) {
          expect(
            visitState.isVisited,
            `Node "${node.label}" (${node.id}) in topic "${topic.id}" has observed spots or visited spots in links, so it must be evaluated as visited.`,
          ).toBe(true);
          expect(
            visitState.visitReason,
            `Node "${node.label}" (${node.id}) in topic "${topic.id}" must have non-unvisited reason.`,
          ).not.toBe("unvisited");
        }
      }
    }
  });
});
