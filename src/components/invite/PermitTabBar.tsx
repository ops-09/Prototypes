import styles from './InviteUserWizard.module.scss';

export type PermitTabId = 'create' | 'existing';

type PermitTabBarProps = {
  activeTab: PermitTabId;
  onChange: (tab: PermitTabId) => void;
};

const TABS: Array<{ id: PermitTabId; label: string }> = [
  { id: 'create', label: 'New Permit Applications' },
  { id: 'existing', label: 'Existing Applications' },
];

export function PermitTabBar({ activeTab, onChange }: PermitTabBarProps) {
  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const currentIndex = TABS.findIndex((tab) => tab.id === activeTab);
    if (currentIndex < 0) {
      return;
    }

    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      const delta = event.key === 'ArrowRight' ? 1 : -1;
      const nextIndex = (currentIndex + delta + TABS.length) % TABS.length;
      onChange(TABS[nextIndex].id);
    }
  }

  return (
    <div
      className={styles.permitTabBar}
      role="tablist"
      aria-label="Permit application scopes"
      onKeyDown={handleKeyDown}
    >
      {TABS.map((tab) => {
        const selected = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`permit-tab-${tab.id}`}
            aria-selected={selected}
            aria-controls={`permit-tabpanel-${tab.id}`}
            tabIndex={selected ? 0 : -1}
            className={
              selected ? `${styles.permitTab} ${styles.permitTabActive}` : styles.permitTab
            }
            onClick={() => onChange(tab.id)}
          >
            {tab.label}
          </button>
        );
      })}
      <div className={styles.permitTabBaseline} aria-hidden="true" />
    </div>
  );
}
