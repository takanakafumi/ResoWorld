export type RelationFamilyCategory =
  | "lineage"
  | "conflict"
  | "alliance"
  | "enshrinement"
  | "governance"
  | "spatial"
  | "mentorship"
  | "patronage"
  | "context";

export interface RelationMeta {
  label: string;
  shortLabel: string;
  family: RelationFamilyCategory;
  color: string;
  bg: string;
  border: string;
  strokeDasharray?: string;
  icon: string;
}

const PREDICATE_META_MAP: Record<string, Partial<RelationMeta>> = {
  // 1. Lineage & Genealogy (Gold)
  parent_of: { label: "親 ➔ 子", shortLabel: "親➔子", family: "lineage", color: "#fbbf24", icon: "👑" },
  gives_birth_to: { label: "生成・誕生", shortLabel: "生む", family: "lineage", color: "#fbbf24", icon: "✨" },
  child_of: { label: "子 ➔ 親", shortLabel: "子➔親", family: "lineage", color: "#fbbf24", icon: "👑" },
  descendant_of: { label: "後裔・末裔", shortLabel: "後裔", family: "lineage", color: "#fbbf24", icon: "👑" },
  succession: { label: "皇統・継承", shortLabel: "継承", family: "lineage", color: "#fbbf24", icon: "👑" },
  claimed_origin_of: { label: "始祖・起源主張", shortLabel: "始祖", family: "lineage", color: "#fbbf24", icon: "👑" },
  born_at: { label: "生誕地", shortLabel: "生誕", family: "lineage", color: "#fbbf24", icon: "🌱" },
  buried_at: { label: "墓所・奥津城", shortLabel: "墓所", family: "lineage", color: "#fbbf24", icon: "🪦" },

  // 2. Conflict & Tension (Red, dashed)
  opposed: { label: "対立・交戦", shortLabel: "対立", family: "conflict", color: "#f87171", strokeDasharray: "4 3", icon: "⚔️" },
  confronted: { label: "対峙・抗争", shortLabel: "対峙", family: "conflict", color: "#f87171", strokeDasharray: "4 3", icon: "⚔️" },
  conflicted: { label: "紛争・抗戦", shortLabel: "抗戦", family: "conflict", color: "#f87171", strokeDasharray: "4 3", icon: "⚔️" },
  resisted: { label: "抵抗・拒絶", shortLabel: "抵抗", family: "conflict", color: "#f87171", strokeDasharray: "4 3", icon: "🛡️" },
  competed: { label: "競合・対抗", shortLabel: "競合", family: "conflict", color: "#f87171", strokeDasharray: "4 3", icon: "⚔️" },
  launched_uprising_at: { label: "挙兵・決起地", shortLabel: "挙兵", family: "conflict", color: "#f87171", icon: "🔥" },

  // 3. Alliance & Vow (Aqua / Emerald)
  allied_with: { label: "同盟・盟約", shortLabel: "同盟", family: "alliance", color: "#34d399", icon: "🤝" },
  participates_in: { label: "誓約・契機", shortLabel: "誓約", family: "alliance", color: "#34d399", icon: "🤝" },
  participated_in: { label: "誓約・協調", shortLabel: "誓約", family: "alliance", color: "#34d399", icon: "🤝" },
  cooperated_with: { label: "協力・連携", shortLabel: "協力", family: "alliance", color: "#34d399", icon: "🤝" },
  mediated_and_attested: { label: "調停・誓約見届", shortLabel: "見届", family: "alliance", color: "#34d399", icon: "📜" },
  communicated_with: { label: "通交・接触", shortLabel: "通交", family: "alliance", color: "#34d399", icon: "🕊️" },

  // 4. Enshrinement & Ritual (Purple / Magenta)
  enshrined_at: { label: "祭祀・鎮座", shortLabel: "奉斎", family: "enshrinement", color: "#c084fc", icon: "⛩️" },
  dedicated_to: { label: "奉納・祈願", shortLabel: "奉納", family: "enshrinement", color: "#c084fc", icon: "⛩️" },
  yielded: { label: "国譲り・隠退", shortLabel: "譲歩", family: "enshrinement", color: "#c084fc", icon: "⛩️" },
  consecrated: { label: "神聖視・禁足", shortLabel: "神聖", family: "enshrinement", color: "#c084fc", icon: "✨" },

  // 5. Governance & Diplomatic (Violet)
  ruled: { label: "統治・領有", shortLabel: "統治", family: "governance", color: "#a78bfa", icon: "🏛️" },
  oversaw: { label: "検察・監察", shortLabel: "検察", family: "governance", color: "#a78bfa", icon: "⚖️" },
  stationed_in: { label: "駐留・治所", shortLabel: "治所", family: "governance", color: "#a78bfa", icon: "🏛️" },
  dispatched: { label: "使節派遣", shortLabel: "使節", family: "governance", color: "#a78bfa", icon: "📜" },
  visited_as_envoy: { label: "使節訪問", shortLabel: "使節", family: "governance", color: "#a78bfa", icon: "📜" },
  conferred_title_on: { label: "冊封・金印下賜", shortLabel: "冊封", family: "governance", color: "#a78bfa", icon: "🏅" },
  established_as_ruler: { label: "共立・擁立", shortLabel: "共立", family: "governance", color: "#a78bfa", icon: "👑" },

  // 6. Mentorship & Ideology (Amber)
  educated: { label: "師匠 ➔ 門下生", shortLabel: "師弟", family: "mentorship", color: "#f59e0b", icon: "📖" },
  influenced: { label: "思想的影響", shortLabel: "影響", family: "mentorship", color: "#f59e0b", icon: "💡" },
  led: { label: "主宰・指導", shortLabel: "主宰", family: "mentorship", color: "#f59e0b", icon: "🚩" },

  // 7. Patronage & Construction (Cyan)
  patronized: { label: "庇護・寄進", shortLabel: "庇護", family: "patronage", color: "#38bdf8", icon: "🏛️" },
  funded: { label: "造営・援助", shortLabel: "造営", family: "patronage", color: "#38bdf8", icon: "🏛️" },
  established: { label: "創設・勧請", shortLabel: "創設", family: "patronage", color: "#38bdf8", icon: "🏛️" },
  rebuilt: { label: "再興・再建", shortLabel: "再建", family: "patronage", color: "#38bdf8", icon: "🏛️" },

  // 8. Spatial & Maritime (Sky Blue)
  located_on: { label: "所在・島嶼", shortLabel: "所在", family: "spatial", color: "#67e8f9", icon: "📍" },
  associated_with: { label: "ゆかり・関連", shortLabel: "ゆかり", family: "spatial", color: "#67e8f9", icon: "🔗" },
  used_base_at: { label: "拠点・在留", shortLabel: "拠点", family: "spatial", color: "#67e8f9", icon: "⚓" },
  originated_from: { label: "本源・起源地", shortLabel: "本源", family: "spatial", color: "#67e8f9", icon: "🌊" },
};

