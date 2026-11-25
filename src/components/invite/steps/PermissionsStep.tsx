import { useEffect, useMemo, useRef, useState } from 'react';
import { OntarioHintExpander } from '@ongov/ontario-design-system-component-library-react';
import type { PermitApplicationAccess, ServiceAccess } from '../../../rbac/types';
import {
  PermissionsTabBar,
  type PermissionsTabId,
} from '../PermissionsTabBar';
import { getPermissionsTabs } from '../inviteV7Path';
import { formatInviteStepTitle } from '../inviteWizardContent';
import { ExistingAccessPanel } from './ExistingAccessPanel';
import { MiningAccessPanel } from './MiningAccessPanel';
import { PermissionsAccordionV15 } from './PermissionsAccordionV15';
import { PermitApplicationsSection } from './PermitApplicationsSection';
import { SelectedPermissionsTableV14 } from './SelectedPermissionsTableV14';
import styles from '../InviteUserWizard.module.scss';

type PermissionsStepProps = {
  serviceAccess: ServiceAccess;
  permitApplicationAccess: PermitApplicationAccess;
  accessNeedIds?: string[];
  onServiceAccessChange: (serviceAccess: ServiceAccess) => void;
  onPermitApplicationAccessChange: (access: PermitApplicationAccess) => void;
  onAccessNeedIdsChange?: (accessNeedIds: string[]) => void;
  serviceAccessError?: string;
  permitAccessError?: string;
  /** V6 create UI by default; V8 expandable; V9–V11 combo; V12 catalog table. */
  createVariant?: 'v6' | 'v8' | 'v9' | 'v10' | 'v11' | 'v12';
  /** V12+: display step for catalog return navigation. */
  catalogReturnDisplayStep?: number;
  /**
   * V14: no create/existing/mining tabs — Add opens the catalog where application
   * filters show new permits, existing apps, mining, and other applications.
   */
  catalogShowAccessNeedsFilter?: boolean;
  /** V15: ministry-style expanders instead of tabs. */
  useAccordionSections?: boolean;
};

