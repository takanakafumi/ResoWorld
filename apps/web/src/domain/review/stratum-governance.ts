import type { Claim } from "@/domain/knowledge/schema";
import {
  CHRONOLOGICAL_STRATA,
  NON_PREHISTORIC_L1_KIND_BLOCK_TOKENS,
  STRATUM_CALENDAR_YEAR_BOUNDS,
  STRATUM_EVIDENCE_RULES,
  buildClaimsByIdMap,
  getSpotStratumMemberships,
  isCalendarTimeWithinStratumBounds,
  isNonPrehistoricSpotForL1Kind,
  isUmbrellaCrossSpotClaimForSpot,
  type StratumCode,
  type StratumLayer,
} from "./stratum-types";
import type { ReviewAtlasSpot } from "./types";

export {
  NON_PREHISTORIC_L1_KIND_BLOCK_TOKENS,
  STRATUM_CALENDAR_YEAR_BOUNDS,
  isCalendarTimeWithinStratumBounds,
  isNonPrehistoricSpotForL1Kind,
  isUmbrellaCrossSpotClaimForSpot,
};

export type CalendarYearViolation = {
  spotId: string;
  spotName: string;
  stratumCode: StratumCode;
  claimId: string;
  startYear: number;
  endYear: number;
  label?: string;
};

export type UmbrellaClaimBleedViolation = {
  spotId: string;
  spotName: string;
  stratumCode: StratumCode;
  claimId: string;
  claimKind: Claim["claimKind"];
  subjectName: string;
  placeCount: number;
  matchedToken: string;
};

export type KindMismatchViolation = {
  spotId: string;
  spotName: string;
  spotKind: string;
  stratumCode: StratumCode;
  reason: string;
};

export type UnsafeRegexRuleViolation = {
  stratumCode: StratumCode;
  field: "claimEvidencePatterns" | "archetypePatterns";
  patternSource: string;
  reason: string;
};

export type ArchetypeSubstringViolation = {
  spotId: string;
  spotName: string;
  spotKind: string;
  stratumCode: StratumCode;
  matchedToken: string;
};

export type StratumGovernanceReport = {
  calendarYearViolations: CalendarYearViolation[];
  umbrellaClaimBleedViolations: UmbrellaClaimBleedViolation[];
  kindMismatchViolations: KindMismatchViolation[];
  unsafeRegexRuleViolations: UnsafeRegexRuleViolation[];
  archetypeSubstringViolations: ArchetypeSubstringViolation[];
};

export type StratumGovernanceAuditInput = {
  spots: readonly ReviewAtlasSpot[];
  claims: readonly Claim[];
  strata?: readonly StratumLayer[];
  rules?: typeof STRATUM_EVIDENCE_RULES;
};

/**
 * ADR-0030: STRATUM 時代地層判定の純粋ガバナンス監査器。
 * 全スポットおよびルール辞書を走査し、5カテゴリの構造的誤判定リスクを検出する。
 */
