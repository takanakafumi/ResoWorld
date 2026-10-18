import type { Claim } from "@/domain/knowledge/schema";
import { resolveSpotStratigraphyProfile } from "@/domain/knowledge/stratigraphy-profiles";
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
 * 博物館・駅・ホテル・飲食店等の現代ユーティリティ施設（地層対象外）
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
]);

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
      "自然景観",
      "山岳祭祀・磐座",
      "海中島嶼聖域",
      "山・地形",
      "海岸・景勝地",
    ],
    archetypePatterns: [/磐座/, /神体山/, /孤島/, /巨石/, /環濠/, /弥生遺跡/, /海中/, /島嶼/, /刻線の石/],
    claimEvidencePatterns: [
      /磐座/,
      /巨石|巨岩/,
      /神体山|遥拝所/,
      /環濠|弥生時代|甕棺|王墓の上石/,
      /古神殿跡|自然の聖地|根源層/,
      /お潮井|海中の石鳥居|満潮時の渡航遮断/,
      /刻線の石|線刻石/,
    ],
    knownSpotTokens: ["弥山", "沖ノ島", "三輪", "平塚川添遺跡", "吉野ヶ里", "厳島", "沖津宮", "大嶽", "駒ヶ林"],
  },
  "ancient-state": {
    targetKinds: [
      "大社",
      "神宮",
      "古墳群",
      "神社・古墳",
      "海人首長墓・古墳",
      "海中島嶼聖域",
      "神社・阿曇氏総本宮",
      "神社・海浜祭祀",
    ],
    archetypePatterns: [/国家祭祀/, /海人族/, /航路/, /王権/, /三女神/, /大社/, /阿曇/, /綿津見/, /沖津宮/, /斎宮/, /審神者/, /古墳/, /古代山城/, /怡土城/],
    claimEvidencePatterns: [
      /古墳|前方後円墳|前方後方墳|竪穴式石室|横穴式石室|首長墓/,
      /日本書紀|古事記|風土記|記紀/,
      /神功皇后|応神天皇|武内宿禰/,
      /宗像三女神|市杵島姫|田心姫|湍津姫/,
      /綿津見|阿曇|海人|志賀三神|住吉三神|塩土老翁/,
      /大己貴|素戔嗚|事代主|少彦名|国常立|豊玉姫/,
      /斎宮|審神者|中臣烏賊津/,
      /古代山城|怡土城|水城|大野城|基肄城/,
    ],
    knownSpotTokens: ["宗像", "沖ノ島", "住吉", "宇佐", "志賀", "香椎", "沖津宮"],
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
    knownSpotTokens: ["厳島神社", "住吉", "宗像", "志賀海神社", "筥崎", "宇佐神宮", "一宮", "大己貴神社", "美奈宜神社", "筑紫神社", "高祖神社", "沼名前神社"],
  },
  syncretism: {
    targetKinds: [
      "寺院",
      "寺院・山岳霊場",
      "神社・神仏習合",
      "磨崖仏・神社",
      "寺院・史跡",
    ],
    archetypePatterns: [/神宮寺/, /本地垂迹/, /修験/, /密教/, /大聖院/, /満山/, /霊場/, /習合/, /磨崖仏/],
    claimEvidencePatterns: [
      /神仏習合|神宮寺|本地垂迹|別当/,
      /修験|山伏|宝満派|密教|六郷満山|求聞持/,
      /磨崖仏|仏堂|仏像|阿弥陀堂|観音|文殊菩薩|薬師|不動|権現|八大龍王/,
      /八所御霊|御霊信仰|早良親王|崇道天皇|祇園/,
    ],
    knownSpotTokens: ["大聖院", "弥山", "求聞持", "両子寺", "熊野磨崖仏", "観音", "不動", "千畳閣", "浄心院", "大寧寺", "東行庵"],
  },
  "modern-reconstruction": {
    targetKinds: [
      "城跡",
      "近代建築",
      "神社・史跡",
      "城跡・史跡",
      "旧宅・史跡",
      "史跡・私塾",
      "武家屋敷・史跡",
      "商家・史跡",
    ],
    archetypePatterns: [/藩政/, /城下町/, /神仏分離/, /近代社格/, /維新/, /反射炉/, /造船所/, /防衛拠点/, /山城/],
    claimEvidencePatterns: [
      /福岡藩|黒田光之|黒田綱政|黒田継高|黒田家|萩藩|毛利|福山城|城下町/,
      /神仏分離|近代社格|官幣|国幣|護国神社|招魂/,
      /大正\d+年.*合祀|昭和初期.*復帰/,
      /江戸時代.*再建|江戸時代.*勧請|宝永元年|延宝元年|慶長/,
      /幕末|維新|吉田松陰|高杉晋作|木戸孝允|伊藤博文|松下村塾|明倫館|反射炉|造船所/,
      /戦国時代|落城|山城遺構|防衛拠点|山城|高祖城/,
    ],
    knownSpotTokens: ["白神社", "備後護国神社", "福山城", "萩城", "松陰神社", "松下村塾", "明倫館", "高杉晋作", "木戸孝允", "伊藤博文", "吉田松陰"],
  },
};

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

  // 聖地7項目プロファイルは、そのプロファイルの筆頭代表社（spotNames[0]）に一致する場合のみ補完する
  const profile = resolveSpotStratigraphyProfile(spot);
  if (
    profile &&
    profile.spotNames[0] &&
    (spot.name.includes(profile.spotNames[0]) ||
      profile.spotNames[0].includes(spot.name))
  ) {
    parts.push(
      profile.summary,
      profile.oldestAttestedRecord.statement,
      profile.oldestAttestedRecord.sourceTitle,
      profile.claimedOrigin.statement,
      profile.archaeologyAndNaturalTarget.statement,
      ...profile.archaeologyAndNaturalTarget.features,
    );
  }

  return parts.join(" ");
}

