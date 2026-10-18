import type { Claim } from "@/domain/knowledge/schema";
import type { ReviewAtlasSpot, ReviewDataset, ReviewDocument } from "@/domain/review/types";

export interface DocumentSection {
  heading: string;
  level: number;
  startLine: number;
  endLine: number;
  anchorSpot?: {
    id: string;
    name: string;
  };
  isGeneralSection: boolean;
}

export interface OrphanedSectionClaim {
  documentId: string;
  sectionHeading: string;
  startLine: number;
  endLine: number;
  spot: {
    id: string;
    name: string;
  };
  claim: Claim;
}

const GENERAL_HEADING_KEYWORDS = [
  "旅の概要",
  "旅のテーマ",
  "旅のスタイル",
  "旅の整理",
  "移動",
  "一言で",
  "まとめ",
  "見えてきた",
  "問題意識",
  "発見",
  "ハイライト",
  "振り返り",
  "プロローグ",
  "エピローグ",
  "三日間の軌跡",
];

function normalizeTextForMatch(value: string): string {
  return value
    .normalize("NFKC")
    .replace(/[\s・･()（）「」『』\-_/]/g, "")
    .replace(/嚴/g, "厳")
    .toLowerCase();
}

/**
 * 見出しテキストが総括・概要セクションであるかを判定する
 */
export function isGeneralHeading(headingText: string): boolean {
  const norm = normalizeTextForMatch(headingText);
  return GENERAL_HEADING_KEYWORDS.some((kw) =>
    norm.includes(normalizeTextForMatch(kw)),
  );
}

/**
 * 見出しテキストから該当する登録スポットを検出する（長い社名・施設名を優先）
 */
export function matchSpotInHeading(
  headingText: string,
  spots: readonly { id: string; name: string }[],
): { id: string; name: string } | undefined {
  if (isGeneralHeading(headingText)) {
    return undefined;
  }

  const normHeading = normalizeTextForMatch(headingText);
  const sorted = [...spots].sort((a, b) => b.name.length - a.name.length);

  return sorted.find((s) => {
    const normSpot = normalizeTextForMatch(s.name);
    return normSpot.length >= 2 && normHeading.includes(normSpot);
  });
}

/**
 * Markdown文書テキストから章（セクション）の行範囲とアンカースポットを抽出する
 */
