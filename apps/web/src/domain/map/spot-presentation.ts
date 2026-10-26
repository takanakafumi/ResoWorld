import { resolveSpotStratigraphyProfile } from "@/domain/knowledge/stratigraphy-profiles";
import { resolveNonStratumReason } from "@/domain/review/stratum-types";
import type { ReviewAtlasSpot } from "@/domain/review/types";

export type MapSpotCategory =
  | "museum"
  | "archaeology"
  | "shrine"
  | "temple"
  | "historic"
  | "nature"
  | "other";

export const mapSpotCategoryDefinitions: Array<{
  id: MapSpotCategory;
  label: string;
  icon: string;
  color: string;
}> = [
  { id: "museum", label: "歴史館・博物館", icon: "館", color: "#72b7e8" },
  { id: "archaeology", label: "遺跡・古墳", icon: "遺", color: "#e2a866" },
  { id: "shrine", label: "神社・神宮", icon: "社", color: "#e98579" },
  { id: "temple", label: "寺院", icon: "寺", color: "#b9a0e3" },
  { id: "historic", label: "史跡・歴史建築", icon: "史", color: "#d5b46d" },
  { id: "nature", label: "自然・景観", icon: "景", color: "#79c58c" },
  { id: "other", label: "その他", icon: "・", color: "#68c7bd" },
];

export function mapSpotPresentation(spot: Pick<ReviewAtlasSpot, "name" | "kind">) {
  const value = `${spot.kind} ${spot.name}`;
  const category: MapSpotCategory = /博物館|資料館|歴史館|記念館|ミュージアム/.test(value)
    ? "museum"
    : /遺跡|古墳|墳墓|王墓|貝塚/.test(value)
      ? "archaeology"
      : /神社|大社|神宮/.test(value)
        ? "shrine"
        : /寺院|寺\b|院\b|磨崖仏|仏閣/.test(value)
          ? "temple"
          : /史跡|城跡|城址|屋敷|生家|旧宅|塾|反射炉|造船所跡|墓所|墓\b/.test(value)
            ? "historic"
            : /自然|景観|海岸|浜|山|滝|洞窟|千畳敷/.test(value)
              ? "nature"
              : "other";
  return mapSpotCategoryDefinitions.find(({ id }) => id === category)!;
}

/**
 * 実際に現地を訪問した地点（Visited Spot）であるかを判定する。
 * 広域地域コンテキスト（area-context）や未訪問候補地（candidate-place）は false を返す。
 */
export function isMapVisitSpot(spot: Pick<ReviewAtlasSpot, "mapRole">) {
  return spot.mapRole !== "area-context" && spot.mapRole !== "candidate-place";
}

/**
 * 現地未訪問の探索候補地点（Candidate Spot）であるかを判定する。
 */
export function isMapCandidateSpot(spot: Pick<ReviewAtlasSpot, "mapRole" | "positionStatus">) {
  return spot.mapRole === "candidate-place" || (spot.positionStatus === "candidate" && spot.mapRole !== "area-context");
}

/**
 * 地図上にピン（訪問ピンまたは候補ピン）として描画可能な地点であるかを判定する。
 * 行政区域や広域地域などの背景コンテキスト（area-context）は除外する。
 */
export function isMapDisplayableSpot(spot: Pick<ReviewAtlasSpot, "mapRole">) {
  return spot.mapRole === "visited-place" || spot.mapRole === "candidate-place" || !spot.mapRole;
}

/**
 * スポットの認識的歴史的性格（Epistemic Nature）
 */
export type SpotEpistemicNature =
  | "ancient_continuity"     // 古層継承（性格A）: 宗像、沖ノ島、志賀海など
  | "probable_ancient"       // 古層候補（性格B）: 太祖神社下宮、香椎宮、古代遺跡など
  | "later_reconstitution"   // 後世再構成（性格C）: 中世再興、近世神道変革など
  | "modern_religious"       // 現代宗教景観（構想先行型・性格C）: 宝満神宮寺など
  | "museum_archive"         // 学術展示・ガイダンス拠点: 須恵町・粕屋町歴史資料館など
  | "modern_infrastructure"  // 生活・交通インフラ: 駅、ホテル等
  | "candidate_frontier"     // 未訪問・探索候補地: 阿恵官衙遺跡、須恵器窯跡群など
  | "unclassified";          // その他・調査中

/**
 * 地図上の地層・性格レイヤーフィルタ
 */
export type MapNatureFilter =
  | "all"              // すべて表示
  | "ancient_only"     // 古層・古代遺跡のみ（古層継承＋古層候補）
  | "sacred_only"      // 聖域景観（古層＋後世再構成＋現代宗教景観）
  | "museums_only"     // 学術展示・歴史資料館のみ
  | "candidates_only"; // 未訪問候補地のみ

export type SpotEpistemicNaturePresentation = {
  nature: SpotEpistemicNature;
  label: string;
  badge: string;
  icon: string;
  color: string;
  borderColor: string;
  borderStyle: "solid" | "dashed";
  description: string;
};

export const SPOT_EPISTEMIC_NATURE_DEFINITIONS: Record<
  SpotEpistemicNature,
  SpotEpistemicNaturePresentation
