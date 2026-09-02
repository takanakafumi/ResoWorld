import { ishinFiguresPack } from "@/domain/lens-packs/ishin-figures-pack";
import { projectLensMapPreset } from "@/domain/lens-packs/projection";

const knowledgeMapRegistrations = [
  { pack: ishinFiguresPack, presetId: "ishin-network" },
];

export const registeredKnowledgeMapConnections = knowledgeMapRegistrations.flatMap(
  ({ pack, presetId }) => projectLensMapPreset(pack, presetId),
);
