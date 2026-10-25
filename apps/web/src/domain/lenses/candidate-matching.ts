import { lensEntityNamesMatch, normalizeLensEntityName } from "@/domain/lens-packs/entity-identity";
import type { LensExplorationLink } from "@/domain/lens-packs/exploration-links";
import type { ReviewAtlasSpot, ReviewExplorationSuggestion } from "@/domain/review/types";

export type LensNodeEntity = {
  id: string;
  label: string;
  kind?: string;
  aliases?: string[];
};

export const PLACE_LIKE_KINDS = new Set([
  "place",
  "sanctuary",
  "shrine",
  "temple",
  "ruins",
  "location",
  "site",
  "polity",
]);

export function isPlaceLikeKind(kind?: string): boolean {
  if (!kind) return true;
  return PLACE_LIKE_KINDS.has(kind);
}

export type CandidateBridgeRule = {
  patterns: readonly string[];
  targetNodeIds: readonly string[];
};

/**
 * Declarative historical bridges between exploration candidates (places/suggestions)
 * and domain entities/nodes across all LENS packs.
 * Replaces procedural if-chain matching with a single source of truth.
 */
export const CANDIDATE_BRIDGE_RULES: readonly CandidateBridgeRule[] = [
  // 1. Yamatai hypotheses
  { patterns: ["吉野ヶ里", "yoshinogari"], targetNodeIds: ["yoshinogari-site", "northern-kyushu"] },
  { patterns: ["都萬神社", "toma-hyuga"], targetNodeIds: ["toma-hyuga"] },
  { patterns: ["八女", "筑後", "toma-chikugo"], targetNodeIds: ["toma-chikugo"] },
  { patterns: ["鞆", "備後", "toma-tomonoura"], targetNodeIds: ["toma-tomonoura"] },
  { patterns: ["出雲", "toma-izumo"], targetNodeIds: ["toma-izumo"] },
  { patterns: ["奈良", "畿内", "大和", "nara-basin"], targetNodeIds: ["nara-basin"] },

  // 2. Northern Kyushu polities & archaeology
  {
    patterns: ["平原", "三雲", "伊都", "hirabaru", "mikumo", "ito"],
    targetNodeIds: ["ito-history-museum", "hirabaru-site", "mikumo-minamishoji-site", "mikumo-ihara-site", "ito-state"],
  },
  {
    patterns: ["須玖", "奴国", "春日", "sugu"],
    targetNodeIds: ["sugu-okamoto-site", "nakoku-hill-park", "na-state"],
  },
  {
    patterns: ["光正寺", "宇美", "不弥", "koshoji", "umi"],
    targetNodeIds: ["koshoji-kofun", "umi-hachimangu", "umi", "fumi-state"],
  },
  {
    patterns: ["香椎", "kashii"],
    targetNodeIds: ["kashii-palace", "kashii-gu", "kashii"],
  },

  // 3. Religious, shrine, and maritime sanctuaries
  {
    patterns: ["宗像", "沖ノ島", "田心姫", "湍津姫", "市杵島姫", "辺津宮", "中津宮", "沖津宮"],
    targetNodeIds: [
      "munakata-taisha",
      "okinoshima",
      "munakata-triad",
      "munakata-okitsumiya",
      "munakata-nakatsumiya",
      "munakata-hetsumiya",
      "okitsumiya-yohai",
    ],
  },
  {
    patterns: ["宇佐", "国東", "六郷", "八幡総本宮"],
    targetNodeIds: ["usa-jingu", "kunisaki-peninsula", "rokugo-manzan"],
  },
  {
    patterns: ["志賀", "阿曇", "安曇", "綿津見"],
    targetNodeIds: ["shikaumi-jinja", "shikanoshima", "azumi-clan", "watatsumi-three-deities"],
  },
  {
    patterns: ["住吉", "住吉三神"],
    targetNodeIds: ["sumiyoshi-jinja", "sumiyoshi-three-deities", "chikuzen-sumiyoshi"],
  },
  {
    patterns: ["朝倉", "美奈宜", "大己貴", "大三輪"],
    targetNodeIds: ["asakura-tachibana-palace", "onamuchi-jinja", "minagi-jinja"],
  },
  {
    patterns: ["大野城", "水城", "太宰府", "大宰府", "都府楼"],
    targetNodeIds: [
      "mizuki-fortress",
      "ono-castle",
      "dazaifu-government-ruins",
      "place-mizuki",
      "place-ono-jo",
      "polity-dazaifu",
    ],
  },

  // 4. Bakumatsu / Ishin figures & places
  {
    patterns: ["松下村塾", "吉田松陰", "shoin", "shokasonjuku"],
    targetNodeIds: ["shokasonjuku", "yoshida-shoin"],
  },
  { patterns: ["高杉", "takasugi"], targetNodeIds: ["takasugi-shinsaku"] },
  { patterns: ["木戸", "桂", "kido"], targetNodeIds: ["kido-takayoshi"] },
  { patterns: ["坂本", "龍馬", "ryoma"], targetNodeIds: ["sakamoto-ryoma"] },
  { patterns: ["西郷", "saigo"], targetNodeIds: ["saigo-takamori"] },

  // 5. Ancient Chieftains & polities
  {
    patterns: ["岩戸山", "磐井", "八女", "iwatoyama", "iwai"],
    targetNodeIds: ["iwatoyama-kofun", "tsukushi-no-iwai", "tsukushi-clan"],
  },
  {
    patterns: ["阿曇", "安曇", "磯良", "isora", "azumi"],
    targetNodeIds: ["azumi-isora", "azumi-clan", "shikaumi-jinja"],
  },
  {
    patterns: ["筑紫", "chikushi", "chikushino"],
    targetNodeIds: ["chikushi-jinja", "tsukushi-clan"],
  },

  // 6. Genpei & Dannoura figures & maritime sanctuaries
  {
    patterns: ["赤間", "安徳", "akama", "antoku"],
    targetNodeIds: ["akama-shrine", "emperor-antoku"],
  },
  {
    patterns: ["壇ノ浦", "知盛", "教経", "dannoura", "tomomori", "noritsune"],
    targetNodeIds: ["dannoura-battlefield", "battle-of-dannoura", "taira-no-tomomori", "taira-no-noritsune"],
  },
  {
    patterns: ["清盛", "平家", "平氏", "kiyomori", "heike"],
    targetNodeIds: ["taira-no-kiyomori", "heike-clan", "itsukushima-shrine"],
  },
  {
    patterns: ["義経", "源氏", "yoshitsune", "genji"],
    targetNodeIds: ["minamoto-no-yoshitsune", "genji-clan"],
  },
];