export function auditStratumGovernance(
  input: StratumGovernanceAuditInput,
): StratumGovernanceReport {
  const strata = input.strata ?? CHRONOLOGICAL_STRATA;
  const rules = input.rules ?? STRATUM_EVIDENCE_RULES;
  const claimsById = buildClaimsByIdMap(input.claims);
  const memberships = getSpotStratumMemberships(input.spots, strata, { claimsById });

  const calendarYearViolations: CalendarYearViolation[] = [];
  const umbrellaClaimBleedViolations: UmbrellaClaimBleedViolation[] = [];
  const kindMismatchViolations: KindMismatchViolation[] = [];
  const unsafeRegexRuleViolations: UnsafeRegexRuleViolation[] = [];
  const archetypeSubstringViolations: ArchetypeSubstringViolation[] = [];

  // 1–3, 5: スポット別判定根拠の監査
  for (const spot of input.spots) {
    const membership = memberships.get(spot.id);
    if (!membership?.details) continue;

    for (const detail of membership.details) {
      if (!detail.matched || !detail.basis) continue;
      const code = detail.layer.code;

      // (1) Calendar 年代レンジ整合監査
      if (detail.basis.claimId) {
        const claim = claimsById.get(detail.basis.claimId);
        if (claim?.historicalTime?.kind === "calendar") {
          const startYear = claim.historicalTime.startYear;
          const endYear = claim.historicalTime.endYear ?? startYear;
          if (!isCalendarTimeWithinStratumBounds(startYear, endYear, code)) {
            calendarYearViolations.push({
              spotId: spot.id,
              spotName: spot.name,
              stratumCode: code,
              claimId: claim.id,
              startYear,
              endYear,
              label: claim.historicalTime.label,
            });
          }
        }

        // (2) 広域まとめ Claim による他地点汚染監査
        if (claim && isUmbrellaCrossSpotClaimForSpot(claim, spot)) {
          umbrellaClaimBleedViolations.push({
            spotId: spot.id,
            spotName: spot.name,
            stratumCode: code,
            claimId: claim.id,
            claimKind: claim.claimKind,
            subjectName: claim.subject.name,
            placeCount: claim.places.length,
            matchedToken: detail.basis.matchedToken,
          });
        }
      }

      // (3) spot_kind による非先史遺構の L1 誤流入監査
      if (detail.basis.kind === "spot_kind") {
        if (code === "animism" && isNonPrehistoricSpotForL1Kind(spot)) {
          kindMismatchViolations.push({
            spotId: spot.id,
            spotName: spot.name,
            spotKind: spot.kind,
            stratumCode: code,
            reason: `非先史遺構（${spot.name} / ${spot.kind}）が spot_kind で L1 先史層へ誤分類`,
          });
        }
      }

      // (5) 名称・地域アーキタイプ部分一致による近世城郭・古代山城の L4 誤流入監査
      if (
        detail.basis.kind === "known_tradition" &&
        detail.basis.evidenceQuote.includes("アーキタイプ") &&
        code === "syncretism" &&
        (spot.kind === "castle" || spot.kind.includes("古代山城"))
      ) {
        archetypeSubstringViolations.push({
          spotId: spot.id,
          spotName: spot.name,
          spotKind: spot.kind,
          stratumCode: code,
          matchedToken: detail.basis.matchedToken,
        });
      }
    }
  }

  // (4) ルール辞書の危険短語・無境界部分一致の静的監査
  const syncretismRule = rules.syncretism;
  if (syncretismRule) {
    for (const pattern of syncretismRule.claimEvidencePatterns) {
      if (pattern.test("祇園山古墳")) {
        unsafeRegexRuleViolations.push({
          stratumCode: "syncretism",
          field: "claimEvidencePatterns",
          patternSource: pattern.source,
          reason: "「祇園山古墳」の地名に誤一致する無境界の祇園パターンが含まれています",
        });
      }
      if (pattern.test("古代山城") || pattern.test("福山城")) {
        unsafeRegexRuleViolations.push({
          stratumCode: "syncretism",
          field: "claimEvidencePatterns",
          patternSource: pattern.source,
          reason: "「古代山城」または「福山城」に誤一致する無境界の山城パターンが含まれています",
        });
      }
    }
    for (const pattern of syncretismRule.archetypePatterns) {
      if (pattern.test("福山城") || pattern.test("高良山古代山城")) {
        unsafeRegexRuleViolations.push({
          stratumCode: "syncretism",
          field: "archetypePatterns",
          patternSource: pattern.source,
          reason: "近世城郭・古代山城名称に誤一致する無境界の山城アーキタイプが含まれています",
        });
      }
    }
  }

  return {
    calendarYearViolations,
    umbrellaClaimBleedViolations,
    kindMismatchViolations,
    unsafeRegexRuleViolations,
    archetypeSubstringViolations,
  };
}
