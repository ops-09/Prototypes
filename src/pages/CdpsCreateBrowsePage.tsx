import { useMemo, useState } from 'react';
import {
  OntarioDropdownList,
  OntarioPageAlert,
} from '@ongov/ontario-design-system-component-library-react';
import { AppShell } from '../components/layout/AppShell';
import { PageBoilerplate } from '../components/layout/PageBoilerplate';
import {
  getMinistryLabel,
  type CdpsMinistryId,
} from '../rbac/cdpsPermitCatalog';
import { resolveDemoPermitAccess } from '../rbac/demoPermitGrants';
import {
  listCreateBrowseMinistries,
  listCreateBrowsePermitTypes,
} from '../rbac/permitApplicationAccess';
import styles from './CdpsRuntime.module.scss';

export function CdpsCreateBrowsePage() {
  const { access, sourceLabel } = useMemo(() => resolveDemoPermitAccess(), []);
  const ministries = listCreateBrowseMinistries(access);
  const [ministryId, setMinistryId] = useState<CdpsMinistryId | ''>('');
  const [query, setQuery] = useState('');

  const permits = listCreateBrowsePermitTypes(
    access,
    query,
    ministryId || undefined,
  );

  return (
    <AppShell>
      <PageBoilerplate
        title="Create permit application"
        description="Browse ministries and permit types allowed by your create grants."
        containerLabel="Create permit application content"
      >
        <OntarioPageAlert
          type="informational"
          heading="Demo grants"
          content={`Showing create browse filtered by: ${sourceLabel}. Assign scopes in Invite (V3), then return here.`}
        />

        <div className={styles.runtimeStack}>
          {ministries.length === 0 ? (
            <OntarioPageAlert
              type="warning"
              heading="No create access"
              content="This profile has no create ministry grants. Invite a user with Create new permit application scopes, or use the scenario demo grants."
            />
          ) : (
            <>
              <OntarioDropdownList
                caption="Ministry"
                name="cdps-create-ministry"
                isEmptyStartOption
                value={ministryId}
                options={ministries.map((ministry) => ({
                  value: ministry.ministryId,
                  label: ministry.label,
                  elementId: `create-ministry-${ministry.ministryId}`,
                }))}
                customOnChange={(event) => {
                  const value = (event.target as HTMLSelectElement | null)?.value ?? '';
                  setMinistryId(value as CdpsMinistryId | '');
                }}
              />

              <label className={styles.searchLabel} htmlFor="cdps-create-search">
                Search permit types
              </label>
              <input
                id="cdps-create-search"
                className={styles.searchInput}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />

              {permits.length === 0 ? (
                <p className={styles.emptyMessage}>No permit types match these filters.</p>
              ) : (
                <ul className={styles.resultList}>
                  {permits.map((permit) => (
                    <li key={permit.permitTypeId} className={styles.resultItem}>
                      <span className={styles.resultTitle}>{permit.permitShortName}</span>
                      <span className={styles.resultMeta}>
                        {getMinistryLabel(permit.ministryId)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </PageBoilerplate>
    </AppShell>
  );
}
