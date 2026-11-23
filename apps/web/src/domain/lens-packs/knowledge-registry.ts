import {
  KNOWLEDGE_PACK_CATEGORY_LABELS,
  type KnowledgePackCategory,
} from "@/domain/knowledge/source-evaluation";
import { ancientChieftainsPack } from "./ancient-chieftains-pack";
import { ancientMaterialCulturePack } from "./ancient-material-culture-pack";
import { hagiBakumatsuPack } from "./bakumatsu-pack";
import { earlyModernPortNetworkPack } from "./early-modern-port-network-pack";
import { genpeiDannouraPack } from "./genpei-dannoura-pack";
import { hyugaMythologyPack } from "./hyuga-mythology-pack";
import { ishinFiguresPack } from "./ishin-figures-pack";
import { izumoKunitsukamiPack } from "./izumo-kunitsukami-pack";
import { jinguKogoLegendPack } from "./jingu-kogo-pack";
import { korasanSacredLandscapePack } from "./korasan-sacred-landscape-pack";
import { kunisakiSyncretismPack } from "./kunisaki-syncretism-pack";
import { marineDeitiesPack } from "./marine-deities-pack";
import { miyajimaMisenSacredLandscapePack } from "./miyajima-misen-pack";
import { munakataOkinoshimaSacredLandscapePack } from "./munakata-okinoshima-pack";
import { setouchiMaritimeNetworkPack } from "./setouchi-maritime-network-pack";
import {
  ancientDefenseNetworkPack,
  ancientHighwaysNetworkPack,
  ichinomiyaWesternNetworkPack,
  jinmuToseiNetworkPack,
  shikinaishaChikuzenBuzenPack,
  yayoiArchaeologyNetworkPack,
} from "./pack-loader";
import type { LensKnowledgePack } from "./schema";
import { japaneseMythologyPack, religionRelationsPack, wajindenRoutesPack } from "./seed-packs";

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

