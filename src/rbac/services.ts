import type {
  ProjectDefinition,
  ProjectPermission,
  ServiceAccess,
  ServiceAccessEntry,
  ServiceGroupAccess,
  ServiceGroupId,
  SubServiceId,
} from './types';

export type SubServiceDefinition = {
  id: SubServiceId;
  label: string;
  projects: ProjectDefinition[];
};

export type ServiceGroupDefinition = {
  id: ServiceGroupId;
  label: string;
  subServices: SubServiceDefinition[];
  supportsCreateProject?: boolean;
};

const MINING_PROJECT_LABELS = [
  'Project A',
  'Project B',
  'Project C',
  'Project D',
  'Project E',
  'Project F',
  'Project G',
  'Project H',
  'Project I',
  'Project J',
  'Project K',
  'Project L',
  'Project M',
  'Project N',
  'Project O',
  'Project P',
];

function buildMiningProjects(): ProjectDefinition[] {
  return MINING_PROJECT_LABELS.map((label, index) => {
    const letter = String.fromCharCode(65 + index);
    return {
      id: `mining:project-${letter.toLowerCase()}`,
      label,
      initials: `P${letter}`,
    };
  });
}

export const SERVICE_GROUPS: ServiceGroupDefinition[] = [
  {
    id: 'permits-licences',
    label: 'Permits and licences',
    supportsCreateProject: true,
    subServices: [
      {
        id: 'mining',
        label: 'Mining permits, authorizations and approvals',
        projects: buildMiningProjects(),
      },
      {
        id: 'construction',
        label: 'Construction',
        projects: [],
      },
      {
        id: 'highways',
        label: 'Highways',
        projects: [],
      },
    ],
  },
];

export function getSubServiceById(subServiceId: SubServiceId): SubServiceDefinition | undefined {
  for (const group of SERVICE_GROUPS) {
    const subService = group.subServices.find((item) => item.id === subServiceId);
    if (subService) {
      return subService;
    }
  }
  return undefined;
}

export function getAllSubServices(): SubServiceDefinition[] {
  return SERVICE_GROUPS.flatMap((group) => group.subServices);
}

export function createDefaultServiceAccessEntry(
  subServiceId: SubServiceId,
  enabled = false,
): ServiceAccessEntry {
  const subService = getSubServiceById(subServiceId);
  const projectPermissions: Record<string, ProjectPermission> = {};

  for (const project of subService?.projects ?? []) {
    projectPermissions[project.id] = 'none';
  }

  return {
    enabled,
    projectPermissions,
  };
}

export function createDefaultGroupAccess(): Partial<Record<ServiceGroupId, ServiceGroupAccess>> {
  return {
    'permits-licences': {
      createProject: false,
    },
  };
}

export function createDefaultServiceAccess(): Record<SubServiceId, ServiceAccessEntry> {
  return {
    mining: createDefaultServiceAccessEntry('mining'),
    construction: createDefaultServiceAccessEntry('construction'),
    highways: createDefaultServiceAccessEntry('highways'),
  };
}

export const DEFAULT_SERVICE_ACCESS: ServiceAccess = {
  services: createDefaultServiceAccess(),
  groups: createDefaultGroupAccess(),
};

export function hasServiceAccessSelection(serviceAccess: ServiceAccess): boolean {
  const hasCreateProject = Object.values(serviceAccess.groups ?? {}).some(
    (group) => group?.createProject,
  );

  if (hasCreateProject) {
    return true;
  }

  return Object.values(serviceAccess.services).some((entry) => entry.enabled);
}

export function getEnabledSubServiceIds(serviceAccess: ServiceAccess): SubServiceId[] {
  return (Object.keys(serviceAccess.services) as SubServiceId[]).filter(
    (subServiceId) => serviceAccess.services[subServiceId].enabled,
  );
}
