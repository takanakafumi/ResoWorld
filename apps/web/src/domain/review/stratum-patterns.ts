import {
  SACRED_SITE_STRATIGRAPHY_PROFILES,
  resolveSpotStratigraphyProfile,
} from "@/domain/knowledge/stratigraphy-profiles";
import {
  CHRONOLOGICAL_STRATA,
  type SpotStratumMembership,
  type StratumCode,
  type StratumLayer,
} from "./stratum-types";
import type { ReviewAtlasSpot } from "./types";

/**
 * 重層パターン分類ルール（宣言的データ）
 * 地点ごとの分岐は書かず、「満たした地層の並び方」だけで分類する。先頭から順に評価し、最初に合致したルールを採用する。
 * - minCount / maxCount: 満たした地層の数
 * - contiguity: 満たした地層が隣り合っているか（"any" は問わない）
 * - onlyLayerCodes: 指定した場合、満たした地層がすべてこの集合に含まれること
 */
export type StratumPatternRule = {
  id: string;
  label: string;
  /** 読み取りの手がかり（断定を避けた示唆）。ユーザーの気づきの入口として表示する */
  insight: string;
  minCount: number;
  maxCount: number;
  contiguity: "any" | "contiguous" | "gapped";
  onlyLayerCodes?: readonly StratumCode[];
};

export const STRATUM_PATTERN_RULES: readonly StratumPatternRule[] = [
  {
    id: "full-column",
    label: "全層貫通型",
    insight: "先史から近世・近代まで、すべての時代の層が登録されている聖地",
    minCount: CHRONOLOGICAL_STRATA.length,
    maxCount: CHRONOLOGICAL_STRATA.length,
    contiguity: "any",
  },
  {
    id: "continuous",
    label: "連続積層型",
    insight: "隣り合う時代の層が途切れずに積み重なっている地点",
    minCount: 2,
    maxCount: CHRONOLOGICAL_STRATA.length - 1,
    contiguity: "contiguous",
  },
  {
    id: "gapped",
    label: "飛び石型",
    insight:
      "間の時代の層が空いている地点。時代を飛んで再び聖地化された可能性があるが、記録が未登録なだけの場合もある",
    minCount: 2,
    maxCount: CHRONOLOGICAL_STRATA.length - 1,
    contiguity: "gapped",
  },
  {
    id: "ancient-only",
    label: "古層単独型",
    insight: "原初・古代の層だけが登録されている地点。後世の層が未登録（保存された、または未調査）",
    minCount: 1,
    maxCount: 1,
    contiguity: "any",
    onlyLayerCodes: ["animism", "ancient-state"],
  },
  {
    id: "ritsuryo-only",
    label: "律令期単独型",
    insight: "律令神祇・式内社の層だけが登録されている地点",
    minCount: 1,
    maxCount: 1,
    contiguity: "any",
    onlyLayerCodes: ["ritsuryo"],
  },
  {
    id: "later-only",
    label: "後世単独型",
    insight: "中世以降の層だけが登録されている地点。古い層は未登録",
    minCount: 1,
    maxCount: 1,
    contiguity: "any",
    onlyLayerCodes: ["syncretism", "modern-reconstruction"],
  },
];

/** 聖域複合体として並べる条件（宣言的定数） */
export const SANCTUARY_COMPLEX_MIN_SPOTS = 2;
/** 複合体の中で最も層の多い地点（里宮的な中核）がこの層数以上であること */
export const SANCTUARY_COMPLEX_MIN_ANCHOR_DEPTH = 3;

export type StratumPatternSpot = {
  spot: ReviewAtlasSpot;
  membership: SpotStratumMembership;
};

export type StratumPatternGroup = {
  rule: StratumPatternRule;
  members: readonly StratumPatternSpot[];
  /** 地層ごと（CHRONOLOGICAL_STRATA 順）の充足地点数。パターンの「形」の可視化に使う */
  layerHitCounts: readonly number[];
};

export type SanctuaryComplex = {
  profileId: string;
  title: string;
  members: readonly StratumPatternSpot[];
};

export type StratumPatternProjection = {
  totalSpots: number;
  groups: readonly StratumPatternGroup[];
  complexes: readonly SanctuaryComplex[];
};

export function classifyStratumPattern(
  strata: readonly StratumLayer[],
): StratumPatternRule | undefined {
  const count = strata.length;
  if (count === 0) return undefined;
  const orders = strata.map((layer) => layer.order);
  const isContiguous = Math.max(...orders) - Math.min(...orders) + 1 === count;
  return STRATUM_PATTERN_RULES.find((rule) => {
    if (count < rule.minCount || count > rule.maxCount) return false;
    if (rule.contiguity !== "any" && (rule.contiguity === "contiguous") !== isContiguous) {
      return false;
    }
    if (rule.onlyLayerCodes && !strata.every((layer) => rule.onlyLayerCodes!.includes(layer.code))) {
      return false;
    }
    return true;
  });
}

const compareMembers = (a: StratumPatternSpot, b: StratumPatternSpot) =>
  b.membership.strataCount - a.membership.strataCount ||
  a.spot.name.localeCompare(b.spot.name, "ja");

/**
 * 全地点の地層所属から「重層パターン」と「聖域複合体の分業」を一括で事前実体化する。
 * UI は結果を描画するだけにして、レンダリング経路で全地点を走査しない（ADR-0021）。
 * memberships は地層フィルタで絞らない全層分を渡すこと（パターンは構造全体の性質のため）。
 */
export function buildStratumPatternProjection(
  spots: readonly ReviewAtlasSpot[],
  memberships: ReadonlyMap<string, SpotStratumMembership>,
): StratumPatternProjection {
  const membersByRuleId = new Map<string, StratumPatternSpot[]>();
  const spotsByProfileId = new Map<string, StratumPatternSpot[]>();
  let totalSpots = 0;

  for (const spot of spots) {
    const membership = memberships.get(spot.id);
    if (!membership) continue;
    const entry: StratumPatternSpot = { spot, membership };

    const rule = classifyStratumPattern(membership.strata);
    if (rule) {
      totalSpots += 1;
      const list = membersByRuleId.get(rule.id) ?? [];
      list.push(entry);
      membersByRuleId.set(rule.id, list);
    }

    const profile = resolveSpotStratigraphyProfile(spot);
    if (profile) {
      const list = spotsByProfileId.get(profile.id) ?? [];
      list.push(entry);
      spotsByProfileId.set(profile.id, list);
    }
  }

  const groups: StratumPatternGroup[] = [];
  for (const rule of STRATUM_PATTERN_RULES) {
    const members = [...(membersByRuleId.get(rule.id) ?? [])].sort(compareMembers);
    if (members.length === 0) continue;
    groups.push({
      rule,
      members,
      layerHitCounts: CHRONOLOGICAL_STRATA.map(
        (layer) =>
          members.filter((m) => m.membership.strata.some((s) => s.id === layer.id)).length,
      ),
    });
  }

  const complexes: SanctuaryComplex[] = [];
  for (const profile of SACRED_SITE_STRATIGRAPHY_PROFILES) {
    const members = [...(spotsByProfileId.get(profile.id) ?? [])].sort(compareMembers);
    if (members.length < SANCTUARY_COMPLEX_MIN_SPOTS) continue;
    if (members[0].membership.strataCount < SANCTUARY_COMPLEX_MIN_ANCHOR_DEPTH) continue;
    complexes.push({ profileId: profile.id, title: profile.title, members });
  }

  return { totalSpots, groups, complexes };
}
