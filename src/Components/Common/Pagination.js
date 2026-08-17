import React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

const DEFAULT_PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

/**
 * App-wide standard pagination footer. Used for every table in the app --
 * same button shapes/colors/spacing everywhere, so tables don't each grow
 * their own slightly-different pagination implementation.
 *
 * Required: currentPage, onPageChange, and either totalPages (known total --
 * renders numbered pages with ellipsis) or hasPrev/hasNext (unknown total,
 * e.g. a cursor-style API that only reports whether a full page came back --
 * renders a simple prev / current-page-badge / next control instead, same
 * button styling either way).
 * Optional: pass totalItems + pageSize together to show the "Showing X-Y of
 * Z <itemLabel>" text; additionally pass onPageSizeChange to show the "Rows
 * per page" selector.
 */
const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize,
  onPageSizeChange,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  itemLabel = "items",
  loading = false,
  hasPrev,
  hasNext,
}) => {
  const knownTotal = typeof totalPages === "number" && totalPages >= 1;
  if (!knownTotal && hasPrev === undefined && hasNext === undefined) return null;

  const showCount = typeof totalItems === "number" && typeof pageSize === "number";
  const startItem = showCount ? Math.min((currentPage - 1) * pageSize + 1, totalItems) : null;
  const endItem = showCount ? Math.min(currentPage * pageSize, totalItems) : null;

  const canPrev = hasPrev !== undefined ? hasPrev : currentPage > 1;
  const canNext = hasNext !== undefined ? hasNext : knownTotal && currentPage < totalPages;

  const getPageNumbers = () => {
    if (!knownTotal) return [];
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = [];
    const delta = 2;
    const left = Math.max(2, currentPage - delta);
    const right = Math.min(totalPages - 1, currentPage + delta);
    pages.push(1);
    if (left > 2) pages.push("...");
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < totalPages - 1) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/60">
      <div className="flex items-center gap-4">
        {showCount && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Showing{" "}
            <span className="font-semibold text-gray-700 dark:text-gray-300">
              {startItem}–{endItem}
            </span>{" "}
            of <span className="font-semibold text-gray-700 dark:text-gray-300">{totalItems}</span>{" "}
            {itemLabel}
          </span>
        )}
        {onPageSizeChange && (
          <div className="flex items-center gap-1.5">
            <label className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
              Rows per page:
            </label>
            <select
              value={pageSize}
              onChange={onPageSizeChange}
              className="text-xs border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-[#1a365d] focus:border-[#1a365d] cursor-pointer"
            >
              {pageSizeOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!canPrev || loading}
          className="p-1.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </button>

        {knownTotal ? (
          getPageNumbers().map((p, idx) =>
            p === "..." ? (
              <span key={`ellipsis-${idx}`} className="px-1.5 text-gray-400 text-xs select-none">
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                disabled={loading}
                className={`min-w-[32px] h-8 px-2 rounded-md text-xs font-medium border transition-colors disabled:cursor-not-allowed ${
                  currentPage === p
                    ? "bg-[#1a365d] text-white border-[#1a365d] shadow-sm"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                {p}
              </button>
            ),
          )
        ) : (
          <span className="min-w-[32px] h-8 px-3 flex items-center justify-center rounded-md text-xs font-medium bg-[#1a365d] text-white border border-[#1a365d] shadow-sm">
            {currentPage}
          </span>
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!canNext || loading}
          className="p-1.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
