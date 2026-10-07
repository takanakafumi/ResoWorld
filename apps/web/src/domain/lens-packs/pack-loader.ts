import ancientDefenseRaw from "@data/knowledge-packs/ancient-defense-network.json";
import ancientHighwaysRaw from "@data/knowledge-packs/ancient-highways-network.json";
import ichinomiyaRaw from "@data/knowledge-packs/ichinomiya-western-network.json";
import shikinaishaRaw from "@data/knowledge-packs/shikinaisha-chikuzen-buzen.json";
import shokaSonjukuRaw from "@data/knowledge-packs/shoka-sonjuku-network.json";
import yayoiArchaeologyRaw from "@data/knowledge-packs/yayoi-archaeology-network.json";
import jinmuToseiRaw from "@data/knowledge-packs/jinmu-tosei-network.json";
import { LensKnowledgePackSchema, type LensKnowledgePack } from "./schema";

export const shikinaishaNetworkPack: LensKnowledgePack = LensKnowledgePackSchema.parse(shikinaishaRaw);
export const shikinaishaChikuzenBuzenPack = shikinaishaNetworkPack;
export const ancientDefenseNetworkPack: LensKnowledgePack = LensKnowledgePackSchema.parse(ancientDefenseRaw);
export const ichinomiyaNetworkPack: LensKnowledgePack = LensKnowledgePackSchema.parse(ichinomiyaRaw);
export const ichinomiyaWesternNetworkPack = ichinomiyaNetworkPack;
export const shokaSonjukuNetworkPack: LensKnowledgePack = LensKnowledgePackSchema.parse(shokaSonjukuRaw);
export const ancientHighwaysNetworkPack: LensKnowledgePack = LensKnowledgePackSchema.parse(ancientHighwaysRaw);
export const yayoiArchaeologyNetworkPack: LensKnowledgePack = LensKnowledgePackSchema.parse(yayoiArchaeologyRaw);
export const jinmuToseiNetworkPack: LensKnowledgePack = LensKnowledgePackSchema.parse(jinmuToseiRaw);

const loadedPacks: Record<string, LensKnowledgePack> = {
  "shikinaisha-chikuzen-buzen": shikinaishaNetworkPack,
  "ancient-defense-network": ancientDefenseNetworkPack,
  "ichinomiya-western-network": ichinomiyaNetworkPack,
  "shoka-sonjuku-network": shokaSonjukuNetworkPack,
  "ancient-highways-network": ancientHighwaysNetworkPack,
  "yayoi-archaeology-network": yayoiArchaeologyNetworkPack,
  "jinmu-tosei-network": jinmuToseiNetworkPack,
};

export function getKnowledgePack(packId: string): LensKnowledgePack | null {
  return loadedPacks[packId] ?? null;
}

export function getAllLoadedKnowledgePacks(): LensKnowledgePack[] {
  return Object.values(loadedPacks);
}
