import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { registeredLensTopics, type LensPerspectiveId } from "@/domain/lens-packs/knowledge-registry";
import {
  knowledgeMapConnectionsForLens,
  knowledgeVisitFrontierSuggestionsForVisitedSpots,
} from "@/domain/map/registry";
import { projectKnowledgeMapConnections } from "@/domain/map/connections";
import { projectMapMarkers } from "@/domain/map/markers";

describe("All Lens Topics Integrity and Isolation Test", () => {
  const atlasPath = path.resolve(__dirname, "../../../../../data/imports/review/travel-atlas.yamatai.json");
  const atlas = JSON.parse(fs.readFileSync(atlasPath, "utf8"));
  const allSuggestions = [
    ...(atlas.suggestions || []),
    ...knowledgeVisitFrontierSuggestionsForVisitedSpots(atlas.spots, { includeUnanchored: true }),
  ];

  it("verifies religion lens connections scoping according to ADR 0015", () => {
    const religionConnections = atlas.connections.filter((c: any) => c.lensId === "religion");
    expect(religionConnections.length).toBeGreaterThanOrEqual(5);

    const localShrine = religionConnections.find((c: any) => c.id === "connection-evidence-claim-6006f254550ec1856533");
    expect(localShrine).toBeDefined();
    expect(localShrine.topicId).toBe("local-shrine-connections");

    const syncretism = religionConnections.find((c: any) => c.id === "shinbutsu-as-space");
    expect(syncretism).toBeDefined();
    expect(syncretism.topicId).toBe("religion-syncretism");

    const mountain = religionConnections.find((c: any) => c.id === "mountain-is-sanctuary");
    expect(mountain).toBeDefined();
    expect(mountain.topicId).toBe("regional-sacred-comparison");

    const ritualState = religionConnections.find((c: any) => c.id === "ritual-to-state");
    expect(ritualState).toBeDefined();
    expect(ritualState.topicId).toBe("regional-sacred-comparison");

    const religionNet = religionConnections.find((c: any) => c.id === "religion-as-network");
    expect(religionNet).toBeDefined();
    expect(religionNet.topicId).toBe("regional-sacred-comparison");
  });

  it("ensures no Buddhist/Syncretic connections leak into Mythology lens topics", () => {
    const mythConnections = atlas.connections.filter((c: any) => c.lensId === "mythology");
    expect(mythConnections.some((c: any) => c.id === "shinbutsu-as-space")).toBe(false);
    expect(mythConnections.some((c: any) => c.id === "mountain-is-sanctuary")).toBe(false);
    expect(mythConnections.some((c: any) => c.id === "ritual-to-state")).toBe(false);
    expect(mythConnections.some((c: any) => c.id === "religion-as-network")).toBe(false);
  });

  it("verifies clean connection and suggestion scoping across all registered topics", () => {
    const perspectives: LensPerspectiveId[] = ["route", "religion", "politics", "people", "mythology"];

    for (const perspective of perspectives) {
      const topics = registeredLensTopics.filter((t) => t.perspectiveId === perspective);
      const baseConnections = knowledgeMapConnectionsForLens(perspective, atlas.spots);

      for (const topic of topics) {
        const effectiveTopicId = topic.id;

        // 1. Knowledge connections for this topic
        const topicFilteredKnowledgeConnections = baseConnections.filter((c) =>
          c.lensRefs?.some((ref) => ref.topicId === effectiveTopicId || ref.presetId === effectiveTopicId)
        );

        // 2. Review connections for this topic
        const topicReviewConnections = atlas.connections.filter((c: any) => {
          if (c.lensId !== perspective) return false;
          if (c.topicId) return c.topicId === effectiveTopicId;
          return false;
        });

        // 3. Suggestions scoped to this topic
        const topicScopedSuggestions = allSuggestions.filter((s: any) => {
          if (s.topicId) {
            return s.topicId === effectiveTopicId;
          }
          if (s.connectionIds && s.connectionIds.length > 0) {
            const matchesKnowledge = topicFilteredKnowledgeConnections.some((c) =>
              s.connectionIds.some((cid: string) => c.id.includes(cid) || c.id === cid)
            );
            if (matchesKnowledge) return true;

            const matchesReview = topicReviewConnections.some((c: any) =>
              s.connectionIds.includes(c.id)
            );
            if (matchesReview) return true;
          }
          return false;
        });

        // 4. Map markers projection
        const projectedKnowledge = projectKnowledgeMapConnections(topicFilteredKnowledgeConnections);
        const markers = projectMapMarkers({
          spots: atlas.spots,
          suggestions: topicScopedSuggestions,
          mapConnections: projectedKnowledge,
          suggestionsVisible: true,
        });

        const candidateMarkers = markers.filter((m) => m.kind === "suggestion");

        // Every candidate marker must have a non-empty label and valid coordinates
        for (const candidate of candidateMarkers) {
          expect(candidate.label).toBeTruthy();
          expect(candidate.latitude).toBeGreaterThan(30);
          expect(candidate.latitude).toBeLessThan(40);
          expect(candidate.longitude).toBeGreaterThan(128);
          expect(candidate.longitude).toBeLessThan(140);
        }

        // Specific isolation checks:
        // Akama only in ancient highways
        if (effectiveTopicId !== "ancient-highways-preset") {
          expect(candidateMarkers.some((m) => m.label.includes("赤間"))).toBe(false);
        }

        // Yoshinogari only in wajinden / yayoi presets
        if (effectiveTopicId !== "wajinden-route-comparison" && effectiveTopicId !== "yayoi-archaeology-preset") {
          expect(candidateMarkers.some((m) => m.label.includes("吉野ヶ里"))).toBe(false);
        }
      }
    }
  });
});
