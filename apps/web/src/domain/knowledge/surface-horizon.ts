import type { Claim } from "./schema";
import { resolveSpotStratigraphyProfile } from "./stratigraphy-profiles";
import {
  getSpotFieldObservationClaims,
  resolveNonStratumReason,
  type NonStratumReason,
  type StratumResolutionContext,
} from "../review/stratum-types";
import type { ReviewAtlasSpot } from "../review/types";

/**
 * 4象限「表層動態 (Surface Horizon)」:
 * L1〜L5の純粋な歴史地層とは直交する、「現在の地表面でその場所がどう立ち現れているか」の分類。
 * 博物館・資料館（museum_archive）は4象限には混ぜず、学術展示・アーカイブ枠として別管理する。
 */
export type SurfaceHorizonKind =
  | "tourism_world_heritage"
  | "quiet_living_tradition"
  | "urban_regeneration_experiment"
  | "conception_modern_creation";

export type SurfaceHorizonExclusionReason =
  | "museum_archive"
  | "transit_utility"
  | "unobserved";

export type SurfaceHorizonMeta = {
  kind: SurfaceHorizonKind;
  icon: string;
  shortLabel: string;
  label: string;
  subtitle: string;
  cueSummary: string;
};

export const SURFACE_HORIZON_ORDER: readonly SurfaceHorizonKind[] = [
  "tourism_world_heritage",
  "quiet_living_tradition",
  "urban_regeneration_experiment",
  "conception_modern_creation",
] as const;

export const SURFACE_HORIZON_META: Record<SurfaceHorizonKind, SurfaceHorizonMeta> = {
  tourism_world_heritage: {
    kind: "tourism_world_heritage",
    icon: "🏛️",
    shortLabel: "観光・世界遺産表層",
    label: "🏛️ 観光・世界遺産表層",
    subtitle: "主要観光動線・保存公開・観光消費・インバウンドが前面化する現在相",
    cueSummary: "大量の観光客・行列・世界遺産公開・食の観光消費・整備された大社空間",
  },
  quiet_living_tradition: {
    kind: "quiet_living_tradition",
    icon: "🌿",
    shortLabel: "静謐・地域持続相",
    label: "🌿 静謐・地域持続相",
    subtitle: "観光動線から外れ、在地の静謐さ・信仰・生活時間の中で静かに持続する現在相",
    cueSummary: "観光客が乏しい・派手な演出がない・森や山の静寂・在地の鎮守空間",
  },
  urban_regeneration_experiment: {
    kind: "urban_regeneration_experiment",
    icon: "🏙️",
    shortLabel: "都市再編・再生実験相",
    label: "🏙️ 都市再編・再生実験相",
    subtitle: "近代都市開発への埋没露頭、または観光・展示・温泉街のデザイン再生実験の現在相",
    cueSummary: "都市化の谷間の露頭・廃業ホテルとデザイン再生の併存・デジタル展示再設計",
  },
  conception_modern_creation: {
    kind: "conception_modern_creation",
    icon: "✨",
    shortLabel: "構想先行・現代新造相",
    label: "✨ 構想先行・現代新造相",
    subtitle: "近現代の宗教的構想や新造デザインによって意図的に配置・造形された現在相",
    cueSummary: "昭和末〜平成以降の開創・構想先行型配置・現代新造霊場",
  },
};

export type SurfaceHorizonBasisKind =
  | "curated_profile"
  | "formation_model"
  | "field_observation"
  | "heritage_default";

export type SurfaceHorizonResolution =
  | {
      status: "resolved";
      kind: SurfaceHorizonKind;
      basis: SurfaceHorizonBasisKind;
      summary: string;
      observationClaims: readonly Claim[];
      matchedSignals: readonly string[];
      nonStratumReason?: NonStratumReason;
    }
  | {
      status: "excluded";
      exclusionReason: SurfaceHorizonExclusionReason;
      summary: string;
      observationClaims: readonly Claim[];
      nonStratumReason: NonStratumReason;
    };

