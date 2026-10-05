import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { resolveLensTopics } from "@/domain/lenses/topic-resolver";
import { registeredLensTopics } from "@/domain/lens-packs/knowledge-registry";
import { knowledgeMapConnectionsForLens, knowledgeMapConnectionsForGroup, knowledgeVisitFrontierSuggestionsForVisitedSpots } from "@/domain/map/registry";
import { projectKnowledgeMapConnections } from "@/domain/map/connections";
import { projectMapMarkers } from "@/domain/map/markers";

describe("Yamatai Journey Route Lens test", () => {
  const datasetPath = path.resolve(__dirname, "../../../../../data/imports/review/yamatai-combined.draft.json");
  const atlasPath = path.resolve(__dirname, "../../../../../data/imports/review/travel-atlas.yamatai.json");
  const dataset = JSON.parse(fs.readFileSync(datasetPath, "utf8"));
  const atlas = JSON.parse(fs.readFileSync(atlasPath, "utf8"));

  it("checks route lens topics for yamatai journey", () => {
    const yamataiJourney = atlas.journeys.find((j: any) => j.id === "yamatai");
    const yamataiSpots = atlas.spots.filter((s: any) =>
      yamataiJourney.spotIds.includes(s.id)
    );
    const yamataiDocIds = new Set(yamataiJourney.documentIds);
    const yamataiClaims = dataset.claims.filter((c: any) =>
      yamataiDocIds.has(c.documentId)
    );

    const yamataiTopics = resolveLensTopics({
      perspectiveId: "route",
      claims: yamataiClaims,
      spots: yamataiSpots,
    });

    expect(yamataiTopics.length).toBeGreaterThan(0);
    expect(yamataiTopics.some((t) => t.id === "wajinden-route-comparison")).toBe(true);

    const routes = knowledgeMapConnectionsForGroup("wajinden-routes", yamataiSpots);
    expect(routes.length).toBeGreaterThan(0);
    expect(routes.map((c) => c.id)).toContain("wajinden-source-route");
    expect(routes.map((c) => c.id)).toContain("wajinden-kyushu-hypothesis");
    expect(routes.map((c) => c.id)).toContain("wajinden-kinai-hypothesis");

    const projectedKnowledge = projectKnowledgeMapConnections(routes);
    const markers = projectMapMarkers({
      spots: yamataiSpots,
      suggestions: [],
      mapConnections: projectedKnowledge,
    });

    const refMarkers = markers.filter((m) => m.kind === "reference");
    expect(refMarkers.length).toBeGreaterThan(0);
    expect(refMarkers.some((m) => m.label.includes("対馬"))).toBe(true);
    expect(refMarkers.some((m) => m.label.includes("壱岐"))).toBe(true);
    expect(refMarkers.some((m) => m.label.includes("奈良"))).toBe(true);
  });

  it("ensures connection-yamatai-maritime-inland-network is scoped to wajinden and excluded in jinmu-tosei", () => {
    const connections = atlas.connections;
    const inlandConn = connections.find((c: any) => c.id === "connection-yamatai-maritime-inland-network");
    expect(inlandConn).toBeDefined();
    expect(inlandConn.topicId).toBe("wajinden-route-comparison");

    // Under Jinmu tosei topic, it must be excluded
    const jinmuTopicId = "jinmu-setouchi-route-preset";
    const isIncludedInJinmu = inlandConn.topicId === jinmuTopicId;
    expect(isIncludedInJinmu).toBe(false);

    // Under Wajinden route topic, it must be included
    const wajindenTopicId = "wajinden-route-comparison";
    const isIncludedInWajinden = inlandConn.topicId === wajindenTopicId;
    expect(isIncludedInWajinden).toBe(true);
  });

  it("strictly scopes suggestions and connections per route topic without leakage", () => {
    const routeTopics = registeredLensTopics.filter((t: any) => t.perspectiveId === "route");
    const allSuggestions = [
      ...(atlas.suggestions || []),
      ...knowledgeVisitFrontierSuggestionsForVisitedSpots(atlas.spots, { includeUnanchored: true }),
    ];
    const baseLensMapConnections = knowledgeMapConnectionsForLens("route", atlas.spots);

    routeTopics.forEach((topic: any) => {
      const effectiveTopicId = topic.id;
      // 1. Knowledge connections filtered by topic
      const topicFilteredKnowledgeConnections = baseLensMapConnections.filter((c: any) =>
        c.lensRefs?.some((ref: any) => ref.topicId === effectiveTopicId || ref.presetId === effectiveTopicId)
      );

      // 2. Suggestions filtered strictly by topic
      const topicScopedSuggestions = allSuggestions.filter((s: any) => {
        if (s.topicId) {
          return s.topicId === effectiveTopicId;
        }
        if (s.connectionIds && s.connectionIds.length > 0) {
          const matchesKnowledge = topicFilteredKnowledgeConnections.some((c: any) =>
            s.connectionIds.some((cid: any) => c.id.includes(cid) || c.id === cid)
          );
          if (matchesKnowledge) return true;
        }
        return false;
      });

      // 3. Markers
      const projectedKnowledge = projectKnowledgeMapConnections(topicFilteredKnowledgeConnections);
      const markers = projectMapMarkers({
        spots: atlas.spots,
        suggestions: topicScopedSuggestions,
        mapConnections: projectedKnowledge,
        suggestionsVisible: true,
      });

      const activeAkamaSuggestions = markers.filter((m: any) =>
        m.kind === "suggestion" && (m.label.includes("赤間") || m.label.includes("関門"))
      );

      if (effectiveTopicId === "ancient-highways-preset") {
        // Akama must appear in ancient highways
        expect(activeAkamaSuggestions.length).toBeGreaterThan(0);
      } else {
        // Akama must NEVER leak into other route topics
        expect(activeAkamaSuggestions.length).toBe(0);
      }
    });

    // Ensure wajinden has its route connections registered now
    const wajindenConnections = baseLensMapConnections.filter((c: any) =>
      c.presetId === "wajinden-comparison"
    );
    expect(wajindenConnections.map((c: any) => c.id)).toContain("wajinden-source-route");
    expect(wajindenConnections.map((c: any) => c.id)).toContain("wajinden-kyushu-hypothesis");
    expect(wajindenConnections.map((c: any) => c.id)).toContain("wajinden-kinai-hypothesis");
  });
});
