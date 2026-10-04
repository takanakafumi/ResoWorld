import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { resolveLensTopics } from "@/domain/lenses/topic-resolver";
import { knowledgeMapConnectionsForGroup } from "@/domain/map/registry";
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
});
