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
  designation?: string; // 例: "国史跡", "出土品国宝"
  
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
