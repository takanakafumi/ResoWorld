import type { KnowledgePackCategory } from "@/domain/knowledge/source-evaluation";
import type { LensKnowledgePack } from "../schema";

export type LensTopicRenderer = "pack-relationship";

export type LensPerspectiveId = "mythology" | "religion" | "route" | "politics" | "people";

export type TopicFeature = "narrative" | "structural";

/**
 * 知識構造の認知アーキタイプ（メンタルモデルの基本型）
 * 「箱がつながっているだけ」の汎用グラフを脱却し、各トピックの文脈に最適な構造図を提供するための大分類。
 */
export type LensLayoutArchetype =
  | "sequence"    // ① シーケンス・回廊型（行程・動線・ステップ列）
  | "genealogy"   // ② 樹状・系譜型（親子・神統譜・師弟ツリー）
  | "hub-spoke"   // ③ 中心・外縁型（本宮・求心トポロジー・同心円）
  | "faction"     // ④ 勢力・相関型（アライアンス・対立・陣営ブロック）
  | "matrix"      // ⑤ 仮説対比・マトリクス型（論争・複数系統対照・比較表）
  | "stratum";    // ⑥ 積層・地層型（時代変遷・深層から表層の重層）

export const lensLayoutArchetypeLabels: Record<LensLayoutArchetype, string> = {
  sequence: "シーケンス・回廊型",
  genealogy: "樹状・系譜型",
  "hub-spoke": "中心・外縁型",
  faction: "勢力・相関型",
  matrix: "仮説対比・マトリクス型",
  stratum: "積層・地層型",
};

/**
 * TOPICが歴史・文化のどこにスポットライトを当てているかという単一の焦点（主題）
 * 1つのTOPICには必ず1つのFocusが割り当てられる。
 */
export type TopicFocus =
  | "genealogy"         // 神統譜（誓約神話・天孫降臨・皇統・神々の系譜）
  | "clan-legend"       // 氏族伝承（海人族・古代氏族の伝承）
  | "royal-legend"      // 王権伝承（神功皇后・西征・母子神）
  | "coast-myth"        // 海岸神話（海幸山幸・日南海岸・海洋神話回廊）
  | "kunitsukami"       // 国津神・出雲（出雲国譲り・大己貴信仰分布）
  | "dynasty-founding"  // 王権創始（神武東征・橿原即位）
  | "sacred-space"      // 神域・自然聖地（沖ノ島・三宮配置・厳島弥山）
  | "archaic-rite"      // 古層祭礼（弥生遺跡立地・地祇・神輿渡御・粥占い）
  | "syncretism"        // 神仏習合（八幡大菩薩・六郷満山・修験山岳信仰）
  | "state-system"      // 国家祭祀制度（延喜式神名帳・式内名神大社）
  | "regional-order"    // 地域秩序（令制国体制・諸国一宮）
  | "highways"          // 官道・交易路（古代官道・七道駅路・鉱物サプライチェーン）
  | "text-identification" // 史料比定（魏志倭人伝順序・所在地説）
  | "sea-corridor"      // 海上交通（瀬戸内海・周防灘の潮待ち航路と海陸結節）
  | "chieftain-network" // 首長・環濠基盤（拠点環濠集落・王墓群）
  | "mountain-pilgrimage" // 山岳登拝（弥山登拝路・修験路）
  | "diplomacy-structure" // 外交共立（卑弥呼共立・一大率・魏使外交）
  | "ancient-defense"   // 古代国防（白村江・朝鮮式山城・大宰府防衛）
  | "domain-reform"     // 藩政改革（幕末長州藩・海防・近代化政策）
  | "maritime-network"  // 対外港湾（近世海禁下の港湾統制・取引・都市記憶網）
  | "warrior-patronage" // 武家庇護（平氏政権・瀬戸内海壇・厳島社殿）
  | "patriot-alliance"  // 志士同盟（維新志士・薩長同盟・相関網）
  | "chieftain-alliance" // 首長・王権統合（古代海人首長・大和王権同盟・地域別統合比較）
  | "genpei-clash"      // 源平決戦（源平合戦・瀬戸内海壇・壇ノ浦決戦）
  | "buddhist-contact"  // 神仏接触（仏教初伝・神祇と仏教の初期接触）
  | "animism";          // 自然崇拝（アニミズム・磐座・巨石・神体山景観）

