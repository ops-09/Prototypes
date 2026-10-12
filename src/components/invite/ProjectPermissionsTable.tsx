import { useEffect, useMemo, useState } from 'react';
import type { ProjectDefinition, ProjectPermission } from '../../rbac/types';
import userTableStyles from '../user-management/UsersTable.module.scss';
import { TABLE_PAGE_SIZE, TablePaginationBar } from '../shared/TablePaginationBar';
import inviteStyles from './InviteUserWizard.module.scss';
import { ProjectSearchAutosuggest } from './ProjectSearchAutosuggest';
import { TablePermissionCheckbox } from './TablePermissionCheckbox';

type ProjectPermissionsTableProps = {
  projects: ProjectDefinition[];
  projectPermissions: Record<string, ProjectPermission>;
  onPermissionChange: (projectId: string, permission: ProjectPermission) => void;
  namePrefix: string;
};

function hasViewPermission(permission: ProjectPermission) {
  return permission === 'view' || permission === 'view_edit';
}

function hasEditPermission(permission: ProjectPermission) {
  return permission === 'view_edit';
}

export function ProjectPermissionsTable({
  projects,
  projectPermissions,
  onPermissionChange,
  namePrefix,
}: ProjectPermissionsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const pageSize = TABLE_PAGE_SIZE;

  const filteredProjects = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return projects;
    }

    return projects.filter((project) => project.label.toLowerCase().includes(query));
  }, [projects, searchQuery]);

  const totalProjects = filteredProjects.length;
  const totalPages = Math.max(1, Math.ceil(totalProjects / pageSize));

  useEffect(() => {
    setCurrentPage(1);
  }, [projects, searchQuery]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const pageStart = (currentPage - 1) * pageSize;
  const pageEnd = Math.min(pageStart + pageSize, totalProjects);
  const visibleProjects = filteredProjects.slice(pageStart, pageEnd);

  function updateProjectPermission(projectId: string, permission: ProjectPermission) {
    onPermissionChange(projectId, permission);
  }

  function toggleViewPermission(projectId: string, checked: boolean) {
    const current = projectPermissions[projectId] ?? 'none';

    if (checked) {
      updateProjectPermission(
        projectId,
        current === 'view_edit' ? 'view_edit' : 'view',
      );
      return;
    }

    updateProjectPermission(projectId, 'none');
  }

  function toggleEditPermission(projectId: string, checked: boolean) {
    const current = projectPermissions[projectId] ?? 'none';

    if (checked) {
      updateProjectPermission(projectId, 'view_edit');
      return;
    }

    updateProjectPermission(projectId, current === 'view_edit' ? 'view' : current);
  }

  return (
    <section className={inviteStyles.projectPermissionsTable} aria-label="Project permissions">
      <div className={inviteStyles.projectPermissionsCardHeader}>
        <p className={`ontario-h5 ${inviteStyles.projectPermissionsCount}`}>
          {totalProjects} projects
        </p>
        <div className={inviteStyles.projectPermissionsSearchWrap}>
          <ProjectSearchAutosuggest
            projects={projects}
            value={searchQuery}
            onChange={setSearchQuery}
            namePrefix={namePrefix}
          />
        </div>
      </div>

      <div className={userTableStyles.tableWrap}>
        <table className={userTableStyles.table}>
          <caption className="ontario-show-for-sr">Project permissions</caption>
          <thead>
            <tr>
              <th scope="col" className={`ontario-h6 ${userTableStyles.columnHeader}`}>
                Project
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
            {visibleProjects.length === 0 ? (
              <tr>
                <td colSpan={3}>
                  <span className={userTableStyles.cellText}>No projects match your search.</span>
                </td>
              </tr>
            ) : (
              visibleProjects.map((project) => {
              const permission = projectPermissions[project.id] ?? 'none';

              return (
                <tr key={project.id}>
                  <td>
                    <span className={userTableStyles.cellText}>{project.label}</span>
                  </td>
                  <td className={userTableStyles.tableCheckboxCell}>
                    <TablePermissionCheckbox
                      projectLabel={project.label}
                      permissionLabel="View"
                      name={`${namePrefix}-project-view-${project.id}`}
                      elementId={`${namePrefix}-${project.id}-view`}
                      checked={hasViewPermission(permission)}
                      onChange={(checked) => toggleViewPermission(project.id, checked)}
                    />
                  </td>
                  <td className={userTableStyles.tableCheckboxCell}>
                    <TablePermissionCheckbox
                      projectLabel={project.label}
                      permissionLabel="Edit"
                      name={`${namePrefix}-project-edit-${project.id}`}
                      elementId={`${namePrefix}-${project.id}-edit`}
                      checked={hasEditPermission(permission)}
                      onChange={(checked) => toggleEditPermission(project.id, checked)}
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
        totalItems={totalProjects}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
      />
    </section>
  );
}
