import type { KeyboardEvent } from 'react';
import styles from './InviteUserWizard.module.scss';
import type { PermissionsTabId } from './inviteV7Path';

export type { PermissionsTabId };

type PermissionsTabBarProps = {
  tabs: PermissionsTabId[];
  activeTab: PermissionsTabId;
  onChange: (tab: PermissionsTabId) => void;
};

const TAB_LABELS: Record<PermissionsTabId, string> = {
  mining: 'Mining Projects',
  create: 'New Permit Applications',
  existing: 'Existing Applications',
};

export function PermissionsTabBar({ tabs, activeTab, onChange }: PermissionsTabBarProps) {
  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const currentIndex = tabs.findIndex((tab) => tab === activeTab);
    if (currentIndex < 0 || tabs.length === 0) {
      return;
    }

    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      const delta = event.key === 'ArrowRight' ? 1 : -1;
      const nextIndex = (currentIndex + delta + tabs.length) % tabs.length;
      onChange(tabs[nextIndex]);
    }
  }

  return (
    <div
      className={styles.permitTabBar}
      role="tablist"
      aria-label="Permission scopes"
      onKeyDown={handleKeyDown}
    >
      {tabs.map((tabId) => {
        const selected = tabId === activeTab;
        return (
          <button
            key={tabId}
            type="button"
            role="tab"
            id={`permissions-tab-${tabId}`}
            aria-selected={selected}
            aria-controls={`permissions-tabpanel-${tabId}`}
            tabIndex={selected ? 0 : -1}
            className={
              selected ? `${styles.permitTab} ${styles.permitTabActive}` : styles.permitTab
            }
            onClick={() => onChange(tabId)}
          >
            {TAB_LABELS[tabId]}
          </button>
        );
      })}
      <div className={styles.permitTabBaseline} aria-hidden="true" />
    </div>
  );
}
