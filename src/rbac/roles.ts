import type { RoleDefinition, RoleId } from './types';

export const ROLES: RoleDefinition[] = [
  {
    id: 'secondary_admin',
    label: 'Secondary Admin',
    shortDescription:
      'Can manage users, service access, and permissions for assigned services.',
    longDescription:
      'Can manage users, service access, and permissions for assigned services.',
    skipsServiceAccess: true,
  },
  {
    id: 'delegate',
    label: 'Authorized Representative',
    shortDescription:
      'External consultant or representative with access to selected services and data.',
    longDescription:
      'External consultant or representative with access to selected services and data.',
    skipsServiceAccess: false,
  },
  {
    id: 'member',
    label: 'Member',
    shortDescription:
      'Internal business user with access to assigned services and data.',
    longDescription:
      'Internal business user with access to assigned services and data.',
    skipsServiceAccess: false,
  },
];

export function getRoleById(roleId: RoleId): RoleDefinition | undefined {
  return ROLES.find((role) => role.id === roleId);
}

export function roleSkipsServiceAccess(roleId: RoleId) {
  return getRoleById(roleId)?.skipsServiceAccess ?? false;
}

export function getRoleOptions() {
  return ROLES.map((role) => ({
    value: role.id,
    label: role.label,
  }));
}
