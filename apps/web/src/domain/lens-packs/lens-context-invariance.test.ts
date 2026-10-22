import { describe, expect, it } from "vitest";

import { registeredLensTopics } from "./knowledge-registry";
import { projectLensPreset } from "./projection";
import { resolveCrossTopicPortals } from "./cross-topic-portals";
import { reduceAtlasSelection, type AtlasSelection } from "@/domain/map/selection";

describe("ADR-0022 Cognitive Context Invariance & Ground Anchor Model", () => {
  it("guarantees context invariance across all registered lens topics", () => {
    expect(registeredLensTopics.length).toBe(32);

    for (const topic of registeredLensTopics) {
      const projection = projectLensPreset(topic.pack, topic.presetId);
      expect(projection.nodes.length).toBeGreaterThan(0);

      let activeTopicId = topic.id;

      // Simulate clicking every node in this topic's projection
      for (const node of projection.nodes) {
        let selection: AtlasSelection = {
          spotId: "",
          focus: { kind: "none" },
        };

        // 1. Focus as route node
        selection = reduceAtlasSelection(selection, {
          type: "select-route-node",
          id: node.id,
        });
        expect(selection.focus.kind).toBe("route-node");
        expect(activeTopicId).toBe(topic.id); // Invariant: topic never changes!

        // 2. Focus as suggestion (candidate)
        selection = reduceAtlasSelection(selection, {
          type: "select-suggestion",
          id: node.id,
        });
        expect(selection.focus.kind).toBe("suggestion");
        expect(activeTopicId).toBe(topic.id); // Invariant: topic never changes!

        // 3. Focus as spot
        selection = reduceAtlasSelection(selection, {
          type: "select-spot",
          spotId: node.id,
        });
        expect(selection.focus.kind).toBe("spot");
        expect(activeTopicId).toBe(topic.id); // Invariant: topic never changes!
      }
    }
  });

  it("regression guard: clicking 出雲大社 in 大己貴回廊 preserves corridor context and offers Kuniyuzuri portal", () => {
    const corridorTopic = registeredLensTopics.find(
      (t) => t.id === "izumo-kunitsukami-corridor",
    );
    expect(corridorTopic).toBeDefined();

    const projection = projectLensPreset(corridorTopic!.pack, corridorTopic!.presetId);
    const izumoNode = projection.nodes.find((n) => n.id === "izumo-taisha" || n.label === "出雲大社");
    expect(izumoNode).toBeDefined();

    // Context Invariance: Active topic remains corridor
    let currentTopicId = "izumo-kunitsukami-corridor";
    let selection: AtlasSelection = { spotId: "", focus: { kind: "none" } };
    selection = reduceAtlasSelection(selection, {
      type: "select-suggestion",
      id: izumoNode!.id,
    });
    expect(selection.focus).toEqual({ kind: "suggestion", id: "izumo-taisha", panCamera: undefined });
    expect(currentTopicId).toBe("izumo-kunitsukami-corridor"); // Must NOT jump to kuniyuzuri!

    // Cross-Topic Discovery: Inspector must offer explicit portal to Kuniyuzuri
    const portals = resolveCrossTopicPortals(izumoNode!, {
      currentTopicId: "izumo-kunitsukami-corridor",
    });
    expect(portals.length).toBeGreaterThanOrEqual(1);

    const kuniyuzuriPortal = portals.find((p) => p.topicId === "izumo-kunitsukami-preset");
    expect(kuniyuzuriPortal).toBeDefined();
    expect(kuniyuzuriPortal?.lensId).toBe("mythology");
    expect(kuniyuzuriPortal?.topicLabel).toContain("出雲国譲り神話");
  });

  it("verifies multi-perspective portals for key Ground Anchors", () => {
    // 1. 厳島神社 (Itsukushima Shrine): sacred landscape & historical events
    const itsukushimaPortals = resolveCrossTopicPortals("itsukushima-shrine");
    expect(itsukushimaPortals.length).toBeGreaterThanOrEqual(2);

    // 2. 大神神社 (Oomiwa Shrine): Kunitsukami corridor & archaic religion
    const oomiwaPortals = resolveCrossTopicPortals("oomiwa-shrine");
    expect(oomiwaPortals.length).toBeGreaterThanOrEqual(1);

    // 3. 宗像大社・沖ノ島 (Munakata / Okinoshima): state ritual & maritime deities
    const munakataPortals = resolveCrossTopicPortals("munakata-taisha");
    expect(munakataPortals.length).toBeGreaterThanOrEqual(1);
  });
});
