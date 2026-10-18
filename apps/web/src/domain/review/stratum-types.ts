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
  spotMatchers: (spot: ReviewAtlasSpot) => boolean;
};

export type StratumResolutionContext = {
  connections?: readonly ReviewAtlasConnection[];
  topicIdsBySpotId?: Map<string, Set<string>>;
};

/**
 * 各地層を象徴する祭祀景観・考古標本の識別トークン（正規化判定用）
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

const STRATUM_RECOGNITION_RULES: Record<
  StratumCode,
  {
    targetKinds: readonly string[];
    archetypePatterns: readonly RegExp[];
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
    knownSpotTokens: [
      "弥山",
      "沖ノ島",
      "三輪",
      "平塚川添遺跡",
      "吉野ヶ里",
      "厳島",
      "宗像大社",
      "志賀海神社",
      "沖津宮",
      "大嶽",
      "駒ヶ林",
      "細石神社",
      "大元神社",
      "三雲",
      "平原遺跡",
      "須玖岡本",
      "伊野天照皇大神宮",
    ],
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
    archetypePatterns: [/国家祭祀/, /海人族/, /航路/, /王権/, /三女神/, /大社/, /阿曇/, /綿津見/, /沖津宮/, /斎宮/, /審神者/, /古墳/],
    knownSpotTokens: [
      "宗像",
      "沖ノ島",
      "住吉",
      "宇佐神宮",
      "御許山",
      "大元神社",
      "厳島神社",
      "志賀海",
      "香椎",
      "宇美八幡",
      "大己貴",
      "美奈宜",
      "筑紫神社",
      "高祖神社",
      "細石神社",
      "沼名前神社",
      "沖津宮",
      "和白",
      "綿津見",
      "志式",
      "山田邑斎宮",
      "審神者神社",
      "伊野天照皇大神宮",
      "部木八幡",
      "乙宮神社",
    ],
  },
  ritsuryo: {
    targetKinds: [
      "大社",
      "神宮",
      "神社・阿曇氏総本宮",
    ],
    archetypePatterns: [/式内/, /名神大社/, /一宮/, /官社/, /神名帳/],
    // 延喜式内社・諸国一宮・六国史官社クラスに厳密限定（地方村社は含めない）
    knownSpotTokens: [
      "厳島神社",
      "住吉",
      "宗像",
      "志賀海神社",
      "筥崎",
      "宇佐神宮",
      "一宮",
      "大己貴神社",
      "美奈宜神社",
      "筑紫神社",
      "高祖神社",
      "沼名前神社",
    ],
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
    knownSpotTokens: [
      "大聖院",
      "弥山",
      "御山神社",
      "三翁神社",
      "厳島神社",
      "宇佐神宮",
      "宇美八幡",
      "沼名前神社",
      "求聞持",
      "両子寺",
      "熊野磨崖仏",
      "観音",
      "不動",
      "千畳閣",
      "浄心院",
      "大寧寺",
      "東行庵",
      "大隈御霊神社",
      "和田八幡宮",
      "六所宮跡",
      "木寄神社",
    ],
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
    archetypePatterns: [/藩政/, /城下町/, /神仏分離/, /近代社格/, /維新/, /反射炉/, /造船所/],
    knownSpotTokens: [
      "厳島神社",
      "白神社",
      "備後護国神社",
      "福山城",
      "萩城",
      "松陰神社",
      "松下村塾",
      "明倫館",
      "高杉晋作",
      "木戸孝允",
      "伊藤博文",
      "吉田松陰",
      "伊野天照皇大神宮",
      "黒殿神社",
    ],
  },
};

/**
 * スポットが特定の地層に合致するかを構造的かつ柔軟に判定する
 */
export function spotMatchesStratum(
  spot: ReviewAtlasSpot,
  stratum: StratumLayer,
  context?: StratumResolutionContext,
): boolean {
  // 0. 博物館・駅・ホテル・飲食店等の現代ユーティリティ施設は祭祀・歴史地層から除外
  if (NON_STRATUM_KINDS.has(spot.kind) || spot.name.includes("体験学習館") || spot.name.includes("資料館") || spot.name.includes("博物館")) {
    return false;
  }

  // 1. コンテキスト（トピックや接続）に基づく高精度判定
  if (context?.topicIdsBySpotId) {
    const spotTopics = context.topicIdsBySpotId.get(spot.id);
    if (spotTopics) {
      const hasTopicOverlap = stratum.associatedTopicIds.some((topicId) =>
        spotTopics.has(topicId),
      );
      if (hasTopicOverlap) return true;
    }
  }

  if (context?.connections) {
    const isConnectedToStratumTopic = context.connections.some(
      (conn) =>
        conn.spotIds.includes(spot.id) &&
        conn.topicId &&
        stratum.associatedTopicIds.includes(conn.topicId),
    );
    if (isConnectedToStratumTopic) return true;
  }

  // 2. 地層の規則・考古語彙・種別に基づく判定
  const rule = STRATUM_RECOGNITION_RULES[stratum.code];
  if (!rule) return false;

  // 代表スポットトークンの一致（重層性を考慮）
  const matchesToken = rule.knownSpotTokens.some((token) =>
    spot.name.includes(token),
  );
  if (matchesToken) return true;

  // 種別（kind）による一致
  const matchesKind = rule.targetKinds.some((tk) => spot.kind === tk || spot.kind.includes(tk));
  if (matchesKind) {
    if (
      stratum.code === "animism" &&
      (spot.kind.includes("磐座") || spot.kind.includes("島嶼") || spot.kind === "遺跡" || spot.kind === "遺跡・歴史公園")
    ) {
      return true;
    }
    if (
      stratum.code === "ancient-state" &&
      (spot.kind.includes("古墳") || spot.kind.includes("海人") || spot.kind.includes("阿曇"))
    ) {
      return true;
    }
    if (
      stratum.code === "syncretism" &&
      (spot.kind.includes("寺院") || spot.kind.includes("霊場") || spot.kind.includes("習合") || spot.kind.includes("磨崖仏"))
    ) {
      return true;
    }
    if (
      stratum.code === "modern-reconstruction" &&
      (spot.kind.includes("城跡") || spot.kind.includes("旧宅") || spot.kind.includes("私塾") || spot.kind.includes("武家屋敷") || spot.kind.includes("商家"))
    ) {
      return true;
    }
  }

  // 景観アーキタイプパターンの照合
  const matchesArchetype = rule.archetypePatterns.some((pattern) =>
    pattern.test(spot.name) || (spot.region && pattern.test(spot.region)),
  );
  if (matchesArchetype) return true;

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
      spotMatchers: (spot: ReviewAtlasSpot) => spotMatchesStratum(spot, layer),
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

