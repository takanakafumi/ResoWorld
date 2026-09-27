import ancientDefenseRaw from "@data/knowledge-packs/ancient-defense-network.json";
import ancientHighwaysRaw from "@data/knowledge-packs/ancient-highways-network.json";
import ichinomiyaRaw from "@data/knowledge-packs/ichinomiya-western-network.json";
import shikinaishaRaw from "@data/knowledge-packs/shikinaisha-chikuzen-buzen.json";
import shokaSonjukuRaw from "@data/knowledge-packs/shoka-sonjuku-network.json";
import yayoiArchaeologyRaw from "@data/knowledge-packs/yayoi-archaeology-network.json";
import { LensKnowledgePackSchema, type LensKnowledgePack } from "./schema";

export const shikinaishaChikuzenBuzenPack: LensKnowledgePack = LensKnowledgePackSchema.parse(shikinaishaRaw);
export const ancientDefenseNetworkPack: LensKnowledgePack = LensKnowledgePackSchema.parse(ancientDefenseRaw);
export const ichinomiyaWesternNetworkPack: LensKnowledgePack = LensKnowledgePackSchema.parse(ichinomiyaRaw);
export const shokaSonjukuNetworkPack: LensKnowledgePack = LensKnowledgePackSchema.parse(shokaSonjukuRaw);
export const ancientHighwaysNetworkPack: LensKnowledgePack = LensKnowledgePackSchema.parse(ancientHighwaysRaw);
export const yayoiArchaeologyNetworkPack: LensKnowledgePack = LensKnowledgePackSchema.parse(yayoiArchaeologyRaw);

const loadedPacks: Record<string, LensKnowledgePack> = {
  "shikinaisha-chikuzen-buzen": shikinaishaChikuzenBuzenPack,
  "ancient-defense-network": ancientDefenseNetworkPack,
  "ichinomiya-western-network": ichinomiyaWesternNetworkPack,
  "shoka-sonjuku-network": shokaSonjukuNetworkPack,
  "ancient-highways-network": ancientHighwaysNetworkPack,
  "yayoi-archaeology-network": yayoiArchaeologyNetworkPack,
};

export function getKnowledgePack(packId: string): LensKnowledgePack | null {
  return loadedPacks[packId] ?? null;
}

export function getAllLoadedKnowledgePacks(): LensKnowledgePack[] {
  return Object.values(loadedPacks);
}
