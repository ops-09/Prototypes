import { useMemo, useState } from 'react';
import {
  OntarioButton,
  OntarioCheckboxes,
  OntarioPageAlert,
  OntarioRadioButtons,
} from '@ongov/ontario-design-system-component-library-react';
import {
  getMinistryLabel,
  listMinistriesWithEligiblePermits,
  listOrgApplications,
  listPermitTypesByMinistry,
  type CdpsMinistryId,
} from '../../../rbac/cdpsPermitCatalog';
import type {
  PermitApplicationAccess,
  PermitMinistryCreateScope,
} from '../../../rbac/types';
import userTableStyles from '../../user-management/UsersTable.module.scss';
import { ApplicationSearchAutosuggest } from '../ApplicationSearchAutosuggest';
import { PermitTabBar, type PermitTabId } from '../PermitTabBar';
import { TablePermissionCheckbox } from '../TablePermissionCheckbox';
import styles from '../InviteUserWizard.module.scss';
import { PermitCreateScopeV5 } from './PermitCreateScopeV5';
import { PermitCreateScopeV6 } from './PermitCreateScopeV6';
import { PermitCreateScopeV8 } from './PermitCreateScopeV8';
import { PermitCreateScopeV9 } from './PermitCreateScopeV9';
import { PermitCreateScopeV10 } from './PermitCreateScopeV10';
import { PermitCreateScopeV11 } from './PermitCreateScopeV11';
import { PermitCreateScopeV12 } from './PermitCreateScopeV12';

