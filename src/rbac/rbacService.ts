import { getRoleById } from './roles';
import { SERVICE_GROUPS } from './services';
import { INITIAL_USERS } from './mockUsers';
import type {
  BusinessUser,
  InviteBatchInput,
  InviteBatchResult,
  InviteUserInput,
  ProjectPermission,
  RoleId,
  ServiceAccess,
  UpdateUserInput,
  UserStatus,
} from './types';
import { DEFAULT_SERVICE_ACCESS } from './services';

const STORAGE_KEY = 'ops-rbac-users-v2';

function readUsers(): BusinessUser[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return structuredClone(INITIAL_USERS);
  }

  try {
    return JSON.parse(stored) as BusinessUser[];
  } catch {
    return structuredClone(INITIAL_USERS);
  }
}

function writeUsers(users: BusinessUser[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

function createId() {
  return `user-${crypto.randomUUID()}`;
}

export function listUsers(): BusinessUser[] {
  return readUsers().filter((user) => user.status !== 'removed');
}

export function getUserById(userId: string): BusinessUser | undefined {
  return readUsers().find((user) => user.id === userId && user.status !== 'removed');
}

export function inviteUser(input: InviteUserInput): BusinessUser {
  const users = readUsers();
  const normalizedEmail = input.email.trim().toLowerCase();

  if (
    users.some(
      (user) => user.email.toLowerCase() === normalizedEmail && user.status !== 'removed',
    )
  ) {
    throw new Error('A user with this email address already exists for this business profile.');
  }

  const newUser: BusinessUser = {
    id: createId(),
    firstName: '',
    lastName: '',
    email: normalizedEmail,
    roleId: input.roleId,
    status: 'invited',
    serviceAccess: input.serviceAccess ?? structuredClone(DEFAULT_SERVICE_ACCESS),
    invitedAt: new Date().toISOString(),
  };

  writeUsers([...users, newUser]);
  return newUser;
}

export function inviteUsers(batch: InviteBatchInput): InviteBatchResult {
  const invited: BusinessUser[] = [];
  const skipped: InviteBatchResult['skipped'] = [];

  for (const input of batch.users) {
    try {
      invited.push(inviteUser(input));
    } catch (error) {
      skipped.push({
        email: input.email,
        reason:
          error instanceof Error
            ? error.message
            : 'Unable to send invitation for this email.',
      });
    }
  }

  return { invited, skipped };
}

export function updateUser(userId: string, input: UpdateUserInput): BusinessUser {
  const users = readUsers();
  const index = users.findIndex((user) => user.id === userId);

  if (index === -1) {
    throw new Error('User not found.');
  }

  const normalizedEmail = input.email.trim().toLowerCase();
  const duplicate = users.find(
    (user) =>
      user.id !== userId &&
      user.email.toLowerCase() === normalizedEmail &&
      user.status !== 'removed',
  );

  if (duplicate) {
    throw new Error('A user with this email address already exists for this business profile.');
  }

  const updatedUser: BusinessUser = {
    ...users[index],
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    email: normalizedEmail,
    roleId: input.roleId,
    serviceAccess: input.serviceAccess ?? users[index].serviceAccess,
  };

  users[index] = updatedUser;
  writeUsers(users);
  return updatedUser;
}

export function removeUser(userId: string): BusinessUser {
  const users = readUsers();
  const index = users.findIndex((user) => user.id === userId);

  if (index === -1) {
    throw new Error('User not found.');
  }

  const removedUser: BusinessUser = {
    ...users[index],
    status: 'removed' as UserStatus,
  };

  users[index] = removedUser;
  writeUsers(users);
  return removedUser;
}

export function formatUserName(user: Pick<BusinessUser, 'firstName' | 'lastName'>) {
  const name = `${user.firstName} ${user.lastName}`.trim();
  return name || 'Invitation pending';
}

export function getUserInitials(user: Pick<BusinessUser, 'firstName' | 'lastName' | 'email'>) {
  const name = `${user.firstName} ${user.lastName}`.trim();
  if (name) {
    const parts = name.split(/\s+/);
    return parts
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('');
  }

  return user.email[0]?.toUpperCase() ?? '?';
}

export function formatStatusLabel(status: UserStatus) {
  switch (status) {
    case 'active':
      return 'Accepted';
    case 'invited':
      return 'Pending';
    case 'removed':
      return 'Removed';
    default:
      return status;
  }
}

export function formatRoleLabel(roleId: RoleId) {
  return getRoleById(roleId)?.label ?? roleId;
}

export function formatProjectPermission(permission: ProjectPermission) {
  switch (permission) {
    case 'none':
      return 'No access';
    case 'view':
      return 'View';
    case 'view_edit':
      return 'Edit';
    default:
      return permission;
  }
}

export function summarizeServiceAccess(serviceAccess: ServiceAccess | undefined) {
  if (!serviceAccess) {
    return 'No access assigned';
  }

  const summaries = SERVICE_GROUPS.flatMap((group) =>
    group.subServices
      .filter((subService) => serviceAccess.services[subService.id]?.enabled)
      .map((subService) => {
        const entry = serviceAccess.services[subService.id];

        if (subService.projects.length === 0) {
          return `${group.label} / ${subService.label}: enabled`;
        }

        const assigned = subService.projects
          .map((project) => {
            const permission = entry.projectPermissions[project.id] ?? 'none';
            if (permission === 'none') {
              return null;
            }
            return `${project.label}: ${formatProjectPermission(permission)}`;
          })
          .filter((item): item is string => item !== null);

        if (assigned.length === 0) {
          return `${group.label} / ${subService.label}: no project access`;
        }

        return `${group.label} / ${subService.label} (${assigned.join(', ')})`;
      }),
  );

  if (summaries.length === 0) {
    return 'No access assigned';
  }

  return summaries.join('; ');
}
