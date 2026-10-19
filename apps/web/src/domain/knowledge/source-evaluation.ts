import { z } from "zod";

/**
 * 史料の性格分類（Source Category: A〜D）
 * - A: 古代基礎史料・考古物証（記紀・風土記・万葉集・延喜式・六国史・木簡・発掘報告書）
 * - B: 後世編纂・社伝・系図・古文書（中世〜近世の社伝・縁起・家伝文書・地誌）
 * - C: 古史古伝・要検証文献（ホツマツタヱ・竹内文書・宮下文書・東日流外三郡誌・鞍ヶ根風土記等）
 * - D: 現代の研究書・自治体史・公的解説
 */
export const SourceCategorySchema = z.enum(["A", "B", "C", "D"]);
export type SourceCategory = z.infer<typeof SourceCategorySchema>;

/**
 * 記述ごとの確度区分（Certainty Tier: A〜D）
 * - A: 独立した複数根拠・考古物証・同時代一次史料で確認できる事実
 * - B: 文献・社伝・伝承にその記述が存在すること自体は確認できる（記述の存在確認）
 * - C: 根拠を持つ仮説・解釈（反証条件や代替説明を伴う学説・探索仮説）
 * - D: 未検証の主張・単独伝承
 */
export const CertaintyTierSchema = z.enum(["A", "B", "C", "D"]);
export type CertaintyTier = z.infer<typeof CertaintyTierSchema>;

export const SOURCE_CATEGORY_META: Record<
  SourceCategory,
  { code: SourceCategory; shortLabel: string; label: string; description: string }
> = {
  A: {
    code: "A",
    shortLabel: "史料A: 古代基礎・考古",
    label: "古代基礎史料・考古物証",
    description: "記紀・風土記・延喜式・六国史・木簡等の古代基礎文献、および発掘調査報告等の考古物証",
  },
  B: {
    code: "B",
    shortLabel: "史料B: 社伝・後世編纂",
    label: "後世編纂・社伝・系図・古文書",
    description: "中世〜近世の神社縁起・由緒書、氏族系図、地誌、家伝文書（中近世の信仰再編・受容史の史料）",
  },
  C: {
    code: "C",
    shortLabel: "史料C: 要検証文献・古史古伝",
    label: "古史古伝・要検証文献",
    description: "近世〜近代以降に現れた独自神統譜・超古代伝承文献（古代史実へ直結させず思想史・比較対象として記録）",
  },
  D: {
    code: "D",
    shortLabel: "史料D: 現代研究・公的解説",
    label: "現代の研究書・自治体史・公的解説",
    description: "現代の歴史学・考古学・神話学の研究論文、自治体史、博物館・文化財の公的解説資料",
  },
};

export const CERTAINTY_TIER_META: Record<
  CertaintyTier,
  { code: CertaintyTier; shortLabel: string; label: string; description: string }
> = {
  A: {
    code: "A",
    shortLabel: "確度A: 独立根拠",
    label: "独立根拠による確認",
    description: "考古遺構・遺物、または同時代の複数一次史料によって独立に裏付けられる事実",
  },
  B: {
    code: "B",
    shortLabel: "確度B: 記述確認",
    label: "記述・伝承の存在確認",
    description: "特定の文献・社伝・伝承に「そう記されている」こと自体は確認できる記述",
  },
  C: {
    code: "C",
    shortLabel: "確度C: 根拠仮説",
    label: "根拠を持つ仮説・解釈",
    description: "地形・分布・史料比較等に基づく研究上の学説、または反証条件・代替説明を伴う構造仮説",
  },
  D: {
    code: "D",
    shortLabel: "確度D: 未検証",
    label: "未検証の主張・単独伝承",
    description: "現時点で一次資料や独立根拠が未確認の主張、または検証を要する単独伝承",
  },
};

/**
 * 史料の3つの年代の分離（Three-Way Chronology）
 * 1. compilationEra: 作品の成立年代（いつ編纂・執筆されたか）
 * 2. extantManuscriptEra: 現存資料の年代（現存最古の写本・刊本がいつのものか）
 * 3. targetEra: 記述対象の年代（いつの出来事・祭祀を語っているか）
 */
export const SourceChronologySchema = z.object({
  compilationEra: z.string().trim().min(1).optional(),
  extantManuscriptEra: z.string().trim().min(1).optional(),
  targetEra: z.string().trim().min(1).optional(),
});
export type SourceChronology = z.infer<typeof SourceChronologySchema>;

/**
 * 知識パックの4分類体系（Knowledge Pack Category）
 */
export const KnowledgePackCategorySchema = z.enum([
  "source-pack",
  "regional-pack",
  "genealogy-pack",
  "sacred-landscape-pack",
]);
export type KnowledgePackCategory = z.infer<typeof KnowledgePackCategorySchema>;