/**
 * Matches a selected exploration suggestion to a node entity in any LENS graph or topic.
 */
export function matchLensNodeForCandidate<T extends LensNodeEntity>(
  nodes: readonly T[],
  suggestion?: ReviewExplorationSuggestion,
): T | undefined {
  if (!suggestion) return undefined;

  // 1. Direct match by targetPlaceId
  if (suggestion.targetPlaceId) {
    const direct = nodes.find((n) => n.id === suggestion.targetPlaceId);
    if (direct) return direct;
  }

  // 2. Exact match by label or aliases
  const byName = nodes.find((n) =>
    n.label === suggestion.targetName ||
    (n.aliases && n.aliases.includes(suggestion.targetName)) ||
    normalizeLensEntityName(n.label) === normalizeLensEntityName(suggestion.targetName),
  );
  if (byName) return byName;

  // 3. Substring match
  const bySubstring = nodes.find((n) =>
    suggestion.targetName.includes(n.label) ||
    n.label.includes(suggestion.targetName) ||
    (n.aliases && n.aliases.some((a) => suggestion.targetName.includes(a) || a.includes(suggestion.targetName))),
  );
  if (bySubstring) return bySubstring;

  // 4. Substring ID match
  const byIdInString = nodes.find((n) =>
    suggestion.id.includes(n.id) ||
    (suggestion.targetPlaceId && suggestion.targetPlaceId.includes(n.id)) ||
    n.id.includes(suggestion.id),
  );
  if (byIdInString) return byIdInString;

  // 5. Declarative historical candidate bridges
  const sText = `${suggestion.targetName} ${suggestion.targetPlaceId ?? ""}`.toLocaleLowerCase("ja");
  for (const rule of CANDIDATE_BRIDGE_RULES) {
    if (rule.patterns.some((p) => sText.includes(p.toLocaleLowerCase("ja")))) {
      // Prioritize explicit target node IDs
      for (const targetId of rule.targetNodeIds) {
        const found = nodes.find((n) => n.id === targetId);
        if (found) return found;
      }
      // Fallback: match by label or aliases containment
      const byLabel = nodes.find((n) =>
        rule.patterns.some(
          (p) =>
            n.label.includes(p) ||
            (n.aliases && n.aliases.some((a) => a.includes(p))),
        ),
      );
      if (byLabel) return byLabel;
    }
  }

  return undefined;
}

