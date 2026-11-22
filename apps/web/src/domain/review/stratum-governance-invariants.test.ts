import { describe, expect, it } from "vitest";
import publishedDataset from "@/data/published-review-dataset.json";
import type { Claim } from "@/domain/knowledge/schema";
import {
  auditStratumGovernance,
  isCalendarTimeWithinStratumBounds,
  isNonPrehistoricSpotForL1Kind,
  isUmbrellaCrossSpotClaimForSpot,
} from "./stratum-governance";
import {
  CHRONOLOGICAL_STRATA,
  STRATUM_EVIDENCE_RULES,
  buildClaimsByIdMap,
  getSpotStratumDetailReport,
} from "./stratum-types";
import type { ReviewAtlasSpot } from "./types";

describe("ADR-0030 STRATUM Governance Auditor (地層判定ガバナンス監査)", () => {
  const spots = publishedDataset.atlas.spots as ReviewAtlasSpot[];
  const claims = publishedDataset.claims as Claim[];

  it("validates structured calendar year bounds across all 5 strata", () => {
    expect(isCalendarTimeWithinStratumBounds(250, 300, "animism")).toBe(true);
    expect(isCalendarTimeWithinStratumBounds(660, 678, "animism")).toBe(false);
    expect(isCalendarTimeWithinStratumBounds(660, 678, "ancient-state")).toBe(true);
    expect(isCalendarTimeWithinStratumBounds(660, 678, "syncretism")).toBe(false);
    expect(isCalendarTimeWithinStratumBounds(927, 927, "ritsuryo")).toBe(true);
    expect(isCalendarTimeWithinStratumBounds(1869, 1869, "ritsuryo")).toBe(false);
    expect(isCalendarTimeWithinStratumBounds(1655, 1660, "modern-reconstruction")).toBe(true);
    expect(isCalendarTimeWithinStratumBounds(1655, 1660, "syncretism")).toBe(false);
  });

  it("detects umbrella cross-spot claims regardless of claimKind (synthesis / observation / hypothesis)", () => {
    const umbrellaClaim = {
      schemaVersion: "0.2.0",
      id: "claim-synthetic-umbrella",
      statement: "広域まとめ記述",
      subject: { name: "福岡市博物館", type: "Place" },
      predicate: "summarizes",
      object: { kind: "literal", value: "summary" },
      qualifiers: {},
      claimKind: "hypothesis",
      originType: "imported",
      reviewStatus: "confirmed",
      epistemic: { verification: "personal-evidence", modality: "interpretive" },
      temporalScope: "historical_target",
      historicalTime: { kind: "named", label: "古代〜現代", precision: "broad-range" },
      places: [
        { name: "福岡市博物館", role: "observed_place" },
        { name: "水城", role: "observed_place" },
        { name: "金印公園", role: "observed_place" },
      ],
      evidence: [],
      createdAt: "2026-11-22T00:00:00Z",
    } as unknown as Claim;

    expect(isUmbrellaCrossSpotClaimForSpot(umbrellaClaim, { id: "spot-kin-in-park", name: "金印公園" })).toBe(true);
    expect(
      isUmbrellaCrossSpotClaimForSpot(umbrellaClaim, { id: "spot-fukuoka-city-museum", name: "福岡市博物館" }),
    ).toBe(false);
  });

  it("flags non-prehistoric spot names/kinds against L1 spot_kind auto-matching", () => {
    expect(isNonPrehistoricSpotForL1Kind({ name: "国史跡 船原古墳", kind: "遺跡・国史跡・金銅製馬具" })).toBe(true);
    expect(isNonPrehistoricSpotForL1Kind({ name: "大宰府客館跡", kind: "古代官衙遺跡・迎賓施設" })).toBe(true);
    expect(isNonPrehistoricSpotForL1Kind({ name: "香椎潟 万葉歌碑", kind: "記念碑・文学遺跡" })).toBe(true);
    expect(isNonPrehistoricSpotForL1Kind({ name: "平塚川添遺跡", kind: "遺跡・歴史公園" })).toBe(false);
  });

  it("detects unsafe bare substring patterns when injected into rules", () => {
    const injectedRules = {
      ...STRATUM_EVIDENCE_RULES,
      syncretism: {
        ...STRATUM_EVIDENCE_RULES.syncretism,
        claimEvidencePatterns: [...STRATUM_EVIDENCE_RULES.syncretism.claimEvidencePatterns, /祇園/, /山城/],
      },
    };
    const report = auditStratumGovernance({ spots: [], claims: [], rules: injectedRules });
    expect(report.unsafeRegexRuleViolations.length).toBeGreaterThanOrEqual(2);
  });

  it("locks all 5 ADR-0030 governance metrics at ZERO violations across the entire live Atlas dataset (#50)", () => {
    const report = auditStratumGovernance({ spots, claims });
    expect(report.calendarYearViolations).toEqual([]);
    expect(report.umbrellaClaimBleedViolations).toEqual([]);
    expect(report.kindMismatchViolations).toEqual([]);
    expect(report.unsafeRegexRuleViolations).toEqual([]);
    expect(report.archetypeSubstringViolations).toEqual([]);
  });

  it("verifies horizontal cleanup of L1 spot_kind and L4 umbrella Claim false positives across Atlas (#50)", () => {
    const claimsById = buildClaimsByIdMap(claims);
    const matchedCodesOf = (spotId: string) => {
      const spot = spots.find((s) => s.id === spotId);
      expect(spot, `Expected spot ${spotId}`).toBeDefined();
      return getSpotStratumDetailReport(spot!, CHRONOLOGICAL_STRATA, { claimsById }).matchedLayers.map(
        (l) => l.code,
      );
    };

    // 非先史遺構（古墳・古代官衙・文学歌碑）が spot_kind「遺跡」部分一致で L1 先史層へ漏洩しないこと
    expect(matchedCodesOf("spot-funabaru-kofun")).not.toContain("animism");
    expect(matchedCodesOf("spot-dazaifu-kyakukan")).not.toContain("animism");
    expect(matchedCodesOf("spot-kashiigata-manyo-monument")).not.toContain("animism");

    // 広域まとめ Claim（福岡市博物館・香椎宮主語）が水城・金印公園・香椎潟歌碑へ L4 中世層を漏洩させないこと
    expect(matchedCodesOf("spot-mizuki-fortification")).not.toContain("syncretism");
    expect(matchedCodesOf("spot-kin-in-park")).not.toContain("syncretism");
    expect(matchedCodesOf("spot-kashiigata-manyo-monument")).not.toContain("syncretism");
  });
});
