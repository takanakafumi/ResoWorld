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
const STRATUM_RECOGNITION_RULES: Record<
  StratumCode,
  {
    targetKinds: readonly string[];
    archetypePatterns: readonly RegExp[];
    knownSpotTokens: readonly string[];
  }
> = {
  animism: {
    targetKinds: ["遺跡", "遺跡・古墳", "遺跡・歴史公園", "自然景観"],
    archetypePatterns: [/磐座/, /神体山/, /孤島/, /巨石/, /環濠/, /弥生遺跡/],
    knownSpotTokens: ["弥山", "沖ノ島", "三輪", "平塚川添", "吉野ヶ里", "厳島"],
  },
  "ancient-state": {
    targetKinds: ["神社", "大社", "神宮", "遺跡・古墳"],
    archetypePatterns: [/国家祭祀/, /海人族/, /航路/, /王権/, /三女神/, /大社/],
    knownSpotTokens: ["宗像", "沖ノ島", "住吉", "宇佐", "志賀", "香椎", "神功"],
  },
  ritsuryo: {
    targetKinds: ["神社", "大社", "神宮"],
    archetypePatterns: [/式内/, /名神大社/, /一宮/, /官社/, /神名帳/],
    knownSpotTokens: ["厳島", "住吉", "宗像", "志賀", "筥崎", "宇佐", "一宮"],
  },
  syncretism: {
    targetKinds: ["寺院", "神社", "史跡"],
    archetypePatterns: [/神宮寺/, /本地垂迹/, /修験/, /密教/, /大聖院/, /満山/],
    knownSpotTokens: ["大聖院", "弥山", "求聞持", "寺", "観音", "不動", "千畳閣", "不動岩"],
  },
  "modern-reconstruction": {
    targetKinds: ["神社", "城跡", "史跡", "近代建築"],
    archetypePatterns: [/藩政/, /城下町/, /神仏分離/, /近代社格/, /維新/],
    knownSpotTokens: ["白神社", "城", "萩", "広島", "松陰", "招魂", "下関"],
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

  // 種別（kind）による一致（遺跡などは先史アニミズム層に親和性）
  if (rule.targetKinds.includes(spot.kind)) {
    if (stratum.code === "animism" && spot.kind.startsWith("遺跡")) {
      return true;
    }
    if (stratum.code === "syncretism" && spot.kind === "寺院") {
      return true;
    }
  }

  // 代表スポットトークンの一致（重層性を考慮）
  const matchesToken = rule.knownSpotTokens.some((token) =>
    spot.name.includes(token),
  );
  if (matchesToken) return true;

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
