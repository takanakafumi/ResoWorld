import { describe, expect, it } from "vitest";
import { registeredLensTopics } from "@/domain/lens-packs/knowledge-registry";
import { selectLensTopic } from "@/domain/lenses/topic-resolver";

describe("LensTopicSidebar & Split Layout (LENSトピック目次スプリット)", () => {
  it("verifies all registered topics have valid labels and archetype descriptions for sidebar rendering", () => {
    expect(registeredLensTopics.length).toBeGreaterThanOrEqual(20);

    for (const topic of registeredLensTopics) {
      expect(topic.id.length).toBeGreaterThan(0);
      expect(topic.label.length).toBeGreaterThan(0);
      expect(topic.archetype.length).toBeGreaterThan(0);
      expect(topic.archetypeLabel.length).toBeGreaterThan(0);
      expect(topic.focus.length).toBeGreaterThan(0);
      expect(topic.focusLabel.length).toBeGreaterThan(0);
    }
  });

  it("verifies topic selection fallback and resolution across perspectives", () => {
    const politicsTopics = registeredLensTopics.filter((t) => t.perspectiveId === "politics");
    expect(politicsTopics.length).toBeGreaterThanOrEqual(4);

    // Selected topic resolution
    const firstTopic = politicsTopics[0];
    const selected = selectLensTopic(politicsTopics as any, firstTopic.id);
    expect(selected?.id).toBe(firstTopic.id);

    // Fallback to first topic if selected id not found
    const fallback = selectLensTopic(politicsTopics as any, "non-existent-topic");
    expect(fallback?.id).toBe(firstTopic.id);
  });

  it("verifies dual-scale spatial classification (regional vs national) across all registered topics (Issue #3)", () => {
    const regionalTopics = registeredLensTopics.filter((t) => t.spatialScale === "regional");
    const nationalTopics = registeredLensTopics.filter((t) => t.spatialScale === "national");

    // 両方のスケールが正当に存在し、未分類（undefined）が存在しないこと
    expect(regionalTopics.length).toBeGreaterThanOrEqual(10);
    expect(nationalTopics.length).toBeGreaterThanOrEqual(3);
    expect(regionalTopics.length + nationalTopics.length).toBe(registeredLensTopics.length);

    // 全国広域トピック（海神祭祀、邪馬台国比定等）が national に分類されていること
    const marineTopic = registeredLensTopics.find((t) => t.id === "marine-deities-preset");
    expect(marineTopic?.spatialScale).toBe("national");

    // 地域散策トピック（太宰府防衛網、弥生考古等）が regional に分類されていること
    const dazaifuTopic = registeredLensTopics.find((t) => t.presetId === "dazaifu-defense-preset");
    expect(dazaifuTopic?.spatialScale).toBe("regional");
  });
});
