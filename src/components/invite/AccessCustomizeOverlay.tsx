import { OntarioButton } from '@ongov/ontario-design-system-component-library-react';
import { useState } from 'react';
import type { RoleId, ServiceAccess } from '../../rbac/types';
import { ServiceAccessStep } from './steps/ServiceAccessStep';
import styles from './AccessCustomizeOverlay.module.scss';

type AccessCustomizeOverlayProps = {
  email: string;
  roleId: RoleId;
  serviceAccess: ServiceAccess;
  onClose: () => void;
  onSave: (serviceAccess: ServiceAccess) => void;
};

export function AccessCustomizeOverlay({
  email,
  serviceAccess,
  onClose,
  onSave,
}: AccessCustomizeOverlayProps) {
  const [draftAccess, setDraftAccess] = useState(() => structuredClone(serviceAccess));

  return (
    <div className={styles.overlay} role="presentation" onMouseDown={onClose}>
      <div
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-label={`Customize access for ${email}`}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className={styles.panelHeader}>
          <h2 className={styles.panelTitle}>Customize access for {email}</h2>
          <OntarioButton type="tertiary" htmlType="button" onClick={onClose}>
            Close
          </OntarioButton>
        </div>

        <ServiceAccessStep serviceAccess={draftAccess} onChange={setDraftAccess} />

        <div className={styles.panelActions}>
          <OntarioButton type="primary" htmlType="button" onClick={() => onSave(draftAccess)}>
            Done
          </OntarioButton>
        </div>
      </div>
    </div>
  );
}
