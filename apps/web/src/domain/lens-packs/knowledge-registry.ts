import { hagiBakumatsuPack } from "./bakumatsu-pack";
import { ishinFiguresPack } from "./ishin-figures-pack";
import type { LensKnowledgePack } from "./schema";
import { japaneseMythologyPack, religionRelationsPack, wajindenRoutesPack } from "./seed-packs";

export type LensTopicRenderer = "wajinden-politics" | "bakumatsu-structure" | "ishin-network";
export type LensPerspectiveId = "politics" | "people";

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
  { pack: wajindenRoutesPack, lensId: "route", presetIds: ["wajinden-source-route", "yamatai-hypotheses", "wajinden-comparison"] },
  { pack: wajindenRoutesPack, lensId: "politics", presetIds: ["wajinden-politics"] },
  { pack: religionRelationsPack, lensId: "religion" },
  { pack: hagiBakumatsuPack, lensId: "politics", presetIds: ["bakumatsu-structure"] },
  { pack: ishinFiguresPack, lensId: "people", presetIds: ["ishin-network"] },
] as const;

export const registeredLensTopics: readonly RegisteredLensTopic[] = [
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
