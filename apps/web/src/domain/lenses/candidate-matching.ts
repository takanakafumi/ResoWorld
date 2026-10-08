import { normalizeLensEntityName } from "@/domain/lens-packs/entity-identity";
import type { ReviewExplorationSuggestion } from "@/domain/review/types";

export type LensNodeEntity = {
  id: string;
  label: string;
  aliases?: string[];
};

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

  // 5. Domain-specific historical bridges
  const targetLower = suggestion.targetName.toLocaleLowerCase("ja");
  const idLower = suggestion.id.toLocaleLowerCase("en-US");

  // Yoshinogari -> northern Kyushu / Yamatai Kyushu hypothesis / Yoshinogari site
  if (targetLower.includes("吉野ヶ里") || idLower.includes("yoshinogari")) {
    const matched = nodes.find((n) =>
      n.id === "northern-kyushu" ||
      n.id === "yoshinogari-site" ||
      n.label.includes("北部九州") ||
      n.label.includes("吉野ヶ里"),
    );
    if (matched) return matched;
  }

  // Toma state location candidates
  if (targetLower.includes("都萬神社") || targetLower.includes("日向")) {
    const matched = nodes.find((n) => n.id === "toma-hyuga" || n.label.includes("日向") || n.label.includes("都萬"));
    if (matched) return matched;
  }
  if (targetLower.includes("八女") || targetLower.includes("筑後")) {
    const matched = nodes.find((n) => n.id === "toma-chikugo" || n.label.includes("筑後") || n.label.includes("八女"));
    if (matched) return matched;
  }
  if (targetLower.includes("鞆") || targetLower.includes("備後")) {
    const matched = nodes.find((n) => n.id === "toma-tomonoura" || n.label.includes("鞆"));
    if (matched) return matched;
  }
  if (targetLower.includes("出雲")) {
    const matched = nodes.find((n) => n.id === "toma-izumo" || n.label.includes("出雲"));
    if (matched) return matched;
  }

  // Yamatai Kinai hypothesis
  if (targetLower.includes("奈良") || targetLower.includes("畿内") || targetLower.includes("大和")) {
    const matched = nodes.find((n) => n.id === "nara-basin" || n.label.includes("奈良") || n.label.includes("畿内"));
    if (matched) return matched;
  }

  // Itoshima / Ito state archaeology
  if (targetLower.includes("平原") || targetLower.includes("三雲") || targetLower.includes("伊都")) {
    const matched = nodes.find((n) =>
      n.id === "ito-state" ||
      n.id === "ito-history-museum" ||
      n.id === "hirabaru-site" ||
      n.id === "mikumo-minamishoji-site" ||
      n.id === "mikumo-ihara-site" ||
      n.label.includes("伊都") ||
      n.label.includes("平原"),
    );
    if (matched) return matched;
  }

  // Na state archaeology
  if (targetLower.includes("須玖") || targetLower.includes("奴国") || targetLower.includes("春日")) {
    const matched = nodes.find((n) =>
      n.id === "na-state" ||
      n.id === "sugu-okamoto-site" ||
      n.id === "nakoku-hill-park" ||
      n.label.includes("奴国") ||
      n.label.includes("須玖"),
    );
    if (matched) return matched;
  }

  // Fumi state / Koshoji kofun / Umi
  if (targetLower.includes("光正寺") || targetLower.includes("宇美") || targetLower.includes("不弥")) {
    const matched = nodes.find((n) =>
      n.id === "fumi-state" ||
      n.id === "koshoji-kofun" ||
      n.id === "umi" ||
      n.id === "umi-hachimangu" ||
      n.label.includes("不弥") ||
      n.label.includes("光正寺") ||
      n.label.includes("宇美"),
    );
    if (matched) return matched;
  }

  // Kashii / Jingu legend
  if (targetLower.includes("香椎") || idLower.includes("kashii")) {
    const matched = nodes.find((n) =>
      n.id === "kashii-gu" ||
      n.id === "kashii-palace" ||
      n.id === "kashii" ||
      n.label.includes("香椎"),
    );
    if (matched) return matched;
  }

  // Munakata / Okinoshima / Ocean rites
  if (targetLower.includes("宗像") || targetLower.includes("沖ノ島") || idLower.includes("munakata") || idLower.includes("okinoshima")) {
    const matched = nodes.find((n) =>
      n.id === "munakata-taisha" ||
      n.id === "munakata-triad" ||
      n.id === "okinoshima" ||
      n.label.includes("宗像") ||
      n.label.includes("沖ノ島"),
    );
    if (matched) return matched;
  }

  // Usa Jingu / Kunisaki Peninsula / Rokugo Manzan
  if (targetLower.includes("宇佐") || targetLower.includes("国東") || targetLower.includes("六郷満山") || idLower.includes("usa") || idLower.includes("kunisaki")) {
    const matched = nodes.find((n) =>
      n.id === "usa-jingu" ||
      n.id === "kunisaki-peninsula" ||
      n.id === "rokugo-manzan" ||
      n.label.includes("宇佐") ||
      n.label.includes("国東") ||
      n.label.includes("六郷"),
    );
    if (matched) return matched;
  }

  // Shikanoshima / Azumi / Marine deities
  if (targetLower.includes("志賀") || targetLower.includes("阿曇") || targetLower.includes("安曇") || idLower.includes("shika")) {
    const matched = nodes.find((n) =>
      n.id === "shikaumi-jinja" ||
      n.id === "shikanoshima" ||
      n.id === "azumi-clan" ||
      n.id === "watatsumi-three-deities" ||
      n.label.includes("志賀") ||
      n.label.includes("阿曇") ||
      n.label.includes("安曇") ||
      n.label.includes("綿津見"),
    );
    if (matched) return matched;
  }

  // Sumiyoshi
  if (targetLower.includes("住吉") || idLower.includes("sumiyoshi")) {
    const matched = nodes.find((n) =>
      n.id === "sumiyoshi-jinja" ||
      n.id === "sumiyoshi-three-deities" ||
      n.id === "chikuzen-sumiyoshi" ||
      n.label.includes("住吉"),
    );
    if (matched) return matched;
  }

  // Asakura / Amaterasu / Onamuchi / Minagi
  if (targetLower.includes("朝倉") || targetLower.includes("美奈宜") || targetLower.includes("大己貴") || idLower.includes("asakura")) {
    const matched = nodes.find((n) =>
      n.id === "asakura-tachibana-palace" ||
      n.id === "onamuchi-jinja" ||
      n.id === "minagi-jinja" ||
      n.label.includes("朝倉") ||
      n.label.includes("美奈宜") ||
      n.label.includes("大己貴"),
    );
    if (matched) return matched;
  }

  // Dazaifu Defense
  if (targetLower.includes("大野城") || targetLower.includes("水城") || targetLower.includes("太宰府") || idLower.includes("dazaifu") || idLower.includes("mizuki")) {
    const matched = nodes.find((n) =>
      n.id === "mizuki-fortress" ||
      n.id === "ono-castle" ||
      n.id === "dazaifu-government-ruins" ||
      n.label.includes("水城") ||
      n.label.includes("大野城") ||
      n.label.includes("太宰府"),
    );
    if (matched) return matched;
  }

  // Bakumatsu figures / Hagi
  if (targetLower.includes("松下村塾") || targetLower.includes("吉田松陰") || idLower.includes("shoin") || idLower.includes("shokasonjuku")) {
    const matched = nodes.find((n) =>
      n.id === "yoshida-shoin" ||
      n.id === "shokasonjuku" ||
      n.label.includes("松下村塾") ||
      n.label.includes("吉田松陰"),
    );
    if (matched) return matched;
  }
  if (targetLower.includes("高杉") || idLower.includes("takasugi")) {
    const matched = nodes.find((n) => n.id === "takasugi-shinsaku" || n.label.includes("高杉"));
    if (matched) return matched;
  }
  if (targetLower.includes("木戸") || targetLower.includes("桂小五郎") || idLower.includes("kido")) {
    const matched = nodes.find((n) => n.id === "kido-takayoshi" || n.label.includes("木戸") || n.label.includes("桂"));
    if (matched) return matched;
  }
  if (targetLower.includes("坂本龍馬") || targetLower.includes("龍馬") || idLower.includes("ryoma")) {
    const matched = nodes.find((n) => n.id === "sakamoto-ryoma" || n.label.includes("坂本") || n.label.includes("龍馬"));
    if (matched) return matched;
  }
  if (targetLower.includes("西郷") || idLower.includes("saigo")) {
    const matched = nodes.find((n) => n.id === "saigo-takamori" || n.label.includes("西郷"));
    if (matched) return matched;
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

  // 4. Domain specific bridges
  const idLower = node.id.toLocaleLowerCase("en-US");
  const labelLower = node.label.toLocaleLowerCase("ja");

  // Munakata / Okinoshima
  if (idLower.includes("munakata") || idLower.includes("okinoshima") || labelLower.includes("宗像") || labelLower.includes("沖ノ島") || labelLower.includes("田心姫") || labelLower.includes("湍津姫") || labelLower.includes("市杵島姫")) {
    const matched = suggestions.find((s) => {
      const sTarget = s.targetName.toLocaleLowerCase("ja");
      const sId = s.id.toLocaleLowerCase("en-US");
      return sTarget.includes("宗像") || sTarget.includes("沖ノ島") || sId.includes("munakata") || sId.includes("okinoshima");
    });
    if (matched) return matched;
  }

  return undefined;
}
