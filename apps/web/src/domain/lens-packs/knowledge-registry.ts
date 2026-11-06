import {
  KNOWLEDGE_PACK_CATEGORY_LABELS,
  type KnowledgePackCategory,
} from "@/domain/knowledge/source-evaluation";
import { ancientChieftainsPack } from "./ancient-chieftains-pack";
import { hagiBakumatsuPack } from "./bakumatsu-pack";
import { genpeiDannouraPack } from "./genpei-dannoura-pack";
import { hyugaMythologyPack } from "./hyuga-mythology-pack";
import { ishinFiguresPack } from "./ishin-figures-pack";
import { izumoKunitsukamiPack } from "./izumo-kunitsukami-pack";
import { jinguKogoLegendPack } from "./jingu-kogo-pack";
import { marineDeitiesPack } from "./marine-deities-pack";
import { miyajimaMisenSacredLandscapePack } from "./miyajima-misen-pack";
import { munakataOkinoshimaSacredLandscapePack } from "./munakata-okinoshima-pack";
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
  | "genealogy"         // 神統譜（誓約神話・皇統・神々の系譜）
  | "clan-legend"       // 氏族伝承（海人族・古代氏族の伝承）
  | "royal-legend"      // 王権伝承（神功皇后・西征・母子神）
  | "advent-myth"       // 降臨神話（天孫降臨・日向神話）
  | "coast-myth"        // 海岸神話（海幸山幸・日南海岸・海洋神話回廊）
  | "kunitsukami"       // 国津神話（出雲国譲り・大己貴信仰）
  | "dynasty-founding"  // 王権創始（神武東征・橿原即位）
  | "sacred-space"      // 神域空間（沖ノ島・三宮配置・神体島）
  | "natural-shrine"    // 自然聖地（厳島・弥山・巨石磐座）
  | "archaic-rite"      // 古層祭礼（弥生遺跡立地・地祇・神輿渡御・粥占い）
  | "syncretism"        // 宗教思想（神仏習合・八幡大菩薩・修験山岳信仰）
  | "state-system"      // 国家制度（延喜式神名帳・式内名神大社制度）
  | "regional-order"    // 地域秩序（令制国体制・諸国一宮）
  | "highways"          // 交通路網（古代官道・七道駅路）
  | "text-identification" // 史料比定（魏志倭人伝順序・所在地説）
  | "sea-corridor"      // 東征海路（神武瀬戸内航路・風待ち港）
  | "chieftain-network" // 首長墓網（拠点環濠集落・王墓群）
  | "mountain-pilgrimage" // 山岳登拝（弥山登拝路・修験路）
  | "toponym-hypothesis" // 地名仮説（大和地名一致・東遷仮説）
  | "diplomacy-structure" // 外交共立（卑弥呼共立・一大率・魏使外交）
  | "ancient-defense"   // 古代国防（白村江・朝鮮式山城・大宰府防衛）
  | "settlement-structure" // 集落構造（環濠治水・拠点集落統治・防衛構造）
  | "domain-reform"     // 藩政改革（幕末長州藩・海防・近代化政策）
  | "warrior-patronage" // 武家庇護（平氏政権・瀬戸内海壇・厳島社殿）
  | "patriot-alliance"  // 志士同盟（維新志士・薩長同盟・相関網）
  | "disciples-action"  // 門下行動（松下村塾門下生・尊攘行動軌跡）
  | "chieftain-alliance" // 首長同盟（古代海人首長・大和王権同盟網・王権対峙）
  | "genpei-clash"      // 源平決戦（源平合戦・瀬戸内海壇・壇ノ浦決戦）
  | "buddhist-contact"  // 神仏接触（仏教初伝・神祇と仏教の初期接触）
  | "animism";          // 自然崇拝（アニミズム・磐座・巨石・神体山景観）

