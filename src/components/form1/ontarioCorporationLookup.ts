/** Prototype mock — Ontario corporation name / OCN search only. */

export type OntarioCorporationResult = {
  ocn: string;
  legalName: string;
  status: string;
};

/** Example Ontario corporations for autosuggest (demo data). */
export const ONTARIO_CORPORATION_EXAMPLES: readonly OntarioCorporationResult[] = [
  {
    ocn: '1001234',
    legalName: 'MAPLE WORKERS HOLDINGS INC.',
    status: 'Active',
  },
  {
    ocn: '2005678',
    legalName: 'LAKESIDE SUPPLY CO-OPERATIVE INC.',
    status: 'Active',
  },
  {
    ocn: '3009012',
    legalName: 'NORTHERN HARVEST FOODS LTD.',
    status: 'Active',
  },
  {
    ocn: '4003456',
    legalName: 'QUEEN STREET CAPITAL CORPORATION',
    status: 'Active',
  },
  {
    ocn: '5007890',
    legalName: 'GREEN INSTITUTE SERVICES INC.',
    status: 'Active',
  },
  {
    ocn: '6001122',
    legalName: 'TORONTO COMMUNITY HOUSING CO-OPERATIVE INC.',
    status: 'Active',
  },
  {
    ocn: '7003344',
    legalName: 'OTTAWA RIVER ENERGY CO-OPERATIVE INC.',
    status: 'Active',
  },
  {
    ocn: '8005566',
    legalName: 'HAMILTON WORKERS UNITED LTD.',
    status: 'Active',
  },
] as const;

function normalizeQuery(value: string) {
  return value.trim().toUpperCase().replace(/\s+/g, ' ');
}

export function formatCorporationSuggestion(entry: OntarioCorporationResult): string {
  return `${entry.ocn} - ${entry.legalName}`;
}

/** Live filter for corporation / OCN autosuggest (same idea as NAICS examples). */
export function filterCorporationExamples(
  query: string,
  limit = 8,
): OntarioCorporationResult[] {
  const normalized = normalizeQuery(query);
  if (!normalized) {
    return [];
  }

  const digitsOnly = normalized.replace(/\D/g, '');
  const isOcnQuery =
    digitsOnly.length >= 2 && digitsOnly === normalized.replace(/\s/g, '');

  return ONTARIO_CORPORATION_EXAMPLES.filter((entry) => {
    if (isOcnQuery) {
      return entry.ocn.includes(digitsOnly);
    }
    const haystack = `${entry.ocn} ${entry.legalName}`;
    return haystack.includes(normalized);
  }).slice(0, limit);
}

/** Search Ontario corporations by legal name or OCN (digits). */
export function searchOntarioCorporations(query: string): OntarioCorporationResult[] {
  return filterCorporationExamples(query, 20);
}