export const topicFocusLabels: Record<TopicFocus, string> = {
  genealogy: "神統譜",
  "clan-legend": "氏族伝承",
  "royal-legend": "王権伝承",
  "coast-myth": "海岸神話",
  kunitsukami: "国津神・出雲",
  "dynasty-founding": "王権創始",
  "sacred-space": "神域・自然聖地",
  "archaic-rite": "古層祭礼",
  syncretism: "神仏習合",
  "state-system": "国家祭祀制度",
  "regional-order": "地域秩序",
  highways: "官道・交易路",
  "text-identification": "史料比定",
  "sea-corridor": "海上交通",
  "chieftain-network": "首長・環濠基盤",
  "mountain-pilgrimage": "山岳登拝",
  "diplomacy-structure": "外交共立",
  "ancient-defense": "古代国防",
  "domain-reform": "藩政改革",
  "maritime-network": "対外港湾",
  "warrior-patronage": "武家庇護",
  "patriot-alliance": "志士同盟",
  "chieftain-alliance": "首長・王権統合",
  "genpei-clash": "源平決戦",
  "buddhist-contact": "神仏接触",
  animism: "自然崇拝",
};

export type TopicScopeCluster = {
  id: string;
  label: string;
  description?: string;
  connectionIds: readonly string[];
  nodeIds?: readonly string[];
  default?: boolean;
};

export type TopicDesignatedFaction = {
  id: string;
  label: string;
  color?: string;
  anchorId?: string;
  memberIds: readonly string[];
};

export type TopicBoundaryAxis = {
  label: string;
  icon?: string;
};

/**
 * 空間探索スケール（地域巡礼・フィールドワーク vs 日本列島広域・マクロ国家構想）
 */
export type TopicSpatialScale = "regional" | "national";

export type RegisteredLensTopic = {
  id: string;
  perspectiveId: LensPerspectiveId;
  label: string;
  description: string;
  focus: TopicFocus;
  focusLabel: string;
  archetype: LensLayoutArchetype;
  archetypeLabel: string;
  pack: LensKnowledgePack;
  packCategory: KnowledgePackCategory;
  packCategoryLabel: string;
  presetId: string;
  renderer: LensTopicRenderer;
  features: readonly TopicFeature[];
  isStratum?: boolean;
  spatialScale: TopicSpatialScale;
  scopeClusters?: readonly TopicScopeCluster[];
  designatedFactions?: readonly TopicDesignatedFaction[];
  boundaryAxis?: TopicBoundaryAxis;
};

/**
 * 知識構造の正本（Knowledge Pack）から切り出されるTOPICとLENSの定義
 * 正本（Pack） -> TOPIC（Preset） -> LENS（5大視点）の3層関係を1箇所で宣言的に定義します。
 */
export type KnowledgePackTopicMapping = {
  pack: LensKnowledgePack;
  packCategory: KnowledgePackCategory;
  topics: readonly {
    id: string;
    presetId: string;
    perspectiveId: LensPerspectiveId;
    label?: string; // 指定がなければ pack.presets から取得
    description?: string; // 指定がなければ pack.presets から取得
    focus: TopicFocus; // 単一の焦点（必須）
    archetype?: LensLayoutArchetype; // 認知アーキタイプ
    renderer: LensTopicRenderer;
    features?: readonly TopicFeature[]; // 指定がなければ ["structural"]
    isStratum?: boolean; // 通史・時代地層専用トピック（LENS水平バーからは除外）
    spatialScale: TopicSpatialScale; // 空間探索スケール（ADR-0029 必須明示宣言: regional | national）
    scopeClusters?: readonly TopicScopeCluster[];
    designatedFactions?: readonly TopicDesignatedFaction[];
    boundaryAxis?: TopicBoundaryAxis;
  }[];
};

export type RegisteredLensKnowledgePack = {
  readonly pack: LensKnowledgePack;
  readonly lensId: LensPerspectiveId;
  readonly presetIds: readonly string[];
};
