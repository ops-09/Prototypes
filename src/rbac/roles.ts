import type { RoleDefinition, RoleId } from './types';

export const ROLES: RoleDefinition[] = [
  {
    id: 'secondary_admin',
    label: 'Secondary Admin',
    shortDescription:
      'Can manage users, service access, and permissions for assigned services.',
    longDescription:
      'Secondary admins have full access to Business Profile, User management, and Permits & Licenses. You can proceed directly to Review.',
    skipsServiceAccess: true,
  },
  {
    id: 'delegate',
    label: 'Representative',
    shortDescription:
      'External consultant or representative with access to selected services and data.',
    longDescription:
      'Representatives get access to selected services and data based on view or edit permission granted.',
    skipsServiceAccess: false,
  },
  {
    id: 'member',
    label: 'Member',
    shortDescription:
      'Internal business user with access to assigned services and data.',
    longDescription:
      'Members get access to assigned services and data based on view or edit permission granted.',
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

export function getRoleInfoHeading(roleId: RoleId) {
  switch (roleId) {
    case 'secondary_admin':
      return 'No service configuration needed';
    case 'delegate':
      return 'Representative — configure service access in the next step';
    case 'member':
      return 'Member — configure service access in the next step';
    default:
      return '';
  }
}
