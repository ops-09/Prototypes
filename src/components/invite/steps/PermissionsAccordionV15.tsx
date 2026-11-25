import { useEffect, useMemo, useState, type KeyboardEvent } from 'react';
import {
  OntarioHintExpander,
  OntarioIconChevronDown,
  OntarioIconChevronUp,
  OntarioPageAlert,
} from '@ongov/ontario-design-system-component-library-react';
import type { PermitApplicationAccess, ServiceAccess } from '../../../rbac/types';
import { getPermissionsTabs, type PermissionsTabId } from '../inviteV7Path';
import { ExistingAccessPanel } from './ExistingAccessPanel';
import { MiningAccessPanel } from './MiningAccessPanel';
import { PermitApplicationsSection } from './PermitApplicationsSection';
import styles from '../InviteUserWizard.module.scss';

type PermissionsAccordionV15Props = {
  accessNeedIds: string[];
  serviceAccess: ServiceAccess;
  permitApplicationAccess: PermitApplicationAccess;
  serviceAccessError?: string;
  permitAccessError?: string;
  catalogReturnDisplayStep: number;
  onServiceAccessChange: (serviceAccess: ServiceAccess) => void;
  onPermitApplicationAccessChange: (access: PermitApplicationAccess) => void;
};

type DomainTabId = 'permits' | 'mining';

type AccordionSection = {
  id: PermissionsTabId;
  title: string;
  hint: string;
};

const DOMAIN_TAB_LABELS: Record<DomainTabId, string> = {
  permits: 'Permits and licences',
  mining: 'Mining projects',
};

const SECTION_COPY: Record<
  Exclude<PermissionsTabId, 'mining'>,
  Omit<AccordionSection, 'id'>
> = {
  create: {
    title: 'Start new applications',
    hint: 'Choose which permit types this person can start.',
  },
  existing: {
    title: 'Access existing applications',
    hint: 'Grant view or edit access to applications already in progress.',
  },
};

/**
 * V15 Permissions body — domain tabs with ministry-style expanders under
 * Permits and licences; Mining projects tab shows mining access.
 */
