import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  OntarioButton,
  OntarioIconDelete,
  OntarioIconDocument,
  OntarioPageAlert,
  OntarioRadioButtons,
} from '@ongov/ontario-design-system-component-library-react';
import {
  getMinistryLabel,
  getPermitTypeById,
  type CdpsMinistryId,
} from '../../../rbac/cdpsPermitCatalog';
import {
  isPermitCreateMode,
  listSelectedCreatePermitTypeIds,
  setIndividualCreatePermitTypeIds,
} from '../../../rbac/permitApplicationAccess';
import type { PermitApplicationAccess, PermitCreateMode } from '../../../rbac/types';
import {
  INVITE_PERMIT_CATALOG_PATH,
  type InvitePermitCatalogLocationState,
} from '../inviteWizardPaths';
import styles from '../InviteUserWizard.module.scss';
import userMgmtStyles from '../../user-management/UserManagement.module.scss';
import tableStyles from '../../user-management/UsersTable.module.scss';

type PermitCreateScopeV12Props = {
  access: PermitApplicationAccess;
  onChange: (access: PermitApplicationAccess) => void;
  /** Display step to return to from the catalog (Permissions). */
  returnDisplayStep?: number;
  /** V14: open catalog with application filter (access-needs cards). */
  catalogShowAccessNeedsFilter?: boolean;
};

function getRadioValue(event: globalThis.Event) {
  const target = event.target as HTMLInputElement | null;
  return target?.value ?? '';
}

type SelectedPermitRow = {
  permitTypeId: string;
  permitShortName: string;
  ministryId: CdpsMinistryId;
  ministryLabel: string;
};

/**
 * V12 create scope — selected permits as a table (user-management style).
 * Browse / add more opens the permit catalog page.
 */
export function PermitCreateScopeV12({
  access,
  onChange,
  returnDisplayStep = 3,
  catalogShowAccessNeedsFilter = false,
}: PermitCreateScopeV12Props) {
  const navigate = useNavigate();
  const createMode: PermitCreateMode | '' = access.create.mode ?? '';

  const selectedRows = useMemo((): SelectedPermitRow[] => {
    return listSelectedCreatePermitTypeIds(access)
      .map((permitTypeId) => {
        const permit = getPermitTypeById(permitTypeId);
        if (!permit) {
          return null;
        }
        return {
          permitTypeId,
          permitShortName: permit.permitShortName,
          ministryId: permit.ministryId,
          ministryLabel: getMinistryLabel(permit.ministryId),
        };
      })
      .filter((row): row is SelectedPermitRow => row !== null)
      .sort((a, b) => {
        const ministryCmp = a.ministryId.localeCompare(b.ministryId);
        if (ministryCmp !== 0) {
          return ministryCmp;
        }
        return a.permitShortName.localeCompare(b.permitShortName);
      });
  }, [access]);

  function patchCreate(nextCreate: PermitApplicationAccess['create']) {
    onChange({
      ...access,
      create: {
        ...nextCreate,
        enabled: true,
      },
    });
  }

  function setCreateMode(mode: PermitCreateMode) {
    patchCreate({
      ...access.create,
      mode,
      byMinistry: access.create.byMinistry,
    });
  }

  function openCatalog() {
    const state: InvitePermitCatalogLocationState = {
      returnDisplayStep,
      showAccessNeedsFilter: catalogShowAccessNeedsFilter,
    };
    navigate(INVITE_PERMIT_CATALOG_PATH, { state });
  }

  function removePermit(permitTypeId: string) {
    const nextIds = listSelectedCreatePermitTypeIds(access).filter((id) => id !== permitTypeId);
    onChange(setIndividualCreatePermitTypeIds(access, nextIds));
  }

  return (
    <div className={styles.permitCreateScopeV6}>
      <OntarioRadioButtons
        caption="Which permits can this person apply for?"
        name="permit-create-mode-v12"
        hintExpander={{
          hint: 'What is the difference?',
          content:
            'All eligible permits from all ministries grants create access for every eligible permit type across every ministry—no further selection is needed. Select permits only opens the permit catalog so you can choose specific types, then review them in a table.',
        }}
        value={createMode}
        options={[
          {
            value: 'all_ministries',
            elementId: 'permit-create-all-ministries-v12',
            label: 'All eligible permits from all ministries',
          },
          {
            value: 'individual',
            elementId: 'permit-create-individual-v12',
            label: 'Select permits only',
          },
        ]}
        customOnChange={(event) => {
          const value = getRadioValue(event);
          if (isPermitCreateMode(value)) {
            setCreateMode(value);
          }
        }}
      />

      {createMode === 'all_ministries' ? (
        <OntarioPageAlert
          className={styles.flushPageAlert}
          type="informational"
          heading="All eligible permits"
          content="Create access for every eligible permit type in every ministry. No per-type selection is needed."
        />
      ) : null}

      {createMode === 'individual' ? (
        <div className={styles.permitIndividualLayoutV6}>
          {selectedRows.length === 0 ? (
            <section
              className={styles.permitEmptyTableState}
              aria-label="Selected permits"
            >
              <span className={styles.permitEmptyTableIcon} aria-hidden="true">
                <OntarioIconDocument colour="grey" iconWidth={32} isDecorative />
              </span>
              <p className={styles.permitEmptyTableText}>
                Browse and add available permits.
              </p>
              <OntarioButton type="primary" htmlType="button" onClick={openCatalog}>
                Add
              </OntarioButton>
            </section>
          ) : (
            <section
              className={userMgmtStyles.listCard}
              aria-label="Selected permits"
            >
              <div className={userMgmtStyles.listCardHeader}>
                <p className={`ontario-h5 ${userMgmtStyles.listCardHeading}`}>
                  {selectedRows.length} permit{selectedRows.length === 1 ? '' : 's'} selected
                </p>
                <OntarioButton type="tertiary" htmlType="button" onClick={openCatalog}>
                  Add more permits
                </OntarioButton>
              </div>

              <div className={tableStyles.tableWrap}>
                <table className={tableStyles.table}>
                  <caption className="ontario-show-for-sr">Selected create permits</caption>
                  <thead>
                    <tr>
                      <th scope="col" className={`ontario-h6 ${tableStyles.columnHeader}`}>
                        Permit type
                      </th>
                      <th scope="col" className={`ontario-h6 ${tableStyles.columnHeader}`}>
                        Ministry
                      </th>
                      <th scope="col" className={`ontario-h6 ${tableStyles.columnHeader}`}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedRows.map((row) => (
                      <tr key={row.permitTypeId}>
                        <td>
                          <span className={tableStyles.cellText}>{row.permitShortName}</span>
                        </td>
                        <td>
                          <span className={tableStyles.cellText}>
                            {row.ministryId} — {row.ministryLabel}
                          </span>
                        </td>
                        <td>
                          <div className={tableStyles.actions}>
                            <button
                              type="button"
                              className={tableStyles.iconAction}
                              aria-label={`Remove ${row.permitShortName}`}
                              onClick={() => removePermit(row.permitTypeId)}
                            >
                              <OntarioIconDelete colour="blue" iconWidth={24} isDecorative />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
      ) : null}

      {!createMode ? (
        <p className={styles.permitSubsectionHint}>
          Choose which permits this person can apply for to configure create access.
        </p>
      ) : null}
    </div>
  );
}