export const topicFocusLabels: Record<TopicFocus, string> = {
  genealogy: "神統譜",
  "clan-legend": "氏族伝承",
  "royal-legend": "王権伝承",
  "advent-myth": "降臨神話",
  "coast-myth": "海岸神話",
  kunitsukami: "国津神話",
  "dynasty-founding": "王権創始",
  "sacred-space": "神域空間",
  "natural-shrine": "自然聖地",
  "archaic-rite": "古層祭礼",
  syncretism: "宗教思想",
  "state-system": "国家制度",
  "regional-order": "地域秩序",
  highways: "交通路網",
  "text-identification": "史料比定",
  "sea-corridor": "東征海路",
  "chieftain-network": "首長墓網",
  "mountain-pilgrimage": "山岳登拝",
  "toponym-hypothesis": "地名仮説",
  "diplomacy-structure": "外交共立",
  "ancient-defense": "古代国防",
  "settlement-structure": "集落構造",
  "domain-reform": "藩政改革",
  "warrior-patronage": "武家庇護",
  "patriot-alliance": "志士同盟",
  "disciples-action": "門下行動",
  "chieftain-alliance": "首長同盟",
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
        archetype: "matrix",
        renderer: "pack-relationship",
        features: ["structural"],
        scopeClusters: [
          {
            id: "genkai-sanctuaries-core",
            label: "玄界灘・筑前海人聖域中核",
            description: "志賀海神社（阿曇氏）と宗像大社（辺津宮・中津宮・沖津宮）による玄界灘直接祭祀中核",
            connectionIds: ["munakata-three-palaces-line", "marine-three-lineages-axis"],
            nodeIds: [
              "watatsumi-three-kami",
              "munakata-triad",
              "sumiyoshi-three-kami",
              "shikaumi-shrine",
              "munakata-hetsumiya",
              "munakata-nakatsumiya",
              "munakata-okitsumiya",
              "azumi-clan",
              "munakata-clan",
            ],
            default: true,
          },
          {
            id: "setouchi-kinai-wide",
            label: "瀬戸内・難波・西日本海神航路網",
            description: "玄界灘から関門海峡・瀬戸内海を経て難波津（住吉大社）に至る古代国家航路・海神信仰網全体",
            connectionIds: ["munakata-three-palaces-line", "marine-three-lineages-axis", "setouchi-maritime-rites-line"],
            nodeIds: [
              "watatsumi-three-kami",
              "munakata-triad",
              "sumiyoshi-three-kami",
              "shikaumi-shrine",
              "munakata-hetsumiya",
              "munakata-nakatsumiya",
              "munakata-okitsumiya",
              "sumiyoshi-shrine-chikuzen",
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
        focus: "advent-myth",
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
        archetype: "faction",
        renderer: "pack-relationship",
        features: ["narrative", "structural"],
      },
      {
        id: "izumo-kunitsukami-corridor",
        presetId: "izumo-kunitsukami-corridor",
        perspectiveId: "mythology",
        label: "大己貴・国津神信仰の西日本回廊",
        description: "出雲大社を中枢核とし、朝倉の大己貴神社・美奈宜神社、安芸・厳島神社、大和・大神神社を結ぶ大己貴命（オオクニヌシ・大物主）信仰の西日本祭祀回廊。",
        focus: "kunitsukami",
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
        archetype: "matrix",
        renderer: "pack-relationship",
        features: ["structural"],
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
        focus: "natural-shrine",
        archetype: "matrix",
        renderer: "pack-relationship",
        features: ["structural"],
      },
      {
        id: "miyajima-current-paths",
        presetId: "miyajima-current-paths",
        perspectiveId: "route",
        label: "厳島・弥山信仰と山岳登拝路",
        description: "現在の登拝ルートを、実歩行・歴史的参詣路・山岳修験の祭祀的経路と分けて見る",
        focus: "mountain-pilgrimage",
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
        archetype: "matrix",
        renderer: "pack-relationship",
        features: ["structural"],
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
        archetype: "sequence",
        renderer: "pack-relationship",
        features: ["narrative", "structural"],
      },
      {
        id: "yamatai-politics",
        presetId: "wajinden-politics",
        perspectiveId: "politics",
        label: "伊都国一大率と古代倭国の政治構造",
        description: "伊都国一大率の外交・軍事・諸国監察と、卑弥呼共立・奴国・狗奴国の政治力学",
        focus: "diplomacy-structure",
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
        perspectiveId: "route",
        label: "弥生拠点環濠集落と首長王墓ネットワーク",
        description: "吉野ヶ里・朝倉平塚川添の内陸拠点から、伊都・奴国の沿岸王墓、一支国原の辻海運に至る北部九州弥生社会の比較構造",
        focus: "chieftain-network",
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
        archetype: "faction",
        renderer: "pack-relationship",
        features: ["structural"],
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
        archetype: "faction",
        renderer: "pack-relationship",
        features: ["narrative", "structural"],
        scopeClusters: [
          {
            id: "dazaifu-core",
            label: "大宰府防衛中枢",
            description: "水城土塁・大野城・基肄城による大宰府直轄防衛ライン",
            connectionIds: ["dazaifu-core-defense-network"],
            nodeIds: ["polity-dazaifu", "place-mizuki", "place-ono-jo", "place-kii-jo"],
            default: true,
          },
          {
            id: "national-defense-line",
            label: "西海道・瀬戸内広域防衛網",
            description: "対馬金田城から雷山神籠石・鞠智城、讃岐屋嶋城・河内高安城に至る広域防衛ライン",
            connectionIds: ["dazaifu-core-defense-network", "western-maritime-defense-line", "setouchi-yamato-defense-corridor"],
            nodeIds: [
              "polity-yamato-court",
              "polity-dazaifu",
              "place-mizuki",
              "place-ono-jo",
              "place-kii-jo",
              "place-kaneda-jo",
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
        label: "古代海人首長・大和王権同盟網",
        description: "阿曇磯良・宗像徳善・筑紫君磐井ら北部九州の海人・在地首長と、ヤマト王権・物部氏の同盟・対峙および皇統結びつきの相関ネットワーク",
        focus: "chieftain-alliance",
        archetype: "faction",
        renderer: "pack-relationship",
        features: ["narrative", "structural"],
        scopeClusters: [
          {
            id: "chikushi-sanctuaries",
            label: "玄界灘・筑紫首長中核",
            description: "宗像・阿曇海民と筑紫君の聖地・首長墓群",
            connectionIds: ["chieftains-and-sanctuaries-geography"],
            nodeIds: [
              "tsukushi-no-iwai",
              "munakata-tokuzen",
              "azumi-isora",
              "shikaumi-jinja",
              "munakata-taisha",
              "chikushi-jinja",
              "iwatoyama-kofun",
              "zenichiden-kofun",
              "ushikubi-kilns",
            ],
            default: true,
          },
          {
            id: "all-chieftains-alliance",
            label: "首長同盟・王権相関網全体",
            description: "海人首長群とヤマト王権・物部氏・天武朝廷の政略・皇統相関全体",
            connectionIds: ["chieftains-and-sanctuaries-geography"],
            nodeIds: [
              "tsukushi-clan",
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
        archetype: "faction",
        renderer: "pack-relationship",
        features: ["narrative", "structural"],
        scopeClusters: [
          {
            id: "dannoura-decisive",
            label: "壇ノ浦決戦中核",
            description: "赤間関・壇ノ浦古戦場を中心とする源平直接決戦",
            connectionIds: ["genpei-maritime-geography"],
            nodeIds: [
              "emperor-antoku",
              "taira-no-tomomori",
              "taira-no-noritsune",
              "minamoto-no-yoshitsune",
              "battle-of-dannoura",
              "akama-shrine",
              "dannoura-battlefield",
            ],
            default: true,
          },
          {
            id: "genpei-whole-theater",
            label: "瀬戸内・西海決戦網全体",
            description: "厳島・鞆の浦から屋島・壇ノ浦、豊後緒方氏まで広がる全作戦水域",
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
        scopeClusters: t.scopeClusters,
        designatedFactions: t.designatedFactions,
        boundaryAxis: t.boundaryAxis,
      };
    }),
);

/**
 * 登録済みLENSナレッジパック一覧（後方互換性および既存ローダー用）
 */
export const registeredLensKnowledgePacks = [
  { pack: japaneseMythologyPack, lensId: "mythology" },
  { pack: wajindenRoutesPack, lensId: "route", presetIds: ["wajinden-source-route", "yamatai-hypotheses", "wajinden-comparison"] },
  { pack: wajindenRoutesPack, lensId: "politics", presetIds: ["wajinden-politics"] },
  { pack: religionRelationsPack, lensId: "religion" },
  { pack: miyajimaMisenSacredLandscapePack, lensId: "religion", presetIds: ["miyajima-sacred-relations"] },
  { pack: miyajimaMisenSacredLandscapePack, lensId: "route", presetIds: ["miyajima-current-paths"] },
  { pack: miyajimaMisenSacredLandscapePack, lensId: "politics", presetIds: ["miyajima-patronage-and-space"] },
  { pack: munakataOkinoshimaSacredLandscapePack, lensId: "religion" },
  { pack: hagiBakumatsuPack, lensId: "politics", presetIds: ["bakumatsu-structure"] },
  { pack: ishinFiguresPack, lensId: "people", presetIds: ["ishin-network"] },
  { pack: shikinaishaChikuzenBuzenPack, lensId: "religion", presetIds: ["shikinaisha-network-preset"] },
  { pack: ancientDefenseNetworkPack, lensId: "politics", presetIds: ["dazaifu-defense-preset"] },
  { pack: ichinomiyaWesternNetworkPack, lensId: "religion", presetIds: ["ichinomiya-western-preset"] },
  { pack: ancientHighwaysNetworkPack, lensId: "route", presetIds: ["ancient-highways-preset"] },
  { pack: yayoiArchaeologyNetworkPack, lensId: "route", presetIds: ["yayoi-archaeology-preset"] },
  { pack: yayoiArchaeologyNetworkPack, lensId: "politics", presetIds: ["yayoi-archaeology-preset"] },
  
  { pack: jinmuToseiNetworkPack, lensId: "mythology", presetIds: ["jinmu-yamato-conquest-preset"] },
  { pack: marineDeitiesPack, lensId: "mythology", presetIds: ["marine-deities-preset"] },
  { pack: hyugaMythologyPack, lensId: "mythology", presetIds: ["hyuga-mythology-preset", "hyuga-umiyamasachi-route"] },
  { pack: izumoKunitsukamiPack, lensId: "mythology", presetIds: ["izumo-kunitsukami-preset", "izumo-kunitsukami-corridor"] },
  { pack: jinguKogoLegendPack, lensId: "mythology", presetIds: ["jingu-kogo-legend-preset"] },
  { pack: ancientChieftainsPack, lensId: "people", presetIds: ["ancient-chieftains-preset"] },
  { pack: genpeiDannouraPack, lensId: "people", presetIds: ["genpei-dannoura-preset"] },
] as const;
