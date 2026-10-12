import {
  OntarioIconAccount,
  OntarioIconAddAlt,
  OntarioIconGrid,
  OntarioIconNotification,
  OntarioIconSettings,
} from '@ongov/ontario-design-system-component-library-react';
import type { NavItem } from './navigation.types';

// ODS has no home or briefcase icons — closest available icons used per AGENTS.md gap policy.
export const sideNavigationItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    icon: OntarioIconGrid,
  },
  {
    id: 'notifications',
    label: 'Notifications',
    href: '/notifications',
    icon: OntarioIconNotification,
    badgeLabel: '10',
  },
  {
    id: 'services',
    label: 'Services',
    href: '/services',
    icon: OntarioIconSettings,
  },
  {
    id: 'manage-business-profile',
    label: 'Manage business profile',
    icon: OntarioIconAccount,
    children: [
      { id: 'transactions', label: 'Transactions', href: '/transactions' },
      { id: 'business-profile', label: 'Business profile', href: '/business-profile' },
      { id: 'user-management', label: 'User management', href: '/user-management' },
    ],
  },
  {
    id: 'your-account',
    label: 'Your account',
    href: '/your-account',
    icon: OntarioIconGrid,
  },
  {
    id: 'add-business-profile',
    label: 'Add business profile',
    href: '/add-business-profile',
    icon: OntarioIconAddAlt,
  },
];
