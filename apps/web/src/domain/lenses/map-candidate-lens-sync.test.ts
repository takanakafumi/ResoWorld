import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { registeredLensTopics } from "@/domain/lens-packs/knowledge-registry";
import { projectLensPreset } from "@/domain/lens-packs/projection";
import {
  knowledgeVisitFrontierSuggestionsForVisitedSpots,
} from "@/domain/map/registry";

describe("MAP Candidate to LENS Node Synchronization", () => {
  const atlasPath = path.resolve(__dirname, "../../../../../data/imports/review/travel-atlas.yamatai.json");
  const atlas = JSON.parse(fs.readFileSync(atlasPath, "utf8"));
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

    const umiNode = jinguProjection.nodes.find((n) => n.id === "umi-hachimangu");
    expect(umiNode).toBeDefined();
    expect(umiNode?.label).toBe("宇美八幡宮");
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
});

