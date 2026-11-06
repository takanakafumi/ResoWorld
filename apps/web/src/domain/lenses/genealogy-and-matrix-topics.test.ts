import { describe, expect, it } from "vitest";

import { registeredLensTopics } from "../lens-packs/knowledge-registry";
import { projectLensPreset } from "../lens-packs/projection";
import { hyugaMythologyPack } from "../lens-packs/hyuga-mythology-pack";
import { japaneseMythologyPack } from "../lens-packs/seed-packs";
import { ishinFiguresPack } from "../lens-packs/ishin-figures-pack";
import { marineDeitiesPack } from "../lens-packs/marine-deities-pack";
import { asakuraConnectionsPack } from "../lens-packs/asakura-pack";
import { resolveLensTopics } from "./topic-resolver";
import type { ReviewAtlasSpot, ReviewDataset } from "../review/types";

describe("Genealogy and Matrix archetype topic mappings and projections (Issue 4)", () => {
  it("verifies all genealogy topics are correctly classified with archetype 'genealogy'", () => {
    const genealogyTopicIds = [
      "hyuga-mythology-preset",
      "munakata-genealogy",
    ];

    for (const topicId of genealogyTopicIds) {
      const topic = registeredLensTopics.find((t) => t.id === topicId);
      expect(topic, `Topic ${topicId} must exist in registered topics`).toBeDefined();
      expect(topic?.archetype).toBe("genealogy");
      expect(topic?.archetypeLabel).toBe("樹状・系譜型");
    }
  });

  it("verifies all matrix topics are correctly classified with archetype 'matrix'", () => {
    const matrixTopicIds = [
      "marine-deities-preset",
      "yayoi-archaeology-preset",
      "ichinomiya-western-preset",
      "miyajima-sacred-relations",
      "archaic-local-shrines",
    ];

    for (const topicId of matrixTopicIds) {
      const topic = registeredLensTopics.find((t) => t.id === topicId);
      expect(topic, `Topic ${topicId} must exist in registered topics`).toBeDefined();
      expect(topic?.archetype).toBe("matrix");
      expect(topic?.archetypeLabel).toBe("仮説対比・マトリクス型");
    }
  });

  it("projects genealogy tree structures with directional generational edges", () => {
    // Hyuga mythology: Ninigi -> Hoori -> Ugayafukiaezu
    const hyugaProjection = projectLensPreset(hyugaMythologyPack, "hyuga-mythology-preset");
    expect(hyugaProjection.nodes.length).toBeGreaterThan(0);
    expect(hyugaProjection.edges.length).toBeGreaterThan(0);
    const hasParentOfHyuga = hyugaProjection.edges.some((e) => e.predicate === "parent_of");
    expect(hasParentOfHyuga).toBe(true);

    // Munakata genealogy: Amaterasu -> Oshihomimi -> Ninigi
    const munakataProjection = projectLensPreset(japaneseMythologyPack, "munakata-connections");
    expect(munakataProjection.nodes.length).toBeGreaterThan(0);
    const hasParentOfMunakata = munakataProjection.edges.some((e) => e.predicate === "parent_of");
    expect(hasParentOfMunakata).toBe(true);
  });

  it("projects matrix comparison structures with comparative anchors and dimensions", () => {
    // Marine deities: 3 clan systems
    const marineProjection = projectLensPreset(marineDeitiesPack, "marine-deities-preset");
    expect(marineProjection.nodes.length).toBeGreaterThan(0);
    const groups = marineProjection.nodes.filter((n) => n.kind === "group");
    expect(groups.length).toBeGreaterThanOrEqual(3);

    // Asakura hypothesis comparison
    const asakuraProjection = projectLensPreset(asakuraConnectionsPack, "asakura-yamatai-context");
    expect(asakuraProjection.nodes.length).toBeGreaterThan(0);
    expect(asakuraProjection.edges.some((e) => e.predicate === "proposed_as" || e.predicate === "interpreted_as")).toBe(true);
  });

  it("resolves topics with populated archetype metadata for both perspectives", () => {
    const emptyClaims: ReviewDataset["claims"] = [];
    const spots: ReviewAtlasSpot[] = [];

    const mythologyTopics = resolveLensTopics({
      perspectiveId: "mythology",
      claims: emptyClaims,
      spots,
      selectedSpotId: "",
      includeUnvisited: true,
    });

    const hyugaTopic = mythologyTopics.find((t) => t.id === "hyuga-mythology-preset");
    expect(hyugaTopic).toBeDefined();
    expect(hyugaTopic?.archetype).toBe("genealogy");
    expect(hyugaTopic?.archetypeLabel).toBe("樹状・系譜型");

    const marineTopic = mythologyTopics.find((t) => t.id === "marine-deities-preset");
    expect(marineTopic).toBeDefined();
    expect(marineTopic?.archetype).toBe("matrix");
    expect(marineTopic?.archetypeLabel).toBe("仮説対比・マトリクス型");

    const peopleTopics = resolveLensTopics({
      perspectiveId: "people",
      claims: emptyClaims,
      spots,
      selectedSpotId: "",
      includeUnvisited: true,
    });

    const ishinTopic = peopleTopics.find((t) => t.id === "ishin-figures-network");
    expect(ishinTopic).toBeDefined();
    expect(ishinTopic?.archetype).toBe("faction");
    expect(ishinTopic?.archetypeLabel).toBe("勢力・相関型");
  });
});
