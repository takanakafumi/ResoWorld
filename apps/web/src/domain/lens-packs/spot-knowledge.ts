import type { ReviewAtlasSpot } from "@/domain/review/types";

import { registeredLensKnowledgePacks } from "./knowledge-registry";
import { lensEntityNamesMatch } from "./entity-identity";

const relationFamilyLabels: Record<string, string> = {
  "historical-context": "歴史的文脈",
  association: "関連",
  ritual: "祭礼・行事",
  enshrinement: "祭神・鎮座",
  syncretism: "習合・再構成",
  influence: "影響",
  identification: "比定",
  route: "経路",
};

export type SpotKnowledgeContext = {
  id: string;
  packId: string;
  packLabel: string;
  lensId: string;
  entityId: string;
  entityLabel: string;
  relations: {
    id: string;
    relatedEntityLabel: string;
    relationFamily: string;
    relationLabel: string;
    note?: string;
  }[];
  sources: {
    id: string;
    title: string;
    url?: string;
    publisher?: string;
  }[];
};

export function resolveSpotKnowledgeContexts(spot: ReviewAtlasSpot): SpotKnowledgeContext[] {
  return registeredLensKnowledgePacks.flatMap(({ pack, lensId }) => {
    const entityById = new Map(pack.entities.map((entity) => [entity.id, entity]));
    const sourceById = new Map(pack.sources.map((source) => [source.id, source]));
    return pack.entities.flatMap((entity) => {
      if (![entity.label, ...entity.aliases].some((name) => lensEntityNamesMatch(spot.name, name))) return [];
      const assertions = pack.assertions.filter(
        (assertion) => assertion.subjectId === entity.id || assertion.objectId === entity.id,
      );
      if (assertions.length === 0) return [];
      const sourceIds = [...new Set(assertions.flatMap((assertion) => assertion.sourceIds))];
      return [{
        id: `${pack.id}:${entity.id}`,
        packId: pack.id,
        packLabel: pack.label,
        lensId,
        entityId: entity.id,
        entityLabel: entity.label,
        relations: assertions.map((assertion) => ({
          id: assertion.id,
          relatedEntityLabel: entityById.get(
            assertion.subjectId === entity.id ? assertion.objectId : assertion.subjectId,
          )?.label ?? "関連対象",
          relationFamily: assertion.relationFamily,
          relationLabel: relationFamilyLabels[assertion.relationFamily] ?? "知識上の接続",
          note: assertion.note,
        })),
        sources: sourceIds.flatMap((sourceId) => {
          const source = sourceById.get(sourceId);
          return source ? [{ id: source.id, title: source.title, url: source.url, publisher: source.publisher }] : [];
        }),
      }];
    });
  });
}
