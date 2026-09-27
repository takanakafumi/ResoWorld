import shikinaishaRaw from "@data/knowledge-packs/shikinaisha-chikuzen-buzen.json";
import { LensKnowledgePackSchema, type LensKnowledgePack } from "./schema";

export const shikinaishaChikuzenBuzenPack: LensKnowledgePack = LensKnowledgePackSchema.parse(shikinaishaRaw);

const loadedPacks: Record<string, LensKnowledgePack> = {
  "shikinaisha-chikuzen-buzen": shikinaishaChikuzenBuzenPack,
};

export function getKnowledgePack(packId: string): LensKnowledgePack | null {
  return loadedPacks[packId] ?? null;
}

export function getAllLoadedKnowledgePacks(): LensKnowledgePack[] {
  return Object.values(loadedPacks);
}
