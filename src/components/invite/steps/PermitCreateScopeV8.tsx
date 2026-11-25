import { useMemo, useState } from 'react';
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
  type CdpsMinistryId,
} from '../../../rbac/cdpsPermitCatalog';
import { isPermitCreateMode } from '../../../rbac/permitApplicationAccess';
import type { PermitApplicationAccess, PermitCreateMode } from '../../../rbac/types';
import { PermitTypeSearchAutosuggest } from '../PermitTypeSearchAutosuggest';
import styles from '../InviteUserWizard.module.scss';

type PermitCreateScopeV8Props = {
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

/**
 * V8 create scope — same model as V6, ministry cards collapsed by default.
 * ODS HintExpander/Accordion cannot host interactive checkboxes; compose a
 * hint-expander-style link disclosure (tokens + chevron icons).
 */
export function PermitCreateScopeV8({ access, onChange }: PermitCreateScopeV8Props) {
  const ministries = listMinistriesWithEligiblePermits();
  const [globalSearch, setGlobalSearch] = useState('');
  /** Empty = all ministries. Otherwise show only selected ministry ids (multi-select). */
  const [ministryFilters, setMinistryFilters] = useState<CdpsMinistryId[]>([]);
  const [expandedMinistryIds, setExpandedMinistryIds] = useState<CdpsMinistryId[]>([]);

  const createMode: PermitCreateMode | '' = access.create.mode ?? '';
  const searchQuery = globalSearch.trim().toLowerCase();
  const showAllMinistries = ministryFilters.length === 0;

  const ministriesWithVisibleTypes = useMemo(() => {
    const filterSet = new Set(ministryFilters);
    return ministries
      .filter((ministry) => showAllMinistries || filterSet.has(ministry.ministryId))
      .map((ministry) => {
        const permitTypes = listPermitTypesByMinistry(ministry.ministryId);
        const visibleTypes = permitTypes.filter((permit) => {
          if (!searchQuery) {
            return true;
          }
          return (
            permit.permitShortName.toLowerCase().includes(searchQuery) ||
            ministry.label.toLowerCase().includes(searchQuery) ||
            ministry.ministryId.toLowerCase().includes(searchQuery)
          );
        });
        return { ministry, permitTypes, visibleTypes };
      })
      .filter((entry) => entry.visibleTypes.length > 0);
  }, [ministries, ministryFilters, searchQuery, showAllMinistries]);

  function toggleMinistryFilter(ministryId: CdpsMinistryId) {
    setMinistryFilters((current) => {
      if (current.includes(ministryId)) {
        return current.filter((id) => id !== ministryId);
      }
      return [...current, ministryId];
    });
  }

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
        name="permit-create-mode-v8"
        hintExpander={{
          hint: 'What is the difference?',
          content:
            'All eligible permits from all ministries grants create access for every eligible permit type across every ministry—no further selection is needed. Select permits only lets you choose specific permit types by ministry.',
        }}
        value={createMode}
        options={[
          {
            value: 'all_ministries',
            elementId: 'permit-create-all-ministries-v8',
            label: 'All eligible permits from all ministries',
          },
          {
            value: 'individual',
            elementId: 'permit-create-individual-v8',
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
              Search and Filter
            </h5>
            <PermitTypeSearchAutosuggest value={globalSearch} onChange={setGlobalSearch} />

            <div
              className={styles.permitMinistryChips}
              role="group"
              aria-label="Filter by ministry. Select more than one to combine."
            >
              <button
                type="button"
                className={
                  showAllMinistries
                    ? `${styles.permitMinistryChip} ${styles.permitMinistryChipActive}`
                    : styles.permitMinistryChip
                }
                aria-pressed={showAllMinistries}
                onClick={() => setMinistryFilters([])}
              >
                All ministries
              </button>
              {ministries.map((ministry) => {
                const pressed = ministryFilters.includes(ministry.ministryId);
                return (
                  <button
                    key={ministry.ministryId}
                    type="button"
                    className={
                      pressed
                        ? `${styles.permitMinistryChip} ${styles.permitMinistryChipActive}`
                        : styles.permitMinistryChip
                    }
                    aria-pressed={pressed}
                    title={ministry.label}
                    aria-label={ministry.label}
                    onClick={() => toggleMinistryFilter(ministry.ministryId)}
                  >
                    {ministry.ministryId}
                  </button>
                );
              })}
            </div>
          </div>

          <div className={styles.permitBrowseListV6}>
            {ministries.length === 0 ? (
              <OntarioPageAlert
                type="informational"
                heading="No eligible permits"
                content="There are no organization-based permit types available to assign for create access."
              />
            ) : ministriesWithVisibleTypes.length === 0 ? (
              <p className={styles.subServiceMessage}>No permit types match this search.</p>
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
                  const panelId = `ministry-permissions-panel-v8-${ministry.ministryId}`;
                  const toggleId = `ministry-permissions-toggle-v8-${ministry.ministryId}`;

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
                                name={`permit-select-all-v8-${ministry.ministryId}`}
                                value={allVisibleSelected ? [selectAllValue] : []}
                                options={[
                                  {
                                    value: selectAllValue,
                                    elementId: `permit-select-all-v8-${ministry.ministryId}`,
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
                                    if (searchQuery) {
                                      setMinistryPermitTypes(
                                        ministry.ministryId,
                                        Array.from(new Set([...selectedIds, ...visibleIds])),
                                      );
                                      return;
                                    }
                                    setMinistryPermitTypes(
                                      ministry.ministryId,
                                      permitTypes.map((permit) => permit.permitTypeId),
                                    );
                                    return;
                                  }

                                  if (searchQuery) {
                                    const visibleIdSet = new Set(visibleIds);
                                    setMinistryPermitTypes(
                                      ministry.ministryId,
                                      selectedIds.filter((id) => !visibleIdSet.has(id)),
                                    );
                                    return;
                                  }
                                  setMinistryPermitTypes(ministry.ministryId, []);
                                }}
                              />
                              <button
                                type="button"
                                className={styles.ministryPermissionsToggle}
                                aria-label={
                                  searchQuery
                                    ? `Clear matching permit types for ${ministry.label}`
                                    : `Clear all permit types for ${ministry.label}`
                                }
                                onClick={() => {
                                  if (searchQuery) {
                                    const visibleIdSet = new Set(visibleIds);
                                    setMinistryPermitTypes(
                                      ministry.ministryId,
                                      selectedIds.filter((id) => !visibleIdSet.has(id)),
                                    );
                                    return;
                                  }
                                  setMinistryPermitTypes(ministry.ministryId, []);
                                }}
                              >
                                {searchQuery ? 'Clear matching' : 'Clear all'}
                              </button>
                            </div>

                            <OntarioCheckboxes
                              caption="Permit types"
                              name={`permit-types-v8-${ministry.ministryId}`}
                              hintText="Select specific permit types for this ministry."
                              value={selectedIds}
                              options={visibleTypes.map((permit) => ({
                                value: permit.permitTypeId,
                                elementId: `permit-type-v8-${permit.permitTypeId}`,
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
