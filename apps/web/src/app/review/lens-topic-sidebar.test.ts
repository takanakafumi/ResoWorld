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
});
