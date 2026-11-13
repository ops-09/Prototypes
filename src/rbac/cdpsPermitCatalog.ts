export type CdpsMinistryId =
  | 'MOS'
  | 'SO'
  | 'MECP'
  | 'SOLGEN'
  | 'MOF'
  | 'MPBSDP';

export type CdpsPermitType = {
  permitTypeId: string;
  ministryId: CdpsMinistryId;
  permitShortName: string;
  orgBasedRbac: boolean;
};

export type CdpsMinistry = {
  ministryId: CdpsMinistryId;
  label: string;
};

export type CdpsApplicationStatus = 'draft' | 'submitted';

export type CdpsApplication = {
  applicationId: string;
  applicationNumber: string;
  displayName: string;
  ministryId: CdpsMinistryId;
  permitTypeId: string;
  status: CdpsApplicationStatus;
  organizationId: string;
};

const MINISTRY_LABELS: Record<CdpsMinistryId, string> = {
  MOS: 'Ministry of Sport (MOS)',
  SO: 'ServiceOntario (SO)',
  MECP: 'Ministry of the Environment, Conservation and Parks (MECP)',
  SOLGEN: 'Ministry of the Solicitor General (SOLGEN)',
  MOF: 'Ministry of Finance (MOF)',
  MPBSDP: 'Ministry of Public and Business Service Delivery and Procurement (MPBSDP)',
};

/** Stakeholder permit table (org-based RBAC mocks). */
const PERMIT_ROWS: Array<{ ministryId: CdpsMinistryId; permitShortName: string }> = [
  { ministryId: 'MOS', permitShortName: 'Professional Combative Sport Event Permit' },
  { ministryId: 'MOS', permitShortName: 'Amateur Combative Sport Event Permit' },
  { ministryId: 'SO', permitShortName: 'OBR Form 7' },
  { ministryId: 'MECP', permitShortName: 'MECP Wells Contractor Licence' },
  { ministryId: 'SOLGEN', permitShortName: 'Security Guard / Private Investigator Agency Licence' },
  { ministryId: 'MOF', permitShortName: "Tobacco Retailer Dealer's Permit" },
  {
    ministryId: 'MOF',
    permitShortName: 'Certificate of Exemption – First Nations Band Empowered Vehicles',
  },
  { ministryId: 'MOF', permitShortName: 'International Fuel Tax Agreement Licence' },
  { ministryId: 'MOF', permitShortName: 'Tobacco Tax Collector Designation' },
  { ministryId: 'MOF', permitShortName: 'Cigar Tax Collector Designation' },
  { ministryId: 'MOF', permitShortName: 'Manufacturer Registration Certificate' },
  { ministryId: 'MOF', permitShortName: 'Importer Registration Certificate' },
  { ministryId: 'MOF', permitShortName: 'Exporter Registration Certificate' },
  { ministryId: 'MOF', permitShortName: 'Permit to Purchase and Sell Unmarked Cigarettes' },
  { ministryId: 'MOF', permitShortName: 'Wholesaler\'s Permit' },
  { ministryId: 'MOF', permitShortName: 'Vendor Permit (Retail Sales Tax)' },
  { ministryId: 'MOF', permitShortName: 'Fuel Acquisition Permit' },
  {
    ministryId: 'MPBSDP',
    permitShortName: 'Co-operative Corporations Act - Articles of Revival',
  },
  {
    ministryId: 'MPBSDP',
    permitShortName: 'Co-operative Corporations Act - Articles of Continuance as a Co-operative with Share Capital',
  },
  {
    ministryId: 'MPBSDP',
    permitShortName: 'Co-operative Corporations Act - Articles of Incorporation of a Co-operative with Share Capital',
  },
  {
    ministryId: 'MPBSDP',
    permitShortName: 'Co-operative Corporations Act - Articles of Amalgamation',
  },
  { ministryId: 'MPBSDP', permitShortName: 'Corporations Act - Letters Patent' },
  { ministryId: 'MPBSDP', permitShortName: 'Payday Broker' },
  { ministryId: 'MPBSDP', permitShortName: 'Payday lender' },
  { ministryId: 'MPBSDP', permitShortName: 'Collection Agency' },
  { ministryId: 'MPBSDP', permitShortName: 'Bailiff – appointed' },
];

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48);
}

export const CDPS_PERMIT_TYPES: CdpsPermitType[] = PERMIT_ROWS.map((row) => ({
  permitTypeId: `${row.ministryId.toLowerCase()}-${slugify(row.permitShortName)}`,
  ministryId: row.ministryId,
  permitShortName: row.permitShortName,
  orgBasedRbac: true,
}));

export const CDPS_MINISTRIES: CdpsMinistry[] = (
  Object.keys(MINISTRY_LABELS) as CdpsMinistryId[]
).map((ministryId) => ({
  ministryId,
  label: MINISTRY_LABELS[ministryId],
}));

export const DEMO_ORGANIZATION_ID = 'org-demo';

function permitTypeIdFor(ministryId: CdpsMinistryId, permitShortName: string) {
  return (
    CDPS_PERMIT_TYPES.find(
      (permit) =>
        permit.ministryId === ministryId && permit.permitShortName === permitShortName,
    )?.permitTypeId ?? `${ministryId.toLowerCase()}-${slugify(permitShortName)}`
  );
}

