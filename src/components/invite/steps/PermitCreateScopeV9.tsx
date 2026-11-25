import { useEffect, useMemo, useState } from 'react';
import {
  OntarioCheckboxes,
  OntarioIconChevronDown,
  OntarioIconChevronUp,
  OntarioPageAlert,
  OntarioRadioButtons,
} from '@ongov/ontario-design-system-component-library-react';
import {
  listMinistriesWithEligiblePermits,
  listPermitTypesByMinistry,
  type CdpsMinistry,
  type CdpsMinistryId,
  type CdpsPermitType,
} from '../../../rbac/cdpsPermitCatalog';
import { isPermitCreateMode } from '../../../rbac/permitApplicationAccess';
import type { PermitApplicationAccess, PermitCreateMode } from '../../../rbac/types';
import { MinistryPermitBrowseSearch } from '../MinistryPermitBrowseSearch';
import styles from '../InviteUserWizard.module.scss';

type PermitCreateScopeV9Props = {
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

type MinistryVisibleEntry = {
  ministry: CdpsMinistry;
  permitTypes: CdpsPermitType[];
  visibleTypes: CdpsPermitType[];
};

function ministryMatchesBrowseQuery(ministry: CdpsMinistry, normalized: string) {
  const id = ministry.ministryId.toLowerCase();
  const label = ministry.label.toLowerCase();
  const fullName = ministryFullName(ministry.label).toLowerCase();

  return id.includes(normalized) || label.includes(normalized) || fullName.includes(normalized);
}

function filterMinistriesByBrowseQuery(
  ministries: CdpsMinistry[],
  browseQuery: string,
): MinistryVisibleEntry[] {
  const normalized = browseQuery.trim().toLowerCase();

  return ministries
    .map((ministry) => {
      const permitTypes = listPermitTypesByMinistry(ministry.ministryId);
      if (!normalized) {
        return { ministry, permitTypes, visibleTypes: permitTypes };
      }

      const matchedPermits = permitTypes.filter(
        (permit) =>
          permit.permitShortName.toLowerCase().includes(normalized) ||
          permit.permitTypeId.toLowerCase().includes(normalized),
      );

      if (ministryMatchesBrowseQuery(ministry, normalized)) {
        return { ministry, permitTypes, visibleTypes: permitTypes };
      }

      if (matchedPermits.length > 0) {
        return { ministry, permitTypes, visibleTypes: matchedPermits };
      }

      return null;
    })
    .filter((entry): entry is MinistryVisibleEntry => entry !== null && entry.visibleTypes.length > 0);
}

/**
 * V9 create scope — expandable ministry cards with OntarioSearchBox browse filter.
 */
export function PermitCreateScopeV9({ access, onChange }: PermitCreateScopeV9Props) {
  const ministries = useMemo(() => listMinistriesWithEligiblePermits(), []);
  const [browseQuery, setBrowseQuery] = useState('');
  const [expandedMinistryIds, setExpandedMinistryIds] = useState<CdpsMinistryId[]>([]);

  const createMode: PermitCreateMode | '' = access.create.mode ?? '';

  const ministriesWithVisibleTypes = useMemo(
    () => filterMinistriesByBrowseQuery(ministries, browseQuery),
    [browseQuery, ministries],
  );

  useEffect(() => {
    if (!browseQuery.trim()) {
      return;
    }
    setExpandedMinistryIds(
      filterMinistriesByBrowseQuery(ministries, browseQuery).map(
        (entry) => entry.ministry.ministryId,
      ),
    );
  }, [browseQuery, ministries]);

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

  return (
    <div className={styles.permitCreateScopeV6}>
      <OntarioRadioButtons
        caption="Which permits can this person apply for?"
        name="permit-create-mode-v9"
        hintExpander={{
          hint: 'What is the difference?',
          content:
            'All eligible permits from all ministries grants create access for every eligible permit type across every ministry—no further selection is needed. Select permits only lets you choose specific permit types by ministry.',
        }}
        value={createMode}
        options={[
          {
            value: 'all_ministries',
            elementId: 'permit-create-all-ministries-v9',
            label: 'All eligible permits from all ministries',
          },
          {
            value: 'individual',
            elementId: 'permit-create-individual-v9',
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
            <MinistryPermitBrowseSearch
              elementId="v9-ministry-permit-search"
              value={browseQuery}
              onChange={setBrowseQuery}
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
                  const panelId = `ministry-permissions-panel-v9-${ministry.ministryId}`;
                  const toggleId = `ministry-permissions-toggle-v9-${ministry.ministryId}`;

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
                                name={`permit-select-all-v9-${ministry.ministryId}`}
                                value={allVisibleSelected ? [selectAllValue] : []}
                                options={[
                                  {
                                    value: selectAllValue,
                                    elementId: `permit-select-all-v9-${ministry.ministryId}`,
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
                              name={`permit-types-v9-${ministry.ministryId}`}
                              hintText="Select specific permit types for this ministry."
                              value={selectedIds}
                              options={visibleTypes.map((permit) => ({
                                value: permit.permitTypeId,
                                elementId: `permit-type-v9-${permit.permitTypeId}`,
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
