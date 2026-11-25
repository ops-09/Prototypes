/**
 * Ministries that publish business permit/licence service standards on ontario.ca
 * (https://www.ontario.ca/page/business-service-standards-permits-and-licences).
 * Filter chips use these 15 ids so every permitting ministry is accounted for.
 */
export type CdpsMinistryId =
  | 'OMAFA'
  | 'MCCSS'
  | 'EDU'
  | 'MEM'
  | 'MECP'
  | 'MOF'
  | 'MOH'
  | 'MLITSD'
  | 'MLTC'
  | 'MMAH'
  | 'MNR'
  | 'MPBSDP'
  | 'SOLGEN'
  | 'MOS'
  | 'MTO';

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
  OMAFA: 'Ministry of Agriculture, Food and Agribusiness (OMAFA)',
  MCCSS: 'Ministry of Children, Community and Social Services (MCCSS)',
  EDU: 'Ministry of Education (EDU)',
  MEM: 'Ministry of Energy and Mines (MEM)',
  MECP: 'Ministry of the Environment, Conservation and Parks (MECP)',
  MOF: 'Ministry of Finance (MOF)',
  MOH: 'Ministry of Health (MOH)',
  MLITSD: 'Ministry of Labour, Immigration, Training and Skills Development (MLITSD)',
  MLTC: 'Ministry of Long-Term Care (MLTC)',
  MMAH: 'Ministry of Municipal Affairs and Housing (MMAH)',
  MNR: 'Ministry of Natural Resources (MNR)',
  MPBSDP: 'Ministry of Public and Business Service Delivery and Procurement (MPBSDP)',
  SOLGEN: 'Ministry of the Solicitor General (SOLGEN)',
  MOS: 'Ministry of Sport (MOS)',
  MTO: 'Ministry of Transportation (MTO)',
};

/**
 * Org-based RBAC mock catalog.
 * Existing stakeholder rows kept; one+ sample permit per ontario.ca ministry so chips appear.
 */