/**
 * スポットが特定の地層に合致するかを、旅行記の根拠（Claims・7項目プロファイル・遺構種別）から一貫した基準で判定する
 */
export function spotMatchesStratum(
  spot: ReviewAtlasSpot,
  stratum: StratumLayer,
  context?: StratumResolutionContext,
): boolean {
  // 0. 博物館・駅・ホテル・飲食店等の現代ユーティリティ施設は祭祀・歴史地層から除外
  if (
    NON_STRATUM_KINDS.has(spot.kind) ||
    spot.name.includes("体験学習館") ||
    spot.name.includes("資料館") ||
    spot.name.includes("博物館") ||
    spot.name.includes("記念館")
  ) {
    return false;
  }

  // 1. スポット固有のトピック指定がある場合の判定（接続線のtopicIdからは継承しない：比較接続による過剰伝播を防止）
  if (context?.topicIdsBySpotId) {
    const spotTopics = context.topicIdsBySpotId.get(spot.id);
    if (spotTopics) {
      const hasTopicOverlap = stratum.associatedTopicIds.some((topicId) =>
        spotTopics.has(topicId),
      );
      if (hasTopicOverlap) return true;
    }
  }

  const rule = STRATUM_EVIDENCE_RULES[stratum.code];
  if (!rule) return false;

  // 2. 旅行記の Claim（観察・史料根拠）および 7項目プロファイルのコーパスによる統一判定
  const corpus = getSpotEvidenceCorpus(spot, context);
  if (rule.claimEvidencePatterns.some((pattern) => pattern.test(corpus))) {
    return true;
  }

  // 3. 種別（kind）による構造判定
  const matchesKind = rule.targetKinds.some(
    (tk) => spot.kind === tk || spot.kind.includes(tk),
  );
  if (matchesKind) {
    if (
      stratum.code === "animism" &&
      (spot.kind.includes("磐座") ||
        spot.kind.includes("島嶼") ||
        spot.kind === "遺跡" ||
        spot.kind === "遺跡・歴史公園")
    ) {
      return true;
    }
    if (
      stratum.code === "ancient-state" &&
      (spot.kind.includes("古墳") ||
        spot.kind.includes("海人") ||
        spot.kind.includes("阿曇"))
    ) {
      return true;
    }
    if (
      stratum.code === "syncretism" &&
      (spot.kind.includes("寺院") ||
        spot.kind.includes("霊場") ||
        spot.kind.includes("習合") ||
        spot.kind.includes("磨崖仏"))
    ) {
      return true;
    }
    if (
      stratum.code === "modern-reconstruction" &&
      (spot.kind.includes("城跡") ||
        spot.kind.includes("旧宅") ||
        spot.kind.includes("私塾") ||
        spot.kind.includes("武家屋敷") ||
        spot.kind.includes("商家"))
    ) {
      return true;
    }
  }

  // 4. Claim が未付与の単体モックスポット等に対するフォールバック（代表名・アーキタイプ）
  if (rule.knownSpotTokens.some((token) => spot.name.includes(token))) {
    return true;
  }

  if (
    rule.archetypePatterns.some(
      (pattern) =>
        pattern.test(spot.name) || (spot.region && pattern.test(spot.region)),
    )
  ) {
    return true;
  }

  return false;
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
    title: "古代国家祭祀・海人族氏族神祇層",
    subtitle: "ヤマト王権と海人族の接触、航路掌握と国家祭祀の成立",
    description:
      "ヤマト王権が玄界灘・瀬戸内海の海上交通を掌握する過程で、宗像氏・阿曇氏・津守氏などの海人族と結びつき、国家航海安全祈願として制度化された祭祀地層です。",
    keyConcepts: ["沖ノ島国家祭祀", "宗像三女神", "航路掌握", "海人族", "ヤマト王権西征"],
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
    eraName: "平安〜鎌倉・中世",
    title: "神仏習合・修験山岳信仰層",
    subtitle: "神宮寺・本地垂迹説・密教山岳修験の重層",
    description:
      "仏教の伝来と普及により、神社境内に神宮寺が建立され神と仏が一体化。さらに空海・役行者伝説を媒介とする密教・修験道が山岳神域に重層した地層です。",
    keyConcepts: ["神宮寺", "本地垂迹説", "修験道・山岳密教", "弥山大聖院", "六郷満山"],
    associatedTopicIds: ["religion-syncretism"],
    targetSpotKinds: ["寺院", "神社", "史跡"],
  },
  {
    id: "stratum-early-modern-reconstruction",
    order: 5,
    code: "modern-reconstruction" as const,
    eraName: "近世〜近代",
    title: "近世藩政・近代神社再編層",
    subtitle: "大名庇護・城下町鎮守・明治神仏分離・近代社格の展開",
    description:
      "戦国大名や近世藩主（毛利氏・黒田氏等）による社殿修造・城下町鎮守の整備と、明治維新時の神仏分離令・近代社格制度によって形作られた近現代の景観地層です。",
    keyConcepts: ["藩主庇護・社殿再建", "城下町鎮守", "明治神仏分離", "官幣社・国幣社", "現代参詣"],
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
};

/**
 * 全スポットに対して、所属する時代地層（および重層数）を一括計算する
 */
export function getSpotStratumMemberships(
  spots: readonly ReviewAtlasSpot[],
  strata: readonly StratumLayer[] = CHRONOLOGICAL_STRATA,
  context?: StratumResolutionContext,
): Map<string, SpotStratumMembership> {
  const map = new Map<string, SpotStratumMembership>();
  for (const spot of spots) {
    const matched = strata.filter((stratum) =>
      spotMatchesStratum(spot, stratum, context),
    );
    map.set(spot.id, {
      spotId: spot.id,
      strata: matched,
      strataCount: matched.length,
      isMultiLayered: matched.length >= 2,
    });
  }
  return map;
}

