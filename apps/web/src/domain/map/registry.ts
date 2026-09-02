import { ishinFiguresPack } from "@/domain/lens-packs/ishin-figures-pack";
import { projectLensMapPreset } from "@/domain/lens-packs/projection";
import { wajindenRoutesPack } from "@/domain/lens-packs/seed-packs";

const knowledgeMapRegistrations = [
  { pack: ishinFiguresPack, presetId: "ishin-network" },
];

export const registeredKnowledgeMapConnections = knowledgeMapRegistrations.flatMap(
  ({ pack, presetId }) => projectLensMapPreset(pack, presetId),
);

const knowledgeMapGroups = {
  "wajinden-routes": projectLensMapPreset(wajindenRoutesPack, "wajinden-comparison"),
} as const;

export function knowledgeMapConnectionsForGroup(groupId?: string) {
  return groupId && groupId in knowledgeMapGroups
    ? knowledgeMapGroups[groupId as keyof typeof knowledgeMapGroups]
    : [];
}