type DeclarativeSpotHorizonRule = {
  spotIds?: readonly string[];
  exactSpotNames: readonly string[];
  kind: SurfaceHorizonKind;
  summary: string;
};

/**
 * 代表拠点・対比拠点の宣言的表層動態レジストリ（原則 ① Declarative First）
 */
export const SURFACE_HORIZON_SPOT_PROFILES: readonly DeclarativeSpotHorizonRule[] = [
  {
    spotIds: ["spot-import-3048de44"],
    exactSpotNames: ["厳島神社"],
    kind: "tourism_world_heritage",
    summary: "海から大鳥居・本殿へ至る満潮景観の上に、大量の観光客と長い行列が重なる世界的観光表層。",
  },
  {
    spotIds: ["spot-import-ce8f62f9"],
    exactSpotNames: ["御山神社"],
    kind: "quiet_living_tradition",
    summary: "厳島神社の奥宮でありながらロープウェー・山頂観光客の主要動線から外れ、巨岩と森の静謐が残る。",
  },
  {
    spotIds: ["spot-import-93854014"],
    exactSpotNames: ["大元神社"],
    kind: "quiet_living_tradition",
    summary: "宮島の観光喧騒から少し離れた森の入口で、小さく派手な装飾のない空間として静かに持続している。",
  },
  {
    spotIds: ["omoto-jinja"],
    exactSpotNames: ["御許山・大元神社"],
    kind: "quiet_living_tradition",
    summary: "登山によって神社というより山そのものへ入る感覚を残し、立入禁止の磐座神域が保たれている。",
  },
  {
    spotIds: ["usa-jingu"],
    exactSpotNames: ["宇佐神宮"],
    kind: "tourism_world_heritage",
    summary: "全国八幡の総本宮として広大によく整備された、大規模な宗教・公開拠点としての現在相。",
  },
  {
    spotIds: ["spot-homan-shinguji"],
    exactSpotNames: ["宝満神宮寺・根本山 宝満堂", "宝満神宮寺"],
    kind: "conception_modern_creation",
    summary: "1989年開教・1994年以降造営の宗教的構想に基づき、三ツ鳥居・八大龍王神池・諸尊を一堂に配置した現代新造景観。",
  },
  {
    spotIds: ["spot-entity-20c6c6a47c1356d70583"],
    exactSpotNames: ["筑紫神社"],
    kind: "quiet_living_tradition",
    summary: "古代峠祭祀と粥占の記憶を保ち、観光地化しすぎない在地の鎮守として持続している（※観光動線の比較観察は今後拡充対象）。",
  },
  {
    spotIds: ["spot-geocode-888466064767"],
    exactSpotNames: ["萩"],
    kind: "quiet_living_tradition",
    summary: "世界遺産群を含みつつも観光資源を派手に演出せず、町の中に近世〜幕末の時間がそのまま残る現在相。",
  },
  {
    spotIds: ["spot-geocode-4c04e938d38a"],
    exactSpotNames: ["長門湯本"],
    kind: "urban_regeneration_experiment",
    summary: "意図的にデザイン再生された中心部と、周辺に残る廃業ホテルが併存する「再生途上の温泉街」の実験空間。",
  },
  {
    spotIds: ["spot-import-825b963f"],
    exactSpotNames: ["白神社"],
    kind: "urban_regeneration_experiment",
    summary: "かつての海中岩礁が近代広島の市街地開発の下に埋め込まれ、ビルの谷間に露頭として偶然発見される都市埋没相。",
  },
  {
    spotIds: ["spot-import-cb883a9c"],
    exactSpotNames: ["福山城"],
    kind: "urban_regeneration_experiment",
    summary: "近世城郭遺構の上で映像・デジタル展示・体験型コンテンツ設計を前面に出す現代的再編拠点。",
  },
  {
    spotIds: ["spot-import-726e7d67"],
    exactSpotNames: ["原爆ドーム"],
    kind: "tourism_world_heritage",
    summary: "1945年の戦争記憶・物証の上に国際的な多数の観光客と平和記念の制度的意味付けが重なる現代世界遺産表層。",
  },
  {
    spotIds: ["spot-geocode-54fce6a9b371"],
    exactSpotNames: ["唐戸市場"],
    kind: "tourism_world_heritage",
    summary: "国内外の観光客が密集して寿司を選ぶ、現代的な食の観光消費そのものが立ち現れる海辺市場拠点。",
  },
  {
    exactSpotNames: ["高祖神社"],
    kind: "quiet_living_tradition",
    summary: "高祖山を背負い観光客がほぼいない、静かで厳かな山裾の古社空間。",
  },
  {
    exactSpotNames: ["細石神社"],
    kind: "quiet_living_tradition",
    summary: "観光演出を抑え、自然物や土地の積層を感じさせる伊都国領域の静謐な在地の社。",
  },
  {
    exactSpotNames: ["大己貴神社"],
    kind: "quiet_living_tradition",
    summary: "観光地化されておらず、神体山遥拝所と延喜式内社の雰囲気を静かに保つ朝倉の古社。",
  },
  {
    exactSpotNames: ["弥山山頂"],
    kind: "tourism_world_heritage",
    summary: "ロープウェーから寺院・展望へ続く宮島の主要観光動線が集中する山頂拠点。",
  },
];

