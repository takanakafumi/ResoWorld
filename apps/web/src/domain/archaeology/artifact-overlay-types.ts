/**
 * Archaeological Material Overlays (出土遺物・物質文化オーバーレイ)
 *
 * レンズや地層（FSM）とは直交し、地図（MapLibre / MapScene）上に
 * 三角縁神獣鏡、弥生青銅器（銅矛・銅鐸・銅剣）、威信財（ヒスイ・朱・鉄器）などの
 * 出土分布・数量バブルを重ね合わせて可視化する宣言的データモデル。
 */

export type ArtifactOverlayId =
  | "none"
  | "sankakubuchi-mirrors"
  | "yayoi-bronze-weapons-bells"
  | "jade-and-jasper"
  | "cinnabar-red-pigments"
  | "kofun-typology";

export type ArchaeologicalPeriod =
  | "yayoi-early"
  | "yayoi-middle"
  | "yayoi-late"
  | "yayoi-final"
  | "kofun-early"
  | "kofun-middle"
  | "kofun-late";

export type ArchaeologicalSiteType =
  | "kofun" // 前方後円墳、前方後方墳、円墳等
  | "kofun-early-tomb" // 弥生墳丘墓、初期首長墓
  | "settlement" // 集落・環濠集落
  | "ritual-hoard" // 銅鐸・銅剣等の山中一括埋納地
  | "workshop" // 鍛冶・青銅器鋳造工房跡
  | "cemetery"; // 甕棺墓群、土壙墓群

export type BurialStructureType =
  | "vertical-pit" // 竪穴式（竪穴式石室・粘土槨・木棺直葬）＝ 一代限りの密閉・不可逆・前期ヤマト主導
  | "horizontal-chamber" // 横穴式（横穴式石室・横穴墓）＝ 追葬可能・北部九州が朝鮮半島から先駆導入 ➔ 6世紀大和へ逆輸出
  | "underground-horizontal" // 地下式横穴墓 ＝ 南九州（日向・大隅・薩摩）シラス台地独自文化
  | "cairn-pit" // 弥生墳丘墓・甕棺・割竹形木棺
  | "ritual-pit"; // 山中埋納坑・採掘抗（銅鐸・辰砂等）

export type ArtifactCategory =
  | "mirror-sankakubuchi" // 三角縁神獣鏡
  | "mirror-han" // 漢鏡・後漢鏡・内行花文鏡
  | "bronze-bell" // 銅鐸
  | "bronze-spear" // 銅矛
  | "bronze-halberd" // 銅戈
  | "bronze-sword" // 銅剣
  | "jade-magatama" // ヒスイ勾玉
  | "jasper-ornament" // 碧玉製腕飾類
  | "cinnabar-pigment" // 辰砂・水銀朱
  | "bengala-pigment" // ベンガラ（酸化鉄）
  | "mineral-raw" // 原石・鉱床
  | "kofun-shape" // 墳丘形態（前方後円・四隅突出等）
  | "iron-weapon"; // 鉄器・鉄刀

export interface ArtifactCountDetail {
  category: ArtifactCategory;
  label: string; // 例: "三角縁神獣鏡"
  count: number; // 例: 33
  unit: string; // 例: "面", "個", "本"
  note?: string; // 例: "画文帯神獣鏡1面共伴", "中細形c類"
}

/**
 * 産地・工房・流通（Provenance / Material Origin）の種別
 */
export type ProvenanceType =
  | "primary-source" // 原産地・採掘坑（鉱山・自生地・原石採取地そのもの）
  | "production-workshop" // 製作工房・鋳造地（鋳型・玉作工具が出土した工房）
  | "overseas-import" // 海外舶載（中国・朝鮮半島等からの直輸入）
  | "central-distribution" // 中央政権からの分与（ヤマト王権等の同盟配布）
  | "long-distance-trade" // 超遠隔交易による受領（日本海航路・瀬戸内海等）
  | "disputed-academic"; // 学術論争地（舶載説 vs 国産説など）

/**
 * 出土遺物の原産地・工房・流通経路の学術情報
 */
