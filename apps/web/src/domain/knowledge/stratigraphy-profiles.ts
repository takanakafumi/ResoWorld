import type { SacredSiteStratigraphyProfile } from "./source-evaluation";
import { CHIKUGO_HIZEN_STRATIGRAPHY_PROFILES } from "./stratigraphy/chikugo-hizen-profiles";
import { FUKUOKA_CHIKUSHI_STRATIGRAPHY_PROFILES } from "./stratigraphy/fukuoka-chikushi-profiles";
import { KYUSHU_WIDE_WESTERN_JAPAN_STRATIGRAPHY_PROFILES } from "./stratigraphy/kyushu-wide-western-japan-profiles";
import { MUNAKATA_KANMON_CHIKUHO_STRATIGRAPHY_PROFILES } from "./stratigraphy/munakata-kanmon-chikuho-profiles";

export {
  REGIONAL_COMPARISON_ENTRIES,
  SOURCE_TRADITION_COMPARISON_ENTRIES,
} from "./stratigraphy/comparisons";

/**
 * 代表的な重層聖域スポットの「祭祀史7項目（Sacred Site Stratigraphy Profile）」統合レジストリ
 * - 実体は `./stratigraphy/` 配下の地域別モジュールで管理し、単一バレルとして集約する。
 * - 「現在の祭神・社伝の主張（史料B/C・確度B）」と「考古・古代基礎史料で確認できる基底層（史料A・確度A）」を明確に分離して保持する。
 */
export const SACRED_SITE_STRATIGRAPHY_PROFILES: readonly SacredSiteStratigraphyProfile[] = [
  ...MUNAKATA_KANMON_CHIKUHO_STRATIGRAPHY_PROFILES,
  ...FUKUOKA_CHIKUSHI_STRATIGRAPHY_PROFILES,
  ...CHIKUGO_HIZEN_STRATIGRAPHY_PROFILES,
  ...KYUSHU_WIDE_WESTERN_JAPAN_STRATIGRAPHY_PROFILES,
];

function normalizeNameForMatch(value: string): string {
  return value
    .normalize("NFKC")
    .replace(/[\s・（）()「」『』]/g, "")
    .replace(/嚴/g, "厳")
    .toLowerCase();
}

/**
 * スポット情報（ID・名称・地域）から該当する祭祀史7項目プロファイルを解決する
 * 【厳格なエンティティ解決規約】
 * 1. targetSpotIds による完全ID一致を最優先する。
 * 2. 名称照合は正規化後の完全一致（===）のみを許可する。部分一致（includes）は同名・同字の誤認汚染を防ぐため禁止。
 * 3. プロファイルに targetRegion が定義されており、スポットに region がある場合、地域スコープが合致することを確認する。
 */
export function resolveSpotStratigraphyProfile(spot: {
  id?: string;
  name: string;
  region?: string;
}): SacredSiteStratigraphyProfile | undefined {
  if (spot.id) {
    const matchedById = SACRED_SITE_STRATIGRAPHY_PROFILES.find((profile) =>
      profile.targetSpotIds?.includes(spot.id!),
    );
    if (matchedById) return matchedById;
  }

  const normalizedSpotName = normalizeNameForMatch(spot.name);
  if (!normalizedSpotName) return undefined;

  const normalizedSpotRegion = spot.region
    ? normalizeNameForMatch(spot.region)
    : undefined;

  return SACRED_SITE_STRATIGRAPHY_PROFILES.find((profile) => {
    // 地域スコープガード：プロファイルに地域が指定されている場合、スポット地域と不一致なら除外
    if (profile.targetRegion && normalizedSpotRegion) {
      const normalizedTargetRegion = normalizeNameForMatch(profile.targetRegion);
      const regionMatches =
        normalizedSpotRegion.includes(normalizedTargetRegion) ||
        normalizedTargetRegion.includes(normalizedSpotRegion);
      if (!regionMatches) {
        return false;
      }
    }

    return profile.spotNames.some((candidate) => {
      const normalizedCandidate = normalizeNameForMatch(candidate);
      return normalizedSpotName === normalizedCandidate;
    });
  });
}

/**
 * スポットがプロファイルの「主座（一次判定対象）」であるかを判定する。
 * - primarySpotIds が定義されている場合：spot.id が含まれるかを最優先。
 * - spot.id が無く spot.name がある場合：primarySpotNames との完全一致を検証。
 * - いずれも未定義の場合：targetSpotIds の先頭要素または単一要素を主座とみなす。
 *
 * 【二層分離アーキテクチャの役割】
 * - 地層判定（Stratum Matching）：主座以外の構成スポット（斎宮跡、審神者社、六所宮跡、奥宮磐座、山頂、寺院等）が
 *   主座の広域5層通史プロファイル（Section 2）を不当に継承（汚染）するのを防ぎ、
 *   スポット固有の物証（Claims, Kind, Tokens）に基づいた客観的層数を算出する。
 * - 背景解説（Context Profile）：UIでのスポット選択時には、構成スポットであっても
 *   所属する聖域群の祭祀史プロファイルカード（7項目）を引き続き参照・読解できる。
 */
export function isPrimarySiteForStratigraphy(
  spot: { id?: string; name: string },
  profile: SacredSiteStratigraphyProfile,
): boolean {
  if (profile.primarySpotIds && profile.primarySpotIds.length > 0) {
    if (spot.id && profile.primarySpotIds.includes(spot.id)) {
      return true;
    }
  }

  if (profile.primarySpotId) {
    if (spot.id && spot.id === profile.primarySpotId) {
      return true;
    }
  }

  // IDで判定できない場合（ID未指定のスポット等）、主座名称リストと正規化完全一致で検証
  if (profile.primarySpotNames && profile.primarySpotNames.length > 0) {
    const normalizedSpotName = normalizeNameForMatch(spot.name);
    if (normalizedSpotName) {
      const nameMatches = profile.primarySpotNames.some(
        (pn) => normalizeNameForMatch(pn) === normalizedSpotName,
      );
      if (nameMatches) return true;
    }
  }

  // primarySpotIds も primarySpotNames も指定されていない場合の安全なフォールバック
  if (
    !profile.primarySpotIds?.length &&
    !profile.primarySpotId &&
    !profile.primarySpotNames?.length
  ) {
    if (!profile.targetSpotIds || profile.targetSpotIds.length <= 1) {
      return true;
    }
    if (spot.id) {
      return spot.id === profile.targetSpotIds[0];
    }
    const normalizedSpotName = normalizeNameForMatch(spot.name);
    return normalizeNameForMatch(profile.spotNames[0] ?? "") === normalizedSpotName;
  }

  return false;
}