const SPOT_PROFILE_BY_ID = new Map<string, DeclarativeSpotHorizonRule>();
const SPOT_PROFILE_BY_NAME = new Map<string, DeclarativeSpotHorizonRule>();
for (const rule of SURFACE_HORIZON_SPOT_PROFILES) {
  for (const id of rule.spotIds ?? []) {
    SPOT_PROFILE_BY_ID.set(id, rule);
  }
  for (const name of rule.exactSpotNames) {
    SPOT_PROFILE_BY_NAME.set(name, rule);
  }
}

type SignalRule = {
  kind: SurfaceHorizonKind;
  pattern: RegExp;
  label: string;
};

/** 現地観察 (field_observation) のテキスト語彙から表層動態を推定する宣言的ルール */
const SURFACE_HORIZON_SIGNAL_RULES: readonly SignalRule[] = [
  // 1. 都市再編・再生実験相
  {
    kind: "urban_regeneration_experiment",
    pattern: /再生途中|デザインされて|廃業したホテル|リニューアル|デジタル展示|体験型コンテンツ|現代的である/,
    label: "都市再生・展示実験観察",
  },
  {
    kind: "urban_regeneration_experiment",
    pattern: /都市化|市街地.*埋|路面電車|繁華街/,
    label: "現代都市空間の積層観察",
  },
  // 2. 観光・世界遺産表層
  {
    kind: "tourism_world_heritage",
    pattern: /大量の観光客|長い行列|海外からの観光客|観光客が多|多くの人が集まって|満員|観光消費/,
    label: "観光客集中・観光消費観察",
  },
  {
    kind: "tourism_world_heritage",
    pattern: /世界遺産|撮影する有名な場所|Webチケット|混雑/,
    label: "世界遺産・公開観光動線",
  },
  // 3. 静謐・地域持続相
  {
    kind: "quiet_living_tradition",
    pattern: /観光客が(?:ほぼ|ほとんど)?いな|観光地化されていな|主要動線から外れ|人の気配が薄れ|派手に演出せず|派手な装飾はなかっ/,
    label: "非観光動線・静謐観察",
  },
  {
    kind: "quiet_living_tradition",
    pattern: /質素|地味|厳かな雰囲気|苔と巨岩|山そのものへ入る/,
    label: "質素・自然持続感覚",
  },
];

/**
 * 博物館・資料館（museum_archive）を4象限から別枠除外するかどうかを判定する。
 * 屋外の世界遺産遺構（原爆ドーム: kind "memorial"）は4象限の「観光・世界遺産表層」に属するため除外しない。
 */