export function getRelationMeta(predicate: string, relationFamily?: string): RelationMeta {
  const direct = PREDICATE_META_MAP[predicate];
  if (direct && direct.label && direct.shortLabel && direct.family && direct.color && direct.icon) {
    return {
      label: direct.label,
      shortLabel: direct.shortLabel,
      family: direct.family,
      color: direct.color,
      bg: `color-mix(in srgb, ${direct.color} 16%, transparent)`,
      border: `color-mix(in srgb, ${direct.color} 40%, transparent)`,
      strokeDasharray: direct.strokeDasharray,
      icon: direct.icon,
    };
  }

  // Fallback by relationFamily
  switch (relationFamily) {
    case "lineage":
    case "genealogy":
      return {
        label: "神統・系譜",
        shortLabel: "直系",
        family: "lineage",
        color: "#fbbf24",
        bg: "rgba(251, 191, 36, 0.16)",
        border: "rgba(251, 191, 36, 0.4)",
        icon: "👑",
      };
    case "conflict":
    case "tension":
      return {
        label: "対立・交戦",
        shortLabel: "対立",
        family: "conflict",
        color: "#f87171",
        bg: "rgba(248, 113, 113, 0.16)",
        border: "rgba(248, 113, 113, 0.4)",
        strokeDasharray: "4 3",
        icon: "⚔️",
      };
    case "enshrinement":
    case "ritual":
      return {
        label: "祭祀・奉斎",
        shortLabel: "奉斎",
        family: "enshrinement",
        color: "#c084fc",
        bg: "rgba(192, 132, 252, 0.16)",
        border: "rgba(192, 132, 252, 0.4)",
        icon: "⛩️",
      };
    case "political":
    case "governance":
      return {
        label: "統治・使節",
        shortLabel: "統治",
        family: "governance",
        color: "#a78bfa",
        bg: "rgba(167, 139, 250, 0.16)",
        border: "rgba(167, 139, 250, 0.4)",
        icon: "🏛️",
      };
    case "association":
    case "historical-context":
    default:
      return {
        label: predicate.replace(/_/g, " "),
        shortLabel: "関連",
        family: "context",
        color: "rgba(255, 255, 255, 0.45)",
        bg: "rgba(255, 255, 255, 0.08)",
        border: "rgba(255, 255, 255, 0.2)",
        icon: "🔗",
      };
  }
}

