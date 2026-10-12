export type RoleId = 'secondary_admin' | 'delegate' | 'member';

export type UserStatus = 'active' | 'invited' | 'removed';

export type ProjectPermission = 'none' | 'view' | 'view_edit';

export type ServiceGroupId = 'permits-licences' | 'service-b';

export type SubServiceId = 'mining' | 'construction' | 'highways';

export type ServiceAccessEntry = {
  enabled: boolean;
  projectPermissions: Record<string, ProjectPermission>;
};

export type ServiceGroupAccess = {
  createProject: boolean;
};

export type ServiceAccess = {
  services: Record<SubServiceId, ServiceAccessEntry>;
  groups: Partial<Record<ServiceGroupId, ServiceGroupAccess>>;
};

export type RoleDefinition = {
  id: RoleId;
  label: string;
  shortDescription: string;
  longDescription: string;
  skipsServiceAccess: boolean;
};

export type ProjectDefinition = {
  id: string;
  label: string;
  initials: string;
};

export type BusinessUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  roleId: RoleId;
  status: UserStatus;
  serviceAccess?: ServiceAccess;
  invitedAt?: string;
  lastActiveAt?: string;
};

export type InviteUserInput = {
  email: string;
  roleId: RoleId;
  serviceAccess?: ServiceAccess;
};

export type UpdateUserInput = {
  firstName: string;
  lastName: string;
  email: string;
  roleId: RoleId;
  serviceAccess?: ServiceAccess;
};

export type PageAlertState = {
  type: 'informational' | 'warning' | 'success' | 'error';
  heading: string;
  content: string;
} | null;

export type InviteStep = 1 | 2 | 3 | 4 | 5;

export type BatchInviteMode = 'same' | 'custom';

export type BatchInviteStep = 1 | 2 | 3 | 4;

export type BatchCustomInviteStep = 1 | 2 | 3;

export type BatchUserEntry = {
  email: string;
  roleId: RoleId;
  serviceAccess: ServiceAccess;
};

export type InviteBatchInput = {
  users: InviteUserInput[];
};

export type InviteBatchResult = {
  invited: BusinessUser[];
  skipped: Array<{ email: string; reason: string }>;
};

export type AccessTemplate = {
  id: string;
  name: string;
  roleId: RoleId;
  serviceAccess: ServiceAccess;
};

export type InvitePrefillState = {
  roleId?: RoleId;
  serviceAccess?: ServiceAccess;
};

export type InviteLocationState = {
  inviteSuccessEmail?: string;
  inviteBatchSuccess?: {
    invitedCount: number;
    skipped: Array<{ email: string; reason: string }>;
  };
  inviteAnotherSameAccess?: InvitePrefillState;
};