export interface ArtifactProvenance {
  /** 産地・工房の種別 */
  type: ProvenanceType;
  /** 産地・工房の種別ラベル（例: "原産地（鉱山・採取地）", "超遠隔交易受領（糸魚川産）", "製作地論争（舶載 vs 国産）"） */
  typeLabel: string;
  /** 産地・工房・供給源の地域名称（例: "新潟県糸魚川（姫川・青海川流域）", "島根県松江市 花仙山（出雲玉造）", "中国・洛陽魏官営工房 または 畿内大和工房"） */
  sourceRegion: string;
  /** 原料・物質の性格（例: "硬玉（ジェダイト / 本翡翠）", "出雲青碧玉（出雲石）", "天然辰砂（水銀朱）", "青銅（中国・半島系鉛同位体）"） */
  materialName?: string;
  /** 流通・供給・交易の経路解説（例: "日本海沿岸航路を通じて糸魚川から北陸・山陰・北部九州へ超遠隔流通", "大和王権から同笵鏡同盟首長へ分与"） */
  distributionRoute?: string;
  /** 科学・考古学的判定根拠（例: "蛍光X線分析・EPMAによる糸魚川産同定", "鉛同位体比分析", "同笵鏡分布論"） */
  scientificEvidence?: string;
  /** 原産地・主要工房のサイトID（同一オーバーレイまたは登録サイト内のID。地点フォーカスや流通ベクトル線の接続先） */
  originSiteId?: string;
  /** 原産地・主要工房の代表名称 */
  originSiteName?: string;
  /** 原産地の代表座標（サイトID外からの接続や直接指定用） */
  originCoordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface ArchaeologicalSite {
  id: string;
  name: string;
  rubi: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  prefecture: string;
  municipality: string;
  period: ArchaeologicalPeriod;
  periodLabel: string; // 例: "古墳時代前期（4世紀初頭）"
  siteType: ArchaeologicalSiteType;
  siteTypeLabel: string; // 例: "前方後円墳（全長130m）"
  burialStructure?: BurialStructureType;
  burialStructureLabel?: string; // 例: "竪穴式粘土槨（密閉・追葬不可）", "横穴式石室（九州先駆・追葬可能）"
  burialTradition?: string; // 例: "一代限りのカリスマ首長封印", "一族・家族累代の追葬"
  designation?: string; // 例: "国史跡", "出土品国宝"

  // 産地・工房・流通情報 (Provenance)
  provenance?: ArtifactProvenance;
  
  // 数量と可視化
  totalCount: number;
  primaryUnit: string; // "面", "個", "本"
  countDetails: ArtifactCountDetail[];
  bubbleRadiusScale: number; // 1 (小: 1〜2点) 〜 5 (超巨大: 30点以上・全国最多級)
  accentColor: string; // バブルのメイン色
  secondaryColor?: string; // グラデーションや縁取り

  // 考古学的解説
  historicalSignificance: string;
  curationHighlight: string; // 博物館・展示目線の見どころ解説
  affiliatedPolity?: string; // 関連勢力（大和王権、吉備、奴国、出雲など）
  sameMoldGroupCount?: number; // 同笵鏡群数（椿井大塚山など）
  
  sources: Array<{
    title: string;
    note?: string;
  }>;
}

export interface ArtifactOverlayDefinition {
  id: ArtifactOverlayId;
  label: string;
  shortLabel: string;
  icon: string;
  description: string;
  legend: Array<{
    color: string;
    label: string;
    description: string;
  }>;
  sites: ArchaeologicalSite[];
}

export interface ArtifactOverlayOption {
  id: ArtifactOverlayId;
  label: string;
  shortLabel: string;
  icon: string;
  description: string;
}

export const ARTIFACT_OVERLAY_OPTIONS: readonly ArtifactOverlayOption[] = [
  {
    id: "sankakubuchi-mirrors",
    icon: "🪞",
    shortLabel: "三角縁神獣鏡",
    label: "三角縁神獣鏡（面数バブル）",
    description: "同一鋳型から鋳造された同笵鏡の分有・下賜ネットワーク",
  },
  {
    id: "cinnabar-red-pigments",
    icon: "🔴",
    shortLabel: "赤の塗料",
    label: "赤の塗料（水銀朱・辰砂 vs ベンガラ）",
    description: "若杉山辰砂・紀伊丹生鉱脈から王墓石室を満たす朱の交易網",
  },
  {
    id: "jade-and-jasper",
    icon: "💎",
    shortLabel: "翡翠・碧玉",
    label: "翡翠・碧玉（威信財と超遠隔交易）",
    description: "糸魚川ヒスイ・出雲花仙山碧玉の列島長距離循環",
  },
  {
    id: "yayoi-bronze-weapons-bells",
    icon: "🔔⚔️",
    shortLabel: "弥生青銅器",
    label: "弥生青銅器（銅矛・銅鐸・銅剣）",
    description: "北部九州の武器形青銅器と近畿の銅鐸文化圏の対峙・融合",
  },
  {
    id: "kofun-typology",
    icon: "🏯",
    shortLabel: "古墳の類型",
    label: "古墳の類型（前方後円・四隅突出等）",
    description: "大和前方後円墳体系と出雲・吉備・北部九州の地域墳墓",
  },
];

/**
 * 訪問スポットから関連する出土品・物質文化オーバーレイを解決する
 */
export function resolveSpotArtifactOverlays(spot: {
  id?: string;
  name: string;
  kind?: string;
}): readonly ArtifactOverlayOption[] {
  const norm = (spot.name + " " + (spot.kind ?? "")).toLowerCase();
  const id = spot.id ?? "";
  const results: ArtifactOverlayOption[] = [];

  const addOption = (optId: ArtifactOverlayId) => {
    const opt = ARTIFACT_OVERLAY_OPTIONS.find((o) => o.id === optId);
    if (opt && !results.some((r) => r.id === optId)) {
      results.push(opt);
    }
  };

  // 1. 九州国立博物館・太宰府天満宮（今回の太宰府探索）
  if (
    id === "spot-kyushu-national-museum" ||
    norm.includes("国立博物館") ||
    norm.includes("九州国立博物館")
  ) {
    addOption("sankakubuchi-mirrors");
    addOption("cinnabar-red-pigments");
    addOption("yayoi-bronze-weapons-bells");
    return results;
  }
  if (
    id === "spot-dazaifu-tenmangu" ||
    id === "spot-dazaifu-shiga-sha" ||
    norm.includes("太宰府天満宮") ||
    norm.includes("志賀社")
  ) {
    addOption("sankakubuchi-mirrors");
    addOption("cinnabar-red-pigments");
    return results;
  }

  // 2. 鏡・首長同盟
  if (
    norm.includes("黒塚") ||
    norm.includes("椿井") ||
    norm.includes("石塚山") ||
    norm.includes("平原") ||
    norm.includes("鏡") ||
    norm.includes("須玖岡本")
  ) {
    addOption("sankakubuchi-mirrors");
  }

  // 3. 朱・水銀・辰砂・ベンガラ
  if (
    norm.includes("若杉山") ||
    norm.includes("辰砂") ||
    norm.includes("水銀") ||
    norm.includes("丹生") ||
    norm.includes("ベンガラ") ||
    norm.includes("吹屋") ||
    norm.includes("王塚") ||
    norm.includes("朱")
  ) {
    addOption("cinnabar-red-pigments");
  }

  // 4. ヒスイ・碧玉・玉作
  if (
    norm.includes("ヒスイ") ||
    norm.includes("翡翠") ||
    norm.includes("糸魚川") ||
    norm.includes("長者ヶ原") ||
    norm.includes("碧玉") ||
    norm.includes("花仙山") ||
    norm.includes("玉作") ||
    norm.includes("玉造") ||
    norm.includes("奴奈川")
  ) {
    addOption("jade-and-jasper");
  }

  // 5. 弥生青銅器（銅鐸・銅剣・銅矛）
  if (
    norm.includes("荒神谷") ||
    norm.includes("加茂岩倉") ||
    norm.includes("大岩山") ||
    norm.includes("桜ヶ丘") ||
    norm.includes("吉野ヶ里") ||
    norm.includes("銅鐸") ||
    norm.includes("銅矛") ||
    norm.includes("銅剣") ||
    norm.includes("青銅器") ||
    norm.includes("板付")
  ) {
    addOption("yayoi-bronze-weapons-bells");
  }

  // 6. 古墳類型
  if (
    norm.includes("箸墓") ||
    norm.includes("四隅突出") ||
    norm.includes("西谷") ||
    norm.includes("楯築") ||
    norm.includes("大仙") ||
    norm.includes("造山") ||
    norm.includes("岩戸山") ||
    norm.includes("宮地嶽古墳")
  ) {
    addOption("kofun-typology");
  }

  return results;
}