/**
 * Given a lens node (or entity) and a list of candidates/suggestions,
 * finds the best matching exploration candidate.
 */
export function matchCandidateForLensNode<T extends ReviewExplorationSuggestion>(
  node: LensNodeEntity,
  suggestions: readonly T[],
): T | undefined {
  if (!node || !suggestions || suggestions.length === 0) return undefined;

  // 1. Direct match by suggestion targetPlaceId or id
  const direct = suggestions.find((s) => s.targetPlaceId === node.id || s.id === node.id);
  if (direct) return direct;

  const nodeNames = [node.label, ...(node.aliases ?? [])];

  // 2. Exact match by label or aliases
  const byName = suggestions.find((s) =>
    nodeNames.some(
      (name) =>
        s.targetName === name ||
        normalizeLensEntityName(s.targetName) === normalizeLensEntityName(name),
    ),
  );
  if (byName) return byName;

  // 3. Substring match
  const bySubstring = suggestions.find((s) =>
    nodeNames.some(
      (name) =>
        name.length >= 3 &&
        (s.targetName.includes(name) || name.includes(s.targetName)),
    ),
  );
  if (bySubstring) return bySubstring;

  // 4. Declarative historical candidate bridges
  for (const rule of CANDIDATE_BRIDGE_RULES) {
    const matchesNode =
      rule.targetNodeIds.includes(node.id) ||
      rule.patterns.some(
        (p) =>
          node.label.includes(p) ||
          (node.aliases && node.aliases.some((a) => a.includes(p))),
      );
    if (matchesNode) {
      const found = suggestions.find((s) => {
        const sTarget = `${s.targetName} ${s.targetPlaceId ?? ""}`.toLocaleLowerCase("ja");
        return rule.patterns.some((p) => sTarget.includes(p.toLocaleLowerCase("ja")));
      });
      if (found) return found;
    }
  }

  return undefined;
}

/**
 * Resolves the exact lens node that corresponds to a selected spot.
 * Prioritizes:
 * 1. Direct name / alias identity match with the spot's name.
 * 2. Direct primarySpotId match in explorationLinks.
 * 3. Directly observed spots in explorationLinks (for place nodes only).
 * 4. General spot connections in explorationLinks (for place nodes only).
 */
