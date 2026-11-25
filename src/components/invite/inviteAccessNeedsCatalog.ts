/**
 * V13 “What will this person need to do?” options.
 * Permits and licences → New + Existing tabs; Mining → Mining tab.
 */
export type InviteAccessNeedId = 'create_permits' | 'mining_projects';

export type InviteAccessNeed = {
  id: InviteAccessNeedId;
  label: string;
  description: string;
  /** Search keywords beyond label/description. */
  keywords?: string[];
};

export const INVITE_ACCESS_NEEDS: InviteAccessNeed[] = [
  {
    id: 'create_permits',
    label: 'Permits and licences',
    description:
      'Allow this person to start new permit or licence applications, and to view or edit existing ones.',
    keywords: ['create', 'new', 'existing', 'cdps', 'permit', 'licence'],
  },
  {
    id: 'mining_projects',
    label: 'Work on Mining projects',
    description: 'Allow this person to create Mining projects or access existing ones.',
    keywords: ['mining', 'project'],
  },
];

export function filterAccessNeeds(query: string): InviteAccessNeed[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return INVITE_ACCESS_NEEDS;
  }

  return INVITE_ACCESS_NEEDS.filter((need) => {
    if (need.label.toLowerCase().includes(normalized)) {
      return true;
    }
    if (need.description.toLowerCase().includes(normalized)) {
      return true;
    }
    return (need.keywords ?? []).some((keyword) => keyword.includes(normalized));
  });
}

export function isInviteAccessNeedId(value: string): value is InviteAccessNeedId {
  return INVITE_ACCESS_NEEDS.some((need) => need.id === value);
}
