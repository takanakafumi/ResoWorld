import type { Claim } from "../knowledge/schema";
import {
  isPrimarySiteForStratigraphy,
  resolveSpotStratigraphyProfile,
} from "../knowledge/stratigraphy-profiles";
import type { ReviewAtlasSpot, ReviewAtlasConnection } from "./types";

export type StratumCode =
  | "animism"
  | "ancient-state"
  | "ritsuryo"
  | "syncretism"
  | "modern-reconstruction";

export type StratumLayer = {
  id: string;
  order: number;
  code: StratumCode;
  eraName: string;
  title: string;
  subtitle: string;
  description: string;
  keyConcepts: readonly string[];
  associatedTopicIds: readonly string[];
  targetSpotKinds: readonly string[];
  spotMatchers: (spot: ReviewAtlasSpot, context?: StratumResolutionContext) => boolean;
};

export type StratumResolutionContext = {
  connections?: readonly ReviewAtlasConnection[];
  topicIdsBySpotId?: Map<string, Set<string>>;
  claimsById?: ReadonlyMap<string, Claim>;
};

export type StratumMatchBasisKind =
  | "claim_observation" // 📖 旅行記の観察・記録Claim（一次根拠）
  | "historical_source" // 📜 聖地プロファイル・由緒史料（二次根拠）
  | "spot_kind" // ⛩️ 遺構・施設種別（形態根拠）
  | "topic_link" // 🏷️ 探索トピック（概念連動）
  | "known_tradition"; // 🏛️ 代表社・公知由緒・地名アーキタイプ

export type StratumMatchBasis = {
  kind: StratumMatchBasisKind;
  matchedToken: string;
  evidenceQuote: string;
  claimId?: string;
  sourceTitle?: string;
};

export type SpotStratumLayerDetail = {
  layer: StratumLayer;
  matched: boolean;
  basis?: StratumMatchBasis;
};

export type SpotStratumDetailReport = {
  spotId: string;
  spotName: string;
  details: readonly SpotStratumLayerDetail[]; // 表層（L5）から基底（L1）の順
  matchedCount: number;
  matchedLayers: readonly StratumLayer[];
  isMultiLayered: boolean;
};

export function buildClaimsByIdMap(
  claims: readonly Claim[] | undefined,
): ReadonlyMap<string, Claim> {
  const map = new Map<string, Claim>();
  if (!claims) return map;
  for (const claim of claims) {
    map.set(claim.id, claim);
  }
  return map;
}

/**
 * 博物館・駅・ホテル・飲食店等の現代ユーティリティ施設、および
 * 土地の歴史的連続性を持たない現代新設宗教景観（地層対象外 / Non-Stratum）
 */
const NON_STRATUM_KINDS = new Set([
  "station",
  "hotel",
  "restaurant",
  "bar",
  "cafe",
  "rest_house",
  "commercial_district",
  "museum",
  "博物館",
  "博物館・歴史資料館",
  "博物館・自然資料館",
  "地域市場・道の駅",
  "地域交流・道の駅",
  "生活圏・温泉",
  "温泉・入浴施設",
  "宿泊・温泉",
  "地域（行政区域）",
  "現代宗教景観",
  "現代宗教景観（構想先行型）",
  "寺院・宗教施設・現代宗教景観（構想先行型）",
  "新宗教施設",
  "民間霊場",
]);

export type NonStratumReason =
  | "museum_archive" // 学術展示・ガイダンス拠点（博物館・資料館・研究施設）
  | "modern_conception_religious" // 現代宗教景観（性格C・構想先行型）
  | "modern_infrastructure" // 旅程・生活インフラ（駅・空港・ホテル・商業・道の駅等）
  | "area_context" // 広域地域・地理コンテキスト（市町村・地方代表点）
  | "under_investigation"; // 判定保留・物証未登録

const MUSEUM_ARCHIVE_KEYWORDS = [
  "博物館",
  "資料館",
  "記念館",
  "祈念館",
  "museum",
  "体験学習館",
  "歴史館",
  "資料センター",
] as const;

export const AREA_KINDS = new Set([
  "地域（行政区域）",
  "地域・行政区域",
  "広域地域",
  "行政区域",
]);

const INFRASTRUCTURE_KINDS = new Set([
  "station",
  "hotel",
  "restaurant",
  "bar",
  "cafe",
  "rest_house",
  "commercial_district",
  "地域市場・道の駅",
  "地域市場・観光拠点",
  "地域交流・道の駅",
  "生活圏・温泉",
  "温泉・入浴施設",
  "温泉街・観光拠点",
  "宿泊・温泉",
  "橋・交通インフラ",
]);