export function isSurfaceMuseumArchive(
  spot: ReviewAtlasSpot,
  nonStratumReason: NonStratumReason,
): boolean {
  if (nonStratumReason !== "museum_archive") return false;
  // 記念館・祈念館・資料館・博物館は学術展示/アーカイブとして別枠維持
  if (
    spot.kind === "museum" ||
    /博物館|資料館|記念館|祈念館|展示館|歴史館|体験学習館/.test(spot.name) ||
    /博物館|資料館|記念館|祈念館/.test(spot.kind)
  ) {
    return true;
  }
  // `kind === "memorial"` で名称に「館」を含まない屋外モニュメント（例: 原爆ドーム）は表層動態の対象とする
  return false;
}

const TRANSIT_UTILITY_KINDS = new Set([
  "station",
  "hotel",
  "restaurant",
  "bar",
  "cafe",
  "rest_house",
  "commercial_district",
  "橋・交通インフラ",
]);

function matchesSignalRules(
  obsClaims: readonly Claim[],
): { kind: SurfaceHorizonKind; matchedSignals: string[] } | undefined {
  if (obsClaims.length === 0) return undefined;
  const scoreMap = new Map<SurfaceHorizonKind, { score: number; labels: string[] }>([
    ["urban_regeneration_experiment", { score: 0, labels: [] }],
    ["tourism_world_heritage", { score: 0, labels: [] }],
    ["quiet_living_tradition", { score: 0, labels: [] }],
  ]);

  for (const claim of obsClaims) {
    for (const rule of SURFACE_HORIZON_SIGNAL_RULES) {
      if (rule.pattern.test(claim.statement)) {
        const entry = scoreMap.get(rule.kind);
        if (entry) {
          entry.score += 1;
          if (!entry.labels.includes(rule.label)) {
            entry.labels.push(rule.label);
          }
        }
      }
    }
  }

  // 優先順: 出現数最多（同点時は明示的な再生・静謐観察を優先）
  const ordered = [
    "urban_regeneration_experiment",
    "quiet_living_tradition",
    "tourism_world_heritage",
  ] as const;

  let bestKind: SurfaceHorizonKind | undefined;
  let bestScore = 0;
  let bestLabels: string[] = [];

  for (const kind of ordered) {
    const entry = scoreMap.get(kind)!;
    if (entry.score > bestScore) {
      bestScore = entry.score;
      bestKind = kind;
      bestLabels = entry.labels;
    }
  }

  return bestKind ? { kind: bestKind, matchedSignals: bestLabels } : undefined;
}

/**
 * 1スポットの「表層動態 (Surface Horizon)」を解決する。
 */
