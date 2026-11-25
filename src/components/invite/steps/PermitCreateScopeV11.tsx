import { useMemo } from 'react';
import {
  OntarioPageAlert,
  OntarioRadioButtons,
} from '@ongov/ontario-design-system-component-library-react';
import {
  getPermitTypeById,
  listMinistriesWithEligiblePermits,
  type CdpsMinistryId,
} from '../../../rbac/cdpsPermitCatalog';
import { isPermitCreateMode } from '../../../rbac/permitApplicationAccess';
import type {
  PermitApplicationAccess,
  PermitCreateMode,
  PermitMinistryCreateScope,
} from '../../../rbac/types';
import {
  MinistryPermitFilterCombo,
  type MinistryPermitFilterTag,
} from '../MinistryPermitFilterCombo';
import styles from '../InviteUserWizard.module.scss';

type PermitCreateScopeV11Props = {
  access: PermitApplicationAccess;
  onChange: (access: PermitApplicationAccess) => void;
};

function getRadioValue(event: globalThis.Event) {
  const target = event.target as HTMLInputElement | null;
  return target?.value ?? '';
}

function permitTagKey(permitTypeId: string) {
  return `permit:${permitTypeId}`;
}

/**
 * V11 create scope — search + permit tags only (no ministry cards).
 * Checking a ministry selects all (or matched) permits as tags.
 */
export function PermitCreateScopeV11({ access, onChange }: PermitCreateScopeV11Props) {
  const ministries = listMinistriesWithEligiblePermits();
  const createMode: PermitCreateMode | '' = access.create.mode ?? '';

  const permitTagsFromAccess = useMemo((): MinistryPermitFilterTag[] => {
    const tags: MinistryPermitFilterTag[] = [];
    for (const [ministryId, scope] of Object.entries(access.create.byMinistry)) {
      for (const permitTypeId of scope.permitTypeIds) {
        const permit = getPermitTypeById(permitTypeId);
        if (!permit) {
          continue;
        }
        tags.push({
          key: permitTagKey(permitTypeId),
          kind: 'permit',
          ministryId: ministryId as CdpsMinistryId,
          permitTypeId,
          permitShortName: permit.permitShortName,
        });
      }
    }
    return tags;
  }, [access.create.byMinistry]);

  function patchCreate(nextCreate: PermitApplicationAccess['create']) {
    onChange({
      ...access,
      create: {
        ...nextCreate,
        enabled: true,
      },
    });
  }

  function setCreateMode(mode: PermitCreateMode) {
    patchCreate({
      ...access.create,
      mode,
      byMinistry: access.create.byMinistry,
    });
  }

  function handlePermitTagsChange(nextTags: MinistryPermitFilterTag[]) {
    const byMinistry: Record<string, PermitMinistryCreateScope> = {};
    for (const tag of nextTags) {
      const existing = byMinistry[tag.ministryId];
      if (existing) {
        if (!existing.permitTypeIds.includes(tag.permitTypeId)) {
          existing.permitTypeIds.push(tag.permitTypeId);
        }
      } else {
        byMinistry[tag.ministryId] = {
          mode: 'selected',
          permitTypeIds: [tag.permitTypeId],
        };
      }
    }

    patchCreate({
      ...access.create,
      mode: 'individual',
      byMinistry,
    });
  }

  return (
    <div className={styles.permitCreateScopeV6}>
      <OntarioRadioButtons
        caption="Which permits can this person apply for?"
        name="permit-create-mode-v11"
        hintExpander={{
          hint: 'What is the difference?',
          content:
            'All eligible permits from all ministries grants create access for every eligible permit type across every ministry—no further selection is needed. Select permits only lets you search and choose specific permit types.',
        }}
        value={createMode}
        options={[
          {
            value: 'all_ministries',
            elementId: 'permit-create-all-ministries-v11',
            label: 'All eligible permits from all ministries',
          },
          {
            value: 'individual',
            elementId: 'permit-create-individual-v11',
            label: 'Select permits only',
          },
        ]}
        customOnChange={(event) => {
          const value = getRadioValue(event);
          if (isPermitCreateMode(value)) {
            setCreateMode(value);
          }
        }}
      />

      {createMode === 'all_ministries' ? (
        <OntarioPageAlert
          className={styles.flushPageAlert}
          type="informational"
          heading="All eligible permits"
          content="Create access for every eligible permit type in every ministry. No per-type selection is needed."
        />
      ) : null}

      {createMode === 'individual' ? (
        <div className={styles.permitIndividualLayoutV6}>
          <div className={styles.permitBrowseToolsV6}>
            <h5 className={`ontario-h5 ${styles.permitSubsectionTitle}`}>
              Search by ministry or permit
            </h5>
            {ministries.length === 0 ? (
              <OntarioPageAlert
                type="informational"
                heading="No eligible permits"
                content="There are no organization-based permit types available to assign for create access."
              />
            ) : (
              <MinistryPermitFilterCombo
                ministries={ministries}
                tags={permitTagsFromAccess}
                onChange={handlePermitTagsChange}
                selectAllPermitsOnMinistryCheck
                hintText="Search by ministry or permit type. Selected permits appear as tags below."
              />
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
