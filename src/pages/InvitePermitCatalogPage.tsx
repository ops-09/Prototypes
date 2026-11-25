import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  OntarioButton,
  OntarioCheckboxes,
  OntarioDropdownList,
  OntarioIconAlertSuccess,
  OntarioIconChevronDown,
  OntarioIconChevronUp,
  OntarioIconDelete,
  OntarioPageAlert,
} from '@ongov/ontario-design-system-component-library-react';
import { AppShell } from '../components/layout/AppShell';
import { MinistryPermitBrowseSearch } from '../components/invite/MinistryPermitBrowseSearch';
import {
  getInviteStepPath,
  readInviteWizardDraft,
  writeInviteWizardDraft,
  type InvitePermitCatalogLocationState,
} from '../components/invite/inviteWizardPaths';
import { ExistingAccessPanel } from '../components/invite/steps/ExistingAccessPanel';
import { MiningAccessPanel } from '../components/invite/steps/MiningAccessPanel';
import inviteStyles from '../components/invite/InviteUserWizard.module.scss';
import {
  getApplicationById,
  getMinistryLabel,
  getPermitTypeById,
  listMinistriesWithEligiblePermits,
  listPermitTypesByMinistry,
  type CdpsMinistry,
  type CdpsMinistryId,
  type CdpsPermitType,
} from '../rbac/cdpsPermitCatalog';
import {
  createDefaultPermitApplicationAccess,
  listSelectedCreatePermitTypeIds,
  setIndividualCreatePermitTypeIds,
} from '../rbac/permitApplicationAccess';
import { DEFAULT_SERVICE_ACCESS, getSubServiceById } from '../rbac/services';
import type { PermitApplicationAccess, ServiceAccess } from '../rbac/types';
import styles from './InvitePermitCatalog.module.scss';

const MINING_SUB_SERVICE_ID = 'mining' as const;
const PERMITS_GROUP_ID = 'permits-licences' as const;

/** Footer “View selections” — hidden for now; set true to restore. */
const SHOW_CATALOG_VIEW_SELECTIONS = false;

type ApplicationFilterId =
  | 'create_permits'
  | 'existing_applications'
  | 'mining_projects';

const APPLICATION_FILTER_OPTIONS: { value: ApplicationFilterId; label: string }[] = [
  { value: 'create_permits', label: 'New permit applications' },
  { value: 'existing_applications', label: 'Existing applications' },
  { value: 'mining_projects', label: 'Mining projects' },
];

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

function ministryFullName(label: string) {
  return label.replace(/\s*\([^)]+\)\s*$/, '');
}

function getSelectValue(event: globalThis.Event) {
  const target = event.target as HTMLSelectElement | HTMLInputElement | null;
  return target?.value ?? '';
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

  // Match category code (MECP) or ministry name ("Environment", "Ministry of …").
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
        // Ministry / category match: keep the whole category card.
        return { ministry, permitTypes, visibleTypes: permitTypes };
      }

      if (matchedPermits.length > 0) {
        // Permit-name match: narrow the card to matching permits.
        return { ministry, permitTypes, visibleTypes: matchedPermits };
      }

      return null;
    })
    .filter((entry): entry is MinistryVisibleEntry => entry !== null && entry.visibleTypes.length > 0);
}

function isApplicationFilterId(value: string): value is ApplicationFilterId {
  return APPLICATION_FILTER_OPTIONS.some((option) => option.value === value);
}

function resolveInitialApplicationFilter(accessNeedIds: string[]): ApplicationFilterId | '' {
  const first = accessNeedIds[0];
  if (
    first === 'create_permits' ||
    first === 'existing_applications' ||
    first === 'mining_projects'
  ) {
    return first;
  }
  return '';
}

/**
 * V12 permit catalog subflow — V9-style expandable ministry cards with permit
 * checkboxes. V14 uses two dropdown filters (application + secondary) to show
 * new permits, existing apps, mining, or other applications.
 */
