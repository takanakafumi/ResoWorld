const normalizeCache = new Map<string, string>();
const candidateNamesCache = new Map<string, string[]>();

export function normalizeLensEntityName(value: string) {
  const cached = normalizeCache.get(value);
  if (cached !== undefined) return cached;
  const normalized = value.normalize("NFKC").toLocaleLowerCase("ja").replace(/[\s・･()（）「」『』\-_/]/g, "");
  normalizeCache.set(value, normalized);
  return normalized;
}

export function extractEntityCandidateNames(value: string): string[] {
  const cached = candidateNamesCache.get(value);
  if (cached !== undefined) return cached;

  const trimmed = value.trim();
  const parenMatch = trimmed.match(/^([^（(]+)[（(]([^）)]+)[）)]$/);
  if (!parenMatch) {
    const result = [trimmed];
    candidateNamesCache.set(value, result);
    return result;
  }

  const base = parenMatch[1].trim();
  const subs = parenMatch[2].split(/[・･,、/]/).map((s) => s.trim()).filter((s) => s.length > 0);
  const result = [trimmed, base, ...subs];
  candidateNamesCache.set(value, result);
  return result;
}

function singleNameMatch(left: string, right: string): boolean {
  const normalizedLeft = normalizeLensEntityName(left);
  const normalizedRight = normalizeLensEntityName(right);
  if (normalizedLeft.length < 2 || normalizedRight.length < 2) return false;
  if (normalizedLeft === normalizedRight) return true;

  const shorter = normalizedLeft.length <= normalizedRight.length ? normalizedLeft : normalizedRight;
  const longer = shorter === normalizedLeft ? normalizedRight : normalizedLeft;
  // 短縮名が4文字以上かつ、完全包含される場合。ただし長さに極端な開きがある場合（説明文や長文コンセプト）は除外
  return shorter.length >= 4 && longer.includes(shorter) && longer.length <= shorter.length * 2.5;
}

export function lensEntityNamesMatch(left: string, right: string): boolean {
  if (singleNameMatch(left, right)) return true;

  const leftCandidates = extractEntityCandidateNames(left);
  const rightCandidates = extractEntityCandidateNames(right);
  if (leftCandidates.length === 1 && rightCandidates.length === 1) return false;

  for (const l of leftCandidates) {
    for (const r of rightCandidates) {
      if (l === left && r === right) continue;
      if (singleNameMatch(l, r)) return true;
    }
  }

  return false;
}
