import { useMemo, useState } from 'react';
import {
  OntarioCheckboxes,
  OntarioIconChevronDown,
  OntarioIconChevronUp,
  OntarioPageAlert,
  OntarioRadioButtons,
} from '@ongov/ontario-design-system-component-library-react';
import {
  getPermitTypeById,
  listMinistriesWithEligiblePermits,
  listPermitTypesByMinistry,
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

type PermitCreateScopeV10Props = {
  access: PermitApplicationAccess;
  onChange: (access: PermitApplicationAccess) => void;
};

function applyCheckboxToggle(current: string[], event: globalThis.Event): string[] {
  const target = event.target as HTMLInputElement | null;
  if (!target?.value) {
    return current;
  }

  const checked =
    typeof target.checked === 'boolean' ? target.checked : !current.includes(target.value);

  if (checked) {
    return current.includes(target.value) ? current : [...current, target.value];
  }

  return current.filter((value) => value !== target.value);
}

function getRadioValue(event: globalThis.Event) {
  const target = event.target as HTMLInputElement | null;
  return target?.value ?? '';
}

/** Catalog labels include "(ACRONYM)"; card titles show the full name only. */
function ministryFullName(label: string) {
  return label.replace(/\s*\([^)]+\)\s*$/, '');
}

function permitTagKey(permitTypeId: string) {
  return `permit:${permitTypeId}`;
}

/**
 * V10 create scope — expandable ministry cards; combo tags sync with permit
 * checkboxes so selection can happen in the combo or in the card.
 * Ministry-only combo checks only filter the card list (no tags).
 */
