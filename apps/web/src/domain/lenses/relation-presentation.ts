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
export const TOPIC_STRUCTURAL_THESIS: Record<string, string> = {
  // 神話・系譜
  "munakata-genealogy": "天照と須佐之男の誓約から、皇統（天忍穂耳命）と海上航路守護（宗像三女神）が二大支柱として分立した神統系譜",
  "jinmu-yamato-conquest-preset": "日向出航から瀬戸内海軍事・祭祀拠点を経て大和橿原での初代天皇即位に至る王権創始系譜",
  "jinmu-setouchi-route-preset": "日向から筑紫・岡田宮、安芸・多祁理宮、吉備・高島宮を経て浪速・熊野へ至る瀬戸内海路の東征回廊",
  "marine-deities-preset": "イザナギの禊から生まれた住吉三神・綿津見三神と宗像三女神が連動する古代海洋祭祀神統譜",
  "hyuga-mythology-preset": "高千穂天孫降臨からホオリ・ウガヤフキアエズを経て神武へ至る日向三代の神統系譜",
  "hyuga-umiyamasachi-route": "青島から鵜戸神宮・宮崎神宮を結ぶ、綿津見宮帰還と御降誕伝承の日南海岸神話回廊",
  "izumo-kunitsukami-preset": "高天原の使者派遣に対し、事代主の服従と建御名方の抵抗を経て出雲大社奉斎に至る天津神・国津神の国譲り対立決着構造",
  "izumo-kunitsukami-corridor": "出雲大社を中枢核とし、筑前朝倉・安芸厳島・大和三輪山を結ぶ大己貴命（大国主）信仰の西日本祭祀トポロジー",
  "jingu-kogo-legend-preset": "橿日宮崩御から山田邑斎宮の神託、宇美八幡降誕、筥崎宮胞衣埋納に至る筑紫母子神降誕回廊",
  "jingu-kanmon-usa-preset": "長門豊浦宮・下関から橿日宮、八幡総本宮・宇佐神宮を結ぶ西海道・関門海峡国家遠征回廊",

  // 宗教・信仰空間
  "religion-history": "古代山岳自然崇拝から仏教公伝・神仏習合を経て明治神仏分離に至る日本の宗教思想重層史",
  "religion-syncretism": "宇佐神宮・八幡大菩薩を核とし、神祇と仏教が相互に救済・一体化した神仏習合トポロジー",
  "religion-concepts": "神体山・磐座のアニミズムから御霊信仰・修験道に至る宗教概念の展開構造",
  "archaic-local-shrines": "弥生集落・環濠遺跡の地祇祭祀が式内社・郷土神社へと連続・定着した古層祭祀構造",
  "miyajima-sacred-relations": "弥山山頂巨石信仰を核とし、平清盛の庇護による厳島海上社殿造営と三鬼権現修験が融合した信仰系譜",
  "miyajima-current-paths": "嚴島神社から多宝塔・大聖院を経て弥山山頂巨岩・奥宮へ登拝する霊山回廊",
  "miyajima-patronage-and-space": "厳島神社を中心核として平氏政権の西国制覇と瀬戸内海制海権が結びついた外縁トポロジー",
  "munakata-three-shrines": "本土（辺津宮）から大島（中津宮）を経て絶海（沖ノ島・沖津宮）へ一直線に深まる神域深度トポロジー",
  "shikinaisha-network-preset": "延喜式神名帳（927年）に基づく名神大社・小社の官社格式と令制国祭祀秩序",
  "ichinomiya-western-preset": "筑前・筑後・豊前・長門・安芸の各国一宮が形成する令制国地域祭祀ネットワーク",

  // ルート・政治・社会
  "wajinden-route-comparison": "帯方郡から狗邪韓国・対馬・壱岐・末盧・伊都・奴・不弥を経て邪馬台国に至る距離・日程の行程対比",
  "asakura-yamatai-context": "筑後川流域の朝倉地名群と大和盆地地名群の一致から邪馬台国東遷を論証する地名仮説マトリクス",
  "yamatai-politics": "卑弥呼の共立、魏への遣使朝貢、一大率による諸国検察が織りなす邪馬台国連合の統治相関網",
  "ancient-highways-preset": "大宰府を中枢とし、山陽道・西海道の駅家（うまや）と古代官道が結ぶ国家交通回廊",
  "yayoi-archaeology-preset": "吉野ヶ里・板付・須玖岡本などの拠点集落から首長墓群が形成された弥生社会構造",
  "asakura-social-structure": "朝倉地域の水利遺構（三連水車）と条里制・古代集落が織りなす地域生産構造",
  "hagi-domain-politics": "長州藩毛利家を核とし、村田清風の天保改革から松陰の思想、海防強化へ展開した藩政構造",
  "dazaifu-defense-preset": "白村江大敗（663年）を契機とする、水城・大野城・基肄城・金田城による大宰府防衛山城ネットワーク",
  "ishin-figures-network": "吉田松陰の教えを源流とし、高杉晋作・木戸孝允・久坂玄瑞が幕府と対峙した維新志士相関網",
  "shoka-sonjuku-action-preset": "松下村塾での講義から下田踏切、野山獄、尊王攘夷運動の実践へと至る門下生行動回廊",
  "ancient-chieftains-network": "筑紫君磐井とヤマト王権の対立（527年磐井の乱）から八女古墳群の築造に至る古代豪族首長網",
  "genpei-dannoura-network": "平家一門の西走から壇ノ浦決戦、安徳天皇入水と赤間神宮奉斎に至る源平決戦相関網",
};

export function getTopicStructuralThesis(topic: {
  id: string;
  label?: string;
  description?: string;
  archetypeLabel?: string;
}): string {
  if (TOPIC_STRUCTURAL_THESIS[topic.id]) {
    return TOPIC_STRUCTURAL_THESIS[topic.id]!;
  }
  if (topic.description) {
    return topic.description;
  }
  return `${topic.label ?? "トピック"}の構造と関係性の配置`;
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