export function PermissionsAccordionV15({
  accessNeedIds,
  serviceAccess,
  permitApplicationAccess,
  serviceAccessError,
  permitAccessError,
  catalogReturnDisplayStep,
  onServiceAccessChange,
  onPermitApplicationAccessChange,
}: PermissionsAccordionV15Props) {
  const scopeTabs = useMemo(() => getPermissionsTabs(accessNeedIds), [accessNeedIds]);

  const domainTabs = useMemo((): DomainTabId[] => {
    const tabs: DomainTabId[] = [];
    if (scopeTabs.includes('create') || scopeTabs.includes('existing')) {
      tabs.push('permits');
    }
    if (scopeTabs.includes('mining')) {
      tabs.push('mining');
    }
    return tabs;
  }, [scopeTabs]);

  const permitSections = useMemo((): AccordionSection[] => {
    return scopeTabs
      .filter((id): id is 'create' | 'existing' => id === 'create' || id === 'existing')
      .map((id) => ({
        id,
        ...SECTION_COPY[id],
      }));
  }, [scopeTabs]);

  const [activeDomain, setActiveDomain] = useState<DomainTabId>(() => domainTabs[0] ?? 'permits');
  const [expandedIds, setExpandedIds] = useState<PermissionsTabId[]>(() =>
    permitSections[0] ? [permitSections[0].id] : [],
  );

  useEffect(() => {
    if (!domainTabs.includes(activeDomain)) {
      setActiveDomain(domainTabs[0] ?? 'permits');
    }
  }, [activeDomain, domainTabs]);

  useEffect(() => {
    const allowed = new Set(permitSections.map((section) => section.id));
    setExpandedIds((current) => {
      const next = current.filter((id) => allowed.has(id));
      if (next.length > 0) {
        return next;
      }
      return permitSections[0] ? [permitSections[0].id] : [];
    });
  }, [permitSections]);

  const expandedSet = useMemo(() => new Set(expandedIds), [expandedIds]);

  function toggleSection(sectionId: PermissionsTabId) {
    setExpandedIds((current) => {
      if (current.includes(sectionId)) {
        return current.filter((id) => id !== sectionId);
      }
      return [...current, sectionId];
    });
  }

  function handleDomainKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const currentIndex = domainTabs.findIndex((tab) => tab === activeDomain);
    if (currentIndex < 0 || domainTabs.length === 0) {
      return;
    }

    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      const delta = event.key === 'ArrowRight' ? 1 : -1;
      const nextIndex = (currentIndex + delta + domainTabs.length) % domainTabs.length;
      setActiveDomain(domainTabs[nextIndex]);
    }
  }

  if (domainTabs.length === 0) {
    return (
      <OntarioPageAlert
        type="informational"
        heading="No permission sections"
        content="Go back to Access needs and select Permits and licences and/or Mining projects."
      />
    );
  }

  return (
    <div className={styles.permissionsAccordionV15}>
      {(permitAccessError || serviceAccessError) && (
        <p className={styles.fieldErrorMessage} role="alert">
          {permitAccessError || serviceAccessError}
        </p>
      )}

      {domainTabs.length > 1 ? (
        <div
          className={styles.permitTabBar}
          role="tablist"
          aria-label="Permission domains"
          onKeyDown={handleDomainKeyDown}
        >
          {domainTabs.map((tabId) => {
            const selected = tabId === activeDomain;
            return (
              <button
                key={tabId}
                type="button"
                role="tab"
                id={`permissions-domain-tab-${tabId}`}
                aria-selected={selected}
                aria-controls={`permissions-domain-panel-${tabId}`}
                tabIndex={selected ? 0 : -1}
                className={
                  selected ? `${styles.permitTab} ${styles.permitTabActive}` : styles.permitTab
                }
                onClick={() => setActiveDomain(tabId)}
              >
                {DOMAIN_TAB_LABELS[tabId]}
              </button>
            );
          })}
          <div className={styles.permitTabBaseline} aria-hidden="true" />
        </div>
      ) : null}

      {activeDomain === 'permits' && domainTabs.includes('permits') ? (
        <div
          role={domainTabs.length > 1 ? 'tabpanel' : undefined}
          id="permissions-domain-panel-permits"
          aria-labelledby={
            domainTabs.length > 1 ? 'permissions-domain-tab-permits' : undefined
          }
        >
          {permitSections.length > 0 ? (
            <OntarioHintExpander
              hint="What is the difference between Start new and Access existing?"
              content=""
              elementId="permissions-hint-permits-difference"
            >
              <p className={styles.permissionsHintContent}>
                Start new applications controls which permits this person can apply
                for. Access existing applications controls view and edit access to
                applications already in progress.
              </p>
            </OntarioHintExpander>
          ) : null}
          <ul className={styles.ministryScopeList}>
            {permitSections.map((section) => {
              const isExpanded = expandedSet.has(section.id);
              const panelId = `permissions-accordion-panel-${section.id}`;
              const toggleId = `permissions-accordion-toggle-${section.id}`;

              return (
                <li
                  key={section.id}
                  className={
                    isExpanded
                      ? styles.ministryScopeItem
                      : `${styles.ministryScopeItem} ${styles.ministryScopeItemCollapsed}`
                  }
                >
                  <div className={styles.ministryScopeHeader}>
                    <div className={styles.ministryScopeTitleRow}>
                      <h3 className={`ontario-h4 ${styles.permitSubsectionTitle}`}>
                        {section.title}
                      </h3>
                    </div>
                    <p className={styles.permitSubsectionHint}>{section.hint}</p>
                    {!isExpanded ? (
                      <button
                        type="button"
                        id={toggleId}
                        className={styles.ministryPermissionsToggle}
                        aria-expanded={false}
                        aria-controls={panelId}
                        onClick={() => toggleSection(section.id)}
                      >
                        <span className={styles.ministryPermissionsToggleIcon} aria-hidden="true">
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
                      {section.id === 'create' ? (
                        <PermitApplicationsSection
                          access={permitApplicationAccess}
                          onChange={onPermitApplicationAccessChange}
                          variant="tabs-v12"
                          controlledTab="create"
                          hideTabBar
                          catalogReturnDisplayStep={catalogReturnDisplayStep}
                        />
                      ) : null}

                      {section.id === 'existing' ? (
                        <ExistingAccessPanel
                          access={permitApplicationAccess}
                          onChange={onPermitApplicationAccessChange}
                        />
                      ) : null}

                      <button
                        type="button"
                        id={toggleId}
                        className={styles.ministryPermissionsToggle}
                        aria-expanded={true}
                        aria-controls={panelId}
                        onClick={() => toggleSection(section.id)}
                      >
                        <span className={styles.ministryPermissionsToggleIcon} aria-hidden="true">
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
        </div>
      ) : null}

      {activeDomain === 'mining' && domainTabs.includes('mining') ? (
        <div
          role={domainTabs.length > 1 ? 'tabpanel' : undefined}
          id="permissions-domain-panel-mining"
          aria-labelledby={
            domainTabs.length > 1 ? 'permissions-domain-tab-mining' : undefined
          }
        >
          <MiningAccessPanel
            serviceAccess={serviceAccess}
            serviceAccessError={serviceAccessError}
            onChange={onServiceAccessChange}
            showHeading
          />
        </div>
      ) : null}
    </div>
  );
}
