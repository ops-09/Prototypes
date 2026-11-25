import { useEffect, useMemo, useState } from 'react';
import {
  OntarioIconChevronDown,
  OntarioIconChevronUp,
  OntarioPageAlert,
} from '@ongov/ontario-design-system-component-library-react';
import {
  getMinistryLabel,
  listOrgApplications,
  type CdpsApplication,
  type CdpsApplicationStatus,
} from '../../../rbac/cdpsPermitCatalog';
import type { PermitApplicationAccess } from '../../../rbac/types';
import userTableStyles from '../../user-management/UsersTable.module.scss';
import { TABLE_PAGE_SIZE, TablePaginationBar } from '../../shared/TablePaginationBar';
import { ApplicationSearchAutosuggest } from '../ApplicationSearchAutosuggest';
import { TablePermissionCheckbox } from '../TablePermissionCheckbox';
import styles from '../InviteUserWizard.module.scss';
import { INVITE_FIELD_ANCHORS } from '../inviteValidation';

type ExistingAccessPanelProps = {
  access: PermitApplicationAccess;
  onChange: (access: PermitApplicationAccess) => void;
  /** When true, show an h3 heading (catalog / filter panels). */
  showHeading?: boolean;
};

type SortKey = 'ministry' | 'status';
type SortDirection = 'asc' | 'desc';

function toggleIdInList(ids: string[], id: string, checked: boolean) {
  if (checked) {
    return ids.includes(id) ? ids : [...ids, id];
  }
  return ids.filter((existing) => existing !== id);
}

function formatStatus(status: CdpsApplicationStatus) {
  return status === 'draft' ? 'Draft' : 'Submitted';
}

function compareApplications(
  a: CdpsApplication,
  b: CdpsApplication,
  sortKey: SortKey,
  sortDirection: SortDirection,
) {
  const direction = sortDirection === 'asc' ? 1 : -1;
  if (sortKey === 'ministry') {
    const ministryCmp = a.ministryId.localeCompare(b.ministryId) * direction;
    if (ministryCmp !== 0) {
      return ministryCmp;
    }
    return a.displayName.localeCompare(b.displayName);
  }

  const statusCmp = a.status.localeCompare(b.status) * direction;
  if (statusCmp !== 0) {
    return statusCmp;
  }
  return a.displayName.localeCompare(b.displayName);
}