const PERMIT_ROWS: Array<{ ministryId: CdpsMinistryId; permitShortName: string }> = [
  // OMAFA
  { ministryId: 'OMAFA', permitShortName: 'Licence for the Operation of a Dairy Plant' },
  { ministryId: 'OMAFA', permitShortName: 'Licence to operate a meat plant' },
  { ministryId: 'OMAFA', permitShortName: 'Licence to sell livestock medicines' },
  // MCCSS
  { ministryId: 'MCCSS', permitShortName: "Children's residence licence" },
  { ministryId: 'MCCSS', permitShortName: 'Foster care licence' },
  // EDU
  { ministryId: 'EDU', permitShortName: 'Child Care Licence' },
  // MEM
  { ministryId: 'MEM', permitShortName: "Prospectors Licence" },
  { ministryId: 'MEM', permitShortName: 'Exploration permit' },
  { ministryId: 'MEM', permitShortName: 'Exploration plan' },
  // MECP
  { ministryId: 'MECP', permitShortName: 'MECP Wells Contractor Licence' },
  { ministryId: 'MECP', permitShortName: 'Environmental Compliance Approval' },
  { ministryId: 'MECP', permitShortName: 'Permit to Take Water' },
  // MOF
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
  { ministryId: 'MOF', permitShortName: "Wholesaler's Permit" },
  { ministryId: 'MOF', permitShortName: 'Vendor Permit (Retail Sales Tax)' },
  { ministryId: 'MOF', permitShortName: 'Fuel Acquisition Permit' },
  // MOH
  { ministryId: 'MOH', permitShortName: 'Laboratory Licence' },
  { ministryId: 'MOH', permitShortName: 'Written Approval for the Installation of an X-Ray machine' },
  // MLITSD
  {
    ministryId: 'MLITSD',
    permitShortName: 'Temporary help agency or recruiter licence',
  },
  // MLTC
  { ministryId: 'MLTC', permitShortName: 'Long-Term Care Home Licence' },
  // MMAH
  { ministryId: 'MMAH', permitShortName: 'Registration for Independent Designers' },
  { ministryId: 'MMAH', permitShortName: 'Registration for Design Firms' },
  // MNR
  { ministryId: 'MNR', permitShortName: 'Aggregate Licence or Permit' },
  { ministryId: 'MNR', permitShortName: 'Crown Land Work Permit' },
  { ministryId: 'MNR', permitShortName: 'Land Use Permit' },
  // MPBSDP (includes former ServiceOntario OBR Form 7 mock)
  {
    ministryId: 'MPBSDP',
    permitShortName: 'Co-operative Corporations Act - Articles of Revival',
  },
  {
    ministryId: 'MPBSDP',
    permitShortName:
      'Co-operative Corporations Act - Articles of Continuance as a Co-operative with Share Capital',
  },
  {
    ministryId: 'MPBSDP',
    permitShortName:
      'Co-operative Corporations Act - Articles of Incorporation of a Co-operative with Share Capital',
  },
  {
    ministryId: 'MPBSDP',
    permitShortName: 'Co-operative Corporations Act - Articles of Amalgamation',
  },
  { ministryId: 'MPBSDP', permitShortName: 'Corporations Act - Letters Patent' },
  { ministryId: 'MPBSDP', permitShortName: 'OBR Form 7' },
  { ministryId: 'MPBSDP', permitShortName: 'Payday Broker' },
  { ministryId: 'MPBSDP', permitShortName: 'Payday lender' },
  { ministryId: 'MPBSDP', permitShortName: 'Collection Agency' },
  { ministryId: 'MPBSDP', permitShortName: 'Bailiff – appointed' },
  // SOLGEN
  {
    ministryId: 'SOLGEN',
    permitShortName: 'Security Guard / Private Investigator Agency Licence',
  },
  // MOS
  { ministryId: 'MOS', permitShortName: 'Professional Combative Sport Event Permit' },
  { ministryId: 'MOS', permitShortName: 'Amateur Combative Sport Event Permit' },
  // MTO
  { ministryId: 'MTO', permitShortName: 'CVOR Certificate' },
  { ministryId: 'MTO', permitShortName: 'Oversize/Overweight Single Trip Permit' },
  { ministryId: 'MTO', permitShortName: 'Entrance Permit - Commercial - Basic' },
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
    applicationId: 'app-mpbsdp-901',
    applicationNumber: '901',
    displayName: 'OBR Form 7 Application #901',
    ministryId: 'MPBSDP',
    permitTypeId: permitTypeIdFor('MPBSDP', 'OBR Form 7'),
    status: 'submitted',
    organizationId: DEMO_ORGANIZATION_ID,
  },
  {
    applicationId: 'app-omafa-5101',
    applicationNumber: '5101',
    displayName: 'Licence for the Operation of a Dairy Plant Application #5101',
    ministryId: 'OMAFA',
    permitTypeId: permitTypeIdFor('OMAFA', 'Licence for the Operation of a Dairy Plant'),
    status: 'draft',
    organizationId: DEMO_ORGANIZATION_ID,
  },
  {
    applicationId: 'app-omafa-5102',
    applicationNumber: '5102',
    displayName: 'Licence to operate a meat plant Application #5102',
    ministryId: 'OMAFA',
    permitTypeId: permitTypeIdFor('OMAFA', 'Licence to operate a meat plant'),
    status: 'submitted',
    organizationId: DEMO_ORGANIZATION_ID,
  },
  {
    applicationId: 'app-edu-6201',
    applicationNumber: '6201',
    displayName: 'Child Care Licence Application #6201',
    ministryId: 'EDU',
    permitTypeId: permitTypeIdFor('EDU', 'Child Care Licence'),
    status: 'draft',
    organizationId: DEMO_ORGANIZATION_ID,
  },
  {
    applicationId: 'app-mnr-7301',
    applicationNumber: '7301',
    displayName: 'Aggregate Licence or Permit Application #7301',
    ministryId: 'MNR',
    permitTypeId: permitTypeIdFor('MNR', 'Aggregate Licence or Permit'),
    status: 'submitted',
    organizationId: DEMO_ORGANIZATION_ID,
  },
  {
    applicationId: 'app-mto-8401',
    applicationNumber: '8401',
    displayName: 'CVOR Certificate Application #8401',
    ministryId: 'MTO',
    permitTypeId: permitTypeIdFor('MTO', 'CVOR Certificate'),
    status: 'draft',
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
    const ministryLabel = getMinistryLabel(permit.ministryId).toLowerCase();
    return (
      permit.permitShortName.toLowerCase().includes(normalized) ||
      permit.ministryId.toLowerCase().includes(normalized) ||
      ministryLabel.includes(normalized)
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