const INFRASTRUCTURE_KEYWORDS = [
  "駅",
  "空港",
  "港",
  "バスターミナル",
  "ホテル",
  "カフェ",
  "道の駅",
  "橋",
  "大橋",
  "市場",
  "PA",
  "SA",
  "サービスエリア",
  "パーキングエリア",
] as const;

/**
 * 地層マッチ数0件（あるいは地層対象外）のスポットに対して、その理由の種別を客観的に解決する。
 * 1. 現代宗教景観 (modern_conception_religious): 宝満神宮寺等の性格C・構想先行型
 * 2. 学術展示・ガイダンス拠点 (museum_archive): 須恵町歴史民俗資料館、甘木歴史資料館等の博物館・資料館
 * 3. 旅程・生活インフラ (modern_infrastructure): 駅、ホテル、商業、道の駅等
 * 4. 判定保留・物証未登録 (under_investigation): その他
 */
export function resolveNonStratumReason(
  spot: ReviewAtlasSpot,
  profile?: ReturnType<typeof resolveSpotStratigraphyProfile>,
): NonStratumReason {
  // 1. 現代宗教景観（性格C・構想先行型）
  if (
    profile?.historicalNature === "C_LATER_RECONSTITUTION" &&
    profile?.formationModel === "conception_driven"
  ) {
    return "modern_conception_religious";
  }
  if (
    spot.kind.includes("現代宗教景観") ||
    spot.kind.includes("新宗教") ||
    spot.kind.includes("民間霊場")
  ) {
    return "modern_conception_religious";
  }

  // 2. 学術展示・ガイダンス拠点（博物館・資料館・祈念館）
  const isMuseumKind =
    spot.kind === "museum" ||
    spot.kind === "memorial" ||
    spot.kind.includes("博物館") ||
    spot.kind.includes("資料館") ||
    spot.kind.includes("記念館") ||
    spot.kind.includes("祈念館");

  const isMuseumName = MUSEUM_ARCHIVE_KEYWORDS.some((kw) =>
    spot.name.includes(kw),
  );

  if (isMuseumKind || isMuseumName) {
    return "museum_archive";
  }

  // 3. 広域地域・地理コンテキスト
  if (AREA_KINDS.has(spot.kind)) {
    return "area_context";
  }

  // 4. 旅程・生活インフラ
  if (INFRASTRUCTURE_KINDS.has(spot.kind)) {
    return "modern_infrastructure";
  }
  const isInfraName = INFRASTRUCTURE_KEYWORDS.some((kw) =>
    spot.name.includes(kw),
  );
  if (isInfraName) {
    return "modern_infrastructure";
  }

  // 5. その他・判定保留
  return "under_investigation";
}

/**
 * スポットが「古層祭祀の歴史的地層（Stratum L1〜L5）」の判定対象として適格であるかを判定する。
 * - 博物館・駅・飲食店などのユーティリティ施設は除外
 * - 広域地域・地理コンテキストは除外
 * - 土地の歴史的連続性を持たない戦後〜現代の新設単立宗教施設（ラベルC・構想先行型・最古記録が現代）は除外
 */
