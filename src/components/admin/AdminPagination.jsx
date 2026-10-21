import React, { useMemo } from 'react';

/**
 * AdminPagination
 * Clean pagination control for Admin panel matching public Services section style.
 * Supports:
 * - "Showing X–Y of Z items"
 * - Per page selector (5, 10, 20, 50, All)
 * - Previous button
 * - Smart page numbers (with ellipsis for large counts)
 * - Next Page button
 */
export default function AdminPagination({
  totalItems = 0,
  currentPage = 1,
  itemsPerPage = 10,
  onPageChange,
  onItemsPerPageChange,
  itemLabel = 'items',
  perPageOptions = [5, 10, 20, 50, 'all']
}) {
  const totalPages = useMemo(() => {
    if (itemsPerPage === 'all' || !totalItems) return 1;
    return Math.max(1, Math.ceil(totalItems / Number(itemsPerPage)));
  }, [totalItems, itemsPerPage]);

  const numericPerPage = itemsPerPage === 'all' ? totalItems : Number(itemsPerPage);
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * numericPerPage + 1;
  const endItem = itemsPerPage === 'all' ? totalItems : Math.min(currentPage * numericPerPage, totalItems);

  // Compute page numbers with ellipsis for cleaner display
  const pageNumbers = useMemo(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages = [];
    pages.push(1);

    if (currentPage > 3) {
      pages.push('...');
    }

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push('...');
    }

    pages.push(totalPages);
    return pages;
  }, [totalPages, currentPage]);

  if (totalItems === 0) return null;

  return (
    <div className="mt-6 bg-[#071343]/80 border border-white/10 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4 w-full">
      {/* Result count & Per Page Selector */}
      <div className="flex items-center gap-3 text-xs text-slate-300 font-semibold w-full md:w-auto justify-between md:justify-start">
        <span>
          Showing <strong className="text-white font-bold">{startItem}–{endItem}</strong> of{' '}
          <strong className="text-white font-bold">{totalItems}</strong> {itemLabel}
        </span>

        <div className="flex items-center gap-1.5 ml-2">
          <span className="text-slate-400 hidden sm:inline">Per page:</span>
          <select
            value={itemsPerPage}
            onChange={e => {
              const val = e.target.value === 'all' ? 'all' : Number(e.target.value);
              onItemsPerPageChange?.(val);
            }}
            className="bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-xs rounded-lg px-2.5 py-1 outline-none cursor-pointer transition"
          >
            {perPageOptions.map(opt => (
              <option key={opt} value={opt} className="bg-[#0c1747] text-white">
                {opt === 'all' ? 'All' : opt}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Navigation Buttons: Previous, Page Numbers, Next Page */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1.5 sm:gap-2 flex-nowrap w-full md:w-auto justify-center md:justify-end">
          {/* Previous Button */}
          <button
            type="button"
            onClick={() => onPageChange?.(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-3 sm:px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition shrink-0 ${
              currentPage === 1
                ? 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/5'
                : 'bg-white/10 hover:bg-white/20 text-white border border-white/15 shadow-xs'
            }`}
            aria-label="Previous Page"
          >
            <i className="fa-solid fa-chevron-left text-[10px]"></i>
            <span className="hidden sm:inline">Previous</span>
          </button>

          {/* Page Numbers */}
          <div className="flex items-center gap-1 shrink-0">
            {pageNumbers.map((page, idx) => {
              if (page === '...') {
                return (
                  <span key={`ellipsis-${idx}`} className="w-6 sm:w-8 flex items-center justify-center text-slate-500 font-bold text-xs">
                    …
                  </span>
                );
              }

              const isCurrent = currentPage === page;
              return (
                <button
                  key={page}
                  type="button"
                  onClick={() => onPageChange?.(page)}
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl text-xs font-extrabold transition flex items-center justify-center shrink-0 ${
                    isCurrent
                      ? 'grad-btn text-white shadow-md ring-2 ring-blue-400/40'
                      : 'bg-white/5 hover:bg-white/15 text-slate-300 border border-white/10'
                  }`}
                >
                  {page}
                </button>
              );
            })}
          </div>

          {/* Next Page Button */}
          <button
            type="button"
            onClick={() => onPageChange?.(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition shrink-0 ${
              currentPage === totalPages
                ? 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/5'
                : 'bg-white/10 hover:bg-white/20 text-white border border-white/15 shadow-xs'
            }`}
            aria-label="Next Page"
          >
            <span className="hidden sm:inline">Next</span>
            <i className="fa-solid fa-chevron-right text-[10px]"></i>
          </button>
        </div>
      )}
    </div>
  );
}
