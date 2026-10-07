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

export type RegisteredLensTopic = {
  id: string;
  perspectiveId: LensPerspectiveId;
  label: string;
  description: string;
  pack: LensKnowledgePack;
  presetId: string;
  renderer: LensTopicRenderer;
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
        label: "宗像三女神の周辺",
        description: "誓約、神々、祭祀地、史料を宗像訪問から再認識する",
        renderer: "mythology-genealogy",
      },
    ],
  },
  // 2. 朝倉関連
  {
    pack: asakuraConnectionsPack,
    topics: [
      {
        id: "asakura-kami-connections",
        presetId: "asakura-kami-connections",
        perspectiveId: "mythology",
        label: "朝倉の祭神関係",
        description: "大己貴神社と美奈宜神社から、祀られる神々の重なりを見る",
        renderer: "pack-relationship",
      },
      {
        id: "asakura-religious-places",
        presetId: "asakura-religious-places",
        perspectiveId: "religion",
        label: "朝倉の祭祀と習合",
        description: "神社の祭神と浄心院の神仏習合を、同一系譜にせず並べて見る",
        renderer: "pack-relationship",
      },
      {
        id: "asakura-yamatai-context",
        presetId: "asakura-yamatai-context",
        perspectiveId: "route",
        label: "朝倉説と平塚川添遺跡",
        description: "所在地仮説と、遺跡の確認可能な考古学的文脈を分けて重ねる",
        renderer: "pack-relationship",
      },
      {
        id: "asakura-social-structure",
        presetId: "asakura-social-structure",
        perspectiveId: "politics",
        label: "朝倉の弥生集落構造",
        description: "平塚川添遺跡の拠点性と出土資料から、2〜3世紀の地域社会を見る",
        renderer: "pack-relationship",
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
      },
      {
        id: "jinmu-setouchi-route-preset",
        presetId: "jinmu-setouchi-route-preset",
        perspectiveId: "route",
        label: "神武東征・瀬戸内海路と風待ち津",
        description: "日向美々津から豊後・筑紫・安芸・吉備を経て難波津に至る古代内海航路と造船・補給拠点回廊",
        renderer: "pack-relationship",
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
        label: "海洋神話と海人族三系統",
        description: "宗像三女神（宗像氏）・綿津見三神（阿曇氏）・住吉三神（津守氏）の祭祀軸と、玄界灘から博多湾・糸島に至る海人族の航路掌握ネットワーク",
        renderer: "pack-relationship",
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
        label: "出雲国譲りと大国主系譜",
        description: "出雲大社・稲佐の浜・美保神社の国譲り神話軸と、朝倉・宮島・大和三輪山を結ぶ大己貴命（オオクニヌシ）信仰の西日本伝播ネットワーク",
        renderer: "pack-relationship",
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
      },
      {
        id: "jingu-kogo-hachiman-religion",
        presetId: "jingu-kogo-legend-preset",
        perspectiveId: "religion",
        label: "神功皇后と八幡信仰ネットワーク",
        description: "宇佐神宮（三之御殿）、筥崎宮、宇美八幡宮、長門住吉神社へと広がる八幡大神・母子神信仰の展開",
        renderer: "pack-relationship",
      },
    ],
  },
  // 8. 宗教諸関係
  {
    pack: religionRelationsPack,
    topics: religionRelationsPack.presets.map((preset) => ({
      id: preset.id,
      presetId: preset.id,
      perspectiveId: "religion" as const,
      label: preset.label,
      description: preset.description,
      renderer: "religion-relationship" as const,
    })),
  },
  // 9. 宮島・弥山
  {
    pack: miyajimaMisenSacredLandscapePack,
    topics: [
      {
        id: "miyajima-sacred-relations",
        presetId: "miyajima-sacred-relations",
        perspectiveId: "religion",
        label: "厳島・弥山の神域と現在祭祀",
        description: "景観構成と現在の祭祀を、古代からの連続性を仮定せずに見る",
        renderer: "pack-relationship",
      },
      {
        id: "miyajima-shrine-history",
        presetId: "miyajima-shrine-history",
        perspectiveId: "religion",
        label: "宮島摂末社の史的変遷",
        description: "参詣・勧請・旧鎮守・移転を、現在の祭神関係や古代からの連続性とは分けて見る",
        renderer: "pack-relationship",
      },
      {
        id: "miyajima-current-paths",
        presetId: "miyajima-current-paths",
        perspectiveId: "route",
        label: "大元・大聖院から弥山への現在経路",
        description: "現在の登山経路を、実歩行・歴史的参詣路・祭祀的経路と分けて見る",
        renderer: "pack-relationship",
      },
      {
        id: "miyajima-patronage-and-space",
        presetId: "miyajima-patronage-and-space",
        perspectiveId: "politics",
        label: "平清盛と厳島神社の社殿構成",
        description: "12世紀の政治的庇護と社殿構成を、祭神や古層祭祀とは分けて見る",
        renderer: "pack-relationship",
      },
    ],
  },
  // 10. 宗像・沖ノ島
  {
    pack: munakataOkinoshimaSacredLandscapePack,
    topics: munakataOkinoshimaSacredLandscapePack.presets.map((preset) => ({
      id: preset.id,
      presetId: preset.id,
      perspectiveId: "religion" as const,
      label: preset.label,
      description: preset.description,
      renderer: "pack-relationship" as const,
    })),
  },
  // 11. 式内名神大社
  {
    pack: shikinaishaChikuzenBuzenPack,
    topics: [
      {
        id: "shikinaisha-network-preset",
        presetId: "shikinaisha-network-preset",
        perspectiveId: "religion",
        label: "式内名神大社ネットワーク",
        description: "延喜式神名帳に記された名神大社と祭神の関係および古代交通回廊の配置",
        renderer: "pack-relationship",
      },
    ],
  },
  // 12. 西国諸国一宮
  {
    pack: ichinomiyaWesternNetworkPack,
    topics: [
      {
        id: "ichinomiya-western-preset",
        presetId: "ichinomiya-western-preset",
        perspectiveId: "religion",
        label: "西国諸国一宮ネットワーク",
        description: "九州・山陽・諸島における令制国の一宮（筆頭大社）の空間配置と祭祀体系",
        renderer: "pack-relationship",
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
        label: "魏志倭人伝の記述順と比定",
        description: "史料上の順序、現代地名への比定、競合する所在地説を分けて見る",
        renderer: "wajinden-route",
      },
      {
        id: "yamatai-politics",
        presetId: "wajinden-politics",
        perspectiveId: "politics",
        label: "邪馬台国の政治構造",
        description: "卑弥呼、倭の諸国、魏との外交、一大率、狗奴国との関係",
        renderer: "wajinden-politics",
      },
    ],
  },
  // 14. 古代官道
  {
    pack: ancientHighwaysNetworkPack,
    topics: [
      {
        id: "ancient-highways-preset",
        presetId: "ancient-highways-preset",
        perspectiveId: "route",
        label: "古代官道・山陽道と西海道駅家網",
        description: "延喜式兵部省諸国駅伝馬条に記録された山陽道大路と関門海峡・大宰府官道の交通網",
        renderer: "pack-relationship",
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
        label: "長州藩の政治と近代化",
        description: "人材形成、海防、西洋技術、産業化の試行",
        renderer: "bakumatsu-structure",
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
        label: "維新志士の人物網",
        description: "萩の教育と長州から、藩を越えた交渉・盟約へ広がる人物関係",
        renderer: "ishin-network",
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
        label: "松下村塾門下生と長州志士の行動網",
        description: "吉田松陰の教育から高杉晋作の功山寺挙兵、木戸孝允・伊藤博文らの政治拠点へと広がる行動軌跡",
        renderer: "pack-relationship",
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
      };
    }),
);

/**
 * 登録済みLENSナレッジパック一覧（後方互換性および既存ローダー用）
 */
export const registeredLensKnowledgePacks = [
  { pack: japaneseMythologyPack, lensId: "mythology" },
  { pack: asakuraConnectionsPack, lensId: "mythology", presetIds: ["asakura-kami-connections"] },
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
