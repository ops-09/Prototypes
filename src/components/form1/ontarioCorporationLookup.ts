/** Prototype mock — Ontario corporation name / OCN search only. */

export type OntarioCorporationResult = {
  ocn: string;
  legalName: string;
  status: string;
};

const MOCK_CORPORATIONS: OntarioCorporationResult[] = [
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
];

function normalizeQuery(value: string) {
  return value.trim().toUpperCase().replace(/\s+/g, ' ');
}

/** Search Ontario corporations by legal name or OCN (digits). */
export function searchOntarioCorporations(query: string): OntarioCorporationResult[] {
  const normalized = normalizeQuery(query);
  if (!normalized) {
    return [];
  }

  const digitsOnly = normalized.replace(/\D/g, '');
  const isOcnSearch = digitsOnly.length >= 4 && digitsOnly === normalized.replace(/\s/g, '');

  if (isOcnSearch) {
    return MOCK_CORPORATIONS.filter((entry) => entry.ocn.includes(digitsOnly));
  }

  return MOCK_CORPORATIONS.filter((entry) =>
    entry.legalName.includes(normalized),
  );
}