type PermitApplicationsSectionProps = {
  access: PermitApplicationAccess;
  onChange: (access: PermitApplicationAccess) => void;
  errorMessage?: string;
  /** `gated` = V3; `tabs` = V4; `tabs-v5`–`tabs-v12` = create-scope variants. */
  variant?:
    | 'gated'
    | 'tabs'
    | 'tabs-v5'
    | 'tabs-v6'
    | 'tabs-v8'
    | 'tabs-v9'
    | 'tabs-v10'
    | 'tabs-v11'
    | 'tabs-v12';
  /** When set (e.g. V7–V12 Permissions step), parent owns tabs. */
  controlledTab?: PermitTabId;
  hideTabBar?: boolean;
  /** V12: display step to return to from the permit catalog. */
  catalogReturnDisplayStep?: number;
  /** V14: show application filter on the permit catalog page. */
  catalogShowAccessNeedsFilter?: boolean;
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

function toggleIdInList(ids: string[], id: string, checked: boolean) {
  if (checked) {
    return ids.includes(id) ? ids : [...ids, id];
  }
  return ids.filter((existing) => existing !== id);
}

export function PermitApplicationsSection({
  access,
  onChange,
  errorMessage,
  variant = 'gated',
  controlledTab,
  hideTabBar = false,
  catalogReturnDisplayStep = 3,
  catalogShowAccessNeedsFilter = false,
}: PermitApplicationsSectionProps) {
  const ministries = listMinistriesWithEligiblePermits();
  const applications = listOrgApplications();
  const [permitSearchByMinistry, setPermitSearchByMinistry] = useState<
    Partial<Record<string, string>>
  >({});
  const [applicationSearch, setApplicationSearch] = useState('');
  const [internalTab, setInternalTab] = useState<PermitTabId>('create');
  const activeTab = controlledTab ?? internalTab;

  const useTabs =
    variant === 'tabs' ||
    variant === 'tabs-v5' ||
    variant === 'tabs-v6' ||
    variant === 'tabs-v8' ||
    variant === 'tabs-v9' ||
    variant === 'tabs-v10' ||
    variant === 'tabs-v11' ||
    variant === 'tabs-v12';
  const useV5Create = variant === 'tabs-v5';
  const useV6Create = variant === 'tabs-v6';
  const useV8Create = variant === 'tabs-v8';
  const useV9Create = variant === 'tabs-v9';
  const useV10Create = variant === 'tabs-v10';
  const useV11Create = variant === 'tabs-v11';
  const useV12Create = variant === 'tabs-v12';
  const existingEnabled = useTabs || access.view.enabled || access.edit.enabled;
  const createEnabled = useTabs || access.create.enabled;
  const showCreatePanel = useTabs ? activeTab === 'create' : createEnabled;
  const showExistingPanel = useTabs ? activeTab === 'existing' : existingEnabled;
  const showTabBar = useTabs && !hideTabBar;

  const actionValues = useMemo(() => {
    const values: string[] = [];
    if (access.create.enabled) {
      values.push('create');
    }
    if (existingEnabled) {
      values.push('existing');
    }
    return values;
  }, [access.create.enabled, existingEnabled]);

  const filteredApplications = useMemo(() => {
    const query = applicationSearch.trim().toLowerCase();
    if (!query) {
      return applications;
    }

    return applications.filter((app) => {
      return (
        app.displayName.toLowerCase().includes(query) ||
        app.applicationNumber.toLowerCase().includes(query) ||
        app.ministryId.toLowerCase().includes(query) ||
        getMinistryLabel(app.ministryId).toLowerCase().includes(query)
      );
    });
  }, [applicationSearch, applications]);

  function patchAccess(next: PermitApplicationAccess) {
    onChange(next);
  }

  function handleActionsChange(event: globalThis.Event) {
    const values = applyCheckboxToggle(actionValues, event);
    const nextExisting = values.includes('existing');
    patchAccess({
      ...access,
      create: {
        ...access.create,
        enabled: values.includes('create'),
      },
      // View/edit are not separate gates — one "Existing" action opens both columns.
      view: {
        ...access.view,
        enabled: nextExisting,
      },
      edit: {
        ...access.edit,
        enabled: nextExisting,
      },
    });
  }

  function ensureCreateEnabled(next: PermitApplicationAccess): PermitApplicationAccess {
    if (next.create.enabled) {
      return next;
    }
    return {
      ...next,
      create: {
        ...next.create,
        enabled: true,
      },
    };
  }

  function ensureExistingEnabled(next: PermitApplicationAccess): PermitApplicationAccess {
    if (next.view.enabled && next.edit.enabled) {
      return next;
    }
    return {
      ...next,
      view: { ...next.view, enabled: true },
      edit: { ...next.edit, enabled: true },
    };
  }

  function setMinistryIncluded(ministryId: CdpsMinistryId, included: boolean) {
    const byMinistry = { ...access.create.byMinistry };
    if (!included) {
      delete byMinistry[ministryId];
    } else if (!byMinistry[ministryId]) {
      byMinistry[ministryId] = { mode: 'all', permitTypeIds: [] };
    }

    patchAccess(
      ensureCreateEnabled({
        ...access,
        create: {
          ...access.create,
          byMinistry,
        },
      }),
    );
  }

  function setMinistryMode(ministryId: CdpsMinistryId, mode: 'all' | 'selected') {
    const current = access.create.byMinistry[ministryId];
    const nextScope: PermitMinistryCreateScope = {
      mode,
      permitTypeIds: mode === 'all' ? [] : (current?.permitTypeIds ?? []),
    };

    patchAccess(
      ensureCreateEnabled({
        ...access,
        create: {
          ...access.create,
          byMinistry: {
            ...access.create.byMinistry,
            [ministryId]: nextScope,
          },
        },
      }),
    );
  }

  function setMinistryPermitTypes(ministryId: CdpsMinistryId, permitTypeIds: string[]) {
    patchAccess(
      ensureCreateEnabled({
        ...access,
        create: {
          ...access.create,
          byMinistry: {
            ...access.create.byMinistry,
            [ministryId]: {
              mode: 'selected',
              permitTypeIds,
            },
          },
        },
      }),
    );
  }

  function setApplicationGrant(
    applicationId: string,
    kind: 'view' | 'edit',
    checked: boolean,
  ) {
    if (kind === 'view') {
      // Clearing view also clears edit (edit implies view), matching mining projects.
      const nextViewIds = toggleIdInList(access.view.applicationIds, applicationId, checked);
      const nextEditIds = checked
        ? access.edit.applicationIds
        : toggleIdInList(access.edit.applicationIds, applicationId, false);

      patchAccess(
        ensureExistingEnabled({
          ...access,
          view: {
            ...access.view,
            applicationIds: nextViewIds,
          },
          edit: {
            ...access.edit,
            applicationIds: nextEditIds,
          },
        }),
      );
      return;
    }

    const nextEditIds = toggleIdInList(access.edit.applicationIds, applicationId, checked);
    // Edit implies view at runtime; keep view id in sync when edit is checked.
    const nextViewIds = checked
      ? toggleIdInList(access.view.applicationIds, applicationId, true)
      : access.view.applicationIds;

    patchAccess(
      ensureExistingEnabled({
        ...access,
        edit: {
          ...access.edit,
          applicationIds: nextEditIds,
        },
        view: {
          ...access.view,
          applicationIds: nextViewIds,
        },
      }),
    );
  }

  const includedMinistryIds = Object.keys(access.create.byMinistry);

  return (
    <div className={styles.permitApplicationsRoot}>
        {!useTabs ? (
          <OntarioPageAlert
            type="informational"
            heading="Mining projects"
            content="Mining project permissions are managed under Mining Projects, not under Permit Applications."
          />
        ) : null}

        {showTabBar ? (
          <PermitTabBar activeTab={activeTab} onChange={setInternalTab} />
        ) : null}

        {!useTabs ? (
          <OntarioCheckboxes
            caption="Actions"
            name="permit-application-actions"
            hintText="Turn on the actions this user needs. Details appear for each selected action."
            value={actionValues}
            options={[
              {
                value: 'create',
                elementId: 'permit-action-create',
                label: 'Create new permit application',
              },
              {
                value: 'existing',
                elementId: 'permit-action-existing',
                label: 'Existing applications',
              },
            ]}
            customOnChange={handleActionsChange}
          />
        ) : null}

        {errorMessage ? (
          <p className={styles.fieldErrorMessage} role="alert">
            {errorMessage}
          </p>
        ) : null}

        {showCreatePanel ? (
          <div
            className={styles.permitCreateScope}
            role={useTabs ? 'tabpanel' : undefined}
            id={useTabs ? 'permit-tabpanel-create' : undefined}
            aria-labelledby={useTabs ? 'permit-tab-create' : undefined}
          >
            {useV12Create ? (
              <PermitCreateScopeV12
                access={access}
                onChange={onChange}
                returnDisplayStep={catalogReturnDisplayStep}
                catalogShowAccessNeedsFilter={catalogShowAccessNeedsFilter}
              />
            ) : useV11Create ? (
              <PermitCreateScopeV11 access={access} onChange={onChange} />
            ) : useV10Create ? (
              <PermitCreateScopeV10 access={access} onChange={onChange} />
            ) : useV9Create ? (
              <PermitCreateScopeV9 access={access} onChange={onChange} />
            ) : useV8Create ? (
              <PermitCreateScopeV8 access={access} onChange={onChange} />
            ) : useV6Create ? (
              <PermitCreateScopeV6 access={access} onChange={onChange} />
            ) : useV5Create ? (
              <PermitCreateScopeV5 access={access} onChange={onChange} />
            ) : (
              <>
                {!useTabs ? (
                  <h4 className={`ontario-h5 ${styles.permitSubsectionTitle}`}>
                    Create scope by ministry
                  </h4>
                ) : null}
                <p className={styles.permitSubsectionHint}>
                  Choose All permit types or Selected types for each ministry.
                </p>

                {ministries.length === 0 ? (
                  <OntarioPageAlert
                    type="informational"
                    heading="No eligible permits"
                    content="There are no organization-based permit types available to assign for create access."
                  />
                ) : (
                  <ul className={styles.ministryScopeList}>
                    {ministries.map((ministry) => {
                      const scope = access.create.byMinistry[ministry.ministryId];
                      const included = Boolean(scope);
                      const permitTypes = listPermitTypesByMinistry(ministry.ministryId);
                      const searchQuery =
                        permitSearchByMinistry[ministry.ministryId]?.trim().toLowerCase() ?? '';
                      const visibleTypes = permitTypes.filter((permit) => {
                        if (!searchQuery) {
                          return true;
                        }
                        return permit.permitShortName.toLowerCase().includes(searchQuery);
                      });

                      return (
                        <li key={ministry.ministryId} className={styles.ministryScopeItem}>
                          <OntarioCheckboxes
                            caption={ministry.label}
                            name={`permit-ministry-include-${ministry.ministryId}`}
                            value={included ? [ministry.ministryId] : []}
                            options={[
                              {
                                value: ministry.ministryId,
                                elementId: `permit-ministry-${ministry.ministryId}`,
                                label: 'Include this ministry for create access',
                              },
                            ]}
                            customOnChange={(event) => {
                              const values = applyCheckboxToggle(
                                included ? [ministry.ministryId] : [],
                                event,
                              );
                              setMinistryIncluded(
                                ministry.ministryId,
                                values.includes(ministry.ministryId),
                              );
                            }}
                          />

                          {included && scope ? (
                            <div className={styles.ministryScopeDetails}>
                              <OntarioRadioButtons
                                caption="Permit types for this ministry"
                                name={`permit-ministry-mode-${ministry.ministryId}`}
                                value={scope.mode}
                                options={[
                                  {
                                    value: 'all',
                                    elementId: `permit-mode-all-${ministry.ministryId}`,
                                    label: 'All permit types',
                                  },
                                  {
                                    value: 'selected',
                                    elementId: `permit-mode-selected-${ministry.ministryId}`,
                                    label: 'Selected permit types',
                                  },
                                ]}
                                customOnChange={(event) => {
                                  const value = getRadioValue(event);
                                  if (value === 'all' || value === 'selected') {
                                    setMinistryMode(ministry.ministryId, value);
                                  }
                                }}
                              />

                              {scope.mode === 'selected' ? (
                                <div className={styles.permitTypePicker}>
                                  <label
                                    className={styles.permitSearchLabel}
                                    htmlFor={`permit-type-search-${ministry.ministryId}`}
                                  >
                                    Search permit types
                                  </label>
                                  <input
                                    id={`permit-type-search-${ministry.ministryId}`}
                                    className={styles.permitSearchInput}
                                    type="search"
                                    value={permitSearchByMinistry[ministry.ministryId] ?? ''}
                                    onChange={(event) => {
                                      setPermitSearchByMinistry((current) => ({
                                        ...current,
                                        [ministry.ministryId]: event.target.value,
                                      }));
                                    }}
                                  />

                                  {visibleTypes.length === 0 ? (
                                    <p className={styles.subServiceMessage}>
                                      No permit types match this search.
                                    </p>
                                  ) : (
                                    <OntarioCheckboxes
                                      caption="Permit types"
                                      name={`permit-types-${ministry.ministryId}`}
                                      hintText="Use Select all below when you need most types, then uncheck exceptions."
                                      value={scope.permitTypeIds}
                                      options={visibleTypes.map((permit) => ({
                                        value: permit.permitTypeId,
                                        elementId: `permit-type-${permit.permitTypeId}`,
                                        label: permit.permitShortName,
                                      }))}
                                      customOnChange={(event) => {
                                        const visibleIds = new Set(
                                          visibleTypes.map((permit) => permit.permitTypeId),
                                        );
                                        const selectedVisible = applyCheckboxToggle(
                                          scope.permitTypeIds.filter((id) => visibleIds.has(id)),
                                          event,
                                        );
                                        const keptHidden = scope.permitTypeIds.filter(
                                          (id) => !visibleIds.has(id),
                                        );
                                        setMinistryPermitTypes(ministry.ministryId, [
                                          ...keptHidden,
                                          ...selectedVisible,
                                        ]);
                                      }}
                                    />
                                  )}

                                  <div className={styles.permitBulkActions}>
                                    <OntarioButton
                                      type="tertiary"
                                      htmlType="button"
                                      ariaLabelText={
                                        searchQuery
                                          ? `Select matching permit types for ${ministry.label}`
                                          : `Select all permit types for ${ministry.label}`
                                      }
                                      onClick={() => {
                                        const visibleIds = visibleTypes.map(
                                          (permit) => permit.permitTypeId,
                                        );
                                        if (searchQuery) {
                                          const merged = new Set([
                                            ...scope.permitTypeIds,
                                            ...visibleIds,
                                          ]);
                                          setMinistryPermitTypes(
                                            ministry.ministryId,
                                            Array.from(merged),
                                          );
                                          return;
                                        }
                                        setMinistryPermitTypes(
                                          ministry.ministryId,
                                          permitTypes.map((permit) => permit.permitTypeId),
                                        );
                                      }}
                                    >
                                      {searchQuery ? 'Select matching' : 'Select all'}
                                    </OntarioButton>
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
                                          const visibleIds = new Set(
                                            visibleTypes.map((permit) => permit.permitTypeId),
                                          );
                                          setMinistryPermitTypes(
                                            ministry.ministryId,
                                            scope.permitTypeIds.filter(
                                              (id) => !visibleIds.has(id),
                                            ),
                                          );
                                          return;
                                        }
                                        setMinistryPermitTypes(ministry.ministryId, []);
                                      }}
                                    >
                                      {searchQuery ? 'Clear matching' : 'Clear all'}
                                    </OntarioButton>
                                    <p
                                      className={styles.permitSelectionCount}
                                      aria-live="polite"
                                    >
                                      {scope.permitTypeIds.length} of {permitTypes.length}{' '}
                                      selected
                                    </p>
                                  </div>
                                </div>
                              ) : null}
                            </div>
                          ) : null}
                        </li>
                      );
                    })}
                  </ul>
                )}

                {createEnabled && includedMinistryIds.length === 0 ? (
                  <p className={styles.fieldErrorMessage} role="status">
                    Include at least one ministry
                    {useTabs ? '.' : ', or turn off Create new.'}
                  </p>
                ) : null}
              </>
            )}
          </div>
        ) : null}

        {showExistingPanel ? (
          <div
            className={styles.permitExistingScope}
            role={useTabs ? 'tabpanel' : undefined}
            id={useTabs ? 'permit-tabpanel-existing' : undefined}
            aria-labelledby={useTabs ? 'permit-tab-existing' : undefined}
          >
            {!useTabs ? (
              <h4 className={`ontario-h5 ${styles.permitSubsectionTitle}`}>
                Existing applications
              </h4>
            ) : null}
            {applications.length === 0 ? (
              <OntarioPageAlert
                type="informational"
                heading="No existing applications"
                content="There are no draft or submitted applications in this organization profile yet."
              />
            ) : (
              <>
                <ApplicationSearchAutosuggest
                  applications={applications}
                  value={applicationSearch}
                  onChange={setApplicationSearch}
                />

                {filteredApplications.length === 0 ? (
                  <p className={styles.subServiceMessage}>
                    No applications match this search.
                  </p>
                ) : (
                  <div className={userTableStyles.tableWrap}>
                    <table className={userTableStyles.table}>
                      <caption className="ontario-show-for-sr">
                        Existing application permissions
                      </caption>
                      <thead>
                        <tr>
                          <th
                            scope="col"
                            className={`ontario-h6 ${userTableStyles.columnHeader}`}
                          >
                            Application
                          </th>
                          <th
                            scope="col"
                            className={`ontario-h6 ${userTableStyles.columnHeader}`}
                          >
                            Ministry
                          </th>
                          <th
                            scope="col"
                            className={`ontario-h6 ${userTableStyles.columnHeader} ${userTableStyles.checkboxColumnHeader}`}
                          >
                            View
                          </th>
                          <th
                            scope="col"
                            className={`ontario-h6 ${userTableStyles.columnHeader} ${userTableStyles.checkboxColumnHeader}`}
                          >
                            Edit
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredApplications.map((app) => {
                          const viewChecked = access.view.applicationIds.includes(
                            app.applicationId,
                          );
                          const editChecked = access.edit.applicationIds.includes(
                            app.applicationId,
                          );

                          return (
                            <tr key={app.applicationId}>
                              <td>
                                <span className={styles.applicationName}>
                                  {app.displayName}
                                </span>
                                <span className={styles.applicationMeta}>
                                  #{app.applicationNumber} · {app.status}
                                </span>
                              </td>
                              <td>
                                <span
                                  className={userTableStyles.cellText}
                                  title={getMinistryLabel(app.ministryId)}
                                >
                                  {app.ministryId}
                                </span>
                              </td>
                              <td className={userTableStyles.tableCheckboxCell}>
                                <TablePermissionCheckbox
                                  projectLabel={app.displayName}
                                  permissionLabel="View"
                                  name={`app-view-${app.applicationId}`}
                                  elementId={`app-view-${app.applicationId}`}
                                  checked={viewChecked || editChecked}
                                  onChange={(checked) =>
                                    setApplicationGrant(app.applicationId, 'view', checked)
                                  }
                                />
                              </td>
                              <td className={userTableStyles.tableCheckboxCell}>
                                <TablePermissionCheckbox
                                  projectLabel={app.displayName}
                                  permissionLabel="Edit"
                                  name={`app-edit-${app.applicationId}`}
                                  elementId={`app-edit-${app.applicationId}`}
                                  checked={editChecked}
                                  onChange={(checked) =>
                                    setApplicationGrant(app.applicationId, 'edit', checked)
                                  }
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        ) : null}
    </div>
  );
}
