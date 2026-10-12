const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string) {
  return EMAIL_PATTERN.test(email.trim());
}

/** Split pasted or typed input into candidate email strings. */
export function parseEmailCandidates(raw: string): string[] {
  return raw
    .split(/[\s,;]+/)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

export function parseCsvEmailLines(raw: string): string[] {
  return raw
    .split(/\r?\n/)
    .flatMap((line) => parseEmailCandidates(line))
    .map(normalizeEmail)
    .filter((email) => email.length > 0);
}

export type EmailValidationIssue = {
  email: string;
  reason: string;
};

export function validateEmailList(
  candidates: string[],
  existingEmails: string[],
): { valid: string[]; issues: EmailValidationIssue[] } {
  const existingSet = new Set(existingEmails.map(normalizeEmail));
  const seen = new Set<string>();
  const valid: string[] = [];
  const issues: EmailValidationIssue[] = [];

  for (const candidate of candidates) {
    const normalized = normalizeEmail(candidate);

    if (!normalized) {
      continue;
    }

    if (!isValidEmail(normalized)) {
      issues.push({ email: candidate, reason: 'Invalid email format' });
      continue;
    }

    if (seen.has(normalized)) {
      issues.push({ email: normalized, reason: 'Duplicate in this list' });
      continue;
    }

    if (existingSet.has(normalized)) {
      issues.push({ email: normalized, reason: 'Already exists for this business profile' });
      continue;
    }

    seen.add(normalized);
    valid.push(normalized);
  }

  return { valid, issues };
}

export function mergeEmailLists(current: string[], additions: string[]) {
  const merged = [...current];
  const seen = new Set(current.map(normalizeEmail));

  for (const email of additions) {
    const normalized = normalizeEmail(email);
    if (!normalized || seen.has(normalized)) {
      continue;
    }
    seen.add(normalized);
    merged.push(normalized);
  }

  return merged;
}

export function emailListsMatch(listA: string[], listB: string[]) {
  const normalizeList = (list: string[]) =>
    list.map(normalizeEmail).filter((email) => email.length > 0).sort();

  const normalizedA = normalizeList(listA);
  const normalizedB = normalizeList(listB);

  if (normalizedA.length !== normalizedB.length) {
    return false;
  }

  return normalizedA.every((email, index) => email === normalizedB[index]);
}