export function matchLensNodeForSpot<T extends LensNodeEntity>(
  nodes: readonly T[],
  spot?: ReviewAtlasSpot,
  explorationLinks?: Map<string, LensExplorationLink>,
): T | undefined {
  if (!spot) return undefined;

  // 1. Direct identity matching: prioritize place-like nodes for geographic spots
  const byNamePlace = nodes.find((node) =>
    isPlaceLikeKind(node.kind) &&
    [node.label, ...(node.aliases ?? [])].some((name) => lensEntityNamesMatch(spot.name, name)),
  );
  if (byNamePlace) return byNamePlace;

  // 2. Direct identity matching by name or aliases (Exact & Robust)
  const byName = nodes.find((node) =>
    [node.label, ...(node.aliases ?? [])].some((name) => lensEntityNamesMatch(spot.name, name)),
  );
  if (byName) return byName;

  if (explorationLinks) {
    // 2. Direct primarySpotId match
    for (const [nodeId, link] of explorationLinks.entries()) {
      if (link.primarySpotId === spot.id) {
        const node = nodes.find((n) => n.id === nodeId);
        if (node) return node;
      }
    }

    // 3. Direct observed spot match (only for place-like nodes, not persons/concepts)
    for (const [nodeId, link] of explorationLinks.entries()) {
      if (link.observedSpotIds.includes(spot.id)) {
        const node = nodes.find((n) => n.id === nodeId);
        if (node && isPlaceLikeKind(node.kind)) return node;
      }
    }

    // 4. General connected spotIds fallback (only for place-like nodes, not persons/concepts)
    for (const [nodeId, link] of explorationLinks.entries()) {
      if (link.spotIds.includes(spot.id)) {
        const node = nodes.find((n) => n.id === nodeId);
        if (node && isPlaceLikeKind(node.kind)) return node;
      }
    }
  }

  return undefined;
}

/**
 * Resolves the target spot ID on the MAP when a user clicks a lens node in LENS.
 * Implements Plan A & Declarative First (AGENTS.md):
 * 1. Verified primarySpotId from exploration link (declaratively designated by pack authors).
 * 2. Direct name / alias identity match with an existing spot.
 * 3. Exact normalized name match (e.g. eponymous shrines).
 * 4. Observed / connected spot match for place-like entities.
 * 5. Plan A invariant: Persons / concepts / events / groups without primarySpotId or exact spot
 *    return undefined so the map does NOT abruptly pan to an unrelated foreign location.
 */
export function resolveSpotForLensNode(
  node: LensNodeEntity | undefined,
  link: LensExplorationLink | undefined,
  spots: readonly ReviewAtlasSpot[],
): string | undefined {
  if (!node) return undefined;

  // 1. Verified primarySpotId from exploration link (Declarative First: Pack authors designate primary spot)
  if (link?.primarySpotId) {
    const verified = spots.find((s) => s.id === link.primarySpotId);
    if (verified) return verified.id;
  }

  // 2. Direct name / alias identity match with a spot
  const names = [node.label, ...(node.aliases ?? [])];
  const directSpot = spots.find((s) => names.some((n) => lensEntityNamesMatch(s.name, n)));
  if (directSpot) return directSpot.id;

  // 3. Exact normalized name match (e.g. eponymous shrines or exact entities)
  const normLabel = normalizeLensEntityName(node.label);
  const exactNameSpot = spots.find((s) => normalizeLensEntityName(s.name) === normLabel);
  if (exactNameSpot) return exactNameSpot.id;

  // 4. For place-like entities, check observed / connected spots
  if (isPlaceLikeKind(node.kind) && link) {
    if (link.observedSpotIds && link.observedSpotIds.length > 0) {
      // Prioritize name-matching observed spot
      const placeMatch = spots.find(
        (s) => link.observedSpotIds.includes(s.id) && names.some((n) => lensEntityNamesMatch(s.name, n)),
      );
      if (placeMatch) return placeMatch.id;

      // Fallback to first observed spot for purely place-like nodes
      const firstObserved = spots.find((s) => s.id === link.observedSpotIds[0]);
      if (firstObserved) return firstObserved.id;
    }

    if (link.spotIds && link.spotIds.length > 0) {
      const placeMatch = spots.find(
        (s) => link.spotIds.includes(s.id) && names.some((n) => lensEntityNamesMatch(s.name, n)),
      );
      if (placeMatch) return placeMatch.id;

      // Fallback to first connected spot for purely place-like nodes
      const firstConnected = spots.find((s) => s.id === link.spotIds[0]);
      if (firstConnected) return firstConnected.id;
    }
  }

  // Plan A invariant: Return undefined for Person / Concept / Event / Group nodes without own spot or primarySpotId.
  return undefined;
}
