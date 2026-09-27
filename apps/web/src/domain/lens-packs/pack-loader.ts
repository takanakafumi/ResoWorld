import ancientDefenseRaw from "@data/knowledge-packs/ancient-defense-network.json";
import shikinaishaRaw from "@data/knowledge-packs/shikinaisha-chikuzen-buzen.json";
import { LensKnowledgePackSchema, type LensKnowledgePack } from "./schema";

export const shikinaishaChikuzenBuzenPack: LensKnowledgePack = LensKnowledgePackSchema.parse(shikinaishaRaw);
export const ancientDefenseNetworkPack: LensKnowledgePack = LensKnowledgePackSchema.parse(ancientDefenseRaw);

const loadedPacks: Record<string, LensKnowledgePack> = {
  "shikinaisha-chikuzen-buzen": shikinaishaChikuzenBuzenPack,
  "ancient-defense-network": ancientDefenseNetworkPack,
};

export function getKnowledgePack(packId: string): LensKnowledgePack | null {
  return loadedPacks[packId] ?? null;
}

export function getAllLoadedKnowledgePacks(): LensKnowledgePack[] {
  return Object.values(loadedPacks);
}