export const KNOWLEDGE_PACK_CATEGORY_LABELS: Record<KnowledgePackCategory, string> = {
  "source-pack": "① 史料パック",
  "regional-pack": "② 地域パック",
  "genealogy-pack": "③ 系譜・伝承パック",
  "sacred-landscape-pack": "④ 祭祀景観パック",
};

/**
 * 地域間比較の6観点（Cross-Regional Comparison 6 Viewpoints）
 */
export const RegionalComparisonEntrySchema = z.object({
  id: z.string().trim().min(1),
  title: z.string().trim().min(1),
  regions: z.array(z.string().trim().min(1)).min(2),
  commonality: z.string().trim().min(1),
  difference: z.string().trim().min(1),
  chronology: z.string().trim().min(1),
  contactPossibility: z.string().trim().min(1),
  independence: z.string().trim().min(1),
  alternativeExplanation: z.string().trim().min(1),
});
export type RegionalComparisonEntry = z.infer<typeof RegionalComparisonEntrySchema>;

/**
 * 史料種別横断の異伝・史料層比較（Source Stratum Comparison: 史料A vs 史料B vs 史料C）
 * 正史・考古物証（A）と社伝・中近世縁起（B）および古史古伝・要検証文献（C）を混同せず対比する構造
 */
export const SourceTraditionComparisonEntrySchema = z.object({
  id: z.string().trim().min(1),
  title: z.string().trim().min(1),
  targetTheme: z.string().trim().min(1),
  categoryABedrock: z.object({
    sources: z.string().trim().min(1),
    statement: z.string().trim().min(1),
    certaintyTier: CertaintyTierSchema,
  }),
  categoryBTradition: z.object({
    sources: z.string().trim().min(1),
    statement: z.string().trim().min(1),
    certaintyTier: CertaintyTierSchema,
  }),
  categoryCContested: z.object({
    sources: z.string().trim().min(1),
    statement: z.string().trim().min(1),
    certaintyTier: CertaintyTierSchema,
  }),
  handlingPrinciple: z.string().trim().min(1),
});
export type SourceTraditionComparisonEntry = z.infer<
  typeof SourceTraditionComparisonEntrySchema
>;

/**
 * 神社・聖地の祭祀史7項目（Sacred Site Stratigraphy Profile）
 */
export const SacredSiteStratigraphyProfileSchema = z.object({
  id: z.string().trim().min(1),
  primarySpotIds: z.array(z.string().trim().min(1)).optional(),
  primarySpotId: z.string().trim().min(1).optional(),
  primarySpotNames: z.array(z.string().trim().min(1)).optional(),
  targetSpotIds: z.array(z.string().trim().min(1)).optional(),
  targetRegion: z.string().trim().min(1).optional(),
  spotNames: z.array(z.string().trim().min(1)).min(1),
  title: z.string().trim().min(1),
  summary: z.string().trim().min(1),
  /** ① 現在の祭神 */
  currentDeities: z.string().trim().min(1),
  /** ② 由緒が主張する創建・起源（社伝・縁起・要検証文献等の主張） */
  claimedOrigin: z.object({
    statement: z.string().trim().min(1),
    sourceTitle: z.string().trim().min(1),
    sourceCategory: SourceCategorySchema,
    certaintyTier: CertaintyTierSchema,
    chronology: SourceChronologySchema.optional(),
  }),
  /** ③ 祭祀が確認できる最古史料（風土記・六国史・延喜式・木簡等） */
  oldestAttestedRecord: z.object({
    statement: z.string().trim().min(1),
    sourceTitle: z.string().trim().min(1),
    sourceCategory: SourceCategorySchema,
    certaintyTier: CertaintyTierSchema,
    chronology: SourceChronologySchema,
  }),
  /** ④ 現在地での祭祀が確認できる最古記録（旧鎮座地との区別） */
  oldestCurrentSiteRecord: z.object({
    statement: z.string().trim().min(1),
    certaintyTier: CertaintyTierSchema,
  }),
  /** ⑤ 遷座・合祀・祭神変更・神仏習合・明治再編の履歴 */
  reorganizationHistory: z
    .array(
      z.object({
        era: z.string().trim().min(1),
        description: z.string().trim().min(1),
        certaintyTier: CertaintyTierSchema,
      }),
    )
    .min(1),
  /** ⑥ 関連遺跡・古墳・自然祭祀対象（磐座・神体山・島・湧水等） */
  archaeologyAndNaturalTarget: z.object({
    statement: z.string().trim().min(1),
    features: z.array(z.string().trim().min(1)).min(1),
    certaintyTier: CertaintyTierSchema,
  }),
  /** ⑦ 関与した氏族・政治権力・交通路 */
  clanAndRouteContext: z.object({
    clans: z.array(z.string().trim().min(1)).min(1),
    routeAndPoliticalContext: z.string().trim().min(1),
    certaintyTier: CertaintyTierSchema,
  }),
});
export type SacredSiteStratigraphyProfile = z.infer<typeof SacredSiteStratigraphyProfileSchema>;

