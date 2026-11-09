import type { Claim } from "@/domain/knowledge/schema";
import type { ReviewAtlasSpot } from "@/domain/review/types";

export type RebindableClaimMatch = {
  claimId: string;
  statement: string;
  currentAnchorPlaceName: string;
  matchedIntendedPlaceName: string;
  reason: "intended_place_matched" | "alias_matched";
};

/**
 * 新設または昇格した現地スポットに対し、過去に展示館等に退避していた再バインド可能なClaimを検出する
 */
export function detectRebindableClaims({
  spot,
  claims,
  spotAliases = [],
}: {
  spot: Pick<ReviewAtlasSpot, "id" | "name">;
  claims: readonly Claim[];
  spotAliases?: readonly string[];
}): RebindableClaimMatch[] {
  const targetNames = new Set([spot.name, ...spotAliases].map((n) => n.trim().toLowerCase()));
  const matches: RebindableClaimMatch[] = [];

  for (const claim of claims) {
    if (!claim.places || claim.places.length === 0) continue;

    // 1. role === "intended_place" の明示的な指定を走査
    const intendedRef = claim.places.find(
      (p) => p.role === "intended_place" && targetNames.has(p.name.trim().toLowerCase()),
    );

    if (intendedRef) {
      const currentAnchor =
        claim.places.find((p) => p.role === "observed_place" || p.role === "evidence_place" || p.role === "subject_place")?.name ??
        "未指定の観測地";

      matches.push({
        claimId: claim.id,
        statement: claim.statement,
        currentAnchorPlaceName: currentAnchor,
        matchedIntendedPlaceName: intendedRef.name,
        reason: "intended_place_matched",
      });
      continue;
    }

    // 2. statement または object の名前から、退避中クレームのエイリアス照合
    const isSubjectOrObjectRelated =
      claim.subject?.name && targetNames.has(claim.subject.name.trim().toLowerCase());

    if (isSubjectOrObjectRelated) {
      const currentAnchor = claim.places[0]?.name ?? "";
      // 現在のアンカー地が自身と異なり、かつ展示館や資料館等である場合
      if (currentAnchor && !targetNames.has(currentAnchor.trim().toLowerCase())) {
        matches.push({
          claimId: claim.id,
          statement: claim.statement,
          currentAnchorPlaceName: currentAnchor,
          matchedIntendedPlaceName: claim.subject.name,
          reason: "alias_matched",
        });
      }
    }
  }

  return matches;
}

/**
 * 検出されたClaimのplacesを現地スポットへ再バインド（更新）し、スポット側のclaimIdsにも統合する
 */
export function rebindClaimsToNewSpot({
  spot,
  claims,
  claimIdsToRebind,
}: {
  spot: ReviewAtlasSpot;
  claims: readonly Claim[];
  claimIdsToRebind: readonly string[];
}): {
  updatedSpot: ReviewAtlasSpot;
  updatedClaims: Claim[];
} {
  const rebindSet = new Set(claimIdsToRebind);
  const updatedClaims = claims.map((claim) => {
    if (!rebindSet.has(claim.id)) return claim;

    // 既存の places を更新:
    // 現地スポットを subject_place として主座に据え、元の展示館等は evidence_place として残す
    const existingPlaces = claim.places ?? [];
    const nonTargetPlaces = existingPlaces.filter(
      (p) => p.name.trim().toLowerCase() !== spot.name.trim().toLowerCase() && p.role !== "intended_place",
    );

    // 元の展示場所を evidence_place に変換して保持（物証の連続性保護）
    const evidencePlaces = nonTargetPlaces.map((p) => ({
      ...p,
      role: "evidence_place" as const,
    }));

    return {
      ...claim,
      places: [
        { name: spot.name, role: "subject_place" as const },
        ...evidencePlaces,
      ],
    };
  });

  const nextClaimIds = [...new Set([...(spot.claimIds ?? []), ...claimIdsToRebind])];

  const updatedSpot: ReviewAtlasSpot = {
    ...spot,
    claimIds: nextClaimIds,
  };

  return { updatedSpot, updatedClaims };
}
