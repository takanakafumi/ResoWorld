import { ishinFiguresPack } from "@/domain/lens-packs/ishin-figures-pack";
import { projectLensMapPreset } from "@/domain/lens-packs/projection";
import { wajindenRoutesPack } from "@/domain/lens-packs/seed-packs";

function registeredPresetConnections(
  pack: Parameters<typeof projectLensMapPreset>[0],
  presetId: string,
  connectionIds?: readonly string[],
) {
  const projected = projectLensMapPreset(pack, presetId);
  if (!connectionIds) return projected;
  const selected = new Set(connectionIds);
  return projected.filter((connection) => selected.has(connection.id));
}

const knowledgeMapRegistrations = [
  { pack: ishinFiguresPack, presetId: "ishin-network" },
  { pack: wajindenRoutesPack, presetId: "wajinden-comparison", connectionIds: ["ito-archaeology-visits", "nakoku-archaeology-visits"] },
] as const;

export const registeredKnowledgeMapConnections = knowledgeMapRegistrations.flatMap(
  ({ pack, presetId, ...registration }) => registeredPresetConnections(pack, presetId, "connectionIds" in registration ? registration.connectionIds : undefined),
);

const knowledgeMapGroups = {
  "wajinden-routes": registeredPresetConnections(
    wajindenRoutesPack,
    "wajinden-comparison",
    ["wajinden-source-route", "wajinden-kyushu-hypothesis", "wajinden-kinai-hypothesis"],
  ),
} as const;

export function knowledgeMapConnectionsForGroup(groupId?: string) {
  return groupId && groupId in knowledgeMapGroups
    ? knowledgeMapGroups[groupId as keyof typeof knowledgeMapGroups]
    : [];
}