export function PermitCreateScopeV10({ access, onChange }: PermitCreateScopeV10Props) {
  const ministries = listMinistriesWithEligiblePermits();
  /** Browse-only ministry filters (no permit grant / no tags). Empty = show all. */
  const [ministryBrowseIds, setMinistryBrowseIds] = useState<CdpsMinistryId[]>([]);
  const [expandedMinistryIds, setExpandedMinistryIds] = useState<CdpsMinistryId[]>([]);

  const createMode: PermitCreateMode | '' = access.create.mode ?? '';
  const showAllMinistries = ministryBrowseIds.length === 0;

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

  const ministriesWithVisibleTypes = useMemo(() => {
    const filterSet = new Set(ministryBrowseIds);
    return ministries
      .filter((ministry) => showAllMinistries || filterSet.has(ministry.ministryId))
      .map((ministry) => {
        const permitTypes = listPermitTypesByMinistry(ministry.ministryId);
        return { ministry, permitTypes, visibleTypes: permitTypes };
      })
      .filter((entry) => entry.visibleTypes.length > 0);
  }, [ministries, ministryBrowseIds, showAllMinistries]);

  function toggleMinistryExpanded(ministryId: CdpsMinistryId) {
    setExpandedMinistryIds((current) => {
      if (current.includes(ministryId)) {
        return current.filter((id) => id !== ministryId);
      }
      return [...current, ministryId];
    });
  }

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

  function setMinistryPermitTypes(ministryId: CdpsMinistryId, permitTypeIds: string[]) {
    const byMinistry = { ...access.create.byMinistry };
    if (permitTypeIds.length === 0) {
      delete byMinistry[ministryId];
    } else {
      byMinistry[ministryId] = {
        mode: 'selected',
        permitTypeIds,
      };
    }

    patchCreate({
      ...access.create,
      mode: 'individual',
      byMinistry,
    });
  }

  /** Permit tags from the combo = create grants (same source as card checkboxes). */
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
        name="permit-create-mode-v10"
        hintExpander={{
          hint: 'What is the difference?',
          content:
            'All eligible permits from all ministries grants create access for every eligible permit type across every ministry—no further selection is needed. Select permits only lets you choose specific permit types by ministry.',
        }}
        value={createMode}
        options={[
          {
            value: 'all_ministries',
            elementId: 'permit-create-all-ministries-v10',
            label: 'All eligible permits from all ministries',
          },
          {
            value: 'individual',
            elementId: 'permit-create-individual-v10',
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
              Filter by ministry or permit
            </h5>
            <MinistryPermitFilterCombo
              ministries={ministries}
              tags={permitTagsFromAccess}
              onChange={handlePermitTagsChange}
              ministryBrowseIds={ministryBrowseIds}
              onMinistryBrowseChange={setMinistryBrowseIds}
            />
          </div>

          <div className={styles.permitBrowseListV6}>
            {ministries.length === 0 ? (
              <OntarioPageAlert
                type="informational"
                heading="No eligible permits"
                content="There are no organization-based permit types available to assign for create access."
              />
            ) : ministriesWithVisibleTypes.length === 0 ? (
              <p className={styles.subServiceMessage}>No ministries match this filter.</p>
            ) : (
              <ul className={styles.ministryScopeList}>
                {ministriesWithVisibleTypes.map(({ ministry, permitTypes, visibleTypes }) => {
                  const selectedIds =
                    access.create.byMinistry[ministry.ministryId]?.permitTypeIds ?? [];
                  const visibleIds = visibleTypes.map((permit) => permit.permitTypeId);
                  const allVisibleSelected =
                    visibleIds.length > 0 &&
                    visibleIds.every((id) => selectedIds.includes(id));
                  const selectAllValue = 'select-all';
                  const isExpanded = expandedMinistryIds.includes(ministry.ministryId);
                  const panelId = `ministry-permissions-panel-v10-${ministry.ministryId}`;
                  const toggleId = `ministry-permissions-toggle-v10-${ministry.ministryId}`;

                  return (
                    <li
                      key={ministry.ministryId}
                      className={
                        isExpanded
                          ? styles.ministryScopeItem
                          : `${styles.ministryScopeItem} ${styles.ministryScopeItemCollapsed}`
                      }
                    >
                      <div className={styles.ministryScopeHeader}>
                        <div className={styles.ministryScopeTitleRow}>
                          <h4 className={`ontario-h4 ${styles.permitSubsectionTitle}`}>
                            {ministry.ministryId}
                          </h4>
                          <p className={styles.permitSelectionCount} aria-live="polite">
                            {selectedIds.length} of {permitTypes.length} selected
                          </p>
                        </div>
                        <p className={styles.permitSubsectionHint}>
                          {ministryFullName(ministry.label)}
                        </p>
                        {!isExpanded ? (
                          <button
                            type="button"
                            id={toggleId}
                            className={styles.ministryPermissionsToggle}
                            aria-expanded={false}
                            aria-controls={panelId}
                            onClick={() => toggleMinistryExpanded(ministry.ministryId)}
                          >
                            <span
                              className={styles.ministryPermissionsToggleIcon}
                              aria-hidden="true"
                            >
                              <OntarioIconChevronDown colour="inherit" isDecorative />
                            </span>
                            Set permissions
                          </button>
                        ) : null}
                      </div>

                      {isExpanded ? (
                        <div
                          id={panelId}
                          role="region"
                          aria-labelledby={toggleId}
                          className={styles.ministryScopeDetails}
                        >
                          <div className={styles.permitTypePicker}>
                            <div className={styles.permitBulkActions}>
                              <OntarioCheckboxes
                                caption="Bulk actions"
                                name={`permit-select-all-v10-${ministry.ministryId}`}
                                value={allVisibleSelected ? [selectAllValue] : []}
                                options={[
                                  {
                                    value: selectAllValue,
                                    elementId: `permit-select-all-v10-${ministry.ministryId}`,
                                    label: 'Select all',
                                  },
                                ]}
                                customOnChange={(event) => {
                                  const next = applyCheckboxToggle(
                                    allVisibleSelected ? [selectAllValue] : [],
                                    event,
                                  );
                                  const checked = next.includes(selectAllValue);
                                  if (checked) {
                                    setMinistryPermitTypes(
                                      ministry.ministryId,
                                      permitTypes.map((permit) => permit.permitTypeId),
                                    );
                                    return;
                                  }
                                  setMinistryPermitTypes(ministry.ministryId, []);
                                }}
                              />
                              <button
                                type="button"
                                className={styles.ministryPermissionsToggle}
                                aria-label={`Clear all permit types for ${ministry.label}`}
                                onClick={() => setMinistryPermitTypes(ministry.ministryId, [])}
                              >
                                Clear all
                              </button>
                            </div>

                            <OntarioCheckboxes
                              caption="Permit types"
                              name={`permit-types-v10-${ministry.ministryId}`}
                              hintText="Select specific permit types for this ministry."
                              value={selectedIds}
                              options={visibleTypes.map((permit) => ({
                                value: permit.permitTypeId,
                                elementId: `permit-type-v10-${permit.permitTypeId}`,
                                label: permit.permitShortName,
                              }))}
                              customOnChange={(event) => {
                                const visibleIdSet = new Set(visibleIds);
                                const selectedVisible = applyCheckboxToggle(
                                  selectedIds.filter((id) => visibleIdSet.has(id)),
                                  event,
                                );
                                const keptHidden = selectedIds.filter(
                                  (id) => !visibleIdSet.has(id),
                                );
                                setMinistryPermitTypes(ministry.ministryId, [
                                  ...keptHidden,
                                  ...selectedVisible,
                                ]);
                              }}
                            />
                          </div>

                          <button
                            type="button"
                            id={toggleId}
                            className={styles.ministryPermissionsToggle}
                            aria-expanded={true}
                            aria-controls={panelId}
                            onClick={() => toggleMinistryExpanded(ministry.ministryId)}
                          >
                            <span
                              className={styles.ministryPermissionsToggleIcon}
                              aria-hidden="true"
                            >
                              <OntarioIconChevronUp colour="inherit" isDecorative />
                            </span>
                            Hide permissions
                          </button>
                        </div>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      ) : null}

      {!createMode ? (
        <p className={styles.permitSubsectionHint}>
          Choose which permits this person can apply for to configure create access.
        </p>
      ) : null}
    </div>
  );
}
