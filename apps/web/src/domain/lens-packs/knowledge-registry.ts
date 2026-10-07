import { asakuraConnectionsPack } from "./asakura-pack";
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
  shokaSonjukuNetworkPack,
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

export type RegisteredLensTopic = {
  id: string;
  perspectiveId: LensPerspectiveId;
  label: string;
  description: string;
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
        label: "宗像三女神神話と古代航海安全祭祀",
        description: "誓約神話・三宮配祀から玄界灘の航海安全信仰への展開を見る",
        renderer: "pack-relationship",
        features: ["narrative", "structural"],
      },
    ],
  },
  // 2. 筑紫内陸・朝倉関連（低湿地環濠集落・大和地名一致）
  {
    pack: asakuraConnectionsPack,
    topics: [
      {
        id: "asakura-religious-places",
        presetId: "asakura-religious-places",
        perspectiveId: "religion",
        label: "内陸古層祭祀と近世神仏習合",
        description: "大己貴神社・美奈宜神社の古層祭祀と、浄心院の神仏習合・修験的展開を分けて見る",
        renderer: "pack-relationship",
        features: ["structural"],
      },
      {
        id: "asakura-yamatai-context",
        presetId: "asakura-yamatai-context",
        perspectiveId: "route",
        label: "大和地名一致現象と邪馬台国東遷仮説",
        description: "朝倉・三輪・長谷など古代地名の大和盆地との一致現象と、平塚川添遺跡を起点とする王権東遷仮説を重ねる",
        renderer: "pack-relationship",
        features: ["narrative"],
      },
      {
        id: "asakura-social-structure",
        presetId: "asakura-social-structure",
        perspectiveId: "politics",
        label: "低湿地多重環濠と内陸拠点集落の構造",
        description: "平塚川添遺跡の三重環濠・祭殿・高床倉庫から、低湿地を治水・防衛した弥生後期の首長拠点構造を見る",
        renderer: "pack-relationship",
        features: ["structural"],
      },
    ],
  },
  // 3. 神武東征ネットワーク
  {
    pack: jinmuToseiNetworkPack,
    topics: [
      {
        id: "jinmu-yamato-conquest-preset",
        presetId: "jinmu-yamato-conquest-preset",
        perspectiveId: "mythology",
        label: "難波敗退・熊野山越えと大和即位",
        description: "生駒での敗退から紀伊半島迂回・八咫烏の先導による熊野山岳踏破と橿原即位の王権創始軸",
        renderer: "pack-relationship",
        features: ["narrative"],
      },
      {
        id: "jinmu-setouchi-route-preset",
        presetId: "jinmu-setouchi-route-preset",
        perspectiveId: "route",
        label: "神武東征・瀬戸内海路と風待ち津",
        description: "日向美々津から豊後・筑紫・安芸・吉備を経て難波津に至る古代内海航路と造船・補給拠点回廊",
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
        label: "海洋神話と海人族三系統の航路掌握",
        description: "宗像三女神（宗像氏）・綿津見三神（阿曇氏）・住吉三神（津守氏）の祭祀軸と、玄界灘から博多湾・糸島に至る海人族の航路掌握ネットワーク",
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
        label: "神功皇后伝承と古代筑紫・八幡起源",
        description: "橿日宮（香椎）の沙庭神託、宇美の応神天皇御降誕、筥崎・宮地嶽・朝倉を結ぶ古代王権の西征・安産・八幡信仰回廊",
        renderer: "pack-relationship",
        features: ["narrative"],
      },
      {
        id: "jingu-kogo-hachiman-religion",
        presetId: "jingu-kogo-legend-preset",
        perspectiveId: "religion",
        label: "神功皇后伝承と八幡信仰ネットワーク",
        description: "宇佐神宮（三之御殿）、筥崎宮、宇美八幡宮、長門住吉神社へと広がる八幡大神・母子神信仰の展開",
        renderer: "pack-relationship",
        features: ["structural"],
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
        renderer: "pack-relationship",
        features: ["narrative", "structural"],
        isStratum: true,
      },
      {
        id: "religion-syncretism",
        presetId: "religion-syncretism",
        perspectiveId: "religion",
        label: "神仏習合と修験道・山岳信仰の展開",
        description: "宇佐・国東・宮島に見られる神仏の複合と山岳信仰の重層を見る",
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
        renderer: "pack-relationship",
        features: ["structural"],
        isStratum: true,
      },
      {
        id: "regional-sacred-comparison",
        presetId: "regional-sacred-comparison",
        perspectiveId: "religion",
        label: "沿岸・山岳祭祀空間の比較と重層",
        description: "宗像・宇佐・国東・鞆の浦・広島を訪問から生まれた比較対象として並べ、地域固有の祭祀空間を重ねる",
        renderer: "pack-relationship",
        features: ["structural"],
        isStratum: true,
      },
      {
        id: "local-shrine-connections",
        presetId: "local-shrine-connections",
        perspectiveId: "religion",
        label: "地域神社と伝承・遺跡の重層",
        description: "邪馬台国関連探索で訪れた神社を、伝承・遺跡との立地・祭礼に分けて読み直す",
        renderer: "pack-relationship",
        features: ["structural"],
        isStratum: true,
      },
    ],
  },
  // 9. 宮島・弥山
  {
    pack: miyajimaMisenSacredLandscapePack,
    topics: [
      {
        id: "miyajima-sacred-relations",
        presetId: "miyajima-sacred-relations",
        perspectiveId: "religion",
        label: "厳島・弥山の神域景観と瀬戸内海上壇",
        description: "弥山の自然神域景観と社殿構成を、古代からの連続性を仮定せずに見る",
        renderer: "pack-relationship",
        features: ["structural"],
      },
      {
        id: "miyajima-shrine-history",
        presetId: "miyajima-shrine-history",
        perspectiveId: "religion",
        label: "宮島摂末社の史的変遷",
        description: "参詣・勧請・旧鎮守・移転を、現在の祭神関係や古代からの連続性とは分けて見る",
        renderer: "pack-relationship",
        features: ["narrative", "structural"],
      },
      {
        id: "miyajima-current-paths",
        presetId: "miyajima-current-paths",
        perspectiveId: "route",
        label: "厳島・弥山信仰と山岳登拝路",
        description: "現在の登拝ルートを、実歩行・歴史的参詣路・山岳修験の祭祀的経路と分けて見る",
        renderer: "pack-relationship",
        features: ["narrative", "structural"],
      },
      {
        id: "miyajima-patronage-and-space",
        presetId: "miyajima-patronage-and-space",
        perspectiveId: "politics",
        label: "平氏政権と瀬戸内海壇・厳島社殿",
        description: "12世紀平清盛の政治的庇護と社殿構成を、祭神や古層祭祀とは分けて見る",
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
        renderer: "pack-relationship",
        features: ["structural"],
      },
    ],
  },
  // 13. 魏志倭人伝ルート・政治
  {
    pack: wajindenRoutesPack,
    topics: [
      {
        id: "wajinden-route-comparison",
        presetId: "wajinden-comparison",
        perspectiveId: "route",
        label: "魏志倭人伝の記述順と比定説",
        description: "史料上の順序、現代地名への比定、競合する所在地説を分けて見る",
        renderer: "wajinden-route",
        features: ["narrative", "structural"],
      },
      {
        id: "yamatai-politics",
        presetId: "wajinden-politics",
        perspectiveId: "politics",
        label: "邪馬台国の政治構造",
        description: "卑弥呼、倭の諸国、魏との外交、一大率、狗奴国との関係",
        renderer: "wajinden-politics",
        features: ["structural"],
      },
    ],
  },
  // 14. 古代官道（交通制度）
  {
    pack: ancientHighwaysNetworkPack,
    topics: [
      {
        id: "ancient-highways-preset",
        presetId: "ancient-highways-preset",
        perspectiveId: "route",
        label: "古代官道と七道駅路ネットワーク",
        description: "延喜式兵部省諸国駅伝馬条に記録された駅路・官道と交通インフラ網",
        renderer: "pack-relationship",
        features: ["structural"],
      },
    ],
  },
  // 15. 弥生考古ネットワーク
  {
    pack: yayoiArchaeologyNetworkPack,
    topics: [
      {
        id: "yayoi-archaeology-preset",
        presetId: "yayoi-archaeology-preset",
        perspectiveId: "route",
        label: "北部九州弥生拠点遺跡群",
        description: "吉野ヶ里・朝倉平塚川添・伊都国・奴国・一支国の拠点環濠集落と王墓ネットワーク",
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
        renderer: "pack-relationship",
        features: ["narrative", "structural"],
      },
    ],
  },
  // 18. 維新志士人物網
  {
    pack: ishinFiguresPack,
    topics: [
      {
        id: "ishin-figures-network",
        presetId: "ishin-network",
        perspectiveId: "people",
        label: "維新志士の思想師弟・同盟相関網",
        description: "木戸孝允・西郷隆盛・坂本龍馬らの書簡交渉と薩長同盟、吉田松陰の思想が広がる志士相関ネットワーク",
        renderer: "ishin-network",
        features: ["structural"],
      },
    ],
  },
  // 19. 松下村塾行動網
  {
    pack: shokaSonjukuNetworkPack,
    topics: [
      {
        id: "shoka-sonjuku-action-preset",
        presetId: "shoka-sonjuku-action-preset",
        perspectiveId: "people",
        label: "松下村塾門下生と尊攘志士の行動軌跡",
        description: "吉田松陰の教育拠点（萩松下村塾）から、高杉晋作の功山寺挙兵・東行庵、木戸・伊藤らの政治拠点へと広がる空間的行動網",
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
  { pack: wajindenRoutesPack, lensId: "route", presetIds: ["wajinden-source-route", "yamatai-hypotheses", "wajinden-comparison"] },
  { pack: wajindenRoutesPack, lensId: "politics", presetIds: ["wajinden-politics"] },
  { pack: religionRelationsPack, lensId: "religion" },
  { pack: miyajimaMisenSacredLandscapePack, lensId: "religion", presetIds: ["miyajima-sacred-relations", "miyajima-shrine-history"] },
  { pack: miyajimaMisenSacredLandscapePack, lensId: "route", presetIds: ["miyajima-current-paths"] },
  { pack: miyajimaMisenSacredLandscapePack, lensId: "politics", presetIds: ["miyajima-patronage-and-space"] },
  { pack: munakataOkinoshimaSacredLandscapePack, lensId: "religion" },
  { pack: asakuraConnectionsPack, lensId: "religion", presetIds: ["asakura-religious-places"] },
  { pack: asakuraConnectionsPack, lensId: "route", presetIds: ["asakura-yamatai-context"] },
  { pack: asakuraConnectionsPack, lensId: "politics", presetIds: ["asakura-social-structure"] },
  { pack: hagiBakumatsuPack, lensId: "politics", presetIds: ["bakumatsu-structure"] },
  { pack: ishinFiguresPack, lensId: "people", presetIds: ["ishin-network"] },
  { pack: shikinaishaChikuzenBuzenPack, lensId: "religion", presetIds: ["shikinaisha-network-preset"] },
  { pack: ancientDefenseNetworkPack, lensId: "politics", presetIds: ["dazaifu-defense-preset"] },
  { pack: ichinomiyaWesternNetworkPack, lensId: "religion", presetIds: ["ichinomiya-western-preset"] },
  { pack: shokaSonjukuNetworkPack, lensId: "people", presetIds: ["shoka-sonjuku-action-preset"] },
  { pack: ancientHighwaysNetworkPack, lensId: "route", presetIds: ["ancient-highways-preset"] },
  { pack: yayoiArchaeologyNetworkPack, lensId: "route", presetIds: ["yayoi-archaeology-preset"] },
  { pack: jinmuToseiNetworkPack, lensId: "route", presetIds: ["jinmu-setouchi-route-preset"] },
  { pack: jinmuToseiNetworkPack, lensId: "mythology", presetIds: ["jinmu-yamato-conquest-preset"] },
  { pack: marineDeitiesPack, lensId: "mythology", presetIds: ["marine-deities-preset"] },
  { pack: hyugaMythologyPack, lensId: "mythology", presetIds: ["hyuga-mythology-preset"] },
  { pack: izumoKunitsukamiPack, lensId: "mythology", presetIds: ["izumo-kunitsukami-preset"] },
  { pack: jinguKogoLegendPack, lensId: "mythology", presetIds: ["jingu-kogo-legend-preset"] },
  { pack: jinguKogoLegendPack, lensId: "religion", presetIds: ["jingu-kogo-legend-preset"] },
] as const;
