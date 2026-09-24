import { asakuraConnectionsPack } from "./asakura-pack";
import { hagiBakumatsuPack } from "./bakumatsu-pack";
import { ishinFiguresPack } from "./ishin-figures-pack";
import { miyajimaMisenSacredLandscapePack } from "./miyajima-misen-pack";
import { munakataOkinoshimaSacredLandscapePack } from "./munakata-okinoshima-pack";
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
] as const;

export const registeredLensTopics: readonly RegisteredLensTopic[] = [
  {
    id: "munakata-genealogy",
    perspectiveId: "mythology",
    label: "宗像三女神の周辺",
    description: "誓約、神々、祭祀地、史料を宗像訪問から再認識する",
    pack: japaneseMythologyPack,
    presetId: "munakata-connections",
    renderer: "mythology-genealogy",
  },
  {
    id: "asakura-kami-connections",
    perspectiveId: "mythology",
    label: "朝倉の祭神関係",
    description: "大己貴神社と美奈宜神社から、祀られる神々の重なりを見る",
    pack: asakuraConnectionsPack,
    presetId: "asakura-kami-connections",
    renderer: "pack-relationship",
  },
  ...religionRelationsPack.presets.map((preset) => ({
    id: preset.id,
    perspectiveId: "religion" as const,
    label: preset.label,
    description: preset.description,
    pack: religionRelationsPack,
    presetId: preset.id,
    renderer: "religion-relationship" as const,
  })),
  {
    id: "asakura-religious-places",
    perspectiveId: "religion",
    label: "朝倉の祭祀と習合",
    description: "神社の祭神と浄心院の神仏習合を、同一系譜にせず並べて見る",
    pack: asakuraConnectionsPack,
    presetId: "asakura-religious-places",
    renderer: "pack-relationship",
  },
  {
    id: "miyajima-sacred-relations",
    perspectiveId: "religion",
    label: "厳島・弥山の神域と現在祭祀",
    description: "景観構成と現在の祭祀を、古代からの連続性を仮定せずに見る",
    pack: miyajimaMisenSacredLandscapePack,
    presetId: "miyajima-sacred-relations",
    renderer: "pack-relationship",
  },
  {
    id: "miyajima-shrine-history",
    perspectiveId: "religion",
    label: "宮島摂末社の史的変遷",
    description: "参詣・勧請・旧鎮守・移転を、現在の祭神関係や古代からの連続性とは分けて見る",
    pack: miyajimaMisenSacredLandscapePack,
    presetId: "miyajima-shrine-history",
    renderer: "pack-relationship",
  },
  ...munakataOkinoshimaSacredLandscapePack.presets.map((preset) => ({
    id: preset.id,
    perspectiveId: "religion" as const,
    label: preset.label,
    description: preset.description,
    pack: munakataOkinoshimaSacredLandscapePack,
    presetId: preset.id,
    renderer: "pack-relationship" as const,
  })),
  {
    id: "wajinden-route-comparison",
    perspectiveId: "route",
    label: "魏志倭人伝の記述順と比定",
    description: "史料上の順序、現代地名への比定、競合する所在地説を分けて見る",
    pack: wajindenRoutesPack,
    presetId: "wajinden-comparison",
    renderer: "wajinden-route",
  },
  {
    id: "asakura-yamatai-context",
    perspectiveId: "route",
    label: "朝倉説と平塚川添遺跡",
    description: "所在地仮説と、遺跡の確認可能な考古学的文脈を分けて重ねる",
    pack: asakuraConnectionsPack,
    presetId: "asakura-yamatai-context",
    renderer: "pack-relationship",
  },
  {
    id: "miyajima-current-paths",
    perspectiveId: "route",
    label: "大元・大聖院から弥山への現在経路",
    description: "現在の登山経路を、実歩行・歴史的参詣路・祭祀的経路と分けて見る",
    pack: miyajimaMisenSacredLandscapePack,
    presetId: "miyajima-current-paths",
    renderer: "pack-relationship",
  },
  {
    id: "asakura-social-structure",
    perspectiveId: "politics",
    label: "朝倉の弥生集落構造",
    description: "平塚川添遺跡の拠点性と出土資料から、2〜3世紀の地域社会を見る",
    pack: asakuraConnectionsPack,
    presetId: "asakura-social-structure",
    renderer: "pack-relationship",
  },
  {
    id: "miyajima-patronage-and-space",
    perspectiveId: "politics",
    label: "平清盛と厳島神社の社殿構成",
    description: "12世紀の政治的庇護と社殿構成を、祭神や古層祭祀とは分けて見る",
    pack: miyajimaMisenSacredLandscapePack,
    presetId: "miyajima-patronage-and-space",
    renderer: "pack-relationship",
  },
  {
    id: "yamatai-politics",
    perspectiveId: "politics",
    label: "邪馬台国の政治構造",
    description: "卑弥呼、倭の諸国、魏との外交、一大率、狗奴国との関係",
    pack: wajindenRoutesPack,
    presetId: "wajinden-politics",
    renderer: "wajinden-politics",
  },
  {
    id: "hagi-domain-politics",
    perspectiveId: "politics",
    label: "長州藩の政治と近代化",
    description: "人材形成、海防、西洋技術、産業化の試行",
    pack: hagiBakumatsuPack,
    presetId: "bakumatsu-structure",
    renderer: "bakumatsu-structure",
  },
  {
    id: "ishin-figures-network",
    perspectiveId: "people",
    label: "維新志士の人物網",
    description: "萩の教育と長州から、藩を越えた交渉・盟約へ広がる人物関係",
    pack: ishinFiguresPack,
    presetId: "ishin-network",
    renderer: "ishin-network",
  },
];
