import { PERMITTED_LEGAL_ELEMENTS } from '../form1/nameValidation';
import { validateNameFormat } from '../form1/nameFormatRules';

export const CORP_NAME_INFO =
  'The corporation name must includes and ends with one of the permitted legal elements — INCORPORATED, INCORPORÉE, CORPORATION, LIMITED, LIMITÉE, INC., CORP., LTD., or LTÉE.';

export const CORP_NAME_VALIDATION_ERROR =
  'The corporation name must include and end with one of the permitted legal elements — INCORPORATED, INCORPORÉE, CORPORATION, LIMITED, LIMITÉE, INC., CORP., LTD., or LTÉE.';

export const NUMBER_NAME_LEGAL_ELEMENTS = [
  'CORP.',
  'CORPORATION',
  'INC.',
  'INCORPORATED',
  'INCORPORÉE',
  'LIMITED',
  'LIMITÉE',
  'LTD.',
  'LTÉE',
] as const;

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

/** Validates proposed corporation name (word name) per amendment story rules. */
export function validateCorporationName(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) {
    return 'Enter the corporation name.';
  }

  const formatError = validateNameFormat(trimmed);
  if (formatError) {
    return formatError;
  }

  const normalized = normalizeName(trimmed);
  if (!endsWithLegalElement(normalized)) {
    return CORP_NAME_VALIDATION_ERROR;
  }

  return undefined;
}

/** Validates NFP word name — format rules only (no BCA legal-element ending requirement). */
export function validateNfpCorporationName(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) {
    return 'Enter the Not-for-Profit corporation name.';
  }

  return validateNameFormat(trimmed);
}

export function toBlockCapitals(value: string) {
  return value.toUpperCase();
}
