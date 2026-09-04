export function normalizeLensEntityName(value: string) {
  return value.normalize("NFKC").toLocaleLowerCase("ja").replace(/[\s・･()（）「」『』\-_/]/g, "");
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

