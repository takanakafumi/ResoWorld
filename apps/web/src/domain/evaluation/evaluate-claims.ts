import type { Claim } from "@/domain/knowledge/schema";

type ClaimMatch = {
  goldClaimId: string;
  predictedClaimId: string;
  score: number;
  agreements: {
    claimKind: boolean;
    originType: boolean;
    sourceNature: boolean;
    modality: boolean;
    historicalTime: boolean;
    subject: boolean;
    object: boolean;
  };
};

export type ClaimEvaluation = {
  threshold: number;
  goldCount: number;
  predictedCount: number;
  matchedCount: number;
  recall: number;
  precision: number;
  matches: ClaimMatch[];
  unmatchedGoldClaimIds: string[];
  unmatchedPredictedClaimIds: string[];
  disagreementCounts: Record<keyof ClaimMatch["agreements"], number>;
};

function normalize(value: string) {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase("ja-JP")
    .replace(/[\s\p{P}\p{S}]+/gu, "");
}

function bigrams(value: string) {
  const normalized = normalize(value);
  if (normalized.length < 2) return new Set([normalized]);
  return new Set(
    Array.from({ length: normalized.length - 1 }, (_, index) =>
      normalized.slice(index, index + 2),
    ),
  );
}

function jaccard(left: Set<string>, right: Set<string>) {
  const intersection = [...left].filter((value) => right.has(value)).length;
  const union = new Set([...left, ...right]).size;
  return union === 0 ? 1 : intersection / union;
}

function objectLabel(claim: Claim) {
  return claim.object.kind === "entity"
    ? `${claim.object.entity.type}:${claim.object.entity.name}`
    : `${typeof claim.object.value}:${String(claim.object.value)}`;
}

function evidenceOverlap(left: Claim, right: Claim) {
  let best = 0;
  for (const leftEvidence of left.evidence) {
    for (const rightEvidence of right.evidence) {
      const leftPassage = leftEvidence.passage;
      const rightPassage = rightEvidence.passage;
      if (leftPassage.documentId !== rightPassage.documentId) continue;
      const intersection = Math.max(
        0,
        Math.min(leftPassage.endLine, rightPassage.endLine) -
          Math.max(leftPassage.startLine, rightPassage.startLine) +
          1,
      );
      const union =
        Math.max(leftPassage.endLine, rightPassage.endLine) -
        Math.min(leftPassage.startLine, rightPassage.startLine) +
        1;
      best = Math.max(best, intersection / union);
    }
  }
  return best;
}

function comparableTime(claim: Claim) {
  return JSON.stringify(claim.historicalTime);
}

function scorePair(gold: Claim, predicted: Claim) {
  const statementSimilarity = jaccard(
    bigrams(gold.statement),
    bigrams(predicted.statement),
  );
  const subjectAgreement =
    normalize(`${gold.subject.type}:${gold.subject.name}`) ===
    normalize(`${predicted.subject.type}:${predicted.subject.name}`);
  const objectAgreement =
    normalize(objectLabel(gold)) === normalize(objectLabel(predicted));
  return (
    evidenceOverlap(gold, predicted) * 0.5 +
    statementSimilarity * 0.3 +
    Number(subjectAgreement) * 0.1 +
    Number(objectAgreement) * 0.1
  );
}

export function evaluateClaims(
  goldClaims: Claim[],
  predictedClaims: Claim[],
  threshold = 0.45,
): ClaimEvaluation {
  const candidates = goldClaims.flatMap((gold) =>
    predictedClaims.map((predicted) => ({
      gold,
      predicted,
      score: scorePair(gold, predicted),
    })),
  );
  candidates.sort((left, right) => right.score - left.score);

  const usedGold = new Set<string>();
  const usedPredicted = new Set<string>();
  const matches: ClaimMatch[] = [];

  for (const candidate of candidates) {
    if (candidate.score < threshold) break;
    if (
      usedGold.has(candidate.gold.id) ||
      usedPredicted.has(candidate.predicted.id)
    ) {
      continue;
    }
    usedGold.add(candidate.gold.id);
    usedPredicted.add(candidate.predicted.id);
    matches.push({
      goldClaimId: candidate.gold.id,
      predictedClaimId: candidate.predicted.id,
      score: Number(candidate.score.toFixed(4)),
      agreements: {
        claimKind: candidate.gold.claimKind === candidate.predicted.claimKind,
        originType: candidate.gold.originType === candidate.predicted.originType,
        sourceNature:
          candidate.gold.evidence[0].sourceNature ===
          candidate.predicted.evidence[0].sourceNature,
        modality:
          candidate.gold.epistemic.modality ===
          candidate.predicted.epistemic.modality,
        historicalTime:
          comparableTime(candidate.gold) === comparableTime(candidate.predicted),
        subject:
          normalize(`${candidate.gold.subject.type}:${candidate.gold.subject.name}`) ===
          normalize(
            `${candidate.predicted.subject.type}:${candidate.predicted.subject.name}`,
          ),
        object:
          normalize(objectLabel(candidate.gold)) ===
          normalize(objectLabel(candidate.predicted)),
      },
    });
  }

  const agreementKeys: Array<keyof ClaimMatch["agreements"]> = [
    "claimKind",
    "originType",
    "sourceNature",
    "modality",
    "historicalTime",
    "subject",
    "object",
  ];
  const disagreementCounts = Object.fromEntries(
    agreementKeys.map((key) => [
      key,
      matches.filter((match) => !match.agreements[key]).length,
    ]),
  ) as ClaimEvaluation["disagreementCounts"];

  return {
    threshold,
    goldCount: goldClaims.length,
    predictedCount: predictedClaims.length,
    matchedCount: matches.length,
    recall: goldClaims.length === 0 ? 1 : matches.length / goldClaims.length,
    precision:
      predictedClaims.length === 0 ? 1 : matches.length / predictedClaims.length,
    matches,
    unmatchedGoldClaimIds: goldClaims
      .filter((claim) => !usedGold.has(claim.id))
      .map((claim) => claim.id),
    unmatchedPredictedClaimIds: predictedClaims
      .filter((claim) => !usedPredicted.has(claim.id))
      .map((claim) => claim.id),
    disagreementCounts,
  };
}
