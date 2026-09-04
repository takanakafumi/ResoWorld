import { hagiBakumatsuPack } from "./bakumatsu-pack";
import { ishinFiguresPack } from "./ishin-figures-pack";
import { japaneseMythologyPack, religionRelationsPack, wajindenRoutesPack } from "./seed-packs";

export const registeredLensKnowledgePacks = [
  { pack: japaneseMythologyPack, lensId: "mythology" },
  { pack: wajindenRoutesPack, lensId: "route" },
  { pack: religionRelationsPack, lensId: "religion" },
  { pack: hagiBakumatsuPack, lensId: "bakumatsu" },
  { pack: ishinFiguresPack, lensId: "restoration-figures" },
] as const;