> = {
  ancient_continuity: {
    nature: "ancient_continuity",
    label: "古層継承（性格A）",
    badge: "古層継承",
    icon: "古",
    color: "#f0cf80", // ゴールド
    borderColor: "rgba(240, 207, 128, 0.9)",
    borderStyle: "solid",
    description: "4〜9世紀の古代祭祀・考古物証または古代基本史料（記紀・延喜式）により確証される基底層",
  },
  probable_ancient: {
    nature: "probable_ancient",
    label: "古層候補（性格B）",
    badge: "古層候補",
    icon: "伝",
    color: "#e2a866", // ウォームアンバー
    borderColor: "rgba(226, 168, 102, 0.9)",
    borderStyle: "solid",
    description: "風土記・延喜式外・中世成立史料または立地・地名から古代祭祀の可能性が高い聖域・遺跡",
  },
  later_reconstitution: {
    nature: "later_reconstitution",
    label: "後世再構成（性格C）",
    badge: "後世再構成",
    icon: "再",
    color: "#ba68c8", // バイオレット
    borderColor: "rgba(186, 104, 200, 0.9)",
    borderStyle: "solid",
    description: "中世武士団・近世藩主による再興や祭神変更・教理的再構成を経た聖域景観",
  },
  modern_religious: {
    nature: "modern_religious",
    label: "現代宗教景観（構想先行型）",
    badge: "現代宗教",
    icon: "新",
    color: "#b388ff", // ラベンダー
    borderColor: "rgba(179, 136, 255, 0.9)",
    borderStyle: "solid",
    description: "戦後〜現代に特定の教理構想や神仏習合再現を意図して新設された宗教景観",
  },
  museum_archive: {
    nature: "museum_archive",
    label: "学術展示・歴史資料館",
    badge: "学術展示",
    icon: "館",
    color: "#4fc3f7", // スカイブルー/シアン
    borderColor: "rgba(79, 195, 247, 0.9)",
    borderStyle: "solid",
    description: "出土遺物や文献史料の保存・展示・ガイダンスを行う公設学術拠点",
  },
  modern_infrastructure: {
    nature: "modern_infrastructure",
    label: "生活・交通インフラ",
    badge: "インフラ",
    icon: "施",
    color: "#78909c", // スレートグレー
    borderColor: "rgba(120, 144, 156, 0.7)",
    borderStyle: "solid",
    description: "交通（駅・港・空港）や宿泊・飲食などの旅程基盤施設",
  },
  candidate_frontier: {
    nature: "candidate_frontier",
    label: "未訪問候補地",
    badge: "候補",
    icon: "候",
    color: "#ffb74d", // オレンジ
    borderColor: "rgba(255, 183, 77, 0.9)",
    borderStyle: "dashed",
    description: "文献・周辺遺構から存在が確認されているが、現地未踏査の探索フロンティア",
  },
  unclassified: {
    nature: "unclassified",
    label: "調査中・その他",
    badge: "調査中",
    icon: "・",
    color: "#68c7bd", // ティール
    borderColor: "rgba(104, 199, 189, 0.8)",
    borderStyle: "solid",
    description: "現在エビデンス集約・性格判定を実施中の地点",
  },
};

/**
 * スポットの宣言的属性（史料プロファイル、非地層理由、訪問ステータス、種別）から
 * 認識的歴史的性格（SpotEpistemicNature）を決定する。
 */
export function resolveSpotEpistemicNature(spot: ReviewAtlasSpot): SpotEpistemicNature {
  // 1. 未訪問候補地（探索フロンティア）
  if (
    spot.mapRole === "candidate-place" ||
    (spot.positionStatus === "candidate" &&
      (spot.kind.includes("候補") || spot.name.includes("候補") || spot.id.startsWith("spot-candidate-")))
  ) {
    return "candidate_frontier";
  }

  const profile = resolveSpotStratigraphyProfile(spot);
  const nonStratumReason = resolveNonStratumReason(spot, profile);

  // 2. 現代宗教景観（構想先行型・性格C）
  if (nonStratumReason === "modern_conception_religious") {
    return "modern_religious";
  }

  // 3. 学術展示・歴史資料館
  if (nonStratumReason === "museum_archive") {
    return "museum_archive";
  }

  // 4. 生活・交通インフラ
  if (nonStratumReason === "modern_infrastructure") {
    return "modern_infrastructure";
  }

  // 5. プロファイルによる歴史的性格（A / B / C）
  if (profile?.historicalNature === "A_BEDROCK_CONTINUITY") {
    return "ancient_continuity";
  }
  if (profile?.historicalNature === "B_BEDROCK_CANDIDATE") {
    return "probable_ancient";
  }
  if (profile?.historicalNature === "C_LATER_RECONSTITUTION") {
    return "later_reconstitution";
  }

  // 6. 種別による古層考古・神社のフォールバック
  if (/遺跡|古墳|墳墓|王墓|貝塚|窯跡群|官衙/.test(`${spot.kind} ${spot.name}`)) {
    return "probable_ancient";
  }
  if (/神社|神宮|大社|元宮|奥宮/.test(`${spot.kind} ${spot.name}`)) {
    return "probable_ancient";
  }
  if (/寺院|寺\b|院\b|磨崖仏/.test(`${spot.kind} ${spot.name}`)) {
    return "later_reconstitution";
  }

  return "unclassified";
}

/**
 * 指定された歴史的性格が、アクティブな地図レイヤーフィルタに適合するか判定する。
 */
export function spotMatchesNatureFilter(
  nature: SpotEpistemicNature,
  filter: MapNatureFilter,
): boolean {
  switch (filter) {
    case "all":
      return true;
    case "ancient_only":
      return nature === "ancient_continuity" || nature === "probable_ancient";
    case "sacred_only":
      return (
        nature === "ancient_continuity" ||
        nature === "probable_ancient" ||
        nature === "later_reconstitution" ||
        nature === "modern_religious"
      );
    case "museums_only":
      return nature === "museum_archive";
    case "candidates_only":
      return nature === "candidate_frontier";
    default:
      return true;
  }
}