/** Existing application view/edit grants — mining-card layout with status + sort. */
export function ExistingAccessPanel({
  access,
  onChange,
  showHeading = false,
}: ExistingAccessPanelProps) {
  const applications = useMemo(() => listOrgApplications(), []);
  const [applicationSearch, setApplicationSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('ministry');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = TABLE_PAGE_SIZE;

  const filteredApplications = useMemo(() => {
    const normalized = applicationSearch.trim().toLowerCase();
    const filtered = !normalized
      ? applications
      : applications.filter((app) => {
          const haystack =
            `${app.displayName} ${app.applicationNumber} ${app.ministryId} ${app.status}`.toLowerCase();
          return haystack.includes(normalized);
        });

    return [...filtered].sort((a, b) => compareApplications(a, b, sortKey, sortDirection));
  }, [applicationSearch, applications, sortDirection, sortKey]);

  const totalApplications = filteredApplications.length;
  const totalPages = Math.max(1, Math.ceil(totalApplications / pageSize));

  useEffect(() => {
    setCurrentPage(1);
  }, [applicationSearch, sortDirection, sortKey]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const pageStart = (currentPage - 1) * pageSize;
  const visibleApplications = filteredApplications.slice(pageStart, pageStart + pageSize);

  function ensureExistingEnabled(next: PermitApplicationAccess): PermitApplicationAccess {
    return {
      ...next,
      enabled: true,
      view: { ...next.view, enabled: true },
      edit: { ...next.edit, enabled: true },
    };
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

      onChange(
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
    const nextViewIds = checked
      ? toggleIdInList(access.view.applicationIds, applicationId, true)
      : access.view.applicationIds;

    onChange(
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

  function toggleSort(nextKey: SortKey) {
    if (sortKey === nextKey) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortKey(nextKey);
    setSortDirection('asc');
  }

  function sortAria(nextKey: SortKey): 'none' | 'ascending' | 'descending' {
    if (sortKey !== nextKey) {
      return 'none';
    }
    return sortDirection === 'asc' ? 'ascending' : 'descending';
  }

  function sortButtonLabel(nextKey: SortKey, label: string) {
    if (sortKey !== nextKey) {
      return `Sort by ${label}`;
    }
    return `Sort by ${label}, currently ${sortDirection === 'asc' ? 'ascending' : 'descending'}. Activate to reverse.`;
  }

  function renderSortButton(nextKey: SortKey, label: string) {
    const isActive = sortKey === nextKey;
    return (
      <button
        type="button"
        className={
          isActive
            ? `${styles.sortableColumnButton} ${styles.sortableColumnButtonActive}`
            : styles.sortableColumnButton
        }
        aria-label={sortButtonLabel(nextKey, label)}
        onClick={() => toggleSort(nextKey)}
      >
        {label}
        <span className={styles.sortableColumnIcon} aria-hidden="true">
          {isActive && sortDirection === 'asc' ? (
            <OntarioIconChevronUp colour="inherit" iconWidth={16} isDecorative />
          ) : (
            <OntarioIconChevronDown colour="inherit" iconWidth={16} isDecorative />
          )}
        </span>
      </button>
    );
  }

  if (applications.length === 0) {
    return (
      <div
        id={INVITE_FIELD_ANCHORS.permitAccess}
        className={styles.permitExistingScope}
        tabIndex={-1}
      >
        {showHeading ? (
          <h3 className={`ontario-h5 ${styles.permitSubsectionTitle}`}>Existing applications</h3>
        ) : null}
        <OntarioPageAlert
          type="informational"
          heading="No existing applications"
          content="There are no draft or submitted applications in this organization profile yet."
        />
      </div>
    );
  }

  return (
    <div id={INVITE_FIELD_ANCHORS.permitAccess} tabIndex={-1}>
      <div className={styles.miningPermissionsCard}>
        <div className={styles.miningPermissionsHeader}>
          <div className={styles.miningPermissionsHeaderTop}>
            <h3 className={`ontario-h5 ${styles.miningPermissionsTitle}`}>
              {showHeading ? 'Existing applications' : 'Existing Applications'}
            </h3>
            <div className={styles.projectPermissionsSearchWrap}>
              <ApplicationSearchAutosuggest
                applications={applications}
                value={applicationSearch}
                onChange={setApplicationSearch}
              />
            </div>
          </div>
        </div>

        <section
          className={styles.projectPermissionsTable}
          aria-label="Existing application permissions"
        >
          <div className={userTableStyles.tableWrap}>
            <table className={userTableStyles.table}>
              <caption className="ontario-show-for-sr">
                Existing application permissions. Sort by ministry or status.
              </caption>
              <thead>
                <tr>
                  <th scope="col" className={`ontario-h6 ${userTableStyles.columnHeader}`}>
                    Application
                  </th>
                  <th
                    scope="col"
                    className={`ontario-h6 ${userTableStyles.columnHeader}`}
                    aria-sort={sortAria('ministry')}
                  >
                    {renderSortButton('ministry', 'Ministry')}
                  </th>
                  <th
                    scope="col"
                    className={`ontario-h6 ${userTableStyles.columnHeader}`}
                    aria-sort={sortAria('status')}
                  >
                    {renderSortButton('status', 'Status')}
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
                {visibleApplications.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      <span className={userTableStyles.cellText}>
                        No applications match this search.
                      </span>
                    </td>
                  </tr>
                ) : (
                  visibleApplications.map((app) => {
                    const viewChecked = access.view.applicationIds.includes(app.applicationId);
                    const editChecked = access.edit.applicationIds.includes(app.applicationId);

                    return (
                      <tr key={app.applicationId}>
                        <td>
                          <span className={userTableStyles.cellText}>{app.displayName}</span>
                          <span className={styles.applicationMeta}>#{app.applicationNumber}</span>
                        </td>
                        <td>
                          <span
                            className={userTableStyles.cellText}
                            title={getMinistryLabel(app.ministryId)}
                          >
                            {app.ministryId}
                          </span>
                        </td>
                        <td>
                          <span className={userTableStyles.cellText}>
                            {formatStatus(app.status)}
                          </span>
                        </td>
                        <td className={userTableStyles.tableCheckboxCell}>
                          <TablePermissionCheckbox
                            projectLabel={app.displayName}
                            permissionLabel="View"
                            name={`catalog-app-view-${app.applicationId}`}
                            elementId={`catalog-app-view-${app.applicationId}`}
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
                            name={`catalog-app-edit-${app.applicationId}`}
                            elementId={`catalog-app-edit-${app.applicationId}`}
                            checked={editChecked}
                            onChange={(checked) =>
                              setApplicationGrant(app.applicationId, 'edit', checked)
                            }
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <TablePaginationBar
            totalItems={totalApplications}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </section>
      </div>
    </div>
  );
}
