import { useMemo, useState } from 'react';
import {
  OntarioButton,
  OntarioCheckboxes,
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
import styles from '../InviteUserWizard.module.scss';

type PermitCreateScopeV5Props = {
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

export function PermitCreateScopeV5({ access, onChange }: PermitCreateScopeV5Props) {
  const ministries = listMinistriesWithEligiblePermits();
  const [globalSearch, setGlobalSearch] = useState('');

  const createMode: PermitCreateMode | '' = access.create.mode ?? '';
  const searchQuery = globalSearch.trim().toLowerCase();

  const ministriesWithVisibleTypes = useMemo(() => {
    return ministries
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
  }, [ministries, searchQuery]);

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
    <div className={styles.permitCreateScopeV5}>
      <OntarioRadioButtons
        caption="Create access"
        name="permit-create-mode-v5"
        hintText="Grant create for every eligible permit, or pick specific types."
        value={createMode}
        options={[
          {
            value: 'all_ministries',
            elementId: 'permit-create-all-ministries',
            label: 'All ministries',
          },
          {
            value: 'individual',
            elementId: 'permit-create-individual',
            label: 'Individual permits',
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
          type="informational"
          heading="All ministries selected"
          content="Create access for every eligible permit type in every ministry. No per-type selection is needed."
        />
      ) : null}

      {createMode === 'individual' ? (
        <>
          <label className={styles.permitSearchLabel} htmlFor="permit-type-search-v5">
            Search permit types
          </label>
          <input
            id="permit-type-search-v5"
            className={styles.permitSearchInput}
            type="search"
            value={globalSearch}
            placeholder="Filter by permit name or ministry"
            onChange={(event) => setGlobalSearch(event.target.value)}
          />

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

                return (
                  <li key={ministry.ministryId} className={styles.ministryScopeItem}>
                    <div className={styles.ministryScopeHeader}>
                      <h4 className={`ontario-h6 ${styles.permitSubsectionTitle}`}>
                        {ministry.label}
                      </h4>
                      <div className={styles.ministryScopeHeaderMeta}>
                        <p className={styles.permitSelectionCount} aria-live="polite">
                          {selectedIds.length} of {permitTypes.length} selected
                          {searchQuery
                            ? ` · showing ${visibleTypes.length} match${visibleTypes.length === 1 ? '' : 'es'}`
                            : ''}
                        </p>
                        <OntarioButton
                          type="tertiary"
                          htmlType="button"
                          ariaLabelText={
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
                        </OntarioButton>
                      </div>
                    </div>

                    <div className={styles.permitTypePicker}>
                      <OntarioCheckboxes
                        caption="Bulk select"
                        name={`permit-select-all-v5-${ministry.ministryId}`}
                        value={allVisibleSelected ? [selectAllValue] : []}
                        options={[
                          {
                            value: selectAllValue,
                            elementId: `permit-select-all-v5-${ministry.ministryId}`,
                            label: searchQuery ? 'Select matching' : 'Select all',
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

                      <OntarioCheckboxes
                        caption="Permit types"
                        name={`permit-types-v5-${ministry.ministryId}`}
                        hintText="Select specific permit types for this ministry."
                        value={selectedIds}
                        options={visibleTypes.map((permit) => ({
                          value: permit.permitTypeId,
                          elementId: `permit-type-v5-${permit.permitTypeId}`,
                          label: permit.permitShortName,
                        }))}
                        customOnChange={(event) => {
                          const visibleIdSet = new Set(visibleIds);
                          const selectedVisible = applyCheckboxToggle(
                            selectedIds.filter((id) => visibleIdSet.has(id)),
                            event,
                          );
                          const keptHidden = selectedIds.filter((id) => !visibleIdSet.has(id));
                          setMinistryPermitTypes(ministry.ministryId, [
                            ...keptHidden,
                            ...selectedVisible,
                          ]);
                        }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      ) : null}

      {!createMode ? (
        <p className={styles.permitSubsectionHint}>
          Choose All ministries or Individual permits to configure create access.
        </p>
      ) : null}
    </div>
  );
}
