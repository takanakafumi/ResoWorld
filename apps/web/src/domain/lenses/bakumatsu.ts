import type { Claim } from "@/domain/knowledge/schema";

export type BakumatsuThread = {
  id: "education" | "industry" | "politics" | "time-bridge";
  index: string;
  label: string;
  description: string;
  claimIds: string[];
};

const definitions = [
  { id: "education", index: "01", label: "教育・思想", description: "藩校や学びの場から、人物と行動の背景を見る。", pattern: /明倫館|藩校|教育|学び/ },
  { id: "industry", index: "02", label: "産業・技術", description: "反射炉と造船所跡から、近代化を試みた現場を見る。", pattern: /反射炉|造船|産業|技術|近代化/ },
  { id: "politics", index: "03", label: "政治・人物", description: "幕末を人物・政治運動・地域の記憶としてたどる。", pattern: /幕末|高杉晋作|長州|維新|政治/ },
  { id: "time-bridge", index: "04", label: "時代の橋", description: "戦国期から幕末まで、旅の中で接続された時間幅を見る。", pattern: /1551|約300年|戦国|大寧寺|時代.*横断|時間.*接続/ },
] as const;

function searchableText(claim: Claim) {
  return [
    claim.statement,
    claim.subject.name,
    claim.object.kind === "entity" ? claim.object.entity.name : String(claim.object.value),
    claim.historicalTime?.label ?? "",
    ...claim.places.map((place) => place.name),
  ].join(" ");
}

export function buildBakumatsuThreads(claims: Claim[]): BakumatsuThread[] {
  return definitions.map((definition) => {
    const matched = claims.filter((claim) => definition.pattern.test(searchableText(claim)));
    return {
      id: definition.id,
      index: definition.index,
      label: definition.label,
      description: definition.description,
      claimIds: matched.map((claim) => claim.id),
    };
  }).filter((thread) => thread.claimIds.length > 0);
}

export function hasBakumatsuLensMaterial(claims: Claim[]) {
  return buildBakumatsuThreads(claims).length >= 2;
}