export const canonicalKnowledgePackTopicMappings: readonly KnowledgePackTopicMapping[] = [
  // 1. 日本神話・神統譜
  {
    pack: japaneseMythologyPack,
    packCategory: "genealogy-pack",
    topics: [
      {
        id: "munakata-genealogy",
        presetId: "munakata-connections",
        perspectiveId: "mythology",
        label: "誓約神話と皇統譜の創始",
        description: "アマテラスとスサノオの誓約から皇祖神（五男神・天忍穂耳尊）と宗像三女神が誕生し、天孫降臨へと連なる神統譜の創始を見る",
        focus: "genealogy",
        spatialScale: "regional",
        archetype: "genealogy",
        renderer: "pack-relationship",
        features: ["narrative"],
      },
    ],
  },
  // 2. 神武東征ネットワーク
  {
    pack: jinmuToseiNetworkPack,
    packCategory: "genealogy-pack",
    topics: [
      {
        id: "jinmu-yamato-conquest-preset",
        presetId: "jinmu-yamato-conquest-preset",
        perspectiveId: "mythology",
        label: "神武東征：瀬戸内海路と大和建国サーガ",
        description: "日向美々津から豊後・筑紫・安芸・吉備の瀬戸内航路、生駒敗退、熊野迂回、八咫烏先導、大和橿原即位に至る王権創始サーガ",
        focus: "dynasty-founding",
        spatialScale: "national",
        archetype: "sequence",
        renderer: "pack-relationship",
        features: ["narrative"],
        scopeClusters: [
          {
            id: "kinai-yamato-core",
            label: "難波・熊野・大和即位中核",
            description: "孔舎衙坂の激戦・敗退から紀伊迂回、神倉神社・熊野山越えと橿原神宮即位クライマックス",
            connectionIds: ["jinmu-kusaka-defeat-and-bypass", "jinmu-kumano-yamato-enthronement"],
            nodeIds: [
              "place-tatetsu-kusaka",
              "place-kumano-kamikura",
              "place-kashihara-jingu",
              "deity-jinmu",
              "deity-yatagarasu",
              "deity-nagasunehiko",
              "deity-takakuraji",
            ],
            default: true,
          },
          {
            id: "whole-eastern-route",
            label: "日向発向・瀬戸内海路全東征ルート",
            description: "日向美々津から豊後宇佐、筑紫岡田宮、安芸、吉備を経て大和即位に至る全行程",
            connectionIds: ["jinmu-setouchi-sea-route", "jinmu-kusaka-defeat-and-bypass", "jinmu-kumano-yamato-enthronement"],
            nodeIds: [
              "place-mimitsu",
              "place-usa-hitohashira",
              "place-okada-gu",
              "place-takeri-no-miya",
              "place-takashima-no-miya",
              "place-tatetsu-kusaka",
              "place-kumano-kamikura",
              "place-kashihara-jingu",
              "deity-jinmu",
              "deity-itsuse",
              "deity-yatagarasu",
              "deity-nagasunehiko",
              "deity-takakuraji",
            ],
          },
        ],
      },
    ],
  },
  // 4. 海洋神話と海人族三系統
  {
    pack: marineDeitiesPack,
    packCategory: "genealogy-pack",
    topics: [
      {
        id: "marine-deities-preset",
        presetId: "marine-deities-preset",
        perspectiveId: "mythology",
        label: "海洋神話と古代海人族三系統",
        description: "宗像三女神（宗像氏）・綿津見三神（阿曇氏）・住吉三神（津守氏）の祭祀軸と、玄界灘から瀬戸内海潮待ち港（鞆の浦・広島）に至る海人族の航路掌握・海神祭祀ネットワーク",
        focus: "clan-legend",
        spatialScale: "national",
        archetype: "matrix",
        renderer: "pack-relationship",
        features: ["structural"],
        scopeClusters: [
          {
            id: "genkai-sanctuaries-core",
            label: "玄界灘・筑前海人聖域中核",
            description: "志賀海神社（阿曇氏）・博多住吉神社（津守氏）・香椎宮・御島神社および宗像大社による玄界灘・博多湾直接祭祀中核",
            connectionIds: ["munakata-three-palaces-line", "marine-three-lineages-axis", "conn-hakata-bay-maritime-triad"],
            nodeIds: [
              "watatsumi-three-kami",
              "munakata-triad",
              "sumiyoshi-three-kami",
              "shikaumi-shrine",
              "nata-shikishiki-shrine",
              "fukuoka-city-museum",
              "sumiyoshi-shrine-chikuzen",
              "kashii-gu",
              "mishima-shrine",
              "hamao-shrine",
              "munakata-hetsumiya",
              "munakata-nakatsumiya",
              "munakata-okitsumiya",
              "azumi-clan",
              "munakata-clan",
              "tsumori-clan",
            ],
            default: true,
          },
          {
            id: "setouchi-kinai-wide",
            label: "瀬戸内・難波・西日本海神航路網",
            description: "玄界灘から関門海峡・瀬戸内海を経て難波津（住吉大社）に至る古代国家航路・海神信仰網全体",
            connectionIds: [
              "munakata-three-palaces-line",
              "marine-three-lineages-axis",
              "conn-hakata-bay-maritime-triad",
              "setouchi-maritime-rites-line",
            ],
            nodeIds: [
              "watatsumi-three-kami",
              "munakata-triad",
              "sumiyoshi-three-kami",
              "shikaumi-shrine",
              "nata-shikishiki-shrine",
              "fukuoka-city-museum",
              "sumiyoshi-shrine-chikuzen",
              "kashii-gu",
              "mishima-shrine",
              "hamao-shrine",
              "munakata-hetsumiya",
              "munakata-nakatsumiya",
              "munakata-okitsumiya",
              "miyajidake-shrine",
              "mekari-shrine",
              "numakuma-shrine",
              "shirakami-shrine",
              "azumi-clan",
              "munakata-clan",
              "maritime-watatsumi",
            ],
          },
        ],
      },
    ],
  },
  // 5. 日向神話
  {
    pack: hyugaMythologyPack,
    packCategory: "regional-pack",
    topics: [
      {
        id: "hyuga-mythology-preset",
        presetId: "hyuga-mythology-preset",
        perspectiveId: "mythology",
        label: "天孫降臨と日向三代の神統譜",
        description: "高千穂・霧島への天孫降臨から、ニニギ・ホオリ・ウガヤフキアエズに至る日向三代の神統譜と山岳神話空間。",
        focus: "genealogy",
        spatialScale: "regional",
        archetype: "genealogy",
        renderer: "pack-relationship",
        features: ["narrative"],
      },
      {
        id: "hyuga-umiyamasachi-route",
        presetId: "hyuga-umiyamasachi-route",
        perspectiveId: "mythology",
        label: "海幸山幸と日南海岸神話回廊",
        description: "青島（鬼の洗濯板・綿津見宮帰還）から鵜戸神宮（海食洞・産殿）、宮崎神宮に至る日南海岸の海幸山幸神話回廊。",
        focus: "coast-myth",
        spatialScale: "regional",
        archetype: "sequence",
        renderer: "pack-relationship",
        features: ["narrative"],
      },
    ],
  },
  // 6. 出雲国津神
  {
    pack: izumoKunitsukamiPack,
    packCategory: "regional-pack",
    topics: [
      {
        id: "izumo-kunitsukami-preset",
        presetId: "izumo-kunitsukami-preset",
        perspectiveId: "mythology",
        label: "出雲国譲り神話（天津神と国津神の対峙）",
        description: "出雲大社・稲佐の浜・美保神社・神魂神社を軸とする、建御雷神との国譲り談判とオオクニヌシ・コトシロヌシの幽政神話空間。",
        focus: "kunitsukami",
        spatialScale: "regional",
        archetype: "faction",
        renderer: "pack-relationship",
        features: ["narrative", "structural"],
      },
      {
        id: "izumo-kunitsukami-corridor",
        presetId: "izumo-kunitsukami-corridor",
        perspectiveId: "religion",
        label: "大己貴・国津神信仰の西日本回廊",
        description: "出雲大社を中枢核とし、朝倉の大己貴神社・美奈宜神社、安芸・厳島神社、大和・大神神社を結ぶ大己貴命（オオクニヌシ・大物主）信仰の西日本祭祀回廊。",
        focus: "kunitsukami",
        spatialScale: "national",
        archetype: "hub-spoke",
        renderer: "pack-relationship",
        features: ["narrative", "structural"],
      },
    ],
  },
  // 7. 神功皇后伝承
  {
    pack: jinguKogoLegendPack,
    packCategory: "genealogy-pack",
    topics: [
      {
        id: "jingu-kogo-legend-preset",
        presetId: "jingu-kogo-legend-preset",
        perspectiveId: "mythology",
        label: "神功皇后伝承：筑紫降誕と国家遠征サーガ",
        description: "長門豊浦宮滞在から橿日宮神託、久山・古賀軍議、宇美御降誕、筥崎胞衣、関門・宇佐へ至る古代王権サーガ",
        focus: "royal-legend",
        spatialScale: "regional",
        archetype: "sequence",
        renderer: "pack-relationship",
        features: ["narrative", "structural"],
        scopeClusters: [
          {
            id: "chikushi-birth-core",
            label: "筑紫八幡誕生回廊中核",
            description: "香椎宮・斎宮群から応神天皇誕生の宇美八幡宮、御胞衣ヶ浦・筥崎宮の聖地回廊",
            connectionIds: ["jingu-chikushi-birth-corridor"],
            nodeIds: [
              "jingu-kogo",
              "ojin-tenno",
              "takenouchi-no-sukune",
              "kashii-gu",
              "kashii-furumiya-shrine",
              "mishima-shrine",
              "hamao-shrine",
              "yamada-saigu",
              "saniwa-jinja",
              "ino-tenshoko-daijingu",
              "koseki-miya",
              "oyamada-saigu-koga",
              "umi-hachimangu",
              "umi-obiegaura-okumiya",
              "hakozaki-gu",
              "miyajidake-shrine",
              "onamuchi-shrine",
            ],
            default: true,
          },
          {
            id: "saga-national-wide",
            label: "長門・関門・宇佐国家遠征網全体",
            description: "筑紫の誕生回廊に加え、長門豊浦宮（忌宮神社）・長門住吉・和布刈・宇佐神宮を結ぶ国家遠征軸全体",
            connectionIds: ["jingu-chikushi-birth-corridor", "jingu-kanmon-usa-route"],
            nodeIds: [
              "jingu-kogo",
              "ojin-tenno",
              "chuai-tenno",
              "takenouchi-no-sukune",
              "sumiyoshi-three-kami",
              "kashii-gu",
              "kashii-furumiya-shrine",
              "mishima-shrine",
              "hamao-shrine",
              "yamada-saigu",
              "saniwa-jinja",
              "ino-tenshoko-daijingu",
              "koseki-miya",
              "oyamada-saigu-koga",
              "umi-hachimangu",
              "umi-obiegaura-okumiya",
              "hakozaki-gu",
              "miyajidake-shrine",
              "onamuchi-shrine",
              "iminomiya-shrine",
              "sumiyoshi-shrine-nagato",
              "mekari-shrine",
              "koso-hachimangu",
              "usa-jingu",
            ],
          },
        ],
      },
    ],
  },
  // 8. 宗教諸関係（通史・時代地層基盤）
  {
    pack: religionRelationsPack,
    packCategory: "sacred-landscape-pack",
    topics: [
      {
        id: "religion-history",
        presetId: "religion-history",
        perspectiveId: "religion",
        label: "古代祭祀の変遷と神道・仏教の接触",
        description: "日本列島の古代神祭りから神仏習合への展開と歴史的接触を見る",
        focus: "buddhist-contact",
        spatialScale: "regional",
        archetype: "stratum",
        renderer: "pack-relationship",
        features: ["narrative", "structural"],
        isStratum: true,
      },
      {
        id: "religion-syncretism",
        presetId: "religion-syncretism",
        perspectiveId: "religion",
        label: "神仏習合と八幡大菩薩・修験山岳信仰",
        description: "宇佐・国東・宮島・朝倉に見られる神宮寺・八幡信仰と密教・修験山岳信仰の重層を見る",
        focus: "syncretism",
        spatialScale: "regional",
        archetype: "stratum",
        renderer: "pack-relationship",
        features: ["narrative", "structural"],
        isStratum: true,
      },
      {
        id: "religion-concepts",
        presetId: "religion-concepts",
        perspectiveId: "religion",
        label: "自然崇拝・アニミズムと原初祭祀景観",
        description: "巨石・岩礁・海浜などの自然物への信仰と、後世の制度化された宗教を比較する",
        focus: "animism",
        spatialScale: "regional",
        archetype: "stratum",
        renderer: "pack-relationship",
        features: ["structural"],
        isStratum: true,
      },
      {
        id: "archaic-local-shrines",
        presetId: "archaic-local-shrines",
        perspectiveId: "religion",
        label: "弥生遺跡・共同体に重層する地祇と古層地域祭礼",
        description: "記紀神話の主筋外で、弥生墳丘墓や古代集落に鎮座し、神輿渡御や粥占いを今に伝える地域共同体の古層神社を見る",
        focus: "archaic-rite",
        spatialScale: "regional",
        archetype: "matrix",
        renderer: "pack-relationship",
        features: ["structural"],
      },
    ],
  },
  // 8b. 宇佐八幡・国東六郷満山神仏習合
  {
    pack: kunisakiSyncretismPack,
    packCategory: "sacred-landscape-pack",
    topics: [
      {
        id: "usa-rokugo-syncretism-preset",
        presetId: "usa-rokugo-syncretism-preset",
        perspectiveId: "religion",
        label: "宇佐八幡と六郷満山の神仏習合・山岳修行網",
        description:
          "八幡総本宮・宇佐神宮を中核に、両子寺・熊野磨崖仏・富貴寺の六郷満山寺院群や筑紫の神仏併祀空間（浄心院）へ広がる神仏習合の求心構造",
        focus: "syncretism",
        archetype: "hub-spoke",
        renderer: "pack-relationship",
        features: ["structural", "narrative"],
        spatialScale: "regional",
      },
    ],
  },
  // 8. 宮島・弥山
  {
    pack: miyajimaMisenSacredLandscapePack,
    packCategory: "sacred-landscape-pack",
    topics: [
      {
        id: "miyajima-sacred-relations",
        presetId: "miyajima-sacred-relations",
        perspectiveId: "religion",
        label: "厳島・弥山の神域景観と瀬戸内海上壇",
        description: "弥山の自然神域景観と社殿構成を、古代からの連続性を仮定せずに見る",
        focus: "sacred-space",
        spatialScale: "regional",
        archetype: "matrix",
        renderer: "pack-relationship",
        features: ["structural"],
        scopeClusters: [
          {
            id: "miyajima-coastal-shrines",
            label: "海上の本社と島内摂末社網",
            description: "厳島神社本社と島内巡拝・摂末社の海浜祭祀空間",
            connectionIds: ["itsukushima-main-shrine", "miyajima-auxiliary-shrines"],
            default: true,
          },
          {
            id: "miyajima-misen-whole",
            label: "弥山山頂霊場を含む全神域",
            description: "海上社殿・摂末社と背後の弥山巨石修験霊場の立体構造",
            connectionIds: ["itsukushima-main-shrine", "miyajima-auxiliary-shrines", "misen-summit-sanctuary"],
          },
        ],
      },
      {
        id: "miyajima-current-paths",
        presetId: "miyajima-current-paths",
        perspectiveId: "route",
        label: "厳島・弥山信仰と山岳登拝路",
        description: "現在の登拝ルートを、実歩行・歴史的参詣路・山岳修験の祭祀的経路と分けて見る",
        focus: "mountain-pilgrimage",
        spatialScale: "regional",
        archetype: "sequence",
        renderer: "pack-relationship",
        features: ["narrative", "structural"],
      },
      {
        id: "miyajima-patronage-and-space",
        presetId: "miyajima-patronage-and-space",
        perspectiveId: "politics",
        label: "平氏政権と瀬戸内海壇・厳島社殿",
        description: "12世紀平清盛の政治的庇護と社殿構成を、祭神や古層祭祀とは分けて見る",
        focus: "warrior-patronage",
        spatialScale: "regional",
        archetype: "faction",
        renderer: "pack-relationship",
        features: ["narrative", "structural"],
      },
    ],
  },
  // 10. 宗像・沖ノ島
  {
    pack: munakataOkinoshimaSacredLandscapePack,
    packCategory: "sacred-landscape-pack",
    topics: [
      {
        id: "munakata-three-shrines",
        presetId: "munakata-three-shrines",
        perspectiveId: "religion",
        label: "沖ノ島古代国家祭祀と玄界灘神域景観",
        description: "沖津宮・中津宮・辺津宮の三宮構造と、玄界灘の孤島・沖ノ島から本土を結ぶ古代国家祭祀の景観",
        focus: "sacred-space",
        spatialScale: "regional",
        archetype: "hub-spoke",
        renderer: "pack-relationship",
        features: ["narrative", "structural"],
      },
    ],
  },
  // 11. 式内名神大社（律令官撰制度）
  {
    pack: shikinaishaChikuzenBuzenPack,
    packCategory: "source-pack",
    topics: [
      {
        id: "shikinaisha-network-preset",
        presetId: "shikinaisha-network-preset",
        perspectiveId: "religion",
        label: "延喜式神名帳と式内名神大社制度",
        description: "延喜式神名帳に記された名神大社と祭神の関係および古代交通回廊の配置",
        focus: "state-system",
        spatialScale: "regional",
        archetype: "hub-spoke",
        renderer: "pack-relationship",
        features: ["structural"],
      },
    ],
  },
  // 12. 西国諸国一宮（令制国制度）
  {
    pack: ichinomiyaWesternNetworkPack,
    packCategory: "sacred-landscape-pack",
    topics: [
      {
        id: "ichinomiya-western-preset",
        presetId: "ichinomiya-western-preset",
        perspectiveId: "religion",
        label: "令制国体制と諸国一宮の祭祀網",
        description: "令制国の一宮（筆頭大社）の空間配置と国司・律令祭祀体系",
        focus: "regional-order",
        spatialScale: "national",
        archetype: "matrix",
        renderer: "pack-relationship",
        features: ["structural"],
        scopeClusters: [
          {
            id: "kyushu-genkai-ichinomiya",
            label: "九州・玄界灘諸島の一宮網",
            description: "筑前・豊前・筑後および壱岐・対馬など九州・国境諸島の筆頭大社群",
            connectionIds: ["kyushu-ichinomiya-circuit", "genkai-islands-ichinomiya-network"],
            default: true,
          },
          {
            id: "western-japan-ichinomiya",
            label: "九州〜山陽・瀬戸内広域一宮網",
            description: "九州圏から山陽道・瀬戸内海（厳島・吉備・長門）へ連なる西国一宮全体網",
            connectionIds: [
              "kyushu-ichinomiya-circuit",
              "sanyo-ichinomiya-corridor",
              "genkai-islands-ichinomiya-network",
            ],
          },
        ],
      },
    ],
  },
  // 12b. 高良山の重層聖域と神仏習合・神仏分離
  {
    pack: korasanSacredLandscapePack,
    packCategory: "sacred-landscape-pack",
    topics: [
      {
        id: "korasan-sacred-landscape-preset",
        presetId: "korasan-sacred-landscape-preset",
        perspectiveId: "religion",
        label: "高良山の重層聖域と神仏習合・神仏分離",
        description:
          "古墳墓域（祇園山・礫山）・7世紀古代山城「神籠石」・地主神高樹神・筑後国一宮高良大社・天台宗二十六ヶ寺と1869年神仏分離が折り重なる高良山の祭祀空間を読み解く",
        focus: "sacred-space",
        spatialScale: "regional",
        archetype: "matrix",
        renderer: "pack-relationship",
        features: ["structural", "narrative"],
        scopeClusters: [
          {
            id: "korasan-ancient-horizon",
            label: "古墳墓域・地主神・7世紀神籠石",
            description:
              "祇園山古墳・礫山古墳・御塚権現塚の古墳時代墓域と、高良大社・高樹神社・高良山神籠石・伊勢天照御祖神社の古代聖域層",
            connectionIds: [
              "conn-korasan-kofun-horizon",
              "conn-korasan-ancient-sanctuary",
            ],
            default: true,
          },
          {
            id: "korasan-full-syncretism",
            label: "神仏習合・近世整備・明治分離を含む全山重層",
            description:
              "古代層に加え、蓮台院御井寺本坊跡・奥の院・有馬氏整備・1869年神仏分離と安武町本村八幡宮移築部材までを含む全4地層",
            connectionIds: [
              "conn-korasan-kofun-horizon",
              "conn-korasan-ancient-sanctuary",
              "conn-korasan-medieval-syncretism",
              "conn-korasan-early-modern-reorg",
            ],
          },
        ],
      },
    ],
  },
  // 12. 魏志倭人伝ルート・政治
  {
    pack: wajindenRoutesPack,
    packCategory: "source-pack",
    topics: [
      {
        id: "wajinden-route-comparison",
        presetId: "wajinden-comparison",
        perspectiveId: "route",
        label: "魏志倭人伝の記述順と比定説",
        description: "史料上の順序、現代地名への比定、競合する所在地説を分けて見る",
        focus: "text-identification",
        spatialScale: "national",
        archetype: "sequence",
        renderer: "pack-relationship",
        features: ["narrative", "structural"],
        scopeClusters: [
          {
            id: "wajinden-northern-kyushu-core",
            label: "記述順・北部九州実地比定（伊都・奴・不弥）",
            description: "帯方郡〜対馬・壱岐・末盧・伊都・奴・不弥の史料記述順と北部九州考古比定群",
            connectionIds: [
              "wajinden-source-route",
              "ito-archaeology-visits",
              "nakoku-archaeology-visits",
              "fumi-koshoji-hypothesis",
            ],
            default: true,
          },
          {
            id: "wajinden-kyushu-hypotheses",
            label: "九州説・朝倉東遷・日向比定仮説",
            description: "九州島内の邪馬台国・投馬国比定（吉野ヶ里・朝倉・日向説）を比較する",
            connectionIds: [
              "wajinden-source-route",
              "wajinden-kyushu-hypothesis",
              "wajinden-asakura-tosei-hypothesis",
              "wajinden-hyuga-hypothesis",
              "toma-location-candidates",
            ],
          },
          {
            id: "wajinden-kinai-wide-hypotheses",
            label: "畿内説・出雲説・列島広域比定",
            description: "畿内大和説・出雲説など日本列島広域へ伸びる所在地仮説を比較する",
            connectionIds: [
              "wajinden-source-route",
              "wajinden-kinai-hypothesis",
              "wajinden-izumo-hypothesis",
              "toma-location-candidates",
            ],
          },
        ],
      },
      {
        id: "yamatai-politics",
        presetId: "wajinden-politics",
        perspectiveId: "politics",
        label: "伊都国一大率と古代倭国の政治構造",
        description: "伊都国一大率の外交・軍事・諸国監察と、卑弥呼共立・奴国・狗奴国の政治力学",
        focus: "diplomacy-structure",
        spatialScale: "regional",
        archetype: "faction",
        renderer: "pack-relationship",
        features: ["structural"],
        scopeClusters: [
          {
            id: "ittaisotsu-core",
            label: "伊都国・一大率統治中枢",
            description: "伊都国一大率による外交・検察拠点（糸島・平原・奴国工房群）",
            connectionIds: ["wajinden-politics-governance"],
            nodeIds: [
              "himiko",
              "ito-state",
              "ittaisotsu",
              "na-state",
              "ito-history-museum",
              "hirabaru-site",
              "sugu-okamoto-site",
              "nakoku-hill-park",
            ],
            default: true,
          },
          {
            id: "wajinden-politics-wide",
            label: "東アジア外交・狗奴国対峙全体",
            description: "魏への遣使から諸国共立、南方の狗奴国との抗争まで含む倭国政治網全体",
            connectionIds: ["wajinden-politics-governance"],
            nodeIds: [
              "himiko",
              "yamatai-state",
              "wei",
              "nashime",
              "ito-state",
              "ittaisotsu",
              "na-state",
              "wa-polities",
              "kunu-state",
              "ito-history-museum",
              "hirabaru-site",
              "sugu-okamoto-site",
              "nakoku-hill-park",
            ],
          },
        ],
        designatedFactions: [
          {
            id: "yamatai-bloc",
            label: "邪馬台国・親魏倭王同盟",
            color: "#38bdf8",
            anchorId: "yamatai-state",
            memberIds: [
              "himiko",
              "wei",
              "nashime",
              "ito-state",
              "ittaisotsu",
              "na-state",
              "wa-polities",
              "ito-history-museum",
              "hirabaru-site",
              "sugu-okamoto-site",
              "nakoku-hill-park",
            ],
          },
          {
            id: "kunu-bloc",
            label: "狗奴国・対立勢力",
            color: "#f87171",
            anchorId: "kunu-state",
            memberIds: [],
          },
        ],
        boundaryAxis: {
          label: "邪馬台国・狗奴国対立線",
          icon: "⚔️",
        },
      },
    ],
  },
  // 13. 古代官道（交通制度）
  {
    pack: ancientHighwaysNetworkPack,
    packCategory: "source-pack",
    topics: [
      {
        id: "ancient-highways-preset",
        presetId: "ancient-highways-preset",
        perspectiveId: "route",
        label: "古代官道と七道駅路ネットワーク",
        description: "延喜式兵部省諸国駅伝馬条に記録された駅路・官道と交通インフラ網",
        focus: "highways",
        spatialScale: "national",
        archetype: "sequence",
        renderer: "pack-relationship",
        features: ["structural"],
      },
    ],
  },
  // 14. 弥生考古ネットワーク
  {
    pack: yayoiArchaeologyNetworkPack,
    packCategory: "regional-pack",
    topics: [
      {
        id: "yayoi-archaeology-preset",
        presetId: "yayoi-archaeology-preset",
        perspectiveId: "politics",
        label: "弥生拠点環濠集落と首長王墓ネットワーク",
        description: "吉野ヶ里・朝倉平塚川添の内陸拠点から、伊都・奴国の沿岸王墓、一支国原の辻海運に至る北部九州弥生社会の比較構造",
        focus: "chieftain-network",
        spatialScale: "regional",
        archetype: "matrix",
        renderer: "pack-relationship",
        features: ["structural"],
      },
    ],
  },
  // 16. 長州・萩幕末
  {
    pack: hagiBakumatsuPack,
    packCategory: "regional-pack",
    topics: [
      {
        id: "hagi-domain-politics",
        presetId: "bakumatsu-structure",
        perspectiveId: "politics",
        label: "幕末長州藩の政治体制と近代化政策",
        description: "萩藩校明倫館の人材形成から、海防危機・西洋技術導入（反射炉・造船所）を経て産業化を試行した藩政改革の構造",
        focus: "domain-reform",
        spatialScale: "regional",
        archetype: "faction",
        renderer: "pack-relationship",
        features: ["structural"],
      },
    ],
  },
  // 16b. 近世港湾都市と対外管理・都市記憶網（平戸・出島・長崎・鞆の浦）
  {
    pack: earlyModernPortNetworkPack,
    packCategory: "regional-pack",
    topics: [
      {
        id: "early-modern-port-network-preset",
        presetId: "early-modern-port-network-preset",
        perspectiveId: "politics",
        label: "近世港湾都市の対外管理と都市神社アーカイブ",
        description:
          "平戸・出島・長崎奉行所・鞆の浦の近世対外交易・海港網と、諏訪神社・松森天満宮に刻まれた職人尽・五釐金近代水道・公共記憶を対比する",
        focus: "maritime-network",
        archetype: "matrix",
        renderer: "pack-relationship",
        features: ["structural", "narrative"],
        spatialScale: "national",
      },
    ],
  },
  // 17. 古代国防・山城
  {
    pack: ancientDefenseNetworkPack,
    packCategory: "regional-pack",
    topics: [
      {
        id: "dazaifu-defense-preset",
        presetId: "dazaifu-defense-preset",
        perspectiveId: "politics",
        label: "白村江後の古代国防・山城",
        description: "天智天皇期に唐・新羅の侵攻に備えて急造された水城・朝鮮式山城群と大宰府防衛体制",
        focus: "ancient-defense",
        spatialScale: "regional",
        archetype: "faction",
        renderer: "pack-relationship",
        features: ["narrative", "structural"],
        scopeClusters: [
          {
            id: "dazaifu-core",
            label: "大宰府防衛中枢",
            description: "水城土塁・大野城・基肄城による大宰府直轄防衛ラインと客館・南館の外交都市軸",
            connectionIds: ["dazaifu-core-defense-network", "dazaifu-urban-diplomacy-axis"],
            nodeIds: [
              "polity-dazaifu",
              "place-mizuki",
              "place-ono-jo",
              "place-kii-jo",
              "place-dazaifu-kyakukan",
              "place-enoki-sha-minamikan",
            ],
            default: true,
          },
          {
            id: "national-defense-line",
            label: "西海道・瀬戸内広域防衛網",
            description: "対馬金田城から怡土城（高祖山）・雷山神籠石・鞠智城、讃岐屋嶋城・河内高安城に至る広域防衛ライン",
            connectionIds: [
              "dazaifu-core-defense-network",
              "dazaifu-urban-diplomacy-axis",
              "western-maritime-defense-line",
              "setouchi-yamato-defense-corridor",
            ],
            nodeIds: [
              "polity-yamato-court",
              "polity-dazaifu",
              "place-mizuki",
              "place-ono-jo",
              "place-kii-jo",
              "place-dazaifu-kyakukan",
              "place-enoki-sha-minamikan",
              "place-kaneda-jo",
              "place-ito-jo",
              "place-kikuchi-jo",
              "place-yashima-ji-castle",
              "place-takayasu-jo",
              "place-raizan-shinogoseki",
            ],
          },
        ],
        designatedFactions: [
          {
            id: "dazaifu-front",
            label: "西海道・大宰府防衛中枢",
            color: "#38bdf8",
            anchorId: "polity-dazaifu",
            memberIds: [
              "place-mizuki",
              "place-ono-jo",
              "place-kii-jo",
              "place-dazaifu-kyakukan",
              "place-enoki-sha-minamikan",
              "place-ito-jo",
              "place-raizan-shinogoseki",
              "place-kikuchi-jo",
            ],
          },
          {
            id: "yamato-court",
            label: "国家統治中枢 ＆ 本土・畿内防衛網",
            color: "#f87171",
            anchorId: "polity-yamato-court",
            memberIds: [
              "place-kaneda-jo",
              "place-yashima-ji-castle",
              "place-takayasu-jo",
            ],
          },
        ],
        boundaryAxis: {
          label: "663白村江・国家総力防衛ライン",
          icon: "🛡️",
        },
      },
    ],
  },
  // 17. 維新志士・松下村塾人物行動網
  {
    pack: ishinFiguresPack,
    packCategory: "genealogy-pack",
    topics: [
      {
        id: "ishin-figures-network",
        presetId: "ishin-network",
        perspectiveId: "people",
        label: "松下村塾の思想と維新志士の同盟相関網",
        description: "吉田松陰の松下村塾から、高杉晋作・木戸孝允、そして坂本龍馬（土佐）・西郷隆盛（薩摩）の薩長同盟へと広がる思想と行動のネットワーク",
        focus: "patriot-alliance",
        spatialScale: "regional",
        archetype: "faction",
        renderer: "pack-relationship",
        features: ["structural", "narrative"],
        scopeClusters: [
          {
            id: "choshu-core",
            label: "長州維新胎動",
            description: "吉田松陰の松下村塾から高杉晋作の挙兵、木戸孝允の活動拠点（萩・下関・山口・防府）",
            connectionIds: ["takasugi-life-geography", "shoka-sonjuku-action-corridor"],
            nodeIds: ["yoshida-shoin", "takasugi-shinsaku", "kido-takayoshi", "ito-hirobumi", "choshu-domain"],
            default: true,
          },
          {
            id: "satcho-alliance-macro",
            label: "薩長土同盟網",
            description: "坂本龍馬の周旋と西郷隆盛との薩長同盟、京都・高知・鹿児島に広がる全国同盟網",
            connectionIds: ["takasugi-life-geography", "shoka-sonjuku-action-corridor", "satcho-alliance-axis", "ryoma-tosa-choshu-network"],
            nodeIds: [
              "yoshida-shoin",
              "takasugi-shinsaku",
              "kido-takayoshi",
              "ito-hirobumi",
              "choshu-domain",
              "sakamoto-ryoma",
              "tosa-domain",
              "saigo-takamori",
              "satsuma-domain",
              "satcho-alliance",
            ],
          },
        ],
        designatedFactions: [
          {
            id: "choshu-bloc",
            label: "長州・松下村塾胎動陣営",
            color: "#38bdf8",
            anchorId: "choshu-domain",
            memberIds: [
              "yoshida-shoin",
              "takasugi-shinsaku",
              "kido-takayoshi",
              "ito-hirobumi",
            ],
          },
          {
            id: "satcho-bloc",
            label: "薩長土同盟・維新回天陣営",
            color: "#f87171",
            anchorId: "satsuma-domain",
            memberIds: [
              "sakamoto-ryoma",
              "tosa-domain",
              "saigo-takamori",
              "satcho-alliance",
            ],
          },
        ],
        boundaryAxis: {
          label: "1866薩長同盟・維新転換軸",
          icon: "🤝",
        },
      },
    ],
  },
  // 18. 古代海人首長・大和王権同盟網
  {
    pack: ancientChieftainsPack,
    packCategory: "genealogy-pack",
    topics: [
      {
        id: "ancient-chieftains-network",
        presetId: "ancient-chieftains-preset",
        perspectiveId: "people",
        label: "筑紫君磐井・古代海人首長の人物相関網",
        description: "筑紫君磐井・物部麁鹿火・宗像徳善・阿曇磯良・天武天皇ら、北部九州の在地・海人首長とヤマト王権の人物・氏族レベルの対峙と同盟を辿る（広域の地政比較は政治・社会レンズへ分担）",
        focus: "chieftain-alliance",
        spatialScale: "regional",
        archetype: "faction",
        renderer: "pack-relationship",
        features: ["narrative", "structural"],
        scopeClusters: [
          {
            id: "chikushi-iwai-lineage",
            label: "筑紫君磐井と筑後川首長系譜",
            description: "筑紫君磐井・筑紫氏・物部麁鹿火と八女岩戸山・石人山・弘化谷・童男山・祇園山・御塚権現塚・下馬場・筑後国府の首長系譜と乱後の展開",
            connectionIds: ["chikugo-river-chieftain-lineage", "chikushi-fudoki-landscape-realm"],
            nodeIds: [
              "tsukushi-clan",
              "tsukushi-no-iwai",
              "mononobe-clan",
              "mononobe-no-arakahi",
              "iwai-war",
              "iwatoyama-kofun",
              "place-iwai-no-sato",
              "place-gionyama-kofun",
              "place-mitsuka-gongen-kofun",
              "place-sekijinsan-kofun",
              "place-kokadani-kofun",
              "place-donanzan-kofun",
              "place-shimobaba-kofun",
              "place-chikugo-kokufu",
              "chikushi-jinja",
            ],
            default: true,
          },
          {
            id: "genkai-maritime-clans",
            label: "玄界灘海人氏族（宗像徳善・阿曇磯良・岡県主熊鰐・天武朝）",
            description: "宗像徳善・尼子娘・高市皇子・天武天皇、阿曇磯良、岡県主熊鰐・鐘崎織幡が結ぶ玄界灘沿岸海人氏族・皇統同盟網",
            connectionIds: ["chieftains-and-sanctuaries-geography", "conn-genkai-coastal-corridor"],
            nodeIds: [
              "munakata-clan",
              "munakata-tokuzen",
              "amako-no-iratsume",
              "emperor-tenmu",
              "takechi-no-miko",
              "jinshin-war",
              "azumi-clan",
              "azumi-isora",
              "oka-agata-nushi",
              "kuma-wani",
              "takenouchi-no-sukune",
              "shikaumi-jinja",
              "munakata-taisha",
              "orihata-shrine",
              "oka-minato-shrine",
              "zenichiden-kofun",
              "ushikubi-kilns",
              "torai-artisans",
            ],
          },
          {
            id: "all-chieftains-alliance",
            label: "北部九州首長・ヤマト王権人物相関全体",
            description: "筑紫君・海人氏族・4類型在地首長とヤマト王権中枢の人物・氏族相関全体",
            connectionIds: [
              "chieftains-and-sanctuaries-geography",
              "chikugo-river-chieftain-lineage",
              "chikushi-fudoki-landscape-realm",
              "conn-chieftains-four-archetypes",
              "conn-genkai-coastal-corridor",
            ],
            nodeIds: [
              "tsukushi-clan",
              "tsukushi-no-iwai",
              "azumi-clan",
              "azumi-isora",
              "munakata-clan",
              "munakata-tokuzen",
              "amako-no-iratsume",
              "oka-agata-nushi",
              "kuma-wani",
              "takenouchi-no-sukune",
              "shikaumi-jinja",
              "munakata-taisha",
              "orihata-shrine",
              "oka-minato-shrine",
              "chikushi-jinja",
              "iwatoyama-kofun",
              "place-iwai-no-sato",
              "place-gionyama-kofun",
              "place-mitsuka-gongen-kofun",
              "place-sekijinsan-kofun",
              "place-kokadani-kofun",
              "place-donanzan-kofun",
              "place-shimobaba-kofun",
              "place-chikugo-kokufu",
              "zenichiden-kofun",
              "ushikubi-kilns",
              "torai-artisans",
              "yamato-court",
              "mononobe-clan",
              "mononobe-no-arakahi",
              "emperor-tenmu",
              "takechi-no-miko",
              "iwai-war",
              "jinshin-war",
            ],
          },
        ],
        designatedFactions: [
          {
            id: "maritime-chieftains",
            label: "北部九州・海人首長連合",
            color: "#38bdf8",
            anchorId: "tsukushi-clan",
            memberIds: [
              "tsukushi-no-iwai",
              "azumi-clan",
              "azumi-isora",
              "munakata-clan",
              "munakata-tokuzen",
              "amako-no-iratsume",
              "shikaumi-jinja",
              "munakata-taisha",
              "chikushi-jinja",
              "iwatoyama-kofun",
              "place-iwai-no-sato",
              "place-gionyama-kofun",
              "place-mitsuka-gongen-kofun",
              "place-sekijinsan-kofun",
              "place-kokadani-kofun",
              "place-donanzan-kofun",
              "place-shimobaba-kofun",
              "place-chikugo-kokufu",
              "zenichiden-kofun",
              "ushikubi-kilns",
              "torai-artisans",
            ],
          },
          {
            id: "yamato-central",
            label: "ヤマト王権・畿内中枢統治",
            color: "#f87171",
            anchorId: "yamato-court",
            memberIds: [
              "mononobe-clan",
              "mononobe-no-arakahi",
              "emperor-tenmu",
              "takechi-no-miko",
              "iwai-war",
              "jinshin-war",
            ],
          },
        ],
        boundaryAxis: {
          label: "海人首長・大和王権同盟統治軸",
          icon: "🤝",
        },
      },
    ],
  },
  // 19. 源平合戦・瀬戸内海壇と壇ノ浦決戦
  {
    pack: genpeiDannouraPack,
    packCategory: "genealogy-pack",
    topics: [
      {
        id: "genpei-dannoura-network",
        presetId: "genpei-dannoura-preset",
        perspectiveId: "people",
        label: "源平合戦・瀬戸内海壇と壇ノ浦決戦",
        description: "平清盛の厳島造営と瀬戸内掌握から、安徳天皇・平知盛・平教経ら平家一門と源義経・緒方惟義ら追討軍の激突、赤間関壇ノ浦の終焉に至る相関網",
        focus: "genpei-clash",
        spatialScale: "regional",
        archetype: "faction",
        renderer: "pack-relationship",
        features: ["narrative", "structural"],
        scopeClusters: [
          {
            id: "dannoura-decisive",
            label: "壇ノ浦決戦・関門海峡中核",
            description: "赤間関・壇ノ浦古戦場と門司・長府の海峡聖地を結ぶ源平直接決戦圏",
            connectionIds: ["genpei-maritime-geography"],
            nodeIds: [
              "emperor-antoku",
              "taira-no-tomomori",
              "taira-no-noritsune",
              "minamoto-no-yoshitsune",
              "suigun-allies",
              "battle-of-dannoura",
              "akama-shrine",
              "dannoura-battlefield",
              "mekari-shrine",
              "koso-hachimangu",
              "togami-shrine",
              "iminomiya-shrine",
              "manju-kanju-islands",
            ],
            default: true,
          },
          {
            id: "genpei-whole-theater",
            label: "瀬戸内・西海決戦網全体",
            description: "厳島・鞆の浦から関門海峡（門司・長府・壇ノ浦）、屋島、豊後緒方氏まで広がる全作戦水域",
            connectionIds: ["genpei-maritime-geography"],
            nodeIds: [
              "heike-clan",
              "taira-no-kiyomori",
              "emperor-antoku",
              "kenreimon-in",
              "taira-no-tomomori",
              "taira-no-noritsune",
              "genji-clan",
              "minamoto-no-yoshitsune",
              "ogata-koreyoshi",
              "suigun-allies",
              "battle-of-dannoura",
              "battle-of-yashima",
              "itsukushima-shrine",
              "akama-shrine",
              "dannoura-battlefield",
              "tomonoura",
              "mekari-shrine",
              "koso-hachimangu",
              "togami-shrine",
              "iminomiya-shrine",
              "manju-kanju-islands",
            ],
          },
        ],
        designatedFactions: [
          {
            id: "heike-faction",
            label: "平家一門・西海防衛陣営",
            color: "#f87171",
            anchorId: "heike-clan",
            memberIds: [
              "taira-no-kiyomori",
              "emperor-antoku",
              "kenreimon-in",
              "taira-no-tomomori",
              "taira-no-noritsune",
              "itsukushima-shrine",
              "akama-shrine",
              "tomonoura",
              "mekari-shrine",
              "togami-shrine",
            ],
          },
          {
            id: "genji-faction",
            label: "源氏追討軍・水軍連合",
            color: "#38bdf8",
            anchorId: "genji-clan",
            memberIds: [
              "minamoto-no-yoshitsune",
              "ogata-koreyoshi",
              "suigun-allies",
              "battle-of-dannoura",
              "battle-of-yashima",
              "dannoura-battlefield",
              "koso-hachimangu",
              "iminomiya-shrine",
              "manju-kanju-islands",
            ],
          },
        ],
        boundaryAxis: {
          label: "1185壇ノ浦・源平海上決戦線",
          icon: "⚔️",
        },
      },
    ],
  },
  // 17. 古代物質文化・威信財同盟網
  {
    pack: ancientMaterialCulturePack,
    packCategory: "regional-pack",
    topics: [
      {
        id: "sankakubuchi-alliance-preset",
        presetId: "sankakubuchi-alliance-preset",
        perspectiveId: "politics",
        label: "三角縁神獣鏡：同笵鏡が結ぶ首長同盟",
        description:
          "黒塚・椿井大塚山・備前車塚・石塚山など、同一鋳型から作られた同笵鏡を分有した初期ヤマト王権と有力地域首長の政治的同盟ネットワーク",
        focus: "chieftain-alliance",
        spatialScale: "national",
        archetype: "faction",
        renderer: "pack-relationship",
        features: ["structural"],
        designatedFactions: [
          {
            id: "yamato-hegemony",
            label: "ヤマト王権・畿内中枢",
            color: "#eab308",
            anchorId: "place-kurozuka",
            memberIds: [
              "polity-yamato-court",
              "place-kurozuka",
              "place-hashihaka",
              "artifact-sankakubuchi-mirrors",
            ],
          },
          {
            id: "yamashiro-kizugawa",
            label: "南山城・木津川同盟",
            color: "#38bdf8",
            anchorId: "place-tsubai-otsukayama",
            memberIds: [
              "polity-yamashiro-clan",
              "place-tsubai-otsukayama",
            ],
          },
          {
            id: "kibi-setouchi",
            label: "吉備・瀬戸内海運同盟",
            color: "#a855f7",
            anchorId: "place-bizen-kurumazuka",
            memberIds: [
              "polity-kibi-clan",
              "place-bizen-kurumazuka",
            ],
          },
          {
            id: "buzen-suonada",
            label: "豊前・周防灘同盟",
            color: "#34d399",
            anchorId: "place-ishizukayama",
            memberIds: [
              "polity-buzen-clan",
              "place-ishizukayama",
            ],
          },
          {
            id: "chikugo-basin",
            label: "筑後川・有明海同盟",
            color: "#f59e0b",
            anchorId: "place-gionyama-kofun",
            memberIds: [
              "place-gionyama-kofun",
            ],
          },
          {
            id: "northern-kyushu-tradition",
            label: "北部九州・玄界灘固有勢力",
            color: "#f87171",
            anchorId: "place-hirabaru",
            memberIds: [
              "place-hirabaru",
            ],
          },
        ],
        boundaryAxis: {
          label: "前期同笵鏡分有による王権同盟線",
          icon: "🪞",
        },
      },
      {
        id: "prehistoric-supply-chain-preset",
        presetId: "prehistoric-supply-chain-preset",
        perspectiveId: "route",
        label: "古代列島鉱物交易：ヒスイ・朱・鉄・碧玉サプライチェーン",
        description:
          "糸魚川のヒスイ、若杉山の水銀朱、出雲の碧玉、伽耶の鉄。鉱脈・原産地から海人族・中継港を経てヤマト王権・主要聖域へ集積・還流する列島物資循環トポロジー",
        focus: "highways",
        spatialScale: "national",
        archetype: "hub-spoke",
        renderer: "pack-relationship",
        features: ["structural"],
        scopeClusters: [
          {
            id: "maritime-iron-jasper-west",
            label: "西日本・玄界灘海人系（鉄・碧玉）",
            description: "朝鮮半島伽耶の鉄と出雲花仙山の碧玉が海人族ルートで大和へ集積する西日本系統",
            connectionIds: ["prehistoric-supply-chain-iron", "prehistoric-supply-chain-jasper"],
            default: true,
          },
          {
            id: "ritual-jade-cinnabar-east",
            label: "列島威信財系（ヒスイ・水銀朱）",
            description: "糸魚川ヒスイと阿波若杉山・紀伊丹生の水銀朱が王権祭祀工房へ還流する系統",
            connectionIds: ["prehistoric-supply-chain-jade", "prehistoric-supply-chain-cinnabar"],
          },
          {
            id: "all-mineral-supply-chains",
            label: "4大鉱物サプライチェーン全俯瞰",
            description: "ヒスイ・水銀朱・鉄・碧玉の列島物資循環トポロジー全体",
            connectionIds: [
              "prehistoric-supply-chain-jade",
              "prehistoric-supply-chain-cinnabar",
              "prehistoric-supply-chain-iron",
              "prehistoric-supply-chain-jasper",
            ],
          },
        ],
      },
    ],
  },
  {
    pack: setouchiMaritimeNetworkPack,
    packCategory: "regional-pack",
    topics: [
      {
        id: "setouchi-maritime-route-preset",
        perspectiveId: "route",
        presetId: "setouchi-maritime-route-preset",
        label: "瀬戸内海・周防灘の潮待ち海路と海陸結節網",
        description:
          "玄界灘〜関門海峡〜周防灘西岸（豊前京都平野）〜厳島・大三島・鞆の浦〜吉備〜難波・大和を結ぶ狭水道と潮待ち港の海陸交通ネットワーク",
        focus: "sea-corridor",
        archetype: "sequence",
        renderer: "pack-relationship",
        features: ["structural"],
        spatialScale: "national",
        scopeClusters: [
          {
            id: "suonada-west-hub",
            label: "玄界灘〜関門・周防灘西岸（豊前結節帯）",
            connectionIds: ["setouchi-suonada-west-stage"],
          },
          {
            id: "setouchi-wide-sea-lane",
            label: "瀬戸内海・潮待ち広域海路（鞆の浦〜大和）",
            connectionIds: ["setouchi-wide-corridor"],
          },
        ],
      },
      {
        id: "setouchi-polity-integration-preset",
        perspectiveId: "politics",
        presetId: "setouchi-polity-integration-preset",
        label: "ヤマト王権と列島海上網：地域別統合・対立・時代差比較",
        description:
          "玄界灘海人祭祀提携・筑紫君磐井の対立・豊前4〜6世紀首長墓と7世紀国家施設の時代区分・吉備巨大勢力再編・難波大和中枢を対比する比較マトリクス",
        focus: "chieftain-alliance",
        archetype: "matrix",
        renderer: "pack-relationship",
        features: ["structural"],
        spatialScale: "national",
        scopeClusters: [
          {
            id: "kyushu-suonada-integration",
            label: "九州・周防灘圏（祭祀提携 vs 軍事 vs 時代差）",
            connectionIds: [
              "matrix-genkai-ritual-alliance",
              "matrix-chikushi-autonomy",
              "matrix-buzen-kofun-chiefs",
              "matrix-buzen-7c-state",
            ],
          },
          {
            id: "setouchi-kibi-yamato-integration",
            label: "周防灘・吉備〜大和王権軸（潮待ち要衝と再編）",
            connectionIds: [
              "matrix-buzen-kofun-chiefs",
              "matrix-buzen-7c-state",
              "matrix-kibi-to-yamato",
            ],
          },
        ],
      },
    ],
  },
];