export function resolveSpotSurfaceHorizon(
  spot: ReviewAtlasSpot,
  context?: StratumResolutionContext,
): SurfaceHorizonResolution {
  const profile = resolveSpotStratigraphyProfile(spot);
  const nonStratumReason = resolveNonStratumReason(spot, profile);
  const observationClaims = getSpotFieldObservationClaims(spot, context);

  // 1. 博物館・資料館は4象限に混ぜず別枠（museum_archive）として維持（取扱A）
  if (isSurfaceMuseumArchive(spot, nonStratumReason)) {
    return {
      status: "excluded",
      exclusionReason: "museum_archive",
      summary: "現代の学術展示・歴史アーカイブ施設（4象限「表層動態」とは別枠で記録）",
      observationClaims,
      nonStratumReason,
    };
  }

  // 2. 宣言的キュレーション辞書に完全一致する場合
  const curated = SPOT_PROFILE_BY_ID.get(spot.id) ?? SPOT_PROFILE_BY_NAME.get(spot.name);
  if (curated) {
    const sigMatch = matchesSignalRules(observationClaims);
    return {
      status: "resolved",
      kind: curated.kind,
      basis: "curated_profile",
      summary: curated.summary,
      observationClaims,
      matchedSignals: sigMatch?.matchedSignals ?? [],
      nonStratumReason,
    };
  }

  // 3. 構想先行型（性格C・現代新造宗教景観）は「構想先行・現代新造相」
  if (
    nonStratumReason === "modern_conception_religious" ||
    profile?.formationModel === "conception_driven"
  ) {
    return {
      status: "resolved",
      kind: "conception_modern_creation",
      basis: "formation_model",
      summary: "近現代の宗教的構想に基づき設計・配置された現代新造景観。",
      observationClaims,
      matchedSignals: ["構想先行型プロファイル"],
      nonStratumReason,
    };
  }

  // 4. 純粋な移動・飲食インフラや広域地域コンテキスト（キュレーション対象外）は除外
  if (
    TRANSIT_UTILITY_KINDS.has(spot.kind) ||
    nonStratumReason === "modern_infrastructure"
  ) {
    return {
      status: "excluded",
      exclusionReason: "transit_utility",
      summary: "旅程上の交通・宿泊・飲食等のインフラ施設",
      observationClaims,
      nonStratumReason,
    };
  }

  if (nonStratumReason === "area_context") {
    return {
      status: "excluded",
      exclusionReason: "unobserved",
      summary: "広域地域コンテキスト（個別の町並み・拠点単位で表層動態を表示します）",
      observationClaims,
      nonStratumReason,
    };
  }

  // 5. field_observation Claim 内の現代観察語彙による自動解決
  const signalMatch = matchesSignalRules(observationClaims);
  if (signalMatch) {
    const meta = SURFACE_HORIZON_META[signalMatch.kind];
    return {
      status: "resolved",
      kind: signalMatch.kind,
      basis: "field_observation",
      summary:
        observationClaims[0]?.statement ??
        meta.subtitle,
      observationClaims,
      matchedSignals: signalMatch.matchedSignals,
      nonStratumReason,
    };
  }

  // 6. その他・現地訪問記録または一般寺社で観光客集中記載がない地点
  if (observationClaims.length > 0) {
    return {
      status: "resolved",
      kind: "quiet_living_tradition",
      basis: "heritage_default",
      summary: observationClaims[0]?.statement ?? SURFACE_HORIZON_META.quiet_living_tradition.subtitle,
      observationClaims,
      matchedSignals: ["現地訪問観察あり（過密観光記載なし）"],
      nonStratumReason,
    };
  }

  return {
    status: "excluded",
    exclusionReason: "unobserved",
    summary: "現代の地表面に関する現地観察（field_observation）が未登録です",
    observationClaims: [],
    nonStratumReason,
  };
}

/**
 * 地域・島・歴史系譜を横断して「現在の立ち現れ方（表層動態）」を比較する対比ペア辞書
 */
export type SurfaceContrastObservationDensity = "rich" | "partial" | "structural";

export type SurfaceContrastPair = {
  id: string;
  title: string;
  axisLabel: string;
  leftSpotName: string;
  rightSpotName: string;
  leftKind: SurfaceHorizonKind;
  rightKind: SurfaceHorizonKind;
  observationDensity: SurfaceContrastObservationDensity;
  contrastSummary: string;
  caveatNote: string;
};

