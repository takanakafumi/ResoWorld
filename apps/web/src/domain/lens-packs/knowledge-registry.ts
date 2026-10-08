import { hagiBakumatsuPack } from "./bakumatsu-pack";
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

export type LensTopicRenderer =
  | "mythology-genealogy"
  | "religion-relationship"
  | "wajinden-route"
  | "wajinden-politics"
  | "bakumatsu-structure"
  | "ishin-network"
  | "pack-relationship";

export type LensPerspectiveId = "mythology" | "religion" | "route" | "politics" | "people";

export type TopicFeature = "narrative" | "structural";

/**
 * TOPICが歴史・文化のどこにスポットライトを当てているかという単一の焦点（主題）
 * 1つのTOPICには必ず1つのFocusが割り当てられる。
 */
export type TopicFocus =
  | "genealogy"         // 神統譜（誓約神話・皇統・神々の系譜）
  | "clan-legend"       // 氏族伝承（海人族・古代氏族の伝承）
  | "royal-legend"      // 王権伝承（神功皇后・西征・母子神）
  | "advent-myth"       // 降臨神話（天孫降臨・日向神話）
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
  | "domain-reform"     // 藩政改革（幕末長州藩・海防・近代化政策）
  | "warrior-patronage" // 武家庇護（平氏政権・瀬戸内海壇・厳島社殿）
  | "patriot-alliance"  // 志士同盟（維新志士・薩長同盟・相関網）
  | "disciples-action"; // 門下行動（松下村塾門下生・尊攘行動軌跡）

export const topicFocusLabels: Record<TopicFocus, string> = {
  genealogy: "神統譜",
  "clan-legend": "氏族伝承",
  "royal-legend": "王権伝承",
  "advent-myth": "降臨神話",
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
  "domain-reform": "藩政改革",
  "warrior-patronage": "武家庇護",
  "patriot-alliance": "志士同盟",
  "disciples-action": "門下行動",
};

export type RegisteredLensTopic = {
  id: string;
  perspectiveId: LensPerspectiveId;
  label: string;
  description: string;
  focus: TopicFocus;
  focusLabel: string;
  pack: LensKnowledgePack;
  presetId: string;
  renderer: LensTopicRenderer;
  features: readonly TopicFeature[];
  isStratum?: boolean;
};

/**
 * 知識構造の正本（Knowledge Pack）から切り出されるTOPICとLENSの定義
 * 正本（Pack） -> TOPIC（Preset） -> LENS（5大視点）の3層関係を1箇所で宣言的に定義します。
 */
export type KnowledgePackTopicMapping = {
  pack: LensKnowledgePack;
  topics: readonly {
    id: string;
    presetId: string;
    perspectiveId: LensPerspectiveId;
    label?: string; // 指定がなければ pack.presets から取得
    description?: string; // 指定がなければ pack.presets から取得
    focus: TopicFocus; // 単一の焦点（必須）
    renderer: LensTopicRenderer;
    features?: readonly TopicFeature[]; // 指定がなければ ["structural"]
    isStratum?: boolean; // 通史・時代地層専用トピック（LENS水平バーからは除外）
  }[];
};