export function parseDocumentSections(
  text: string,
  spots: readonly { id: string; name: string }[],
): DocumentSection[] {
  const lines = text.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n").split("\n");
  const rawHeadings: Array<{
    line: number;
    text: string;
    level: number;
    spot?: { id: string; name: string };
    isGeneral: boolean;
  }> = [];

  lines.forEach((l, idx) => {
    const match = /^(#{1,6})\s+(.+)$/.exec(l);
    if (match) {
      const headingText = match[2].trim();
      const spot = matchSpotInHeading(headingText, spots);
      const isGeneral = isGeneralHeading(headingText);
      rawHeadings.push({
        line: idx + 1,
        text: headingText,
        level: match[1].length,
        spot,
        isGeneral,
      });
    }
  });

  if (rawHeadings.length === 0) {
    return [];
  }

  const sections: DocumentSection[] = [];

  for (let i = 0; i < rawHeadings.length; i++) {
    const current = rawHeadings[i];
    let endLine = lines.length;

    // 次の同等以上レベルの見出し、または次のスポット見出しの直前までを行範囲とする
    for (let j = i + 1; j < rawHeadings.length; j++) {
      const next = rawHeadings[j];
      if (next.level <= current.level || next.spot !== undefined) {
        endLine = next.line - 1;
        break;
      }
    }

    sections.push({
      heading: current.text,
      level: current.level,
      startLine: current.line,
      endLine,
      anchorSpot: current.spot,
      isGeneralSection: current.isGeneral,
    });
  }

  return sections;
}

/**
 * Claimが他地域の登録スポット（出雲・三輪等）を直接主語とした比較記述であるかを判定する
 */
function isCrossSiteComparisonClaim(
  claim: Claim,
  anchorSpot: { id: string; name: string },
  allSpots: readonly { id: string; name: string }[],
): boolean {
  if (claim.subject && claim.subject.name) {
    const normSubj = normalizeTextForMatch(claim.subject.name);
    const normAnchor = normalizeTextForMatch(anchorSpot.name);

    if (normSubj !== normAnchor && !normAnchor.includes(normSubj) && !normSubj.includes(normAnchor)) {
      // 主語が別の登録スポット名と一致する場合は、他社比較記述として除外
      const isOtherSpot = allSpots.some((s) => {
        if (s.id === anchorSpot.id) return false;
        const normOther = normalizeTextForMatch(s.name);
        return normOther.length >= 3 && (normSubj === normOther || normSubj.includes(normOther));
      });
      if (isOtherSpot) return true;
    }
  }

  return false;
}

/**
 * データセット全体を監査し、同一章内で抽出されながらメインスポットから脱落しているClaimを検出する
 */
export function auditSectionScopeClaimLinkage(
  dataset: ReviewDataset,
  documentTextGetter: (documentId: string, relativePath?: string) => string | undefined,
): OrphanedSectionClaim[] {
  const atlas = dataset.atlas;
  if (!atlas) return [];

  const spots = atlas.spots;
  const orphaned: OrphanedSectionClaim[] = [];

  for (const doc of dataset.documents) {
    const docMeta = doc as ReviewDocument & { path?: string; sha256?: string };
    const text = documentTextGetter(docMeta.id, docMeta.path);
    if (!text) continue;

    const sections = parseDocumentSections(text, spots);

    for (const section of sections) {
      if (!section.anchorSpot || section.isGeneralSection) continue;

      const spot = spots.find((s) => s.id === section.anchorSpot!.id);
      if (!spot) continue;

      // この章の行範囲内にあるClaimを抽出
      const claimsInSection = dataset.claims.filter((c) => {
        return c.evidence?.some((e) => {
          const pass = e.passage;
          if (!pass) return false;
          const docMatches =
            pass.documentId === docMeta.id ||
            Boolean(docMeta.sha256 && pass.documentSha256 === docMeta.sha256);
          return (
            docMatches &&
            pass.startLine >= section.startLine &&
            pass.endLine <= section.endLine
          );
        });
      });

      for (const claim of claimsInSection) {
        // 他地域への言及・比較Claimは除外
        if (isCrossSiteComparisonClaim(claim, spot, spots)) {
          continue;
        }

        // スポットの claimIds に含まれていないものを検出
        if (!spot.claimIds.includes(claim.id)) {
          orphaned.push({
            documentId: doc.id,
            sectionHeading: section.heading,
            startLine: section.startLine,
            endLine: section.endLine,
            spot: {
              id: spot.id,
              name: spot.name,
            },
            claim,
          });
        }
      }
    }
  }

  return orphaned;
}

/**
 * 章スコープ原則に基づき、脱落しているClaimを訪問スポットへ自動結合する
 */
export function applySectionScopeInheritance(
  dataset: ReviewDataset,
  documentTextGetter: (documentId: string, relativePath?: string) => string | undefined,
): {
  dataset: ReviewDataset;
  linkedCount: number;
  links: Array<{ spotName: string; claimId: string; statement: string }>;
} {
  const orphaned = auditSectionScopeClaimLinkage(dataset, documentTextGetter);
  if (orphaned.length === 0 || !dataset.atlas) {
    return { dataset, linkedCount: 0, links: [] };
  }

  const atlas = dataset.atlas;
  const spotsById = new Map<string, ReviewAtlasSpot>(
    atlas.spots.map((s) => [s.id, { ...s, claimIds: [...s.claimIds] }]),
  );

  const claimsById = new Map<string, Claim>(
    dataset.claims.map((c) => [c.id, { ...c, places: c.places ? [...c.places] : [] }]),
  );

  const links: Array<{ spotName: string; claimId: string; statement: string }> = [];

  for (const item of orphaned) {
    const spot = spotsById.get(item.spot.id);
    const claim = claimsById.get(item.claim.id);

    if (spot && !spot.claimIds.includes(item.claim.id)) {
      spot.claimIds.push(item.claim.id);
      links.push({
        spotName: spot.name,
        claimId: item.claim.id,
        statement: item.claim.statement,
      });
    }

    if (claim) {
      const hasPlace = claim.places?.some((p: { name: string }) => p.name === item.spot.name);
      if (!hasPlace) {
        claim.places = [
          ...(claim.places ?? []),
          {
            entityId: item.spot.id,
            name: item.spot.name,
            role: "observed_place",
          },
        ];
      }
    }
  }

  const updatedDataset: ReviewDataset = {
    ...dataset,
    claims: Array.from(claimsById.values()),
    atlas: {
      ...atlas,
      spots: Array.from(spotsById.values()),
    },
  };

  return {
    dataset: updatedDataset,
    linkedCount: links.length,
    links,
  };
}
