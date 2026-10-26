import { describe, expect, it } from "vitest";
import { registeredLensTopics } from "../lens-packs/knowledge-registry";
import {
  TOPIC_STRUCTURAL_GUIDES,
  getTopicStructuralGuide,
  getTopicStructuralThesis,
  type TopicStructuralGuide,
} from "./structural-guides";
import publishedDataset from "@/data/published-review-dataset.json";
import type { ReviewAtlasSpot } from "../review/types";

describe("Topic Structural Guides Domain (全トピック構造図解説ガイドの完全性 / Issue #35)", () => {
  const nonStratumTopics = registeredLensTopics.filter((t) => !t.isStratum);

  it("Invariant 1: Zero Stragglers - 100% of non-stratum topics declare complete structural guides", () => {
    expect(nonStratumTopics.length).toBeGreaterThanOrEqual(29);

    for (const topic of nonStratumTopics) {
      const guide = TOPIC_STRUCTURAL_GUIDES[topic.id];
      expect(
        guide,
        `Topic "${topic.id}" (${topic.label} [${topic.archetype}]) must have a declared TopicStructuralGuide in TOPIC_STRUCTURAL_GUIDES. Stragglers are forbidden.`,
      ).toBeDefined();

      // ① 構造の要諦（Thesis）
      expect(guide.thesis.length).toBeGreaterThanOrEqual(15);

      // ② 図の読み方・視点（Reading Guide）
      expect(guide.readingGuide.length).toBeGreaterThanOrEqual(20);

      // ③ 歴史的・思想的背景（Historical Context）
      expect(guide.historicalContext.length).toBeGreaterThanOrEqual(30);

      // ④ 探索スポットとの接続（Field Insight）
      expect(guide.fieldInsight.length).toBeGreaterThanOrEqual(20);
    }
  });

  it("Invariant 2: Backwards Compatibility - getTopicStructuralThesis matches getTopicStructuralGuide.thesis", () => {
    for (const topic of nonStratumTopics) {
      const thesis = getTopicStructuralThesis(topic);
      const guide = getTopicStructuralGuide(topic);

      expect(thesis).toBe(guide.thesis);
    }
  });

  it("Invariant 3: Safe Fallback for Unknown Topics", () => {
    const unknownTopic = { id: "unknown-topic-xyz", label: "未知のトピック" };
    const guide = getTopicStructuralGuide(unknownTopic);

    expect(guide.thesis).toBe("未知のトピックの構造と関係性の配置");
    expect(guide.readingGuide).toContain("図中のノード");
    expect(guide.historicalContext).toContain("古代から近世");
    expect(guide.fieldInsight).toContain("現地を訪れた際");
  });

  it("Invariant 4: Candidate Spots Integrity - Ae Kanga and Sueki Kilns exist as candidate spots", () => {
    const spots = publishedDataset.atlas.spots as ReviewAtlasSpot[];

    const ae = spots.find((s) => s.id === "spot-candidate-ae-kanga");
    expect(ae).toBeDefined();
    expect(ae?.name).toBe("阿恵官衙遺跡（国史跡）");
    expect(ae?.positionStatus).toBe("candidate");
    expect(ae?.mapRole).toBe("candidate-place");
    expect(ae?.kind).toBe("訪問地点候補");

    const kiln = spots.find((s) => s.id === "spot-candidate-sueki-kilns");
    expect(kiln).toBeDefined();
    expect(kiln?.name).toBe("須恵器窯跡群（須恵町窯跡群）");
    expect(kiln?.positionStatus).toBe("candidate");
    expect(kiln?.mapRole).toBe("candidate-place");
    expect(kiln?.kind).toBe("訪問地点候補");
  });
});