/**
 * 登録済みLENSトピック一覧（正本マッピングから自動導出）
 */
export const registeredLensTopics: readonly RegisteredLensTopic[] = canonicalKnowledgePackTopicMappings.flatMap(
  (mapping) =>
    mapping.topics.map((t) => {
      const preset = mapping.pack.presets.find((p) => p.id === t.presetId);
      const packCategory = mapping.pack.packCategory ?? mapping.packCategory;
      const archetype = t.archetype ?? (t.isStratum ? "stratum" : "sequence");
      return {
        id: t.id,
        perspectiveId: t.perspectiveId,
        label: t.label ?? preset?.label ?? t.id,
        description: t.description ?? preset?.description ?? "",
        pack: mapping.pack,
        packCategory,
        packCategoryLabel: KNOWLEDGE_PACK_CATEGORY_LABELS[packCategory],
        presetId: t.presetId,
        focus: t.focus,
        focusLabel: topicFocusLabels[t.focus],
        archetype,
        archetypeLabel: lensLayoutArchetypeLabels[archetype],
        renderer: t.renderer,
        features: t.features ?? ["structural"],
        isStratum: t.isStratum ?? false,
        spatialScale: t.spatialScale,
        scopeClusters: t.scopeClusters,
        designatedFactions: t.designatedFactions,
        boundaryAxis: t.boundaryAxis,
      };
    }),
);

export type RegisteredLensKnowledgePack = {
  readonly pack: LensKnowledgePack;
  readonly lensId: LensPerspectiveId;
  readonly presetIds: readonly string[];
};

/**
 * 登録済みLENSナレッジパック一覧（ADR-0029: registeredLensTopics から単一正本自動導出）
 */
export const registeredLensKnowledgePacks: readonly RegisteredLensKnowledgePack[] = Array.from(
  registeredLensTopics.reduce((acc, topic) => {
    const key = `${topic.pack.id}::${topic.perspectiveId}`;
    const existing = acc.get(key);
    if (existing) {
      if (!existing.presetIds.includes(topic.presetId)) {
        existing.presetIds.push(topic.presetId);
      }
    } else {
      acc.set(key, {
        pack: topic.pack,
        lensId: topic.perspectiveId,
        presetIds: [topic.presetId],
      });
    }
    return acc;
  }, new Map<string, { pack: LensKnowledgePack; lensId: LensPerspectiveId; presetIds: string[] }>()).values(),
);
