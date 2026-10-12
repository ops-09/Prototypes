/** Example NAICS entries for Form 7 autosuggest (demo data — child-related samples). */
export type NaicsExample = {
  code: string;
  description: string;
};

export const NAICS_EXAMPLE_CODES: readonly NaicsExample[] = [
  { code: '4521', description: 'Department stores' },
  { code: '44813', description: "Children's and Infants' Clothing Stores" },
  { code: '448130', description: "Children's and Infants' Clothing Stores" },
  { code: '62411', description: 'Child and Youth Services' },
  { code: '624410', description: 'Child day-care services' },
  { code: '621990', description: 'All Other Ambulatory Health Care Services' },
  { code: '6239', description: 'Other Residential Care Facilities' },
  { code: '623992', description: 'Homes for Emotionally Disturbed Children' },
  { code: '624190', description: 'Other individual and family services' },
  { code: '813910', description: 'Business associations' },
  { code: '531110', description: 'Lessors of residential buildings and dwellings' },
] as const;

export function formatNaicsLabel(entry: NaicsExample): string {
  return `${entry.code} - ${entry.description}`;
}

export function filterNaicsExamples(query: string, limit = 8): NaicsExample[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return [];
  }

  return NAICS_EXAMPLE_CODES.filter((entry) => {
    const haystack = `${entry.code} ${entry.description}`.toLowerCase();
    return haystack.includes(normalized);
  }).slice(0, limit);
}
