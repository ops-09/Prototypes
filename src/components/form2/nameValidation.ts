import { validateNameFormat } from './nameFormatRules';

export const PERMITTED_LEGAL_ELEMENTS = [
  'INCORPORATED',
  'INCORPORÉE',
  'CORPORATION',
  'INC.',
  'CORP.',
] as const;

/** Shown on field + error-summary when the proposed co-operative name is missing or invalid. */
export const NAME_VALIDATION_ERROR =
  'The co-operative name must include "CO-OPERATIVE" or "COOPÉRATIVE" and end with one of the permitted legal elements — INCORPORATED, INCORPORÉE, CORPORATION, INC., or CORP. Example: GREEN INSTITUTE CO-OPERATIVE INC.';

export const COOPERATIVE_NAME_REQUIRED_ERROR = NAME_VALIDATION_ERROR;

export const SECOND_NUANS_ERROR =
  'Upload the second NUANS report.';

export type NameLanguageOption = 'english' | 'french' | 'combined' | 'separate';

export function isSeparateLanguage(option: NameLanguageOption | '') {
  return option === 'separate';
}

function normalizeName(value: string) {
  return value.trim().replace(/\s+/g, ' ').toUpperCase();
}

function endsWithLegalElement(normalized: string) {
  return PERMITTED_LEGAL_ELEMENTS.some((element) => {
    const needle = element.toUpperCase();
    return (
      normalized === needle ||
      normalized.endsWith(` ${needle}`) ||
      normalized.endsWith(needle)
    );
  });
}

function includesCooperativeWord(normalized: string) {
  return (
    normalized.includes('CO-OPERATIVE') || normalized.includes('COOPÉRATIVE')
  );
}

/** Validates proposed co-operative name per filing story rules. */
export function validateCooperativeName(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) {
    return COOPERATIVE_NAME_REQUIRED_ERROR;
  }

  const formatError = validateNameFormat(trimmed);
  if (formatError) {
    return formatError;
  }

  const normalized = normalizeName(trimmed);
  if (!includesCooperativeWord(normalized) || !endsWithLegalElement(normalized)) {
    return NAME_VALIDATION_ERROR;
  }

  return undefined;
}

export function toBlockCapitals(value: string) {
  return value.toUpperCase();
}

export function isIsoDateComplete(value: string | undefined | null) {
  if (!value) {
    return false;
  }
  // OntarioDateInput may emit YYYY-MM-DD or a full ISO timestamp.
  const dayPart = value.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(dayPart);
}
