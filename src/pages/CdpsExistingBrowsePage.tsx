import { useMemo, useState } from 'react';
import { OntarioPageAlert } from '@ongov/ontario-design-system-component-library-react';
import { AppShell } from '../components/layout/AppShell';
import { PageBoilerplate } from '../components/layout/PageBoilerplate';
import { getMinistryLabel } from '../rbac/cdpsPermitCatalog';
import { resolveDemoPermitAccess } from '../rbac/demoPermitGrants';
import { listExistingBrowseApplications } from '../rbac/permitApplicationAccess';
import styles from './CdpsRuntime.module.scss';

export function CdpsExistingBrowsePage() {
  const { access, sourceLabel } = useMemo(() => resolveDemoPermitAccess(), []);
  const [query, setQuery] = useState('');
  const applications = listExistingBrowseApplications(access, query);

  return (
    <AppShell>
      <PageBoilerplate
        title="Existing applications"
        description="View and edit applications granted on invite."
        containerLabel="Existing applications content"
      >
        <OntarioPageAlert
          type="informational"
          heading="Demo grants"
          content={`Showing existing applications filtered by: ${sourceLabel}. Assign view/edit scopes in Invite (V3), then return here.`}
        />

        <div className={styles.runtimeStack}>
          <label className={styles.searchLabel} htmlFor="cdps-existing-search">
            Search by name, number, or ministry
          </label>
          <input
            id="cdps-existing-search"
            className={styles.searchInput}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />

          {applications.length === 0 ? (
            <OntarioPageAlert
              type="warning"
              heading="No matching applications"
              content="No granted applications match this search, or this profile has no view/edit grants."
            />
          ) : (
            <ul className={styles.resultList}>
              {applications.map((app) => (
                <li key={app.applicationId} className={styles.resultItem}>
                  <span className={styles.resultTitle}>{app.displayName}</span>
                  <span className={styles.resultMeta}>
                    {getMinistryLabel(app.ministryId)} · #{app.applicationNumber} ·{' '}
                    {app.status} · {app.accessLevel}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </PageBoilerplate>
    </AppShell>
  );
}
