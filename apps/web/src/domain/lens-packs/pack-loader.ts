import ancientDefenseRaw from "@data/knowledge-packs/ancient-defense-network.json";
import ichinomiyaRaw from "@data/knowledge-packs/ichinomiya-western-network.json";
import shikinaishaRaw from "@data/knowledge-packs/shikinaisha-chikuzen-buzen.json";
import { LensKnowledgePackSchema, type LensKnowledgePack } from "./schema";

export const shikinaishaChikuzenBuzenPack: LensKnowledgePack = LensKnowledgePackSchema.parse(shikinaishaRaw);
export const ancientDefenseNetworkPack: LensKnowledgePack = LensKnowledgePackSchema.parse(ancientDefenseRaw);
export const ichinomiyaWesternNetworkPack: LensKnowledgePack = LensKnowledgePackSchema.parse(ichinomiyaRaw);

const loadedPacks: Record<string, LensKnowledgePack> = {
  "shikinaisha-chikuzen-buzen": shikinaishaChikuzenBuzenPack,
  "ancient-defense-network": ancientDefenseNetworkPack,
  "ichinomiya-western-network": ichinomiyaWesternNetworkPack,
};

export function getKnowledgePack(packId: string): LensKnowledgePack | null {
  return loadedPacks[packId] ?? null;
}

export function getAllLoadedKnowledgePacks(): LensKnowledgePack[] {
  return Object.values(loadedPacks);
}
