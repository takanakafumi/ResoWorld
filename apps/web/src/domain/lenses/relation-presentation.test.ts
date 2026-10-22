import { describe, expect, it } from "vitest";
import {
  getRelationMeta,
  getTopicStructuralThesis,
  TOPIC_STRUCTURAL_THESIS,
} from "./relation-presentation";
import { getNodeVisualTier } from "./entity-presentation";
import { registeredLensTopics } from "../lens-packs/knowledge-registry";

describe("Relation Presentation & Cognitive Signaling Invariants", () => {
  it("maps predicates to semantic colors and clear short labels", () => {
    // 1. Lineage / 親子 (Gold)
    const parent = getRelationMeta("parent_of");
    expect(parent.family).toBe("lineage");
    expect(parent.color).toBe("#fbbf24");
    expect(parent.shortLabel).toBe("親➔子");

    const birth = getRelationMeta("gives_birth_to");
    expect(birth.family).toBe("lineage");
    expect(birth.shortLabel).toBe("生む");

    // 2. Conflict / 対立 (Red with dash)
    const conflict = getRelationMeta("opposed");
    expect(conflict.family).toBe("conflict");
    expect(conflict.color).toBe("#f87171");
    expect(conflict.strokeDasharray).toBe("4 3");
    expect(conflict.icon).toBe("⚔️");

    // 3. Alliance / 誓約 (Aqua)
    const vow = getRelationMeta("participates_in");
    expect(vow.family).toBe("alliance");
    expect(vow.color).toBe("#34d399");
    expect(vow.shortLabel).toBe("誓約");

    // 4. Enshrinement / 奉斎 (Purple)
    const enshrine = getRelationMeta("enshrined_at");
    expect(enshrine.family).toBe("enshrinement");
    expect(enshrine.color).toBe("#c084fc");
    expect(enshrine.shortLabel).toBe("奉斎");

    // 5. Governance / 統治 (Violet)
    const rule = getRelationMeta("ruled");
    expect(rule.family).toBe("governance");
    expect(rule.color).toBe("#a78bfa");

    // 6. Fallback unknown predicate
    const unknown = getRelationMeta("custom_unknown_action", "lineage");
    expect(unknown.family).toBe("lineage");
    expect(unknown.color).toBe("#fbbf24");
  });

  it("provides informative structural theses for registered topics", () => {
    // Munakata genealogy thesis
    const munakataThesis = getTopicStructuralThesis({
      id: "munakata-genealogy",
      label: "誓約神話と皇統譜の創始",
    });
    expect(munakataThesis).toContain("誓約");
    expect(munakataThesis).toContain("宗像三女神");

    // Izumo thesis
    const izumoThesis = getTopicStructuralThesis({
      id: "izumo-kunitsukami-preset",
      label: "出雲国譲り神話",
    });
    expect(izumoThesis).toContain("国譲り");
    expect(izumoThesis).toContain("出雲大社");

    // Fallback for custom topic
    const customThesis = getTopicStructuralThesis({
      id: "custom-topic-id",
      label: "新トピック",
      description: "独自の構造解説文です。",
    });
    expect(customThesis).toBe("独自の構造解説文です。");
  });

  it("audits all registered topics have structural thesis coverage", () => {
    for (const topic of registeredLensTopics) {
      const thesis = getTopicStructuralThesis(topic);
      expect(thesis.length, `Topic ${topic.id} should have a non-empty thesis`).toBeGreaterThanOrEqual(15);
    }
  });

  it("calculates visual node tiers ensuring prominent hierarchy for core nodes", () => {
    const tier1 = getNodeVisualTier({ isRootOrCore: true });
    expect(tier1.tier).toBe(1);
    expect(tier1.height).toBe(34);
    expect(tier1.fontSize).toBe(12);
    expect(tier1.isProminent).toBe(true);

    const tier2 = getNodeVisualTier({ level: 1, degree: 3 });
    expect(tier2.tier).toBe(2);
    expect(tier2.height).toBe(28);
    expect(tier2.fontSize).toBe(11);
    expect(tier2.isProminent).toBe(false);

    const tier3 = getNodeVisualTier({ level: 2, degree: 1 });
    expect(tier3.tier).toBe(3);
    expect(tier3.height).toBe(26);
    expect(tier3.isProminent).toBe(false);
  });
});