export const SURFACE_CONTRAST_PAIRS: readonly SurfaceContrastPair[] = [
  {
    id: "contrast-miyajima-itsukushima-vs-oyama",
    title: "厳島神社 ⇄ 御山神社（同一島内の動線分岐）",
    axisLabel: "世界的観光表層 vs 奥宮の静謐",
    leftSpotName: "厳島神社",
    rightSpotName: "御山神社",
    leftKind: "tourism_world_heritage",
    rightKind: "quiet_living_tradition",
    observationDensity: "rich",
    contrastSummary:
      "同一の「宗像三女神」を祀り同じ宮島に属しながら、海辺の厳島神社は満潮の建築美と大量の観光客・長い行列が前面化する一方、奥宮である御山神社はロープウェー山頂動線から外れ巨岩と森の静寂を保っている。",
    caveatNote:
      "両地点とも10件前後の現地観察 Claim に裏付けられた最もコントラストの明瞭な比較ペアです。",
  },
  {
    id: "contrast-yamaguchi-hagi-vs-nagatoyumoto",
    title: "萩 ⇄ 長門湯本（温存の町 vs 再生実験の町）",
    axisLabel: "過去が残る町 vs 意図的デザイン再生",
    leftSpotName: "萩",
    rightSpotName: "長門湯本",
    leftKind: "quiet_living_tradition",
    rightKind: "urban_regeneration_experiment",
    observationDensity: "rich",
    contrastSummary:
      "萩は明治日本の産業革命遺産を含みながらも派手な観光演出を抑えて生活の中に歴史を残すのに対し、長門湯本は星野リゾート等が関わった現代的デザイン中心部と周辺の廃業ホテルが併存する「再生実験の途上」にある。",
    caveatNote:
      "山口3日間フィールドノートに基づく直接対比であり、同じ県内近接エリアで現在相の設計差が鮮明に現れています。",
  },
  {
    id: "contrast-chikushi-vs-homan-shinguji",
    title: "筑紫神社 ⇄ 宝満神宮寺（累積継承 vs 現代新造構想）",
    axisLabel: "在地鎮守の持続 vs 平成期の構想先行配置",
    leftSpotName: "筑紫神社",
    rightSpotName: "宝満神宮寺・根本山 宝満堂",
    leftKind: "quiet_living_tradition",
    rightKind: "conception_modern_creation",
    observationDensity: "structural",
    contrastSummary:
      "筑紫神社が延喜式内社・峠の荒ぶる神伝承から現在まで連続して在地の鎮守であり続けるのに対し、宝満神宮寺は1994年以降に現代の宗教的構想に基づき三ツ鳥居・八大龍王神池・諸尊を新規配置した現代新造景観である。",
    caveatNote:
      "※ 観光客動態の現地比較データがまだ薄いため、主に景観形成モデル（accumulated vs conception_driven）の対比として提示しています。",
  },
  {
    id: "contrast-usa-jingu-vs-omoto",
    title: "宇佐神宮 ⇄ 御許山・大元神社（整備大社 vs 山岳禁足地）",
    axisLabel: "整備された大規模拠点 vs 山そのものへの参入",
    leftSpotName: "宇佐神宮",
    rightSpotName: "御許山・大元神社",
    leftKind: "tourism_world_heritage",
    rightKind: "quiet_living_tradition",
    observationDensity: "partial",
    contrastSummary:
      "八幡総本宮として広大によく整備された宇佐神宮の現代景観と、宇佐神宮の奥宮（山宮）にあたり急峻な登山を経て立入禁止の三つの磐座へ向き合う御許山・大元神社は、同一信仰圏内で表層の体験質が大きく異なる。",
    caveatNote:
      "※ 現地観察 Claim は各1件とまだ簡潔な記録段階のため、今後の再訪観察で拡充余地があります。",
  },
  {
    id: "contrast-urban-bingo-aki-shirakami-vs-fukuyama",
    title: "白神社 ⇄ 福山城（都市埋没露頭 vs デジタル展示再編）",
    axisLabel: "ビルの谷間の偶然露頭 vs 体験設計された城郭",
    leftSpotName: "白神社",
    rightSpotName: "福山城",
    leftKind: "urban_regeneration_experiment",
    rightKind: "urban_regeneration_experiment",
    observationDensity: "partial",
    contrastSummary:
      "同じ「都市再編・現在相」でも、白神社はかつての海中岩礁が現代広島の市街地ビル群に埋もれて偶然の露頭として立ち現れるのに対し、福山城は城郭史跡の上で映像・デジタル展示などの体験設計を前面化している。",
    caveatNote:
      "同じ象限内部でも「無意図の埋没露頭」と「意図的な現代体験設計」で質的に異なる二相が存在することを示します。",
  },
  {
    id: "contrast-genbaku-vs-karato",
    title: "原爆ドーム ⇄ 唐戸市場（記憶保存表層 vs 現代観光消費）",
    axisLabel: "20世紀記憶の世界遺産 vs 食の観光消費市場",
    leftSpotName: "原爆ドーム",
    rightSpotName: "唐戸市場",
    leftKind: "tourism_world_heritage",
    rightKind: "tourism_world_heritage",
    observationDensity: "rich",
    contrastSummary:
      "どちらも国内外の観光客が密集する現在相でありながら、原爆ドームは1945年の出来事・物証と市民運動が重なる「歴史記憶の世界遺産表層」であるのに対し、唐戸市場は寿司を選ぶ観光客の光景そのものが主役の「純粋観光消費空間」である。",
    caveatNote:
      "STRATUM（L1〜L5）の枠外や近代層において、同系統の人流・国際観光表層でも歴史的厚みの質が大きく異なります。",
  },
];

