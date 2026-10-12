import styles from './TablePaginationBar.module.scss';

const MAX_VISIBLE_PAGES = 10;

export const TABLE_PAGE_SIZE = 5;

type TablePaginationBarProps = {
  totalItems: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
};

function getVisiblePages(currentPage: number, totalPages: number) {
  if (totalPages <= MAX_VISIBLE_PAGES) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  let start = Math.max(1, currentPage - Math.floor(MAX_VISIBLE_PAGES / 2));
  let end = start + MAX_VISIBLE_PAGES - 1;

  if (end > totalPages) {
    end = totalPages;
    start = end - MAX_VISIBLE_PAGES + 1;
  }

  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

export function TablePaginationBar({
  totalItems,
  currentPage,
  pageSize,
  onPageChange,
}: TablePaginationBarProps) {
  if (totalItems === 0) {
    return null;
  }

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const pageStart = (currentPage - 1) * pageSize + 1;
  const pageEnd = Math.min(currentPage * pageSize, totalItems);
  const visiblePages = getVisiblePages(currentPage, totalPages);
  const showPageNavigation = totalPages > 1;

  return (
    // ODS has no pagination component — composed with link-styled controls.
    <div className={styles.tablePagination}>
      <div className={styles.tablePaginationMain}>
        <p className={styles.tablePaginationSummary}>
          Displaying {pageStart} - {pageEnd} of {totalItems} results
        </p>

        {showPageNavigation && (
          <nav className={styles.tablePaginationNav} aria-label="Pagination">
            {visiblePages.map((page, index) => (
              <span key={page} className={styles.tablePaginationPageItem}>
                {index > 0 && (
                  <span className={styles.tablePaginationSeparator} aria-hidden="true">
                    -
                  </span>
                )}
                {page === currentPage ? (
                  <span className={styles.tablePaginationPageCurrent} aria-current="page">
                    {page}
                  </span>
                ) : (
                  <button
                    type="button"
                    className={styles.tablePaginationPageLink}
                    onClick={() => onPageChange(page)}
                  >
                    {page}
                  </button>
                )}
              </span>
            ))}

            {currentPage < totalPages && (
              <>
                <span className={styles.tablePaginationSeparator} aria-hidden="true">
                  -
                </span>
                <button
                  type="button"
                  className={styles.tablePaginationPageLink}
                  onClick={() => onPageChange(currentPage + 1)}
                >
                  Next &gt;
                </button>
              </>
            )}
          </nav>
        )}
      </div>
    </div>
  );
}