export const canonicalKnowledgePackTopicMappings: readonly KnowledgePackTopicMapping[] = [
  // 1. 日本神話・神統譜
  {
    pack: japaneseMythologyPack,
    topics: [
      {
        id: "munakata-genealogy",
        presetId: "munakata-connections",
        perspectiveId: "mythology",
        label: "誓約神話と皇統譜の創始",
        description: "アマテラスとスサノオの誓約から皇祖神（五男神・天忍穂耳尊）と宗像三女神が誕生し、天孫降臨へと連なる神統譜の創始を見る",
        focus: "genealogy",
        renderer: "pack-relationship",
        features: ["narrative"],
      },
    ],
  },
  // 2. 神武東征ネットワーク
  {
    pack: jinmuToseiNetworkPack,
    topics: [
      {
        id: "jinmu-yamato-conquest-preset",
        presetId: "jinmu-yamato-conquest-preset",
        perspectiveId: "mythology",
        label: "難波敗退・熊野山越えと大和即位",
        description: "生駒での敗退から紀伊半島迂回・八咫烏の先導による熊野山岳踏破と橿原即位の王権創始軸",
        focus: "dynasty-founding",
        renderer: "pack-relationship",
        features: ["narrative"],
      },
      {
        id: "jinmu-setouchi-route-preset",
        presetId: "jinmu-setouchi-route-preset",
        perspectiveId: "route",
        label: "神武東征・瀬戸内海路と風待ち津",
        description: "日向美々津から豊後・筑紫・安芸・吉備を経て難波津に至る古代内海航路と造船・補給拠点回廊",
        focus: "sea-corridor",
        renderer: "pack-relationship",
        features: ["narrative"],
      },
    ],
  },
  // 4. 海洋神話と海人族三系統
  {
    pack: marineDeitiesPack,
    topics: [
      {
        id: "marine-deities-preset",
        presetId: "marine-deities-preset",
        perspectiveId: "mythology",
        label: "海洋神話と古代海人族三系統",
        description: "宗像三女神（宗像氏）・綿津見三神（阿曇氏）・住吉三神（津守氏）の祭祀軸と、玄界灘から瀬戸内海潮待ち港（鞆の浦・広島）に至る海人族の航路掌握・海神祭祀ネットワーク",
        focus: "clan-legend",
        renderer: "pack-relationship",
        features: ["structural"],
      },
    ],
  },
  // 5. 日向神話
  {
    pack: hyugaMythologyPack,
    topics: [
      {
        id: "hyuga-mythology-preset",
        presetId: "hyuga-mythology-preset",
        perspectiveId: "mythology",
        label: "天孫降臨・日向神話と海幸山幸",
        description: "高千穂・霧島の天孫降臨軸と、青島・鵜戸神宮の日南海岸に広がる海幸山幸神話回廊。糸島の細石神社・高祖神社から南九州の神話空間を読み直す",
        focus: "advent-myth",
        renderer: "pack-relationship",
        features: ["narrative"],
      },
    ],
  },
  // 6. 出雲国津神
  {
    pack: izumoKunitsukamiPack,
    topics: [
      {
        id: "izumo-kunitsukami-preset",
        presetId: "izumo-kunitsukami-preset",
        perspectiveId: "mythology",
        label: "出雲国譲り神話と大己貴・国津神系譜",
        description: "出雲大社・稲佐の浜・美保神社の国譲り神話軸と、朝倉（大己貴神社・美奈宜神社）・宮島・大和三輪山を結ぶ大国主・大己貴信仰の西日本伝播ネットワーク",
        focus: "kunitsukami",
        renderer: "pack-relationship",
        features: ["narrative", "structural"],
      },
    ],
  },
  // 7. 神功皇后伝承
  {
    pack: jinguKogoLegendPack,
    topics: [
      {
        id: "jingu-kogo-legend-preset",
        presetId: "jingu-kogo-legend-preset",
        perspectiveId: "mythology",
        label: "神功皇后伝承と古代筑紫の母子神回廊",
        description: "橿日宮（香椎）の沙庭神託、宇美の応神天皇御降誕、筥崎・宮地嶽・朝倉を結ぶ古代王権の西征・安産・母子神信仰回廊",
        focus: "royal-legend",
        renderer: "pack-relationship",
        features: ["narrative"],
      },
    ],
  },
  // 8. 宗教諸関係（通史・時代地層基盤）
  {
    pack: religionRelationsPack,
    topics: [
      {
        id: "religion-history",
        presetId: "religion-history",
        perspectiveId: "religion",
        label: "古代祭祀の変遷と神道・仏教の接触",
        description: "日本列島の古代神祭りから神仏習合への展開と歴史的接触を見る",
        focus: "syncretism",
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
        focus: "natural-shrine",
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
        renderer: "pack-relationship",
        features: ["structural"],
      },
    ],
  },
  // 8. 宮島・弥山
  {
    pack: miyajimaMisenSacredLandscapePack,
    topics: [
      {
        id: "miyajima-sacred-relations",
        presetId: "miyajima-sacred-relations",
        perspectiveId: "religion",
        label: "厳島・弥山の神域景観と瀬戸内海上壇",
        description: "弥山の自然神域景観と社殿構成を、古代からの連続性を仮定せずに見る",
        focus: "natural-shrine",
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
        renderer: "pack-relationship",
        features: ["narrative", "structural"],
      },
    ],
  },
  // 10. 宗像・沖ノ島
  {
    pack: munakataOkinoshimaSacredLandscapePack,
    topics: [
      {
        id: "munakata-three-shrines",
        presetId: "munakata-three-shrines",
        perspectiveId: "religion",
        label: "沖ノ島古代国家祭祀と宗像三宮景観",
        description: "沖津宮・中津宮・辺津宮の三宮構造と、玄界灘の孤島・沖ノ島から本土を結ぶ古代国家祭祀の景観",
        focus: "sacred-space",
        renderer: "pack-relationship",
        features: ["narrative", "structural"],
      },
    ],
  },
  // 11. 式内名神大社（律令官撰制度）
  {
    pack: shikinaishaChikuzenBuzenPack,
    topics: [
      {
        id: "shikinaisha-network-preset",
        presetId: "shikinaisha-network-preset",
        perspectiveId: "religion",
        label: "延喜式神名帳と式内名神大社制度",
        description: "延喜式神名帳に記された名神大社と祭神の関係および古代交通回廊の配置",
        focus: "state-system",
        renderer: "pack-relationship",
        features: ["structural"],
      },
    ],
  },
  // 12. 西国諸国一宮（令制国制度）
  {
    pack: ichinomiyaWesternNetworkPack,
    topics: [
      {
        id: "ichinomiya-western-preset",
        presetId: "ichinomiya-western-preset",
        perspectiveId: "religion",
        label: "令制国体制と諸国一宮の祭祀網",
        description: "令制国の一宮（筆頭大社）の空間配置と国司・律令祭祀体系",
        focus: "regional-order",
        renderer: "pack-relationship",
        features: ["structural"],
      },
    ],
  },
  // 12. 魏志倭人伝ルート・政治
  {
    pack: wajindenRoutesPack,
    topics: [
      {
        id: "wajinden-route-comparison",
        presetId: "wajinden-comparison",
        perspectiveId: "route",
        label: "魏志倭人伝の記述順と比定説",
        description: "史料上の順序、現代地名への比定、競合する所在地説を分けて見る",
        focus: "text-identification",
        renderer: "wajinden-route",
        features: ["narrative", "structural"],
      },
      {
        id: "asakura-yamatai-context",
        presetId: "asakura-yamatai-context",
        perspectiveId: "route",
        label: "大和地名一致現象と邪馬台国東遷仮説",
        description: "朝倉・三輪・長谷など古代地名の大和盆地との一致現象と、初期王権東遷仮説を重ねる",
        focus: "toponym-hypothesis",
        renderer: "pack-relationship",
        features: ["narrative"],
      },
      {
        id: "yamatai-politics",
        presetId: "wajinden-politics",
        perspectiveId: "politics",
        label: "邪馬台国の政治構造",
        description: "卑弥呼、倭の諸国、魏との外交、一大率、狗奴国との関係",
        focus: "diplomacy-structure",
        renderer: "wajinden-politics",
        features: ["structural"],
      },
    ],
  },
  // 13. 古代官道（交通制度）
  {
    pack: ancientHighwaysNetworkPack,
    topics: [
      {
        id: "ancient-highways-preset",
        presetId: "ancient-highways-preset",
        perspectiveId: "route",
        label: "古代官道と七道駅路ネットワーク",
        description: "延喜式兵部省諸国駅伝馬条に記録された駅路・官道と交通インフラ網",
        focus: "highways",
        renderer: "pack-relationship",
        features: ["structural"],
      },
    ],
  },
  // 14. 弥生考古ネットワーク
  {
    pack: yayoiArchaeologyNetworkPack,
    topics: [
      {
        id: "yayoi-archaeology-preset",
        presetId: "yayoi-archaeology-preset",
        perspectiveId: "route",
        label: "拠点環濠集落と弥生首長層・王墓ネットワーク",
        description: "吉野ヶ里・朝倉平塚川添・伊都国・奴国・一支国の拠点環濠集落と王墓ネットワーク",
        focus: "chieftain-network",
        renderer: "pack-relationship",
        features: ["structural"],
      },
      {
        id: "asakura-social-structure",
        presetId: "yayoi-archaeology-preset",
        perspectiveId: "politics",
        label: "低湿地多重環濠と内陸拠点集落の構造",
        description: "平塚川添遺跡の多重環濠・祭殿・高床倉庫から、低湿地を治水・防衛した弥生後期の首長拠点構造を見る",
        focus: "chieftain-network",
        renderer: "pack-relationship",
        features: ["structural"],
      },
    ],
  },
  // 16. 長州・萩幕末
  {
    pack: hagiBakumatsuPack,
    topics: [
      {
        id: "hagi-domain-politics",
        presetId: "bakumatsu-structure",
        perspectiveId: "politics",
        label: "幕末長州藩の政治体制と近代化政策",
        description: "萩藩校明倫館の人材形成から、海防危機・西洋技術導入（反射炉・造船所）を経て産業化を試行した藩政改革の構造",
        focus: "domain-reform",
        renderer: "bakumatsu-structure",
        features: ["structural"],
      },
    ],
  },
  // 17. 古代国防・山城
  {
    pack: ancientDefenseNetworkPack,
    topics: [
      {
        id: "dazaifu-defense-preset",
        presetId: "dazaifu-defense-preset",
        perspectiveId: "politics",
        label: "白村江後の古代国防・山城",
        description: "天智天皇期に唐・新羅の侵攻に備えて急造された水城・朝鮮式山城群と大宰府防衛体制",
        focus: "ancient-defense",
        renderer: "pack-relationship",
        features: ["narrative", "structural"],
      },
    ],
  },
  // 17. 維新志士・松下村塾人物行動網
  {
    pack: ishinFiguresPack,
    topics: [
      {
        id: "ishin-figures-network",
        presetId: "ishin-network",
        perspectiveId: "people",
        label: "維新志士の思想師弟・同盟相関網",
        description: "木戸孝允・西郷隆盛・坂本龍馬らの書簡交渉と薩長同盟、吉田松陰の思想が広がる志士相関ネットワーク",
        focus: "patriot-alliance",
        renderer: "ishin-network",
        features: ["structural"],
      },
      {
        id: "shoka-sonjuku-action-preset",
        presetId: "shoka-sonjuku-action-preset",
        perspectiveId: "people",
        label: "松下村塾門下生と尊攘志士の行動軌跡",
        description: "吉田松陰の教育拠点（萩松下村塾）から、高杉晋作の功山寺挙兵・東行庵、桜山神社、木戸・伊藤らの政治拠点へと広がる空間的行動網",
        focus: "disciples-action",
        renderer: "pack-relationship",
        features: ["narrative", "structural"],
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
      return {
        id: t.id,
        perspectiveId: t.perspectiveId,
        label: t.label ?? preset?.label ?? t.id,
        description: t.description ?? preset?.description ?? "",
        pack: mapping.pack,
        presetId: t.presetId,
        focus: t.focus,
        focusLabel: topicFocusLabels[t.focus],
        renderer: t.renderer,
        features: t.features ?? ["structural"],
        isStratum: t.isStratum ?? false,
      };
    }),
);

/**
 * 登録済みLENSナレッジパック一覧（後方互換性および既存ローダー用）
 */
export const registeredLensKnowledgePacks = [
  { pack: japaneseMythologyPack, lensId: "mythology" },
  { pack: wajindenRoutesPack, lensId: "route", presetIds: ["wajinden-source-route", "yamatai-hypotheses", "wajinden-comparison", "asakura-yamatai-context"] },
  { pack: wajindenRoutesPack, lensId: "politics", presetIds: ["wajinden-politics"] },
  { pack: religionRelationsPack, lensId: "religion" },
  { pack: miyajimaMisenSacredLandscapePack, lensId: "religion", presetIds: ["miyajima-sacred-relations"] },
  { pack: miyajimaMisenSacredLandscapePack, lensId: "route", presetIds: ["miyajima-current-paths"] },
  { pack: miyajimaMisenSacredLandscapePack, lensId: "politics", presetIds: ["miyajima-patronage-and-space"] },
  { pack: munakataOkinoshimaSacredLandscapePack, lensId: "religion" },
  { pack: hagiBakumatsuPack, lensId: "politics", presetIds: ["bakumatsu-structure"] },
  { pack: ishinFiguresPack, lensId: "people", presetIds: ["ishin-network", "shoka-sonjuku-action-preset"] },
  { pack: shikinaishaChikuzenBuzenPack, lensId: "religion", presetIds: ["shikinaisha-network-preset"] },
  { pack: ancientDefenseNetworkPack, lensId: "politics", presetIds: ["dazaifu-defense-preset"] },
  { pack: ichinomiyaWesternNetworkPack, lensId: "religion", presetIds: ["ichinomiya-western-preset"] },
  { pack: ancientHighwaysNetworkPack, lensId: "route", presetIds: ["ancient-highways-preset"] },
  { pack: yayoiArchaeologyNetworkPack, lensId: "route", presetIds: ["yayoi-archaeology-preset"] },
  { pack: yayoiArchaeologyNetworkPack, lensId: "politics", presetIds: ["yayoi-archaeology-preset"] },
  { pack: jinmuToseiNetworkPack, lensId: "route", presetIds: ["jinmu-setouchi-route-preset"] },
  { pack: jinmuToseiNetworkPack, lensId: "mythology", presetIds: ["jinmu-yamato-conquest-preset"] },
  { pack: marineDeitiesPack, lensId: "mythology", presetIds: ["marine-deities-preset"] },
  { pack: hyugaMythologyPack, lensId: "mythology", presetIds: ["hyuga-mythology-preset"] },
  { pack: izumoKunitsukamiPack, lensId: "mythology", presetIds: ["izumo-kunitsukami-preset"] },
  { pack: jinguKogoLegendPack, lensId: "mythology", presetIds: ["jingu-kogo-legend-preset"] },
] as const;
