import {
  OntarioBadge,
  OntarioIconDelete,
  OntarioIconEdit,
} from '@ongov/ontario-design-system-component-library-react';
import { useEffect, useState } from 'react';
import {
  formatRoleLabel,
  formatStatusLabel,
  formatUserName,
  getUserInitials,
} from '../../rbac/rbacService';
import type { BusinessUser } from '../../rbac/types';
import { TABLE_PAGE_SIZE, TablePaginationBar } from '../shared/TablePaginationBar';
import styles from './UsersTable.module.scss';

type UsersTableProps = {
  users: BusinessUser[];
  onDeleteUser: (userId: string) => void;
};

function getStatusBadgeColour(status: BusinessUser['status']) {
  return status === 'active' ? ('green' as const) : ('yellow' as const);
}

export function UsersTable({ users, onDeleteUser }: UsersTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = TABLE_PAGE_SIZE;
  const totalUsers = users.length;
  const totalPages = Math.max(1, Math.ceil(totalUsers / pageSize));

  useEffect(() => {
    setCurrentPage(1);
  }, [users]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const pageStart = (currentPage - 1) * pageSize;
  const visibleUsers = users.slice(pageStart, pageStart + pageSize);

  return (
    <>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <caption className="ontario-show-for-sr">Business profile users</caption>
          <thead>
            <tr>
              <th scope="col" className={`ontario-h6 ${styles.columnHeader}`}>
                User details
              </th>
              <th scope="col" className={`ontario-h6 ${styles.columnHeader}`}>
                Status
              </th>
              <th scope="col" className={`ontario-h6 ${styles.columnHeader}`}>
                Role
              </th>
              <th scope="col" className={`ontario-h6 ${styles.columnHeader}`}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {visibleUsers.map((user) => {
              const hasName = Boolean(`${user.firstName} ${user.lastName}`.trim());

              return (
                <tr key={user.id}>
                  <td>
                    <div className={styles.userCell}>
                      <span className={styles.avatar} aria-hidden="true">
                        {getUserInitials(user)}
                      </span>
                      <span>
                        {hasName ? (
                          <>
                            <span className={styles.userName}>{formatUserName(user)}</span>
                            <span className={styles.userEmail}>{user.email}</span>
                          </>
                        ) : (
                          <>
                            <span className={styles.userName}>{user.email}</span>
                            <span className={styles.userEmail}>Invitation pending</span>
                          </>
                        )}
                      </span>
                    </div>
                  </td>
                  <td>
                    <OntarioBadge
                      colour={getStatusBadgeColour(user.status)}
                      label={formatStatusLabel(user.status)}
                    />
                  </td>
                  <td>{formatRoleLabel(user.roleId)}</td>
                  <td>
                    <div className={styles.actions}>
                      {/* OntarioButton renders label text only; icon-only actions use native buttons. */}
                      <button
                        type="button"
                        className={styles.iconAction}
                        aria-label={`Edit ${user.email}`}
                      >
                        <OntarioIconEdit colour="blue" iconWidth={24} isDecorative />
                      </button>
                      <button
                        type="button"
                        className={styles.iconAction}
                        aria-label={`Remove ${user.email}`}
                        onClick={() => onDeleteUser(user.id)}
                      >
                        <OntarioIconDelete colour="blue" iconWidth={24} isDecorative />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <TablePaginationBar
        totalItems={totalUsers}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
      />
    </>
  );
}