export function PermissionsStep({
  serviceAccess,
  permitApplicationAccess,
  accessNeedIds = [],
  onServiceAccessChange,
  onPermitApplicationAccessChange,
  onAccessNeedIdsChange,
  serviceAccessError,
  permitAccessError,
  createVariant = 'v6',
  catalogReturnDisplayStep = 3,
  catalogShowAccessNeedsFilter = false,
  useAccordionSections = false,
}: PermissionsStepProps) {
  const tabs = useMemo(() => getPermissionsTabs(accessNeedIds), [accessNeedIds]);
  const [activeTab, setActiveTab] = useState<PermissionsTabId>(() => tabs[0] ?? 'create');
  const openedDomainsRef = useRef(false);
  const hideScopeTabs = catalogShowAccessNeedsFilter || useAccordionSections;

  useEffect(() => {
    if (!tabs.includes(activeTab)) {
      setActiveTab(tabs[0] ?? 'create');
    }
  }, [activeTab, tabs]);

  // Open both domains so Mining / New / Existing panels can accept grants without a gates step.
  useEffect(() => {
    if (openedDomainsRef.current) {
      return;
    }
    openedDomainsRef.current = true;

    if (!serviceAccess.services.mining.enabled) {
      onServiceAccessChange({
        ...serviceAccess,
        services: {
          ...serviceAccess.services,
          mining: {
            ...serviceAccess.services.mining,
            enabled: true,
          },
        },
      });
    }

    if (!permitApplicationAccess.enabled) {
      onPermitApplicationAccessChange({
        ...permitApplicationAccess,
        enabled: true,
        create: {
          ...permitApplicationAccess.create,
          enabled: true,
        },
        view: {
          ...permitApplicationAccess.view,
          enabled: true,
        },
        edit: {
          ...permitApplicationAccess.edit,
          enabled: true,
        },
      });
    }
  }, [
    onPermitApplicationAccessChange,
    onServiceAccessChange,
    permitApplicationAccess,
    serviceAccess,
  ]);

  const showCreateTab = !hideScopeTabs && activeTab === 'create';
  const showExistingTab = !hideScopeTabs && activeTab === 'existing';

  return (
    <section className={styles.stepPanel} aria-label="Permissions">
      <div className={styles.permissionsHeading}>
        <h2 className={`ontario-h2 ${styles.stepPanelTitle}`}>
          {formatInviteStepTitle('Permissions')}
        </h2>
        <div className={styles.permissionsIntro}>
          <p className={styles.permissionsIntroText}>
            {useAccordionSections
              ? 'Choose what this person can do and which applications they can access.'
              : catalogShowAccessNeedsFilter
                ? 'Add permissions for this person. Use Add to choose new permits, existing applications, mining projects, or other applications.'
                : 'Choose which permissions to grant this person. Use the tabs below to configure new permit applications, existing applications, and mining projects.'}
          </p>
          {!useAccordionSections ? (
            <OntarioHintExpander
              hint="What is the difference between these permission types?"
              content={
                'Start new applications controls which permits this person can apply for. Access existing applications controls view and edit access to applications already in progress. Mining projects controls access to mining projects, including view, edit, and whether they can create projects.'
              }
            />
          ) : null}
        </div>
      </div>

      <div className={styles.permissionsStep}>
        {useAccordionSections ? (
          <PermissionsAccordionV15
            accessNeedIds={accessNeedIds}
            serviceAccess={serviceAccess}
            permitApplicationAccess={permitApplicationAccess}
            serviceAccessError={serviceAccessError}
            permitAccessError={permitAccessError}
            catalogReturnDisplayStep={catalogReturnDisplayStep}
            onServiceAccessChange={onServiceAccessChange}
            onPermitApplicationAccessChange={onPermitApplicationAccessChange}
          />
        ) : null}

        {!useAccordionSections && !catalogShowAccessNeedsFilter ? (
          <PermissionsTabBar tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        ) : null}

        {!useAccordionSections && !catalogShowAccessNeedsFilter && activeTab === 'mining' ? (
          <div
            role="tabpanel"
            id="permissions-tabpanel-mining"
            aria-labelledby="permissions-tab-mining"
          >
            <MiningAccessPanel
              serviceAccess={serviceAccess}
              serviceAccessError={serviceAccessError}
              onChange={onServiceAccessChange}
            />
          </div>
        ) : null}

        {catalogShowAccessNeedsFilter && !useAccordionSections ? (
          <div className={styles.permissionsSummaryV14}>
            {permitAccessError || serviceAccessError ? (
              <p className={styles.fieldErrorMessage} role="alert">
                {permitAccessError || serviceAccessError}
              </p>
            ) : null}
            <SelectedPermissionsTableV14
              access={permitApplicationAccess}
              serviceAccess={serviceAccess}
              accessNeedIds={accessNeedIds}
              returnDisplayStep={catalogReturnDisplayStep}
              onAccessChange={onPermitApplicationAccessChange}
              onServiceAccessChange={onServiceAccessChange}
              onAccessNeedIdsChange={onAccessNeedIdsChange ?? (() => undefined)}
            />
          </div>
        ) : null}

        {showExistingTab ? (
          <div
            role="tabpanel"
            id="permissions-tabpanel-existing"
            aria-labelledby="permissions-tab-existing"
          >
            {permitAccessError ? (
              <p className={styles.fieldErrorMessage} role="alert">
                {permitAccessError}
              </p>
            ) : null}
            <ExistingAccessPanel
              access={permitApplicationAccess}
              onChange={onPermitApplicationAccessChange}
            />
          </div>
        ) : null}

        {showCreateTab ? (
          <div
            role="tabpanel"
            id="permissions-tabpanel-create"
            aria-labelledby="permissions-tab-create"
          >
            <PermitApplicationsSection
              access={permitApplicationAccess}
              onChange={onPermitApplicationAccessChange}
              errorMessage={permitAccessError}
              variant={
                createVariant === 'v12'
                  ? 'tabs-v12'
                  : createVariant === 'v11'
                    ? 'tabs-v11'
                    : createVariant === 'v10'
                      ? 'tabs-v10'
                      : createVariant === 'v9'
                        ? 'tabs-v9'
                        : createVariant === 'v8'
                          ? 'tabs-v8'
                          : 'tabs-v6'
              }
              controlledTab="create"
              hideTabBar
              catalogReturnDisplayStep={catalogReturnDisplayStep}
              catalogShowAccessNeedsFilter={catalogShowAccessNeedsFilter}
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}