export type SurfaceHorizonSpotEntry = {
  spot: ReviewAtlasSpot;
  resolution: Extract<SurfaceHorizonResolution, { status: "resolved" }>;
};

export type SurfaceHorizonResolvedPair = {
  pair: SurfaceContrastPair;
  leftSpot?: ReviewAtlasSpot;
  rightSpot?: ReviewAtlasSpot;
  leftResolution?: SurfaceHorizonResolution;
  rightResolution?: SurfaceHorizonResolution;
};

export type SurfaceHorizonIndex = {
  bySpotId: ReadonlyMap<string, SurfaceHorizonResolution>;
  byKind: ReadonlyMap<SurfaceHorizonKind, readonly SurfaceHorizonSpotEntry[]>;
  museumArchiveSpots: readonly ReviewAtlasSpot[];
  contrastPairs: readonly SurfaceHorizonResolvedPair[];
  resolvedCount: number;
};

/**
 * 全スポット・全対比ペアの表層動態を $O(N)$ で事前実体化し、UIから $O(1)$ で参照可能にする。
 */
export function buildSurfaceHorizonIndex(
  spots: readonly ReviewAtlasSpot[],
  context?: StratumResolutionContext,
): SurfaceHorizonIndex {
  const bySpotId = new Map<string, SurfaceHorizonResolution>();
  const byKind = new Map<SurfaceHorizonKind, SurfaceHorizonSpotEntry[]>(
    SURFACE_HORIZON_ORDER.map((kind) => [kind, []]),
  );
  const museumArchiveSpots: ReviewAtlasSpot[] = [];
  const spotByName = new Map<string, ReviewAtlasSpot>();
  let resolvedCount = 0;

  for (const spot of spots) {
    if (!spotByName.has(spot.name)) {
      spotByName.set(spot.name, spot);
    }
    const res = resolveSpotSurfaceHorizon(spot, context);
    bySpotId.set(spot.id, res);
    if (res.status === "resolved") {
      resolvedCount += 1;
      byKind.get(res.kind)?.push({ spot, resolution: res });
    } else if (res.exclusionReason === "museum_archive") {
      museumArchiveSpots.push(spot);
    }
  }

  for (const [, list] of byKind) {
    list.sort((a, b) => {
      const obsDiff = b.resolution.observationClaims.length - a.resolution.observationClaims.length;
      if (obsDiff !== 0) return obsDiff;
      return a.spot.name.localeCompare(b.spot.name, "ja");
    });
  }

  const contrastPairs: SurfaceHorizonResolvedPair[] = SURFACE_CONTRAST_PAIRS.map((pair) => {
    const leftSpot = spotByName.get(pair.leftSpotName);
    const rightSpot = spotByName.get(pair.rightSpotName);
    return {
      pair,
      leftSpot,
      rightSpot,
      leftResolution: leftSpot ? bySpotId.get(leftSpot.id) : undefined,
      rightResolution: rightSpot ? bySpotId.get(rightSpot.id) : undefined,
    };
  });

  return {
    bySpotId,
    byKind,
    museumArchiveSpots,
    contrastPairs,
    resolvedCount,
  };
}