/**
 * 宣言的トピック構造見取り図（Structural Thesis Dictionary）
 * 図を開いた瞬間に、何と何がどういう構造的結論を主張しているのかを1行で提示する。
 */
import {
  TOPIC_STRUCTURAL_GUIDES,
  getTopicStructuralGuide,
  type TopicStructuralGuide,
} from "./structural-guides";

export {
  TOPIC_STRUCTURAL_GUIDES,
  getTopicStructuralGuide,
  type TopicStructuralGuide,
};

export const TOPIC_STRUCTURAL_THESIS: Record<string, string> = new Proxy(
  {},
  {
    get(_target, prop: string) {
      return TOPIC_STRUCTURAL_GUIDES[prop]?.thesis;
    },
    has(_target, prop: string) {
      return prop in TOPIC_STRUCTURAL_GUIDES;
    },
  },
);

export function getTopicStructuralThesis(topic: {
  id: string;
  label?: string;
  description?: string;
  archetypeLabel?: string;
}): string {
  return getTopicStructuralGuide(topic).thesis;
}

/**
 * Historical travel & transit segment notes connecting successive stations in route sequences.
 */
export const ROUTE_TRANSIT_SEGMENTS: Record<string, string> = {
  // 魏志倭人伝
  "gimhae->tsushima": "🌊 渡海 千余里（瀚海を渡る）",
  "tsushima->iki": "🌊 渡海 千余里（大洋を渡る）",
  "iki->karatsu": "🌊 渡海 千余里（末盧初上陸・草木茂盛）",
  "karatsu->itoshima": "🚶 陸行 東南五百里（一大率治所）",
  "itoshima->kasuga-sugu-core": "🚶 陸行 東南百里（二万余戸）",
  "kasuga-sugu-core->umi": "🚶 陸行 東百里（千余戸・水行分岐点）",

  // 神武東征 瀬戸内航路
  "place-mimitsu->place-usa-hitohashira": "⛵ 日向出航・豊後水道北上",
  "place-usa-hitohashira->place-okada-gu": "⛵ 一柱騰宮逗留・関門海峡を越え洞海湾奥へ（筑紫1年）",
  "place-okada-gu->place-takeri-no-miya": "⛵ 瀬戸内海東進・広島湾奥（安芸7年）",
  "place-takeri-no-miya->place-takashima-no-miya": "⛵ 児島湾高島・軍船調達と兵糧蓄積（吉備8年）",
  "place-takashima-no-miya->place-tatetsu-kusaka": "⛵ 草香江上陸・生駒越え（難波激戦）",

  // 神武東征 難波敗退と大和平定
  "place-tatetsu-kusaka->place-kumano-kamikura": "⛵ 大阪湾退却・紀伊半島海路迂回（生駒敗退）",
  "place-kumano-kamikura->place-kashihara-jingu": "🦅 八咫烏先導・吉野山岳踏破・大和橿原即位",

  // 神功皇后 国家遠征サーガ（長門・関門・宇佐）
  "iminomiya-shrine->sumiyoshi-shrine-nagato": "🌊 関門海峡渡海",
  "sumiyoshi-shrine-nagato->kashii-gu": "⛵ 響灘・洞海湾航路",
  "kashii-gu->usa-jingu": "🌊 周防灘航路・国家鎮護祭祀",

  // 神功皇后 筑紫回廊
  "kashii-gu->yamada-saigu": "沙庭託宣・喪期",
  "yamada-saigu->umi-hachimangu": "大遠征・凱旋出産",
  "umi-hachimangu->hakozaki-gu": "胞衣埋納・玄界灘掌握",

  // 海幸山幸 日向沿岸
  "aoshima-shrine->udo-jingu": "日向灘南下・鵜戸海食洞",
  "udo-jingu->miyazaki-jingu": "鵜草葺不合尊・神武宮",

  // 古代官道・国防山城
  "dazaifu-core->ono-castle": "大野城背後防衛線（四王寺山）",
  "ono-castle->mizuki-fortress": "水城堤防遮断線",
  "mizuki-fortress->kii-castle": "基肄城背後防衛線",
};

export function getRouteTransitSegment(fromId: string, toId: string): string | undefined {
  return ROUTE_TRANSIT_SEGMENTS[`${fromId}->${toId}`];
}

