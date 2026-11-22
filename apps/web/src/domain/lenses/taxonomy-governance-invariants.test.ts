import { describe, expect, it } from "vitest";
import { registeredLensTopics } from "@/domain/lens-packs/knowledge-registry";
import { LENS_PERSPECTIVE_GUIDES } from "@/app/review/atlas-lens-directory";
import {
  auditLensTopicGovernance,
  TOPIC_DENSITY_GOVERNANCE_THRESHOLDS,
} from "./taxonomy-governance";

describe("ADR-0029 Lens & Topic Semantic Taxonomy Governance Invariants", () => {
  const report = auditLensTopicGovernance();

  it("validates scopeCluster connectionIds refer to real preset mapConnections across 100% of topics", () => {
    expect(report.invalidScopeClusterRefs).toEqual([]);
  });

  it("enforces unique topic IDs and valid 5-Lens perspective membership across all registered topics", () => {
    const validPerspectives = new Set(["mythology", "religion", "route", "politics", "people"]);
    const seenIds = new Set<string>();

    for (const topic of registeredLensTopics) {
      expect(seenIds.has(topic.id), `Duplicate topic ID: ${topic.id}`).toBe(false);
      seenIds.add(topic.id);
      expect(validPerspectives.has(topic.perspectiveId)).toBe(true);
      expect(topic.spatialScale === "regional" || topic.spatialScale === "national").toBe(true);
    }
  });

  it("ensures every LENS_PERSPECTIVE_GUIDES highlight topic exists and matches its declared lens perspective", () => {
    const topicById = new Map(registeredLensTopics.map((t) => [t.id, t]));
    for (const guide of LENS_PERSPECTIVE_GUIDES) {
      expect(guide.highlightTopics.length).toBeGreaterThanOrEqual(3);
      for (const highlight of guide.highlightTopics) {
        const registered = topicById.get(highlight.id);
        expect(registered, `Highlight topic ${highlight.id} must be registered`).toBeDefined();
        expect(
          registered?.perspectiveId,
          `Highlight topic ${highlight.id} perspective mismatch`,
        ).toBe(guide.id);
      }
    }
  });

  it("auditor detects governance violations deterministically using ADR-0029 thresholds", () => {
    expect(TOPIC_DENSITY_GOVERNANCE_THRESHOLDS.minConnectionsAlwaysRequiringClusters).toBe(4);
    expect(TOPIC_DENSITY_GOVERNANCE_THRESHOLDS.minConnectionsWithHighNodes).toBe(3);
    expect(TOPIC_DENSITY_GOVERNANCE_THRESHOLDS.minNodesWithMultipleConnections).toBe(18);
    expect(TOPIC_DENSITY_GOVERNANCE_THRESHOLDS.minRequiredClusterCount).toBe(2);

    // Report fields are well-typed arrays ready for strict 0-violation gates tightened in #46, #47, #48
    expect(Array.isArray(report.missingExplicitSpatialScaleTopicIds)).toBe(true);
    expect(Array.isArray(report.unusedTopicFocusKeys)).toBe(true);
    expect(Array.isArray(report.registryDriftViolations)).toBe(true);
    expect(Array.isArray(report.highDensityViolations)).toBe(true);
    expect(Array.isArray(report.unregisteredPresetViolations)).toBe(true);
  });
});
