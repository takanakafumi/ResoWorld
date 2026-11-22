import type { Claim } from "@/domain/knowledge/schema";
import {
  CHRONOLOGICAL_STRATA,
  STRATUM_CALENDAR_YEAR_BOUNDS,
  STRATUM_EVIDENCE_RULES,
  buildClaimsByIdMap,
  getSpotStratumMemberships,
  type StratumCode,
  type StratumLayer,
} from "./stratum-types";
import type { ReviewAtlasSpot } from "./types";

/**
 * ADR-0030: 非先史遺構（古墳・古代官衙・歌碑・記念碑・城跡・寺院等）が
 * `spot_kind` の文字列部分一致のみで L1（先史・縄文〜弥生）へ誤流入するのを検知する語彙集合。
 */
export const NON_PREHISTORIC_L1_KIND_BLOCK_TOKENS = [
  "古墳",
  "官衙",
  "歌碑",
  "記念碑",
  "文学",
  "城跡",
  "天満宮",
  "寺院",
] as const;

/**
 * 構造化 calendar 年代（startYear / endYear）が指定地層の許容レンジと交差するか判定する。
 */
export function isCalendarTimeWithinStratumBounds(
  startYear: number,
  endYear: number | undefined,
  stratumCode: StratumCode,
): boolean {
  const effectiveEnd = endYear ?? startYear;
  const bounds = STRATUM_CALENDAR_YEAR_BOUNDS[stratumCode];
  if (bounds.maxStartYear !== undefined && startYear > bounds.maxStartYear) {
    return false;
  }
  if (bounds.minEndYear !== undefined && effectiveEnd < bounds.minEndYear) {
    return false;
  }
  return true;
}

/**
 * ADR-0030 基準2: 広域まとめ・複数地点横断 Claim 判定。
 * `claimKind`（synthesis / observation / hypothesis 等）を問わず、
 * 3地点以上（または synthesis かつ 2地点以上）を横断し、主語（Place）が評価対象スポットと異なる場合 true。
 */
export function isUmbrellaCrossSpotClaimForSpot(
  claim: Claim,
  spot: Pick<ReviewAtlasSpot, "id" | "name">,
): boolean {
  const placeCount = claim.places?.length ?? 0;
  const isCrossSpotScope =
    placeCount >= 3 || (claim.claimKind === "synthesis" && placeCount >= 2);
  if (!isCrossSpotScope) return false;
  if (claim.subject.type !== "Place") return false;

  const subjectIdMatch =
    Boolean(claim.subject.id) && spot.id === `spot-${claim.subject.id}`;
  const subjectNameMatch =
    spot.name === claim.subject.name ||
    spot.name.includes(claim.subject.name) ||
    claim.subject.name.includes(spot.name);

  return !subjectIdMatch && !subjectNameMatch;
}

/**
 * ADR-0030 基準3: スポットの名称・種別が非先史遺構（古墳・官衙・歌碑・城跡等）を明示しているか判定する。
 */
export function isNonPrehistoricSpotForL1Kind(
  spot: Pick<ReviewAtlasSpot, "name" | "kind">,
): boolean {
  return NON_PREHISTORIC_L1_KIND_BLOCK_TOKENS.some(
    (token) => spot.name.includes(token) || spot.kind.includes(token),
  );
}

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