const ANCIENT_PRIMARY_PATTERNS = [
  /古事記/,
  /日本書紀/,
  /風土記/,
  /延喜式/,
  /万葉集/,
  /続日本紀/,
  /日本後紀/,
  /続日本後紀/,
  /日本文徳天皇実録/,
  /日本三代実録/,
  /六国史/,
  /先代旧事本紀/,
  /新撰姓氏録/,
  /倭名類聚抄/,
  /魏志倭人伝/,
  /三国志/,
  /後漢書/,
  /宋書/,
  /隋書/,
  /木簡/,
  /金石文/,
  /発掘調査/,
];

const KOSHIKODEN_PATTERNS = [
  /ホツマツタヱ/,
  /ホツマ/,
  /竹内文書/,
  /上記/,
  /ウエツフミ/,
  /宮下文書/,
  /東日流外三郡誌/,
  /鞍ヶ根風土記/,
  /カタカムナ/,
];

const SHADEN_LATER_PATTERNS = [
  /社伝/,
  /由緒/,
  /縁起/,
  /九鬼文書/,
  /但馬故事記/,
  /家伝/,
  /系図/,
  /風土記\(近世\)/,
];

/**
 * LensSource（またはSource）から史料の性格分類（A〜D）を決定論的に導出する後方互換関数
 */
export function deriveSourceCategoryFromLensSource(source: {
  sourceCategory?: SourceCategory;
  kind?: string;
  title: string;
  note?: string;
}): SourceCategory {
  if (source.sourceCategory) {
    return source.sourceCategory;
  }
  const combined = `${source.title} ${source.note ?? ""}`;
  if (KOSHIKODEN_PATTERNS.some((pattern) => pattern.test(combined))) {
    return "C";
  }
  if (ANCIENT_PRIMARY_PATTERNS.some((pattern) => pattern.test(combined))) {
    return "A";
  }
  if (SHADEN_LATER_PATTERNS.some((pattern) => pattern.test(combined))) {
    return "B";
  }
  if (source.kind === "classical-text") {
    return "A";
  }
  if (source.kind === "research-publication" || source.kind === "modern-reference") {
    return "D";
  }
  return "D";
}

/**
 * LensAssertion から記述ごとの確度区分（A〜D）を決定論的に導出する後方互換関数
 */
export function deriveCertaintyTierFromLensAssertion(assertion: {
  certaintyTier?: CertaintyTier;
  nature: string;
  evidenceBasis?: string;
  confidence?: string;
  reviewStatus?: string;
}): CertaintyTier {
  if (assertion.certaintyTier) {
    return assertion.certaintyTier;
  }
  if (
    assertion.nature === "scholarly-hypothesis" ||
    assertion.nature === "interpretive-model" ||
    assertion.nature === "user-model" ||
    assertion.evidenceBasis === "scholarly-analysis" ||
    assertion.confidence === "disputed"
  ) {
    return "C";
  }
  if (assertion.evidenceBasis === "institutional-tradition") {
    return "B";
  }
  if (assertion.nature === "source-statement") {
    return "B";
  }
  if (
    assertion.nature === "reviewed-reference" &&
    (assertion.evidenceBasis === "contemporary-record" ||
      assertion.evidenceBasis === "modern-documentation") &&
    assertion.confidence === "high"
  ) {
    return "A";
  }
  if (assertion.reviewStatus === "reviewed" && assertion.confidence === "high") {
    return "A";
  }
  if (assertion.confidence === "low") {
    return "C";
  }
  return "B";
}

/**
 * Exploration Claim から記述ごとの確度区分（A〜D）を決定論的に導出する後方互換関数
 */
export function deriveCertaintyTierFromClaim(claim: {
  certaintyTier?: CertaintyTier;
  claimKind: string;
  epistemic?: { verification?: string; modality?: string };
  evidence?: readonly { sourceNature?: string }[];
}): CertaintyTier {
  if (claim.certaintyTier) {
    return claim.certaintyTier;
  }
  const natures = new Set((claim.evidence ?? []).map((e) => e.sourceNature));
  if (
    claim.claimKind === "hypothesis" ||
    claim.claimKind === "synthesis" ||
    claim.claimKind === "question" ||
    claim.claimKind === "suggestion" ||
    claim.epistemic?.modality === "hypothetical" ||
    claim.epistemic?.modality === "interpretive" ||
    natures.has("UserHypothesis") ||
    natures.has("Alternative")
  ) {
    return "C";
  }
  if (natures.has("AISuggestion") || claim.epistemic?.verification === "unverified") {
    return "D";
  }
  if (natures.has("Archaeology") || claim.claimKind === "observation") {
    return "A";
  }
  if (natures.has("Tradition") || natures.has("HistoricalSource")) {
    return "B";
  }
  return "B";
}
