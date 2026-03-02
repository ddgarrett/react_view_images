import type { ShowFilter } from './types';

interface BottomBarProps {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  showFilter: ShowFilter;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (n: number) => void;
  onShowFilterChange: (filter: ShowFilter) => void;
}

const SHOW_FILTER_OPTIONS: { value: ShowFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'tbd', label: 'TBD' },
  { value: 'possible_dup', label: 'Possible Duplicate' },
  { value: 'possible_good_plus', label: 'Possible Good or Best' },
  { value: 'possible_best', label: 'Possible Best' },
];

const PAGE_SIZE_OPTIONS = [
  { value: 1, label: '1' },
  { value: 4, label: '4 (2x2)' },
  { value: 9, label: '9 (3x3)' },
  { value: 16, label: '16 (4x4)' },
  { value: 25, label: '25 (5x5)' },
];

export function BottomBar({
  currentPage,
  totalPages,
  itemsPerPage,
  showFilter,
  onPageChange,
  onItemsPerPageChange,
  onShowFilterChange,
}: BottomBarProps) {
  return (
    <div className="bottom-bar">
      <div className="show-filter-selector">
        <label htmlFor="show-filter">Show:</label>
        <select
          id="show-filter"
          value={showFilter}
          onChange={(e) =>
            onShowFilterChange(e.target.value as ShowFilter)
          }
        >
          {SHOW_FILTER_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div id="page-counter">
        Page {currentPage} of {totalPages} pages
      </div>
      <div className="page-size-selector">
        <label htmlFor="page-size">Images per page:</label>
        <select
          id="page-size"
          value={itemsPerPage}
          onChange={(e) =>
            onItemsPerPageChange(Number(e.target.value))
          }
        >
          {PAGE_SIZE_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div className="pagination-buttons">
        <button
          type="button"
          id="btn-first"
          onClick={() => onPageChange(1)}
          disabled={currentPage <= 1}
        >
          First
        </button>
        <button
          type="button"
          id="btn-prev"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
        >
          Previous
        </button>
        <button
          type="button"
          id="btn-next"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
        >
          Next
        </button>
        <button
          type="button"
          id="btn-last"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage >= totalPages}
        >
          Last
        </button>
      </div>
    </div>
  );
}