export const CDPS_APPLICATION_FIXTURES: CdpsApplication[] = [
  {
    applicationId: 'app-mecp-2456',
    applicationNumber: '2456',
    displayName: 'MECP Wells Contractor Licence Application #2456',
    ministryId: 'MECP',
    permitTypeId: permitTypeIdFor('MECP', 'MECP Wells Contractor Licence'),
    status: 'draft',
    organizationId: DEMO_ORGANIZATION_ID,
  },
  {
    applicationId: 'app-mecp-2458',
    applicationNumber: '2458',
    displayName: 'MECP Wells Contractor Licence Application #2458',
    ministryId: 'MECP',
    permitTypeId: permitTypeIdFor('MECP', 'MECP Wells Contractor Licence'),
    status: 'submitted',
    organizationId: DEMO_ORGANIZATION_ID,
  },
  {
    applicationId: 'app-mof-3101',
    applicationNumber: '3101',
    displayName: "Tobacco Retailer Dealer's Permit Application #3101",
    ministryId: 'MOF',
    permitTypeId: permitTypeIdFor('MOF', "Tobacco Retailer Dealer's Permit"),
    status: 'draft',
    organizationId: DEMO_ORGANIZATION_ID,
  },
  {
    applicationId: 'app-mof-3102',
    applicationNumber: '3102',
    displayName: 'International Fuel Tax Agreement Licence Application #3102',
    ministryId: 'MOF',
    permitTypeId: permitTypeIdFor('MOF', 'International Fuel Tax Agreement Licence'),
    status: 'submitted',
    organizationId: DEMO_ORGANIZATION_ID,
  },
  {
    applicationId: 'app-mpbsdp-4401',
    applicationNumber: '4401',
    displayName: 'Corporations Act - Letters Patent Application #4401',
    ministryId: 'MPBSDP',
    permitTypeId: permitTypeIdFor('MPBSDP', 'Corporations Act - Letters Patent'),
    status: 'draft',
    organizationId: DEMO_ORGANIZATION_ID,
  },
  {
    applicationId: 'app-mpbsdp-4402',
    applicationNumber: '4402',
    displayName: 'Payday lender Application #4402',
    ministryId: 'MPBSDP',
    permitTypeId: permitTypeIdFor('MPBSDP', 'Payday lender'),
    status: 'submitted',
    organizationId: DEMO_ORGANIZATION_ID,
  },
  {
    applicationId: 'app-solgen-1201',
    applicationNumber: '1201',
    displayName: 'Security Guard / Private Investigator Agency Licence Application #1201',
    ministryId: 'SOLGEN',
    permitTypeId: permitTypeIdFor(
      'SOLGEN',
      'Security Guard / Private Investigator Agency Licence',
    ),
    status: 'draft',
    organizationId: DEMO_ORGANIZATION_ID,
  },
  {
    applicationId: 'app-so-901',
    applicationNumber: '901',
    displayName: 'OBR Form 7 Application #901',
    ministryId: 'SO',
    permitTypeId: permitTypeIdFor('SO', 'OBR Form 7'),
    status: 'submitted',
    organizationId: DEMO_ORGANIZATION_ID,
  },
];

export function listEligiblePermitTypes(): CdpsPermitType[] {
  return CDPS_PERMIT_TYPES.filter((permit) => permit.orgBasedRbac);
}

export function listMinistriesWithEligiblePermits(): CdpsMinistry[] {
  const ids = new Set(listEligiblePermitTypes().map((permit) => permit.ministryId));
  return CDPS_MINISTRIES.filter((ministry) => ids.has(ministry.ministryId));
}

export function listPermitTypesByMinistry(ministryId: CdpsMinistryId): CdpsPermitType[] {
  return listEligiblePermitTypes().filter((permit) => permit.ministryId === ministryId);
}

export function listOrgApplications(
  organizationId = DEMO_ORGANIZATION_ID,
): CdpsApplication[] {
  return CDPS_APPLICATION_FIXTURES.filter((app) => app.organizationId === organizationId);
}

export function getMinistryLabel(ministryId: CdpsMinistryId) {
  return MINISTRY_LABELS[ministryId] ?? ministryId;
}

export function getPermitTypeById(permitTypeId: string) {
  return CDPS_PERMIT_TYPES.find((permit) => permit.permitTypeId === permitTypeId);
}

export function getApplicationById(applicationId: string) {
  return CDPS_APPLICATION_FIXTURES.find((app) => app.applicationId === applicationId);
}

export function filterPermitTypes(query: string, ministryId?: CdpsMinistryId) {
  const normalized = query.trim().toLowerCase();
  return listEligiblePermitTypes().filter((permit) => {
    if (ministryId && permit.ministryId !== ministryId) {
      return false;
    }
    if (!normalized) {
      return true;
    }
    return (
      permit.permitShortName.toLowerCase().includes(normalized) ||
      permit.ministryId.toLowerCase().includes(normalized)
    );
  });
}

export function filterApplications(query: string, applications: CdpsApplication[]) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return applications;
  }

  return applications.filter((app) => {
    return (
      app.displayName.toLowerCase().includes(normalized) ||
      app.applicationNumber.toLowerCase().includes(normalized) ||
      app.ministryId.toLowerCase().includes(normalized) ||
      getMinistryLabel(app.ministryId).toLowerCase().includes(normalized)
    );
  });
}