export function InvitePermitCatalogPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = (location.state as InvitePermitCatalogLocationState | null) ?? {};
  const returnDisplayStep = locationState.returnDisplayStep ?? 3;
  const useApplicationFilters = Boolean(locationState.showAccessNeedsFilter);

  const draft = useMemo(() => readInviteWizardDraft(), []);
  const ministries = useMemo(() => listMinistriesWithEligiblePermits(), []);
  const [browseQuery, setBrowseQuery] = useState('');
  const [expandedMinistryIds, setExpandedMinistryIds] = useState<CdpsMinistryId[]>([]);
  const [applicationFilter, setApplicationFilter] = useState<ApplicationFilterId | ''>(() =>
    useApplicationFilters ? resolveInitialApplicationFilter(draft?.accessNeedIds ?? []) : '',
  );
  const [serviceAccess, setServiceAccess] = useState<ServiceAccess>(() =>
    structuredClone(draft?.serviceAccess ?? DEFAULT_SERVICE_ACCESS),
  );
  const [permitAccess, setPermitAccess] = useState<PermitApplicationAccess>(() =>
    structuredClone(draft?.permitApplicationAccess ?? createDefaultPermitApplicationAccess()),
  );
  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    listSelectedCreatePermitTypeIds(
      draft?.permitApplicationAccess ?? createDefaultPermitApplicationAccess(),
    ),
  );
  const [selectionsOpen, setSelectionsOpen] = useState(false);
  const [selectionsDraftIds, setSelectionsDraftIds] = useState<string[]>([]);
  const [selectionsSavedInModal, setSelectionsSavedInModal] = useState(false);

  const showCreatePermits =
    !useApplicationFilters || applicationFilter === 'create_permits';
  const showExistingApps =
    useApplicationFilters && applicationFilter === 'existing_applications';
  const showMining = useApplicationFilters && applicationFilter === 'mining_projects';
  const waitingOnApplication = useApplicationFilters && !applicationFilter;

  const totalPermissionsSelected = useMemo(() => {
    let count = 0;

    if (permitAccess.create.mode === 'all_ministries') {
      count += 1;
    } else {
      count += selectedIds.length;
    }

    const existingIds = new Set([
      ...(permitAccess.view.enabled ? permitAccess.view.applicationIds : []),
      ...(permitAccess.edit.enabled ? permitAccess.edit.applicationIds : []),
    ]);
    count += existingIds.size;

    if (serviceAccess.groups[PERMITS_GROUP_ID]?.createProject) {
      count += 1;
    }
    const miningProjects = getSubServiceById(MINING_SUB_SERVICE_ID)?.projects ?? [];
    for (const project of miningProjects) {
      const permission = serviceAccess.services.mining.projectPermissions[project.id] ?? 'none';
      if (permission !== 'none') {
        count += 1;
      }
    }

    return count;
  }, [
    permitAccess.create.mode,
    permitAccess.edit,
    permitAccess.view,
    selectedIds.length,
    serviceAccess.groups,
    serviceAccess.services.mining.projectPermissions,
  ]);

  const ministriesWithVisibleTypes = useMemo(
    () => filterMinistriesByBrowseQuery(ministries, browseQuery),
    [browseQuery, ministries],
  );

  function buildPermitRows(permitTypeIds: string[]) {
    return permitTypeIds
      .map((permitTypeId) => {
        const permit = getPermitTypeById(permitTypeId);
        if (!permit) {
          return null;
        }
        return {
          permitTypeId: permit.permitTypeId,
          permitShortName: permit.permitShortName,
          ministryId: permit.ministryId,
          ministryLabel: getMinistryLabel(permit.ministryId),
        };
      })
      .filter((row): row is NonNullable<typeof row> => row !== null)
      .sort((a, b) => {
        const ministryCompare = a.ministryId.localeCompare(b.ministryId);
        if (ministryCompare !== 0) {
          return ministryCompare;
        }
        return a.permitShortName.localeCompare(b.permitShortName);
      });
  }

  const selectedPermitRows = useMemo(
    () => buildPermitRows(selectedIds),
    [selectedIds],
  );

  const selectionsDraftRows = useMemo(
    () => buildPermitRows(selectionsDraftIds),
    [selectionsDraftIds],
  );

  const selectionsDirty = useMemo(() => {
    if (selectionsDraftIds.length !== selectedIds.length) {
      return true;
    }
    const selectedSet = new Set(selectedIds);
    return selectionsDraftIds.some((id) => !selectedSet.has(id));
  }, [selectionsDraftIds, selectedIds]);

  function openSelectionsModal() {
    setSelectionsDraftIds([...selectedIds]);
    setSelectionsSavedInModal(false);
    setSelectionsOpen(true);
  }

  function closeSelectionsModal() {
    setSelectionsOpen(false);
    setSelectionsDraftIds([]);
    setSelectionsSavedInModal(false);
  }

  function cancelSelectionsEdits() {
    // Restore original list and return to Done (keep modal open).
    setSelectionsDraftIds([...selectedIds]);
    setSelectionsSavedInModal(false);
  }

  function saveSelectionsModal() {
    setSelectedIds(selectionsDraftIds);
    setSelectionsSavedInModal(true);
  }

  const selectedExistingApps = useMemo(() => {
    const ids = new Set([
      ...(permitAccess.view.enabled ? permitAccess.view.applicationIds : []),
      ...(permitAccess.edit.enabled ? permitAccess.edit.applicationIds : []),
    ]);
    return [...ids]
      .map((applicationId) => {
        const app = getApplicationById(applicationId);
        if (!app) {
          return null;
        }
        const canView =
          permitAccess.view.enabled && permitAccess.view.applicationIds.includes(applicationId);
        const canEdit =
          permitAccess.edit.enabled && permitAccess.edit.applicationIds.includes(applicationId);
        return {
          applicationId,
          displayName: app.displayName,
          applicationNumber: app.applicationNumber,
          accessLabel: canEdit ? 'Edit' : canView ? 'View' : 'None',
        };
      })
      .filter((row): row is NonNullable<typeof row> => row !== null);
  }, [permitAccess.edit, permitAccess.view]);

  const selectedMiningRows = useMemo(() => {
    const rows: string[] = [];
    if (serviceAccess.groups[PERMITS_GROUP_ID]?.createProject) {
      rows.push('Create mining projects');
    }
    const miningProjects = getSubServiceById(MINING_SUB_SERVICE_ID)?.projects ?? [];
    for (const project of miningProjects) {
      const permission = serviceAccess.services.mining.projectPermissions[project.id] ?? 'none';
      if (permission === 'none') {
        continue;
      }
      rows.push(`${project.label} (${permission})`);
    }
    return rows;
  }, [serviceAccess.groups, serviceAccess.services.mining.projectPermissions]);

  // Search by ministry or permit name: expand matching cards. Depend only on
  // browseQuery so manual View permits toggles are not cleared every render.
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

  useEffect(() => {
    if (!selectionsOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        closeSelectionsModal();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectionsOpen]);

  const browseSearchBox = (
    <MinistryPermitBrowseSearch
      elementId="catalog-ministry-permit-search"
      value={browseQuery}
      onChange={setBrowseQuery}
    />
  );

  function returnToPermissions() {
    navigate(getInviteStepPath(returnDisplayStep));
  }

  function selectedAccessNeedIds(): string[] {
    if (!useApplicationFilters || !applicationFilter) {
      return draft?.accessNeedIds ?? [];
    }
    if (applicationFilter === 'create_permits' || applicationFilter === 'existing_applications') {
      return ['create_permits'];
    }
    return [applicationFilter];
  }

  function confirmSelection() {
    const baseDraft = draft ?? {
      email: '',
      confirmEmail: '',
      roleId: '' as const,
      serviceAccess: structuredClone(DEFAULT_SERVICE_ACCESS),
      permitApplicationAccess: createDefaultPermitApplicationAccess(),
    };

    const nextPermitAccess = setIndividualCreatePermitTypeIds(permitAccess, selectedIds);

    writeInviteWizardDraft({
      ...baseDraft,
      accessNeedIds: useApplicationFilters ? selectedAccessNeedIds() : baseDraft.accessNeedIds,
      serviceAccess: useApplicationFilters ? serviceAccess : baseDraft.serviceAccess,
      permitApplicationAccess: nextPermitAccess,
    });

    returnToPermissions();
  }

  function toggleMinistryExpanded(ministryId: CdpsMinistryId) {
    setExpandedMinistryIds((current) => {
      if (current.includes(ministryId)) {
        return current.filter((id) => id !== ministryId);
      }
      return [...current, ministryId];
    });
  }

  function setMinistryPermitTypes(ministryId: CdpsMinistryId, permitTypeIds: string[]) {
    const ministryPermitIds = listPermitTypesByMinistry(ministryId).map(
      (permit) => permit.permitTypeId,
    );
    const ministryIdSet = new Set(ministryPermitIds);
    const withoutMinistry = selectedIds.filter((id) => !ministryIdSet.has(id));
    setSelectedIds([...withoutMinistry, ...permitTypeIds]);
  }

  function renderCreateCards() {
    return (
      <div className={inviteStyles.permitBrowseListV6}>
        {ministries.length === 0 ? (
          <OntarioPageAlert
            type="informational"
            heading="No eligible permits"
            content="There are no organization-based permit types available to assign for create access."
          />
        ) : ministriesWithVisibleTypes.length === 0 ? (
          <p className={inviteStyles.subServiceMessage}>No ministries match this filter.</p>
        ) : (
          <ul className={inviteStyles.ministryScopeList}>
            {ministriesWithVisibleTypes.map(({ ministry, permitTypes, visibleTypes }) => {
              const ministrySelectedIds = selectedIds.filter((id) =>
                visibleTypes.some((permit) => permit.permitTypeId === id),
              );
              const visibleIds = visibleTypes.map((permit) => permit.permitTypeId);
              const isExpanded = expandedMinistryIds.includes(ministry.ministryId);
              const panelId = `catalog-ministry-panel-${ministry.ministryId}`;
              const toggleId = `catalog-ministry-toggle-${ministry.ministryId}`;

              return (
                <li
                  key={ministry.ministryId}
                  className={
                    isExpanded
                      ? inviteStyles.ministryScopeItem
                      : `${inviteStyles.ministryScopeItem} ${inviteStyles.ministryScopeItemCollapsed}`
                  }
                >
                  <div className={inviteStyles.ministryScopeHeader}>
                    <div className={inviteStyles.ministryScopeTitleRow}>
                      <h4 className={`ontario-h4 ${inviteStyles.permitSubsectionTitle}`}>
                        {ministry.ministryId}
                      </h4>
                      <p className={inviteStyles.permitSelectionCount} aria-live="polite">
                        {ministrySelectedIds.length} of {permitTypes.length} selected
                      </p>
                    </div>
                    <p className={inviteStyles.permitSubsectionHint}>
                      {ministryFullName(ministry.label)}
                    </p>
                    {!isExpanded ? (
                      <button
                        type="button"
                        id={toggleId}
                        className={inviteStyles.ministryPermissionsToggle}
                        aria-expanded={false}
                        aria-controls={panelId}
                        onClick={() => toggleMinistryExpanded(ministry.ministryId)}
                      >
                        <span
                          className={inviteStyles.ministryPermissionsToggleIcon}
                          aria-hidden="true"
                        >
                          <OntarioIconChevronDown colour="inherit" isDecorative />
                        </span>
                        View permits
                      </button>
                    ) : null}
                  </div>

                  {isExpanded ? (
                    <div
                      id={panelId}
                      role="region"
                      aria-labelledby={toggleId}
                      className={inviteStyles.ministryScopeDetails}
                    >
                      <div className={inviteStyles.permitTypePicker}>
                        <p className={`ontario-h6 ${styles.permitTypesHeading}`}>Permit types</p>
                        <p className={styles.permitTypesHint}>
                          Select specific permit types for this ministry.
                        </p>
                        {/*
                          ODS always appends (optional)/(required) on the legend.
                          Label + hint live above; blank legend is clipped (host overflow only).
                        */}
                        <div className={styles.permitTypesCheckboxClip}>
                          <OntarioCheckboxes
                            required
                            caption={{
                              captionText: '\u200B',
                              captionType: 'default',
                            }}
                            name={`catalog-permit-types-${ministry.ministryId}`}
                            value={ministrySelectedIds}
                            options={visibleTypes.map((permit) => ({
                              value: permit.permitTypeId,
                              elementId: `catalog-permit-type-${permit.permitTypeId}`,
                              label: permit.permitShortName,
                            }))}
                            customOnChange={(event) => {
                              const visibleIdSet = new Set(visibleIds);
                              const selectedVisible = applyCheckboxToggle(
                                ministrySelectedIds.filter((id) => visibleIdSet.has(id)),
                                event,
                              );
                              setMinistryPermitTypes(ministry.ministryId, selectedVisible);
                            }}
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        id={toggleId}
                        className={inviteStyles.ministryPermissionsToggle}
                        aria-expanded={true}
                        aria-controls={panelId}
                        onClick={() => toggleMinistryExpanded(ministry.ministryId)}
                      >
                        <span
                          className={inviteStyles.ministryPermissionsToggleIcon}
                          aria-hidden="true"
                        >
                          <OntarioIconChevronUp colour="inherit" isDecorative />
                        </span>
                        Hide permits
                      </button>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    );
  }

  return (
    <AppShell hideSideNav flushContentTop>
      <div className={styles.page}>
        <h1 className={`ontario-h1 ${styles.pageTitle}`}>
          {useApplicationFilters ? 'Add permissions' : 'Select permits'}
        </h1>
        <p className={styles.lead}>
          {useApplicationFilters
            ? 'Choose an application, then search by ministry or permit type if needed. Clear the search to show all again. The permission options below update to match.'
            : 'Search by ministry or permit type to filter the list. Clear the search to show all again. Open a card to select permits, then add them to the invite.'}
        </p>

        {useApplicationFilters ? (
          <>
            <div className={styles.filterRow}>
              <OntarioDropdownList
                caption="Application"
                name="catalog-application-filter"
                elementId="catalog-application-filter"
                hintText="Choose which permission type to configure."
                isEmptyStartOption="Select an application"
                required
                value={applicationFilter}
                options={APPLICATION_FILTER_OPTIONS.map((option) => ({
                  value: option.value,
                  label: option.label,
                }))}
                customOnChange={(event) => {
                  const value = getSelectValue(event);
                  if (!value) {
                    setApplicationFilter('');
                    return;
                  }
                  if (isApplicationFilterId(value)) {
                    setApplicationFilter(value);
                  }
                }}
              />

              {applicationFilter === 'create_permits' ? (
                <div className={styles.ministryFilter}>{browseSearchBox}</div>
              ) : null}
            </div>
          </>
        ) : null}

        {waitingOnApplication ? (
          <OntarioPageAlert
            type="informational"
            heading="Select an application"
            content="Choose an application from the filter above to show the matching permission options."
          />
        ) : null}

        {showCreatePermits && !waitingOnApplication ? (
          <section className={styles.catalogSection} aria-label="New permit applications">
            <div className={styles.catalogBrowseLayout}>
              {useApplicationFilters ? null : (
                <div className={inviteStyles.permitBrowseToolsV6}>{browseSearchBox}</div>
              )}
              {renderCreateCards()}
            </div>
          </section>
        ) : null}

        {showExistingApps ? (
          <section className={styles.catalogSection} aria-label="Existing applications">
            <ExistingAccessPanel access={permitAccess} onChange={setPermitAccess} showHeading />
          </section>
        ) : null}

        {showMining ? (
          <section className={styles.catalogSection} aria-label="Mining projects">
            <MiningAccessPanel
              serviceAccess={serviceAccess}
              onChange={setServiceAccess}
              showHeading
            />
          </section>
        ) : null}

        <div className={styles.footer}>
          <div className={styles.footerActions}>
            <OntarioButton
              type="primary"
              htmlType="button"
              label={
                useApplicationFilters
                  ? `Add ${totalPermissionsSelected} permission${totalPermissionsSelected === 1 ? '' : 's'}`
                  : `Add ${selectedIds.length} permit${selectedIds.length === 1 ? '' : 's'}`
              }
              onClick={confirmSelection}
            />
            {SHOW_CATALOG_VIEW_SELECTIONS ? (
              <OntarioButton
                type="secondary"
                htmlType="button"
                label="View selections"
                onClick={openSelectionsModal}
              />
            ) : null}
            <OntarioButton type="tertiary" htmlType="button" onClick={returnToPermissions}>
              Cancel
            </OntarioButton>
          </div>
        </div>

        {selectionsOpen
          ? createPortal(
              // ODS has no modal dialog — compose overlay like AccessCustomizeOverlay.
              <div
                className={styles.selectionsOverlay}
                role="presentation"
                onMouseDown={closeSelectionsModal}
              >
                <div
                  className={styles.selectionsPanel}
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby={
                    selectionsDraftRows.length > 0
                      ? 'catalog-selections-title'
                      : useApplicationFilters && selectedExistingApps.length > 0
                        ? 'catalog-selections-existing'
                        : useApplicationFilters && selectedMiningRows.length > 0
                          ? 'catalog-selections-mining'
                          : undefined
                  }
                  aria-label={
                    selectionsDraftRows.length === 0 &&
                    selectedExistingApps.length === 0 &&
                    selectedMiningRows.length === 0
                      ? 'Your selections'
                      : undefined
                  }
                  onMouseDown={(event) => event.stopPropagation()}
                >
                  <div className={styles.selectionsBody}>
                    {selectionsSavedInModal ? (
                      // OntarioPageAlert always places content under the heading; compose
                      // icon + body text so the message aligns with the success icon.
                      <div className={styles.selectionsSuccess} role="status">
                        <span className={styles.selectionsSuccessIcon} aria-hidden="true">
                          <OntarioIconAlertSuccess iconWidth={32} isDecorative />
                        </span>
                        <p className={styles.selectionsSuccessText}>
                          Your permit selections were updated.
                        </p>
                      </div>
                    ) : null}

                    {useApplicationFilters &&
                    selectionsDraftRows.length === 0 &&
                    selectedExistingApps.length === 0 &&
                    selectedMiningRows.length === 0 ? (
                      <p className={styles.selectionsEmpty}>No permissions selected yet.</p>
                    ) : null}

                    {!useApplicationFilters && selectionsDraftRows.length === 0 ? (
                      <p className={styles.selectionsEmpty}>No permits selected yet.</p>
                    ) : null}

                    {selectionsDraftRows.length > 0 ? (
                      <section
                        className={styles.selectionsSection}
                        aria-labelledby="catalog-selections-title"
                      >
                        <h3
                          className={`ontario-h3 ${styles.selectionsSectionTitle}`}
                          id="catalog-selections-title"
                        >
                          Your Permit Selections ({selectionsDraftRows.length})
                        </h3>
                        <ul className={styles.selectionsList}>
                          {selectionsDraftRows.map((row) => (
                            <li key={row.permitTypeId} className={styles.selectionsRow}>
                              <div className={styles.selectionsItemText}>
                                <span className={styles.selectionsItemPrimary}>
                                  {row.permitShortName}
                                </span>
                                <span className={styles.selectionsItemMeta}>
                                  {row.ministryId} — {ministryFullName(row.ministryLabel)}
                                </span>
                              </div>
                              <button
                                type="button"
                                className={styles.selectionsRemove}
                                aria-label={`Remove ${row.permitShortName}`}
                                onClick={() => {
                                  setSelectionsSavedInModal(false);
                                  setSelectionsDraftIds((current) =>
                                    current.filter((id) => id !== row.permitTypeId),
                                  );
                                }}
                              >
                                <OntarioIconDelete colour="blue" iconWidth={24} isDecorative />
                                Remove
                              </button>
                            </li>
                          ))}
                        </ul>
                      </section>
                    ) : null}

                    {useApplicationFilters && selectedExistingApps.length > 0 ? (
                      <section
                        className={styles.selectionsSection}
                        aria-labelledby="catalog-selections-existing"
                      >
                        <h3
                          className={`ontario-h5 ${styles.selectionsSectionTitle}`}
                          id="catalog-selections-existing"
                        >
                          Existing applications ({selectedExistingApps.length})
                        </h3>
                        <ul className={styles.selectionsList}>
                          {selectedExistingApps.map((row) => (
                            <li key={row.applicationId}>
                              <span className={styles.selectionsItemPrimary}>
                                {row.displayName}
                              </span>
                              <span className={styles.selectionsItemMeta}>
                                #{row.applicationNumber} · {row.accessLabel}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </section>
                    ) : null}

                    {useApplicationFilters && selectedMiningRows.length > 0 ? (
                      <section
                        className={styles.selectionsSection}
                        aria-labelledby="catalog-selections-mining"
                      >
                        <h3
                          className={`ontario-h5 ${styles.selectionsSectionTitle}`}
                          id="catalog-selections-mining"
                        >
                          Mining projects ({selectedMiningRows.length})
                        </h3>
                        <ul className={styles.selectionsList}>
                          {selectedMiningRows.map((label) => (
                            <li key={label}>
                              <span className={styles.selectionsItemPrimary}>{label}</span>
                            </li>
                          ))}
                        </ul>
                      </section>
                    ) : null}
                  </div>

                  <div className={styles.selectionsActions}>
                    {selectionsDirty ? (
                      <>
                        <OntarioButton
                          type="primary"
                          htmlType="button"
                          label="Save"
                          onClick={saveSelectionsModal}
                        />
                        <OntarioButton
                          type="secondary"
                          htmlType="button"
                          label="Cancel"
                          onClick={cancelSelectionsEdits}
                        />
                      </>
                    ) : (
                      <OntarioButton
                        type="primary"
                        htmlType="button"
                        label="Done"
                        onClick={closeSelectionsModal}
                      />
                    )}
                  </div>
                </div>
              </div>,
              document.body,
            )
          : null}
      </div>
    </AppShell>
  );
}
