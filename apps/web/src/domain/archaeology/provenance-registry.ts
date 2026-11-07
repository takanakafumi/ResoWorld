/**
 * 🏛️ 鉱物・物質文化の主要原産地・工房・中枢拠点レジストリ（Declarative Provenance Origin Registry）
 *
 * ヒスイ（糸魚川・奴奈川）、水銀朱（若杉山・丹生・伊勢）、碧玉（出雲花仙山・玉作）、
 * 鉄（伽耶）、酸化鉄赤（吹屋ベンガラ）、青銅器工房（須玖岡本・近畿中枢）などの
 * 客観的実態（原産地・工房）を宣言的に管理する単一情報源（Single Source of Truth）。
 */

export interface ProvenanceOriginDefinition {
  id: string;
  label: string;
  materialName: string;
  category: "jade" | "cinnabar" | "jasper" | "iron" | "bronze" | "bengala" | "mirror";
  badgeText: string;
  description: string;
}

export const PROVENANCE_ORIGIN_ENTITIES: readonly ProvenanceOriginDefinition[] = [
  // 1. ヒスイ（糸魚川・奴奈川）
  {
    id: "place-itoigawa-jade",
    label: "糸魚川ヒスイ原産地",
    materialName: "ヒスイ（硬玉）",
    category: "jade",
    badgeText: "⛰️ ヒスイ産地",
    description: "日本列島唯一の硬玉ヒスイ産地（姫川・青海川・小滝川流域）",
  },
  {
    id: "site-itoigawa-choujagahara",
    label: "長者ヶ原遺跡・糸魚川ヒスイ原産地",
    materialName: "ヒスイ（硬玉）",
    category: "jade",
    badgeText: "⛰️ ヒスイ産地",
    description: "縄文〜古墳期のヒスイ加工・供給中枢遺跡",
  },
  {
    id: "shrine-nunakawa-hime",
    label: "奴奈川神社",
    materialName: "ヒスイ祭祀・守護神",
    category: "jade",
    badgeText: "⛰️ 奴奈川ヒスイ聖域",
    description: "糸魚川ヒスイの神・奴奈川姫を祀る古代聖域",
  },

  // 2. 水銀朱・辰砂（若杉山・丹生・伊勢）
  {
    id: "place-wakasugiyama",
    label: "若杉山辰砂採掘遺跡",
    materialName: "天然辰砂（水銀朱）",
    category: "cinnabar",
    badgeText: "⛰️ 辰砂採掘坑",
    description: "日本唯一の弥生・古墳期辰砂（水銀朱）鉱山採掘坑",
  },
  {
    id: "site-wakasugiyama",
    label: "阿南若杉山辰砂採掘遺跡",
    materialName: "天然辰砂（水銀朱）",
    category: "cinnabar",
    badgeText: "⛰️ 辰砂採掘坑",
    description: "王権祭祀や王墓石室を満たした朱の供給源",
  },
  {
    id: "shrine-nibu-tsuhime",
    label: "丹生都比売神社",
    materialName: "水銀朱（紀伊丹生鉱脈）",
    category: "cinnabar",
    badgeText: "⛰️ 丹生水銀聖域",
    description: "中央構造線水銀鉱脈の総本社・朱を司る最高神",
  },
  {
    id: "site-niutsuhime",
    label: "丹生都比売神社",
    materialName: "水銀朱（紀伊丹生鉱脈）",
    category: "cinnabar",
    badgeText: "⛰️ 丹生水銀聖域",
    description: "中央構造線水銀鉱脈の総本社・朱を司る最高神",
  },
  {
    id: "site-sewa-taki",
    label: "伊勢丹生水銀鉱山跡",
    materialName: "丹生水銀（辰砂）",
    category: "cinnabar",
    badgeText: "⛰️ 丹生水銀鉱山",
    description: "古代伊勢の水銀鉱脈・大仏鍍金や王権への水銀供給地",
  },

  // 3. 碧玉・瑪瑙（出雲花仙山・玉作）
  {
    id: "place-kasenyama-jasper",
    label: "出雲花仙山・玉作跡",
    materialName: "青碧玉（出雲石）",
    category: "jasper",
    badgeText: "⛰️ 碧玉原産地",
    description: "古代最大の碧玉・瑪瑙採掘加工地（管玉・車輪石供給元）",
  },
  {
    id: "site-kasensan-tamatsukuri",
    label: "出雲花仙山・玉作跡",
    materialName: "青碧玉（出雲石）",
    category: "jasper",
    badgeText: "⛰️ 碧玉原産地",
    description: "出雲石の採掘坑および玉作工房遺構",
  },
  {
    id: "shrine-tamatsukuri",
    label: "玉作湯神社",
    materialName: "碧玉勾玉祭祀",
    category: "jasper",
    badgeText: "⚒️ 玉作聖域",
    description: "花仙山の玉作り神事を司る櫛明玉命を祀る社",
  },

  // 4. 鉄（伽耶）
  {
    id: "place-gaya-iron",
    label: "朝鮮半島・伽耶鉄産地",
    materialName: "鉄鋌（原料鉄）",
    category: "iron",
    badgeText: "⛰️ 伽耶鉄産地",
    description: "列島へ鉄素材（板状鉄塊）を供給した対外資源供給地",
  },

  // 5. 酸化鉄赤（吉備吹屋ベンガラ）
  {
    id: "site-fukiya-bengala",
    label: "吉備吹屋ベンガラ鉱山",
    materialName: "酸化鉄赤（ベンガラ）",
    category: "bengala",
    badgeText: "⛰️ ベンガラ鉱山",
    description: "吉備高原の酸化鉄赤色顔料の一大鉱床",
  },

  // 6. 青銅器工房・威信財集積中枢
  {
    id: "site-sugu-bronze-workshop",
    label: "須玖岡本遺跡（青銅器鋳造工房）",
    materialName: "青銅器（銅矛・漢鏡）",
    category: "bronze",
    badgeText: "⚒️ 青銅器工房",
    description: "北部九州最大の弥生青銅器鋳造工房群",
  },
  {
    id: "site-sakuragaoka",
    label: "近畿銅鐸製作中枢",
    materialName: "銅鐸（青銅）",
    category: "bronze",
    badgeText: "⚒️ 銅鐸工房",
    description: "近畿中枢の青銅器・銅鐸製作流通ネットワーク",
  },
  {
    id: "site-kurozuka",
    label: "天理黒塚古墳",
    materialName: "三角縁神獣鏡（33面）",
    category: "mirror",
    badgeText: "🪞 同盟中枢",
    description: "大和王権の同笵鏡管理・配布を象徴する基準古墳",
  },
  {
    id: "place-kurozuka",
    label: "黒塚古墳",
    materialName: "三角縁神獣鏡（33面）",
    category: "mirror",
    badgeText: "🪞 同盟中枢",
    description: "大和王権の同笵鏡管理・配布を象徴する基準古墳",
  },
] as const;

/**
 * 与えられた地点（ID、名称、targetPlaceId）が主要産地・工房・中枢であるかを判定する。
 */
export function resolveProvenanceOriginMeta(target: {
  id?: string;
  name?: string;
  targetPlaceId?: string;
  topicId?: string | null;
}): ProvenanceOriginDefinition | undefined {
  if (!target) return undefined;

  // 1. Direct ID match
  if (target.id) {
    const byId = PROVENANCE_ORIGIN_ENTITIES.find((p) => p.id === target.id);
    if (byId) return byId;
  }
  if (target.targetPlaceId) {
    const byPlaceId = PROVENANCE_ORIGIN_ENTITIES.find((p) => p.id === target.targetPlaceId);
    if (byPlaceId) return byPlaceId;
  }

  // 2. Name match (exact or significant inclusion)
  const name = target.name ?? "";
  if (name) {
    const byName = PROVENANCE_ORIGIN_ENTITIES.find((p) =>
      p.label === name ||
      (p.label.length >= 4 && (name.includes(p.label) || p.label.includes(name)))
    );
    if (byName) return byName;
  }

  return undefined;
}
