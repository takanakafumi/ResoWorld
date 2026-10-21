const normalizeCache = new Map<string, string>();

export function normalizeLensEntityName(value: string) {
  const cached = normalizeCache.get(value);
  if (cached !== undefined) return cached;
  const normalized = value.normalize("NFKC").toLocaleLowerCase("ja").replace(/[\s・･()（）「」『』\-_/]/g, "");
  normalizeCache.set(value, normalized);
  return normalized;
}

export function lensEntityNamesMatch(left: string, right: string) {
  const normalizedLeft = normalizeLensEntityName(left);
  const normalizedRight = normalizeLensEntityName(right);
  if (normalizedLeft.length < 2 || normalizedRight.length < 2) return false;
  if (normalizedLeft === normalizedRight) return true;

  const shorter = normalizedLeft.length <= normalizedRight.length ? normalizedLeft : normalizedRight;
  const longer = shorter === normalizedLeft ? normalizedRight : normalizedLeft;
  return shorter.length >= 4 && longer.includes(shorter);
}

