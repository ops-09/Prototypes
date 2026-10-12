import type { BusinessUser } from './types';

export const INITIAL_USERS: BusinessUser[] = [
  {
    id: 'user-1',
    firstName: 'Sarah',
    lastName: 'Chen',
    email: 's.chen@acme.com',
    roleId: 'secondary_admin',
    status: 'active',
    lastActiveAt: '2026-06-14T10:30:00.000Z',
  },
  {
    id: 'user-2',
    firstName: '',
    lastName: '',
    email: 'j.patel@gmail.com',
    roleId: 'delegate',
    status: 'invited',
    invitedAt: '2026-06-12T14:00:00.000Z',
  },
  {
    id: 'user-3',
    firstName: 'Mark',
    lastName: 'Rivera',
    email: 'm.rivera@acme.com',
    roleId: 'member',
    status: 'active',
    lastActiveAt: '2026-06-10T09:15:00.000Z',
  },
  {
    id: 'user-4',
    firstName: '',
    lastName: '',
    email: 'revathy@gmail.com',
    roleId: 'delegate',
    status: 'invited',
    invitedAt: '2026-06-11T09:00:00.000Z',
  },
  {
    id: 'user-5',
    firstName: '',
    lastName: '',
    email: 'revathy.perumal@gmail.com',
    roleId: 'delegate',
    status: 'invited',
    invitedAt: '2026-06-11T10:00:00.000Z',
  },
];
