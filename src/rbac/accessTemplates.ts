import { DEFAULT_SERVICE_ACCESS } from './services';
import type { AccessTemplate, RoleId, ServiceAccess } from './types';

const STORAGE_KEY = 'ops-rbac-access-templates-v1';

const BUILT_IN_TEMPLATES: AccessTemplate[] = [
  {
    id: 'template-mining-delegate-ab-view',
    name: 'Mining delegate — Projects A–D (view)',
    roleId: 'delegate',
    serviceAccess: createMiningTemplateAccess(['mining:project-a', 'mining:project-b', 'mining:project-c', 'mining:project-d'], 'view'),
  },
  {
    id: 'template-mining-member-full-view',
    name: 'Mining member — all projects (view)',
    roleId: 'member',
    serviceAccess: createMiningAllProjectsAccess('view'),
  },
  {
    id: 'template-construction-member',
    name: 'Construction member — service only',
    roleId: 'member',
    serviceAccess: createSubServiceOnlyAccess('construction'),
  },
];

function createSubServiceOnlyAccess(subServiceId: 'mining' | 'construction' | 'highways'): ServiceAccess {
  const access = structuredClone(DEFAULT_SERVICE_ACCESS);
  for (const id of ['mining', 'construction', 'highways'] as const) {
    access.services[id].enabled = id === subServiceId;
  }
  return access;
}

function createMiningTemplateAccess(
  projectIds: string[],
  permission: 'view' | 'view_edit',
): ServiceAccess {
  const access = createSubServiceOnlyAccess('mining');
  const permissions = access.services.mining.projectPermissions;
  for (const projectId of Object.keys(permissions)) {
    permissions[projectId] = projectIds.includes(projectId) ? permission : 'none';
  }
  return access;
}

function createMiningAllProjectsAccess(permission: 'view' | 'view_edit'): ServiceAccess {
  const access = createSubServiceOnlyAccess('mining');
  const permissions = access.services.mining.projectPermissions;
  for (const projectId of Object.keys(permissions)) {
    permissions[projectId] = permission;
  }
  return access;
}

function readCustomTemplates(): AccessTemplate[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return [];
  }

  try {
    return JSON.parse(stored) as AccessTemplate[];
  } catch {
    return [];
  }
}

function writeCustomTemplates(templates: AccessTemplate[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
}

export function listAccessTemplates(): AccessTemplate[] {
  return [...BUILT_IN_TEMPLATES, ...readCustomTemplates()];
}

export function getAccessTemplateById(templateId: string): AccessTemplate | undefined {
  return listAccessTemplates().find((template) => template.id === templateId);
}

export function saveAccessTemplate(
  name: string,
  roleId: RoleId,
  serviceAccess: ServiceAccess,
): AccessTemplate {
  const template: AccessTemplate = {
    id: `template-custom-${crypto.randomUUID()}`,
    name: name.trim(),
    roleId,
    serviceAccess: structuredClone(serviceAccess),
  };

  const custom = readCustomTemplates();
  writeCustomTemplates([...custom, template]);
  return template;
}

export function deleteAccessTemplate(templateId: string) {
  const custom = readCustomTemplates().filter((template) => template.id !== templateId);
  writeCustomTemplates(custom);
}

export function applyTemplateToServiceAccess(template: AccessTemplate): ServiceAccess {
  return structuredClone(template.serviceAccess);
}
