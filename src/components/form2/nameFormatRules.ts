/** Shared name format rules from Form 7 amendment business rules. */

export const NAME_TOO_LONG_ERROR = 'A name must not be longer than 120 characters (including spaces).';
export const NAME_DOUBLE_SPACE_ERROR = 'A name must not contain two or more spaces in sequence.';
export const NAME_SPECIAL_CHARS_ERROR =
  'A name must not contain more than 50% special characters.';

const LETTER_OR_DIGIT = /[\p{L}\p{N}]/u;

/**
 * Validates length, consecutive spaces, and special-character ratio.
 * Returns the first matching error, or undefined when the name passes format rules.
 */
export function validateNameFormat(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  if (trimmed.length > 120) {
    return NAME_TOO_LONG_ERROR;
  }

  if (/\s{2,}/.test(trimmed)) {
    return NAME_DOUBLE_SPACE_ERROR;
  }

  const chars = Array.from(trimmed);
  if (chars.length === 0) {
    return undefined;
  }

  const specialCount = chars.filter((char) => !LETTER_OR_DIGIT.test(char) && char !== ' ').length;
  if (specialCount / chars.length > 0.5) {
    return NAME_SPECIAL_CHARS_ERROR;
  }

  return undefined;
}