export function isSpotStratumEligible(
  spot: ReviewAtlasSpot,
  profile?: ReturnType<typeof resolveSpotStratigraphyProfile>,
): boolean {
  if (
    NON_STRATUM_KINDS.has(spot.kind) ||
    AREA_KINDS.has(spot.kind) ||
    spot.kind.includes("現代宗教景観") ||
    spot.name.includes("体験学習館") ||
    spot.name.includes("資料館") ||
    spot.name.includes("博物館") ||
    spot.name.includes("記念館") ||
    spot.name.includes("祈念館")
  ) {
    return false;
  }

  // 土地の歴史的連続性のない現代構想先行型施設（ラベルC）は地層対象外（Non-Stratum）
  if (profile) {
    if (
      profile.historicalNature === "C_LATER_RECONSTITUTION" &&
      profile.formationModel === "conception_driven"
    ) {
      const isModernOrigin =
        profile.oldestAttestedRecord.chronology?.targetEra?.includes("平成") ||
        profile.oldestAttestedRecord.chronology?.targetEra?.includes("現代") ||
        profile.oldestAttestedRecord.chronology?.targetEra?.includes("昭和") ||
        profile.oldestAttestedRecord.statement.includes("1994年") ||
        profile.oldestAttestedRecord.statement.includes("平成");
      if (isModernOrigin) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Claim の対象時代（historicalTime）が地層（Stratum）の時代区分と整合しているかを判定する（時代レンジ整合原則）。
 * 時代が明らかに不整合な場合（例：平成新造の観察記録が古代アニミズム層や中世神仏習合層にマッチしようとする場合）、
 * 成立根拠（basis）から除外する。
 */
export function isClaimEraAlignedWithStratum(
  claim: Claim,
  stratumCode: StratumCode,
): boolean {
  const timeLabel = claim.historicalTime?.label ?? "";
  if (!timeLabel) return true; // 時代指定がない場合はテキストパターン等で評価

  // 平成・令和・1990年代以降の現代新造・現代事象
  const isPostWarOrModernCreation = /(?:平成|令和|199\d年|20\d\d年|現代新造)/.test(timeLabel);

  if (isPostWarOrModernCreation) {
    // 現代（平成・令和）の観察・新造Claimは、古代（L1/L2/L3）や中世（L4）の成立根拠にはならない
    if (
      stratumCode === "animism" ||
      stratumCode === "ancient-state" ||
      stratumCode === "ritsuryo" ||
      stratumCode === "syncretism"
    ) {
      // ただし、Claimの時代ラベル自体に「古代〜現代」「弥生〜現代」等の通史レンジが含まれる場合を除く
      const isBroadHistoricalRange = /(?:古代|古墳|弥生|縄文|中世|平安|鎌倉).*現代|現代.*(?:古代|中世)/.test(timeLabel);
      if (!isBroadHistoricalRange) {
        return false;
      }
    }
  }

  return true;
}

/**
 * 各地層の成立条件（特定の旅程や社名の優遇ではなく、遺構・史料・Claimテキストの根拠パターンで統一判定）
 */
const STRATUM_EVIDENCE_RULES: Record<
  StratumCode,
  {
    targetKinds: readonly string[];
    archetypePatterns: readonly RegExp[];
    claimEvidencePatterns: readonly RegExp[];
    knownSpotTokens: readonly string[];
  }
> = {
  animism: {
    targetKinds: [
      "遺跡",
      "遺跡・歴史公園",
      "遺跡・古墳",
      "自然景観",
      "山岳祭祀・磐座",
      "海中島嶼聖域",
      "山・地形",
      "海岸・景勝地",
    ],
    archetypePatterns: [/磐座/, /神体山/, /孤島/, /巨石/, /環濠/, /弥生遺跡/, /海中/, /島嶼/, /刻線の石/, /王墓/, /墳墓/],
    claimEvidencePatterns: [
      /磐座/,
      /巨石|巨岩/,
      /神体山|遥拝所/,
      /環濠|弥生時代|甕棺|王墓/,
      /古神殿跡|自然の聖地|根源層/,
      /お潮井|海中の石鳥居|満潮時の渡航遮断/,
      /刻線の石|線刻石/,
      /銅鏡|内行花文鏡|副葬品/,
    ],
    knownSpotTokens: ["弥山", "沖ノ島", "三輪山", "平塚川添遺跡", "吉野ヶ里", "厳島", "大嶽山", "駒ヶ林", "平原遺跡", "三雲南小路遺跡"],
  },
  "ancient-state": {
    targetKinds: [
      "大社",
      "神宮",
      "古墳群",
      "遺跡・古墳",
      "遺跡",
      "神社・古墳",
      "海人首長墓・古墳",
      "海中島嶼聖域",
      "神社・阿曇氏総本宮",
      "神社・海浜祭祀",
    ],
    archetypePatterns: [/国家祭祀/, /海人族/, /航路/, /王権/, /三女神/, /大社/, /阿曇/, /綿津見/, /斎宮/, /審神者/, /古墳/, /古代山城/, /怡土城/, /伊都国/, /王墓/, /奴国/],
    claimEvidencePatterns: [
      /古墳|前方後円墳|前方後方墳|竪穴式石室|横穴式石室|首長墓|王墓|墳丘墓/,
      /日本書紀|古事記|風土記|記紀/,
      /神功皇后|応神天皇|武内宿禰/,
      /宗像三女神|市杵島姫|田心姫|湍津姫/,
      /綿津見|阿曇|海人|志賀三神|住吉三神|塩土老翁/,
      /大己貴|素戔嗚|事代主|少彦名|国常立|豊玉姫/,
      /斎宮|審神者|中臣烏賊津/,
      /古代山城|怡土城|水城|大野城|基肄城/,
      /銅鏡|内行花文鏡|副葬品|金印/,
    ],
    knownSpotTokens: ["宗像大社", "沖ノ島", "博多住吉神社", "住吉大社", "宇佐神宮", "志賀海神社", "香椎宮", "平原遺跡", "三雲南小路遺跡", "須玖岡本遺跡群"],
  },
  ritsuryo: {
    targetKinds: [
      "大社",
      "神宮",
      "神社・阿曇氏総本宮",
    ],
    archetypePatterns: [/式内/, /名神大社/, /一宮/, /官社/, /神名帳/],
    claimEvidencePatterns: [
      /延喜式神名帳|式内社|名神大社|式内大社/,
      /一宮/,
      /六国史|日本三代実録|続日本紀|日本後紀|続日本後紀|文徳実録/,
      /伊勢幣使/,
    ],
    knownSpotTokens: ["厳島神社", "博多住吉神社", "住吉大社", "宗像大社", "志賀海神社", "筥崎宮", "宇佐神宮", "大己貴神社", "美奈宜神社", "筑紫神社", "高祖神社", "沼名前神社"],
  },
  syncretism: {
    targetKinds: [
      "寺院",
      "寺院・山岳霊場",
      "神社・神仏習合",
      "磨崖仏・神社",
      "寺院・史跡",
      "城跡",
      "城跡・史跡",
      "山城",
    ],
    archetypePatterns: [/神宮寺/, /本地垂迹/, /修験/, /密教/, /大聖院/, /満山/, /霊場/, /習合/, /磨崖仏/, /武家/, /祈祷/, /要害/, /山城/, /高祖城/],
    claimEvidencePatterns: [
      /神仏習合|神宮寺|本地垂迹|別当/,
      /修験|山伏|宝満派|密教|六郷満山|求聞持/,
      /磨崖仏|仏堂|仏像|阿弥陀堂|観音|文殊菩薩|薬師|不動|権現|八大龍王/,
      /八所御霊|御霊信仰|早良親王|崇道天皇|祇園/,
      /中世山城|戦国時代|落城|山城遺構|防衛拠点|山城|高祖城|武家|武士|領主|宮座|惣村|八幡大菩薩|祈祷所|要害/,
    ],
    knownSpotTokens: ["大聖院", "弥山", "求聞持", "両子寺", "熊野磨崖仏", "千畳閣", "浄心院", "大寧寺", "東行庵"],
  },
  "modern-reconstruction": {
    targetKinds: [
      "城跡",
      "近代建築",
      "神社・史跡",
      "神社・村社合祀",
      "城跡・史跡",
      "旧宅・史跡",
      "史跡・私塾",
      "武家屋敷・史跡",
      "商家・史跡",
    ],
    archetypePatterns: [/藩政/, /城下町/, /神仏分離/, /近代社格/, /維新/, /反射炉/, /造船所/, /官幣/, /国幣/, /勅祭/, /合祀/, /村社/],
    claimEvidencePatterns: [
      /福岡藩|黒田光之|黒田綱政|黒田継高|黒田家|萩藩|毛利|福山城|城下町|近世城郭/,
      /神仏分離|近代社格|官幣|国幣|護国神社|招魂|勅祭社/,
      /(?:大正|昭和)\d*年?.*合祀|合祀され|村社.*合祀|4社.*合祀|神社合祀|合祀/,
      /昭和初期.*復帰|昭和\d+年.*再編/,
      /江戸時代.*再建|江戸時代.*勧請|宝永元年|延宝元年|慶長/,
      /幕末|維新|吉田松陰|高杉晋作|木戸孝允|伊藤博文|松下村塾|明倫館|反射炉|造船所/,
    ],
    knownSpotTokens: ["白神社", "備後護国神社", "福山城", "萩城跡", "松陰神社", "松下村塾", "明倫館", "高杉晋作誕生地", "木戸孝允旧宅", "伊藤博文旧宅", "吉田松陰幽囚ノ旧宅", "古賀神社"],
  },
};

/**
 * クレーム文または史料記述におけるコンテキスト極性（Context Polarity）および除外判定を行う。
 * 例:
 * - 「神仏分離以前」「神仏分離を免れ」「神仏分離を経ず」等の記述は、
 *   第5層（近代再編）の積極的成立要件ではなく、むしろ第4層（神仏習合）の真正な残存物証である。
 *   したがって第5層の判定からは除外し、第4層の確証とする。
 * - 古代・中世地層（L1〜L4）において、「模倣」「〜と称する」「〜と表示」「演出」等の観察記述は、
 *   古代の成立物証ではなく現代の観察記録であるため、古代・中世の判定から除外する。
 */
export function isClaimEvidenceExemptOrNegated(
  statement: string,
  stratumCode: StratumCode,
  matchedToken: string,
): boolean {
  if (stratumCode === "animism" || stratumCode === "ancient-state" || stratumCode === "syncretism") {
    // 古代・中世地層において、「模倣」「〜と称する」「〜と表示」「演出」「新造」等の観察語脈がある場合
    const isImitationOrModernContext = new RegExp(
      `(?:模倣|称する|と称し|と表示され|と名付け|演出|新造|後世再構成|集約・配置).*${matchedToken}|${matchedToken}.*(?:模倣|称する|と称し|と表示され|と名付け|演出|新造|後世再構成|集約・配置)`,
    ).test(statement);
    if (isImitationOrModernContext) {
      return true; // 古代・中世地層としては除外
    }
  }

  if (stratumCode === "modern-reconstruction") {
    // 「神仏分離以前」「近代社格以前」などの否定・残存表現が含まれる場合
    const isSeparationExempt = /(?:神仏分離|近代社格|廃仏毀釈|明治維新)(?:以前|前|を免れ|を経ず|に先立ち|以前の)/.test(
      statement,
    );
    if (isSeparationExempt) {
      // ただし文中に別途、近代再編を示す積極語（官幣、国幣、招魂、護国神社、福岡藩、黒田、萩藩、毛利、合祀など）が存在しないか検証
      const hasOtherAffirmativeModernToken = /(?:官幣|国幣|招魂|護国神社|福岡藩|黒田|萩藩|毛利|合祀|昭和|大正)/.test(
        statement,
      );
      if (!hasOtherAffirmativeModernToken) {
        return true; // 除外（第5層としてはマッチさせない）
      }
    }
  }

  return false;
}

function getSpotEvidenceCorpus(
  spot: ReviewAtlasSpot,
  context?: StratumResolutionContext,
): string {
  const parts: string[] = [spot.name, spot.kind, spot.region ?? ""];

  // 各スポット自身が持つ旅行記の Claim（主語の命題 statement）のみを評価対象とする
  if (context?.claimsById && spot.claimIds?.length) {
    for (const claimId of spot.claimIds) {
      const claim = context.claimsById.get(claimId);
      if (!claim) continue;
      parts.push(claim.statement);
      if (claim.historicalTime?.label) {
        parts.push(claim.historicalTime.label);
      }
    }
  }

  // 聖地7項目プロファイルの通史記述は、主座（一次判定対象）として指定されているスポットのみに補完する。
  // 構成・衛星スポット（斎宮跡、末社、山頂磐座等）は自身の固有物証（Claims, Kind, Tokens）で評価する。
  const profile = resolveSpotStratigraphyProfile(spot);
  if (profile && isPrimarySiteForStratigraphy(spot, profile)) {
    parts.push(
      profile.summary,
      profile.oldestAttestedRecord.statement,
      profile.oldestAttestedRecord.sourceTitle,
      profile.claimedOrigin.statement,
      profile.archaeologyAndNaturalTarget.statement,
      ...profile.archaeologyAndNaturalTarget.features,
      ...(profile.reorganizationHistory?.map((h) => `${h.era} ${h.description}`) ?? []),
    );
  }

  return parts.join(" ");
}

/**
 * スポットが特定の地層に合致するかを判定し、その根拠（理由・引用文・キーワード）を構造化して返す
 */
export function detectSpotStratumMatch(
  spot: ReviewAtlasSpot,
  stratum: StratumLayer,
  context?: StratumResolutionContext,
): SpotStratumLayerDetail {
  const profile = resolveSpotStratigraphyProfile(spot);

  // 0. 地層適格性判定（現代ユーティリティ施設および、土地の歴史的連続性のない現代構想先行型施設は除外）
  if (!isSpotStratumEligible(spot, profile)) {
    return { layer: stratum, matched: false };
  }

  const rule = STRATUM_EVIDENCE_RULES[stratum.code];
  if (!rule) {
    return { layer: stratum, matched: false };
  }

  // 1. 旅行記の各Claim（一次根拠：現地観察・記録）
  if (context?.claimsById && spot.claimIds?.length) {
    for (const claimId of spot.claimIds) {
      const claim = context.claimsById.get(claimId);
      if (!claim) continue;

      // 時代レンジ整合判定（Claimが語る時代が地層の時代区分と整合しているか）
      if (!isClaimEraAlignedWithStratum(claim, stratum.code)) {
        continue;
      }

      for (const pattern of rule.claimEvidencePatterns) {
        const stmtMatch = claim.statement.match(pattern);
        if (stmtMatch) {
          if (isClaimEvidenceExemptOrNegated(claim.statement, stratum.code, stmtMatch[0])) {
            continue;
          }
          return {
            layer: stratum,
            matched: true,
            basis: {
              kind: "claim_observation",
              matchedToken: stmtMatch[0],
              evidenceQuote: claim.statement,
              claimId: claim.id,
            },
          };
        }
        if (claim.historicalTime?.label) {
          const timeMatch = claim.historicalTime.label.match(pattern);
          if (timeMatch) {
            if (isClaimEvidenceExemptOrNegated(claim.historicalTime.label, stratum.code, timeMatch[0])) {
              continue;
            }
            return {
              layer: stratum,
              matched: true,
              basis: {
                kind: "claim_observation",
                matchedToken: timeMatch[0],
                evidenceQuote: `${claim.statement} (${claim.historicalTime.label})`,
                claimId: claim.id,
              },
            };
          }
        }
      }
    }
  }

  // 2. 聖地7項目プロファイル（二次根拠：由緒史料・考古景観記録）
  // 主座（一次判定対象：伊野天照皇大神宮、宇佐神宮、厳島神社等）のみが広域通史プロファイルを地層根拠として適用する。
  // 構成・衛星スポット（山田邑斎宮、審神者神社、六所宮跡、御許山・大元神社、大聖院等）は自身の物証（Claims, Kind, Tokens）のみで地層を評価する。
  if (profile && isPrimarySiteForStratigraphy(spot, profile)) {
    const profileSections: Array<{ statement: string; sourceTitle?: string }> = [
      {
        statement: profile.oldestAttestedRecord.statement,
        sourceTitle: profile.oldestAttestedRecord.sourceTitle,
      },
      {
        statement: profile.archaeologyAndNaturalTarget.statement,
        sourceTitle: "考古・自然祭祀景観",
      },
      {
        statement: profile.claimedOrigin.statement,
        sourceTitle: "由緒・社伝",
      },
      {
        statement: profile.summary,
        sourceTitle: "祭祀史要約",
      },
    ];

    if (profile.reorganizationHistory?.length) {
      for (const h of profile.reorganizationHistory) {
        profileSections.push({
          statement: `${h.era}: ${h.description}`,
          sourceTitle: "祭祀再編史",
        });
      }
    }

    for (const sec of profileSections) {
      for (const pattern of rule.claimEvidencePatterns) {
        const m = sec.statement.match(pattern);
        if (m) {
          if (isClaimEvidenceExemptOrNegated(sec.statement, stratum.code, m[0])) {
            continue;
          }
          return {
            layer: stratum,
            matched: true,
            basis: {
              kind: "historical_source",
              matchedToken: m[0],
              evidenceQuote: sec.statement,
              sourceTitle: sec.sourceTitle,
            },
          };
        }
      }
    }
  }

  // 3. 遺構種別（kind）による構造判定
  const matchesKind = rule.targetKinds.some(
    (tk) => spot.kind === tk || spot.kind.includes(tk),
  );
  if (matchesKind) {
    let kindValid = false;
    if (
      stratum.code === "animism" &&
      (spot.kind.includes("磐座") ||
        spot.kind.includes("島嶼") ||
        spot.kind.includes("遺跡") ||
        spot.kind === "遺跡・歴史公園")
    ) {
      kindValid = true;
    } else if (
      stratum.code === "ancient-state" &&
      (spot.kind.includes("古墳") ||
        spot.kind.includes("海人") ||
        spot.kind.includes("阿曇"))
    ) {
      kindValid = true;
    } else if (
      stratum.code === "syncretism" &&
      (spot.kind.includes("寺院") ||
        spot.kind.includes("霊場") ||
        spot.kind.includes("習合") ||
        spot.kind.includes("磨崖仏"))
    ) {
      kindValid = true;
    } else if (
      stratum.code === "modern-reconstruction" &&
      (spot.kind.includes("城跡") ||
        spot.kind.includes("旧宅") ||
        spot.kind.includes("私塾") ||
        spot.kind.includes("武家屋敷") ||
        spot.kind.includes("商家"))
    ) {
      kindValid = true;
    }

    if (kindValid) {
      return {
        layer: stratum,
        matched: true,
        basis: {
          kind: "spot_kind",
          matchedToken: spot.kind,
          evidenceQuote: `遺構・施設種別「${spot.kind}」に合致`,
        },
      };
    }
  }

  // 4. スポット固有のトピック指定がある場合の判定
  if (context?.topicIdsBySpotId) {
    const spotTopics = context.topicIdsBySpotId.get(spot.id);
    if (spotTopics) {
      const matchedTopicId = stratum.associatedTopicIds.find((topicId) =>
        spotTopics.has(topicId),
      );
      if (matchedTopicId) {
        return {
          layer: stratum,
          matched: true,
          basis: {
            kind: "topic_link",
            matchedToken: matchedTopicId,
            evidenceQuote: `探索トピック「${matchedTopicId}」に関連`,
          },
        };
      }
    }
  }

  // 5. 代表社・公知由緒の単体モックスポット等に対するフォールバック
  const matchedKnownToken = rule.knownSpotTokens.find((token) =>
    spot.name === token || spot.name.startsWith(token),
  );
  if (matchedKnownToken) {
    return {
      layer: stratum,
      matched: true,
      basis: {
        kind: "known_tradition",
        matchedToken: matchedKnownToken,
        evidenceQuote: `${spot.name}の公知由緒・代表的祭祀景観`,
      },
    };
  }

  const matchedArchetype = rule.archetypePatterns.find(
    (pattern) =>
      pattern.test(spot.name) || (spot.region && pattern.test(spot.region)),
  );
  if (matchedArchetype) {
    const token =
      spot.name.match(matchedArchetype)?.[0] ??
      spot.region?.match(matchedArchetype)?.[0] ??
      "";
    return {
      layer: stratum,
      matched: true,
      basis: {
        kind: "known_tradition",
        matchedToken: token,
        evidenceQuote: `名称・地域アーキタイプ（${token}）に合致`,
      },
    };
  }

  return { layer: stratum, matched: false };
}

/**
 * スポットが特定の地層に合致するかを判定する（detectSpotStratumMatch の真偽値ラッパー）
 */
export function spotMatchesStratum(
  spot: ReviewAtlasSpot,
  stratum: StratumLayer,
  context?: StratumResolutionContext,
): boolean {
  return detectSpotStratumMatch(spot, stratum, context).matched;
}

const BASE_STRATA_DEFINITIONS = [
  {
    id: "stratum-nature-animism",
    order: 1,
    code: "animism" as const,
    eraName: "先史・縄文〜弥生",
    title: "原初自然崇拝・アニミズム層",
    subtitle: "巨石（磐座）・神体山・沖合孤島・海浜の自然祭祀景観",
    description:
      "社殿建築を持たず、巨石・霊山・孤島・海浜そのものを神聖領域として感得した原初の信仰景観。後世の神社祭祀の基底に眠る最古の地層です。",
    keyConcepts: ["巨石信仰（磐座）", "神体山", "島嶼祭祀", "アニミズム", "海浜清め"],
    associatedTopicIds: ["religion-concepts"],
    targetSpotKinds: ["遺跡", "遺跡・古墳", "遺跡・歴史公園", "神社"],
  },
  {
    id: "stratum-ancient-state-ritual",
    order: 2,
    code: "ancient-state" as const,
    eraName: "古墳〜飛鳥・奈良",
    title: "古代国家形成・氏族神祇層",
    subtitle: "ヤマト王権の拡大、海人族・有力氏族の掌握と首長祭祀・古代防衛網の成立",
    description:
      "ヤマト王権の列島統合と対外交通の掌握に伴い、玄界灘の海人族（宗像・阿曇等）や各地の有力氏族の首長祭祀（古墳・神祇）が編成され、白村江後の古代国家防衛網（水城・古代山城）とともに制度化された地層です。",
    keyConcepts: ["ヤマト王権形成", "古墳・首長祭祀", "海人族・有力氏族神祇", "沖ノ島国家祭祀", "古代国家防衛網（古代山城）"],
    associatedTopicIds: ["religion-history", "marine-deities-preset"],
    targetSpotKinds: ["神社", "大社", "神宮", "遺跡・古墳"],
  },
  {
    id: "stratum-ritsuryo-shinto-network",
    order: 3,
    code: "ritsuryo" as const,
    eraName: "平安初期・延喜式",
    title: "律令神祇・式内社・一宮制度層",
    subtitle: "延喜式神名帳と諸国一宮制による官社ネットワークの確立",
    description:
      "律令国家による神祇官体制の整備に伴い、延喜式神名帳への登載（官社・式内社）や諸国一宮制度を通じて、列島各地の有力神社が公的秩序の中に組み込まれた地層です。",
    keyConcepts: ["延喜式神名帳", "式内名神大社", "諸国一宮", "国司祭祀", "官社制度"],
    associatedTopicIds: ["shikinaisha-network-preset", "ichinomiya-western-preset"],
    targetSpotKinds: ["神社", "大社", "神宮"],
  },
  {
    id: "stratum-syncretism-shugendo",
    order: 4,
    code: "syncretism" as const,
    eraName: "平安末〜中世・戦国",
    title: "中世神仏習合・武家祈祷・地域共同体層",
    subtitle: "本地垂迹説・武士の戦勝祈願と罪障消滅・中世山城要害・村落宮座の重層",
    description:
      "仏教の普及と本地垂迹説の定着に伴い、武士団が殺生の罪障消滅と戦勝祈願のために寺社を庇護。さらに天険の要害（霊山・山城）と神仏信仰、村落共同体（宮座）の自治祭祀が一体となって重層した中世社会の信仰景観です。",
    keyConcepts: ["神宮寺・本地垂迹説", "武家祈祷・八幡大菩薩", "修験道・山岳密教", "中世山城・山岳要害", "村落共同体・宮座"],
    associatedTopicIds: ["religion-syncretism"],
    targetSpotKinds: ["寺院", "神社", "史跡", "城跡", "山城"],
  },
  {
    id: "stratum-early-modern-reconstruction",
    order: 5,
    code: "modern-reconstruction" as const,
    eraName: "近世〜近代",
    title: "近世藩政・近代神社再編層",
    subtitle: "大名庇護・城下町鎮守・明治神仏分離・近代社格の展開",
    description:
      "近世大名（毛利氏・黒田氏等）による社殿修造・城下町鎮守の整備と、明治維新時の神仏分離令・国家神道・近代社格制度（官国幣社・勅祭社・護国神社）によって形作られた近現代の表層景観です。",
    keyConcepts: ["藩主庇護・社殿再建", "近世城下町鎮守", "明治神仏分離", "官幣社・国幣社・勅祭社", "現代参詣・観光景観"],
    associatedTopicIds: ["hagi-domain-politics", "ishin-figures-network"],
    targetSpotKinds: ["神社", "史跡", "城跡"],
  },
] as const;

export const CHRONOLOGICAL_STRATA: readonly StratumLayer[] =
  BASE_STRATA_DEFINITIONS.map((def) => {
    const layer: StratumLayer = {
      ...def,
      spotMatchers: (spot: ReviewAtlasSpot, context?: StratumResolutionContext) =>
        spotMatchesStratum(spot, layer, context),
    };
    return layer;
  });

export function filterSpotsByStratum(
  spots: readonly ReviewAtlasSpot[],
  stratum: StratumLayer,
  context?: StratumResolutionContext,
): ReviewAtlasSpot[] {
  return spots.filter((spot) => spotMatchesStratum(spot, stratum, context));
}

export type SpotStratumMembership = {
  spotId: string;
  strata: readonly StratumLayer[];
  strataCount: number;
  isMultiLayered: boolean;
  details?: readonly SpotStratumLayerDetail[];
};

/**
 * 全スポットに対して、所属する時代地層（および重層数・判定根拠）を一括計算する
 */
export function getSpotStratumMemberships(
  spots: readonly ReviewAtlasSpot[],
  strata: readonly StratumLayer[] = CHRONOLOGICAL_STRATA,
  context?: StratumResolutionContext,
): Map<string, SpotStratumMembership> {
  const map = new Map<string, SpotStratumMembership>();
  for (const spot of spots) {
    const details = strata.map((stratum) =>
      detectSpotStratumMatch(spot, stratum, context),
    );
    const matched = details
      .filter((d) => d.matched)
      .map((d) => d.layer);

    map.set(spot.id, {
      spotId: spot.id,
      strata: matched,
      strataCount: matched.length,
      isMultiLayered: matched.length >= 2,
      details,
    });
  }
  return map;
}

/**
 * 単一スポットに対して、時代地層の柱状断面（L5表層からL1基底への5層詳細レポート）を生成する
 */
export function getSpotStratumDetailReport(
  spot: ReviewAtlasSpot,
  strata: readonly StratumLayer[] = CHRONOLOGICAL_STRATA,
  context?: StratumResolutionContext,
): SpotStratumDetailReport {
  const details = strata.map((stratum) =>
    detectSpotStratumMatch(spot, stratum, context),
  );
  const matchedLayers = details
    .filter((d) => d.matched)
    .map((d) => d.layer);

  return {
    spotId: spot.id,
    spotName: spot.name,
    // 地層柱状図の原則に従い、表層（L5 近代）から基底層（L1 先史）への降順でソート
    details: [...details].sort((a, b) => b.layer.order - a.layer.order),
    matchedCount: matchedLayers.length,
    matchedLayers,
    isMultiLayered: matchedLayers.length >= 2,
  };
}

